// Derived numbers for dashboards. Pure functions, unit tested.
import { ASSETS, SECTORS, SECTOR_COLOR, ASSET_BY_SYMBOL } from "./assets.js";

// 0-100 mood from how many markets are up and by how much.
export const MOOD_LEVELS = [
  { max: 20, label: "Fear", color: "#e0455d" },
  { max: 40, label: "Worried", color: "#f08a3c" },
  { max: 60, label: "Neutral", color: "#d9b42c" },
  { max: 80, label: "Excited", color: "#6cc24a" },
  { max: 101, label: "Euphoric", color: "#12b886" },
];

export function marketMood(tickers) {
  let up = 0, sum = 0, n = 0;
  for (const a of ASSETS) {
    const t = tickers[a.symbol];
    if (!t) continue;
    n++; sum += t.change;
    if (t.change > 0) up++;
  }
  if (!n) return { score: 50, ...MOOD_LEVELS[2], up: 0, down: 0, avg: 0 };
  const avg = sum / n;
  const breadth = (up / n) * 100;
  const score = Math.max(0, Math.min(100, Math.round(0.6 * breadth + 0.4 * (50 + avg * 5))));
  const level = MOOD_LEVELS.find((l) => score < l.max);
  return { score, label: level.label, color: level.color, up, down: n - up, avg };
}

export function sectorStats(tickers) {
  return SECTORS.map((s) => {
    const list = ASSETS.filter((a) => a.sector === s.id && tickers[a.symbol]);
    const change = list.reduce((m, a) => m + tickers[a.symbol].change, 0) / (list.length || 1);
    return { id: s.id, color: s.color, change, count: list.length };
  });
}

// Portfolio split by asset, plus cash and futures margin. pct sums to 100.
export function allocation(account, priceOf) {
  const parts = [];
  for (const [sym, h] of Object.entries(account.spot)) {
    const v = h.qty * (priceOf(sym) || 0);
    if (v > 0) parts.push({ key: sym, label: sym, value: v, color: SECTOR_COLOR[ASSET_BY_SYMBOL[sym]?.sector] || "#888" });
  }
  let fut = 0;
  for (const p of account.positions) {
    const mark = priceOf(p.symbol) || p.entry;
    const pnl = (p.side === "long" ? mark - p.entry : p.entry - mark) * p.qty;
    fut += Math.max(0, p.margin + pnl);
  }
  if (fut > 0) parts.push({ key: "__fut", label: "Futures", value: fut, color: "#8b7bff" });
  if (account.cash > 0) parts.push({ key: "__cash", label: "Cash", value: account.cash, color: "#848e9c" });
  const total = parts.reduce((m, p) => m + p.value, 0) || 1;
  parts.sort((a, b) => (a.key === "__cash") - (b.key === "__cash") || b.value - a.value);
  return parts.map((p) => ({ ...p, pct: (p.value / total) * 100 }));
}

// Stats from local trade history: realized results only.
export function traderStats(history) {
  const closed = history.filter((h) => h.pnl != null);
  const wins = closed.filter((h) => h.pnl > 0);
  const realized = closed.reduce((m, h) => m + h.pnl, 0);
  const best = closed.reduce((b, h) => (b == null || h.pnl > b.pnl ? h : b), null);
  return {
    trades: history.length,
    closed: closed.length,
    winRate: closed.length ? (wins.length / closed.length) * 100 : null,
    realized,
    best,
    liquidations: history.filter((h) => h.action === "liq").length,
  };
}

// News markers for a chart: one marker per candle, newest headlines first.
export function newsMarkers(news, tfSec, firstTime, lastTime) {
  const byBar = new Map();
  for (const n of news) {
    if (!n.t) continue;
    const bar = Math.floor(n.t / tfSec) * tfSec;
    if (bar < firstTime || bar > lastTime) continue;
    if (!byBar.has(bar)) byBar.set(bar, []);
    byBar.get(bar).push(n);
  }
  return [...byBar.entries()].sort((a, b) => a[0] - b[0]).map(([time, items]) => {
    const impact = items.reduce((m, x) => m + x.impact, 0);
    return { time, items, impact, up: impact >= 0 };
  });
}
