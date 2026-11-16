import { useEffect, useRef, useState } from "react";
import { createChart, createSeriesMarkers, CandlestickSeries, HistogramSeries, LineSeries, CrosshairMode, ColorType, LineStyle } from "lightweight-charts";
import { candles, candleAt } from "../lib/price.js";
import { priceDecimals, timeAgo } from "../lib/format.js";
import { newsMarkers } from "../lib/insights.js";

const COUNT = 300;
const TZ = -new Date().getTimezoneOffset() * 60; // show local time on the axis

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function colors() {
  return {
    bg: cssVar("--panel"), text: cssVar("--muted"), line: cssVar("--line"),
    up: cssVar("--up"), down: cssVar("--down"), ma7: cssVar("--warn"), ma25: cssVar("--accent"),
  };
}

function ma(closes, n) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < closes.length; i++) {
    sum += closes[i].value;
    if (i >= n) sum -= closes[i - n].value;
    if (i >= n - 1) out.push({ time: closes[i].time, value: sum / n });
  }
  return out;
}

const toBar = (c) => ({ time: c.time + TZ, open: c.open, high: c.high, low: c.low, close: c.close });

export default function Chart({ asset, tfSec, shocks, now, theme, type = "candle", height = 380, news = [], orders = [], positions = [] }) {
  const box = useRef(null);
  const api = useRef(null);
  const data = useRef({ bars: [], closes: [] });
  const pins = useRef(new Map()); // chart time -> news items on that candle
  const [hover, setHover] = useState(null);

  // Create once.
  useEffect(() => {
    const c = colors();
    const chart = createChart(box.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: c.bg }, textColor: c.text, fontSize: 11, attributionLogo: true },
      grid: { vertLines: { color: c.line }, horzLines: { color: c.line } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: c.line, scaleMargins: { top: 0.08, bottom: 0.22 } },
      timeScale: { borderColor: c.line, timeVisible: true, secondsVisible: false, rightOffset: 6, barSpacing: 8 },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
    });
    const candle = chart.addSeries(CandlestickSeries, {
      upColor: c.up, downColor: c.down, borderVisible: false, wickUpColor: c.up, wickDownColor: c.down,
    });
    const area = chart.addSeries(LineSeries, { color: c.ma25, lineWidth: 2, visible: false, priceLineVisible: true });
    const vol = chart.addSeries(HistogramSeries, { priceScaleId: "vol", priceFormat: { type: "volume" }, lastValueVisible: false, priceLineVisible: false });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    const m7 = chart.addSeries(LineSeries, { color: c.ma7, lineWidth: 1, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false });
    const m25 = chart.addSeries(LineSeries, { color: c.ma25, lineWidth: 1, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false });
    const markers = [createSeriesMarkers(candle, []), createSeriesMarkers(area, [])];
    // Show the headlines behind a news pin on hover (desktop) or tap (mobile).
    const pick = (param) => {
      const items = param && param.time != null ? pins.current.get(param.time) : null;
      setHover(items ? { time: param.time, items } : null);
    };
    chart.subscribeCrosshairMove(pick);
    chart.subscribeClick(pick);
    api.current = { chart, candle, area, vol, m7, m25, markers };
    return () => { chart.remove(); api.current = null; };
  }, []);

  // Theme colors.
  useEffect(() => {
    const a = api.current; if (!a) return;
    const c = colors();
    a.chart.applyOptions({
      layout: { background: { type: ColorType.Solid, color: c.bg }, textColor: c.text },
      grid: { vertLines: { color: c.line }, horzLines: { color: c.line } },
      rightPriceScale: { borderColor: c.line }, timeScale: { borderColor: c.line },
    });
    a.candle.applyOptions({ upColor: c.up, downColor: c.down, wickUpColor: c.up, wickDownColor: c.down });
    a.area.applyOptions({ color: c.ma25 });
    a.m7.applyOptions({ color: c.ma7 });
    a.m25.applyOptions({ color: c.ma25 });
    const { bars } = data.current;
    a.vol.setData(bars.map((b) => ({ time: b.time + TZ, value: b.volume, color: (b.close >= b.open ? c.up : c.down) + "55" })));
  }, [theme]);

  // Chart type.
  useEffect(() => {
    const a = api.current; if (!a) return;
    a.candle.applyOptions({ visible: type === "candle" });
    a.area.applyOptions({ visible: type === "line" });
  }, [type]);

  // Full reload on asset / timeframe / news change.
  useEffect(() => {
    const a = api.current; if (!a) return;
    const c = colors();
    const t = Date.now() / 1000;
    const bars = candles(asset, tfSec, COUNT, t, shocks);
    const closes = bars.map((b) => ({ time: b.time + TZ, value: b.close }));
    data.current = { bars, closes };
    const d = priceDecimals(bars[bars.length - 1].close);
    const pf = { type: "price", precision: d, minMove: 1 / 10 ** d };
    a.candle.applyOptions({ priceFormat: pf });
    a.area.applyOptions({ priceFormat: pf });
    a.candle.setData(bars.map(toBar));
    a.area.setData(closes);
    a.vol.setData(bars.map((b) => ({ time: b.time + TZ, value: b.volume, color: (b.close >= b.open ? c.up : c.down) + "55" })));
    a.m7.setData(ma(closes, 7));
    a.m25.setData(ma(closes, 25));
    a.chart.timeScale().setVisibleLogicalRange({ from: COUNT - 90, to: COUNT + 4 });
    setHover(null);
  }, [asset, tfSec, shocks]);

  // News pins: one per candle that had headlines for this market.
  useEffect(() => {
    const a = api.current; if (!a) return;
    const { bars } = data.current;
    if (!bars.length) return;
    const c = colors();
    const list = newsMarkers(news, tfSec, bars[0].time, bars[bars.length - 1].time);
    pins.current = new Map(list.map((m) => [m.time + TZ, m.items]));
    const marks = list.map((m) => ({
      time: m.time + TZ,
      position: m.up ? "belowBar" : "aboveBar",
      shape: m.up ? "arrowUp" : "arrowDown",
      color: m.up ? c.up : c.down,
      text: m.items.length > 1 ? "NEWS ×" + m.items.length : "NEWS",
      size: 1,
    }));
    for (const mk of a.markers) mk.setMarkers(marks);
  }, [news, asset, tfSec, shocks, theme]);

  // Live tick: update the forming candle (or start a new one).
  useEffect(() => {
    const a = api.current; if (!a) return;
    const { bars, closes } = data.current;
    if (!bars.length) return;
    const c = colors();
    const start = Math.floor(now / tfSec) * tfSec;
    const bar = candleAt(asset, start, tfSec, shocks, now);
    const last = bars[bars.length - 1];
    if (start > last.time) {
      // Finalize the previous candle, then add the new one.
      const fin = candleAt(asset, last.time, tfSec, shocks);
      bars[bars.length - 1] = fin;
      a.candle.update(toBar(fin));
      closes[closes.length - 1] = { time: fin.time + TZ, value: fin.close };
      bars.push(bar);
      closes.push({ time: bar.time + TZ, value: bar.close });
    } else if (start === last.time) {
      bars[bars.length - 1] = bar;
      closes[closes.length - 1] = { time: bar.time + TZ, value: bar.close };
    } else return;
    a.candle.update(toBar(bar));
    a.area.update(closes[closes.length - 1]);
    a.vol.update({ time: bar.time + TZ, value: bar.volume, color: (bar.close >= bar.open ? c.up : c.down) + "55" });
    for (const [series, n] of [[a.m7, 7], [a.m25, 25]]) {
      if (closes.length >= n) {
        let s = 0; for (let i = closes.length - n; i < closes.length; i++) s += closes[i].value;
        series.update({ time: closes[closes.length - 1].time, value: s / n });
      }
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  // Horizontal lines for your open limit orders, and entry / liquidation of
  // your open positions on this market.
  const lines = useRef([]);
  const lineKey = JSON.stringify([orders.map((o) => [o.id, o.price, o.side]), positions.map((p) => [p.id, p.entry, p.liq, p.tp, p.sl]), type]);
  useEffect(() => {
    const a = api.current; if (!a) return;
    const series = type === "line" ? a.area : a.candle;
    for (const [s, l] of lines.current) { try { s.removePriceLine(l); } catch {} }
    lines.current = [];
    const c = colors();
    const add = (price, color, title, style = LineStyle.Dashed) => {
      if (!(price > 0)) return;
      lines.current.push([series, series.createPriceLine({ price, color, lineWidth: 1, lineStyle: style, axisLabelVisible: true, title })]);
    };
    for (const o of orders) add(o.price, o.side === "buy" || o.side === "long" ? c.up : c.down, "LIMIT " + o.side.toUpperCase());
    for (const p of positions) {
      add(p.entry, c.ma25, `${p.side.toUpperCase()} ${p.lev}x`, LineStyle.Solid);
      add(p.liq, c.ma7, "LIQ");
      if (p.tp) add(p.tp, c.up, "TP", LineStyle.Dotted);
      if (p.sl) add(p.sl, c.down, "SL", LineStyle.Dotted);
    }
  }, [lineKey, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: "relative" }}>
      <div ref={box} style={{ width: "100%", height }} />
      {hover && (
        <div className="news-pop">
          {hover.items.slice(0, 3).map((n, i) => (
            <div key={i} style={{ marginTop: i ? 8 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 11, fontWeight: 800 }}>
                <span className={n.impact >= 0 ? "up" : "down"}>{n.impact >= 0 ? "▲" : "▼"} {Math.abs(n.impact).toFixed(1)}% news impact</span>
                <span className="muted">{n.t ? timeAgo(n.t * 1000) + " ago" : ""}</span>
              </div>
              <div style={{ fontWeight: 700, lineHeight: 1.35, marginTop: 2 }}>{n.headline}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
