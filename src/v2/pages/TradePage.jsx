import { useState } from "react";
import { useStore, go } from "../store.jsx";
import { ASSETS, ASSET_BY_SYMBOL } from "../lib/assets.js";
import { TIMEFRAMES } from "../lib/price.js";
import { fmtPrice, fmtPct, fmtQty, fmtUSD, upDown } from "../lib/format.js";
import Chart from "../components/Chart.jsx";
import { SpotPanel, FuturesPanel } from "../components/OrderPanels.jsx";
import { PairHeader, FeedList, NewsList, PositionsList, SymIcon } from "../components/ui.jsx";

function MiniMarkets({ page, current }) {
  const { tickers } = useStore();
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const list = ASSETS.filter((a) => !s || a.symbol.toLowerCase().includes(s) || a.name.toLowerCase().includes(s));
  return (
    <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: 760 }}>
      <div style={{ padding: 10 }}>
        <div className="field" style={{ height: 38 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" style={{ textAlign: "left", fontSize: 14 }} />
        </div>
      </div>
      <div style={{ overflowY: "auto" }}>
        {list.map((a) => {
          const t = tickers[a.symbol];
          return (
            <button key={a.symbol} onClick={() => go(page, a.symbol)}
              style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, padding: "7px 12px", fontSize: 12.5,
                background: a.symbol === current ? "var(--panel-2)" : "transparent" }}>
              <span style={{ textAlign: "left", fontWeight: 800 }}>{a.symbol}<span className="faint">/USD</span></span>
              <span className="num">{fmtPrice(t.price)}</span>
              <span className={"num " + upDown(t.change)} style={{ width: 58, textAlign: "right" }}>{fmtPct(t.change)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SpotHoldings({ symbol }) {
  const { account, priceOf } = useStore();
  const h = account.spot[symbol];
  if (!h) return <div className="empty">You don't hold {symbol} yet.</div>;
  const p = priceOf(symbol);
  const value = h.qty * p, pnl = value - h.cost;
  return (
    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }} className="num">
      <SymIcon symbol={symbol} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800 }}>{fmtQty(h.qty)} {symbol}</div>
        <div className="muted" style={{ fontSize: 12 }}>Avg cost {fmtPrice(h.cost / h.qty)}</div>
      </div>
      <div className="right">
        <div style={{ fontWeight: 800 }}>{fmtUSD(value)}</div>
        <div className={upDown(pnl)} style={{ fontSize: 12, fontWeight: 700 }}>{fmtUSD(pnl, true)} ({fmtPct((pnl / h.cost) * 100)})</div>
      </div>
    </div>
  );
}

export default function TradePage({ mode }) {
  const { route, lastSymbol, now, shocks, theme, account } = useStore();
  const symbol = route.symbol || lastSymbol;
  const asset = ASSET_BY_SYMBOL[symbol];
  const [tf, setTf] = useState(() => localStorage.getItem("oddex_tf") || "15m");
  const [type, setType] = useState("candle");
  const tfObj = TIMEFRAMES.find((x) => x.id === tf) || TIMEFRAMES[2];
  const isFut = mode === "futures";
  const posCount = account.positions.length;
  const [tab, setTab] = useState(isFut ? "positions" : "trades");
  const setTimeframe = (id) => { setTf(id); try { localStorage.setItem("oddex_tf", id); } catch {} };

  const tabs = isFut
    ? [["positions", `Positions (${posCount})`], ["trades", "Trades"], ["news", "News"]]
    : [["trades", "Trades"], ["holdings", "Holdings"], ["news", "News"]];
  const activeTab = tabs.some(([k]) => k === tab) ? tab : tabs[0][0];

  return (
    <div className="trade-grid">
      <aside className="trade-markets"><MiniMarkets page={mode} current={symbol} /></aside>

      <section className="trade-main">
        <div className="card" style={{ overflow: "hidden" }}>
          <PairHeader symbol={symbol} page={mode} />
          <div className="tf-row">
            {TIMEFRAMES.map((x) => (
              <button key={x.id} className={tf === x.id ? "on" : ""} onClick={() => setTimeframe(x.id)}>{x.id}</button>
            ))}
            <span style={{ flex: 1 }} />
            <button onClick={() => setType(type === "candle" ? "line" : "candle")} style={{ border: "1px solid var(--line)" }}>
              {type === "candle" ? "Line" : "Candles"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 14, padding: "6px 12px 0", fontSize: 11.5, fontWeight: 700 }}>
            <span style={{ color: "var(--warn)" }}>MA(7)</span><span style={{ color: "var(--accent)" }}>MA(25)</span>
            <span className="faint chart-note">Same price for every trader. Moves on real news.</span>
          </div>
          <Chart asset={asset} tfSec={tfObj.sec} shocks={shocks[symbol]} now={now} theme={theme} type={type} height="clamp(300px, 46vh, 520px)" />
        </div>

        <div className="card trade-order-mobile" style={{ padding: 14 }}>
          {isFut ? <FuturesPanel symbol={symbol} /> : <SpotPanel symbol={symbol} />}
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div className="tabs" style={{ padding: "0 14px" }}>
            {tabs.map(([k, label]) => <button key={k} className={activeTab === k ? "on" : ""} onClick={() => setTab(k)}>{label}</button>)}
          </div>
          {activeTab === "positions" && <PositionsList />}
          {activeTab === "trades" && <FeedList symbol={symbol} />}
          {activeTab === "holdings" && <SpotHoldings symbol={symbol} />}
          {activeTab === "news" && <NewsList symbol={symbol} />}
        </div>
      </section>

      <aside className="trade-order">
        <div className="card" style={{ padding: 14 }}>
          {isFut ? <FuturesPanel symbol={symbol} /> : <SpotPanel symbol={symbol} />}
        </div>
      </aside>
    </div>
  );
}
