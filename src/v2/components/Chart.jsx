import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, CrosshairMode, ColorType } from "lightweight-charts";
import { candles, candleAt } from "../lib/price.js";
import { priceDecimals } from "../lib/format.js";

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

export default function Chart({ asset, tfSec, shocks, now, theme, type = "candle", height = 380 }) {
  const box = useRef(null);
  const api = useRef(null);
  const data = useRef({ bars: [], closes: [] });

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
    api.current = { chart, candle, area, vol, m7, m25 };
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
  }, [asset, tfSec, shocks]);

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

  return <div ref={box} style={{ width: "100%", height }} />;
}
