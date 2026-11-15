import { useMemo, useState } from "react";
import { useStore, go } from "../store.jsx";
import { ASSETS } from "../lib/assets.js";
import { spark } from "../lib/price.js";
import { fmtPrice, fmtPct, fmtCompact, fmtUSD, upDown } from "../lib/format.js";
import { SymIcon, Spark, NewsList, FeedList, Icon } from "../components/ui.jsx";

const TABS = [["all", "All"], ["hot", "Hot"], ["gainers", "Gainers"], ["losers", "Losers"], ["news", "News"], ["live", "Live trades"]];

export default function MarketsPage() {
  const { tickers, equity, now, shocks, news } = useStore();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const minute = Math.floor(now / 60);

  // Sparklines only need to refresh once a minute.
  const sparks = useMemo(() => {
    const out = {};
    for (const a of ASSETS) out[a.symbol] = spark(a, minute * 60, shocks[a.symbol], 24);
    return out;
  }, [minute, shocks]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = ASSETS.filter((a) => !s || a.symbol.toLowerCase().includes(s) || a.name.toLowerCase().includes(s));
    if (tab === "hot") list = list.filter((a) => a.hot).sort((x, y) => tickers[y.symbol].quoteVolume - tickers[x.symbol].quoteVolume);
    if (tab === "gainers") list = [...list].sort((x, y) => tickers[y.symbol].change - tickers[x.symbol].change);
    if (tab === "losers") list = [...list].sort((x, y) => tickers[x.symbol].change - tickers[y.symbol].change);
    return list;
  }, [q, tab, tickers]);

  const sorted = [...ASSETS].sort((x, y) => tickers[y.symbol].change - tickers[x.symbol].change);
  const movers = [
    ["Top gainer", sorted[0]],
    ["Top loser", sorted[sorted.length - 1]],
    ["Most traded", [...ASSETS].sort((x, y) => tickers[y.symbol].quoteVolume - tickers[x.symbol].quoteVolume)[0]],
  ];

  return (
    <div className="stack">
      <div className="card" style={{ padding: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Total equity</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 900 }}>{fmtUSD(equity.total)}</div>
          <div className="num muted" style={{ fontSize: 12 }}>Cash {fmtUSD(equity.cash)}  ·  Unrealized PnL <span className={upDown(equity.upnl)}>{fmtUSD(equity.upnl, true)}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="big-btn buy" style={{ width: 110, height: 42, fontSize: 14 }} onClick={() => go("trade")}>Spot</button>
          <button className="big-btn accent" style={{ width: 110, height: 42, fontSize: 14 }} onClick={() => go("futures")}>Futures</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {movers.map(([label, a]) => {
          const t = tickers[a.symbol];
          return (
            <button key={label} className="card" onClick={() => go("trade", a.symbol)} style={{ padding: 10, textAlign: "left" }}>
              <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{label}</div>
              <div style={{ fontWeight: 900, marginTop: 3 }}>{a.emoji} {a.symbol}</div>
              <div className="num" style={{ fontWeight: 700, fontSize: 13 }}>{fmtPrice(t.price)}</div>
              <div className={"num " + upDown(t.change)} style={{ fontWeight: 800, fontSize: 13 }}>{fmtPct(t.change)}</div>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="tabs" style={{ padding: "0 14px" }}>
          {TABS.map(([k, label]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {label}{k === "news" && news.length > 0 ? ` (${news.length})` : ""}
            </button>
          ))}
        </div>

        {tab === "news" && <NewsList />}
        {tab === "live" && <FeedList />}
        {tab !== "news" && tab !== "live" && (
          <>
            <div style={{ padding: "10px 14px 6px" }}>
              <div className="field" style={{ height: 40 }}>
                <span className="muted">{Icon.search}</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 50 markets" style={{ textAlign: "left", fontSize: 14 }} />
              </div>
            </div>
            <div className="market-row market-head">
              <span>Name / Vol</span><span className="market-spark" /><span className="right" style={{ paddingRight: 14 }}>Last price</span><span className="right" style={{ minWidth: 78 }}>24h chg</span>
            </div>
            {rows.map((a) => {
              const t = tickers[a.symbol];
              return (
                <button key={a.symbol} onClick={() => go("trade", a.symbol)} className="market-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <SymIcon symbol={a.symbol} />
                    <div style={{ minWidth: 0, textAlign: "left" }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>
                        {a.symbol}<span className="muted" style={{ fontWeight: 600, fontSize: 12 }}> /USD</span>
                        {a.hot && <span style={{ marginLeft: 6, fontSize: 9.5, fontWeight: 900, color: "var(--warn)", border: "1px solid var(--warn)", borderRadius: 4, padding: "0 4px", verticalAlign: 2 }}>HOT</span>}
                      </div>
                      <div className="muted" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {a.name} · Vol {fmtCompact(t.quoteVolume)}
                      </div>
                    </div>
                  </div>
                  <div className="market-spark"><Spark values={sparks[a.symbol]} up={t.change >= 0} /></div>
                  <div className="num right" style={{ fontWeight: 800, fontSize: 15, paddingRight: 14 }}>{fmtPrice(t.price)}</div>
                  <div><span className={"pill num " + upDown(t.change)}>{fmtPct(t.change)}</span></div>
                </button>
              );
            })}
            {!rows.length && <div className="empty">No market matches "{q}".</div>}
          </>
        )}
      </div>
    </div>
  );
}
