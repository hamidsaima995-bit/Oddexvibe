import { useState } from "react";
import { useStore } from "../store.jsx";
import { deviceId } from "../lib/remote.js";
import { fmtUSD, upDown } from "../lib/format.js";

export default function RanksPage() {
  const { board, account, equity } = useStore();
  const [view, setView] = useState("all");
  const me = deviceId();
  const rows = (board || []).slice().sort((a, b) => (view === "week" ? b.week - a.week : b.worth - a.worth));
  const myRank = rows.findIndex((r) => r.id === me) + 1;

  return (
    <div className="stack" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 30, fontWeight: 900, minWidth: 54 }} className="num">{myRank ? "#" + myRank : "--"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900 }}>{account.name}</div>
          <div className="muted num" style={{ fontSize: 12 }}>Equity {fmtUSD(equity.total)} · ranks update every 30s</div>
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: 12 }}>
          <div className="seg">
            <button className={view === "all" ? "on" : ""} onClick={() => setView("all")}>All time</button>
            <button className={view === "week" ? "on" : ""} onClick={() => setView("week")}>This week</button>
          </div>
        </div>
        {board === null && <div className="empty">Loading leaderboard…</div>}
        {board && rows.length === 0 && <div className="empty">No traders yet. Make a trade and you're #1.</div>}
        {rows.length > 0 && (
          <table className="table num">
            <thead><tr><th style={{ width: 44 }}>#</th><th>Trader</th><th className="right">{view === "week" ? "Week PnL" : "Equity"}</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ background: r.id === me ? "var(--panel-2)" : undefined }}>
                  <td style={{ fontWeight: 900, color: i < 3 ? "var(--warn)" : "var(--muted)" }}>{i + 1}</td>
                  <td style={{ fontWeight: r.id === me ? 900 : 600 }}>{r.name}{r.id === me ? " (you)" : ""}</td>
                  <td className={"right " + (view === "week" ? upDown(r.week) : "")} style={{ fontWeight: 800 }}>
                    {view === "week" ? fmtUSD(r.week, true) : fmtUSD(r.worth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
