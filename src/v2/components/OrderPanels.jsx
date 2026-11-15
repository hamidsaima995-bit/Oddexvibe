import { useState } from "react";
import { useStore } from "../store.jsx";
import { fmtPrice, fmtUSD, fmtQty } from "../lib/format.js";
import { SPOT_FEE, FUT_FEE, MAX_LEV, liqPrice } from "../lib/trading.js";

// Keep only digits and one dot; returns string for the input.
function cleanNum(v, maxDec = 8) {
  let s = String(v).replace(/[^0-9.]/g, "");
  const i = s.indexOf(".");
  if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "").slice(0, maxDec);
  return s;
}
const floorTo = (n, d) => Math.floor(n * 10 ** d) / 10 ** d;

function Field({ label, value, onChange, unit, placeholder = "0.00" }) {
  return (
    <label className="field">
      <span className="lbl">{label}</span>
      <input inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(cleanNum(e.target.value))} />
      <span className="unit">{unit}</span>
    </label>
  );
}

function PctChips({ onPick, active }) {
  return (
    <div className="chips">
      {[25, 50, 75, 100].map((p) => (
        <button key={p} className={active === p ? "on" : ""} onClick={() => onPick(p)}>{p}%</button>
      ))}
    </div>
  );
}

// ── Spot ────────────────────────────────────────────────────────────────
export function SpotPanel({ symbol }) {
  const { account, priceOf, actions } = useStore();
  const [side, setSide] = useState("buy");
  const [val, setVal] = useState("");
  const [pct, setPct] = useState(null);
  const price = priceOf(symbol);
  const held = account.spot[symbol]?.qty || 0;
  const maxUsd = floorTo(account.cash / (1 + SPOT_FEE), 2);
  const n = parseFloat(val) || 0;

  const pick = (p) => {
    setPct(p);
    if (side === "buy") setVal(String(floorTo((maxUsd * p) / 100, 2)));
    else setVal(p === 100 ? String(held) : String(floorTo((held * p) / 100, 6)));
  };
  const submit = () => {
    const ok = side === "buy" ? actions.buy(symbol, n) : actions.sell(symbol, n);
    if (ok) { setVal(""); setPct(null); }
  };
  const switchSide = (s) => { setSide(s); setVal(""); setPct(null); };

  return (
    <div className="panel-grid">
      <div className="seg">
        <button className={side === "buy" ? "on buy" : ""} onClick={() => switchSide("buy")}>Buy</button>
        <button className={side === "sell" ? "on sell" : ""} onClick={() => switchSide("sell")}>Sell</button>
      </div>
      <div className="kv"><span>Order type</span><span>Market</span></div>
      <div className="kv"><span>Available</span>
        <span className="num">{side === "buy" ? fmtUSD(account.cash) : `${fmtQty(held)} ${symbol}`}</span></div>
      {side === "buy"
        ? <Field label="Total" value={val} onChange={(v) => { setVal(v); setPct(null); }} unit="USD" />
        : <Field label="Amount" value={val} onChange={(v) => { setVal(v); setPct(null); }} unit={symbol} />}
      <PctChips onPick={pick} active={pct} />
      <div>
        <div className="kv num"><span>Market price</span><span>{fmtPrice(price)}</span></div>
        {side === "buy"
          ? <div className="kv num"><span>You get ≈</span><span>{fmtQty(n / price)} {symbol}</span></div>
          : <div className="kv num"><span>You get ≈</span><span>{fmtUSD(n * price * (1 - SPOT_FEE))}</span></div>}
        <div className="kv num"><span>Fee (0.1%)</span><span>{fmtUSD((side === "buy" ? n : n * price) * SPOT_FEE)}</span></div>
      </div>
      <button className={"big-btn " + side} disabled={!(n > 0)} onClick={submit}>
        {side === "buy" ? "Buy " : "Sell "}{symbol}
      </button>
    </div>
  );
}

// ── Futures ─────────────────────────────────────────────────────────────
const LEV_CHIPS = [1, 3, 5, 10, 20, 50];

export function FuturesPanel({ symbol }) {
  const { account, priceOf, actions } = useStore();
  const [side, setSide] = useState("long");
  const [lev, setLev] = useState(10);
  const [margin, setMargin] = useState("");
  const [pct, setPct] = useState(null);
  const [useTpSl, setUseTpSl] = useState(false);
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const price = priceOf(symbol);
  const m = parseFloat(margin) || 0;
  const notional = m * lev;
  const liq = liqPrice(side, price, lev);
  const maxMargin = floorTo(account.cash / (1 + lev * FUT_FEE), 2);

  const pick = (p) => { setPct(p); setMargin(String(floorTo((maxMargin * p) / 100, 2))); };
  const changeLev = (v) => {
    setLev(v);
    if (pct) setMargin(String(floorTo(((account.cash / (1 + v * FUT_FEE)) * pct) / 100, 2)));
  };
  const submit = () => {
    const ok = actions.open({ symbol, side, margin: m, lev, tp: useTpSl && tp ? parseFloat(tp) : null, sl: useTpSl && sl ? parseFloat(sl) : null });
    if (ok) { setMargin(""); setPct(null); setTp(""); setSl(""); }
  };
  return (
    <div className="panel-grid">
      <div className="seg">
        <button className={side === "long" ? "on buy" : ""} onClick={() => setSide("long")}>Long</button>
        <button className={side === "short" ? "on sell" : ""} onClick={() => setSide("short")}>Short</button>
      </div>

      <div>
        <div className="kv"><span>Leverage</span><span style={{ fontSize: 16, color: lev >= 20 ? "var(--down)" : "var(--text)" }}>{lev}x</span></div>
        <input type="range" min="1" max={MAX_LEV} value={lev} onChange={(e) => changeLev(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent)", margin: "6px 0" }} aria-label="Leverage" />
        <div className="chips" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
          {LEV_CHIPS.map((x) => <button key={x} className={lev === x ? "on" : ""} onClick={() => changeLev(x)}>{x}x</button>)}
        </div>
      </div>

      <div className="kv"><span>Available</span><span className="num">{fmtUSD(account.cash)}</span></div>
      <Field label="Margin" value={margin} onChange={(v) => { setMargin(v); setPct(null); }} unit="USD" />
      <PctChips onPick={pick} active={pct} />

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13 }}>
        <input type="checkbox" checked={useTpSl} onChange={(e) => setUseTpSl(e.target.checked)} style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
        Take profit / Stop loss
      </label>
      {useTpSl && (
        <div className="panel-grid" style={{ gap: 8 }}>
          <Field label="TP price" value={tp} onChange={setTp} unit="USD" placeholder={fmtPrice(price * (side === "long" ? 1.05 : 0.95)).replace(/,/g, "")} />
          <Field label="SL price" value={sl} onChange={setSl} unit="USD" placeholder={fmtPrice(price * (side === "long" ? 0.97 : 1.03)).replace(/,/g, "")} />
        </div>
      )}

      <div>
        <div className="kv num"><span>Mark price</span><span>{fmtPrice(price)}</span></div>
        <div className="kv num"><span>Position size</span><span>{fmtUSD(notional)}</span></div>
        <div className="kv num"><span>Quantity ≈</span><span>{fmtQty(notional / price)} {symbol}</span></div>
        <div className="kv num"><span>Est. liq. price</span><span style={{ color: "var(--warn)" }}>{fmtPrice(liq)}</span></div>
        <div className="kv num"><span>Fee (0.04%)</span><span>{fmtUSD(notional * FUT_FEE)}</span></div>
      </div>
      <button className={"big-btn " + (side === "long" ? "buy" : "sell")} disabled={!(m > 0)} onClick={submit}>
        {side === "long" ? "Open Long" : "Open Short"} {lev}x
      </button>
      <div className="faint" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
        Isolated margin. If the mark price reaches the liquidation price, the position closes and its margin is lost.
      </div>
    </div>
  );
}
