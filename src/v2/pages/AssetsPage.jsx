import { useState } from "react";
import { useStore, go } from "../store.jsx";
import { fmtPrice, fmtPct, fmtQty, fmtUSD, timeAgo, upDown } from "../lib/format.js";
import { START_CASH } from "../lib/trading.js";
import { SymIcon, PositionsList } from "../components/ui.jsx";

function historyLabel(h) {
  if (h.type === "spot") return h.side === "buy" ? "Spot buy" : "Spot sell";
  const side = h.side === "long" ? "Long" : "Short";
  return { open: `Open ${side}`, close: `Close ${side}`, tp: `${side} take profit`, sl: `${side} stop loss`, liq: `${side} liquidated` }[h.action] || side;
}

export default function AssetsPage() {
  const { account, equity, priceOf, actions, theme, toggleTheme } = useStore();
  const [tab, setTab] = useState("spot");
  const [name, setName] = useState(account.name);
  const [confirmReset, setConfirmReset] = useState(false);
  const total = equity.total, pnlAll = total - START_CASH;
  const holdings = Object.entries(account.spot);

  return (
    <div className="stack" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="card" style={{ padding: 16 }}>
        <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Total equity</div>
        <div className="num" style={{ fontSize: 30, fontWeight: 900 }}>{fmtUSD(total)}</div>
        <div className={"num " + upDown(pnlAll)} style={{ fontWeight: 800 }}>{fmtUSD(pnlAll, true)} ({fmtPct((pnlAll / START_CASH) * 100)}) all time</div>
        <div className="num" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 14 }}>
          {[["Cash", equity.cash], ["Spot", equity.spotValue], ["Futures", equity.futValue]].map(([k, v]) => (
            <div key={k} style={{ background: "var(--panel-2)", borderRadius: 10, padding: 10 }}>
              <div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{k}</div>
              <div style={{ fontWeight: 800 }}>{fmtUSD(v)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="tabs" style={{ padding: "0 14px" }}>
          {[["spot", `Spot (${holdings.length})`], ["futures", `Futures (${account.positions.length})`], ["history", "History"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        {tab === "spot" && (holdings.length === 0
          ? <div className="empty">No spot holdings. <button className="link-btn" onClick={() => go("markets")}>Browse markets</button></div>
          : holdings.map(([sym, h]) => {
              const value = h.qty * priceOf(sym), pnl = value - h.cost;
              return (
                <button key={sym} onClick={() => go("trade", sym)} className="num"
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderTop: "1px solid var(--line)" }}>
                  <SymIcon symbol={sym} />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontWeight: 800 }}>{sym}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{fmtQty(h.qty)} · avg {fmtPrice(h.cost / h.qty)}</div>
                  </div>
                  <div className="right">
                    <div style={{ fontWeight: 800 }}>{fmtUSD(value)}</div>
                    <div className={upDown(pnl)} style={{ fontSize: 12, fontWeight: 700 }}>{fmtUSD(pnl, true)} ({fmtPct((pnl / h.cost) * 100)})</div>
                  </div>
                </button>
              );
            }))}
        {tab === "futures" && <PositionsList />}
        {tab === "history" && (account.history.length === 0
          ? <div className="empty">No trades yet.</div>
          : <table className="table num">
              <thead><tr><th>Trade</th><th className="right">Price</th><th className="right">Amount</th><th className="right">PnL</th></tr></thead>
              <tbody>
                {account.history.slice(0, 60).map((h) => (
                  <tr key={h.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{h.symbol} <span className="faint" style={{ fontSize: 11 }}>{h.lev ? h.lev + "x" : ""}</span></div>
                      <div className={h.action === "liq" ? "down" : "muted"} style={{ fontSize: 11.5 }}>{historyLabel(h)} · {timeAgo(h.at)} ago</div>
                    </td>
                    <td className="right">{fmtPrice(h.price)}</td>
                    <td className="right">{fmtQty(h.qty)}</td>
                    <td className={"right " + (h.pnl == null ? "faint" : upDown(h.pnl))} style={{ fontWeight: 700 }}>{h.pnl == null ? "--" : fmtUSD(h.pnl, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>)}
      </div>

      <div className="card panel-grid" style={{ padding: 16 }}>
        <h3 className="section-title">Settings</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <label className="field" style={{ flex: 1 }}>
            <span className="lbl">Trader name</span>
            <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} />
          </label>
          <button className="big-btn accent" style={{ width: 90, height: 46, fontSize: 14 }} onClick={() => actions.rename(name)}>Save</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700 }}>Theme</span>
          <div className="seg" style={{ width: 200 }}>
            <button className={theme === "light" ? "on" : ""} onClick={() => theme !== "light" && toggleTheme()}>Light</button>
            <button className={theme === "dark" ? "on" : ""} onClick={() => theme !== "dark" && toggleTheme()}>Dark</button>
          </div>
        </div>
        {!confirmReset
          ? <button className="big-btn" style={{ background: "var(--panel-2)", color: "var(--down)", border: "1px solid var(--line)", height: 44, fontSize: 14 }} onClick={() => setConfirmReset(true)}>Reset account</button>
          : <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 700 }}>Close everything and start again with $10,000? This can't be undone.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="big-btn sell" style={{ height: 44, fontSize: 14 }} onClick={() => { actions.reset(); setConfirmReset(false); }}>Yes, reset</button>
                <button className="big-btn" style={{ height: 44, fontSize: 14, background: "var(--panel-2)", color: "var(--text)" }} onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            </div>}
      </div>
    </div>
  );
}
