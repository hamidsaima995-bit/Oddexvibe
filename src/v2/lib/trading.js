// ODDEX VIBE v2 trading logic. Pure functions: (state, input, price) -> result.
// No React, no network, so every rule can be unit tested.

export const START_CASH = 10000;
export const SPOT_FEE = 0.001;      // 0.10% per spot trade
export const FUT_FEE = 0.0004;      // 0.04% of notional on open and on close
export const MMR = 0.005;           // maintenance margin rate (0.5%)
export const MAX_LEV = 50;
export const MIN_ORDER = 1;         // minimum order value in USD

export function newState(name) {
  return { v: 2, name, cash: START_CASH, spot: {}, positions: [], orders: [], history: [], nextId: 1, createdAt: Date.now() };
}

const r2 = (n) => Math.round(n * 100) / 100;
const fail = (error) => ({ ok: false, error });

function pushHistory(state, item) {
  return [{ ...item, id: state.nextId, at: Date.now() }, ...state.history].slice(0, 200);
}

// ── Spot ────────────────────────────────────────────────────────────────
// Buy with a USD amount (fee is taken on top). qty can be fractional.
export function spotBuy(state, symbol, usd, price) {
  usd = Number(usd);
  if (!(usd >= MIN_ORDER)) return fail(`Minimum order is $${MIN_ORDER}`);
  if (!(price > 0)) return fail("No price");
  const fee = usd * SPOT_FEE;
  if (usd + fee > state.cash + 1e-9) return fail("Not enough balance");
  const qty = usd / price;
  const cur = state.spot[symbol] || { qty: 0, cost: 0 };
  const next = {
    ...state,
    cash: state.cash - usd - fee,
    spot: { ...state.spot, [symbol]: { qty: cur.qty + qty, cost: cur.cost + usd + fee } },
    nextId: state.nextId + 1,
  };
  next.history = pushHistory(state, { type: "spot", side: "buy", symbol, qty, price, value: usd, fee });
  return { ok: true, state: next, fill: { side: "buy", qty, price, value: usd, fee } };
}

// Sell a quantity of units.
export function spotSell(state, symbol, qty, price) {
  qty = Number(qty);
  const cur = state.spot[symbol];
  if (!cur || cur.qty <= 0) return fail(`You don't hold ${symbol}`);
  if (!(qty > 0)) return fail("Enter an amount");
  if (qty > cur.qty * (1 + 1e-9)) return fail("Not enough " + symbol);
  if (qty * price < MIN_ORDER && qty < cur.qty * (1 - 1e-9)) return fail(`Minimum order is $${MIN_ORDER}`);
  qty = Math.min(qty, cur.qty);
  const gross = qty * price;
  const fee = gross * SPOT_FEE;
  const remainingQty = cur.qty - qty;
  const spot = { ...state.spot };
  if (remainingQty <= cur.qty * 1e-9) delete spot[symbol];
  else spot[symbol] = { qty: remainingQty, cost: cur.cost * (remainingQty / cur.qty) };
  const avg = cur.cost / cur.qty;
  const pnl = gross - fee - avg * qty;
  const next = { ...state, cash: state.cash + gross - fee, spot, nextId: state.nextId + 1 };
  next.history = pushHistory(state, { type: "spot", side: "sell", symbol, qty, price, value: gross, fee, pnl });
  return { ok: true, state: next, fill: { side: "sell", qty, price, value: gross, fee, pnl } };
}

// ── Futures (isolated margin, USD-margined) ─────────────────────────────
export function liqPrice(side, entry, lev) {
  return side === "long"
    ? entry * (1 - 1 / lev + MMR)
    : entry * (1 + 1 / lev - MMR);
}

export function positionPnl(pos, mark) {
  const diff = pos.side === "long" ? mark - pos.entry : pos.entry - mark;
  const pnl = diff * pos.qty;
  return { pnl, roe: (pnl / pos.margin) * 100, notional: pos.qty * mark };
}

export function openPosition(state, { symbol, side, margin, lev, tp, sl }, price) {
  margin = Number(margin);
  lev = Math.round(Number(lev));
  if (side !== "long" && side !== "short") return fail("Pick Long or Short");
  if (!(lev >= 1 && lev <= MAX_LEV)) return fail(`Leverage must be 1x to ${MAX_LEV}x`);
  if (!(margin >= MIN_ORDER)) return fail(`Minimum margin is $${MIN_ORDER}`);
  const notional = margin * lev;
  const fee = notional * FUT_FEE;
  if (margin + fee > state.cash + 1e-9) return fail("Not enough balance");
  const liq = liqPrice(side, price, lev);
  tp = tp ? Number(tp) : null;
  sl = sl ? Number(sl) : null;
  if (tp != null) {
    if (!(tp > 0)) return fail("Invalid take profit");
    if (side === "long" ? tp <= price : tp >= price) return fail(`Take profit must be ${side === "long" ? "above" : "below"} entry`);
  }
  if (sl != null) {
    if (!(sl > 0)) return fail("Invalid stop loss");
    if (side === "long" ? sl >= price : sl <= price) return fail(`Stop loss must be ${side === "long" ? "below" : "above"} entry`);
    if (side === "long" ? sl <= liq : sl >= liq) return fail("Stop loss is past the liquidation price");
  }
  const pos = {
    id: state.nextId, symbol, side, lev, margin, qty: notional / price, entry: price, liq, tp, sl, fee, openedAt: Date.now(),
  };
  const next = { ...state, cash: state.cash - margin - fee, positions: [pos, ...state.positions], nextId: state.nextId + 1 };
  next.history = pushHistory(state, { type: "futures", side, action: "open", symbol, qty: pos.qty, price, lev, margin, fee });
  return { ok: true, state: next, position: pos };
}

// Close at mark. reason: "manual" | "tp" | "sl" | "liq"
export function closePosition(state, id, mark, reason = "manual") {
  const pos = state.positions.find((p) => p.id === id);
  if (!pos) return fail("Position not found");
  let pnl, fee, back;
  if (reason === "liq") {
    pnl = -pos.margin;
    fee = 0;
    back = 0;
  } else {
    ({ pnl } = positionPnl(pos, mark));
    fee = pos.qty * mark * FUT_FEE;
    back = Math.max(0, pos.margin + pnl - fee);
  }
  const next = { ...state, cash: state.cash + back, positions: state.positions.filter((p) => p.id !== id), nextId: state.nextId + 1 };
  next.history = pushHistory(state, {
    type: "futures", side: pos.side, action: reason === "manual" ? "close" : reason, symbol: pos.symbol,
    qty: pos.qty, price: mark, entry: pos.entry, lev: pos.lev, margin: pos.margin, fee, pnl: back - pos.margin,
  });
  return { ok: true, state: next, pnl: back - pos.margin, reason };
}

// What should happen to this position at this mark? null | "liq" | "tp" | "sl"
export function triggerFor(pos, mark) {
  if (pos.side === "long") {
    if (mark <= pos.liq) return "liq";
    if (pos.sl != null && mark <= pos.sl) return "sl";
    if (pos.tp != null && mark >= pos.tp) return "tp";
  } else {
    if (mark >= pos.liq) return "liq";
    if (pos.sl != null && mark >= pos.sl) return "sl";
    if (pos.tp != null && mark <= pos.tp) return "tp";
  }
  return null;
}

// Run all triggers against current prices. priceOf(symbol) -> number.
// Limit orders fill first, then TP / SL / liquidation on open positions.
export function settle(state, priceOf) {
  let s = state;
  const events = [];
  for (const o of state.orders || []) {
    const mark = priceOf(o.symbol);
    if (!(mark > 0) || !orderTriggered(o, mark)) continue;
    const res = fillOrder(s, o.id);
    if (res.ok) { s = res.state; events.push({ order: o, reason: "fill", price: o.price }); }
  }
  for (const pos of s.positions) {
    const mark = priceOf(pos.symbol);
    if (!(mark > 0)) continue;
    const why = triggerFor(pos, mark);
    if (!why) continue;
    // Fill TP/SL at the trigger level (like a stop order), liq at mark.
    const fillAt = why === "tp" ? pos.tp : why === "sl" ? pos.sl : mark;
    const res = closePosition(s, pos.id, fillAt, why);
    if (res.ok) { s = res.state; events.push({ pos, reason: why, pnl: res.pnl, price: fillAt }); }
  }
  return { state: s, events };
}

// ── Account totals ──────────────────────────────────────────────────────
export function equity(state, priceOf) {
  let spotValue = 0;
  for (const [sym, h] of Object.entries(state.spot)) spotValue += h.qty * (priceOf(sym) || 0);
  let futValue = 0, upnl = 0;
  for (const p of state.positions) {
    const { pnl } = positionPnl(p, priceOf(p.symbol) || p.entry);
    upnl += pnl;
    futValue += Math.max(0, p.margin + pnl);
  }
  // Funds parked in open limit orders still belong to the trader.
  let reserved = 0;
  for (const o of state.orders || []) {
    reserved += o.kind === "spot" && o.side === "sell" ? o.qty * (priceOf(o.symbol) || o.price) : o.reserved;
  }
  return { cash: state.cash, spotValue, futValue, upnl, reserved, total: state.cash + spotValue + futValue + reserved };
}

export { r2 };

// ── Limit orders ────────────────────────────────────────────────────────
// Funds are reserved when the order is placed (cash for buys and futures,
// units for spot sells) and released on fill or cancel, like a real exchange.
// A limit buy / long must sit below the market, a sell / short above it.
// Orders fill at their limit price once the market reaches it.

export function orderTriggered(o, mark) {
  const buying = o.side === "buy" || o.side === "long";
  return buying ? mark <= o.price : mark >= o.price;
}

function checkSide(side, price, market) {
  const buying = side === "buy" || side === "long";
  if (buying && !(price < market)) return `Limit ${side} price must be below the current price. Use Market to ${side === "buy" ? "buy" : "go long"} now.`;
  if (!buying && !(price > market)) return `Limit ${side} price must be above the current price. Use Market to ${side === "sell" ? "sell" : "go short"} now.`;
  return null;
}

export function placeSpotLimit(state, { symbol, side, price, usd, qty }, market) {
  price = Number(price);
  if (!(price > 0)) return fail("Enter a limit price");
  if (side !== "buy" && side !== "sell") return fail("Pick Buy or Sell");
  const sideErr = checkSide(side, price, market);
  if (sideErr) return fail(sideErr);
  const id = state.nextId;
  if (side === "buy") {
    // Validate exactly like a market buy at the limit price.
    const test = spotBuy(state, symbol, usd, price);
    if (!test.ok) return test;
    const reserved = Number(usd) * (1 + SPOT_FEE);
    const order = { id, kind: "spot", symbol, side, price, usd: Number(usd), reserved, createdAt: Date.now() };
    return { ok: true, order, state: { ...state, cash: state.cash - reserved, orders: [order, ...(state.orders || [])], nextId: id + 1 } };
  }
  const test = spotSell(state, symbol, qty, price);
  if (!test.ok) return test;
  const cur = state.spot[symbol];
  const q = Math.min(Number(qty), cur.qty);
  const cost = cur.cost * (q / cur.qty);
  const spot = { ...state.spot };
  const left = cur.qty - q;
  if (left <= cur.qty * 1e-9) delete spot[symbol];
  else spot[symbol] = { qty: left, cost: cur.cost - cost };
  const order = { id, kind: "spot", symbol, side, price, qty: q, cost, reserved: 0, createdAt: Date.now() };
  return { ok: true, order, state: { ...state, spot, orders: [order, ...(state.orders || [])], nextId: id + 1 } };
}

export function placeFuturesLimit(state, { symbol, side, price, margin, lev, tp, sl }, market) {
  price = Number(price);
  if (!(price > 0)) return fail("Enter a limit price");
  if (side !== "long" && side !== "short") return fail("Pick Long or Short");
  const sideErr = checkSide(side, price, market);
  if (sideErr) return fail(sideErr);
  // Validate exactly like opening at the limit price.
  const test = openPosition(state, { symbol, side, margin, lev, tp, sl }, price);
  if (!test.ok) return test;
  const p = test.position;
  const id = state.nextId;
  const reserved = p.margin + p.fee;
  const order = { id, kind: "futures", symbol, side, price, margin: p.margin, lev: p.lev, tp: p.tp, sl: p.sl, reserved, createdAt: Date.now() };
  return { ok: true, order, state: { ...state, cash: state.cash - reserved, orders: [order, ...(state.orders || [])], nextId: id + 1 } };
}

// Put an order's reserved funds back into the account.
function release(state, o) {
  const orders = (state.orders || []).filter((x) => x.id !== o.id);
  if (o.kind === "spot" && o.side === "sell") {
    const cur = state.spot[o.symbol] || { qty: 0, cost: 0 };
    return { ...state, orders, spot: { ...state.spot, [o.symbol]: { qty: cur.qty + o.qty, cost: cur.cost + o.cost } } };
  }
  return { ...state, orders, cash: state.cash + o.reserved };
}

export function cancelOrder(state, id) {
  const o = (state.orders || []).find((x) => x.id === id);
  if (!o) return fail("Order not found");
  return { ok: true, state: release(state, o), order: o };
}

export function fillOrder(state, id) {
  const o = (state.orders || []).find((x) => x.id === id);
  if (!o) return fail("Order not found");
  const s = release(state, o);
  let res;
  if (o.kind === "spot") res = o.side === "buy" ? spotBuy(s, o.symbol, o.usd, o.price) : spotSell(s, o.symbol, o.qty, o.price);
  else res = openPosition(s, { symbol: o.symbol, side: o.side, margin: o.margin, lev: o.lev, tp: o.tp, sl: o.sl }, o.price);
  if (!res.ok) return res;
  const history = res.state.history.slice();
  history[0] = { ...history[0], via: "limit" };
  return { ...res, state: { ...res.state, history }, order: o };
}
