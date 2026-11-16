import { useMemo } from "react";
import { useStore, go } from "../store.jsx";
import { ASSETS, SECTORS } from "../lib/assets.js";
import { MOOD_LEVELS, marketMood, sectorStats } from "../lib/insights.js";
import { fmtPct, timeAgo, upDown } from "../lib/format.js";

export function useMood() {
  const { tickers } = useStore();
  return useMemo(() => marketMood(tickers), [tickers]);
}

// Half-circle gauge, 0 (Fear) to 100 (Euphoric).
export function MoodGauge({ mood }) {
  const R = 80, cx = 100, cy = 92;
  const pt = (v, r = R) => {
    const a = Math.PI * (1 - v / 100);
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  };
  let from = 0;
  const arcs = MOOD_LEVELS.map((l) => {
    const to = Math.min(100, l.max);
    const [x1, y1] = pt(from + 0.8), [x2, y2] = pt(to - 0.8);
    from = to;
    return <path key={l.label} d={`M${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2}`} stroke={l.color} strokeWidth="16" fill="none" />;
  });
  const [nx, ny] = pt(mood.score, R - 22);
  return (
    <svg viewBox="0 0 200 104" style={{ width: "100%", maxWidth: 240, display: "block", margin: "0 auto" }} aria-label={`Market mood ${mood.score}, ${mood.label}`}>
      {arcs}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--text)" strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="7" fill="var(--text)" />
    </svg>
  );
}

export function MoodCard() {
  const mood = useMood();
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 className="section-title">Market mood</h3>
        <span className="muted" style={{ fontSize: 12 }}>last 24h</span>
      </div>
      <div style={{ marginTop: 10 }}><MoodGauge mood={mood} /></div>
      <div style={{ textAlign: "center", marginTop: 2 }}>
        <div className="num" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{mood.score}</div>
        <div style={{ fontWeight: 900, color: mood.color, marginTop: 4 }}>{mood.label}</div>
        <div className="muted num" style={{ fontSize: 12, marginTop: 6 }}>
          <span className="up">{mood.up} up</span> · <span className="down">{mood.down} down</span> · avg {fmtPct(mood.avg)}
        </div>
      </div>
    </div>
  );
}

// Compact one-line version for phones.
export function MoodStrip() {
  const mood = useMood();
  return (
    <div className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800 }}>
          <span className="muted">Market mood</span>
          <span className="num"><span className="up">{mood.up}▲</span> <span className="down">{mood.down}▼</span></span>
        </div>
        <div style={{ position: "relative", height: 8, borderRadius: 4, marginTop: 8, display: "flex", overflow: "hidden" }}>
          {MOOD_LEVELS.map((l) => <div key={l.label} style={{ flex: 1, background: l.color }} />)}
        </div>
        <div style={{ position: "relative", height: 0 }}>
          <div style={{ position: "absolute", left: `calc(${mood.score}% - 6px)`, top: -14, width: 12, height: 12, borderRadius: 6, background: "var(--text)", border: "2px solid var(--panel)" }} />
        </div>
      </div>
      <div style={{ textAlign: "right", minWidth: 74 }}>
        <div className="num" style={{ fontWeight: 900, fontSize: 20, lineHeight: 1 }}>{mood.score}</div>
        <div style={{ fontWeight: 900, fontSize: 12, color: mood.color }}>{mood.label}</div>
      </div>
    </div>
  );
}

export function useSectors() {
  const { tickers } = useStore();
  return useMemo(() => sectorStats(tickers), [tickers]);
}

export function SectorCard({ onPick }) {
  const sectors = useSectors();
  const max = Math.max(1, ...sectors.map((s) => Math.abs(s.change)));
  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 className="section-title" style={{ marginBottom: 12 }}>Sectors today</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {sectors.map((s) => (
          <button key={s.id} onClick={() => onPick?.(s.id)} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "4px 10px", textAlign: "left" }}>
            <span style={{ fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />{s.id}
            </span>
            <span className={"num " + upDown(s.change)} style={{ fontWeight: 800, fontSize: 13 }}>{fmtPct(s.change)}</span>
            <span style={{ gridColumn: "1 / -1", height: 6, borderRadius: 3, background: "var(--panel-2)", position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${(Math.abs(s.change) / max) * 100}%`, background: s.change >= 0 ? "var(--up)" : "var(--down)", borderRadius: 3 }} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LatestNewsCard({ onAll }) {
  const { news } = useStore();
  const rows = news.slice(0, 5);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 16px 6px" }}>
        <h3 className="section-title">Moving the market</h3>
        <button className="link-btn" style={{ fontSize: 13 }} onClick={onAll}>All news</button>
      </div>
      {!rows.length && <div className="empty">No headlines right now.</div>}
      {rows.map((n, i) => (
        <button key={n.headline + i} onClick={() => go("trade", n.symbol)}
          style={{ width: "100%", textAlign: "left", padding: "10px 16px", borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 800 }}>
            <span>{n.symbol}</span>
            <span className={upDown(n.impact)}>{n.impact > 0 ? "▲" : "▼"} {Math.abs(n.impact).toFixed(1)}%{n.t ? <span className="muted" style={{ fontWeight: 600 }}> · {timeAgo(n.t * 1000)}</span> : null}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginTop: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.headline}</div>
        </button>
      ))}
    </div>
  );
}

// Tile color: neutral gray blended toward green/red by size of the move.
function heatColor(change) {
  const k = Math.min(1, Math.abs(change) / 10);
  const base = [94, 102, 115];
  const tgt = change >= 0 ? [14, 203, 129] : [246, 70, 93];
  const c = base.map((b, i) => Math.round(b + (tgt[i] - b) * (0.35 + 0.65 * k)));
  return `rgb(${c.join(",")})`;
}

export function Heatmap() {
  const { tickers } = useStore();
  const vols = ASSETS.map((a) => tickers[a.symbol].quoteVolume).sort((x, y) => y - x);
  const bigCut = vols[Math.floor(vols.length * 0.2)];
  return (
    <div style={{ padding: "6px 14px 14px", display: "grid", gap: 14 }}>
      {SECTORS.map((s) => {
        const list = ASSETS.filter((a) => a.sector === s.id).sort((x, y) => tickers[y.symbol].quoteVolume - tickers[x.symbol].quoteVolume);
        return (
          <div key={s.id}>
            <div style={{ fontWeight: 800, fontSize: 12.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />{s.id}
            </div>
            <div className="heat-grid">
              {list.map((a) => {
                const t = tickers[a.symbol];
                const big = t.quoteVolume >= bigCut;
                return (
                  <button key={a.symbol} className={"heat-tile" + (big ? " big" : "")} style={{ background: heatColor(t.change) }} onClick={() => go("trade", a.symbol)}>
                    <span style={{ fontWeight: 900, fontSize: big ? 16 : 13 }}>{a.symbol}</span>
                    <span className="num" style={{ fontWeight: 800, fontSize: big ? 14 : 12 }}>{fmtPct(t.change)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="faint" style={{ fontSize: 11.5 }}>Bigger tiles = more volume. Color = 24h change.</div>
    </div>
  );
}
