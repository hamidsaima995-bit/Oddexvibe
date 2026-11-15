import { useMemo, useState } from "react";
import { ASSETS, ASSET_BY_SYMBOL } from "../lib/assets.js";
import { fmtPrice, fmtPct, fmtCompact, fmtQty, fmtUSD, timeAgo, upDown } from "../lib/format.js";
import { positionPnl } from "../lib/trading.js";
import { useStore, go } from "../store.jsx";

const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
export const Icon = {
  markets: <svg viewBox="0 0 24 24" {...P}><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></svg>,
  trade: <svg viewBox="0 0 24 24" {...P}><path d="M7 4v16M17 4v16" /><rect x="4" y="8" width="6" height="7" rx="1" /><rect x="14" y="6" width="6" height="9" rx="1" /></svg>,
  futures: <svg viewBox="0 0 24 24" {...P}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>,
  assets: <svg viewBox="0 0 24 24" {...P}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M16 12h2M3 10h18" /></svg>,
  ranks: <svg viewBox="0 0 24 24" {...P}><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4z" /><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3" /></svg>,
  sun: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  moon: <svg viewBox="0 0 24 24" {...P}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>,
  chevron: <svg viewBox="0 0 24 24" {...P} width="16" height="16"><path d="M6 9l6 6 6-6" /></svg>,
  search: <svg viewBox="0 0 24 24" {...P} width="18" height="18"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>,
  close: <svg viewBox="0 0 24 24" {...P} width="20" height="20"><path d="M6 6l12 12M18 6L6 18" /></svg>,
};

export function SymIcon({ symbol, size = 34 }) {
  return <div className="sym-icon" style={{ width: size, height: size, fontSize: size * 0.52 }}>{ASSET_BY_SYMBOL[symbol]?.emoji || "•"}</div>;
}

export function Spark({ values, up, w = 64, h = 24 }) {
  if (!values || values.length < 2) return null;
  const lo = Math.min(...values), hi = Math.max(...values), rng = hi - lo || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 2 - ((v - lo) / rng) * (h - 4)}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline points={pts} fill="none" stroke={up ? "var(--up)" : "var(--down)"} strokeWidth="1.6" /></svg>;
}

// ── Pair header used by Spot and Futures ──────────────────────────────
export function PairHeader({ symbol, page }) {
  const { tickers } = useStore();
  const [picking, setPicking] = useState(false);
  const a = ASSET_BY_SYMBOL[symbol];
  const t = tickers[symbol];
  return (
    <div style={{ padding: "12px 14px 10px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 22px" }}>
      <button onClick={() => setPicking(true)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SymIcon symbol={symbol} size={36} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", gap: 4 }}>
            {symbol}<span className="muted" style={{ fontWeight: 700, fontSize: 14 }}>/USD</span>
            {page === "futures" && <span style={{ fontSize: 10, fontWeight: 900, background: "var(--panel-2)", color: "var(--muted)", padding: "2px 6px", borderRadius: 5, marginLeft: 4 }}>PERP</span>}
            {Icon.chevron}
          </div>
          <div className="muted" style={{ fontSize: 12, maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
        </div>
      </button>
      <div>
        <div className={"num " + upDown(t.change)} style={{ fontWeight: 900, fontSize: 24, lineHeight: 1.1 }}>{fmtPrice(t.price)}</div>
        <div className={"num " + upDown(t.change)} style={{ fontWeight: 700, fontSize: 13 }}>{fmtPct(t.change)}</div>
      </div>
      <div className="num" style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: "2px 18px", fontSize: 12 }}>
        <span className="muted">24h High</span><span className="muted">24h Low</span><span className="muted">24h Vol</span>
        <b>{fmtPrice(t.high)}</b><b>{fmtPrice(t.low)}</b><b>{fmtCompact(t.quoteVolume)}</b>
      </div>
      {picking && <MarketPicker onClose={() => setPicking(false)} onPick={(s) => { setPicking(false); go(page, s); }} current={symbol} />}
    </div>
  );
}

export function MarketPicker({ onClose, onPick, current }) {
  const { tickers } = useStore();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ASSETS.filter((a) => !s || a.symbol.toLowerCase().includes(s) || a.name.toLowerCase().includes(s));
  }, [q]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="field" style={{ flex: 1, height: 42 }}>
            <span className="muted">{Icon.search}</span>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" style={{ textAlign: "left" }} />
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">{Icon.close}</button>
        </div>
        <div className="sheet-body">
          {list.map((a) => {
            const t = tickers[a.symbol];
            return (
              <button key={a.symbol} onClick={() => onPick(a.symbol)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderTop: "1px solid var(--line)",
                  background: a.symbol === current ? "var(--panel-2)" : "transparent" }}>
                <SymIcon symbol={a.symbol} size={30} />
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontWeight: 800 }}>{a.symbol}<span className="muted" style={{ fontWeight: 600 }}>/USD</span></div>
                  <div className="muted" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                </div>
                <div className="num right" style={{ fontWeight: 700 }}>{fmtPrice(t.price)}</div>
                <div className={"num right " + upDown(t.change)} style={{ width: 70, fontWeight: 700 }}>{fmtPct(t.change)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Shared trades feed ─────────────────────────────────────────────────
export function FeedList({ symbol, limit = 20 }) {
  const { feed, account } = useStore();
  const rows = (symbol ? feed.filter((t) => t.symbol === symbol) : feed).slice(0, limit);
  if (!rows.length) return <div className="empty">No trades yet. Be the first to trade{symbol ? " " + symbol : ""}.</div>;
  return (
    <table className="table num">
      <thead><tr><th>Trader</th>{!symbol && <th>Pair</th>}<th className="right">Price</th><th className="right">Amount</th><th className="right">Time</th></tr></thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id}>
            <td style={{ fontWeight: t.who === account.name ? 800 : 500 }}>
              {t.who}{t.kind === "futures" && <span className="faint" style={{ fontSize: 10, fontWeight: 800 }}> {t.lev ? t.lev + "x" : "PERP"}</span>}
            </td>
            {!symbol && <td><button className="link-btn" onClick={() => go("trade", t.symbol)}>{t.symbol}</button></td>}
            <td className={"right " + (t.side === "buy" ? "up" : "down")} style={{ fontWeight: 700 }}>{fmtPrice(t.price)}</td>
            <td className="right">{fmtQty(t.qty)}</td>
            <td className="right muted">{timeAgo(Date.parse(t.created_at))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── News list ──────────────────────────────────────────────────────────
export function NewsList({ symbol, limit = 30 }) {
  const { news } = useStore();
  const rows = (symbol ? news.filter((n) => n.symbol === symbol) : news).slice(0, limit);
  if (!rows.length) return <div className="empty">No market-moving news right now.</div>;
  return (
    <div>
      {rows.map((n, i) => (
        <button key={n.headline + i} onClick={() => go("trade", n.symbol)}
          style={{ width: "100%", textAlign: "left", display: "flex", gap: 12, padding: "12px 14px", borderTop: i ? "1px solid var(--line)" : 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, lineHeight: 1.35 }}>{n.headline}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{n.t ? timeAgo(n.t * 1000) + " ago" : "Just in"}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontWeight: 900 }}>{n.symbol}</div>
            <div className={"num " + upDown(n.impact)} style={{ fontWeight: 800, fontSize: 13 }}>{n.impact > 0 ? "▲" : "▼"} {Math.abs(n.impact).toFixed(1)}%</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Open futures positions ─────────────────────────────────────────────
export function PositionsList({ symbol }) {
  const { account, priceOf, actions } = useStore();
  const rows = symbol ? account.positions.filter((p) => p.symbol === symbol) : account.positions;
  if (!rows.length) return <div className="empty">No open positions.</div>;
  return (
    <div>
      {rows.map((p) => {
        const mark = priceOf(p.symbol);
        const { pnl, roe } = positionPnl(p, mark);
        const risk = Math.abs(mark - p.liq) / mark < 0.03;
        return (
          <div key={p.id} style={{ padding: "12px 14px", borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className={"pill " + (p.side === "long" ? "up" : "down")} style={{ minWidth: 0, padding: "3px 8px", fontSize: 11 }}>{p.side === "long" ? "LONG" : "SHORT"}</span>
              <button style={{ fontWeight: 900, fontSize: 15 }} onClick={() => go("futures", p.symbol)}>{p.symbol}/USD</button>
              <span className="muted" style={{ fontWeight: 800, fontSize: 12 }}>{p.lev}x Isolated</span>
              <span style={{ flex: 1 }} />
              <button className="big-btn" style={{ width: "auto", height: 32, padding: "0 14px", fontSize: 13, background: "var(--panel-2)", color: "var(--text)", border: "1px solid var(--line)" }}
                onClick={() => actions.close(p.id)}>Close</button>
            </div>
            <div className="num" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 10px", fontSize: 12 }}>
              <div><div className="muted">PnL (USD)</div><b className={upDown(pnl)} style={{ fontSize: 15 }}>{fmtUSD(pnl, true)}</b></div>
              <div><div className="muted">ROE</div><b className={upDown(roe)} style={{ fontSize: 15 }}>{fmtPct(roe)}</b></div>
              <div><div className="muted">Margin</div><b>{fmtUSD(p.margin)}</b></div>
              <div><div className="muted">Entry</div><b>{fmtPrice(p.entry)}</b></div>
              <div><div className="muted">Mark</div><b>{fmtPrice(mark)}</b></div>
              <div><div className="muted">Liq. price</div><b style={{ color: risk ? "var(--down)" : "var(--warn)" }}>{fmtPrice(p.liq)}</b></div>
              {(p.tp || p.sl) && <div style={{ gridColumn: "1 / -1" }} className="muted">TP <b className="up">{p.tp ? fmtPrice(p.tp) : "--"}</b>  ·  SL <b className="down">{p.sl ? fmtPrice(p.sl) : "--"}</b></div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
