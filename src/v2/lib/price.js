// ODDEX VIBE v2 price engine.
//
// Every price is a pure function of (asset, time, news shocks). Two phones
// asking for VIBE at the same second get the exact same number, and the
// chart history is identical for everyone. That is what makes it feel like
// one shared market instead of a private random-number toy.
//
// How it works: log(price) = sum of smooth value-noise "octaves" (weekly
// swings down to 5-second ticks), scaled by the asset's volatility, plus
// news shocks that jump the price when a headline lands and partly fade.

const DAY = 86400;

// Octaves: [period in seconds, weight]. Weight is multiplied by
// dailyVol * sqrt(period / DAY) so long periods move more, like real markets.
const OCTAVES = [
  [30 * DAY, 0.55],
  [7 * DAY, 0.85],
  [2 * DAY, 0.85],
  [DAY / 2, 0.8],
  [3 * 3600, 0.75],
  [3600, 0.7],
  [900, 0.65],
  [240, 0.6],
  [60, 0.55],
  [15, 0.5],
  [5, 0.45],
];

// FNV-1a string hash -> 32-bit seed
export function seedOf(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Integer hash of (seed, i) -> [0, 1)
function hash01(seed, i) {
  let h = (seed ^ Math.imul(i | 0, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

// Smooth value noise in [-1, 1]
function noise(seed, x) {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash01(seed, i) * 2 - 1;
  const b = hash01(seed, i + 1) * 2 - 1;
  const u = f * f * (3 - 2 * f);
  return a + (b - a) * u;
}

export function dailyVol(asset) {
  return Math.max(0.01, asset.volatility * 1.6);
}

// News shock multiplier (log space). A shock ramps in over ~8 minutes, then
// 40% of it stays and 60% fades out over roughly a day.
const SHOCK_SCALE = 0.5;
const RAMP_SEC = 480;
const FADE_SEC = 18 * 3600;
function shockLog(shocks, t) {
  if (!shocks || shocks.length === 0) return 0;
  let s = 0;
  for (const sh of shocks) {
    const dt = t - sh.t;
    if (dt <= 0) continue;
    const mag = Math.log(1 + Math.max(-0.9, (sh.impact / 100) * SHOCK_SCALE));
    const r = Math.min(1, dt / RAMP_SEC);
    const ramp = r * r * (3 - 2 * r);
    const keep = 0.4 + 0.6 * Math.exp(-dt / FADE_SEC);
    s += mag * ramp * keep;
  }
  return s;
}

const seedCache = new Map();
function seedFor(symbol) {
  let s = seedCache.get(symbol);
  if (s === undefined) { s = seedOf("oddex:" + symbol); seedCache.set(symbol, s); }
  return s;
}

// Price of an asset at unix time t (seconds, may be fractional).
export function priceAt(asset, t, shocks) {
  const seed = seedFor(asset.symbol);
  const dv = dailyVol(asset);
  let lp = 0;
  for (let k = 0; k < OCTAVES.length; k++) {
    const [period, w] = OCTAVES[k];
    lp += noise((seed + k * 7919) >>> 0, t / period) * dv * Math.sqrt(period / DAY) * w;
  }
  lp += shockLog(shocks, t);
  return asset.basePrice * Math.exp(lp);
}

export const TIMEFRAMES = [
  { id: "1m", sec: 60 },
  { id: "5m", sec: 300 },
  { id: "15m", sec: 900 },
  { id: "1h", sec: 3600 },
  { id: "4h", sec: 4 * 3600 },
  { id: "1D", sec: DAY },
  { id: "1W", sec: 7 * DAY },
];

// Base trading volume (units) parsed from labels like "2.1M", "450K", "3".
export function baseVolume(asset) {
  const m = String(asset.vol || "1").match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return 1000;
  const n = parseFloat(m[1]);
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] || 1;
  return Math.max(1, n * mult);
}

// One OHLCV candle covering [start, start + sec).
export function candleAt(asset, start, sec, shocks, untilT) {
  const end = untilT != null ? Math.min(start + sec, untilT) : start + sec;
  const N = 12;
  const open = priceAt(asset, start, shocks);
  let high = open, low = open, close = open;
  for (let i = 1; i <= N; i++) {
    const t = start + ((end - start) * i) / N;
    const p = priceAt(asset, t, shocks);
    if (p > high) high = p;
    if (p < low) low = p;
    close = p;
  }
  const seed = seedFor(asset.symbol);
  const move = Math.abs(close - open) / open;
  const jitter = 0.55 + hash01(seed ^ 0x5bd1e995, Math.floor(start / sec)) * 0.9;
  const volume = (baseVolume(asset) * sec / DAY) * jitter * (1 + move * 40);
  return { time: start, open, high, low, close, volume };
}

// `count` candles ending with the one that contains `now`.
export function candles(asset, tfSec, count, now, shocks) {
  const last = Math.floor(now / tfSec) * tfSec;
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = last - i * tfSec;
    out.push(candleAt(asset, start, tfSec, shocks, i === 0 ? now : undefined));
  }
  return out;
}

// 24h stats for tickers.
export function stats24h(asset, now, shocks) {
  const price = priceAt(asset, now, shocks);
  const open = priceAt(asset, now - DAY, shocks);
  let high = Math.max(price, open), low = Math.min(price, open);
  for (let i = 1; i < 48; i++) {
    const p = priceAt(asset, now - DAY + (DAY * i) / 48, shocks);
    if (p > high) high = p;
    if (p < low) low = p;
  }
  const volume = baseVolume(asset) * (0.8 + Math.abs(price / open - 1) * 6);
  return { price, open, high, low, change: (price / open - 1) * 100, volume, quoteVolume: volume * price };
}

// Small sparkline series (last 24h, hourly).
export function spark(asset, now, shocks, points = 24) {
  const out = [];
  for (let i = points; i >= 0; i--) out.push(priceAt(asset, now - (DAY * i) / points, shocks));
  return out;
}
