import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ASSETS, ASSET_BY_SYMBOL, resolveSymbol } from "./lib/assets.js";
import { priceAt, stats24h } from "./lib/price.js";
import * as T from "./lib/trading.js";
import * as R from "./lib/remote.js";
import { fmtPrice, fmtUSD } from "./lib/format.js";

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const ACCOUNT_KEY = "oddex_v2_account";
const THEME_KEY = "oddex_theme";

function randomName() { return "Trader" + Math.floor(1000 + Math.random() * 9000); }

// Saves from before the rename use old tickers. Move them to the new ones.
// Prices are seeded by the old ticker, so values are unchanged.
function migrateSymbols(s) {
  const spot = {};
  for (const [sym, h] of Object.entries(s.spot)) {
    const n = resolveSymbol(sym);
    if (!n) continue;
    const cur = spot[n];
    spot[n] = cur ? { qty: cur.qty + h.qty, cost: cur.cost + h.cost } : h;
  }
  return {
    ...s,
    spot,
    positions: s.positions.filter((p) => resolveSymbol(p.symbol)).map((p) => ({ ...p, symbol: resolveSymbol(p.symbol) })),
    history: s.history.map((h) => ({ ...h, symbol: resolveSymbol(h.symbol) || h.symbol })),
  };
}

function loadAccount() {
  try {
    const s = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
    if (s && s.v === 2 && Number.isFinite(s.cash) && s.spot && Array.isArray(s.positions) && Array.isArray(s.history)) return migrateSymbols(s);
  } catch { /* corrupt save: start fresh */ }
  return T.newState(randomName());
}

function initialTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark") return t;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch { return "dark"; }
}

// ── Hash router: #/markets, #/trade/VIBE, #/futures/VIBE, #/assets, #/ranks
function parseRoute() {
  const parts = (location.hash.replace(/^#\/?/, "") || "markets").split("/");
  const page = ["markets", "trade", "futures", "assets", "ranks"].includes(parts[0]) ? parts[0] : "markets";
  return { page, symbol: resolveSymbol(parts[1]) };
}
export function go(page, symbol) { location.hash = "/" + page + (symbol ? "/" + symbol : ""); }

export function StoreProvider({ children }) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  const [account, setAccount] = useState(loadAccount);
  const [theme, setTheme] = useState(initialTheme);
  const [route, setRoute] = useState(parseRoute);
  const [lastSymbol, setLastSymbol] = useState(() => resolveSymbol(localStorage.getItem("oddex_last_symbol")) || "VIBE");
  const [news, setNews] = useState([]);          // [{headline, symbol, impact, t}]
  const [feed, setFeed] = useState([]);          // shared trades
  const [board, setBoard] = useState(null);
  const [toasts, setToasts] = useState([]);
  const accountRef = useRef(account);
  accountRef.current = account;

  // Clock: one tick per second for the whole app.
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const on = () => setRoute(parseRoute());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  useEffect(() => {
    if (route.symbol && route.symbol !== lastSymbol) {
      setLastSymbol(route.symbol);
      try { localStorage.setItem("oddex_last_symbol", route.symbol); } catch {}
    }
  }, [route.symbol, lastSymbol]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0e11" : "#ffffff");
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account)); } catch {}
  }, [account]);

  // ── News → shocks ───────────────────────────────────────────────────
  useEffect(() => {
    let dead = false;
    async function load() {
      const live = await R.fetchBackendNews();
      if (live.length) await R.stampNews(live);
      const stamped = await R.fetchMarketNews();
      if (dead) return;
      if (stamped && stamped.length) setNews(stamped);
      else if (live.length) setNews(live.map((n) => ({ ...n, t: null }))); // display only, no shock
    }
    load();
    const iv = setInterval(load, 60000);
    return () => { dead = true; clearInterval(iv); };
  }, []);

  const shocks = useMemo(() => {
    const m = {};
    for (const n of news) if (n.t) (m[n.symbol] ||= []).push({ t: n.t, impact: n.impact });
    return m;
  }, [news]);

  const priceOf = useCallback((sym, t = now) => {
    const a = ASSET_BY_SYMBOL[sym];
    return a ? priceAt(a, t, shocks[sym]) : NaN;
  }, [now, shocks]);

  const tickers = useMemo(() => {
    const out = {};
    for (const a of ASSETS) out[a.symbol] = stats24h(a, now, shocks[a.symbol]);
    return out;
  }, [now, shocks]);

  // ── Shared feed + leaderboard ───────────────────────────────────────
  useEffect(() => {
    let dead = false;
    async function load() { const t = await R.fetchTrades(); if (!dead && t) setFeed(t); }
    load();
    const iv = setInterval(load, 5000);
    return () => { dead = true; clearInterval(iv); };
  }, []);

  const refreshBoard = useCallback(async () => {
    const b = await R.fetchLeaderboard();
    if (b) setBoard(b);
    else setBoard((cur) => cur ?? "error"); // keep old data if we had some
  }, []);
  useEffect(() => { refreshBoard(); const iv = setInterval(refreshBoard, 30000); return () => clearInterval(iv); }, [refreshBoard]);

  const eq = useMemo(() => T.equity(account, (s) => priceOf(s)), [account, priceOf]);
  const eqRef = useRef(eq); eqRef.current = eq;
  useEffect(() => {
    // Only traders who have actually traded appear on the leaderboard.
    const push = () => { if (accountRef.current.history.length > 0) R.pushScore(accountRef.current.name, eqRef.current.total); };
    push();
    const iv = setInterval(push, 30000);
    return () => clearInterval(iv);
  }, [account.name, account.history.length > 0]);

  // ── Toasts ──────────────────────────────────────────────────────────
  const toast = useCallback((msg, kind = "ok") => {
    const id = Math.random();
    setToasts((t) => [...t.slice(-2), { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const localTrade = useCallback((row) => {
    setFeed((f) => [{ ...row, id: "l" + Math.random(), created_at: new Date().toISOString() }, ...f].slice(0, 80));
    R.publishTrade(row);
  }, []);

  // ── Auto TP / SL / liquidation every tick ───────────────────────────
  useEffect(() => {
    const cur = accountRef.current;
    if (!cur.positions.length) return;
    const { state, events } = T.settle(cur, (s) => priceOf(s));
    if (!events.length) return;
    setAccount(state);
    for (const e of events) {
      const label = e.reason === "liq" ? "Liquidated" : e.reason === "tp" ? "Take profit hit" : "Stop loss hit";
      toast(`${label}: ${e.pos.symbol} ${e.pos.side} ${e.pos.lev}x  ${fmtUSD(e.pnl, true)}`, e.pnl >= 0 ? "ok" : "err");
      localTrade({ who: cur.name, side: e.pos.side === "long" ? "sell" : "buy", symbol: e.pos.symbol,
        qty: e.pos.qty, price: e.price, kind: "futures", lev: e.pos.lev });
    }
  }, [now, priceOf, toast, localTrade]);

  // ── Actions ─────────────────────────────────────────────────────────
  const act = useCallback((res, onOk) => {
    if (!res.ok) { toast(res.error, "err"); return false; }
    setAccount(res.state);
    onOk?.(res);
    return true;
  }, [toast]);

  const actions = useMemo(() => ({
    buy(symbol, usd) {
      const p = priceOf(symbol);
      return act(T.spotBuy(accountRef.current, symbol, usd, p), (r) => {
        toast(`Bought ${symbol} @ ${fmtPrice(p)}`);
        localTrade({ who: accountRef.current.name, side: "buy", symbol, qty: r.fill.qty, price: p });
      });
    },
    sell(symbol, qty) {
      const p = priceOf(symbol);
      return act(T.spotSell(accountRef.current, symbol, qty, p), (r) => {
        toast(`Sold ${symbol} @ ${fmtPrice(p)}  ${fmtUSD(r.fill.pnl, true)}`, r.fill.pnl >= 0 ? "ok" : "err");
        localTrade({ who: accountRef.current.name, side: "sell", symbol, qty: r.fill.qty, price: p });
      });
    },
    open(order) {
      const p = priceOf(order.symbol);
      return act(T.openPosition(accountRef.current, order, p), (r) => {
        toast(`Opened ${order.side.toUpperCase()} ${order.symbol} ${r.position.lev}x @ ${fmtPrice(p)}`);
        localTrade({ who: accountRef.current.name, side: order.side === "long" ? "buy" : "sell", symbol: order.symbol,
          qty: r.position.qty, price: p, kind: "futures", lev: r.position.lev });
      });
    },
    close(id) {
      const pos = accountRef.current.positions.find((x) => x.id === id);
      if (!pos) return false;
      const p = priceOf(pos.symbol);
      return act(T.closePosition(accountRef.current, id, p), (r) => {
        toast(`Closed ${pos.symbol} ${pos.side}  ${fmtUSD(r.pnl, true)}`, r.pnl >= 0 ? "ok" : "err");
        localTrade({ who: accountRef.current.name, side: pos.side === "long" ? "sell" : "buy", symbol: pos.symbol,
          qty: pos.qty, price: p, kind: "futures", lev: pos.lev });
      });
    },
    rename(name) {
      const clean = String(name).replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
      if (clean.length < 3) { toast("Name needs 3 to 16 letters or numbers", "err"); return false; }
      setAccount((a) => ({ ...a, name: clean }));
      toast("Name updated");
      return true;
    },
    reset() {
      setAccount((a) => T.newState(a.name));
      toast("Account reset to $10,000");
    },
  }), [act, priceOf, toast, localTrade]);

  const value = {
    now, theme, toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    route, lastSymbol, account, equity: eq, actions, priceOf, tickers, shocks, news, feed, board, refreshBoard, toasts,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
