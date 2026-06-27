import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   ODDEX VIBE  —  Simulated Entertainment Trading Platform
   For entertainment only. No real money. No financial services.
   Prices are algorithm-generated simulations, not real market data.
═══════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "oddexvibe_save_v1";

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

// ─── Achievements ─────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id:"first_trade", emoji:"🎯", name:"First Trade",     desc:"Made your first trade" },
  { id:"big_spender", emoji:"💰", name:"Big Spender",     desc:"Spent over $5,000 in one trade" },
  { id:"diversified", emoji:"🌈", name:"Diversified",     desc:"Held 5 different assets at once" },
  { id:"profit",      emoji:"📈", name:"In The Green",    desc:"Reached a profit on any position" },
  { id:"whale_club",  emoji:"🐳", name:"Whale Club",      desc:"Net worth over $50,000" },
];

// ─── Quiz Questions (Junior + Senior, mixed topics) ───────────────────
// q=question, o=options array, a=correct index, lvl=junior/senior
const QUIZ_BANK = [
  // ═══ JUNIOR (+$300 / -$300) — easier, broad knowledge ═══
  { lvl:"junior", q:"What does 'BUY LOW, SELL HIGH' mean?", o:["Buy cheap, sell expensive","Buy expensive, sell cheap","Never sell","Only buy"], a:0 },
  { lvl:"junior", q:"How many continents are there on Earth?", o:["5","6","7","8"], a:2 },
  { lvl:"junior", q:"What gas do plants breathe in?", o:["Oxygen","Carbon dioxide","Nitrogen","Helium"], a:1 },
  { lvl:"junior", q:"What is 7 × 8?", o:["54","56","58","64"], a:1 },
  { lvl:"junior", q:"Who painted the Mona Lisa?", o:["Picasso","Van Gogh","Leonardo da Vinci","Michelangelo"], a:2 },
  { lvl:"junior", q:"What does 'WWW' stand for?", o:["World Wide Web","Web World Wide","Wide Web World","World Web Wide"], a:0 },
  { lvl:"junior", q:"What is the largest planet in our solar system?", o:["Earth","Saturn","Jupiter","Mars"], a:2 },
  { lvl:"junior", q:"What is a 'portfolio' in investing?", o:["A coffee type","Your collection of investments","A phone app","A bank"], a:1 },
  { lvl:"junior", q:"Which country has the Eiffel Tower?", o:["Italy","France","Spain","Germany"], a:1 },
  { lvl:"junior", q:"What is 144 ÷ 12?", o:["10","11","12","14"], a:2 },
  { lvl:"junior", q:"What does 'profit' mean?", o:["Money you lost","Money earned above cost","A type of tax","A loan"], a:1 },
  { lvl:"junior", q:"How many sides does a hexagon have?", o:["5","6","7","8"], a:1 },
  { lvl:"junior", q:"What is the closest star to Earth?", o:["The Moon","The Sun","Mars","Polaris"], a:1 },
  { lvl:"junior", q:"What does 'CPU' stand for?", o:["Central Processing Unit","Computer Power Unit","Central Power Unit","Core Processing Unit"], a:0 },
  { lvl:"junior", q:"In which year did World War 2 end?", o:["1943","1945","1947","1950"], a:1 },
  { lvl:"junior", q:"What does 'SELL' mean in trading?", o:["Give away free","Exchange your asset for cash","Buy more","Hold forever"], a:1 },
  { lvl:"junior", q:"If you BUY at $10 and SELL at $15, you made...?", o:["$5 loss","$5 profit","No change","$15 profit"], a:1 },
  { lvl:"junior", q:"What is a 'trade'?", o:["A gift","Buying or selling an asset","A type of loan","A bank account"], a:1 },
  { lvl:"junior", q:"What does the green color usually mean on a price?", o:["Price went down","Price went up","Market closed","Error"], a:1 },
  { lvl:"junior", q:"What does the red color usually mean on a price?", o:["Price went up","Price went down","Profit","Bonus"], a:1 },

  // ═══ SENIOR (+$300 / -$300) — harder, deeper knowledge ═══
  { lvl:"senior", q:"What is 'market volatility'?", o:["Steady prices","How fast/much prices swing","Total profit","A fee"], a:1 },
  { lvl:"senior", q:"What is the chemical symbol for Gold?", o:["Gd","Go","Au","Ag"], a:2 },
  { lvl:"senior", q:"What is the square root of 169?", o:["11","12","13","14"], a:2 },
  { lvl:"senior", q:"Who developed the theory of relativity?", o:["Newton","Einstein","Tesla","Darwin"], a:1 },
  { lvl:"senior", q:"What does 'liquidity' mean in finance?", o:["Water amount","How easily bought/sold","Total losses","Price color"], a:1 },
  { lvl:"senior", q:"Which planet is known as the Red Planet?", o:["Venus","Jupiter","Mars","Mercury"], a:2 },
  { lvl:"senior", q:"What is the powerhouse of the cell?", o:["Nucleus","Mitochondria","Ribosome","Membrane"], a:1 },
  { lvl:"senior", q:"What does 'RAM' stand for in computers?", o:["Random Access Memory","Rapid Access Memory","Read Access Memory","Run Access Memory"], a:0 },
  { lvl:"senior", q:"A 'bull market' means prices are...?", o:["Falling","Rising over time","Frozen","Random"], a:1 },
  { lvl:"senior", q:"What is 15% of 200?", o:["20","25","30","35"], a:2 },
  { lvl:"senior", q:"Which ancient civilization built the pyramids of Giza?", o:["Romans","Greeks","Egyptians","Mayans"], a:2 },
  { lvl:"senior", q:"What does 'P&L' stand for?", o:["Phone & Laptop","Profit & Loss","Price & Limit","Plan & Level"], a:1 },
  { lvl:"senior", q:"What is the speed of light (approx)?", o:["300,000 km/s","30,000 km/s","3,000 km/s","3 million km/s"], a:0 },
  { lvl:"senior", q:"What does 'HTTP' stand for?", o:["HyperText Transfer Protocol","High Transfer Text Protocol","HyperText Transmit Protocol","Home Transfer Text Protocol"], a:0 },
  { lvl:"senior", q:"'Diversification' mainly reduces...?", o:["Profit","Risk","Volume","Speed"], a:1 },
  { lvl:"senior", q:"What is a 'stop-loss' order?", o:["Buy more automatically","Auto-sell to limit losses","A trading fee","A bonus"], a:1 },
  { lvl:"senior", q:"What does 'going long' mean?", o:["Betting price will rise","Betting price will fall","Waiting forever","Selling everything"], a:0 },
  { lvl:"senior", q:"What does 'going short' mean?", o:["Betting price will rise","Betting price will fall","Buying slowly","Holding cash"], a:1 },
  { lvl:"senior", q:"What is 'ROI'?", o:["Rate Of Inflation","Return On Investment","Risk Of Interest","Range Of Income"], a:1 },
  { lvl:"senior", q:"A 'dividend' is...?", o:["A trading fee","A share of company profit paid to investors","A type of loss","A loan"], a:1 },

  // ═══ PRO (+$300 / -$300) — expert level ═══
  { lvl:"pro", q:"What does 'slippage' mean in trading?", o:["Falling down","Difference between expected & actual price","A bonus","A fee waiver"], a:1 },
  { lvl:"pro", q:"What is the hardest natural substance on Earth?", o:["Gold","Iron","Diamond","Quartz"], a:2 },
  { lvl:"pro", q:"What is 2 to the power of 10?", o:["512","1024","2048","256"], a:1 },
  { lvl:"pro", q:"Who wrote 'The Origin of Species'?", o:["Newton","Darwin","Mendel","Pasteur"], a:1 },
  { lvl:"pro", q:"What does 'API' stand for?", o:["Application Programming Interface","Advanced Programming Interface","Applied Program Interface","Auto Program Interface"], a:0 },
  { lvl:"pro", q:"'Compound interest' is interest on...?", o:["Only principal","Principal + accumulated interest","Only profit","A flat fee"], a:1 },
  { lvl:"pro", q:"What is the chemical formula for water?", o:["CO2","H2O","O2","NaCl"], a:1 },
  { lvl:"pro", q:"In what year did the Berlin Wall fall?", o:["1987","1989","1991","1993"], a:1 },
  { lvl:"pro", q:"What is a 'limit order'?", o:["Buy at any price","Set a max/min price to trade at","Trade for free","Skip fees"], a:1 },
  { lvl:"pro", q:"What is the smallest prime number?", o:["0","1","2","3"], a:2 },
  { lvl:"pro", q:"What does 'SQL' stand for?", o:["Structured Query Language","System Query Language","Simple Query Language","Standard Query Language"], a:0 },
  { lvl:"pro", q:"'Market cap' is calculated as...?", o:["Price only","Price × total units","Volume × price","Profit ÷ loss"], a:1 },
  { lvl:"pro", q:"Which element has atomic number 1?", o:["Helium","Oxygen","Hydrogen","Carbon"], a:2 },
  { lvl:"pro", q:"What does 'HODL' mean (crypto)?", o:["Sell fast","Hold long-term despite swings","A coin type","A trading bot"], a:1 },
  { lvl:"pro", q:"Who is known as the father of computers?", o:["Alan Turing","Charles Babbage","Bill Gates","Steve Jobs"], a:1 },
  { lvl:"pro", q:"What is 'arbitrage' in trading?", o:["A trading fee","Profiting from price differences across markets","A type of loss","Holding cash"], a:1 },
  { lvl:"pro", q:"What does 'bid-ask spread' mean?", o:["A type of order","Gap between buy & sell prices","A trading bonus","Total volume"], a:1 },
  { lvl:"pro", q:"What is a 'bear trap'?", o:["A real trap","False signal that price will fall","A safe investment","A trading bot"], a:1 },
  { lvl:"pro", q:"What does 'DCA' stand for?", o:["Dollar Cost Averaging","Daily Crypto Analysis","Direct Cash Account","Double Cash Add"], a:0 },
  { lvl:"pro", q:"What is 'market liquidity' best described as?", o:["Water level","Ease of buying/selling without moving price","Total profit","Number of users"], a:1 },

  // ═══ REAL TRADING (Binance-style) — added across pro/senior ═══
  { lvl:"senior", q:"What is 'spot trading'?", o:["Buying/selling assets for immediate delivery","Trading in space","A type of loan","Future contracts only"], a:0 },
  { lvl:"senior", q:"What does 'leverage' let you do? 🚀", o:["Trade bigger with borrowed money","Trade for free","Avoid all risk","Skip fees"], a:0 },
  { lvl:"senior", q:"What is '10x leverage'?", o:["10% profit","Controlling 10× your money's worth","10 trades free","A 10% fee"], a:1 },
  { lvl:"senior", q:"What is a 'hedge' in trading? 🛡️", o:["A garden plant","A trade to reduce risk of another","A type of profit","A free bonus"], a:1 },
  { lvl:"senior", q:"What is 'futures' trading?", o:["Predicting lottery","Contracts to buy/sell later at set price","Time travel","Only spot trading"], a:1 },
  { lvl:"senior", q:"What is 'margin' in trading?", o:["Page edge","Borrowed money to trade larger","A trading fee","A profit type"], a:1 },
  { lvl:"senior", q:"What is a 'candlestick' on a chart? 🕯️", o:["A real candle","A bar showing open/close/high/low price","A type of coin","An error"], a:1 },
  { lvl:"senior", q:"On a candlestick, what does a GREEN candle usually mean?", o:["Price fell","Price rose (close > open)","Market closed","An error"], a:1 },
  { lvl:"senior", q:"What is 'market order' vs 'limit order'?", o:["Same thing","Market = instant, Limit = set price","Both are fees","Both are bonuses"], a:1 },
  { lvl:"senior", q:"What does 'liquidated' mean in leverage trading? 💀", o:["You won big","Your position auto-closed at a loss","You got a bonus","Free trade"], a:1 },

  { lvl:"pro", q:"What is 'long position' in futures?", o:["Bet price goes up","Bet price goes down","Hold cash","A loan"], a:0 },
  { lvl:"pro", q:"What is 'short position' in futures?", o:["Bet price goes up","Bet price goes down","Buy and hold","A bonus"], a:1 },
  { lvl:"pro", q:"What is 'funding rate' in perpetual futures?", o:["A government tax","Periodic payment between long & short traders","A withdrawal fee","Free money"], a:1 },
  { lvl:"pro", q:"What does 'cross margin' mean?", o:["Using full balance as collateral","No margin at all","A free trade","A trading bot"], a:0 },
  { lvl:"pro", q:"What is 'isolated margin'?", o:["Margin limited to one position only","Unlimited margin","No risk trade","A type of coin"], a:0 },
  { lvl:"pro", q:"What is 'support' on a chart? 📉", o:["Customer service","Price level where buying tends to rise","A trading fee","The chart color"], a:1 },
  { lvl:"pro", q:"What is 'resistance' on a chart? 📈", o:["Price level where selling tends to happen","A free bonus","A trading bot","Customer help"], a:0 },
  { lvl:"pro", q:"What is a 'moving average' (MA)?", o:["A walking person","Average price over a time period","A type of fee","A trading bot"], a:1 },
  { lvl:"pro", q:"What is 'RSI' indicator?", o:["Really Smart Investor","Measures if asset is overbought/oversold","A trading fee","A coin type"], a:1 },
  { lvl:"pro", q:"What is a 'pump and dump'? ⚠️", o:["Gym exercise","Artificially inflating then selling — a scam","A safe strategy","Free profit"], a:1 },

  { lvl:"junior", q:"What does 'HODL' mean (fun crypto slang)? 💎🙌", o:["Sell fast","Hold on for dear life","A coin","A bot"], a:1 },
  { lvl:"junior", q:"What is 'crypto'?", o:["A secret code","Digital currency like Bitcoin","A board game","A bank"], a:1 },
  { lvl:"junior", q:"What is 'Bitcoin'?", o:["A real metal coin","The first cryptocurrency","A video game","A type of bank"], a:1 },
  { lvl:"junior", q:"If a chart goes UP steeply, traders feel...? 🚀", o:["Sad","Bullish/excited","Bored","Asleep"], a:1 },
  { lvl:"junior", q:"What is a 'wallet' in crypto?", o:["Leather pouch","Where you store digital coins","A bank branch","A trading fee"], a:1 },

  // Math + leverage calculations
  { lvl:"senior", q:"With 5x leverage, $100 controls how much?", o:["$105","$500","$50","$1000"], a:1 },
  { lvl:"senior", q:"You buy 2 units at $50 each. Total cost?", o:["$50","$100","$150","$200"], a:1 },
  { lvl:"pro", q:"With 10x leverage, a 10% price drop means...?", o:["10% loss","100% loss (liquidated)","No loss","10% gain"], a:1 },
  { lvl:"pro", q:"Bought at $200, sold at $250, 3 units. Profit?", o:["$50","$100","$150","$200"], a:2 },
  { lvl:"junior", q:"You have $1000, spend $300. How much left?", o:["$600","$700","$800","$300"], a:1 },

  // ═══ SECRET (+$900 to +$3000 / -$300) — unlocks after achievements ═══
  { lvl:"secret", q:"What is a 'short squeeze' in trading?", o:["A tight schedule","Rapid price rise forcing short-sellers to buy","A small profit","A type of order"], a:1, reward:900 },
  { lvl:"secret", q:"What is the value of Pi to 4 decimals?", o:["3.1415","3.1416","3.1414","3.1417"], a:1, reward:1200 },
  { lvl:"secret", q:"What does 'blockchain' primarily provide?", o:["Faster internet","A decentralized ledger","Cheaper phones","Free money"], a:1, reward:1500 },
  { lvl:"secret", q:"In economics, what is 'inflation'?", o:["Prices falling","General rise in prices over time","More jobs","Less tax"], a:1, reward:1800 },
  { lvl:"secret", q:"What is the largest organ in the human body?", o:["Heart","Liver","Skin","Brain"], a:2, reward:2000 },
  { lvl:"secret", q:"What does 'leverage' allow a trader to do?", o:["Trade with borrowed money for bigger positions","Trade for free","Avoid all risk","Skip taxes"], a:0, reward:2500 },
  { lvl:"secret", q:"Which programming language runs natively in browsers?", o:["Python","Java","JavaScript","C++"], a:2, reward:3000 },
];

// Shuffle helper — returns new array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate Binance-style candlestick data per asset + timeframe
// Deterministic (seeded) so it's stable but DIFFERENT for each timeframe
function genCandles(seed, basePrice, timeframe) {
  const counts = { "1D": 24, "1W": 28, "1M": 30, "1Y": 24, "ALL": 40 };
  const volMul = { "1D": 0.02, "1W": 0.05, "1M": 0.10, "1Y": 0.25, "ALL": 0.45 };
  const n = counts[timeframe] || 24;
  const v = volMul[timeframe] || 0.02;
  const tfSeed = seed * 1000 + timeframe.charCodeAt(0) + (timeframe.charCodeAt(1) || 0);
  const candles = [];
  let price = basePrice * (0.8 + (Math.abs(Math.sin(tfSeed)) * 0.4)); // varied start
  for (let i = 0; i < n; i++) {
    const r1 = Math.sin(tfSeed + i * 12.9898) * 43758.5453;
    const r2 = Math.sin(tfSeed + i * 78.233) * 12543.123;
    const noise1 = (r1 - Math.floor(r1)) - 0.48;
    const noise2 = (r2 - Math.floor(r2)) - 0.5;
    const open = price;
    const change = noise1 * price * v;
    const close = Math.max(0.001, open + change);
    const high = Math.max(open, close) * (1 + Math.abs(noise2) * v * 0.5);
    const low = Math.min(open, close) * (1 - Math.abs(noise2) * v * 0.5);
    candles.push({ open, close, high, low });
    price = close;
  }
  return candles;
}

// ─── Helpers ──────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function writeSave(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── Sparkline (safe render) ──────────────────────────────────────────
function Sparkline({ up, seed }) {
  const pts = Array.from({ length: 18 }, (_, i) => {
    const r    = Math.abs(Math.sin(seed * 127.1 + i * 311.7));
    const base = up ? 30 + i * 1.3 : 50 - i * 1.3;
    return Math.max(5, Math.min(55, base + (r - 0.5) * 18));
  });
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const rng = hi - lo > 0 ? hi - lo : 1;
  const d = pts.map((y, i) =>
    (i === 0 ? "M" : "L") + " " + ((i / 17) * 92).toFixed(1) + " " + (44 - ((y - lo) / rng) * 34).toFixed(1)
  ).join(" ");
  const color = up ? "#00ff88" : "#ff4466";
  return (
    <svg width="72" height="28" viewBox="0 0 92 44" style={{ display:"block", overflow:"visible" }}>
      {pts.length >= 2
        ? <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        : <circle cx="46" cy="22" r="3" fill={color} />}
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
      color: up ? "#00ff88" : "#ff4466", fontWeight:700,
      fontSize:"clamp(0.75rem, 2.5vw, 0.92rem)",
      background: flash ? (up ? "rgba(0,255,136,0.18)" : "rgba(255,68,102,0.18)") : "transparent",
      borderRadius:3, padding:"1px 4px", transition:"background 0.25s",
      fontFamily:"'JetBrains Mono', monospace", minWidth:64,
      display:"inline-block", textAlign:"right",
    }}>
      ${val.toFixed(2)}
    </span>
  );
}

// ─── Confetti burst (CSS-only, lightweight) ───────────────────────────
function Burst({ trigger, color }) {
  if (!trigger) return null;
  const bits = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div style={{ position:"fixed", top:"50%", left:"50%", pointerEvents:"none", zIndex:9998 }}>
      {bits.map(i => {
        const ang = (i / 12) * Math.PI * 2;
        const dist = 60 + (i % 3) * 20;
        return (
          <span key={i} style={{
            position:"absolute",
            width:8, height:8, borderRadius:"50%",
            background: color,
            animation: "burst 0.6s ease-out forwards",
            ["--tx"]: Math.cos(ang) * dist + "px",
            ["--ty"]: Math.sin(ang) * dist + "px",
          }} />
        );
      })}
    </div>
  );
}

// ─── Onboarding ────────────────────────────────────────────────────────
function Onboarding({ onStart }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("free");
  const [nameErr, setNameErr] = useState(false);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(2,2,10,0.97)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:"4vw", overflowY:"auto" }}>
      <div style={{ background:"#09091c", border:"1px solid #1e1e38", borderRadius:16,
        padding:"clamp(20px,5vw,40px) clamp(16px,4vw,34px)", maxWidth:560, width:"100%", margin:"auto" }}>
        <div style={{ background:"#ff440011", border:"1px solid #ff440033", borderRadius:6,
          padding:"6px 10px", fontSize:"clamp(0.58rem,2vw,0.64rem)", color:"#ff7744",
          marginBottom:18, letterSpacing:"0.04em" }}>
          ⚠️ FOR ENTERTAINMENT ONLY — Simulated prices. No real money. No financial services.
        </div>
        {/* Step indicator */}
        <div style={{ display:"flex", gap:6, marginBottom:18, justifyContent:"center" }}>
          {[0,1].map(s => (
            <div key={s} style={{ width: step===s ? 24 : 8, height:8, borderRadius:4,
              background: step===s ? "#7c6fff" : "#2a2a40", transition:"all 0.25s" }} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.6rem,7vw,2.2rem)", letterSpacing:"0.1em", marginBottom:4 }}>
              ODD<span style={{color:"#7c6fff"}}>EX</span>{" "}
              <span style={{color:"#00ff88", fontSize:"0.7em"}}>VIBE</span>
            </div>
            <div style={{ color:"#999", fontSize:"clamp(0.72rem,2.6vw,0.8rem)", marginBottom:24, lineHeight:1.6 }}>
              The world's only exchange for vibes, drama,<br/>goose rumors and other odd assets.
            </div>
            <div style={{ color:"#aaa", fontSize:"clamp(0.6rem,2vw,0.66rem)", letterSpacing:"0.12em", marginBottom:6 }}>
              CHOOSE A TRADER NAME
            </div>
            <input value={name} onChange={e => { setName(e.target.value); setNameErr(false); }}
              onKeyDown={e => e.key === "Enter" && name.trim() && setStep(1)}
              placeholder="e.g. VibeGod420" maxLength={16} autoFocus
              style={{ width:"100%", padding:"clamp(11px,3vw,14px) 14px",
                border: nameErr ? "1px solid #ff4466" : "1px solid #1e1e38",
                marginBottom: nameErr ? 4 : 16, display:"block",
                fontSize:"clamp(0.85rem,3vw,0.95rem)" }} />
            {nameErr && <div style={{ color:"#ff4466", fontSize:"0.74rem", marginBottom:12 }}>Pick a name to continue.</div>}
            <button onClick={() => { if (!name.trim()) { setNameErr(true); return; } setStep(1); }}
              style={{ width:"100%", minHeight:50, border:"none", borderRadius:8, cursor:"pointer",
                fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.95rem,3.5vw,1.15rem)",
                letterSpacing:"0.14em", background:"linear-gradient(135deg,#7c6fff,#4433cc)", color:"#fff" }}>
              NEXT — CHOOSE PLAN →
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.1rem,5vw,1.5rem)", letterSpacing:"0.08em", marginBottom:4 }}>
              Hey <span style={{color:"#7c6fff"}}>{name}</span> 👋
            </div>
            <div style={{ color:"#999", fontSize:"clamp(0.72rem,2.6vw,0.78rem)", marginBottom:16 }}>
              Pick your plan — tap one, then start trading.
            </div>
            {PLANS.map(p => (
              <div key={p.id} onClick={() => setPlan(p.id)} style={{
                border:"2px solid " + (plan === p.id ? p.accent : "#2a2a40"),
                borderRadius:10, padding:"13px 14px", marginBottom:10, cursor:"pointer", position:"relative",
                background: plan === p.id ? p.accent + "18" : "rgba(255,255,255,0.02)", transition:"all 0.15s" }}>
                {p.popular && plan !== p.id && (
                  <div style={{ position:"absolute", top:-9, right:12, background:"#7c6fff",
                    borderRadius:4, padding:"1px 7px", fontSize:"0.55rem", color:"#fff", letterSpacing:"0.1em" }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:15, height:15, borderRadius:"50%", border:"2px solid " + p.accent,
                      background: plan === p.id ? p.accent : "transparent", transition:"all 0.15s", flexShrink:0 }}/>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.95rem,4vw,1.1rem)", letterSpacing:"0.1em", color:p.accent }}>
                      {p.name}
                    </span>
                  </div>
                  <div>
                    <span style={{ color:"#fff", fontWeight:700 }}>{p.price}</span>
                    <span style={{ color:"#888", fontSize:"0.74rem" }}>{p.per}</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {p.features.map((f, i) => (
                    <span key={i} style={{ fontSize:"clamp(0.62rem,2vw,0.68rem)", color:"#999",
                      background:"#0c0c1e", borderRadius:4, padding:"2px 6px" }}>{f}</span>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:6 }}>
              <button onClick={() => setStep(0)} style={{
                minWidth:90, minHeight:50, border:"1px solid #2a2a40", borderRadius:8, cursor:"pointer",
                fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.85rem,3vw,1rem)", letterSpacing:"0.1em",
                background:"transparent", color:"#888" }}>
                ← BACK
              </button>
              <button onClick={() => onStart(name.trim(), plan)} style={{
                flex:1, minHeight:50, border:"none", borderRadius:8, cursor:"pointer",
                fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.95rem,3.5vw,1.15rem)", letterSpacing:"0.14em",
                background: plan === "whale" ? "linear-gradient(135deg,#00ff88,#009955)"
                  : plan === "pro" ? "linear-gradient(135deg,#7c6fff,#4433cc)"
                  : "linear-gradient(135deg,#888,#555)",
                color: plan === "whale" ? "#000" : "#fff", fontWeight:700 }}>
                START TRADING 🚀
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Payment loader ────────────────────────────────────────────────────
function PaymentLoader({ plan }) {
  const p = PLANS.find(x => x.id === plan);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const labels = ["Connecting...", "Processing payment...", "Activated! 🎉"];
  const colors = ["#7c6fff", "#ffaa00", "#00ff88"];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(2,2,10,0.96)", zIndex:8000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#0c0c1e", border:"1px solid " + (p ? p.accent : "#999"),
        borderRadius:16, padding:"36px 32px", maxWidth:320, width:"90%", textAlign:"center" }}>
        <div style={{ fontSize:"2.4rem", marginBottom:14 }}>{phase === 2 ? "✓" : (p && p.id === "whale" ? "👑" : "💳")}</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:"0.1em",
          color: p ? p.accent : "#fff", marginBottom:8 }}>
          {p ? p.name + " PLAN" : "UPGRADING"}
        </div>
        <div style={{ color:colors[phase], fontSize:"0.75rem", fontWeight:700, letterSpacing:"0.08em" }}>
          {labels[phase]}
        </div>
        {phase < 2 && (
          <div style={{ marginTop:16, height:3, background:"#1a1a2e", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:2, background: p ? p.accent : "#7c6fff",
              width: phase === 0 ? "30%" : "80%", transition:"width 0.8s ease" }}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Achievement toast ─────────────────────────────────────────────────
function AchievementPop({ ach }) {
  if (!ach) return null;
  return (
    <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)",
      background:"linear-gradient(135deg,#1a1a2e,#0d0d1e)", border:"1px solid #7c6fff66",
      borderRadius:12, padding:"10px 18px", zIndex:9997, display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 32px rgba(124,111,255,0.3)", animation:"achin 0.4s ease", maxWidth:"90vw" }}>
      <span style={{ fontSize:"1.6rem" }}>{ach.emoji}</span>
      <div>
        <div style={{ fontSize:"0.63rem", color:"#7c6fff", letterSpacing:"0.12em", fontWeight:700 }}>ACHIEVEMENT UNLOCKED</div>
        <div style={{ fontSize:"0.75rem", color:"#fff", fontWeight:700 }}>{ach.name}</div>
        <div style={{ fontSize:"0.79rem", color:"#666" }}>{ach.desc}</div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────
export default function OddexVibe() {
  const saved = loadSave();

  const [user,      setUser]      = useState(saved?.user ?? null);
  const [tab,       setTab]       = useState("trade");
  const [assets,    setAssets]    = useState(() => ASSETS.map(a => ({ ...a, price:a.basePrice, change:0 })));
  const [selId,     setSelId]     = useState(1);
  const [chart,     setChart]     = useState([]);
  const [portfolio, setPortfolio] = useState(saved?.portfolio ?? []);
  const [balance,   setBalance]   = useState(saved?.balance ?? 10000);
  const [achieved,  setAchieved]  = useState(saved?.achieved ?? []);
  const [oQty,      setOQty]      = useState(1);
  const [oType,     setOType]     = useState("buy");
  const [timeframe, setTimeframe] = useState("1D");
  const [toast,     setToast]     = useState(null);
  const [payLoader, setPayLoader] = useState(null);
  const [pwaPrompt, setPwaPrompt] = useState(false);
  const [achPop,    setAchPop]    = useState(null);
  const [burst,     setBurst]     = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Quiz state
  const [quizLevel, setQuizLevel] = useState("junior");
  const [quizQ, setQuizQ] = useState(null);        // current question object
  const [quizOpts, setQuizOpts] = useState([]);     // shuffled options with original index
  const [quizAnswered, setQuizAnswered] = useState(null); // null | {picked, correct}
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizStats, setQuizStats] = useState(saved?.quizStats ?? { correct:0, wrong:0, earned:0 });
  const [pendingReward, setPendingReward] = useState(0);
  const [askedQs, setAskedQs] = useState([]); // questions already shown this session

  const toastRef = useRef(null);
  const rafRef = useRef(null);
  const lastTickRef = useRef(0);
  const deferRef = useRef(null);
  const achPopRef = useRef(null);

  const sel = assets.find(a => a.id === selId) || assets[0];
  const portVal = portfolio.reduce((s, p) => { const a = assets.find(x => x.id === p.id); return s + (a ? a.price : 0) * p.qty; }, 0);
  const netWorth = balance + portVal;

  // ══ Save to localStorage whenever key data changes ══════════════════
  useEffect(() => {
    if (user) writeSave({ user, balance, portfolio, achieved, quizStats });
  }, [user, balance, portfolio, achieved, quizStats]);

  // ══ PWA install prompt ══════════════════════════════════════════════
  useEffect(() => {
    const onPrompt = e => { e.preventDefault(); deferRef.current = e; };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isMobile && !isStandalone) {
      const timer = setTimeout(() => setPwaPrompt(true), 12000);
      return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", onPrompt); };
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function handleAddToHome() {
    if (deferRef.current) { deferRef.current.prompt(); deferRef.current.userChoice.then(() => { deferRef.current = null; }); }
    setPwaPrompt(false);
  }

  // ══ Price simulator (rAF, every 3s) ═════════════════════════════════
  useEffect(() => {
    function tick(ts) {
      if (ts - lastTickRef.current >= 3000) {
        lastTickRef.current = ts;
        setAssets(prev => prev.map(a => {
          const r = ((Math.sin(ts * 0.001 + a.id * 17.3) + 1) / 2);
          const swing = (r - 0.48) * a.price * a.volatility;
          const newPrice = Math.max(0.001, a.price + swing);
          const change = parseFloat(((newPrice - a.basePrice) / a.basePrice * 100).toFixed(2));
          return { ...a, price: newPrice, change };
        }));
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => { setChart(prev => [...prev, { v: sel.price }].slice(-80)); }, [sel.price, selId]);

  const pickAsset = useCallback(id => { setSelId(id); setChart([]); }, []);

  const showToast = useCallback((msg, type = "ok") => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ══ Achievement unlock helper ═══════════════════════════════════════
  const unlock = useCallback((id) => {
    setAchieved(prev => {
      if (prev.includes(id)) return prev;
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        setAchPop(ach);
        if (achPopRef.current) clearTimeout(achPopRef.current);
        achPopRef.current = setTimeout(() => setAchPop(null), 3500);
      }
      return [...prev, id];
    });
  }, []);

  // ══ Trade ════════════════════════════════════════════════════════════
  function executeTrade() {
    const price = sel.price;
    const cost = price * oQty;
    if (oType === "buy") {
      if (cost > balance) { showToast("Not enough balance 💸", "err"); return; }
      const luck = 1 + (Math.random() - 0.5) * sel.volatility * 2;
      const effPrice = parseFloat((price * luck).toFixed(4));
      setBalance(b => parseFloat((b - cost).toFixed(2)));
      setPortfolio(prev => {
        const ex = prev.find(p => p.id === selId);
        let next;
        if (ex) next = prev.map(p => p.id === selId
          ? { ...p, qty: p.qty + oQty, avg: parseFloat(((p.avg * p.qty + effPrice * oQty) / (p.qty + oQty)).toFixed(4)) } : p);
        else next = [...prev, { id: selId, qty: oQty, avg: effPrice }];
        if (next.length >= 5) unlock("diversified");
        return next;
      });
      unlock("first_trade");
      if (cost >= 5000) unlock("big_spender");
      setBurst(true); setTimeout(() => setBurst(false), 650);
      const slip = ((luck - 1) * 100).toFixed(1);
      showToast("Bought " + oQty + " " + sel.symbol + " (slip " + (luck > 1 ? "+" : "") + slip + "%) ✅");
    } else {
      const held = portfolio.find(p => p.id === selId);
      if (!held || held.qty < oQty) { showToast("You don't own enough 😭", "err"); return; }
      setBalance(b => parseFloat((b + cost).toFixed(2)));
      setPortfolio(prev => prev.map(p => p.id === selId ? { ...p, qty: p.qty - oQty } : p).filter(p => p.qty > 0));
      unlock("first_trade");
      showToast("Sold " + oQty + " " + sel.symbol + " 💰");
    }
    setOQty(1);
  }

  // ══ Profit + whale achievements (check on every tick) ═══════════════
  useEffect(() => {
    if (netWorth >= 50000) unlock("whale_club");
    for (const p of portfolio) {
      const a = assets.find(x => x.id === p.id);
      if (a && a.price > p.avg) { unlock("profit"); break; }
    }
  }, [netWorth, portfolio, assets, unlock]);

  function handleStart(name, plan) {
    setUser({ name, plan });
    setBalance(PLAN_CASH[plan]);
    setPortfolio([]);
    setAchieved([]);
  }

  function handleUpgrade(planId) {
    if (!user || user.plan === planId) return;
    setPayLoader(planId);
    setTimeout(() => {
      setPayLoader(null);
      setUser(prev => ({ ...prev, plan: planId }));
      setBalance(PLAN_CASH[planId]);
      setPortfolio([]);
      showToast("Welcome to " + planId.toUpperCase() + " 🎉");
      setTab("trade");
    }, 2000);
  }

  // ══ Quiz logic ══════════════════════════════════════════════════════
  function loadQuestion(level) {
    const pool = QUIZ_BANK.filter(q => q.lvl === level);
    // Filter out questions already asked this session
    let available = pool.filter(q => !askedQs.includes(q.q));
    // If all asked, reset (start fresh round)
    if (available.length === 0) {
      available = pool;
      setAskedQs([]);
    }
    const q = available[Math.floor(Math.random() * available.length)];
    setAskedQs(prev => [...prev, q.q]);
    const opts = shuffle(q.o.map((text, idx) => ({ text, idx })));
    setQuizQ(q);
    setQuizOpts(opts);
    setQuizAnswered(null);
  }

  function startQuiz(level) {
    setQuizLevel(level);
    setAskedQs([]); // fresh round, no repeats
    // load first question from this level directly (askedQs is async)
    const pool = QUIZ_BANK.filter(q => q.lvl === level);
    const q = pool[Math.floor(Math.random() * pool.length)];
    setAskedQs([q.q]);
    const opts = shuffle(q.o.map((text, idx) => ({ text, idx })));
    setQuizQ(q);
    setQuizOpts(opts);
    setQuizAnswered(null);
  }

  function answerQuiz(pickedIdx) {
    if (quizAnswered) return; // already answered
    const correct = pickedIdx === quizQ.a;
    // junior/senior/pro = 300. secret uses the question's own reward field.
    const reward = quizLevel === "secret" ? (quizQ.reward || 900) : 300;
    const penalty = 300;
    setQuizAnswered({ picked: pickedIdx, correct });
    if (correct) {
      setPendingReward(reward); // wait for user to choose CASH or PORTFOLIO
      setQuizStreak(s => s + 1);
      setQuizStats(st => ({ ...st, correct: st.correct + 1, earned: st.earned + reward }));
      setBurst(true); setTimeout(() => setBurst(false), 650);
      showToast("Correct! +$" + reward + " 🎉 — choose where to add it");
    } else {
      setBalance(b => parseFloat(Math.max(0, b - penalty).toFixed(2)));
      setQuizStreak(0);
      setQuizStats(st => ({ ...st, wrong: st.wrong + 1, earned: st.earned - penalty }));
      showToast("Wrong! -$" + penalty + " 😬", "err");
    }
  }

  // User chooses where to put quiz winnings
  function claimReward(target) {
    if (!pendingReward) return;
    if (target === "cash") {
      setBalance(b => parseFloat((b + pendingReward).toFixed(2)));
      showToast("+$" + pendingReward + " added to CASH ✅");
    } else {
      // add to portfolio: buy that $ worth of the currently selected asset
      const qty = pendingReward / sel.price;
      setPortfolio(prev => {
        const ex = prev.find(p => p.id === selId);
        if (ex) return prev.map(p => p.id === selId
          ? { ...p, qty: p.qty + qty, avg: parseFloat(((p.avg * p.qty + sel.price * qty) / (p.qty + qty)).toFixed(4)) } : p);
        return [...prev, { id: selId, qty, avg: sel.price }];
      });
      showToast("+$" + pendingReward + " invested in " + sel.symbol + " 📈");
    }
    setPendingReward(0);
  }

  function handleReset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setUser(null);
    setBalance(10000);
    setPortfolio([]);
    setAchieved([]);
    setQuizStats({ correct:0, wrong:0, earned:0 });
    setQuizQ(null);
    setConfirmReset(false);
    setTab("trade");
  }

  const board = user
    ? [{ name:user.name, worth:netWorth, pct:0, plan:user.plan, isMe:true }, ...LEADERBOARD]
        .sort((a, b) => b.worth - a.worth).map((p, i) => ({ ...p, rank:i+1 }))
    : LEADERBOARD.map((p, i) => ({ ...p, rank:i+1, isMe:false }));

  const CW = 500, CH = 100;
  // Binance-style candlesticks — change with timeframe
  const candles = genCandles(sel.id, sel.basePrice, timeframe);
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const cLo = Math.min(...allPrices) * 0.998;
  const cHi = Math.max(...allPrices) * 1.002;
  const cRng = cHi - cLo > 0 ? cHi - cLo : 1;
  const candleW = CW / candles.length;
  const yOf = (p) => CH - ((p - cLo) / cRng) * CH * 0.9 - CH * 0.05;
  const cUp = candles.length > 1 && candles[candles.length - 1].close >= candles[0].open;
  const CC = cUp ? "#00ff88" : "#ff4466";

  const planColor = user ? PLAN_COLOR[user.plan] : "#666";
  const planBadge = user ? PLAN_BADGE[user.plan] : "";

  return (
    <div style={{ fontFamily:"'JetBrains Mono','Courier New',monospace", background:"#040409", color:"#ddd",
      minHeight:"100dvh", display:"flex", flexDirection:"column", overflow:"hidden", maxWidth:"100vw" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#05050e; }
        ::-webkit-scrollbar-thumb { background:#1a1a2e; border-radius:2px; }
        .row { transition:background 0.14s; cursor:pointer; }
        .row:hover, .row:active { background:rgba(255,255,255,0.05) !important; }
        .btn { transition:all 0.14s; cursor:pointer; border:none; -webkit-tap-highlight-color:transparent; }
        .btn:hover { filter:brightness(1.15); }
        .btn:active { transform:scale(0.96); }
        .tab-btn { transition:all 0.14s; cursor:pointer; border:none; background:transparent; -webkit-tap-highlight-color:transparent; }
        input { background:#0d0d20; border:1px solid #1e1e38; border-radius:7px; color:#fff; font-family:'JetBrains Mono',monospace; outline:none; transition:border 0.2s; width:100%; }
        input:focus { border-color:#7c6fff; }
        @keyframes ticker { 0% { transform:translateX(100vw); } 100% { transform:translateX(-100%); } }
        .tick { display:inline-block; animation:ticker 32s linear infinite; white-space:nowrap; }
        @keyframes toastin { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .toast { animation:toastin 0.22s ease; }
        @keyframes achin { from { opacity:0; transform:translate(-50%,-12px); } to { opacity:1; transform:translate(-50%,0); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .hot { animation:pulse 1.6s infinite; }
        @keyframes pwabounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
        .pwa-banner { animation:pwabounce 2s ease infinite; }
        @keyframes burst { from { transform:translate(0,0) scale(1); opacity:1; } to { transform:translate(var(--tx),var(--ty)) scale(0); opacity:0; } }
        .main-grid { display:flex; flex-direction:column; flex:1; overflow:hidden; min-height:0; }
        .left-col { display:flex; flex-direction:column; overflow:hidden; min-height:0; flex:1; }
        .right-col { border-top:1px solid #111122; border-left:none; flex-shrink:0; display:flex; flex-direction:column; max-height:55vh; }
        @media (min-width:768px) {
          .main-grid { flex-direction:row; }
          .right-col { border-left:1px solid #111122; border-top:none; max-height:none; width:380px; flex-shrink:0; }
        }
      `}</style>

      {!user && <Onboarding onStart={handleStart} />}
      {payLoader && <PaymentLoader plan={payLoader} />}
      <Burst trigger={burst} color={oType === "buy" ? "#00ff88" : "#ff4466"} />
      <AchievementPop ach={achPop} />

      {/* Reset confirm modal */}
      {confirmReset && (
        <div style={{ position:"fixed", inset:0, background:"rgba(2,2,10,0.9)", zIndex:8500,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#0c0c1e", border:"1px solid #ff446644", borderRadius:14, padding:"24px 22px", maxWidth:320, width:"90%", textAlign:"center" }}>
            <div style={{ fontSize:"2rem", marginBottom:10 }}>⚠️</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem", letterSpacing:"0.08em", marginBottom:6 }}>RESET ACCOUNT?</div>
            <div style={{ color:"#666", fontSize:"0.73rem", marginBottom:18, lineHeight:1.6 }}>
              This deletes your name, balance, holdings and achievements. Cannot be undone.
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn" onClick={() => setConfirmReset(false)}
                style={{ flex:1, minHeight:42, borderRadius:8, background:"#1a1a2e", color:"#aaa", fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.85rem", letterSpacing:"0.1em" }}>
                CANCEL
              </button>
              <button className="btn" onClick={handleReset}
                style={{ flex:1, minHeight:42, borderRadius:8, background:"#ff4466", color:"#000", fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.85rem", letterSpacing:"0.1em", fontWeight:700 }}>
                RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA banner */}
      {pwaPrompt && (
        <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
          background:"#1a1a2e", border:"1px solid #7c6fff55", borderRadius:12, padding:"12px 18px", zIndex:5000,
          display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(0,0,0,0.7)", maxWidth:"90vw" }} className="pwa-banner">
          <span style={{fontSize:"1.4rem"}}>📲</span>
          <div>
            <div style={{fontSize:"0.77rem",fontWeight:700,color:"#ddd",marginBottom:2}}>Add ODDEX VIBE to Home Screen</div>
            <div style={{fontSize:"0.79rem",color:"#555"}}>Trade on the go, like a real app</div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button className="btn" onClick={handleAddToHome} style={{background:"#7c6fff",color:"#fff",borderRadius:6,padding:"6px 10px",fontSize:"0.79rem",fontWeight:700,minHeight:36}}>ADD</button>
            <button className="btn" onClick={() => setPwaPrompt(false)} style={{background:"#888899",color:"#555",borderRadius:6,padding:"6px 8px",fontSize:"0.79rem",minHeight:36}}>✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ padding:"clamp(8px,2vw,12px) clamp(12px,4vw,20px)", borderBottom:"1px solid #111122",
        background:"rgba(4,4,9,0.98)", display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0, zIndex:100, flexWrap:"wrap", gap:8 }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.3rem,5vw,1.7rem)", letterSpacing:"0.1em", lineHeight:1 }}>
            ODD<span style={{color:"#7c6fff"}}>EX</span>{" "}
            <span style={{color:"#00ff88",fontSize:"0.65em"}}>VIBE</span>
          </div>
          <span style={{ background:"#7c6fff22", border:"1px solid #7c6fff44", borderRadius:4, padding:"2px 6px",
            fontSize:"clamp(0.48rem,1.8vw,0.56rem)", color:"#7c6fff", letterSpacing:"0.1em" }}>● LIVE</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:"clamp(8px,3vw,14px)",fontSize:"clamp(0.68rem,2.4vw,0.78rem)"}}>
            {[["CASH","$"+balance.toLocaleString(undefined,{maximumFractionDigits:0}),"#00ff88"],
              ["PORTFOLIO",fmt(portVal),"#ccc"],
              ["NET WORTH",fmt(netWorth),"#7c6fff"]].map(([l,v,c]) => (
              <div key={l}>
                <div style={{color:"#8888aa",fontSize:"clamp(0.56rem,1.8vw,0.62rem)",letterSpacing:"0.1em",marginBottom:1}}>{l}</div>
                <div style={{color:c,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
          {user && (
            <div onClick={() => setConfirmReset(true)} title="Click to reset account"
              style={{ display:"flex",alignItems:"center",gap:6, cursor:"pointer",
              background:"#0d0d1e", border:"1px solid " + planColor + "33", borderRadius:8, padding:"4px 9px" }}>
              <span style={{fontSize:"clamp(0.8rem,3vw,0.95rem)"}}>{planBadge || "👤"}</span>
              <div>
                <div style={{fontSize:"clamp(0.58rem,2vw,0.66rem)",fontWeight:700,color:"#ddd"}}>{user.name}</div>
                <div style={{fontSize:"clamp(0.56rem,1.8vw,0.62rem)",color:planColor,letterSpacing:"0.08em"}}>{user.plan.toUpperCase()}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Ticker */}
      <div style={{background:"#060612",borderBottom:"1px solid #111122",height:24,overflow:"hidden",display:"flex",alignItems:"center",flexShrink:0}}>
        <div className="tick" style={{fontSize:"clamp(0.64rem,2.2vw,0.72rem)",color:"#888899",letterSpacing:"0.04em"}}>
          {[...FEED_ITEMS,...FEED_ITEMS].map((f,i)=><span key={i} style={{marginRight:64}}>{f}</span>)}
        </div>
      </div>

      {/* Body */}
      <div className="main-grid">
        <div className="left-col">
          <div style={{padding:"clamp(10px,3vw,15px) clamp(12px,4vw,18px) clamp(8px,2vw,12px)",borderBottom:"1px solid #111122",background:"#060610",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:"clamp(1.1rem,4vw,1.5rem)"}}>{sel.emoji}</span>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(0.9rem,3.5vw,1.15rem)",letterSpacing:"0.07em"}}>{sel.name}</div>
                  <div style={{color:"#9999aa",fontSize:"clamp(0.6rem,2vw,0.68rem)",letterSpacing:"0.08em",marginTop:2}}>{sel.symbol} · {sel.vol} · SIMULATED</div>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <Price val={sel.price} up={sel.change >= 0}/>
                <div style={{color:sel.change>=0?"#00ff88":"#ff4466",fontSize:"clamp(0.72rem,2.5vw,0.82rem)",fontWeight:700,marginTop:3}}>
                  {sel.change>=0?"▲":"▼"} {Math.abs(sel.change).toFixed(2)}%
                </div>
              </div>
            </div>
            <div style={{width:"100%",height:"clamp(80px,16vw,150px)"}}>
              <svg width="100%" height="100%" viewBox={"0 0 " + CW + " " + CH} preserveAspectRatio="none">
                {/* Candlesticks — Binance style */}
                {candles.map((c, i) => {
                  const x = i * candleW + candleW / 2;
                  const green = c.close >= c.open;
                  const col = green ? "#00ff88" : "#ff4466";
                  const bodyTop = yOf(Math.max(c.open, c.close));
                  const bodyBot = yOf(Math.min(c.open, c.close));
                  const bodyH = Math.max(0.8, bodyBot - bodyTop);
                  const bw = Math.max(1.5, candleW * 0.6);
                  return (
                    <g key={i}>
                      {/* wick */}
                      <line x1={x} y1={yOf(c.high)} x2={x} y2={yOf(c.low)} stroke={col} strokeWidth="0.6" />
                      {/* body */}
                      <rect x={x - bw/2} y={bodyTop} width={bw} height={bodyH} fill={col} />
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Timeframe selector */}
            <div style={{display:"flex",gap:6,marginTop:10,justifyContent:"center"}}>
              {["1D","1W","1M","1Y","ALL"].map(tf=>(
                <button key={tf} className="btn" onClick={()=>setTimeframe(tf)}
                  style={{minHeight:32,padding:"0 clamp(10px,3vw,18px)",borderRadius:6,
                    fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(0.62rem,2.2vw,0.72rem)",fontWeight:700,
                    background:timeframe===tf?"rgba(124,111,255,0.18)":"rgba(255,255,255,0.03)",
                    color:timeframe===tf?"#9988ff":"#666677",
                    border:"1px solid "+(timeframe===tf?"#7c6fff44":"transparent"),letterSpacing:"0.05em"}}>
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div style={{flex:1,overflow:"auto",minHeight:0,WebkitOverflowScrolling:"touch"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"clamp(0.72rem,2.6vw,0.82rem)"}}>
              <thead style={{position:"sticky",top:0,background:"#040409",zIndex:5}}>
                <tr style={{color:"#6a6a80",fontSize:"clamp(0.58rem,2vw,0.66rem)",letterSpacing:"0.1em",borderBottom:"1px solid #0d0d1c"}}>
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
                    style={{borderBottom:"1px solid #090916",background:selId===a.id?"rgba(124,111,255,0.07)":"transparent"}}>
                    <td style={{padding:"7px clamp(8px,3vw,16px)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:"clamp(0.85rem,3vw,1.05rem)"}}>{a.emoji}</span>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontWeight:700,color:"#ccc",letterSpacing:"0.04em"}}>{a.symbol}</span>
                            {a.hot && <span className="hot" style={{background:"#ff4400",borderRadius:3,padding:"1px 4px",fontSize:"clamp(0.52rem,1.8vw,0.58rem)",color:"#fff",letterSpacing:"0.06em"}}>HOT</span>}
                          </div>
                          <div style={{color:"#9999aa",fontSize:"clamp(0.6rem,2vw,0.68rem)",maxWidth:"clamp(80px,20vw,150px)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"7px 6px",textAlign:"right"}}><Price val={a.price} up={a.change>=0}/></td>
                    <td style={{padding:"7px 6px",textAlign:"right"}}>
                      <span style={{color:a.change>=0?"#00ff88":"#ff4466",fontWeight:700}}>{a.change>=0?"+":""}{a.change.toFixed(1)}%</span>
                    </td>
                    <td style={{padding:"7px 6px",textAlign:"center"}}><Sparkline up={a.change>=0} seed={a.id}/></td>
                    <td style={{padding:"7px clamp(8px,3vw,16px)",textAlign:"right",color:"#888899"}}>{a.vol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="right-col" style={{background:"#050510"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",borderBottom:"1px solid #111122",flexShrink:0}}>
            {[{id:"trade",icon:"📊",label:"TRADE"},{id:"quiz",icon:"🧠",label:"QUIZ"},{id:"board",icon:"🏆",label:"RANKS"},{id:"plans",icon:"💎",label:"PLANS"},{id:"awards",icon:"🏅",label:"AWARDS"}].map(t=>(
              <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
                style={{minHeight:44,padding:"0 2px",textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",
                  fontSize:"clamp(0.64rem,2.2vw,0.74rem)",letterSpacing:"0.06em",
                  color:tab===t.id?"#ddd":"#aaaabb",borderBottom:"2px solid "+(tab===t.id?"#7c6fff":"transparent"),transition:"all 0.15s"}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab==="trade" && (
            <div style={{flex:1,overflow:"auto",minHeight:0,WebkitOverflowScrolling:"touch",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"clamp(10px,3vw,15px) clamp(12px,4vw,16px)",borderBottom:"1px solid #111122",flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",letterSpacing:"0.14em",color:"#aaaabb",marginBottom:10}}>PLACE ORDER</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:9}}>
                  {["buy","sell"].map(t=>(
                    <button key={t} className="btn" onClick={()=>setOType(t)}
                      style={{minHeight:44,borderRadius:6,fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(0.78rem,3vw,0.88rem)",letterSpacing:"0.12em",
                        background:oType===t?(t==="buy"?"#00ff88":"#ff4466"):"rgba(255,255,255,0.04)",color:oType===t?"#000":"#9999aa"}}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #111122",borderRadius:6,padding:"8px 11px",marginBottom:8,display:"flex",gap:8,alignItems:"center"}}>
                  <span>{sel.emoji}</span>
                  <span style={{fontWeight:700,fontSize:"0.77rem"}}>{sel.symbol}</span>
                  <span style={{color:"#888899",fontSize:"0.79rem",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.name}</span>
                </div>
                <div style={{display:"flex",gap:5,marginBottom:8}}>
                  <button className="btn" onClick={()=>setOQty(q=>Math.max(1,q-1))} style={{background:"#0e0e1e",border:"1px solid #1a1a2e",color:"#777",borderRadius:6,minWidth:44,minHeight:44,fontSize:"1.2rem"}}>−</button>
                  <div style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid #1a1a2e",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.85rem",minHeight:44}}>{oQty}</div>
                  <button className="btn" onClick={()=>setOQty(q=>q+1)} style={{background:"#0e0e1e",border:"1px solid #1a1a2e",color:"#777",borderRadius:6,minWidth:44,minHeight:44,fontSize:"1.2rem"}}>+</button>
                </div>
                <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid #0f0f1e",borderRadius:6,padding:"8px 11px",marginBottom:10,fontSize:"clamp(0.68rem,2.2vw,0.75rem)",color:"#9999aa"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span>Unit</span><span style={{color:"#aaa"}}>${sel.price.toFixed(2)}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>Total</span><span style={{color:oType==="buy"?"#ff4466":"#00ff88",fontWeight:700}}>${(sel.price*oQty).toFixed(2)}</span></div>
                </div>
                <button className="btn" onClick={executeTrade}
                  style={{width:"100%",minHeight:48,borderRadius:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(0.85rem,3.2vw,0.95rem)",letterSpacing:"0.14em",
                    background:oType==="buy"?"linear-gradient(135deg,#00ff88,#00bb55)":"linear-gradient(135deg,#ff4466,#bb0033)",color:"#000",fontWeight:700,
                    boxShadow:oType==="buy"?"0 3px 14px rgba(0,255,136,.2)":"0 3px 14px rgba(255,68,102,.2)"}}>
                  {oType==="buy"?"BUY "+sel.symbol:"SELL "+sel.symbol}
                </button>
              </div>
              <div style={{flex:1,overflow:"auto",padding:"10px clamp(12px,4vw,16px)",WebkitOverflowScrolling:"touch"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.76rem",letterSpacing:"0.14em",color:"#aaaabb",marginBottom:8}}>MY HOLDINGS</div>
                {portfolio.length===0 && <div style={{color:"#777788",fontSize:"0.69rem",textAlign:"center",padding:"20px 0",lineHeight:1.9}}>No positions yet.<br/>Start trading! 🚀</div>}
                {portfolio.map(p=>{
                  const a=assets.find(x=>x.id===p.id); if(!a) return null;
                  const pnl=(a.price-p.avg)*p.qty, pct=((a.price-p.avg)/p.avg)*100;
                  return (
                    <div key={p.id} className="row" onClick={()=>pickAsset(p.id)} style={{borderBottom:"1px solid #090916",padding:"8px 2px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:"0.9rem"}}>{a.emoji}</span>
                          <div>
                            <div style={{fontWeight:700,fontSize:"0.74rem"}}>{a.symbol}</div>
                            <div style={{color:"#9999aa",fontSize:"0.64rem"}}>{p.qty}× avg ${p.avg.toFixed(2)}</div>
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontWeight:700,fontSize:"0.74rem"}}>${(a.price*p.qty).toFixed(2)}</div>
                          <div style={{color:pnl>=0?"#00ff88":"#ff4466",fontSize:"0.64rem",fontWeight:700}}>{pnl>=0?"+":""}${pnl.toFixed(2)} ({pct>=0?"+":""}{pct.toFixed(1)}%)</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab==="quiz" && (
            <div style={{flex:1,overflow:"auto",padding:"14px clamp(10px,3vw,16px)",minHeight:0,WebkitOverflowScrolling:"touch"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.14em",color:"#aaaabb",marginBottom:4}}>🧠 BRAIN GAME</div>
              <div style={{color:"#888899",fontSize:"0.64rem",marginBottom:12}}>Answer right → earn cash. Wrong → lose some. Cash goes to your CASH balance (top of screen).</div>

              {/* Stats row */}
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                <div style={{flex:1,background:"rgba(0,255,136,0.06)",border:"1px solid #00ff8822",borderRadius:8,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:"0.95rem",fontWeight:700,color:"#00ff88"}}>{quizStats.correct}</div>
                  <div style={{fontSize:"0.55rem",color:"#888899",letterSpacing:"0.06em"}}>CORRECT</div>
                </div>
                <div style={{flex:1,background:"rgba(255,68,102,0.06)",border:"1px solid #ff446622",borderRadius:8,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:"0.95rem",fontWeight:700,color:"#ff4466"}}>{quizStats.wrong}</div>
                  <div style={{fontSize:"0.55rem",color:"#888899",letterSpacing:"0.06em"}}>WRONG</div>
                </div>
                <div style={{flex:1,background:"rgba(124,111,255,0.06)",border:"1px solid #7c6fff22",borderRadius:8,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:"0.95rem",fontWeight:700,color:"#9988ff"}}>🔥{quizStreak}</div>
                  <div style={{fontSize:"0.55rem",color:"#888899",letterSpacing:"0.06em"}}>STREAK</div>
                </div>
              </div>

              {!quizQ && (
                <>
                  <div style={{color:"#aaaabb",fontSize:"0.64rem",letterSpacing:"0.1em",marginBottom:8}}>CHOOSE LEVEL · Win +$300 / Lose -$300</div>
                  <button className="btn" onClick={()=>startQuiz("junior")}
                    style={{width:"100%",minHeight:50,borderRadius:10,marginBottom:9,
                      background:"linear-gradient(135deg,#00ff88,#00aa55)",color:"#000",
                      fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.1em",fontWeight:700,
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                    <span>🟢 JUNIOR</span>
                    <span style={{fontSize:"0.58rem",opacity:0.7,letterSpacing:"0.05em"}}>Easy · mixed topics</span>
                  </button>
                  <button className="btn" onClick={()=>startQuiz("senior")}
                    style={{width:"100%",minHeight:50,borderRadius:10,marginBottom:9,
                      background:"linear-gradient(135deg,#7c6fff,#4433cc)",color:"#fff",
                      fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.1em",fontWeight:700,
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                    <span>🔵 SENIOR</span>
                    <span style={{fontSize:"0.58rem",opacity:0.7,letterSpacing:"0.05em"}}>Harder · deeper knowledge</span>
                  </button>
                  <button className="btn" onClick={()=>startQuiz("pro")}
                    style={{width:"100%",minHeight:50,borderRadius:10,marginBottom:9,
                      background:"linear-gradient(135deg,#ff8800,#cc5500)",color:"#000",
                      fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.1em",fontWeight:700,
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                    <span>🟠 PRO</span>
                    <span style={{fontSize:"0.58rem",opacity:0.7,letterSpacing:"0.05em"}}>Expert level</span>
                  </button>
                  {/* SECRET — locked until 3 achievements */}
                  {achieved.length >= 3 ? (
                    <button className="btn" onClick={()=>startQuiz("secret")}
                      style={{width:"100%",minHeight:50,borderRadius:10,
                        background:"linear-gradient(135deg,#ffd700,#ff8800)",color:"#000",
                        fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.1em",fontWeight:700,
                        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
                        boxShadow:"0 0 20px rgba(255,215,0,0.3)"}}>
                      <span>👑 SECRET</span>
                      <span style={{fontSize:"0.58rem",opacity:0.8,letterSpacing:"0.05em"}}>Win +$900 to +$3000!</span>
                    </button>
                  ) : (
                    <div style={{width:"100%",minHeight:50,borderRadius:10,
                      background:"rgba(255,255,255,0.02)",border:"1px dashed #444455",
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,opacity:0.7}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.1em",color:"#888899"}}>🔒 SECRET LEVEL</span>
                      <span style={{fontSize:"0.58rem",color:"#777788"}}>Unlock {3 - achieved.length} more achievement{3-achieved.length>1?"s":""} to open</span>
                    </div>
                  )}
                  <div style={{marginTop:14,fontSize:"0.6rem",color:"#888899",textAlign:"center",lineHeight:1.6}}>
                    Total quiz earnings: <span style={{color:quizStats.earned>=0?"#00ff88":"#ff4466",fontWeight:700}}>{quizStats.earned>=0?"+":""}${quizStats.earned}</span>
                  </div>
                </>
              )}

              {quizQ && (
                <>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:"0.58rem",letterSpacing:"0.1em",padding:"3px 8px",borderRadius:4,
                      background:quizLevel==="junior"?"#00ff8822":quizLevel==="senior"?"#7c6fff22":quizLevel==="pro"?"#ff880022":"#ffd70022",color:quizLevel==="junior"?"#00ff88":quizLevel==="senior"?"#9988ff":quizLevel==="pro"?"#ff8800":"#ffd700"}}>
                      {quizLevel.toUpperCase()}
                    </span>
                    <button className="btn" onClick={()=>setQuizQ(null)} style={{background:"transparent",color:"#777788",fontSize:"0.62rem"}}>✕ exit</button>
                  </div>

                  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e1e38",borderRadius:10,padding:"14px 14px",marginBottom:12}}>
                    <div style={{fontSize:"0.84rem",color:"#fff",lineHeight:1.5,fontWeight:700}}>{quizQ.q}</div>
                  </div>

                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {quizOpts.map((opt,i)=>{
                      let bg = "rgba(255,255,255,0.03)", border = "#2a2a40", color = "#ddd";
                      if (quizAnswered) {
                        if (opt.idx === quizQ.a) { bg = "rgba(0,255,136,0.15)"; border = "#00ff88"; color = "#00ff88"; }
                        else if (opt.idx === quizAnswered.picked) { bg = "rgba(255,68,102,0.15)"; border = "#ff4466"; color = "#ff4466"; }
                      }
                      return (
                        <button key={i} className="btn" onClick={()=>answerQuiz(opt.idx)} disabled={!!quizAnswered}
                          style={{minHeight:48,borderRadius:8,padding:"8px 12px",textAlign:"left",
                            background:bg,border:"1px solid "+border,color:color,
                            fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",fontWeight:600,
                            cursor:quizAnswered?"default":"pointer",display:"flex",alignItems:"center",gap:8}}>
                          <span style={{opacity:0.5}}>{String.fromCharCode(65+i)}.</span>
                          <span style={{flex:1}}>{opt.text}</span>
                          {quizAnswered && opt.idx === quizQ.a && <span>✓</span>}
                          {quizAnswered && opt.idx === quizAnswered.picked && opt.idx !== quizQ.a && <span>✗</span>}
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswered && quizAnswered.correct && pendingReward > 0 && (
                    <div style={{marginTop:14,background:"rgba(0,255,136,0.06)",border:"1px solid #00ff8833",borderRadius:10,padding:"12px"}}>
                      <div style={{fontSize:"0.68rem",color:"#aaaabb",marginBottom:8,textAlign:"center"}}>
                        You won <span style={{color:"#00ff88",fontWeight:700}}>+${pendingReward}</span>! Where to add it?
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn" onClick={()=>claimReward("cash")}
                          style={{flex:1,minHeight:46,borderRadius:8,background:"#00ff88",color:"#000",
                            fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.08em",fontWeight:700}}>
                          💵 ADD TO CASH
                        </button>
                        <button className="btn" onClick={()=>claimReward("portfolio")}
                          style={{flex:1,minHeight:46,borderRadius:8,background:"#7c6fff",color:"#fff",
                            fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.08em",fontWeight:700}}>
                          📈 INVEST IN {sel.symbol}
                        </button>
                      </div>
                    </div>
                  )}

                  {quizAnswered && pendingReward === 0 && (
                    <button className="btn" onClick={()=>loadQuestion(quizLevel)}
                      style={{width:"100%",minHeight:48,borderRadius:8,marginTop:14,
                        background:"linear-gradient(135deg,#7c6fff,#4433cc)",color:"#fff",
                        fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.9rem",letterSpacing:"0.12em"}}>
                      NEXT QUESTION →
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {tab==="board" && (
            <div style={{flex:1,overflow:"auto",padding:"12px clamp(10px,3vw,15px)",minHeight:0,WebkitOverflowScrolling:"touch"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",letterSpacing:"0.14em",color:"#aaaabb",marginBottom:4}}>🏆 LIVE RANKINGS</div>
              <div style={{color:"#888899",fontSize:"0.64rem",marginBottom:12}}>Ranked by net worth</div>
              {board.map(p=>(
                <div key={p.name+p.rank} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",marginBottom:4,borderRadius:8,
                  background:p.isMe?"rgba(124,111,255,0.1)":"rgba(255,255,255,0.015)",border:"1px solid "+(p.isMe?"#7c6fff33":"transparent")}}>
                  <div style={{width:24,textAlign:"center",flexShrink:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",
                    color:p.rank===1?"#ffd700":p.rank===2?"#aaa":p.rank===3?"#cd7f32":"#888899"}}>
                    {p.rank<=3?["🥇","🥈","🥉"][p.rank-1]:"#"+p.rank}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:"0.73rem",fontWeight:700,color:p.isMe?"#9988ff":"#aaa",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</span>
                      {PLAN_BADGE[p.plan]&&<span style={{fontSize:"0.74rem"}}>{PLAN_BADGE[p.plan]}</span>}
                      {p.isMe&&<span style={{fontSize:"0.48rem",background:"#7c6fff33",color:"#7c6fff",borderRadius:3,padding:"1px 4px"}}>YOU</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:"0.79rem",fontWeight:700,color:"#ccc"}}>{fmt(p.worth)}</div>
                    <div style={{fontSize:"0.53rem",color:p.pct>=0?"#00ff88":"#ff4466"}}>{p.pct>=0?"+":""}{p.pct.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==="plans" && (
            <div style={{flex:1,overflow:"auto",padding:"12px clamp(10px,3vw,15px)",minHeight:0,WebkitOverflowScrolling:"touch"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",letterSpacing:"0.14em",color:"#aaaabb",marginBottom:4}}>💎 SUBSCRIPTION</div>
              {user&&<div style={{color:"#888899",fontSize:"0.64rem",marginBottom:10}}>Current: <span style={{color:PLAN_COLOR[user.plan]}}>{user.plan.toUpperCase()}</span></div>}
              <div style={{background:"#ff440011",border:"1px solid #ff440022",borderRadius:6,padding:"6px 10px",fontSize:"0.63rem",color:"#ff7744",marginBottom:12,lineHeight:1.5}}>
                ⚠️ Subscriptions unlock entertainment features only. Not a financial product.
              </div>
              {PLANS.map(p=>{
                const isCurr=user?.plan===p.id;
                const currIdx=PLANS.findIndex(x=>x.id===(user?.plan||"free"));
                const thisIdx=PLANS.findIndex(x=>x.id===p.id);
                const isLower=thisIdx<currIdx;
                return (
                  <div key={p.id} style={{border:"1px solid "+(isCurr?p.accent:"#111122"),borderRadius:10,padding:"12px 13px",marginBottom:10,position:"relative",
                    background:isCurr?p.accent+"0e":"rgba(255,255,255,0.01)"}}>
                    {p.popular&&!isCurr&&<div style={{position:"absolute",top:-9,right:12,background:"#7c6fff",borderRadius:4,padding:"1px 7px",fontSize:"0.5rem",color:"#fff",letterSpacing:"0.1em"}}>POPULAR</div>}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.1em",color:p.accent}}>{p.name}</span>
                      <div><span style={{color:"#ddd",fontWeight:700}}>{p.price}</span><span style={{color:"#999",fontSize:"0.79rem"}}>{p.per}</span></div>
                    </div>
                    <div style={{marginBottom:10}}>
                      {p.features.map((f,i)=><div key={i} style={{display:"flex",gap:6,fontSize:"0.79rem",color:"#aaaabb",padding:"2px 0"}}><span style={{color:p.accent}}>✓</span>{f}</div>)}
                    </div>
                    {isCurr?<div style={{textAlign:"center",fontSize:"0.69rem",color:p.accent,padding:"8px",background:p.accent+"0e",borderRadius:6}}>✓ Active Plan</div>
                      :isLower?<div style={{height:2}}/>
                      :<button className="btn" onClick={()=>handleUpgrade(p.id)} style={{width:"100%",minHeight:44,borderRadius:6,background:p.accent+"1a",color:p.accent,fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(0.75rem,2.8vw,0.82rem)",letterSpacing:"0.1em"}}>UPGRADE TO {p.name} →</button>}
                  </div>
                );
              })}
            </div>
          )}

          {tab==="awards" && (
            <div style={{flex:1,overflow:"auto",padding:"12px clamp(10px,3vw,15px)",minHeight:0,WebkitOverflowScrolling:"touch"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",letterSpacing:"0.14em",color:"#aaaabb",marginBottom:4}}>🏅 ACHIEVEMENTS</div>
              <div style={{color:"#888899",fontSize:"0.64rem",marginBottom:12}}>{achieved.length} of {ACHIEVEMENTS.length} unlocked</div>
              {ACHIEVEMENTS.map(a=>{
                const got=achieved.includes(a.id);
                return (
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 10px",marginBottom:6,borderRadius:8,
                    background:got?"rgba(124,111,255,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(got?"#7c6fff44":"#2a2a40"),opacity:got?1:0.85}}>
                    <span style={{fontSize:"1.5rem",filter:got?"none":"grayscale(0.5)"}}>{got?a.emoji:"🔒"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"0.82rem",fontWeight:700,color:got?"#fff":"#bbb"}}>{a.name}</div>
                      <div style={{fontSize:"0.68rem",color:got?"#999":"#777"}}>{a.desc}</div>
                    </div>
                    {got&&<span style={{fontSize:"0.55rem",background:"#00ff8822",color:"#00ff88",borderRadius:3,padding:"2px 6px",letterSpacing:"0.08em"}}>DONE</span>}
                  </div>
                );
              })}
              <div style={{marginTop:14,padding:"10px 12px",background:"rgba(255,68,102,0.06)",border:"1px solid #ff446633",borderRadius:8}}>
                <div style={{fontSize:"0.66rem",color:"#999",marginBottom:8,lineHeight:1.5}}>
                  Want to start over with a new name and plan? Reset your account below.
                </div>
                <button className="btn" onClick={()=>setConfirmReset(true)}
                  style={{width:"100%",minHeight:46,borderRadius:8,background:"#ff4466",color:"#fff",
                    fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.85rem",letterSpacing:"0.1em",fontWeight:700}}>
                  🗑️ RESET ACCOUNT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast" style={{position:"fixed",bottom:"clamp(14px,4vw,20px)",right:"clamp(10px,4vw,18px)",
          background:toast.type==="err"?"#ff4466":"#00ff88",color:"#000",padding:"10px 16px",borderRadius:8,
          fontWeight:700,fontSize:"clamp(0.65rem,2.5vw,0.73rem)",letterSpacing:"0.04em",
          boxShadow:"0 8px 24px rgba(0,0,0,.7)",zIndex:9999,pointerEvents:"none",maxWidth:"calc(100vw - 28px)"}}>
          {toast.msg}
        </div>
      )}

      <div style={{padding:"5px 14px",background:"#030307",borderTop:"1px solid #0d0d1a",
        fontSize:"clamp(0.54rem,1.8vw,0.6rem)",color:"#666677",textAlign:"center",flexShrink:0}}>
        ODDEX VIBE — For entertainment only. Simulated prices. No real money. No financial services. Not regulated.
      </div>
    </div>
  );
}
