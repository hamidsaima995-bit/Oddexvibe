import { test } from "node:test";
import assert from "node:assert/strict";
import { ASSETS, SECTORS, LEGACY_SYMBOL, resolveSymbol } from "../src/v2/lib/assets.js";
import { priceAt, candles, stats24h, TIMEFRAMES } from "../src/v2/lib/price.js";
import {
  newState, spotBuy, spotSell, openPosition, closePosition, settle, liqPrice,
  positionPnl, equity, SPOT_FEE, FUT_FEE, START_CASH,
} from "../src/v2/lib/trading.js";

const NOW = 1_794_800_000;
const A = (s) => ASSETS.find((a) => a.symbol === s);

test("price is deterministic and positive for every asset", () => {
  for (const a of ASSETS) {
    for (const t of [NOW, NOW + 0.5, NOW - 86400 * 40]) {
      const p1 = priceAt(a, t), p2 = priceAt(a, t);
      assert.equal(p1, p2);
      assert.ok(p1 > 0 && Number.isFinite(p1), `${a.symbol} ${p1}`);
    }
  }
});

test("prices stay in a sane band around base price", () => {
  for (const a of ASSETS) {
    let lo = Infinity, hi = 0;
    for (let i = 0; i < 2000; i++) {
      const p = priceAt(a, NOW - i * 3600 * 7);
      lo = Math.min(lo, p); hi = Math.max(hi, p);
    }
    assert.ok(lo > a.basePrice * 0.05, `${a.symbol} low ${lo}`);
    assert.ok(hi < a.basePrice * 20, `${a.symbol} high ${hi}`);
  }
});

test("price moves continuously (no huge 1s jumps)", () => {
  const a = A("VIRAL"); // most volatile
  for (let i = 0; i < 5000; i++) {
    const t = NOW + i;
    const r = priceAt(a, t + 1) / priceAt(a, t);
    assert.ok(r > 0.97 && r < 1.03, `jump ${r}`);
  }
});

test("candles are valid OHLC and contiguous for all timeframes", () => {
  const a = A("VIBE");
  for (const tf of TIMEFRAMES) {
    const cs = candles(a, tf.sec, 120, NOW);
    assert.equal(cs.length, 120);
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      assert.ok(c.high >= Math.max(c.open, c.close) - 1e-9);
      assert.ok(c.low <= Math.min(c.open, c.close) + 1e-9);
      assert.ok(c.volume > 0);
      if (i > 0) {
        assert.equal(c.time - cs[i - 1].time, tf.sec);
        assert.ok(Math.abs(c.open - cs[i - 1].close) / c.open < 1e-9, "open = prev close");
      }
    }
    const lastC = cs[cs.length - 1];
    assert.ok(Math.abs(lastC.close - priceAt(a, NOW)) < 1e-9, "last close = live price");
  }
});

test("news shock moves price only after the headline time", () => {
  const a = A("CELEB");
  const shocks = [{ t: NOW, impact: 30 }];
  assert.equal(priceAt(a, NOW - 10, shocks), priceAt(a, NOW - 10));
  const after = priceAt(a, NOW + 3600, shocks) / priceAt(a, NOW + 3600);
  assert.ok(after > 1.1 && after < 1.2, `shock ${after}`);
  const day = priceAt(a, NOW + 3 * 86400, shocks) / priceAt(a, NOW + 3 * 86400);
  assert.ok(day > 1.04 && day < after, `fade ${day}`);
});

test("24h stats are consistent", () => {
  const s = stats24h(A("FANT"), NOW);
  assert.ok(s.high >= s.price && s.low <= s.price);
  assert.ok(Math.abs(s.change - (s.price / s.open - 1) * 100) < 1e-9);
});

test("spot buy then sell round trip charges fees exactly", () => {
  let s = newState("T");
  const b = spotBuy(s, "VIBE", 1000, 50);
  assert.ok(b.ok);
  s = b.state;
  assert.equal(s.spot.VIBE.qty, 20);
  assert.ok(Math.abs(s.cash - (START_CASH - 1000 - 1000 * SPOT_FEE)) < 1e-9);
  const sl = spotSell(s, "VIBE", 20, 60);
  assert.ok(sl.ok);
  s = sl.state;
  assert.equal(s.spot.VIBE, undefined);
  const expected = START_CASH - 1001 + 1200 - 1200 * SPOT_FEE;
  assert.ok(Math.abs(s.cash - expected) < 1e-9);
  assert.ok(Math.abs(sl.fill.pnl - (1200 - 1.2 - 1001)) < 1e-9);
});

test("spot rejects bad orders", () => {
  const s = newState("T");
  assert.equal(spotBuy(s, "VIBE", 0.5, 10).ok, false);
  assert.equal(spotBuy(s, "VIBE", START_CASH, 10).ok, false); // fee pushes over
  assert.equal(spotSell(s, "VIBE", 1, 10).ok, false);
  const b = spotBuy(s, "VIBE", 100, 10).state;
  assert.equal(spotSell(b, "VIBE", 11, 10).ok, false);
  assert.equal(spotSell(b, "VIBE", -1, 10).ok, false);
});

test("partial spot sell keeps average cost", () => {
  let s = spotBuy(newState("T"), "X", 1000, 10).state;
  s = spotSell(s, "X", 40, 12).state;
  assert.ok(Math.abs(s.spot.X.qty - 60) < 1e-9);
  assert.ok(Math.abs(s.spot.X.cost / s.spot.X.qty - 1001 / 100) < 1e-9);
});

test("liquidation price formula", () => {
  assert.ok(Math.abs(liqPrice("long", 100, 10) - 90.5) < 1e-9);
  assert.ok(Math.abs(liqPrice("short", 100, 10) - 109.5) < 1e-9);
  assert.ok(liqPrice("long", 100, 1) > 0);
});

test("long position profit and close math", () => {
  let s = newState("T");
  const o = openPosition(s, { symbol: "VIBE", side: "long", margin: 100, lev: 10 }, 100);
  assert.ok(o.ok, o.error);
  s = o.state;
  const pos = s.positions[0];
  assert.ok(Math.abs(pos.qty - 10) < 1e-9);
  assert.ok(Math.abs(s.cash - (START_CASH - 100 - 1000 * FUT_FEE)) < 1e-9);
  const { pnl, roe } = positionPnl(pos, 105);
  assert.ok(Math.abs(pnl - 50) < 1e-9 && Math.abs(roe - 50) < 1e-9);
  const c = closePosition(s, pos.id, 105);
  const fee = 1050 * FUT_FEE;
  assert.ok(Math.abs(c.state.cash - (START_CASH - 100 - 0.4 + 100 + 50 - fee)) < 1e-9);
  assert.equal(c.state.positions.length, 0);
});

test("short position loses when price rises", () => {
  const s = openPosition(newState("T"), { symbol: "X", side: "short", margin: 200, lev: 5 }, 50).state;
  const { pnl } = positionPnl(s.positions[0], 55);
  assert.ok(Math.abs(pnl - -100) < 1e-9);
});

test("settle liquidates, hits TP and SL correctly", () => {
  let s = newState("T");
  s = openPosition(s, { symbol: "L", side: "long", margin: 100, lev: 20 }, 100).state;      // liq 95.5
  s = openPosition(s, { symbol: "T", side: "short", margin: 100, lev: 2, tp: 80 }, 100).state;
  s = openPosition(s, { symbol: "S", side: "long", margin: 100, lev: 2, sl: 90 }, 100).state;
  const cashBefore = s.cash;
  const r = settle(s, (sym) => ({ L: 95, T: 79, S: 89 })[sym]);
  assert.equal(r.events.length, 3);
  assert.equal(r.state.positions.length, 0);
  const by = Object.fromEntries(r.events.map((e) => [e.pos.symbol, e]));
  assert.equal(by.L.reason, "liq");
  assert.equal(by.L.pnl, -100);
  assert.equal(by.T.reason, "tp");
  assert.ok(by.T.pnl > 0);
  assert.equal(by.S.reason, "sl");
  assert.ok(by.S.pnl < 0 && by.S.pnl > -100);
  assert.ok(r.state.cash > cashBefore);
  assert.ok(r.state.cash + 1e-9 < START_CASH + 200); // can't print money
});

test("futures input validation", () => {
  const s = newState("T");
  assert.equal(openPosition(s, { symbol: "X", side: "up", margin: 10, lev: 5 }, 10).ok, false);
  assert.equal(openPosition(s, { symbol: "X", side: "long", margin: 10, lev: 51 }, 10).ok, false);
  assert.equal(openPosition(s, { symbol: "X", side: "long", margin: START_CASH, lev: 5 }, 10).ok, false);
  assert.equal(openPosition(s, { symbol: "X", side: "long", margin: 10, lev: 5, tp: 9 }, 10).ok, false);
  assert.equal(openPosition(s, { symbol: "X", side: "long", margin: 10, lev: 5, sl: 11 }, 10).ok, false);
  assert.equal(openPosition(s, { symbol: "X", side: "long", margin: 10, lev: 10, sl: 8 }, 10).ok, false); // sl below liq 9.05
  assert.equal(openPosition(s, { symbol: "X", side: "short", margin: 10, lev: 5, tp: 11 }, 10).ok, false);
});

test("equity adds up", () => {
  let s = newState("T");
  s = spotBuy(s, "A", 1000, 10).state;
  s = openPosition(s, { symbol: "B", side: "long", margin: 500, lev: 4 }, 20).state;
  const e = equity(s, (sym) => ({ A: 11, B: 21 })[sym]);
  assert.ok(Math.abs(e.spotValue - 1100) < 1e-9);
  assert.ok(Math.abs(e.upnl - 100) < 1e-9);
  assert.ok(Math.abs(e.total - (s.cash + 1100 + 600)) < 1e-9);
});

test("renamed markets keep exactly the same price history", () => {
  for (const a of ASSETS) {
    const legacy = { symbol: a.seed, basePrice: a.basePrice, volatility: a.volatility };
    for (const t of [NOW, NOW - 86400 * 3, NOW + 123.5]) assert.equal(priceAt(a, t), priceAt(legacy, t), a.symbol);
  }
});

test("catalog is clean: unique tickers, known sectors, every old ticker maps", () => {
  const syms = ASSETS.map((a) => a.symbol);
  assert.equal(new Set(syms).size, ASSETS.length);
  const sectors = new Set(SECTORS.map((s) => s.id));
  for (const a of ASSETS) {
    assert.ok(sectors.has(a.sector), a.symbol);
    assert.ok(/^[A-Z]{2,5}$/.test(a.symbol), a.symbol);
    assert.equal(a.emoji, undefined);
  }
  for (const old of ["CRNG", "DRAM", "GHOST", "TABS", "EXNRG", "DELV", "MNDY", "BATT", "FOMO", "RDBR", "VIBE"]) {
    assert.ok(resolveSymbol(old), old);
  }
  assert.equal(resolveSymbol("crng"), "VIRAL");
  assert.equal(resolveSymbol("VIRAL"), "VIRAL");
  assert.equal(resolveSymbol("NOPE"), null);
  assert.equal(Object.keys(LEGACY_SYMBOL).length, ASSETS.length);
});
