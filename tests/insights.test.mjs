import { test } from "node:test";
import assert from "node:assert/strict";
import { ASSETS } from "../src/v2/lib/assets.js";
import { marketMood, sectorStats, allocation, traderStats, newsMarkers } from "../src/v2/lib/insights.js";
import { newState, spotBuy, openPosition } from "../src/v2/lib/trading.js";

const tick = (chg) => Object.fromEntries(ASSETS.map((a) => [a.symbol, { change: typeof chg === "function" ? chg(a) : chg }]));

test("mood tracks the market", () => {
  assert.equal(marketMood(tick(-15)).label, "Fear");
  assert.equal(marketMood(tick(15)).label, "Euphoric");
  const flat = marketMood(tick((a) => (a.id % 2 ? 1 : -1)));
  assert.equal(flat.label, "Neutral");
  for (const c of [-100, -3, 0, 3, 100]) {
    const m = marketMood(tick(c));
    assert.ok(m.score >= 0 && m.score <= 100);
  }
});

test("sector stats average their members", () => {
  const s = sectorStats(tick((a) => (a.sector === "Social" ? 4 : -2)));
  assert.equal(s.find((x) => x.id === "Social").change, 4);
  assert.equal(s.find((x) => x.id === "Lifestyle").change, -2);
  assert.equal(s.reduce((m, x) => m + x.count, 0), ASSETS.length);
});

test("allocation sums to 100 and includes cash and futures", () => {
  let s = newState("T");
  s = spotBuy(s, "VIBE", 2000, 100).state;
  s = openPosition(s, { symbol: "CELEB", side: "long", margin: 1000, lev: 5 }, 50).state;
  const parts = allocation(s, (sym) => ({ VIBE: 110, CELEB: 50 })[sym]);
  const sum = parts.reduce((m, p) => m + p.pct, 0);
  assert.ok(Math.abs(sum - 100) < 1e-9);
  assert.deepEqual(parts.map((p) => p.label).sort(), ["Cash", "Futures", "VIBE"]);
  assert.equal(parts[parts.length - 1].label, "Cash");
});

test("trader stats", () => {
  const st = traderStats([{ pnl: 10 }, { pnl: -5 }, {}, { pnl: 3, action: "liq" }]);
  assert.equal(st.trades, 4);
  assert.equal(st.closed, 3);
  assert.ok(Math.abs(st.winRate - 66.666) < 0.01);
  assert.equal(st.realized, 8);
  assert.equal(st.best.pnl, 10);
  assert.equal(st.liquidations, 1);
  assert.equal(traderStats([]).winRate, null);
});

test("news markers bucket by candle and respect range", () => {
  const news = [
    { t: 1000, impact: 10, headline: "a" }, { t: 1050, impact: -4, headline: "b" },
    { t: 2000, impact: -8, headline: "c" }, { t: 99999, impact: 5, headline: "late" }, { t: null, impact: 1 },
  ];
  const m = newsMarkers(news, 900, 0, 5000);
  assert.equal(m.length, 2);
  assert.equal(m[0].time, 900);
  assert.equal(m[0].items.length, 2);
  assert.equal(m[0].up, true);
  assert.equal(m[1].time, 1800);
  assert.equal(m[1].up, false);
});
