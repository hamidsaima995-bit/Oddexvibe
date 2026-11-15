export function priceDecimals(p) {
  const a = Math.abs(p);
  if (a >= 100) return 2;
  if (a >= 1) return 3;
  if (a >= 0.1) return 4;
  if (a >= 0.01) return 5;
  return 6;
}

export function fmtPrice(p) {
  if (!Number.isFinite(p)) return "--";
  const d = priceDecimals(p);
  return p.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtUSD(n, signed = false) {
  if (!Number.isFinite(n)) return "--";
  const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (signed) return (n > 0 ? "+$" : n < 0 ? "-$" : "$") + s;
  return (n < 0 ? "-$" : "$") + s;
}

export function fmtPct(n, signed = true) {
  if (!Number.isFinite(n)) return "--";
  return (signed && n > 0 ? "+" : "") + n.toFixed(2) + "%";
}

export function fmtQty(q) {
  if (!Number.isFinite(q)) return "--";
  const a = Math.abs(q);
  const d = a >= 1000 ? 2 : a >= 1 ? 4 : 6;
  return q.toLocaleString("en-US", { maximumFractionDigits: d });
}

export function fmtCompact(n) {
  if (!Number.isFinite(n)) return "--";
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

export function timeAgo(ms) {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return s + "s";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}

export const upDown = (n) => (n >= 0 ? "up" : "down");
