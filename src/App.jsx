import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   ODDEX VIBE  —  Simulated Entertainment Trading Platform
   For entertainment only. No real money. No financial services.
   Prices are algorithm-generated simulations, not real market data.
═══════════════════════════════════════════════════════════════════ */

// ─── Data ─────────────────────────────────────────────────────────────
const ASSETS = [
  { id:1,  symbol:"VIBE",  name:"Raw Uncut Vibes",       basePrice:420.69,  volatility:0.032, vol:"2.1M", desc:"Pure distilled atmosphere.",      emoji:"✨", hot:true  },
  { id:2,  symbol:"DRAM",  name:"Internet Drama Units",   basePrice:69.00,   volatility:0.055, vol:"9.9M", desc:"Spikes during celebrity feuds.",  emoji:"🍿", hot:true  },
  { id:3,  symbol:"SLEE",  name:"Unspent Sleep Hours",    basePrice:7.50,    volatility:0.018, vol:"312K", desc:"Depreciates daily. Rare.",        emoji:"😴", hot:false },
  { id:4,  symbol:"CRNG",  name:"Cringe Futures",         basePrice:0.03,    volatility:0.090, vol:"99M",  desc:"Bought low in 2016.",             emoji:"😬", hot:true  },
  { id:5,  symbol:"EXNRG", name:"Ex's Energy",            basePrice:55.55,   volatility:0.028, vol:"887K", desc:"Toxic but weirdly valuable.",    emoji:"💀", hot:false },
  { id:6,  symbol:"CLOUD", name:"Specific Cloud #4471",   basePrice:1200.00, volatility:0.010, vol:"1",    desc:"One of a kind. Over Ohio.",       emoji:"☁️", hot:false },
  { id:7,  symbol:"MENT",  name:"Main Character Moments", basePrice:333.33,  volatility:0.040, vol:"450K", desc:"Limited supply.",                emoji:"🎬", hot:true  },
  { id:8,  symbol:"DEJA",  name:"Deja Vu Tokens",         basePrice:42.00,   volatility:0.042, vol:"42K",  desc:"Have you seen this before?",     emoji:"🔁", hot:false },
  { id:9,  symbol:"LORE",  name:"Fictional Lore Shards",  basePrice:888.00,  volatility:0.022, vol:"1.2M", desc:"World-building at scale.",       emoji:"📜", hot:true  },
  { id:10, symbol:"AWKW",  name:"Awkward Silence NFTs",   basePrice:0.01,    volatility:0.005, vol:"3",    desc:"Nobody wants these.",            emoji:"🦗", hot:false },
  { id:11, symbol:"RDBR",  name:"Red Bull Futures",       basePrice:6.66,    volatility:0.066, vol:"6.6M", desc:"Gives wings. Legally contested.",emoji:"🐂", hot:true  },
  { id:12, symbol:"GOSR",  name:"Goose Rumors",           basePrice:17.42,   volatility:0.038, vol:"224K", desc:"Untraceable origin.",            emoji:"🪿", hot:false },
];

const FEED_ITEMS = [
  "🔥 CRNG all-time high — algorithm detects meme cycle peak",
  "⚡ DRAM surges 88% — celebrity beef escalates",
  "🧠 SLEE supply critically low in major cities",
  "💎 LORE holders holding strong since 2019",
  "🚨 AWKW collapses — zero simulated buyers found",
  "📈 VIBE up 12% on strong summer energy readings",
  "🪿 Goose spotted near exchange floor — GOSR traders nervous",
  "🔁 DEJA investors certain they've seen this before",
  "🐂 Red Bull futures enter simulated parabolic phase",
  "😬 CRNG meme cycle repeating — simulation confirms",
];

const LEADERBOARD = [
  { name:"VibeGod420",    worth:284750, pct:+18.4, plan:"whale" },
  { name:"DramaQueen99",  worth:201340, pct:+12.1, plan:"pro"   },
  { name:"GooseLord",     worth:188900, pct:+9.8,  plan:"pro"   },
  { name:"SleepDeprived", worth:145200, pct:+6.2,  plan:"free"  },
  { name:"CringeMaster",  worth:122800, pct:-2.1,  plan:"whale" },
  { name:"ExEnergyTradr", worth:98400,  pct:+3.3,  plan:"free"  },
  { name:"CloudWatcher",  worth:87200,  pct:-5.5,  plan:"free"  },
  { name:"LoreshardHODL", worth:76500,  pct:+1.1,  plan:"pro"   },
  { name:"DejaVuTrader",  worth:65300,  pct:-0.4,  plan:"free"  },
  { name:"AwkwardSilnce", worth:54100,  pct:-8.8,  plan:"free"  },
];

const PLANS = [
  { id:"free",  name:"FREE",  price:"$0",  per:"forever", cash:10000,
    accent:"#666",    features:["$10,000 starting balance","All 12 odd assets","Simulated price feeds","View leaderboard"] },
  { id:"pro",   name:"PRO",   price:"$5",  per:"/month",  cash:100000,
    accent:"#7c6fff", popular:true,
    features:["$100,000 starting balance","Exclusive bonus assets","Advanced charts","💎 PRO badge","Weekly tournaments"] },
  { id:"whale", name:"WHALE", price:"$15", per:"/month",  cash:1000000,
    accent:"#00ff88", features:["$1,000,000 starting balance","Secret unlockable assets","Priority feeds","👑 WHALE badge","3x prize multiplier"] },
];

const PLAN_BADGE = { free:"",    pro:"💎",     whale:"👑"      };
const PLAN_COLOR = { free:"#666", pro:"#7c6fff", whale:"#00ff88" };
const PLAN_CASH  = { free:10000,  pro:100000,    whale:1000000   };

// ─── Helpers ──────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}

// ─── Sparkline — safe: always renders, never crashes ──────────────────
function Sparkline({ up, seed }) {
  // Deterministic points from seed — stable, no random flicker
  const pts = Array.from({ length: 18 }, (_, i) => {
    const r    = Math.abs(Math.sin(seed * 127.1 + i * 311.7));
    const base = up ? 30 + i * 1.3 : 50 - i * 1.3;
    return Math.max(5, Math.min(55, base + (r - 0.5) * 18));
  });
  // Guard: if all pts are equal, rng would be 0 — use fallback 1
  const lo  = Math.min(...pts);
  const hi  = Math.max(...pts);
  const rng = hi - lo > 0 ? hi - lo : 1;
  const d   = pts.map((y, i) =>
    (i === 0 ? "M" : "L") + " " + ((i / 17) * 92).toFixed(1) + " " + (44 - ((y - lo) / rng) * 34).toFixed(1)
  ).join(" ");
  const color = up ? "#00ff88" : "#ff4466";
  // Always renders a valid SVG — even with 1 point it shows a dot
  return (
    <svg width="72" height="28" viewBox="0 0 92 44" style={{ display:"block", overflow:"visible" }}
      aria-label={up ? "Trending up" : "Trending down"}>
      {pts.length >= 2
        ? <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        : <circle cx="46" cy="22" r="3" fill={color} />
      }
    </svg>
  );
}

// ─── Price flash ───────────────────────────────────────────────────────
function Price({ val, up }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(val);
  useEffect(() => {
    if (prev.current !== val) {
      prev.current = val;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 350);
      return () => clearTimeout(t);
    }
  }, [val]);
  return (
    <span style={{
      color:       up ? "#00ff88" : "#ff4466",
      fontWeight:  700,
      fontSize:    "clamp(0.75rem, 2.5vw, 0.92rem)",
      background:  flash ? (up ? "rgba(0,255,136,0.18)" : "rgba(255,68,102,0.18)") : "transparent",
      borderRadius: 3,
      padding:     "1px 4px",
      transition:  "background 0.25s",
      fontFamily:  "'JetBrains Mono', monospace",
      minWidth:    64,
      display:     "inline-block",
      textAlign:   "right",
    }}>
      ${val.toFixed(2)}
    </span>
  );
}

// ─── Payment Loading Overlay ───────────────────────────────────────────
function PaymentLoader({ plan }) {
  const p = PLANS.find(x => x.id === plan);
  const [phase, setPhase] = useState(0);
  // phase 0 = connecting, 1 = processing, 2 = done
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const labels = ["Connecting...", "Processing payment...", "Activated! 🎉"];
  const colors = ["#7c6fff", "#ffaa00", "#00ff88"];
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(2,2,10,0.96)",
      zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div style={{
        background:"#0c0c1e", border:"1px solid " + (p ? p.accent : "#333"),
        borderRadius:16, padding:"36px 32px", maxWidth:320, width:"90%", textAlign:"center",
      }}>
        {/* Spinner */}
        <div style={{ position:"relative", width:64, height:64, margin:"0 auto 20px" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ position:"absolute", top:0, left:0 }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="#1a1a2e" strokeWidth="4"/>
            <circle cx="32" cy="32" r="28" fill="none"
              stroke={colors[phase]} strokeWidth="4"
              strokeDasharray={phase === 2 ? "176" : "80"}
              strokeDashoffset="44"
              strokeLinecap="round"
              style={{ transition:"all 0.5s ease", transformOrigin:"center",
                transform: phase === 2 ? "none" : "rotate(-90deg)" }}
            />
          </svg>
          <div style={{
            position:"absolute", inset:0, display:"flex",
            alignItems:"center", justifyContent:"center",
            fontSize:"1.4rem",
          }}>
            {phase === 2 ? "✓" : p ? p.emoji || "💳" : "💳"}
          </div>
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem",
          letterSpacing:"0.1em", color: p ? p.accent : "#fff", marginBottom:8 }}>
          {p ? p.name + " PLAN" : "UPGRADING"}
        </div>
        <div style={{ color:colors[phase], fontSize:"0.75rem", fontWeight:700,
          transition:"color 0.3s", letterSpacing:"0.08em" }}>
          {labels[phase]}
        </div>
        {phase < 2 && (
          <div style={{ marginTop:16, height:3, background:"#1a1a2e", borderRadius:2, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:2,
              background: p ? p.accent : "#7c6fff",
              width: phase === 0 ? "30%" : "80%",
              transition:"width 0.8s ease",
            }}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Onboarding ────────────────────────────────────────────────────────
function Onboarding({ onStart }) {
  const [step,    setStep]    = useState(0);
  const [name,    setName]    = useState("");
  const [plan,    setPlan]    = useState("free");
  const [nameErr, setNameErr] = useState(false);

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(2,2,10,0.97)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"4vw", overflowY:"auto",
    }}>
      <div style={{
        background:"#09091c", border:"1px solid #1e1e38", borderRadius:16,
        padding:"clamp(20px,5vw,36px) clamp(16px,4vw,28px)",
        maxWidth:480, width:"100%", margin:"auto",
      }}>
        {/* Disclaimer */}
        <div style={{
          background:"#ff440011", border:"1px solid #ff440033", borderRadius:6,
          padding:"6px 10px", fontSize:"clamp(0.5rem,2vw,0.58rem)",
          color:"#ff7744", marginBottom:18, letterSpacing:"0.04em",
        }}>
          ⚠️ FOR ENTERTAINMENT ONLY — Simulated prices. No real money. No financial services.
        </div>

        {step === 0 && (
          <>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"clamp(1.6rem,7vw,2.2rem)", letterSpacing:"0.1em", marginBottom:4 }}>
              ODD<span style={{color:"#7c6fff"}}>EX</span>{" "}
              <span style={{color:"#00ff88", fontSize:"0.7em"}}>VIBE</span>
            </div>
            <div style={{ color:"#444", fontSize:"clamp(0.62rem,2.5vw,0.72rem)", marginBottom:24, lineHeight:1.6 }}>
              The world's only exchange for vibes, drama,<br/>goose rumors and other odd assets.
            </div>
            <div style={{ color:"#333", fontSize:"clamp(0.52rem,2vw,0.58rem)", letterSpacing:"0.12em", marginBottom:6 }}>
              YOUR TRADER NAME
            </div>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setNameErr(false); }}
              onKeyDown={e => e.key === "Enter" && name.trim() && (setNameErr(false), setStep(1))}
              placeholder="e.g. VibeGod420"
              maxLength={16}
              style={{
                width:"100%", padding:"clamp(10px,3vw,13px) 14px",
                border: nameErr ? "1px solid #ff4466" : "1px solid #1e1e38",
                marginBottom: nameErr ? 4 : 16, display:"block",
                fontSize:"clamp(0.8rem,3vw,0.9rem)",
              }}
            />
            {nameErr && <div style={{ color:"#ff4466", fontSize:"0.6rem", marginBottom:12 }}>Enter a name to continue.</div>}
            <button onClick={() => { if (!name.trim()) { setNameErr(true); return; } setStep(1); }}
              style={{
                width:"100%", minHeight:48, border:"none", borderRadius:8, cursor:"pointer",
                fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.9rem,3.5vw,1.1rem)",
                letterSpacing:"0.14em", background:"linear-gradient(135deg,#7c6fff,#4433cc)", color:"#fff",
              }}>
              NEXT — CHOOSE PLAN
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"clamp(1.1rem,5vw,1.5rem)", letterSpacing:"0.08em", marginBottom:4 }}>
              Hey <span style={{color:"#7c6fff"}}>{name}</span> 👋
            </div>
            <div style={{ color:"#444", fontSize:"clamp(0.62rem,2.5vw,0.7rem)", marginBottom:16 }}>
              Pick your plan — upgrade any time.
            </div>
            {PLANS.map(p => (
              <div key={p.id} onClick={() => setPlan(p.id)} style={{
                border:"1px solid " + (plan === p.id ? p.accent : "#1a1a30"),
                borderRadius:10, padding:"12px 13px", marginBottom:10,
                cursor:"pointer", position:"relative",
                background: plan === p.id ? p.accent + "12" : "rgba(255,255,255,0.015)",
                transition:"all 0.15s",
              }}>
                {p.popular && plan !== p.id && (
                  <div style={{ position:"absolute", top:-9, right:12, background:"#7c6fff",
                    borderRadius:4, padding:"1px 7px", fontSize:"0.5rem", color:"#fff", letterSpacing:"0.1em" }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:13, height:13, borderRadius:"50%", border:"2px solid " + p.accent,
                      background: plan === p.id ? p.accent : "transparent", transition:"all 0.15s", flexShrink:0 }}/>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif",
                      fontSize:"clamp(0.9rem,4vw,1.05rem)", letterSpacing:"0.1em", color:p.accent }}>
                      {p.name}
                    </span>
                  </div>
                  <div>
                    <span style={{ color:"#ddd", fontWeight:700 }}>{p.price}</span>
                    <span style={{ color:"#444", fontSize:"0.6rem" }}>{p.per}</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {p.features.map((f, i) => (
                    <span key={i} style={{ fontSize:"clamp(0.52rem,2vw,0.59rem)", color:"#666",
                      background:"#0c0c1e", borderRadius:4, padding:"2px 6px" }}>{f}</span>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => onStart(name.trim(), plan)} style={{
              width:"100%", minHeight:48, border:"none", borderRadius:8, cursor:"pointer", marginTop:4,
              fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.9rem,3.5vw,1.1rem)",
              letterSpacing:"0.14em",
              background: plan === "whale" ? "linear-gradient(135deg,#00ff88,#009955)"
                : plan === "pro"          ? "linear-gradient(135deg,#7c6fff,#4433cc)"
                :                          "linear-gradient(135deg,#333,#1a1a1a)",
              color: plan === "whale" ? "#000" : "#fff",
            }}>
              START TRADING 🚀
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────
export default function OddexVibe() {
  // ── state ──
  const [user,      setUser]      = useState(null);
  const [tab,       setTab]       = useState("trade");
  const [assets,    setAssets]    = useState(() => ASSETS.map(a => ({ ...a, price:a.basePrice, change:0 })));
  const [selId,     setSelId]     = useState(1);
  const [chart,     setChart]     = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [balance,   setBalance]   = useState(10000);
  const [oQty,      setOQty]      = useState(1);
  const [oType,     setOType]     = useState("buy");
  const [toast,     setToast]     = useState(null);
  const [payLoader, setPayLoader] = useState(null); // planId | null
  const [pwaPrompt, setPwaPrompt] = useState(false);

  const toastRef   = useRef(null);
  const rafRef     = useRef(null);
  const lastTickRef = useRef(0);
  const deferRef   = useRef(null); // PWA beforeinstallprompt

  const sel      = assets.find(a => a.id === selId) || assets[0];
  const portVal  = portfolio.reduce((s, p) => { const a = assets.find(x => x.id === p.id); return s + (a ? a.price : 0) * p.qty; }, 0);
  const netWorth = balance + portVal;

  // ══ PWA: detect mobile + Add to Home Screen prompt ══════════════════
  useEffect(() => {
    // Listen for browser's install prompt
    const onPrompt = e => { e.preventDefault(); deferRef.current = e; };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Detect mobile and not already installed
    const isMobile   = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
                      || window.navigator.standalone === true;

    if (isMobile && !isStandalone) {
      const timer = setTimeout(() => setPwaPrompt(true), 8000); // suggest after 8s
      return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", onPrompt); };
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function handleAddToHome() {
    if (deferRef.current) {
      deferRef.current.prompt();
      deferRef.current.userChoice.then(() => { deferRef.current = null; });
    }
    setPwaPrompt(false);
  }

  // ══ Optimized price simulator using requestAnimationFrame ════════════
  // Tick only every 3000ms, uses rAF to stay in sync with browser paint
  useEffect(() => {
    function tick(timestamp) {
      if (timestamp - lastTickRef.current >= 3000) {
        lastTickRef.current = timestamp;
        setAssets(prev => prev.map(a => {
          // Simple LCG-style noise — very cheap, no heavy Math calls
          const r       = ((Math.sin(timestamp * 0.001 + a.id * 17.3) + 1) / 2);
          const swing   = (r - 0.48) * a.price * a.volatility;
          const newPrice = Math.max(0.001, a.price + swing);
          const change   = parseFloat(((newPrice - a.basePrice) / a.basePrice * 100).toFixed(2));
          return { ...a, price: newPrice, change };
        }));
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ══ Chart feed ════════════════════════════════════════════════════════
  useEffect(() => {
    setChart(prev => [...prev, { v: sel.price }].slice(-80));
  }, [sel.price, selId]);

  const pickAsset = useCallback(id => { setSelId(id); setChart([]); }, []);

  // ══ Toast ════════════════════════════════════════════════════════════
  const showToast = useCallback((msg, type = "ok") => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ══ Trade execution ══════════════════════════════════════════════════
  function executeTrade() {
    const price = sel.price;
    const cost  = price * oQty;
    if (oType === "buy") {
      if (cost > balance) { showToast("Not enough balance 💸", "err"); return; }
      const luck = 1 + (Math.random() - 0.5) * sel.volatility * 2;
      const effPrice = parseFloat((price * luck).toFixed(4));
      setBalance(b => parseFloat((b - cost).toFixed(2)));
      setPortfolio(prev => {
        const ex = prev.find(p => p.id === selId);
        if (ex) return prev.map(p => p.id === selId
          ? { ...p, qty: p.qty + oQty, avg: parseFloat(((p.avg * p.qty + effPrice * oQty) / (p.qty + oQty)).toFixed(4)) }
          : p);
        return [...prev, { id: selId, qty: oQty, avg: effPrice }];
      });
      const slip = ((luck - 1) * 100).toFixed(1);
      showToast("Bought " + oQty + " " + sel.symbol + " (slip " + (luck > 1 ? "+" : "") + slip + "%) ✅");
    } else {
      const held = portfolio.find(p => p.id === selId);
      if (!held || held.qty < oQty) { showToast("You don't own enough 😭", "err"); return; }
      setBalance(b => parseFloat((b + cost).toFixed(2)));
      setPortfolio(prev => prev.map(p => p.id === selId ? { ...p, qty: p.qty - oQty } : p).filter(p => p.qty > 0));
      showToast("Sold " + oQty + " " + sel.symbol + " 💰");
    }
    setOQty(1);
  }

  // ══ Onboarding start ═════════════════════════════════════════════════
  function handleStart(name, plan) {
    setUser({ name, plan });
    setBalance(PLAN_CASH[plan]);
    setPortfolio([]);
  }

  // ══ Upgrade — 2s payment simulation flow ════════════════════════════
  function handleUpgrade(planId) {
    if (!user || user.plan === planId) return;
    setPayLoader(planId);                    // show payment loader
    setTimeout(() => {
      setPayLoader(null);                    // hide loader
      setUser(prev => ({ ...prev, plan: planId }));
      setBalance(PLAN_CASH[planId]);
      setPortfolio([]);
      showToast("Welcome to " + planId.toUpperCase() + " 🎉");
      setTab("trade");
    }, 2000);                               // 2 second payment simulation
  }

  // ── Board ──
  const board = user
    ? [{ name:user.name, worth:netWorth, pct:0, plan:user.plan, isMe:true }, ...LEADERBOARD]
        .sort((a, b) => b.worth - a.worth).map((p, i) => ({ ...p, rank:i+1 }))
    : LEADERBOARD.map((p, i) => ({ ...p, rank:i+1, isMe:false }));

  // ── Chart SVG path (safe: guarded by chart.length > 1) ──
  const CW = 500, CH = 100;
  let cPath = "", aPath = "", cUp = true;
  if (chart.length > 1) {
    const vs  = chart.map(d => d.v);
    const lo  = Math.min(...vs) * 0.997;
    const hi  = Math.max(...vs) * 1.003;
    const rng = hi - lo > 0 ? hi - lo : 1;
    const pts = chart.map((d, i) =>
      (i === 0 ? "M" : "L") + " " +
      ((i / (chart.length - 1)) * CW).toFixed(1) + " " +
      (CH - ((d.v - lo) / rng) * CH * 0.88 - CH * 0.06).toFixed(1)
    );
    cPath = pts.join(" ");
    aPath = cPath + " L " + CW + " " + CH + " L 0 " + CH + " Z";
    cUp   = chart[chart.length - 1].v >= chart[0].v;
  }
  const CC = cUp ? "#00ff88" : "#ff4466";

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily:"'JetBrains Mono','Courier New',monospace",
      background:"#040409", color:"#ddd",
      minHeight:"100dvh",
      display:"flex", flexDirection:"column",
      overflow:"hidden", maxWidth:"100vw",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#05050e; }
        ::-webkit-scrollbar-thumb { background:#1a1a2e; border-radius:2px; }
        .row { transition:background 0.14s; cursor:pointer; }
        .row:hover, .row:active { background:rgba(255,255,255,0.05) !important; }
        .btn { transition:all 0.14s; cursor:pointer; border:none; -webkit-tap-highlight-color:transparent; }
        .btn:hover { filter:brightness(1.12); }
        .btn:active { transform:scale(0.96); }
        .tab-btn { transition:all 0.14s; cursor:pointer; border:none; background:transparent; -webkit-tap-highlight-color:transparent; }
        input { background:#0d0d20; border:1px solid #1e1e38; border-radius:7px; color:#fff;
          font-family:'JetBrains Mono',monospace; outline:none; transition:border 0.2s; width:100%; }
        input:focus { border-color:#7c6fff; }
        @keyframes ticker { 0% { transform:translateX(100vw); } 100% { transform:translateX(-100%); } }
        .tick { display:inline-block; animation:ticker 32s linear infinite; white-space:nowrap; }
        @keyframes toastin { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .toast { animation:toastin 0.22s ease; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .hot { animation:pulse 1.6s infinite; }
        @keyframes pwabounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
        .pwa-banner { animation:pwabounce 2s ease infinite; }

        /* Mobile-first: vertical stack */
        .body-grid { display:flex; flex-direction:column; flex:1; overflow:hidden; min-height:0; }
        .left-col  { display:flex; flex-direction:column; overflow:hidden; min-height:0; flex:1; }
        .right-col { border-top:1px solid #111122; border-left:none; flex-shrink:0;
          display:flex; flex-direction:column; max-height:55vh; }

        /* Desktop: side-by-side */
        @media (min-width:768px) {
          .body-grid { flex-direction:row; }
          .right-col { border-left:1px solid #111122; border-top:none;
            max-height:none; width:320px; flex-shrink:0; }
        }
      `}</style>

      {/* Modals */}
      {!user && <Onboarding onStart={handleStart} />}
      {payLoader && <PaymentLoader plan={payLoader} />}

      {/* ── PWA Add-to-Home Banner ── */}
      {pwaPrompt && (
        <div style={{
          position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
          background:"#1a1a2e", border:"1px solid #7c6fff55",
          borderRadius:12, padding:"12px 18px", zIndex:5000,
          display:"flex", alignItems:"center", gap:12,
          boxShadow:"0 8px 32px rgba(0,0,0,0.7)", maxWidth:"90vw",
        }} className="pwa-banner">
          <span style={{fontSize:"1.4rem"}}>📲</span>
          <div>
            <div style={{fontSize:"0.7rem",fontWeight:700,color:"#ddd",marginBottom:2}}>Add ODDEX VIBE to Home Screen</div>
            <div style={{fontSize:"0.58rem",color:"#555"}}>Trade on the go, like a real app</div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button className="btn" onClick={handleAddToHome}
              style={{background:"#7c6fff",color:"#fff",borderRadius:6,
                padding:"6px 10px",fontSize:"0.65rem",fontWeight:700,minHeight:36}}>
              ADD
            </button>
            <button className="btn" onClick={() => setPwaPrompt(false)}
              style={{background:"#1e1e30",color:"#555",borderRadius:6,
                padding:"6px 8px",fontSize:"0.65rem",minHeight:36}}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        padding:"clamp(8px,2vw,12px) clamp(12px,4vw,20px)",
        borderBottom:"1px solid #111122", background:"rgba(4,4,9,0.98)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0, zIndex:100, flexWrap:"wrap", gap:8,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif",
            fontSize:"clamp(1.3rem,5vw,1.7rem)", letterSpacing:"0.1em", lineHeight:1 }}>
            ODD<span style={{color:"#7c6fff"}}>EX</span>{" "}
            <span style={{color:"#00ff88",fontSize:"0.65em"}}>VIBE</span>
          </div>
          <span style={{ background:"#7c6fff22", border:"1px solid #7c6fff44",
            borderRadius:4, padding:"2px 6px",
            fontSize:"clamp(0.48rem,1.8vw,0.56rem)", color:"#7c6fff", letterSpacing:"0.1em" }}>
            ● LIVE
          </span>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:"clamp(8px,3vw,14px)",fontSize:"clamp(0.58rem,2.2vw,0.68rem)"}}>
            {[
              ["CASH",      "$" + balance.toLocaleString(undefined,{maximumFractionDigits:0}), "#00ff88"],
              ["PORTFOLIO", fmt(portVal),   "#ccc"    ],
              ["NET WORTH", fmt(netWorth),  "#7c6fff" ],
            ].map(([l, v, c]) => (
              <div key={l}>
                <div style={{color:"#222236",fontSize:"clamp(0.46rem,1.6vw,0.52rem)",
                  letterSpacing:"0.1em",marginBottom:1}}>{l}</div>
                <div style={{color:c,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
          {user && (
            <div style={{ display:"flex",alignItems:"center",gap:6,
              background:"#0d0d1e", border:"1px solid " + PLAN_COLOR[user.plan] + "33",
              borderRadius:8, padding:"4px 9px" }}>
              <span style={{fontSize:"clamp(0.8rem,3vw,0.95rem)"}}>{PLAN_BADGE[user.plan] || "👤"}</span>
              <div>
                <div style={{fontSize:"clamp(0.58rem,2vw,0.66rem)",fontWeight:700,color:"#ddd"}}>{user.name}</div>
                <div style={{fontSize:"clamp(0.46rem,1.6vw,0.52rem)",color:PLAN_COLOR[user.plan],letterSpacing:"0.08em"}}>
                  {user.plan.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Ticker ── */}
      <div style={{background:"#060612",borderBottom:"1px solid #111122",
        height:24,overflow:"hidden",display:"flex",alignItems:"center",flexShrink:0}}>
        <div className="tick" style={{fontSize:"clamp(0.54rem,2vw,0.62rem)",color:"#3a3a55",letterSpacing:"0.04em"}}>
          {[...FEED_ITEMS,...FEED_ITEMS].map((f,i)=><span key={i} style={{marginRight:60}}>{f}</span>)}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="body-grid">

        {/* LEFT: chart + table */}
        <div className="left-col">

          {/* Chart header */}
          <div style={{padding:"clamp(10px,3vw,15px) clamp(12px,4vw,18px) clamp(8px,2vw,12px)",
            borderBottom:"1px solid #111122",background:"#060610",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:"clamp(1.1rem,4vw,1.5rem)"}}>{sel.emoji}</span>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",
                    fontSize:"clamp(0.9rem,3.5vw,1.15rem)",letterSpacing:"0.07em"}}>{sel.name}</div>
                  <div style={{color:"#2a2a40",fontSize:"clamp(0.5rem,1.8vw,0.58rem)",
                    letterSpacing:"0.08em",marginTop:2}}>
                    {sel.symbol} · {sel.vol} · SIMULATED
                  </div>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <Price val={sel.price} up={sel.change >= 0}/>
                <div style={{color:sel.change>=0?"#00ff88":"#ff4466",
                  fontSize:"clamp(0.6rem,2.2vw,0.72rem)",fontWeight:700,marginTop:3}}>
                  {sel.change>=0?"▲":"▼"} {Math.abs(sel.change).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Live chart — safe render */}
            <div style={{width:"100%",height:"clamp(60px,12vw,90px)"}}>
              <svg width="100%" height="100%" viewBox={"0 0 " + CW + " " + CH}
                preserveAspectRatio="none" aria-label="Price chart">
                <defs>
                  <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CC} stopOpacity="0.18"/>
                    <stop offset="100%" stopColor={CC} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {chart.length > 1 ? (
                  <>
                    <path d={aPath} fill="url(#grd)"/>
                    <path d={cPath} fill="none" stroke={CC} strokeWidth="1.8" strokeLinecap="round"/>
                  </>
                ) : (
                  // Graceful placeholder — no crash, no broken layout
                  <>
                    <line x1="0" y1={CH * 0.5} x2={CW} y2={CH * 0.5}
                      stroke="#1a1a2e" strokeWidth="1" strokeDasharray="6 4"/>
                    <text x="250" y="52" textAnchor="middle" fill="#1e1e30"
                      fontSize="12" fontFamily="monospace">Collecting simulated data…</text>
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Asset table */}
          <div style={{flex:1,overflow:"auto",minHeight:0,WebkitOverflowScrolling:"touch"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"clamp(0.6rem,2.2vw,0.71rem)"}}>
              <thead style={{position:"sticky",top:0,background:"#040409",zIndex:5}}>
                <tr style={{color:"#1a1a30",fontSize:"clamp(0.48rem,1.8vw,0.55rem)",
                  letterSpacing:"0.1em",borderBottom:"1px solid #0d0d1c"}}>
                  <th style={{padding:"6px clamp(8px,3vw,16px)",textAlign:"left",fontWeight:400}}>ASSET</th>
                  <th style={{padding:"6px",textAlign:"right",fontWeight:400}}>PRICE</th>
                  <th style={{padding:"6px",textAlign:"right",fontWeight:400}}>CHG</th>
                  <th style={{padding:"6px",textAlign:"center",fontWeight:400}}>TREND</th>
                  <th style={{padding:"6px clamp(8px,3vw,16px)",textAlign:"right",fontWeight:400}}>VOL</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id} className="row" onClick={() => pickAsset(a.id)}
                    style={{borderBottom:"1px solid #090916",
                      background:selId===a.id?"rgba(124,111,255,0.07)":"transparent"}}>
                    <td style={{padding:"7px clamp(8px,3vw,16px)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:"clamp(0.85rem,3vw,1.05rem)"}}>{a.emoji}</span>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontWeight:700,color:"#ccc",letterSpacing:"0.04em"}}>{a.symbol}</span>
                            {a.hot && <span className="hot" style={{background:"#ff4400",borderRadius:3,
                              padding:"1px 4px",fontSize:"clamp(0.42rem,1.6vw,0.48rem)",color:"#fff",
                              letterSpacing:"0.06em"}}>HOT</span>}
                          </div>
                          <div style={{color:"#1e1e30",fontSize:"clamp(0.48rem,1.8vw,0.57rem)",
                            maxWidth:"clamp(80px,20vw,150px)",whiteSpace:"nowrap",
                            overflow:"hidden",textOverflow:"ellipsis"}}>{a.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"7px 6px",textAlign:"right"}}>
                      <Price val={a.price} up={a.change>=0}/>
                    </td>
                    <td style={{padding:"7px 6px",textAlign:"right"}}>
                      <span style={{color:a.change>=0?"#00ff88":"#ff4466",fontWeight:700}}>
                        {a.change>=0?"+":""}{a.change.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{padding:"7px 6px",textAlign:"center"}}>
                      <Sparkline up={a.change>=0} seed={a.id}/>
                    </td>
                    <td style={{padding:"7px clamp(8px,3vw,16px)",textAlign:"right",color:"#1e1e30"}}>{a.vol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-col" style={{background:"#050510"}}>

          {/* Tabs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",
            borderBottom:"1px solid #111122",flexShrink:0}}>
            {[{id:"trade",icon:"📊",label:"TRADE"},{id:"board",icon:"🏆",label:"RANKS"},{id:"plans",icon:"💎",label:"PLANS"}].map(t=>(
              <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
                style={{minHeight:44,padding:"0 4px",textAlign:"center",
                  fontFamily:"'Bebas Neue',sans-serif",
                  fontSize:"clamp(0.6rem,2.2vw,0.7rem)",letterSpacing:"0.1em",
                  color:tab===t.id?"#ddd":"#252540",
                  borderBottom:"2px solid "+(tab===t.id?"#7c6fff":"transparent"),
                  transition:"all 0.15s"}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── TRADE ── */}
          {tab==="trade" && (
            <div style={{flex:1,overflow:"auto",minHeight:0,WebkitOverflowScrolling:"touch",
              display:"flex",flexDirection:"column"}}>
              <div style={{padding:"clamp(10px,3vw,15px) clamp(12px,4vw,16px)",
                borderBottom:"1px solid #111122",flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",
                  letterSpacing:"0.14em",color:"#252540",marginBottom:10}}>PLACE ORDER</div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:9}}>
                  {["buy","sell"].map(t=>(
                    <button key={t} className="btn" onClick={()=>setOType(t)}
                      style={{minHeight:44,borderRadius:6,
                        fontFamily:"'Bebas Neue',sans-serif",
                        fontSize:"clamp(0.78rem,3vw,0.88rem)",letterSpacing:"0.12em",
                        background:oType===t?(t==="buy"?"#00ff88":"#ff4466"):"rgba(255,255,255,0.04)",
                        color:oType===t?"#000":"#2a2a44"}}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #111122",
                  borderRadius:6,padding:"8px 11px",marginBottom:8,
                  display:"flex",gap:8,alignItems:"center"}}>
                  <span>{sel.emoji}</span>
                  <span style={{fontWeight:700,fontSize:"0.7rem"}}>{sel.symbol}</span>
                  <span style={{color:"#1e1e30",fontSize:"0.58rem",flex:1,overflow:"hidden",
                    textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.name}</span>
                  <span style={{fontSize:"0.52rem",color:"#333",flexShrink:0}}>
                    sim {(sel.volatility*100).toFixed(0)}%
                  </span>
                </div>

                <div style={{display:"flex",gap:5,marginBottom:8}}>
                  <button className="btn" onClick={()=>setOQty(q=>Math.max(1,q-1))}
                    style={{background:"#0e0e1e",border:"1px solid #1a1a2e",color:"#777",
                      borderRadius:6,minWidth:44,minHeight:44,fontSize:"1.2rem"}}>−</button>
                  <div style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid #1a1a2e",
                    borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:700,fontSize:"0.85rem",minHeight:44}}>{oQty}</div>
                  <button className="btn" onClick={()=>setOQty(q=>q+1)}
                    style={{background:"#0e0e1e",border:"1px solid #1a1a2e",color:"#777",
                      borderRadius:6,minWidth:44,minHeight:44,fontSize:"1.2rem"}}>+</button>
                </div>

                <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid #0f0f1e",
                  borderRadius:6,padding:"8px 11px",marginBottom:10,
                  fontSize:"clamp(0.58rem,2vw,0.65rem)",color:"#2a2a44"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span>Unit</span><span style={{color:"#aaa"}}>${sel.price.toFixed(2)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span>Total</span>
                    <span style={{color:oType==="buy"?"#ff4466":"#00ff88",fontWeight:700}}>
                      ${(sel.price*oQty).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button className="btn" onClick={executeTrade}
                  style={{width:"100%",minHeight:48,borderRadius:8,
                    fontFamily:"'Bebas Neue',sans-serif",
                    fontSize:"clamp(0.85rem,3.2vw,0.95rem)",letterSpacing:"0.14em",
                    background:oType==="buy"
                      ?"linear-gradient(135deg,#00ff88,#00bb55)"
                      :"linear-gradient(135deg,#ff4466,#bb0033)",
                    color:"#000",fontWeight:700,
                    boxShadow:oType==="buy"?"0 3px 14px rgba(0,255,136,.2)":"0 3px 14px rgba(255,68,102,.2)"}}>
                  {oType==="buy"?"BUY "+sel.symbol:"SELL "+sel.symbol}
                </button>
              </div>

              <div style={{flex:1,overflow:"auto",padding:"10px clamp(12px,4vw,16px)",
                WebkitOverflowScrolling:"touch"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.76rem",
                  letterSpacing:"0.14em",color:"#252540",marginBottom:8}}>MY HOLDINGS</div>
                {portfolio.length===0 && (
                  <div style={{color:"#161622",fontSize:"0.62rem",textAlign:"center",
                    padding:"20px 0",lineHeight:1.9}}>
                    No positions yet.<br/>Start trading! 🚀
                  </div>
                )}
                {portfolio.map(p=>{
                  const a=assets.find(x=>x.id===p.id); if(!a) return null;
                  const pnl=(a.price-p.avg)*p.qty, pct=((a.price-p.avg)/p.avg)*100;
                  return (
                    <div key={p.id} className="row" onClick={()=>pickAsset(p.id)}
                      style={{borderBottom:"1px solid #090916",padding:"8px 2px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:"0.9rem"}}>{a.emoji}</span>
                          <div>
                            <div style={{fontWeight:700,fontSize:"0.67rem"}}>{a.symbol}</div>
                            <div style={{color:"#1e1e30",fontSize:"0.55rem"}}>{p.qty}× avg ${p.avg.toFixed(2)}</div>
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontWeight:700,fontSize:"0.67rem"}}>${(a.price*p.qty).toFixed(2)}</div>
                          <div style={{color:pnl>=0?"#00ff88":"#ff4466",fontSize:"0.55rem",fontWeight:700}}>
                            {pnl>=0?"+":""}${pnl.toFixed(2)} ({pct>=0?"+":""}{pct.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── LEADERBOARD ── */}
          {tab==="board" && (
            <div style={{flex:1,overflow:"auto",padding:"12px clamp(10px,3vw,15px)",
              minHeight:0,WebkitOverflowScrolling:"touch"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",
                letterSpacing:"0.14em",color:"#252540",marginBottom:4}}>🏆 LIVE RANKINGS</div>
              <div style={{color:"#181828",fontSize:"0.56rem",marginBottom:12}}>Ranked by net worth</div>
              {board.map(p=>(
                <div key={p.name+p.rank} style={{display:"flex",alignItems:"center",gap:8,
                  padding:"7px 8px",marginBottom:4,borderRadius:8,
                  background:p.isMe?"rgba(124,111,255,0.1)":"rgba(255,255,255,0.015)",
                  border:"1px solid "+(p.isMe?"#7c6fff33":"transparent")}}>
                  <div style={{width:24,textAlign:"center",flexShrink:0,
                    fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",
                    color:p.rank===1?"#ffd700":p.rank===2?"#aaa":p.rank===3?"#cd7f32":"#1e1e30"}}>
                    {p.rank<=3?["🥇","🥈","🥉"][p.rank-1]:"#"+p.rank}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:"0.66rem",fontWeight:700,
                        color:p.isMe?"#9988ff":"#aaa",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {p.name}
                      </span>
                      {PLAN_BADGE[p.plan]&&<span style={{fontSize:"0.6rem"}}>{PLAN_BADGE[p.plan]}</span>}
                      {p.isMe&&<span style={{fontSize:"0.48rem",background:"#7c6fff33",
                        color:"#7c6fff",borderRadius:3,padding:"1px 4px"}}>YOU</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:"0.65rem",fontWeight:700,color:"#ccc"}}>{fmt(p.worth)}</div>
                    <div style={{fontSize:"0.53rem",color:p.pct>=0?"#00ff88":"#ff4466"}}>
                      {p.pct>=0?"+":""}{p.pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PLANS ── */}
          {tab==="plans" && (
            <div style={{flex:1,overflow:"auto",padding:"12px clamp(10px,3vw,15px)",
              minHeight:0,WebkitOverflowScrolling:"touch"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",
                letterSpacing:"0.14em",color:"#252540",marginBottom:4}}>💎 SUBSCRIPTION</div>
              {user&&<div style={{color:"#1e1e30",fontSize:"0.56rem",marginBottom:10}}>
                Current: <span style={{color:PLAN_COLOR[user.plan]}}>{user.plan.toUpperCase()}</span>
              </div>}
              <div style={{background:"#ff440011",border:"1px solid #ff440022",borderRadius:6,
                padding:"6px 10px",fontSize:"0.55rem",color:"#ff7744",marginBottom:12,lineHeight:1.5}}>
                ⚠️ Subscriptions unlock entertainment features only. Not a financial product.
              </div>
              {PLANS.map(p=>{
                const isCurr  = user?.plan===p.id;
                const currIdx = PLANS.findIndex(x=>x.id===(user?.plan||"free"));
                const thisIdx = PLANS.findIndex(x=>x.id===p.id);
                const isLower = thisIdx<currIdx;
                return (
                  <div key={p.id} style={{border:"1px solid "+(isCurr?p.accent:"#111122"),
                    borderRadius:10,padding:"12px 13px",marginBottom:10,position:"relative",
                    background:isCurr?p.accent+"0e":"rgba(255,255,255,0.01)"}}>
                    {p.popular&&!isCurr&&(
                      <div style={{position:"absolute",top:-9,right:12,background:"#7c6fff",
                        borderRadius:4,padding:"1px 7px",fontSize:"0.5rem",color:"#fff",letterSpacing:"0.1em"}}>
                        POPULAR
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",
                        letterSpacing:"0.1em",color:p.accent}}>{p.name}</span>
                      <div>
                        <span style={{color:"#ddd",fontWeight:700}}>{p.price}</span>
                        <span style={{color:"#333",fontSize:"0.58rem"}}>{p.per}</span>
                      </div>
                    </div>
                    <div style={{marginBottom:10}}>
                      {p.features.map((f,i)=>(
                        <div key={i} style={{display:"flex",gap:6,fontSize:"0.58rem",
                          color:"#3a3a50",padding:"2px 0"}}>
                          <span style={{color:p.accent}}>✓</span>{f}
                        </div>
                      ))}
                    </div>
                    {isCurr?(
                      <div style={{textAlign:"center",fontSize:"0.62rem",color:p.accent,
                        padding:"8px",background:p.accent+"0e",borderRadius:6}}>
                        ✓ Active Plan
                      </div>
                    ):isLower?(
                      <div style={{height:2}}/>
                    ):(
                      <button className="btn" onClick={()=>handleUpgrade(p.id)}
                        style={{width:"100%",minHeight:44,borderRadius:6,
                          background:p.accent+"1a",color:p.accent,
                          fontFamily:"'Bebas Neue',sans-serif",
                          fontSize:"clamp(0.75rem,2.8vw,0.82rem)",letterSpacing:"0.1em"}}>
                        UPGRADE TO {p.name} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast&&(
        <div className="toast" style={{
          position:"fixed",bottom:"clamp(14px,4vw,20px)",
          right:"clamp(10px,4vw,18px)",
          background:toast.type==="err"?"#ff4466":"#00ff88",
          color:"#000",padding:"10px 16px",borderRadius:8,
          fontWeight:700,fontSize:"clamp(0.65rem,2.5vw,0.73rem)",
          letterSpacing:"0.04em",
          boxShadow:"0 8px 24px rgba(0,0,0,.7)",
          zIndex:9999,pointerEvents:"none",
          maxWidth:"calc(100vw - 28px)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Footer disclaimer ── */}
      <div style={{padding:"5px 14px",background:"#030307",
        borderTop:"1px solid #0d0d1a",
        fontSize:"clamp(0.44rem,1.6vw,0.52rem)",
        color:"#151520",textAlign:"center",flexShrink:0}}>
        ODDEX VIBE — For entertainment only. Simulated prices. No real money. No financial services. Not regulated.
      </div>
    </div>
  );
}
