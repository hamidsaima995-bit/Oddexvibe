// Network layer for v2: shared trades feed, leaderboard, live news.
// Every call is best-effort. If Supabase or the news backend is down,
// trading keeps working locally and these just return empty results.
import { supabase } from "../../supabase.js";
import { ASSET_BY_SYMBOL } from "./assets.js";

const NEWS_BACKEND = "https://oddex-backend-production.up.railway.app";

// ── Identity ────────────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  (globalThis.crypto || { getRandomValues: (a) => a.map(() => Math.floor(Math.random() * 256)) }).getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export function deviceId() {
  try {
    let id = localStorage.getItem("oddex_device_id");
    if (!id || !UUID_RE.test(id)) { id = uuid(); localStorage.setItem("oddex_device_id", id); }
    return id;
  } catch { return uuid(); }
}

// ── Trades feed ─────────────────────────────────────────────────────────
// kind: "spot" | "futures". side: buy | sell (futures: open long/close short = buy).
export async function publishTrade({ who, side, symbol, qty, price, kind = "spot", lev = null }) {
  const row = { who, side, symbol, qty: Number(qty.toFixed(6)), price: Number(price.toFixed(6)), kind, lev };
  try {
    const { error } = await supabase.from("trades").insert(row);
    if (!error) return true;
    // Older schema (integer qty, no kind/lev): fall back so the feed still works.
    const { error: e2 } = await supabase.from("trades").insert({
      who, side, symbol, qty: Math.max(1, Math.round(qty)), price: row.price,
    });
    return !e2;
  } catch { return false; }
}

export async function fetchTrades(limit = 60) {
  try {
    let res = await supabase.from("trades")
      .select("id, who, side, symbol, qty, price, kind, lev, created_at")
      .order("created_at", { ascending: false }).limit(limit);
    if (res.error) {
      res = await supabase.from("trades")
        .select("id, who, side, symbol, qty, price, created_at")
        .order("created_at", { ascending: false }).limit(limit);
    }
    if (res.error || !res.data) return null;
    return res.data.map((t) => ({ ...t, qty: Number(t.qty), price: Number(t.price), kind: t.kind || "spot" }));
  } catch { return null; }
}

// ── Leaderboard ─────────────────────────────────────────────────────────
export function weekId(d = new Date()) {
  const days = Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000);
  const sinceSat = (d.getUTCDay() - 6 + 7) % 7;
  return "W" + (days - sinceSat);
}

export async function pushScore(name, netWorth) {
  const id = deviceId();
  const worth = Math.max(0, Math.min(1e9, Math.round(netWorth * 100) / 100));
  const wk = weekId();
  try {
    const { data: existing } = await supabase.from("scores")
      .select("id, week_id, week_start_worth").eq("user_id", id).maybeSingle();
    const row = { user_id: id, username: name, net_worth: worth, xp: 0 };
    if (!existing || existing.week_id !== wk || existing.week_start_worth == null) {
      row.week_id = wk; row.week_start_worth = worth;
    }
    const { error } = existing
      ? await supabase.from("scores").update(row).eq("id", existing.id)
      : await supabase.from("scores").insert(row);
    return !error;
  } catch { return false; }
}

export async function fetchLeaderboard(limit = 100) {
  try {
    const { data, error } = await supabase.from("scores")
      .select("user_id, username, net_worth, week_id, week_start_worth")
      .neq("net_worth", 10000) // untouched starter accounts (never traded)
      .order("net_worth", { ascending: false }).limit(limit);
    if (error || !data) return null;
    const wk = weekId();
    return data.map((s) => ({
      id: s.user_id,
      name: (s.username || "").trim() || "Trader" + String(s.user_id).slice(-4).toUpperCase(),
      worth: Number(s.net_worth) || 0,
      week: s.week_id === wk && s.week_start_worth != null ? Number(s.net_worth) - Number(s.week_start_worth) : 0,
    }));
  } catch { return null; }
}

// ── News ────────────────────────────────────────────────────────────────
// Live headlines come from the ODDEX news backend. The first client to see a
// headline stamps it into `market_news` (headline is unique), so every player
// gets the same timestamp and therefore the same price shock.
function cleanEvents(events) {
  return (events || [])
    .filter((e) => e && e.headline && e.symbol && ASSET_BY_SYMBOL[e.symbol] && !/Market buzz around/i.test(e.headline))
    .map((e) => ({
      headline: String(e.headline).slice(0, 300),
      symbol: e.symbol,
      impact: Math.max(-40, Math.min(40, Number(e.impact) || 0)),
    }));
}

export async function fetchBackendNews() {
  try {
    const res = await fetch(NEWS_BACKEND + "/news");
    if (!res.ok) return [];
    const data = await res.json();
    return cleanEvents(data.events);
  } catch { return []; }
}

export async function stampNews(events) {
  if (!events.length) return;
  try {
    await supabase.from("market_news").upsert(events, { onConflict: "headline", ignoreDuplicates: true });
  } catch { /* table missing: shocks just stay off */ }
}

export async function fetchMarketNews(sinceDays = 4) {
  try {
    const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
    const { data, error } = await supabase.from("market_news")
      .select("headline, symbol, impact, created_at")
      .gte("created_at", since).order("created_at", { ascending: false }).limit(300);
    if (error || !data) return null;
    return data.map((n) => ({ ...n, impact: Number(n.impact), t: Date.parse(n.created_at) / 1000 }));
  } catch { return null; }
}
