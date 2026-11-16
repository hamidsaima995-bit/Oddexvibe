import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newState, spotBuy, placeSpotLimit, placeFuturesLimit, cancelOrder, settle, equity,
  START_CASH, SPOT_FEE, FUT_FEE,
} from "../src/v2/lib/trading.js";

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);

test("limit buy reserves cash, fills at limit, equity unchanged on place", () => {
  let s = newState("T");
  const r = placeSpotLimit(s, { symbol: "X", side: "buy", price: 9, usd: 900 }, 10);
  assert.ok(r.ok, r.error);
  s = r.state;
  near(s.cash, START_CASH - 900 * (1 + SPOT_FEE), "cash reserved");
  near(equity(s, () => 10).total, START_CASH, "equity on place");
  // Not yet: price above limit
  let st = settle(s, () => 9.5);
  assert.equal(st.events.length, 0);
  st = settle(s, () => 8.7);
  assert.equal(st.events.length, 1);
  s = st.state;
  assert.equal(s.orders.length, 0);
  near(s.spot.X.qty, 100, "filled at limit 9");
  near(s.cash, START_CASH - 900 * (1 + SPOT_FEE), "cash after fill");
  assert.equal(s.history[0].via, "limit");
});

test("limit sell locks units and pays at limit", () => {
  let s = spotBuy(newState("T"), "X", 1000, 10).state; // 100 X, cost 1001
  s = placeSpotLimit(s, { symbol: "X", side: "sell", price: 12, qty: 40 }, 10).state;
  near(s.spot.X.qty, 60, "locked");
  near(equity(s, () => 10).total, START_CASH - 1, "equity counts locked units");
  s = settle(s, () => 12.5).state;
  near(s.spot.X.qty, 60, "rest kept");
  near(s.cash, START_CASH - 1001 + 480 * (1 - SPOT_FEE), "proceeds at 12");
  near(s.spot.X.cost / s.spot.X.qty, 10.01, "avg cost unchanged");
});

test("cancel returns everything exactly", () => {
  const s0 = spotBuy(newState("T"), "X", 1000, 10).state;
  for (const order of [
    { kind: "spot", o: { symbol: "X", side: "buy", price: 9, usd: 500 } },
    { kind: "spot", o: { symbol: "X", side: "sell", price: 11, qty: 100 } },
    { kind: "fut", o: { symbol: "X", side: "short", price: 11, margin: 300, lev: 10 } },
  ]) {
    const placed = order.kind === "spot" ? placeSpotLimit(s0, order.o, 10) : placeFuturesLimit(s0, order.o, 10);
    assert.ok(placed.ok, placed.error);
    const back = cancelOrder(placed.state, placed.order.id).state;
    near(back.cash, s0.cash, "cash");
    near(back.spot.X.qty, s0.spot.X.qty, "qty");
    near(back.spot.X.cost, s0.spot.X.cost, "cost");
    assert.equal(back.orders.length, 0);
  }
});

test("futures limit opens a position at the limit price with liq from that price", () => {
  let s = placeFuturesLimit(newState("T"), { symbol: "X", side: "long", price: 95, margin: 100, lev: 10, sl: 90 }, 100).state;
  near(s.cash, START_CASH - 100 - 1000 * FUT_FEE, "reserved margin + fee");
  s = settle(s, () => 94.9).state;
  assert.equal(s.positions.length, 1);
  const p = s.positions[0];
  near(p.entry, 95, "entry");
  near(p.liq, 95 * (1 - 0.1 + 0.005), "liq");
  assert.equal(p.sl, 90);
  near(s.cash, START_CASH - 100 - 1000 * FUT_FEE, "no double charge");
});

test("an order can fill and then hit its stop in later ticks", () => {
  let s = placeFuturesLimit(newState("T"), { symbol: "X", side: "short", price: 105, margin: 100, lev: 5, sl: 110 }, 100).state;
  s = settle(s, () => 105.2).state;
  assert.equal(s.positions.length, 1);
  const r = settle(s, () => 111);
  assert.equal(r.events[0].reason, "sl");
  assert.equal(r.state.positions.length, 0);
});

test("limit orders reject marketable or invalid prices", () => {
  const s = spotBuy(newState("T"), "X", 1000, 10).state;
  assert.equal(placeSpotLimit(s, { symbol: "X", side: "buy", price: 10, usd: 100 }, 10).ok, false);
  assert.equal(placeSpotLimit(s, { symbol: "X", side: "buy", price: 11, usd: 100 }, 10).ok, false);
  assert.equal(placeSpotLimit(s, { symbol: "X", side: "sell", price: 9, qty: 1 }, 10).ok, false);
  assert.equal(placeSpotLimit(s, { symbol: "X", side: "sell", price: 12, qty: 1000 }, 10).ok, false);
  assert.equal(placeSpotLimit(s, { symbol: "X", side: "buy", price: 0, usd: 100 }, 10).ok, false);
  assert.equal(placeSpotLimit(s, { symbol: "X", side: "buy", price: 9, usd: START_CASH }, 10).ok, false);
  assert.equal(placeFuturesLimit(s, { symbol: "X", side: "long", price: 11, margin: 10, lev: 5 }, 10).ok, false);
  assert.equal(placeFuturesLimit(s, { symbol: "X", side: "short", price: 9, margin: 10, lev: 5 }, 10).ok, false);
  assert.equal(placeFuturesLimit(s, { symbol: "X", side: "long", price: 9, margin: 10, lev: 5, tp: 8 }, 10).ok, false);
});

test("reserved cash can't be spent twice", () => {
  let s = placeSpotLimit(newState("T"), { symbol: "X", side: "buy", price: 9, usd: 9000 }, 10).state;
  assert.equal(placeSpotLimit(s, { symbol: "Y", side: "buy", price: 9, usd: 2000 }, 10).ok, false);
  assert.equal(spotBuy(s, "Y", 2000, 10).ok, false);
});
