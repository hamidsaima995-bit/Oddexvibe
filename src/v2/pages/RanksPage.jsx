import { useState } from "react";
import { useStore, go } from "../store.jsx";
import { deviceId } from "../lib/remote.js";
import { fmtUSD, fmtPct, upDown } from "../lib/format.js";
import { START_CASH } from "../lib/trading.js";
import { traderStats } from "../lib/insights.js";

const MEDAL = ["#f0b90b", "#a7b1bd", "#d08a4e"];
const HEIGHT = [96, 70, 54];

function Podium({ rows, view, me }) {
  // Screen order: 2nd, 1st, 3rd.
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, alignItems: "end", padding: "18px 14px 0" }}>
      {[1, 0, 2].map((place) => {
        const r = rows[place];
        return (
          <div key={place} style={{ textAlign: "center", minWidth: 0 }}>
            {r && (
              <>
                <div style={{ fontWeight: r.id === me ? 900 : 800, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.name}{r.id === me ? " (you)" : ""}
                </div>
                <div className={"num " + (view === "week" ? upDown(r.week) : "")} style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                  {view === "week" ? fmtUSD(r.week, true) : fmtUSD(r.worth)}
                </div>
              </>
            )}
            <div style={{ height: HEIGHT[place], borderRadius: "10px 10px 0 0", background: r ? MEDAL[place] : "var(--panel-2)",
              display: "grid", placeItems: "center", color: "#1e2329", fontWeight: 900, fontSize: 24 }}>
              {r ? place + 1 : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RanksPage() {
  const { board, account, equity } = useStore();
  const [view, setView] = useState("all");
  const me = deviceId();
  const failed = board === "error";
  const rows = (Array.isArray(board) ? board : []).slice().sort((a, b) => (view === "week" ? b.week - a.week : b.worth - a.worth));
  const myRank = rows.findIndex((r) => r.id === me) + 1;
  const st = traderStats(account.history);
  const pnl = equity.total - START_CASH;

  return (
    <div className="ranks-layout">
      <div className="ranks-you">
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="num" style={{ fontSize: 30, fontWeight: 900, minWidth: 54 }}>{myRank ? "#" + myRank : "--"}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900 }}>{account.name}</div>
              <div className="muted num" style={{ fontSize: 12 }}>
                {fmtUSD(equity.total)} · <span className={upDown(pnl)}>{fmtPct((pnl / START_CASH) * 100)}</span>
              </div>
            </div>
          </div>
          {account.history.length === 0 ? (
            <div style={{ marginTop: 12, fontSize: 13 }}>
              You're not ranked yet. <button className="link-btn" onClick={() => go("markets")}>Make your first trade</button> to join.
            </div>
          ) : (
            <div className="num" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 12, fontSize: 12 }}>
              <div><div className="muted">Win rate</div><b>{st.winRate == null ? "--" : st.winRate.toFixed(0) + "%"}</b></div>
              <div><div className="muted">Trades</div><b>{st.trades}</b></div>
              <div><div className="muted">Realized</div><b className={upDown(st.realized)}>{fmtUSD(st.realized, true)}</b></div>
            </div>
          )}
        </div>
        <div className="card muted only-desktop" style={{ padding: 16, fontSize: 12.5, lineHeight: 1.55 }}>
          Everyone starts with {fmtUSD(START_CASH)}. Rank is total equity: cash, spot holdings and open futures.
          Weekly rank is profit since Saturday. Only traders who have made at least one trade are listed.
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
        {failed && <div className="empty">Couldn't load the leaderboard. Check your connection, it retries every 30s.</div>}
        {Array.isArray(board) && rows.length === 0 && <div className="empty">No traders yet. Make a trade and you're #1.</div>}
        {rows.length > 0 && <Podium rows={rows} view={view} me={me} />}
        {rows.length > 3 ? (
          <table className="table num">
            <thead><tr><th style={{ width: 44 }}>#</th><th>Trader</th><th className="right">{view === "week" ? "Week PnL" : "Equity"}</th></tr></thead>
            <tbody>
              {rows.slice(3).map((r, i) => (
                <tr key={r.id} style={{ background: r.id === me ? "var(--panel-2)" : undefined }}>
                  <td style={{ fontWeight: 900, color: "var(--muted)" }}>{i + 4}</td>
                  <td style={{ fontWeight: r.id === me ? 900 : 600 }}>{r.name}{r.id === me ? " (you)" : ""}</td>
                  <td className={"right " + (view === "week" ? upDown(r.week) : "")} style={{ fontWeight: 800 }}>
                    {view === "week" ? fmtUSD(r.week, true) : fmtUSD(r.worth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : rows.length > 0 && <div style={{ height: 1, background: "var(--line)" }} />}
      </div>
    </div>
  );
}
