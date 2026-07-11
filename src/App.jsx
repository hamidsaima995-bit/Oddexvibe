import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

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
  { id:13, symbol:"AWKE",  name:"Awkward Eye Contact",    basePrice:3.14,    volatility:0.075, vol:"5.5M", desc:"Held 0.3 seconds too long.",     emoji:"👁️", hot:true  },
  { id:14, symbol:"PROC",  name:"Procrastination Points", basePrice:99.99,   volatility:0.048, vol:"3.3M", desc:"Due tomorrow, started never.",   emoji:"⏰", hot:false },
  { id:15, symbol:"WIFI",  name:"WiFi Password Shares",   basePrice:12.50,   volatility:0.025, vol:"1.1M", desc:"Asked by every guest ever.",     emoji:"📶", hot:false },
  { id:16, symbol:"GRPJ",  name:"Group Project Carry",    basePrice:250.00,  volatility:0.058, vol:"678K", desc:"One person did all the work.",   emoji:"🎒", hot:true  },
  { id:17, symbol:"TYPO",  name:"Typo Tokens",            basePrice:0.99,    volatility:0.085, vol:"12M",  desc:"Sent before you could fix it.",  emoji:"😅", hot:false },
  { id:18, symbol:"GHOST", name:"Ghosting Futures",       basePrice:404.04,  volatility:0.052, vol:"890K", desc:"Seen 2 days ago. No reply.",     emoji:"👻", hot:true  },
  { id:19, symbol:"SNZE",  name:"Snooze Button Hits",     basePrice:5.55,    volatility:0.030, vol:"2.7M", desc:"Five more minutes, every time.", emoji:"😪", hot:false },
  { id:20, symbol:"VIBE2", name:"Secondhand Embarrassment",basePrice:88.88,  volatility:0.062, vol:"1.4M", desc:"Cringing for someone else.",     emoji:"🙈", hot:false },
  { id:21, symbol:"LEFT",  name:"Left On Read",            basePrice:200.00,  volatility:0.070, vol:"4.2M", desc:"Blue ticks, no reply.",           emoji:"📱", hot:true  },
  { id:22, symbol:"MNDY",  name:"Monday Morning Dread",    basePrice:24.00,   volatility:0.045, vol:"7.7M", desc:"Renews every 7 days.",           emoji:"😩", hot:false },
  { id:23, symbol:"BUFF",  name:"Buffering Seconds",       basePrice:3.60,    volatility:0.055, vol:"9.1M", desc:"99% loaded. Forever.",           emoji:"⏳", hot:true  },
  { id:24, symbol:"PLAN",  name:"Cancelled Plans Relief",  basePrice:150.00,  volatility:0.040, vol:"2.2M", desc:"Best feeling ever.",             emoji:"🎉", hot:false },
  { id:25, symbol:"BATT",  name:"1% Battery Anxiety",      basePrice:45.00,   volatility:0.080, vol:"5.8M", desc:"Charger always too far.",        emoji:"🔋", hot:true  },
  { id:26, symbol:"OVRT",  name:"Overthinking Tokens",     basePrice:300.00,  volatility:0.066, vol:"6.3M", desc:"3am replays of one moment.",     emoji:"🌀", hot:false },
  { id:27, symbol:"AUTO",  name:"Autocorrect Fails",       basePrice:8.88,    volatility:0.072, vol:"4.4M", desc:"Ducking annoying.",              emoji:"🦆", hot:true  },
  { id:28, symbol:"MUTE",  name:"You're On Mute Moments",  basePrice:19.99,   volatility:0.050, vol:"3.9M", desc:"Said 47 times a day.",           emoji:"🔇", hot:false },
  { id:29, symbol:"FOMO",  name:"FOMO Futures",            basePrice:77.70,   volatility:0.062, vol:"2.6M", desc:"Everyone else is having fun.",   emoji:"📸", hot:true  },
  { id:30, symbol:"DIET",  name:"Monday Diet Resolve",     basePrice:14.20,   volatility:0.095, vol:"8.8M", desc:"Expires by lunch.",              emoji:"🥗", hot:false },
  { id:31, symbol:"SPOI",  name:"Spoiler Alerts",          basePrice:66.60,   volatility:0.058, vol:"1.9M", desc:"Someone always ruins it.",       emoji:"🙊", hot:false },
  { id:32, symbol:"REPL",  name:"Typing... Then Nothing",  basePrice:33.30,   volatility:0.068, vol:"5.1M", desc:"Bubble appeared. Bubble gone.",  emoji:"💬", hot:true  },
  { id:33, symbol:"ALRM",  name:"Snoozed Alarm Debt",      basePrice:9.09,    volatility:0.044, vol:"6.6M", desc:"Compounds every morning.",       emoji:"⏰", hot:false },
  { id:34, symbol:"TABS",  name:"47 Open Browser Tabs",    basePrice:47.47,   volatility:0.036, vol:"1.3M", desc:"You'll read them later.",        emoji:"🗂️", hot:false },
  { id:35, symbol:"DELV",  name:"Late Delivery Rage",      basePrice:120.00,  volatility:0.054, vol:"2.0M", desc:"Tracking says 'out for delivery' since 3 days.", emoji:"📦", hot:true  },
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
  { id:"free",  name:"FREE",  price:"FREE",  per:"to start", cash:10000,
    accent:"#666",    features:["$10,000 starting balance","All odd assets","Simulated price feeds","View leaderboard"] },
  { id:"pro",   name:"PRO",   price:"FREE",  per:"tier",  cash:100000,
    accent:"#7c6fff", popular:true,
    features:["$100,000 starting balance","Exclusive bonus assets","Advanced charts","💎 PRO badge","Weekly tournaments"] },
  { id:"whale", name:"WHALE", price:"FREE", per:"tier",  cash:1000000,
    accent:"#00ff88", features:["$1,000,000 starting balance","Secret unlockable assets","Priority feeds","👑 WHALE badge","3x prize multiplier"] },
];

const PLAN_BADGE = { free:"",    pro:"💎",     whale:"👑"      };
const PLAN_COLOR = { free:"#666", pro:"#7c6fff", whale:"#00ff88" };
const PLAN_CASH  = { free:10000,  pro:100000,    whale:1000000   };

// ─── Achievements ─────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  // Easy
  { id:"first_trade", emoji:"🎯", name:"First Trade",      desc:"Make your first trade" },
  { id:"first_quiz",  emoji:"🧠", name:"Quiz Rookie",      desc:"Answer your first quiz question correctly" },
  // Medium
  { id:"big_spender", emoji:"💰", name:"Big Spender",      desc:"Spend over $5,000 in one trade" },
  { id:"diversified", emoji:"🌈", name:"Diversified",      desc:"Hold 5 different assets at once" },
  { id:"profit",      emoji:"📈", name:"In The Green",     desc:"Reach a profit on any position" },
  { id:"quiz_5",      emoji:"📚", name:"Brain Trainer",    desc:"Answer 5 quiz questions correctly" },
  // Hard
  { id:"whale_club",  emoji:"🐳", name:"Whale Club",       desc:"Net worth over $50,000" },
  { id:"streak_5",    emoji:"🔥", name:"On Fire",          desc:"Get a 5-question quiz streak" },
  { id:"quiz_20",     emoji:"🎓", name:"Quiz Master",      desc:"Answer 20 quiz questions correctly" },
  { id:"portfolio_10",emoji:"💎", name:"Collector",        desc:"Hold 10 different assets at once" },
  // Very hard / Pro
  { id:"millionaire", emoji:"👑", name:"Millionaire",      desc:"Net worth over $250,000" },
  { id:"big_profit",  emoji:"🚀", name:"To The Moon",      desc:"Make $10,000 profit on one position" },
];

// ─── Title system — your earned title shows next to your name everywhere ──
// Based on how many achievements unlocked (progression feels rewarding).
const TITLES = [
  { min:0,  name:"Newbie Trader",     emoji:"🌱", color:"#888899" },
  { min:2,  name:"Rising Trader",     emoji:"📈", color:"#4fc3f7" },
  { min:4,  name:"Skilled Trader",    emoji:"⚡", color:"#7c6fff" },
  { min:6,  name:"Pro Trader",        emoji:"💼", color:"#ff8800" },
  { min:8,  name:"Elite Trader",      emoji:"💎", color:"#00ff88" },
  { min:10, name:"Vibe Master",       emoji:"🔮", color:"#ff6b9d" },
  { min:12, name:"ODDEX Legend",      emoji:"👑", color:"#ffd700" },
];
function getTitle(achievedCount) {
  let t = TITLES[0];
  for (const tier of TITLES) { if (achievedCount >= tier.min) t = tier; }
  return t;
}

// ─── Weekly tournament helpers ────────────────────────────────────────
// Tournament runs Sat–Fri and resets every Saturday at 00:00 UTC.
// Using UTC (not local device time) so the reset happens at the same
// real-world instant for every player, regardless of country/timezone.
// ─── Analytics: send a custom event to Google Analytics (GA4) ─────────
// Safe no-op if gtag isn't loaded (e.g. ad-blockers, offline) — never breaks the app.
function track(eventName, params) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  } catch {}
}

function getWeekId() {
  const now = new Date();
  const utcDaysSinceEpoch = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
  const day = now.getUTCDay(); // 0=Sun ... 6=Sat
  const daysSinceSaturday = (day - 6 + 7) % 7; // Sat=0, Sun=1, Mon=2 ... Fri=6
  const weekStartDay = utcDaysSinceEpoch - daysSinceSaturday;
  return "W" + weekStartDay;
}
function timeUntilNextSaturday() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun ... 6=Sat
  const daysUntilSat = (6 - day + 7) % 7 || 7;
  const nextSat = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilSat, 0, 0, 0, 0));
  const diff = nextSat - now;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return d + "d " + h + "h " + m + "m";
}


// ─── Quiz Questions (Junior + Senior, mixed topics) ───────────────────
// q=question, o=options array, a=correct index, lvl=junior/senior
// ─── ODDEX ACADEMY — Duolingo-style structured course ─────────────────
// Each level has lessons; each lesson has its own small question set.
// Progress (which lessons are unlocked/completed) is saved per-user.
const ACADEMY = [
  {
    id: "L1", title: "Trading Basics", emoji: "🟢", color: "#00ff88",
    lessons: [
      { id:"L1-1", title:"Buy & Sell", qs:[
        { q:"What does 'BUY' mean in trading?", o:["Give away an asset","Purchase an asset","Delete an asset","Hide an asset"], a:1 },
        { q:"What does 'SELL' mean?", o:["Exchange your asset for cash","Buy more","Hold forever","Delete it"], a:0 },
        { q:"If you buy at $10 and sell at $15, you made a...?", o:["Loss","Profit","Tax","Fee"], a:1 },
      ]},
      { id:"L1-2", title:"Profit & Loss", qs:[
        { q:"What is 'profit'?", o:["Money lost","Money earned above cost","A tax","A loan"], a:1 },
        { q:"What is 'loss'?", o:["Earning extra money","Spending less than you earn","Losing money on a trade","A type of bonus"], a:2 },
        { q:"You spend $100, sell for $80. What happened?", o:["$20 profit","$20 loss","No change","$180 profit"], a:1 },
      ]},
      { id:"L1-3", title:"Reading Prices", qs:[
        { q:"If a price chart goes up, the price is...?", o:["Falling","Rising","Frozen","Gone"], a:1 },
        { q:"Green color on a price usually means?", o:["Price fell","Price rose","Market closed","Error"], a:1 },
        { q:"Red color on a price usually means?", o:["Price rose","Price fell","A bonus","Nothing"], a:1 },
      ]},
      { id:"L1-4", title:"Volatility", qs:[
        { q:"What is 'volatility'?", o:["Steady prices","How much/fast prices swing","Total profit","A trading fee"], a:1 },
        { q:"A highly volatile asset is...?", o:["Very stable","Swings a lot in price","Always profitable","Risk-free"], a:1 },
        { q:"Which is generally riskier?", o:["Savings account","High-volatility asset","Doing nothing","Keeping cash"], a:1 },
      ]},
      { id:"L1-5", title:"Level 1 Checkpoint", qs:[
        { q:"What is a 'portfolio'?", o:["A coffee type","Your collection of investments","A phone app","A bank"], a:1 },
        { q:"What does 'diversify' mean?", o:["Put all money in one thing","Spread money across many things","Stop investing","Sell everything"], a:1 },
        { q:"What is 'savings'?", o:["Money you spend","Money you keep for later","A type of loan","A bill"], a:1 },
        { q:"You have $1000, spend $300. How much left?", o:["$600","$700","$800","$300"], a:1 },
      ]},
      { id:"L1-6", title:"Bonus Round ⭐", qs:[
        { q:"What does 'buy' mean in trading?", o:["Sell an asset","Purchase an asset","Delete an asset","Borrow money"], a:1 },
        { q:"What does 'sell' mean?", o:["Buy more","Give up your asset for cash","Hold forever","Nothing"], a:1 },
        { q:"If a price rises, holders generally...?", o:["Lose money","Gain value","Pay a fee","Nothing changes"], a:1 },
        { q:"What is 'profit'?", o:["Money earned above cost","Money lost","A tax","A fee"], a:0 },
        { q:"What is a 'ledger'?", o:["A record of transactions","A type of coin","A phone","A chart"], a:0 },
        { q:"What is a wise money habit?", o:["Spend all at once","Save regularly","Never track spending","Borrow always"], a:1 },
        { q:"What is 10% of 500?", o:["5","50","100","500"], a:1 },
        { q:"Which is cheaper: $5 or $50?", o:["$5","$50","Same","Neither"], a:0 },
        { q:"What does 'balance' mean?", o:["Money you have available","A type of chart","A trading fee","A tax"], a:0 },
        { q:"Trading with a plan is...?", o:["Risky and bad","Smart and disciplined","Impossible","Illegal"], a:1 },
      ]},
    ],
  },
  {
    id: "L2", title: "Charts & Patterns", emoji: "🔵", color: "#7c6fff",
    lessons: [
      { id:"L2-1", title:"Candlesticks", qs:[
        { q:"What is a 'candlestick' on a chart?", o:["A real candle","A bar showing open/close/high/low","A type of coin","An error"], a:1 },
        { q:"A GREEN candle usually means?", o:["Price fell","Close price > open price","Market closed","An error"], a:1 },
        { q:"A RED candle usually means?", o:["Close price < open price","Close price > open price","A bonus","Free trade"], a:0 },
      ]},
      { id:"L2-2", title:"Support & Resistance", qs:[
        { q:"What is 'support' on a chart?", o:["Customer service","Price level where buying tends to rise","A trading fee","The chart color"], a:1 },
        { q:"What is 'resistance' on a chart?", o:["Price level where selling tends to happen","A free bonus","A trading bot","Customer help"], a:0 },
        { q:"Price often bounces off support because...?", o:["Buyers step in","Sellers disappear forever","It's required by law","Random chance only"], a:0 },
      ]},
      { id:"L2-3", title:"Trends", qs:[
        { q:"What is a 'bull market'?", o:["Prices falling","Prices rising over time","No trading","A holiday"], a:1 },
        { q:"What is a 'bear market'?", o:["Prices rising","Prices falling over time","Maximum profit","A bonus"], a:1 },
        { q:"What is a 'moving average'?", o:["A walking person","Average price over a time period","A trading fee","A bot"], a:1 },
      ]},
      { id:"L2-4", title:"Volume & Liquidity", qs:[
        { q:"What does 'volume' mean in trading?", o:["How loud it is","How much is being traded","Screen size","Color"], a:1 },
        { q:"What is 'liquidity'?", o:["Water amount","Ease of buying/selling without moving price","Total losses","Price color"], a:1 },
        { q:"Low liquidity usually means?", o:["Easy to trade big amounts","Hard to trade without moving price a lot","No risk","Guaranteed profit"], a:1 },
      ]},
      { id:"L2-5", title:"Level 2 Checkpoint", qs:[
        { q:"What does 'RSI' indicator measure?", o:["Really Smart Investor","Overbought/oversold conditions","A trading fee","A coin type"], a:1 },
        { q:"What is a 'limit order'?", o:["Buy at any price","Set a max/min price to trade at","Trade for free","Skip fees"], a:1 },
        { q:"What is a 'market order'?", o:["Executes instantly at current price","Always free","Never fills","A type of loan"], a:0 },
        { q:"What is a 'pump and dump'?", o:["A safe strategy","Artificially inflating then selling — a scam","Free profit","A gym routine"], a:1 },
      ]},
      { id:"L2-6", title:"Bonus Round ⭐", qs:[
        { q:"What does a candlestick show?", o:["Open, high, low, close prices","Only the volume","Bank fees","Trading hours"], a:0 },
        { q:"A green candle usually means?", o:["Price went down","Price went up","No change","A fee"], a:1 },
        { q:"A red candle usually means?", o:["Price went up","Price went down","Free trade","A bonus"], a:1 },
        { q:"What is a 'trend'?", o:["Random noise","The general price direction","A trading fee","A coin"], a:1 },
        { q:"An 'uptrend' means prices are generally...?", o:["Falling","Rising","Flat","Gone"], a:1 },
        { q:"What is 'support' on a chart?", o:["A price floor where buyers step in","The highest price","A fee","A tax"], a:0 },
        { q:"What is 'resistance'?", o:["A price ceiling where sellers step in","The lowest price","A bonus","A loan"], a:0 },
        { q:"Higher volume usually means?", o:["More trading activity","Less interest","A fee","Nothing"], a:0 },
        { q:"What is 'consolidation'?", o:["Price moving sideways in a range","A huge crash","A big rally","A tax"], a:0 },
        { q:"Chart patterns help traders...?", o:["Guarantee profit","Make more informed guesses","Avoid all risk","Skip fees"], a:1 },
      ]},
    ],
  },
  {
    id: "L3", title: "Advanced Trading", emoji: "🟠", color: "#ff8800",
    lessons: [
      { id:"L3-1", title:"Leverage", qs:[
        { q:"What does 'leverage' let you do?", o:["Trade bigger with borrowed money","Trade for free","Avoid all risk","Skip fees"], a:0 },
        { q:"With 5x leverage, $100 controls how much?", o:["$105","$500","$50","$1000"], a:1 },
        { q:"With 10x leverage, a 10% price drop means?", o:["10% loss","100% loss (liquidated)","No loss","10% gain"], a:1 },
      ]},
      { id:"L3-2", title:"Margin", qs:[
        { q:"What is 'margin' in trading?", o:["Page edge","Borrowed money to trade larger","A trading fee","A profit type"], a:1 },
        { q:"What is 'cross margin'?", o:["Using full balance as collateral","No margin at all","A free trade","A bot"], a:0 },
        { q:"What is 'isolated margin'?", o:["Margin limited to one position only","Unlimited margin","No risk trade","A coin type"], a:0 },
      ]},
      { id:"L3-3", title:"Long & Short", qs:[
        { q:"What does 'going long' mean?", o:["Betting price will rise","Betting price will fall","Waiting forever","Selling everything"], a:0 },
        { q:"What does 'going short' mean?", o:["Betting price will rise","Betting price will fall","Buying slowly","Holding cash"], a:1 },
        { q:"What is 'liquidated' in leverage trading?", o:["You won big","Your position auto-closed at a loss","You got a bonus","Free trade"], a:1 },
      ]},
      { id:"L3-4", title:"Hedging & Futures", qs:[
        { q:"What is a 'hedge' in trading?", o:["A garden plant","A trade to reduce risk of another","A type of profit","A free bonus"], a:1 },
        { q:"What is 'futures' trading?", o:["Predicting lottery","Contracts to buy/sell later at set price","Time travel","Only spot trading"], a:1 },
        { q:"What is 'funding rate' in perpetual futures?", o:["A government tax","Periodic payment between long & short traders","A withdrawal fee","Free money"], a:1 },
      ]},
      { id:"L3-5", title:"Level 3 Checkpoint", qs:[
        { q:"What is 'spot trading'?", o:["Buying/selling for immediate delivery","Trading in space","A type of loan","Future contracts only"], a:0 },
        { q:"What is 'slippage'?", o:["Falling down","Difference between expected & actual price","A bonus","A fee waiver"], a:1 },
        { q:"What is an 'arbitrage' trade?", o:["A trading fee","Profiting from price differences across markets","A type of loss","Holding cash"], a:1 },
        { q:"What is a 'bear trap'?", o:["A real trap","False signal that price will fall","A safe investment","A bot"], a:1 },
      ]},
      { id:"L3-6", title:"Bonus Round ⭐", qs:[
        { q:"What does 'leverage' amplify?", o:["Only gains","Both gains and losses","Only losses","Nothing"], a:1 },
        { q:"What is 'margin'?", o:["Borrowed funds for a bigger position","A page edge","A trading fee","A tax"], a:0 },
        { q:"A 'long' position profits when price...?", o:["Falls","Rises","Stays flat","Disappears"], a:1 },
        { q:"A 'short' position profits when price...?", o:["Rises","Falls","Stays flat","Doubles"], a:1 },
        { q:"What is 'liquidation'?", o:["Forced closing of a losing leveraged position","A free bonus","A type of chart","A tax refund"], a:0 },
        { q:"Higher leverage means...?", o:["Lower risk","Higher risk","No risk","Guaranteed profit"], a:1 },
        { q:"What is 'hedging'?", o:["Reducing risk with an offsetting position","Gardening","A guaranteed win","A fee"], a:0 },
        { q:"What is a 'futures contract'?", o:["Agreement to trade at a future date/price","A bank account","A coin","A tax form"], a:0 },
        { q:"Why is leverage risky for beginners?", o:["It's not risky","Small moves can wipe you out","It's illegal","It has no downside"], a:1 },
        { q:"Smart traders use leverage...?", o:["Recklessly","Carefully with risk limits","Never learning","Emotionally"], a:1 },
      ]},
    ],
  },
  {
    id: "L4", title: "Crypto & Blockchain", emoji: "🟣", color: "#9966ff",
    lessons: [
      { id:"L4-1", title:"What is Blockchain?", qs:[
        { q:"What is a 'blockchain'?", o:["A type of bank","A shared digital record of transactions","A phone app","A trading fee"], a:1 },
        { q:"Why is blockchain called 'decentralized'?", o:["One company controls it","No single person/company controls it","It's illegal","It's only for banks"], a:1 },
        { q:"What is a 'block' in blockchain?", o:["A group of recorded transactions","A type of coin","A trading bot","A fee"], a:0 },
      ]},
      { id:"L4-2", title:"Crypto Basics", qs:[
        { q:"What is 'Bitcoin'?", o:["A real metal coin","The first cryptocurrency","A video game","A bank type"], a:1 },
        { q:"What is 'crypto' short for?", o:["Cryptocurrency (digital money)","Cryptic puzzles","A secret code","A board game"], a:0 },
        { q:"What is a crypto 'wallet'?", o:["A leather pouch","Where you store digital coins","A bank branch","A trading fee"], a:1 },
      ]},
      { id:"L4-3", title:"Crypto Culture", qs:[
        { q:"What does 'HODL' mean?", o:["Sell immediately","Hold on for dear life (don't sell)","A type of coin","A trading bot"], a:1 },
        { q:"What does 'to the moon' mean in crypto slang?", o:["Price crashing","Price rising dramatically","A new coin launch","A trading fee"], a:1 },
        { q:"What is a 'whale' in crypto?", o:["A sea animal","Someone holding a huge amount of crypto","A type of wallet","A trading bot"], a:1 },
      ]},
      { id:"L4-4", title:"Risks & Safety", qs:[
        { q:"Why must you protect your wallet's private key?", o:["It doesn't matter","Whoever has it can access your funds","It's just for show","Keys expire daily"], a:1 },
        { q:"What is a 'scam coin' often designed to do?", o:["Help investors long-term","Pump price then dump on holders","Provide bank insurance","Guarantee profit"], a:1 },
        { q:"Is crypto trading risk-free?", o:["Yes, always profitable","No, prices can be highly volatile","Yes, government guaranteed","No risk if you HODL"], a:1 },
      ]},
      { id:"L4-5", title:"Level 4 Checkpoint", qs:[
        { q:"What does 'DCA' (Dollar Cost Averaging) mean?", o:["Investing a fixed amount regularly over time","Investing everything at once","A type of wallet","A trading fee"], a:0 },
        { q:"What is a 'smart contract'?", o:["A paper contract","Self-executing code on a blockchain","A bank loan","A trading bot"], a:1 },
        { q:"Why do many experts say 'don't invest more than you can afford to lose'?", o:["Crypto/trading can be very risky","It's a legal requirement","It guarantees profit","It's not true"], a:0 },
        { q:"What is 'market cap' in crypto?", o:["A hat","Price × total coins in circulation","A trading fee","A type of wallet"], a:1 },
      ]},
      { id:"L4-6", title:"Bonus Round ⭐", qs:[
        { q:"What is a blockchain?", o:["A digital record spread across many computers","A physical chain","A bank vault","A type of coin"], a:0 },
        { q:"What is a crypto 'wallet'?", o:["A leather pouch","A tool to store/manage crypto","A bank branch","A trading fee"], a:1 },
        { q:"What is Bitcoin?", o:["The first major cryptocurrency","A physical coin","A bank","A stock"], a:0 },
        { q:"What is a 'private key'?", o:["A secret code that controls your crypto","A house key","A public address","A fee"], a:0 },
        { q:"Should you share your private key?", o:["Yes, with everyone","Never — it controls your funds","Only on social media","With strangers"], a:1 },
        { q:"What is 'gas fee'?", o:["Car fuel","A fee to process blockchain transactions","A bank charge","A tax"], a:1 },
        { q:"What is an 'NFT'?", o:["A unique digital token","A type of cash","A bank loan","A chart"], a:0 },
        { q:"What is 'decentralized'?", o:["Controlled by one bank","No single central authority","Government-run only","A trading fee"], a:1 },
        { q:"Crypto prices are usually...?", o:["Very stable","Highly volatile","Fixed by banks","Always rising"], a:1 },
        { q:"A safe crypto habit is...?", o:["Sharing your keys","Doing research before investing","Investing rent money","Ignoring risks"], a:1 },
      ]},
    ],
  },
  {
    id: "L5", title: "Trading Psychology", emoji: "🟣", color: "#ff6b9d",
    lessons: [
      { id:"L5-1", title:"Emotions & FOMO", qs:[
        { q:"What is 'FOMO' in trading?", o:["Fear Of Missing Out — buying impulsively", "A type of chart", "A trading fee", "A safe strategy"], a:0 },
        { q:"Buying only because 'everyone else is buying' is usually...?", o:["A smart plan", "A risky, emotional decision", "Always profitable", "Required"], a:1 },
        { q:"What often follows panic buying at the top?", o:["Guaranteed profit", "A price drop, causing losses", "Nothing happens", "Free money"], a:1 },
      ]},
      { id:"L5-2", title:"Discipline & Plans", qs:[
        { q:"Why is having a trading plan useful?", o:["It removes all risk", "It helps you make decisions calmly, not emotionally", "It guarantees profit", "It's required by law"], a:1 },
        { q:"What is a 'stop-loss' used for?", o:["Guaranteeing profit", "Limiting how much you can lose on a trade", "Increasing leverage", "Avoiding taxes"], a:1 },
        { q:"Chasing losses by trading bigger to 'win it back' is...?", o:["A smart recovery plan", "A common, risky mistake", "Always successful", "Required strategy"], a:1 },
      ]},
      { id:"L5-3", title:"Patience & Long-Term", qs:[
        { q:"What does 'patience' help avoid in trading?", o:["Impulsive, emotional decisions", "All losses", "Taxes", "Fees"], a:0 },
        { q:"Checking prices every few minutes usually leads to...?", o:["Better decisions", "More stress and impulsive trades", "Guaranteed profit", "Nothing"], a:1 },
        { q:"Long-term thinking generally helps you...?", o:["React to every small price move", "Ride out short-term volatility", "Guarantee profit", "Avoid all risk"], a:1 },
      ]},
      { id:"L5-4", title:"Risk Management", qs:[
        { q:"What does 'position sizing' mean?", o:["Choosing how much money to put in one trade", "The size of your phone screen", "A trading fee", "A type of chart"], a:0 },
        { q:"Why avoid putting all your money in one asset?", o:["It's required by law", "If it drops, you lose a large portion of everything", "It's always more profitable", "It has no downside"], a:1 },
        { q:"What is a healthy mindset toward losses?", o:["They never happen to good traders", "They're a normal part of trading — manage them", "Always double down immediately", "Ignore them completely"], a:1 },
      ]},
      { id:"L5-5", title:"Level 5 Checkpoint", qs:[
        { q:"What is 'revenge trading'?", o:["A calm, planned strategy", "Trading emotionally to win back a recent loss", "A type of bonus", "A safe habit"], a:1 },
        { q:"What best describes 'diversification' as a psychological tool?", o:["It removes the need to think", "It reduces the emotional impact of any single loss", "It guarantees profit", "It's only for beginners"], a:1 },
        { q:"Why do many traders keep a journal of their trades?", o:["It's required", "To review decisions and improve over time", "To guarantee profit", "It has no benefit"], a:1 },
        { q:"What is the main risk of trading with money you can't afford to lose?", o:["No risk at all", "Extra emotional pressure leading to bad decisions", "It's illegal", "It guarantees success"], a:1 },
      ]},
      { id:"L5-6", title:"Bonus Round ⭐", qs:[
        { q:"What is 'FOMO'?", o:["Fear Of Missing Out — buying impulsively","A trading tool","A type of coin","A safe strategy"], a:0 },
        { q:"Panic selling usually leads to...?", o:["Guaranteed profit","Selling low and locking in losses","Nothing","Free money"], a:1 },
        { q:"What helps control trading emotions?", o:["A clear plan and rules","Trading randomly","Chasing every move","Ignoring losses"], a:0 },
        { q:"What is 'discipline' in trading?", o:["Sticking to your plan","Trading on feelings","Never having rules","Copying everyone"], a:0 },
        { q:"Checking prices every minute usually causes...?", o:["Calm decisions","Stress and impulsive trades","Guaranteed wins","Nothing"], a:1 },
        { q:"A trading journal helps you...?", o:["Waste time","Learn from past decisions","Guarantee profit","Avoid all risk"], a:1 },
        { q:"'Revenge trading' means...?", o:["A calm plan","Emotionally trying to win back losses","A safe habit","A bonus"], a:1 },
        { q:"Patience in trading helps avoid...?", o:["Impulsive mistakes","All profit","Learning","Fees"], a:0 },
        { q:"The best mindset toward losses is...?", o:["They never happen","They're normal — manage them","Double down always","Ignore them"], a:1 },
        { q:"Long-term thinking helps you...?", o:["Panic more","Ride out short-term swings","Guarantee profit","Skip research"], a:1 },
      ]},
    ],
  },
  {
    id: "L6", title: "Money Management", emoji: "💰", color: "#ffaa00",
    lessons: [
      { id:"L6-1", title:"Budgeting Basics", qs:[
        { q:"What is a budget?", o:["A plan for how to spend and save money", "A type of loan", "A trading fee", "A bank account"], a:0 },
        { q:"Why is saving important?", o:["It's not important", "It builds a safety net for emergencies and goals", "Banks force you to", "To pay more tax"], a:1 },
        { q:"What is an 'emergency fund'?", o:["Money set aside for unexpected costs", "A type of stock", "A loan from a friend", "A trading bonus"], a:0 },
      ]},
      { id:"L6-2", title:"Needs vs Wants", qs:[
        { q:"Which is a 'need'?", o:["Food and shelter", "The latest phone", "Designer shoes", "A gaming console"], a:0 },
        { q:"Smart money management means...?", o:["Spending on wants first", "Covering needs before wants", "Never saving", "Borrowing always"], a:1 },
        { q:"What happens if you spend more than you earn?", o:["You get richer", "You go into debt", "Nothing", "You earn interest"], a:1 },
      ]},
      { id:"L6-3", title:"Smart Spending", qs:[
        { q:"What is 'compound interest'?", o:["Interest earned on both principal and past interest", "A one-time fee", "A type of tax", "A loan penalty"], a:0 },
        { q:"Why compare prices before buying?", o:["It wastes time", "To get the best value for your money", "It's required by law", "To pay more"], a:1 },
        { q:"What does 'living within your means' mean?", o:["Spending only what you can afford", "Borrowing as much as possible", "Never buying anything", "Spending your whole salary"], a:0 },
      ]},
      { id:"L6-4", title:"Level 6 Checkpoint", qs:[
        { q:"What's a healthy first step with extra income?", o:["Spend it all immediately", "Save or invest a portion", "Lend it to strangers", "Ignore it"], a:1 },
        { q:"What is 'passive income'?", o:["Money earned with little ongoing effort", "Money from a 9-5 job only", "A type of tax", "A bank fee"], a:0 },
        { q:"Why avoid high-interest debt (like some credit cards)?", o:["It's free money", "The interest can grow faster than you can repay", "It has no downside", "Banks recommend it"], a:1 },
        { q:"What is the safest approach to money you might need soon?", o:["Risky investments", "Keep it accessible and low-risk", "Spend it fast", "Lend it out"], a:1 },
      ]},
      { id:"L6-5", title:"Bonus Round ⭐", qs:[
        { q:"What is a budget?", o:["A spending and saving plan","A type of loan","A trading fee","A bank"], a:0 },
        { q:"What is an 'emergency fund'?", o:["Money for unexpected costs","A type of stock","A loan","A bonus"], a:0 },
        { q:"Which is a 'need'?", o:["Food and shelter","Latest gadget","Designer clothes","A vacation"], a:0 },
        { q:"What is 'compound interest'?", o:["Interest on principal + past interest","A one-time fee","A tax","A penalty"], a:0 },
        { q:"Spending more than you earn leads to...?", o:["Wealth","Debt","Savings","Interest"], a:1 },
        { q:"What is 'passive income'?", o:["Money with little ongoing effort","Only salary","A tax","A fee"], a:0 },
        { q:"Why compare prices before buying?", o:["To waste time","To get the best value","It's required","To pay more"], a:1 },
        { q:"A good savings habit is...?", o:["Save a portion regularly","Spend everything","Borrow always","Never save"], a:0 },
        { q:"High-interest debt is dangerous because...?", o:["It's free","Interest grows fast","It has no downside","Banks love you"], a:1 },
        { q:"'Living within your means' means...?", o:["Spend only what you can afford","Borrow endlessly","Never enjoy money","Spend your whole salary"], a:0 },
      ]},
    ],
  },
];

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
  { lvl:"senior", q:"What is 'compound interest'?", o:["One-time interest","Interest on interest over time","A trading fee","A loss"], a:1 },
  { lvl:"senior", q:"What is an 'IPO'?", o:["Initial Public Offering","Internal Profit Order","Investment Price Option","Instant Pay Out"], a:0 },
  { lvl:"senior", q:"What is 'inflation'?", o:["Prices falling","Prices rising over time","More jobs","A bonus"], a:1 },
  { lvl:"senior", q:"What does 'asset' mean?", o:["A debt","Something valuable you own","A monthly bill","A type of tax"], a:1 },
  { lvl:"senior", q:"What is a 'recession'?", o:["Economic growth","Economic slowdown/decline","A holiday","A bonus"], a:1 },
  { lvl:"senior", q:"What is 'capital' in business?", o:["A city","Money/assets to start or grow","A type of tax","A loss"], a:1 },
  { lvl:"senior", q:"What does 'bull' vs 'bear' market mean?", o:["Same thing","Bull=rising, Bear=falling","Both falling","Both rising"], a:1 },
  { lvl:"pro", q:"With 10x leverage, a 10% price drop means...?", o:["10% loss","100% loss (liquidated)","No loss","10% gain"], a:1 },
  { lvl:"pro", q:"Bought at $200, sold at $250, 3 units. Profit?", o:["$50","$100","$150","$200"], a:2 },
  { lvl:"junior", q:"You have $1000, spend $300. How much left?", o:["$600","$700","$800","$300"], a:1 },
  { lvl:"junior", q:"What is the capital of Japan?", o:["Beijing","Seoul","Tokyo","Bangkok"], a:2 },
  { lvl:"junior", q:"How many days are in a leap year?", o:["365","366","367","364"], a:1 },
  { lvl:"junior", q:"What is 25 + 25?", o:["40","45","50","55"], a:2 },
  { lvl:"junior", q:"Which animal is known as 'man's best friend'?", o:["Cat","Dog","Horse","Bird"], a:1 },
  { lvl:"junior", q:"What does 'ATM' stand for?", o:["Auto Teller Machine","Automated Teller Machine","Account Transfer Machine","Any Time Money"], a:1 },
  { lvl:"junior", q:"What color do you get mixing blue + yellow?", o:["Red","Green","Purple","Orange"], a:1 },
  { lvl:"junior", q:"How many hours in a day?", o:["12","20","24","48"], a:2 },
  { lvl:"junior", q:"What is the largest ocean on Earth?", o:["Atlantic","Indian","Arctic","Pacific"], a:3 },
  { lvl:"junior", q:"If a stock is 'rising', the price is...?", o:["Going down","Going up","Staying same","Disappearing"], a:1 },
  { lvl:"junior", q:"What is 'savings'?", o:["Money you spend","Money you keep for later","A type of loan","A bill"], a:1 },
  { lvl:"junior", q:"What does 'free' cost?", o:["$10","$5","Nothing","$1"], a:2 },

  // ═══ SECRET (+$900 to +$3000 / -$300) — unlocks after achievements ═══
  { lvl:"secret", q:"What is a 'short squeeze' in trading?", o:["A tight schedule","Rapid price rise forcing short-sellers to buy","A small profit","A type of order"], a:1, reward:900 },
  { lvl:"secret", q:"What is the value of Pi to 4 decimals?", o:["3.1415","3.1416","3.1414","3.1417"], a:1, reward:1200 },
  { lvl:"secret", q:"What does 'blockchain' primarily provide?", o:["Faster internet","A decentralized ledger","Cheaper phones","Free money"], a:1, reward:1500 },
  { lvl:"secret", q:"In economics, what is 'inflation'?", o:["Prices falling","General rise in prices over time","More jobs","Less tax"], a:1, reward:1800 },
  { lvl:"secret", q:"What is the largest organ in the human body?", o:["Heart","Liver","Skin","Brain"], a:2, reward:2000 },
  { lvl:"secret", q:"What does 'leverage' allow a trader to do?", o:["Trade with borrowed money for bigger positions","Trade for free","Avoid all risk","Skip taxes"], a:0, reward:2500 },
  { lvl:"secret", q:"Which programming language runs natively in browsers?", o:["Python","Java","JavaScript","C++"], a:2, reward:3000 },

  // ── Extra mixed questions (more variety) ──
  { lvl:"junior", q:"What is the smallest country in the world?", o:["Monaco","Vatican City","Malta","Nauru"], a:1 },
  { lvl:"junior", q:"How many colors in a rainbow?", o:["5","6","7","8"], a:2 },
  { lvl:"junior", q:"What is H2O commonly known as?", o:["Salt","Water","Sugar","Air"], a:1 },
  { lvl:"junior", q:"What is 9 × 9?", o:["72","81","91","99"], a:1 },
  { lvl:"junior", q:"Which planet do we live on?", o:["Mars","Venus","Earth","Jupiter"], a:2 },
  { lvl:"junior", q:"What does a 'budget' help you do?", o:["Spend more","Plan your money","Borrow money","Pay tax"], a:1 },
  { lvl:"junior", q:"What is 'income'?", o:["Money you spend","Money you receive","Money you owe","A type of tax"], a:1 },
  { lvl:"senior", q:"What is 'net worth'?", o:["Total income","Assets minus debts","Monthly salary","A trading fee"], a:1 },
  { lvl:"senior", q:"What does 'APR' stand for?", o:["Annual Percentage Rate","Average Price Return","Annual Profit Ratio","Asset Price Range"], a:0 },
  { lvl:"senior", q:"What is a 'stock dividend'?", o:["A trading fee","Profit shared with shareholders","A type of loss","A loan"], a:1 },
  { lvl:"senior", q:"What is 'compound interest' famous for?", o:["Shrinking money","Growing money faster over time","Being a fee","Being illegal"], a:1 },
  { lvl:"senior", q:"What is the 'stock market'?", o:["A grocery store","Where company shares are traded","A bank","A government office"], a:1 },
  { lvl:"pro", q:"What is 'EBITDA' broadly about?", o:["A company's earnings measure","A type of crypto","A trading bot","A tax form"], a:0 },
  { lvl:"pro", q:"What is a 'stop-limit order'?", o:["Combines stop & limit conditions","Always free","Never fills","A type of coin"], a:0 },
  { lvl:"pro", q:"What is 'slippage' worst during?", o:["Calm markets","High volatility / low liquidity","Weekends only","Never happens"], a:1 },
  { lvl:"pro", q:"What does 'diversification' NOT do?", o:["Reduce risk","Guarantee profit","Spread exposure","Balance a portfolio"], a:1 },
  { lvl:"pro", q:"What is a 'candlestick wick' (shadow)?", o:["The body color","The high/low price extremes","The volume","The fee"], a:1 },

  // ═══ Additional questions ═══
  { lvl:"junior", q:"What does 'HODL' loosely mean?", o:["Sell immediately","Hold on for dear life","A bank fee","A type of chart"], a:1 },
  { lvl:"junior", q:"What is a 'budget'?", o:["A plan for spending money","A type of stock","A bank loan","A tax"], a:0 },
  { lvl:"junior", q:"What is 9 × 9?", o:["72","81","89","91"], a:1 },
  { lvl:"junior", q:"What does 'savings' mean?", o:["Money you spend","Money you keep for later","A type of loan","A tax bracket"], a:1 },
  { lvl:"junior", q:"Which ocean is the largest?", o:["Atlantic","Indian","Pacific","Arctic"], a:2 },
  { lvl:"junior", q:"What is a 'currency'?", o:["A type of food","Money used in a country","A stock chart","A bank building"], a:1 },
  { lvl:"junior", q:"What does 'ATM' stand for?", o:["Automated Teller Machine","All Time Money","Automatic Trade Machine","Asset Trading Method"], a:0 },
  { lvl:"junior", q:"What is the freezing point of water in Celsius?", o:["-10°C","0°C","10°C","32°C"], a:1 },
  { lvl:"junior", q:"What does 'debt' mean?", o:["Money you're owed","Money you owe","Free money","A savings account"], a:1 },
  { lvl:"junior", q:"How many days are in a leap year?", o:["364","365","366","367"], a:2 },

  { lvl:"senior", q:"What is 'inflation'?", o:["Prices falling over time","Prices rising over time","A fixed price","A bank fee"], a:1 },
  { lvl:"senior", q:"What does 'ROI' stand for?", o:["Return On Investment","Rate Of Interest","Risk Of Investing","Return Of Income"], a:0 },
  { lvl:"senior", q:"What is a 'bear market'?", o:["Prices rising fast","Prices falling over time","A frozen market","A new market"], a:1 },
  { lvl:"senior", q:"What is 12 squared?", o:["124","144","132","164"], a:1 },
  { lvl:"senior", q:"Which planet has the most moons (as commonly known)?", o:["Earth","Mars","Saturn","Mercury"], a:2 },
  { lvl:"senior", q:"What does 'IPO' stand for?", o:["Initial Public Offering","Internal Profit Order","Investment Payout Option","Internal Price Offer"], a:0 },
  { lvl:"senior", q:"What is 'net worth'?", o:["Total debt only","Assets minus liabilities","Monthly income","Bank balance only"], a:1 },
  { lvl:"senior", q:"Who wrote Romeo and Juliet?", o:["Charles Dickens","William Shakespeare","Jane Austen","Mark Twain"], a:1 },
  { lvl:"senior", q:"What does 'GDP' stand for?", o:["Gross Domestic Product","Global Debt Payment","General Deposit Plan","Gross Deposit Price"], a:0 },
  { lvl:"senior", q:"What is a 'short position' in trading?", o:["Betting a price will rise","Betting a price will fall","Holding forever","A type of savings"], a:1 },

  { lvl:"pro", q:"What does 'market cap' measure?", o:["Daily trading hours","Total value of a company's shares","Number of employees","Government tax rate"], a:1 },
  { lvl:"pro", q:"What is 'arbitrage'?", o:["Profiting from price differences across markets","A type of tax","A trading fee","A bank loan"], a:0 },
  { lvl:"pro", q:"What does 'leverage' do to risk?", o:["Reduces it always","Amplifies gains and losses","Removes it","Has no effect"], a:1 },
  { lvl:"pro", q:"What is a 'margin call'?", o:["A friendly reminder email","A demand to add funds or reduce position","A type of dividend","A free trade"], a:1 },
  { lvl:"pro", q:"What does 'liquidity risk' mean?", o:["Risk of running out of cash to trade at fair price","Risk of a company going public","Risk of currency printing","Risk of high dividends"], a:0 },

  { lvl:"secret", q:"What is 'impermanent loss' related to?", o:["Bank savings","Crypto liquidity pools","Stock dividends","Government bonds"], a:1, reward:1500 },
  { lvl:"secret", q:"What does 'gas fee' mean in crypto?", o:["Car fuel cost","Fee to process a blockchain transaction","A trading bonus","A bank charge"], a:1, reward:2000 },
  { lvl:"secret", q:"What is a 'DAO'?", o:["A type of coin","Decentralized Autonomous Organization","A trading bot","A bank"], a:1, reward:2500 },

  // ═══ Batch 2 additional questions ═══
  { lvl:"junior", q:"What is 7 × 8?", o:["54","56","58","64"], a:1 },
  { lvl:"junior", q:"What does 'profit' mean?", o:["Money lost","Money earned above cost","A type of tax","A bank fee"], a:1 },
  { lvl:"junior", q:"What is 'cash'?", o:["Physical money","A type of stock","A loan","A chart"], a:0 },
  { lvl:"junior", q:"How many cents in a dollar?", o:["10","50","100","1000"], a:2 },
  { lvl:"junior", q:"What does 'buy low, sell high' mean?", o:["A losing strategy","Buy cheap, sell expensive for profit","Buy expensive only","A tax rule"], a:1 },
  { lvl:"junior", q:"What is a 'discount'?", o:["A price increase","A reduction in price","A type of tax","A bank fee"], a:1 },
  { lvl:"junior", q:"Which is bigger: 1000 or 100?", o:["100","1000","Same","Neither"], a:1 },

  { lvl:"senior", q:"What is 'volatility' in markets?", o:["Price stability","How much a price swings up and down","A type of tax","Trading hours"], a:1 },
  { lvl:"senior", q:"What is a 'portfolio'?", o:["A single stock","Your collection of investments","A bank account","A trading fee"], a:1 },
  { lvl:"senior", q:"What does 'diversify' mean?", o:["Put all money in one place","Spread investments to reduce risk","Sell everything","Avoid investing"], a:1 },
  { lvl:"senior", q:"What is 'liquidity'?", o:["How easily an asset converts to cash","A type of drink","A bank loan","A tax"], a:0 },
  { lvl:"senior", q:"What is 15% of 200?", o:["20","25","30","35"], a:2 },
  { lvl:"senior", q:"What is a 'trend' in trading?", o:["A random move","The general direction of a price over time","A trading fee","A type of chart"], a:1 },

  { lvl:"pro", q:"What is 'slippage' in trading?", o:["Falling on ice","Difference between expected and actual trade price","A type of fee","A bonus"], a:1 },
  { lvl:"pro", q:"What does 'stop-loss' protect against?", o:["Big losses on a trade","Taxes","Bank fees","Winning too much"], a:0 },
  { lvl:"pro", q:"What is a 'bull run'?", o:["A period of rising prices","A period of falling prices","A trading fee","A type of animal race"], a:0 },
  { lvl:"pro", q:"What does 'take profit' mean?", o:["Never selling","Selling at a target to lock in gains","Buying more","Paying tax"], a:1 },
  { lvl:"pro", q:"What is 'FUD' in trading slang?", o:["Fear, Uncertainty, Doubt","A trading tool","A type of coin","Fast Upward Direction"], a:0 },
  { lvl:"pro", q:"What is 'support level' on a chart?", o:["A price where buying tends to stop a fall","The highest price ever","A trading fee","A tax bracket"], a:0 },

  // ═══ Batch 3: 10 per level ═══
  { lvl:"junior", q:"What is 6 + 7?", o:["12","13","14","15"], a:1 },
  { lvl:"junior", q:"What color is often used for 'price up' in trading?", o:["Red","Green","Blue","Black"], a:1 },
  { lvl:"junior", q:"What does 'expensive' mean?", o:["Low price","High price","Free","On sale"], a:1 },
  { lvl:"junior", q:"What is a 'coin' in crypto?", o:["A metal disc","A digital currency unit","A bank note","A stock"], a:1 },
  { lvl:"junior", q:"If you have $10 and spend $4, how much is left?", o:["$4","$6","$14","$40"], a:1 },
  { lvl:"junior", q:"What does 'free' mean?", o:["Costs nothing","Very expensive","A type of tax","A loan"], a:0 },
  { lvl:"junior", q:"What is 'income'?", o:["Money you earn","Money you lose","A type of chart","A bank"], a:0 },
  { lvl:"junior", q:"Which is a way to save money?", o:["Spend everything","Put some aside regularly","Borrow more","Ignore it"], a:1 },
  { lvl:"junior", q:"What does a 'chart' show?", o:["Only text","Price movements over time","Bank rules","Tax forms"], a:1 },
  { lvl:"junior", q:"What is 'change' in a price?", o:["How much it went up or down","The coins in your pocket","A tax","A fee"], a:0 },

  { lvl:"senior", q:"What is 'market sentiment'?", o:["The overall mood of traders","A type of fee","A chart pattern","A bank rule"], a:0 },
  { lvl:"senior", q:"What does 'bullish' mean?", o:["Expecting prices to fall","Expecting prices to rise","A type of coin","A trading fee"], a:1 },
  { lvl:"senior", q:"What does 'bearish' mean?", o:["Expecting prices to rise","Expecting prices to fall","A safe investment","A bonus"], a:1 },
  { lvl:"senior", q:"What is 'ROI'?", o:["Return On Investment","Rate Of Inflation","Risk Of Investing","Return Of Income"], a:0 },
  { lvl:"senior", q:"What is 25% of 400?", o:["50","75","100","125"], a:2 },
  { lvl:"senior", q:"What is an 'asset'?", o:["Something of value you own","A type of debt","A bank fee","A tax"], a:0 },
  { lvl:"senior", q:"What is a 'loss' in trading?", o:["Earning money","Losing money on a trade","A bonus","A fee refund"], a:1 },
  { lvl:"senior", q:"Why do prices change?", o:["Random only","Supply and demand","Bank decides","Government only"], a:1 },
  { lvl:"senior", q:"What is 'break-even'?", o:["Making big profit","No profit, no loss","Total loss","A type of fee"], a:1 },
  { lvl:"senior", q:"What is a 'high-risk' investment?", o:["Guaranteed safe","Can gain or lose a lot","No change ever","Bank-backed"], a:1 },

  { lvl:"pro", q:"What is 'liquidity' in a market?", o:["How easily you can buy/sell without moving price much","The water content","A trading fee","A type of coin"], a:0 },
  { lvl:"pro", q:"What does 'resistance level' mean?", o:["A price where selling tends to stop a rise","The lowest price","A trading bonus","A tax"], a:0 },
  { lvl:"pro", q:"What is 'dollar cost averaging'?", o:["Buying a fixed amount regularly","Buying all at once","Never buying","Selling everything"], a:0 },
  { lvl:"pro", q:"What is a 'limit order'?", o:["Buy/sell at a specific price or better","Buy at any price","A tax form","A bank loan"], a:0 },
  { lvl:"pro", q:"What is 'market cap'?", o:["Total value of all units","A trading fee","A price limit","A type of chart"], a:0 },
  { lvl:"pro", q:"What does 'diversification' reduce?", o:["Profits","Overall risk","Trading hours","Taxes"], a:1 },
  { lvl:"pro", q:"What is a 'whale' in trading?", o:["A large sea animal","Someone with a very large holding","A small trader","A bank"], a:1 },
  { lvl:"pro", q:"What is 'volume' in trading?", o:["How loud the app is","How much is being traded","The screen size","A fee"], a:1 },
  { lvl:"pro", q:"What is 'ATH'?", o:["All-Time High price","A Trading Hour","Automatic Trade Handler","A tax"], a:0 },
  { lvl:"pro", q:"What is a healthy trading habit?", o:["Trading emotionally","Having a plan and managing risk","Chasing every loss","Ignoring news"], a:1 },

  // ═══ Batch 4: 10 more per level ═══
  { lvl:"junior", q:"What does 'save' mean?", o:["Spend money","Keep money for later","Lose money","Borrow money"], a:1 },
  { lvl:"junior", q:"What is 3 + 9?", o:["11","12","13","14"], a:1 },
  { lvl:"junior", q:"Which costs more?", o:["$2","$20","$200","$2000"], a:3 },
  { lvl:"junior", q:"What is a 'price'?", o:["How much something costs","A type of coin","A chart","A fee"], a:0 },
  { lvl:"junior", q:"If price goes UP, that's shown as?", o:["Red/down","Green/up","Nothing","A fee"], a:1 },
  { lvl:"junior", q:"What is 'money'?", o:["Something used to buy things","A type of chart","A game","A tax"], a:0 },
  { lvl:"junior", q:"Half of 100 is?", o:["25","50","75","100"], a:1 },
  { lvl:"junior", q:"What is 'trading'?", o:["Buying and selling","Only saving","Only spending","A tax"], a:0 },
  { lvl:"junior", q:"A good habit with money is?", o:["Waste it","Plan and save","Ignore it","Lose it"], a:1 },
  { lvl:"junior", q:"What is 'value'?", o:["How much something is worth","A color","A fee","A tax"], a:0 },

  { lvl:"senior", q:"What is a 'candlestick chart'?", o:["A chart showing price open/close/high/low","A birthday chart","A fee list","A tax form"], a:0 },
  { lvl:"senior", q:"What does 'profit margin' mean?", o:["The difference between cost and selling price","A trading fee","A type of tax","A chart"], a:0 },
  { lvl:"senior", q:"What is 'risk management'?", o:["Ignoring risk","Controlling how much you could lose","Trading blindly","A fee"], a:1 },
  { lvl:"senior", q:"What is 'compound growth'?", o:["Growth on top of previous growth","A one-time gain","A loss","A fee"], a:0 },
  { lvl:"senior", q:"20% of 300 is?", o:["40","50","60","70"], a:2 },
  { lvl:"senior", q:"What is a 'dividend'?", o:["A share of profits paid to holders","A trading fee","A tax","A loss"], a:0 },
  { lvl:"senior", q:"What is a 'portfolio balance'?", o:["The mix of your investments","A bank balance only","A fee","A chart"], a:0 },
  { lvl:"senior", q:"Buying at a low price is called?", o:["Buying the dip","Selling high","A fee","A loss"], a:0 },
  { lvl:"senior", q:"What is 'capital'?", o:["Money available to invest","A city","A fee","A tax"], a:0 },
  { lvl:"senior", q:"What reduces investment risk?", o:["Putting all in one asset","Diversifying across assets","Ignoring the market","Panic selling"], a:1 },

  { lvl:"pro", q:"What is 'order book depth'?", o:["How many buy/sell orders exist at prices","The book's page count","A trading fee","A tax"], a:0 },
  { lvl:"pro", q:"What is a 'market maker'?", o:["Someone providing liquidity to markets","A news reporter","A tax agent","A chart tool"], a:0 },
  { lvl:"pro", q:"What is 'RSI' in trading?", o:["A momentum indicator","A tax rate","A coin","A fee"], a:0 },
  { lvl:"pro", q:"What does 'oversold' suggest?", o:["Price may have fallen too far","Price is too high","A guaranteed win","A fee"], a:0 },
  { lvl:"pro", q:"What is 'moving average'?", o:["Average price over a period","A moving van","A tax","A fee"], a:0 },
  { lvl:"pro", q:"What is 'position sizing'?", o:["How much to invest per trade","The screen size","A chart type","A tax"], a:0 },
  { lvl:"pro", q:"What is a 'breakout'?", o:["Price moving beyond a key level","A jail escape","A trading fee","A tax"], a:0 },
  { lvl:"pro", q:"What is 'risk-reward ratio'?", o:["Potential loss vs potential gain","A tax rate","A coin","A fee"], a:0 },
  { lvl:"pro", q:"What is 'paper trading'?", o:["Practicing with fake money","Trading paper","A tax form","A real trade"], a:0 },
  { lvl:"pro", q:"The smartest long-term approach is?", o:["Gambling everything","Consistent, disciplined strategy","Chasing hype","Ignoring risk"], a:1 },
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

// Generate Binance-style candlestick data per asset + timeframe.
// Deterministic (seeded) so it's stable, but every asset+timeframe gets a
// DIFFERENT recognizable chart PATTERN — cup & handle, bull flag, bear flag,
// double top/bottom, ascending/descending, breakout, rally, crash, etc.
// This makes charts look like real TradingView patterns instead of flat noise.
function genCandles(seed, basePrice, timeframe) {
  // More candles on shorter frames (Binance-style density)
  const counts = { "1s":48, "1m":46, "5m":44, "15m":42, "1h":40, "4h":38, "12h":36, "1D":34, "1W":32, "1M":30, "1Y":28 };
  // Per-candle volatility — big enough that bodies are always clearly visible
  // (no more flat 1m/1s lines). Longer frames swing more.
  const volMul = { "1s":0.045, "1m":0.05, "5m":0.06, "15m":0.07, "1h":0.085, "4h":0.10, "12h":0.12, "1D":0.11, "1W":0.15, "1M":0.20, "1Y":0.30 };
  const n = counts[timeframe] || 30;
  const v = volMul[timeframe] || 0.07;

  // Stable seed unique to this asset + timeframe
  const tfSeed = seed * 1000 + timeframe.charCodeAt(0) * 7 + (timeframe.charCodeAt(1) || 0) * 13;
  // Seeded PRNG (Mulberry32-ish) — repeatable "random" 0..1
  let s = Math.floor(Math.abs(Math.sin(tfSeed)) * 1e9) + 1;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

  // Pick ONE chart pattern for this asset+timeframe
  const patterns = ["uptrend","downtrend","cup","bullFlag","bearFlag","doubleTop","doubleBottom","rally","crash","consolidation","ascending","vRecovery"];
  const pattern = patterns[Math.floor(Math.abs(Math.sin(tfSeed * 1.7)) * patterns.length) % patterns.length];

  // shape(t) returns a 0..1-ish target multiplier along the chart (t: 0→1).
  // This is the "skeleton" of the pattern; noise is layered on top after.
  function shape(t) {
    const TAU = Math.PI * 2;
    switch (pattern) {
      case "uptrend":       return 0.75 + t * 0.55;                                  // steady climb
      case "downtrend":     return 1.30 - t * 0.55;                                  // steady fall
      case "cup":           return 1.0 - 0.42 * Math.sin(t * Math.PI);               // U shape (cup & handle)
      case "doubleBottom":  return 1.0 - 0.38 * Math.abs(Math.sin(t * Math.PI));     // W-ish
      case "doubleTop":     return 0.75 + 0.42 * Math.abs(Math.sin(t * Math.PI));    // M-ish
      case "bullFlag":      return t < 0.45 ? 0.7 + t * 1.0 : 1.15 - (t-0.45)*0.35;  // pole up, drift down
      case "bearFlag":      return t < 0.45 ? 1.3 - t * 1.0 : 0.85 + (t-0.45)*0.35;  // pole down, drift up
      case "rally":         return 0.7 + Math.pow(t, 1.8) * 0.75;                    // slow then explosive up
      case "crash":         return 1.3 - Math.pow(t, 1.8) * 0.75;                    // slow then dump
      case "vRecovery":     return 1.0 - 0.5 * Math.sin(t * Math.PI) * (t < 0.5 ? 1 : -0.6); // V bounce
      case "ascending":     return 0.8 + t * 0.4 + 0.05 * Math.sin(t * TAU * 3);     // higher lows, steps up
      case "consolidation": return 1.0 + 0.06 * Math.sin(t * TAU * 2.5);             // sideways range
      default:              return 1.0;
    }
  }

  const candles = [];
  const startMul = 0.55 + Math.abs(Math.sin(tfSeed * 0.9)) * 0.5; // varied absolute price level
  let price = Math.max(0.01, basePrice * startMul * shape(0));

  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0;
    const tNext = n > 1 ? (i + 1) / (n - 1) : 1;
    const open = price;

    // Target price from the pattern skeleton (where price "wants" to go)
    const target = Math.max(0.01, basePrice * startMul * shape(tNext));
    // Pull toward the skeleton + add candle-to-candle noise so it looks organic
    const drift = (target - open) * 0.55;
    const noise = (rnd() - 0.5) * open * v * 2.2;
    let close = Math.max(0.001, open + drift + noise);

    // Occasional big momentum candle (breakout / capitulation) for drama
    if (rnd() > 0.86) close = Math.max(0.001, close + (close - open) * (0.8 + rnd()));

    // Wicks — sometimes long (hammer/doji/shooting star), sometimes tight
    const bodyHi = Math.max(open, close);
    const bodyLo = Math.min(open, close);
    const wickUp = rnd() * open * v * 1.4;
    const wickDn = rnd() * open * v * 1.4;
    const high = bodyHi + wickUp;
    const low = Math.max(0.001, bodyLo - wickDn);

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
// Exact currency with thousands separators, e.g. $76,372
function fmtExact(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
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

// ─── Sound effects (Web Audio API — no files needed) ──────────────────
// Short, punchy, Gen-Z friendly tones. Respects the user's sound setting.
let _audioCtx = null;
function getAudioCtx() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Browsers start the audio context "suspended" until a user gesture.
    // Resume it on every call so sounds actually play after the first tap.
    if (_audioCtx.state === "suspended") { _audioCtx.resume().catch(()=>{}); }
    return _audioCtx;
  } catch { return null; }
}
// ─── Volume control (0-100 sliders map to these 0-1 scales) ───────────
let _sfxVolumeScale = 1;    // sound effects
let _musicVolumeScale = 0.5; // background music (kept moderate by default)
function setSfxVolumeScale(v) { _sfxVolumeScale = Math.max(0, Math.min(1, v)); }
function setMusicVolumeScale(v) {
  _musicVolumeScale = Math.max(0, Math.min(1, v));
  if (_bgmNodes) { try { _bgmNodes.master.gain.value = 0.22 * _musicVolumeScale; } catch {} }
}

function playSound(type) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const vScale = _sfxVolumeScale;
    // A single tone with optional pitch slide, filter, and punch
    const tone = (freq, start, dur, vol = 0.4, shape = "sine", slideTo = null) => {
      vol = vol * vScale;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 3500;
      osc.type = shape;
      osc.frequency.setValueAtTime(freq, now + start);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + start + dur);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(vol, now + start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      osc.start(now + start); osc.stop(now + start + dur + 0.02);
    };
    // Punchy noise burst (for clicks/hits) — adds a satisfying "tick"
    const noise = (start, dur, vol = 0.25) => {
      vol = vol * vScale;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = "highpass"; f.frequency.value = 1500;
      g.gain.setValueAtTime(vol, now + start);
      g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      src.buffer = buf; src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(now + start);
    };

    if (type === "tap")        { noise(0, 0.05, 0.3); tone(660, 0, 0.07, 0.3, "triangle"); }
    else if (type === "buy")   { tone(523,0,0.12,0.5,"square",659); tone(784,0.1,0.18,0.45,"square",988); noise(0,0.04,0.2); }   // rising arpeggio
    else if (type === "sell")  { tone(659,0,0.12,0.5,"square",523); tone(440,0.1,0.2,0.45,"square",330); noise(0,0.04,0.2); }   // falling
    else if (type === "win")   { tone(523,0,0.12,0.5,"square"); tone(659,0.11,0.12,0.5,"square"); tone(784,0.22,0.14,0.5,"square"); tone(1046,0.34,0.28,0.55,"square"); } // victory fanfare
    else if (type === "wrong") { tone(200,0,0.28,0.5,"sawtooth",110); noise(0,0.08,0.25); }                                     // descending buzz
    else if (type === "coin")  { tone(1318,0,0.07,0.45,"square"); tone(1760,0.06,0.14,0.45,"square"); }                          // mario-style coin
    else if (type === "level") { tone(523,0,0.1,0.5,"square"); tone(659,0.1,0.1,0.5,"square"); tone(784,0.2,0.1,0.5,"square"); tone(1046,0.3,0.1,0.55,"square"); tone(1318,0.4,0.35,0.6,"square"); } // level-up
    // ── Asset "personality" sounds — louder & punchier ──
    else if (type === "chill")   { tone(440,0,0.3,0.4,"sine",554); tone(660,0.12,0.3,0.3,"sine"); }                              // dreamy
    else if (type === "tense")   { tone(146,0,0.18,0.5,"sawtooth"); tone(155,0.1,0.22,0.45,"sawtooth"); noise(0,0.05,0.2); }     // ominous
    else if (type === "awkward") { tone(440,0,0.12,0.4,"triangle",415); tone(370,0.14,0.22,0.4,"triangle",349); }               // wobble
    else if (type === "spooky")  { tone(220,0,0.4,0.4,"sine",233); tone(311,0.18,0.4,0.3,"sine",294); }                          // eerie
    else if (type === "hype")    { tone(660,0,0.09,0.5,"square"); tone(880,0.08,0.1,0.5,"square"); tone(1320,0.17,0.2,0.55,"square"); noise(0,0.05,0.25); } // exciting
    else if (type === "sad")     { tone(392,0,0.3,0.45,"sine",330); tone(294,0.2,0.4,0.4,"sine",262); }                          // melancholy
  } catch {}
}

// ─── Background music — a soft, looping lo-fi style chord pad ───────────
// Built entirely with Web Audio (no files, copyright-free). Gentle and quiet
// so it sits behind gameplay. Fully on/off via settings.
let _bgmNodes = null;
let _bgmTimer = null;
function startBGM() {
  const ctx = getAudioCtx();
  if (!ctx || _bgmNodes) return;
  try {
    if (ctx.state === "suspended") ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0.22 * _musicVolumeScale; // audible but not overpowering, scaled by slider
    master.connect(ctx.destination);
    _bgmNodes = { master };

    // Chord progression (lo-fi gaming vibe)
    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 277.18, 329.63], // Am
      [196.00, 246.94, 293.66], // G
      [174.61, 220.00, 261.63], // F
    ];
    const bassNotes = [130.81, 110.00, 98.00, 87.31]; // C2 A2 G2 F2
    let step = 0;

    const playBar = () => {
      if (!_bgmNodes) return;
      const t = ctx.currentTime;
      const chord = chords[step % chords.length];
      const bassFreq = bassNotes[step % bassNotes.length];

      // Soft pad chord
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.3);
        g.gain.linearRampToValueAtTime(0.0001, t + 1.9);
        osc.connect(g); g.connect(master);
        osc.start(t); osc.stop(t + 2.0);
      });

      // Warm bass
      const bass = ctx.createOscillator();
      const bg = ctx.createGain();
      bass.type = "sine"; bass.frequency.value = bassFreq;
      bg.gain.setValueAtTime(0.3, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      bass.connect(bg); bg.connect(master);
      bass.start(t); bass.stop(t + 0.85);

      // Simple kick + hat beat (4 beats per bar) for a chill gaming groove
      for (let b = 0; b < 4; b++) {
        const bt = t + b * 0.5;
        // kick
        const k = ctx.createOscillator(); const kg = ctx.createGain();
        k.type = "sine"; k.frequency.setValueAtTime(120, bt); k.frequency.exponentialRampToValueAtTime(45, bt + 0.12);
        kg.gain.setValueAtTime(0.4, bt); kg.gain.exponentialRampToValueAtTime(0.001, bt + 0.14);
        k.connect(kg); kg.connect(master); k.start(bt); k.stop(bt + 0.16);
        // hi-hat (noise) on off-beats
        if (b % 2 === 1) {
          const dur = 0.04;
          const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
          const src = ctx.createBufferSource(); const hg = ctx.createGain();
          const hf = ctx.createBiquadFilter(); hf.type = "highpass"; hf.frequency.value = 6000;
          hg.gain.setValueAtTime(0.15, bt); hg.gain.exponentialRampToValueAtTime(0.001, bt + dur);
          src.buffer = buf; src.connect(hf); hf.connect(hg); hg.connect(master);
          src.start(bt);
        }
      }
      step++;
    };
    playBar();
    _bgmTimer = setInterval(playBar, 2000);
  } catch {}
}
function stopBGM() {
  try {
    if (_bgmTimer) { clearInterval(_bgmTimer); _bgmTimer = null; }
    if (_bgmNodes) { try { _bgmNodes.master.disconnect(); } catch {} _bgmNodes = null; }
  } catch {}
}

// Map each asset to a "personality" sound based on its vibe
function assetMood(symbol) {
  const moods = {
    VIBE:"chill", SLEE:"chill", CLOUD:"chill", PLAN:"chill",
    DRAM:"tense", CRNG:"awkward", AWKE:"awkward", VIBE2:"awkward", TYPO:"awkward",
    GHOST:"spooky", LEFT:"spooky", EXNRG:"sad", MNDY:"sad", OVRT:"sad", SNZE:"sad",
    RDBR:"hype", MENT:"hype", GRPJ:"hype", BATT:"hype", BUFF:"tense",
    AUTO:"awkward", MUTE:"awkward", FOMO:"tense", DIET:"sad", SPOI:"awkward",
    REPL:"tense", ALRM:"sad", TABS:"chill", DELV:"tense",
  };
  return moods[symbol] || "tap";
}

// ─── Supabase helpers — every call is wrapped so a network/RLS error
//     never crashes the app; it just silently falls back to local-only ───

// Generate a stable per-device UUID (acts as the "account id" until real auth exists)
function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem("oddex_device_id");
    if (!id) {
      id = (crypto && crypto.randomUUID) ? crypto.randomUUID() :
        "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
      localStorage.setItem("oddex_device_id", id);
    }
    return id;
  } catch {
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  }
}

// ─── Simple auth (username + password) backed by Supabase ─────────────
// Passwords are hashed with SHA-256 before storing — we never save plain text.
// Note: this is a lightweight auth for a fun game (no money, no sensitive data),
// not a bank-grade system. Good enough and safe for this use case.
async function hashPassword(pw) {
  try {
    const enc = new TextEncoder().encode(pw + "::oddexvibe_salt_2026");
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback (older browsers): not as strong, but never store plain text
    let h = 0; const s = pw + "salt";
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return "fb" + Math.abs(h).toString(16);
  }
}

// Sign up a new account. Returns { ok, error }.
async function signupAccount({ username, password, gender, birthdate, foodName }) {
  try {
    const uname = username.trim();
    // Check username not taken
    const { data: existing, error: selErr } = await supabase
      .from("profiles").select("id").ilike("username", uname).maybeSingle();
    if (selErr) { console.error("Signup select error:", selErr); return { ok:false, error:"DB error: " + selErr.message }; }
    if (existing) return { ok:false, error:"That username is already taken." };
    const password_hash = await hashPassword(password);
    const row = { username: uname, password_hash, food_name: (foodName||"").trim().toLowerCase() };
    if (gender) row.gender = gender;
    if (birthdate) row.birthdate = birthdate;
    const { error } = await supabase.from("profiles").insert(row);
    if (error) {
      console.error("Signup insert error:", error);
      return { ok:false, error:"Signup failed: " + error.message };
    }
    return { ok:true };
  } catch (e) {
    console.error("Signup exception:", e);
    return { ok:false, error:"Network error: " + (e?.message || "unknown") };
  }
}

// Log in. Returns { ok, error, profile }.
async function loginAccount({ username, password }) {
  try {
    const { data: profile, error: selErr } = await supabase
      .from("profiles").select("*").ilike("username", username.trim()).maybeSingle();
    if (selErr) return { ok:false, error:"DB: " + selErr.message };
    if (!profile) return { ok:false, error:"No account with that username." };
    const hash = await hashPassword(password);
    if (profile.password_hash !== hash) return { ok:false, error:"Wrong password." };
    return { ok:true, profile };
  } catch (e) { return { ok:false, error:"Error: " + (e?.message || "network") }; }
}

// Recover: verify food name, then set a new password. Returns { ok, error }.
async function recoverAccount({ username, foodName, newPassword }) {
  try {
    const { data: profile } = await supabase
      .from("profiles").select("*").ilike("username", username.trim()).maybeSingle();
    if (!profile) return { ok:false, error:"No account with that username." };
    if ((profile.food_name||"") !== (foodName||"").trim().toLowerCase())
      return { ok:false, error:"Security answer doesn't match." };
    const password_hash = await hashPassword(newPassword);
    const { error } = await supabase.from("profiles").update({ password_hash }).eq("id", profile.id);
    if (error) return { ok:false, error:"Could not reset password." };
    return { ok:true };
  } catch { return { ok:false, error:"Network error. Please try again." }; }
}

// Create (or skip if it exists) this user's profile row in Supabase.
// Used for the legacy device-based identity (guests without an account).
async function ensureProfile(deviceId, name) {
  try {
    const { data: existing, error: selErr } = await supabase
      .from("profiles").select("*").or(`username.eq.${name},Username.eq.${name}`).maybeSingle();
    if (selErr) {
      // .or() with an unknown column name can error — fall back to a plain select by username only
      const fallback = await supabase.from("profiles").select("*").eq("username", name).maybeSingle();
      if (fallback.data) return true;
    } else if (existing) {
      return true;
    }
    let { error: insErr } = await supabase.from("profiles").insert({ username: name });
    if (insErr) {
      const retry = await supabase.from("profiles").insert({ Username: name });
      insErr = retry.error;
    }
    return !insErr;
  } catch { return false; }
}

// Upsert this user's score row (net worth + xp) into Supabase
async function pushScore(deviceId, netWorth, xp, portfolioStr, username) {
  try {
    const wk = getWeekId();
    // Prefer matching by username (stable across resets/devices) so a player
    // never creates duplicate leaderboard rows. Fall back to device id if no name.
    let existing = null;
    if (username) {
      const byName = await supabase.from("scores").select("id, user_id, week_id, week_start_worth")
        .eq("username", username).maybeSingle();
      existing = byName.data || null;
    }
    if (!existing) {
      const byId = await supabase.from("scores").select("id, user_id, week_id, week_start_worth")
        .eq("user_id", deviceId).maybeSingle();
      existing = byId.data || null;
    }

    // Determine weekly baseline: if it's a new week (or first time), set baseline = current net worth
    let weekFields = {};
    if (!existing || existing.week_id !== wk || existing.week_start_worth == null) {
      weekFields = { week_id: wk, week_start_worth: netWorth };
    }

    const base = { net_worth: netWorth, xp, user_id: deviceId };
    // Attach the display username so the leaderboard can show real names
    const withName = username ? { ...base, username } : base;
    const withPf = portfolioStr != null ? { ...withName, portfolio: portfolioStr } : withName;
    const full = { ...withPf, ...weekFields };

    if (existing) {
      // Update the existing row (matched by name or id) — keeps it to ONE row per player
      let { error } = await supabase.from("scores").update(full).eq("id", existing.id);
      if (error) {
        const { error: e2 } = await supabase.from("scores").update(withName).eq("id", existing.id);
        if (e2) await supabase.from("scores").update({ net_worth: netWorth, xp }).eq("id", existing.id);
      }
    } else {
      let { error } = await supabase.from("scores").insert(full);
      if (error) {
        const { error: e2 } = await supabase.from("scores").insert(withName);
        if (e2) await supabase.from("scores").insert({ user_id: deviceId, net_worth: netWorth, xp });
      }
    }
    return true;
  } catch { return false; }
}

// Fetch top scores for the real leaderboard (with portfolio + weekly data + username).
async function fetchLeaderboard(limit = 50) {
  try {
    let { data: scores, error } = await supabase
      .from("scores").select("user_id, net_worth, xp, portfolio, week_id, week_start_worth, username")
      .order("net_worth", { ascending: false }).limit(limit);
    if (error) {
      // Some columns may not exist yet — retry with just the basics
      const retry = await supabase.from("scores").select("user_id, net_worth, xp")
        .order("net_worth", { ascending: false }).limit(limit);
      scores = retry.data; error = retry.error;
    }
    if (error || !scores) return null;
    const wk = getWeekId();
    const mapped = scores.map((s, i) => {
      // Weekly profit = current worth − this week's starting worth (only if same week)
      const sameWeek = s.week_id === wk && s.week_start_worth != null;
      const weekProfit = sameWeek ? (s.net_worth - s.week_start_worth) : 0;
      // Show the real username if we have one; otherwise a safe anonymous fallback
      const displayName = (s.username && s.username.trim())
        ? s.username.trim()
        : "Trader#" + String(s.user_id || i).slice(-4).toUpperCase();
      return {
        id: s.user_id,
        name: displayName,
        worth: s.net_worth,
        xp: s.xp,
        portfolio: s.portfolio || null,
        weekProfit,
      };
    });
    // Safety net: if any duplicate names slipped in (old data), keep only the
    // highest net-worth entry per name so the leaderboard stays clean.
    const seen = new Map();
    for (const p of mapped) {
      const key = p.name.toLowerCase();
      if (!seen.has(key) || seen.get(key).worth < p.worth) seen.set(key, p);
    }
    return Array.from(seen.values()).sort((a, b) => b.worth - a.worth);
  } catch { return null; }
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
function Onboarding({ onStart, onLogin }) {
  // mode: "home" | "guest" | "signup" | "login" | "recover"
  const [mode, setMode] = useState("home");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("free");
  const [nameErr, setNameErr] = useState(false);

  // auth form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [foodName, setFoodName] = useState("");
  const [newPw, setNewPw] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [busy, setBusy] = useState(false);

  const wrap = (children) => (
    <div style={{ position:"fixed", inset:0, background:"rgba(2,2,10,0.97)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:"4vw", overflowY:"auto" }}>
      <div style={{ background:"#09091c", border:"1px solid #1e1e38", borderRadius:16,
        padding:"clamp(20px,5vw,38px) clamp(16px,4vw,32px)", maxWidth:480, width:"100%", margin:"auto" }}>
        <div style={{ background:"#ff440011", border:"1px solid #ff440033", borderRadius:6,
          padding:"6px 10px", fontSize:"clamp(0.55rem,2vw,0.62rem)", color:"#ff7744",
          marginBottom:18, letterSpacing:"0.04em" }}>
          ⚠️ FOR ENTERTAINMENT ONLY — Simulated prices. No real money.
        </div>
        {children}
      </div>
    </div>
  );

  const logo = (
    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.6rem,7vw,2.2rem)", letterSpacing:"0.1em", marginBottom:4 }}>
      ODD<span style={{color:"#7c6fff"}}>EX</span>{" "}
      <span style={{color:"#00ff88", fontSize:"0.7em"}}>VIBE</span>
    </div>
  );

  const inputStyle = (err) => ({
    width:"100%", padding:"clamp(10px,3vw,13px) 14px",
    border: err ? "1px solid #ff4466" : "1px solid #1e1e38",
    borderRadius:8, marginBottom:10, display:"block", boxSizing:"border-box",
    background:"#0c0c1e", color:"#eee", fontSize:"clamp(0.82rem,3vw,0.92rem)",
    fontFamily:"'JetBrains Mono',monospace"
  });
  const btnPrimary = {
    width:"100%", minHeight:48, border:"none", borderRadius:8, cursor:"pointer", marginTop:4,
    fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.9rem,3.5vw,1.1rem)",
    letterSpacing:"0.12em", background:"linear-gradient(135deg,#7c6fff,#4433cc)", color:"#fff"
  };
  const btnGhost = {
    width:"100%", minHeight:44, border:"1px solid #2a2a40", borderRadius:8, cursor:"pointer", marginTop:8,
    fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.82rem,3vw,0.95rem)", letterSpacing:"0.1em",
    background:"transparent", color:"#aaa"
  };
  const label = (t) => (
    <div style={{ color:"#aaa", fontSize:"clamp(0.58rem,2vw,0.64rem)", letterSpacing:"0.1em", marginBottom:4, marginTop:6 }}>{t}</div>
  );

  // Password field with show/hide eye icon
  const pwField = (val, setVal, placeholder) => (
    <div style={{ position:"relative", marginBottom:10 }}>
      <input type={showPw ? "text" : "password"} value={val} onChange={e=>{setVal(e.target.value); setAuthErr("");}}
        placeholder={placeholder} style={{ ...inputStyle(false), marginBottom:0, paddingRight:44 }} />
      <button type="button" onClick={()=>setShowPw(s=>!s)}
        style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
          background:"transparent", border:"none", cursor:"pointer", fontSize:"1rem", padding:4 }}>
        {showPw ? "🙈" : "👁️"}
      </button>
    </div>
  );

  // ── HOME: choose guest / login / signup ──
  if (mode === "home") {
    return wrap(
      <>
        {logo}
        <div style={{ color:"#999", fontSize:"clamp(0.7rem,2.6vw,0.78rem)", marginBottom:22, lineHeight:1.6 }}>
          The world's only exchange for vibes, drama,<br/>goose rumors and other odd assets.
        </div>
        <button style={btnPrimary} onClick={()=>{ setMode("guest"); setStep(0); }}>▶ PLAY AS GUEST</button>
        <button style={btnGhost} onClick={()=>{ setMode("signup"); setAuthErr(""); }}>✦ CREATE ACCOUNT</button>
        <button style={btnGhost} onClick={()=>{ setMode("login"); setAuthErr(""); }}>↪ LOG IN</button>
        <div style={{ color:"#666677", fontSize:"0.58rem", textAlign:"center", marginTop:16, lineHeight:1.5 }}>
          Guest progress saves on this device only.<br/>An account saves your name on the global leaderboard.
        </div>
      </>
    );
  }

  // ── SIGNUP ──
  if (mode === "signup") {
    const doSignup = async () => {
      setAuthErr("");
      if (username.trim().length < 3) return setAuthErr("Username must be at least 3 letters.");
      if (password.length < 4) return setAuthErr("Password must be at least 4 characters.");
      if (password !== confirmPw) return setAuthErr("Passwords don't match.");
      if (!foodName.trim()) return setAuthErr("Please enter a favorite food (for password recovery).");
      setBusy(true);
      const res = await signupAccount({ username, password, gender, birthdate, foodName });
      setBusy(false);
      if (!res.ok) return setAuthErr(res.error);
      // account created — start playing right away (everyone gets the free tier)
      onStart(username.trim(), "free", true);
    };
    return wrap(
      <>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.2rem,5vw,1.5rem)", letterSpacing:"0.08em", marginBottom:14 }}>CREATE ACCOUNT</div>
        {label("USERNAME")}
        <input value={username} onChange={e=>{setUsername(e.target.value); setAuthErr("");}} placeholder="e.g. VibeGod420" maxLength={16} style={inputStyle(false)} />
        {label("PASSWORD")}
        {pwField(password, setPassword, "your password")}
        {label("CONFIRM PASSWORD")}
        {pwField(confirmPw, setConfirmPw, "type it again")}
        {label("FAVORITE FOOD (for password recovery)")}
        <input value={foodName} onChange={e=>{setFoodName(e.target.value); setAuthErr("");}} placeholder="e.g. biryani" maxLength={30} style={inputStyle(false)} />
        {label("GENDER (optional)")}
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          {["male","female","other"].map(g => (
            <button key={g} type="button" onClick={()=>setGender(g)}
              style={{ flex:1, minHeight:38, borderRadius:8, cursor:"pointer", textTransform:"capitalize",
                border:"1px solid "+(gender===g?"#7c6fff":"#2a2a40"), background:gender===g?"#7c6fff22":"transparent",
                color:gender===g?"#9988ff":"#888", fontSize:"0.72rem" }}>{g}</button>
          ))}
        </div>
        {label("BIRTHDATE (optional)")}
        <input type="date" value={birthdate} onChange={e=>setBirthdate(e.target.value)} style={inputStyle(false)} />
        {authErr && <div style={{ color:"#ff4466", fontSize:"0.72rem", margin:"6px 0" }}>{authErr}</div>}
        <button style={{...btnPrimary, opacity:busy?0.6:1}} disabled={busy} onClick={doSignup}>{busy ? "CREATING..." : "CREATE & CONTINUE →"}</button>
        <button style={btnGhost} onClick={()=>{ setMode("home"); setAuthErr(""); }}>← BACK</button>
      </>
    );
  }

  // ── LOGIN ──
  if (mode === "login") {
    const doLogin = async () => {
      setAuthErr("");
      if (!username.trim() || !password) return setAuthErr("Enter username and password.");
      setBusy(true);
      const res = await loginAccount({ username, password });
      setBusy(false);
      if (!res.ok) return setAuthErr(res.error);
      onLogin(res.profile); // hand the profile back to the app
    };
    return wrap(
      <>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.2rem,5vw,1.5rem)", letterSpacing:"0.08em", marginBottom:14 }}>LOG IN</div>
        {label("USERNAME")}
        <input value={username} onChange={e=>{setUsername(e.target.value); setAuthErr("");}} placeholder="your username" maxLength={16} style={inputStyle(false)} />
        {label("PASSWORD")}
        {pwField(password, setPassword, "your password")}
        {authErr && <div style={{ color:"#ff4466", fontSize:"0.72rem", margin:"6px 0" }}>{authErr}</div>}
        <button style={{...btnPrimary, opacity:busy?0.6:1}} disabled={busy} onClick={doLogin}>{busy ? "LOGGING IN..." : "LOG IN →"}</button>
        <button style={btnGhost} onClick={()=>{ setMode("recover"); setAuthErr(""); }}>🔑 Forgot password?</button>
        <button style={btnGhost} onClick={()=>{ setMode("home"); setAuthErr(""); }}>← BACK</button>
      </>
    );
  }

  // ── RECOVER (forgot password via food name) ──
  if (mode === "recover") {
    const doRecover = async () => {
      setAuthErr("");
      if (!username.trim() || !foodName.trim() || !newPw) return setAuthErr("Fill all fields.");
      if (newPw.length < 4) return setAuthErr("New password must be at least 4 characters.");
      setBusy(true);
      const res = await recoverAccount({ username, foodName, newPassword: newPw });
      setBusy(false);
      if (!res.ok) return setAuthErr(res.error);
      setAuthErr("");
      setPassword(""); setMode("login");
      alert("Password reset! Please log in with your new password.");
    };
    return wrap(
      <>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.2rem,5vw,1.5rem)", letterSpacing:"0.08em", marginBottom:6 }}>RESET PASSWORD</div>
        <div style={{ color:"#888", fontSize:"0.66rem", marginBottom:14 }}>Verify your favorite food to set a new password.</div>
        {label("USERNAME")}
        <input value={username} onChange={e=>{setUsername(e.target.value); setAuthErr("");}} placeholder="your username" maxLength={16} style={inputStyle(false)} />
        {label("FAVORITE FOOD")}
        <input value={foodName} onChange={e=>{setFoodName(e.target.value); setAuthErr("");}} placeholder="e.g. biryani" maxLength={30} style={inputStyle(false)} />
        {label("NEW PASSWORD")}
        {pwField(newPw, setNewPw, "new password")}
        {authErr && <div style={{ color:"#ff4466", fontSize:"0.72rem", margin:"6px 0" }}>{authErr}</div>}
        <button style={{...btnPrimary, opacity:busy?0.6:1}} disabled={busy} onClick={doRecover}>{busy ? "RESETTING..." : "RESET PASSWORD →"}</button>
        <button style={btnGhost} onClick={()=>{ setMode("login"); setAuthErr(""); }}>← BACK TO LOGIN</button>
      </>
    );
  }

  // ── GUEST name entry (step 0) ──
  if (mode === "guest" && step === 0) {
    return wrap(
      <>
        {logo}
        <div style={{ color:"#aaa", fontSize:"clamp(0.6rem,2vw,0.66rem)", letterSpacing:"0.12em", marginBottom:6, marginTop:8 }}>CHOOSE A TRADER NAME</div>
        <input value={name} onChange={e => { setName(e.target.value); setNameErr(false); }}
          onKeyDown={e => e.key === "Enter" && name.trim() && setStep(1)}
          placeholder="e.g. VibeGod420" maxLength={16} autoFocus style={inputStyle(nameErr)} />
        {nameErr && <div style={{ color:"#ff4466", fontSize:"0.74rem", marginBottom:8 }}>Pick a name to continue.</div>}
        <button style={btnPrimary} onClick={() => { if (!name.trim()) { setNameErr(true); return; } onStart(name.trim(), "free", false); }}>START TRADING →</button>
        <button style={btnGhost} onClick={()=>setMode("home")}>← BACK</button>
      </>
    );
  }

  // ── PLAN selection (shared by guest step 1 and after signup) ──
  // (mode === "plan" after signup, or mode === "guest" && step === 1)
  if (mode === "plan" || (mode === "guest" && step === 1)) {
    return wrap(
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
                  background:"#0c0c1e", borderRadius:4, padding:"2px 6px" }}>{f==="All odd assets"?`All ${ASSETS.length} odd assets`:f}</span>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:6 }}>
          <button onClick={() => { if (mode==="plan") { setMode("signup"); } else { setStep(0); } }} style={{
            minWidth:90, minHeight:50, border:"1px solid #2a2a40", borderRadius:8, cursor:"pointer",
            fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.85rem,3vw,1rem)", letterSpacing:"0.1em",
            background:"transparent", color:"#888" }}>
            ← BACK
          </button>
          <button onClick={() => onStart(name.trim(), plan, mode==="plan")} style={{
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
    );
  }

  return null;
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
  const [recentTrades, setRecentTrades] = useState([]); // live fake trade feed (Binance-style)
  const [newsEvents, setNewsEvents] = useState([]); // real news headlines from backend
  const [activeNews, setActiveNews] = useState(null); // currently highlighted news event
  const [aiComment, setAiComment] = useState(""); // AI trading-host reaction to current news
  const [portfolio, setPortfolio] = useState(saved?.portfolio ?? []);
  const [balance,   setBalance]   = useState(saved?.balance ?? 10000);
  const [achieved,  setAchieved]  = useState(saved?.achieved ?? []);
  const [oQty,      setOQty]      = useState(1);
  const [oType,     setOType]     = useState("buy");
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("candle"); // candle | wave
  const [toast,     setToast]     = useState(null);
  const [payLoader, setPayLoader] = useState(null);
  const [pwaPrompt, setPwaPrompt] = useState(false);
  const [canInstall, setCanInstall] = useState(false); // true when browser allows PWA install
  const [isInstalled, setIsInstalled] = useState(false); // true when already running as installed app
  const [showIosHelp, setShowIosHelp] = useState(false); // iPhone manual install instructions
  const [installBannerClosed, setInstallBannerClosed] = useState(false); // user dismissed the install banner
  const [achPop,    setAchPop]    = useState(null);
  const [burst,     setBurst]     = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  // Real multiplayer (Supabase) state
  const [realLeaderboard, setRealLeaderboard] = useState(null); // null = not loaded yet, [] = loaded empty
  const [isOnline, setIsOnline] = useState(false); // true once Supabase sync succeeds at least once
  const deviceIdRef = useRef(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  // Settings: sound + theme, persisted in localStorage
  const [settings, setSettings] = useState(saved?.settings ?? { sound:true, music:false, theme:"dark", sfxVolume:100, musicVolume:50 });
  const [showSettings, setShowSettings] = useState(false);
  // Daily login streak: { streak, lastClaim: "YYYY-MM-DD" }
  const [dailyReward, setDailyReward] = useState(saved?.dailyReward ?? { streak:0, lastClaim:null, claimCount:0, claimDay:null });
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyAmount, setDailyAmount] = useState(0);
  // Daily spin wheel: { lastSpin: "YYYY-MM-DD" }
  const [spinData, setSpinData] = useState(saved?.spinData ?? { lastSpin:null, spinCount:0, spinDay:null });
  const [showSpin, setShowSpin] = useState(false);
  const [showShare, setShowShare] = useState(false); // "Flex my portfolio" share modal
  const [showChat, setShowChat] = useState(false); // community chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatWarnings, setChatWarnings] = useState(saved?.chatWarnings ?? 0); // strikes
  const [tradeStreak, setTradeStreak] = useState(saved?.tradeStreak ?? 0); // consecutive days traded
  const [lastTradeDay, setLastTradeDay] = useState(saved?.lastTradeDay ?? null);
  const [tradedToday, setTradedToday] = useState(false);
  const [showStreakPop, setShowStreakPop] = useState(false);
  const [chatMutedUntil, setChatMutedUntil] = useState(saved?.chatMutedUntil ?? null);
  const [chatNotice, setChatNotice] = useState(""); // warning/info shown to user
  const [showInvite, setShowInvite] = useState(false); // referral / invite modal
  const [inviteCopied, setInviteCopied] = useState(false);
  const [referrals, setReferrals] = useState(saved?.referrals ?? 0); // how many friends joined
  const [claimedRefTiers, setClaimedRefTiers] = useState(saved?.claimedRefTiers ?? []); // reward tiers already claimed
  const [joinedDiscord, setJoinedDiscord] = useState(saved?.joinedDiscord ?? false);
  const [joinedReddit, setJoinedReddit] = useState(saved?.joinedReddit ?? false);
  const [lastShareDay, setLastShareDay] = useState(saved?.lastShareDay ?? null); // daily share bonus
  const [shareCopied, setShareCopied] = useState(false);
  const [showBroke, setShowBroke] = useState(false); // "Went broke" overlay
  const [brokeUntil, setBrokeUntil] = useState(saved?.brokeUntil ?? null); // timestamp when lockout ends
  const [brokeQuizzes, setBrokeQuizzes] = useState(0); // quizzes done toward early unlock
  const [nowTick, setNowTick] = useState(Date.now()); // for live countdown
  const [showShop, setShowShop] = useState(false); // theme/skins shop
  const [ownedSkins, setOwnedSkins] = useState(saved?.ownedSkins ?? ["default"]);
  const [activeSkin, setActiveSkin] = useState(saved?.activeSkin ?? "default");
  const [viewPlayer, setViewPlayer] = useState(null); // for viewing another player's portfolio
  const [boardView, setBoardView] = useState("alltime"); // "alltime" | "weekly"
  const [refreshingBoard, setRefreshingBoard] = useState(false);
  // Tracks this week's starting net worth for the current user (for accurate weekly profit)
  const [weekBaseline, setWeekBaseline] = useState(saved?.weekBaseline ?? null);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinAngle, setSpinAngle] = useState(0);

  // Quiz state
  const [quizLevel, setQuizLevel] = useState("junior");
  const [quizQ, setQuizQ] = useState(null);        // current question object
  const [quizOpts, setQuizOpts] = useState([]);     // shuffled options with original index
  const [quizAnswered, setQuizAnswered] = useState(null); // null | {picked, correct}
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizStats, setQuizStats] = useState(saved?.quizStats ?? { correct:0, wrong:0, earned:0 });
  // Academy progress: { completedLessons: [lessonIds], streak: n, lastDay: "YYYY-MM-DD" }
  const [academyProgress, setAcademyProgress] = useState(saved?.academyProgress ?? { completed:[], streak:0, lastDay:null, xp:0 });
  const [academyLevelId, setAcademyLevelId] = useState(null);
  const [academyLessonId, setAcademyLessonId] = useState(null);
  const [academyQIdx, setAcademyQIdx] = useState(0);
  const [academyAnswered, setAcademyAnswered] = useState(null);
  const [academyCorrectCount, setAcademyCorrectCount] = useState(0);
  const [academyLessonDone, setAcademyLessonDone] = useState(false);
  const [pendingReward, setPendingReward] = useState(0);
  const [askedQs, setAskedQs] = useState([]); // questions already shown this session
  const queueRef = useRef([]); // shuffled queue of questions - guarantees no repeat

  const toastRef = useRef(null);
  const rafRef = useRef(null);
  const lastTickRef = useRef(0);
  const deferRef = useRef(null);
  const achPopRef = useRef(null);

  const sel = assets.find(a => a.id === selId) || assets[0];
  const heldQty = (portfolio.find(p => p.id === selId)?.qty) || 0; // units of selected asset owned
  const portVal = portfolio.reduce((s, p) => { const a = assets.find(x => x.id === p.id); return s + (a ? a.price : 0) * p.qty; }, 0);
  const netWorth = balance + portVal;

  // ══ Bankruptcy / "Went Broke" detection ════════════════════════════
  // Trigger when net worth falls below $500 (basically wiped out).
  useEffect(() => {
    if (user && netWorth < 500 && !showBroke && !brokeUntil) {
      setShowBroke(true);
      setBrokeUntil(Date.now() + 30 * 60 * 1000); // 30-min lockout
      setBrokeQuizzes(0);
      sfx("sad");
      track("went_broke", { netWorth: Math.round(netWorth) });
    }
  }, [netWorth, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live countdown tick (updates every second while broke overlay is open)
  useEffect(() => {
    if (!brokeUntil) return;
    const iv = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [brokeUntil]);

  function recoverFromBroke() {
    setBalance(10000);
    setPortfolio([]);
    setShowBroke(false);
    setBrokeUntil(null);
    setBrokeQuizzes(0);
    sfx("win");
    setBurst(true); setTimeout(()=>setBurst(false), 650);
    showToast("Fresh start! $10,000 loaded 🎉");
    track("broke_recovered");
  }
  // Check if lockout timer has passed
  const brokeTimeLeft = brokeUntil ? Math.max(0, brokeUntil - nowTick) : 0;
  const canRecover = brokeUntil && (brokeTimeLeft <= 0 || brokeQuizzes >= 3);

  // ══ Skins / Theme shop (buy with in-game cash) ══════════════════════
  const SKINS = [
    { id:"default",   name:"Classic Green",  price:0,    accent:"#00ff88", emoji:"💚" },
    { id:"gold",      name:"Gold Tier",      price:1000, accent:"#ffd700", emoji:"👑" },
    { id:"ice",       name:"Ice Blue",       price:1500, accent:"#4fc3f7", emoji:"❄️" },
    { id:"cyberpunk", name:"Cyberpunk Vibe", price:2000, accent:"#ff2d95", emoji:"🌆" },
    { id:"sunset",    name:"Sunset Orange",  price:2500, accent:"#ff7a00", emoji:"🌅" },
    { id:"royal",     name:"Royal Purple",   price:3000, accent:"#a855f7", emoji:"💜" },
  ];
  function buySkin(skin) {
    const applyColors = (s) => {
      // Each theme sets a matching candle/accent color scheme (visible change)
      const SCHEME = {
        default:   { up:"#00ff88", down:"#ff4466" },
        gold:      { up:"#ffd700", down:"#ff6b35" },
        ice:       { up:"#4fc3f7", down:"#ff5e8a" },
        cyberpunk: { up:"#00e5ff", down:"#ff2d95" },
        sunset:    { up:"#ff9500", down:"#ff2d55" },
        royal:     { up:"#a855f7", down:"#ff4466" },
      };
      const sc = SCHEME[s.id] || SCHEME.default;
      setUpColor(sc.up); setDownColor(sc.down);
    };
    if (ownedSkins.includes(skin.id)) { setActiveSkin(skin.id); applyColors(skin); sfx("tap"); showToast(skin.name + " applied! 🎨"); return; }
    if (balance < skin.price) { showToast("Not enough cash! Trade more 💰", "err"); return; }
    setBalance(b => parseFloat((b - skin.price).toFixed(2)));
    setOwnedSkins(prev => [...prev, skin.id]);
    setActiveSkin(skin.id);
    applyColors(skin);
    sfx("coin");
    showToast(skin.name + " unlocked! 🎨");
    track("skin_bought", { skin: skin.id });
  }
  const skinAccent = (SKINS.find(s => s.id === activeSkin) || SKINS[0]).accent;
  // User-customizable up/down (candle & price) colors
  const [upColor, setUpColor] = useState(saved?.upColor ?? "#00ff88");
  const [downColor, setDownColor] = useState(saved?.downColor ?? "#ff4466");
  // Apply colors as global CSS variables so the whole app can use them
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--up", upColor);
    r.style.setProperty("--down", downColor);
    r.style.setProperty("--accent", skinAccent);
  }, [upColor, downColor, skinAccent]);

  // Apply the active skin as a real, visible theme shift across the whole app.
  // Each skin has a hue-rotate + saturation tweak so the entire green/purple
  // palette re-tints at once (instant, no need to touch every element).
  useEffect(() => {
    // Theme = change the ACCENT color only, keep the dark Binance background.
    // (hue-rotate re-tinted the whole screen incl. background — looked wrong.)
    const root = document.getElementById("root");
    if (root) root.style.filter = "none"; // ensure no leftover filter
    // The active skin's accent + custom up/down colors drive the themed elements
    // via CSS variables (already set above). Nothing else to do here.
    return () => {};
  }, [activeSkin]);

  // ══ Save to localStorage whenever key data changes ══════════════════
  useEffect(() => {
    if (user) writeSave({ user, balance, portfolio, achieved, quizStats, academyProgress, settings, dailyReward, spinData, weekBaseline, brokeUntil, ownedSkins, activeSkin, upColor, downColor, referrals, claimedRefTiers, joinedDiscord, joinedReddit, lastShareDay, chatWarnings, chatMutedUntil, tradeStreak, lastTradeDay });
  }, [user, balance, portfolio, achieved, quizStats, academyProgress, settings]);

  // Sound helper — only plays if the user has sound enabled in settings
  const sfx = useCallback((type) => { if (settings.sound) playSound(type); }, [settings.sound]);

  // ══ Weekly tournament baseline — set/reset this week's starting net worth ══
  useEffect(() => {
    if (!user) return;
    const wk = getWeekId();
    // If no baseline yet, or it's a new week, snapshot the current net worth as the week's start
    if (!weekBaseline || weekBaseline.week !== wk) {
      setWeekBaseline({ week: wk, worth: netWorth });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ══ Daily login reward — show popup once per day when user is active ══
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0,10);
    const usedToday = dailyReward.claimDay === today ? (dailyReward.claimCount || 0) : 0;
    if (usedToday >= 3) return; // all 3 claimed today
    // Decide streak: consecutive day continues, otherwise reset to 1
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    const newStreak = (usedToday === 0 && dailyReward.lastClaim === yesterday) ? dailyReward.streak + 1
                    : (usedToday === 0 ? 1 : dailyReward.streak);
    // Reward scales within a 7-day cycle: Day1=$200 ... Day6=$700, Day7=$2000 MEGA
    const dayInCycle = ((newStreak - 1) % 7) + 1;
    const amount = dayInCycle === 7 ? 2000 : (100 + dayInCycle * 100);
    setDailyAmount(amount);
    // Small delay so it doesn't clash with app load
    const t = setTimeout(() => setShowDailyReward(true), 800);
    return () => clearTimeout(t);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ══ "Flex My Portfolio" — build a shareable brag text + copy to clipboard ══
  function buildShareText() {
    const worth = fmt(netWorth);
    // Find my rank on the live board (if available)
    let rankLine = "";
    const myRank = board.find(p => p.isMe)?.rank;
    if (myRank) rankLine = `I'm ranked #${myRank} on the ODDEX VIBE leaderboard! `;
    // Find my best-performing holding for extra flex
    let bestLine = "";
    if (portfolio.length > 0) {
      let best = null;
      for (const p of portfolio) {
        const a = assets.find(x => x.id === p.id);
        if (!a) continue;
        const pct = ((a.price - p.avg) / p.avg) * 100;
        if (!best || pct > best.pct) best = { sym: a.symbol, pct };
      }
      if (best && best.pct > 0) bestLine = `📈 Up ${best.pct.toFixed(0)}% on ${best.sym}! `;
    }
    // Pick 2 random asset names from the live list to make the brag feel genuine
    const pool = assets.map(a => a.name);
    const pick2 = [];
    while (pick2.length < 2 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      pick2.push(pool.splice(idx, 1)[0]);
    }
    const assetNames = pick2.length >= 2 ? `${pick2[0]} & ${pick2[1]}` : "absurd assets";
    return `🔥 My net worth on ODDEX VIBE is ${worth}! ${rankLine}${bestLine}Trade absurd assets like ${assetNames} 😂 Can you beat me?\n\n👉 oddexvibe.com`;
  }
  function copyShare() {
    const text = buildShareText();
    try {
      navigator.clipboard.writeText(text).then(() => {
        setShareCopied(true); sfx("coin");
        setTimeout(() => setShareCopied(false), 2000);
      }).catch(() => fallbackCopy(text));
    } catch { fallbackCopy(text); }
  }
  function fallbackCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      setShareCopied(true); setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }

  // ══ Referral detection — if user arrived via ?ref=friend, give them a bonus ══
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && user && !localStorage.getItem("oddex_ref_used")) {
        localStorage.setItem("oddex_ref_used", ref);
        // New user gets a welcome bonus for using a friend's link
        setBalance(b => parseFloat((b + 5000).toFixed(2)));
        showToast("Welcome! +$5,000 from your friend's invite 🎁");
        track("referral_join", { referrer: ref });
      }
    } catch (e) {}
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Each player gets a personal link. Friends who join = rewards for both.
  function myReferralCode() {
    return encodeURIComponent((user?.name || "player").replace(/\s+/g, "").toLowerCase());
  }
  function myReferralLink() {
    return "https://oddexvibe.com?ref=" + myReferralCode();
  }
  function buildInviteText() {
    return `🎮 Join me on ODDEX VIBE — trade absurd assets like Internet Drama & Ex's Energy 😂\n\nUse my link and we BOTH get $5,000 bonus cash! 💰\n\n👉 ${myReferralLink()}`;
  }
  function copyInvite() {
    const text = buildInviteText();
    try {
      navigator.clipboard.writeText(text).then(() => {
        setInviteCopied(true); sfx("coin");
        setTimeout(() => setInviteCopied(false), 2000);
      }).catch(() => { fallbackCopy(text); setInviteCopied(true); setTimeout(()=>setInviteCopied(false),2000); });
    } catch { fallbackCopy(text); }
    // Daily share bonus — reward the player for sharing once per day
    const today = new Date().toISOString().slice(0,10);
    if (lastShareDay !== today) {
      setLastShareDay(today);
      setBalance(b => parseFloat((b + 1000).toFixed(2)));
      showToast("Shared! +$1,000 daily share bonus 🎉");
    }
  }
  // Referral milestone rewards (claim when enough friends join)
  const REF_TIERS = [
    { need: 1,  reward: 5000,  label: "First Friend" },
    { need: 3,  reward: 20000, label: "3 Friends — PRO unlocked!" },
    { need: 5,  reward: 40000, label: "5 Friends" },
    { need: 10, reward: 100000, label: "10 Friends — WHALE!" },
  ];
  function claimRefTier(tier) {
    if (referrals < tier.need || claimedRefTiers.includes(tier.need)) return;
    setBalance(b => parseFloat((b + tier.reward).toFixed(2)));
    setClaimedRefTiers(prev => [...prev, tier.need]);
    sfx("win"); setBurst(true); setTimeout(()=>setBurst(false),650);
    showToast(tier.label + " — +$" + tier.reward.toLocaleString() + "! 🎉");
  }
  // Community join — one-time bonus for joining Discord / Reddit
  function joinCommunity(which) {
    const urls = {
      discord: "https://discord.gg/oddexvibe",
      reddit: "https://reddit.com/r/oddexvibe",
    };
    try { window.open(urls[which], "_blank"); } catch {}
    if (which === "discord" && !joinedDiscord) {
      setJoinedDiscord(true); setBalance(b => parseFloat((b + 2500).toFixed(2)));
      showToast("Joined Discord! +$2,500 🎉"); sfx("coin");
    } else if (which === "reddit" && !joinedReddit) {
      setJoinedReddit(true); setBalance(b => parseFloat((b + 2500).toFixed(2)));
      showToast("Joined Reddit! +$2,500 🎉"); sfx("coin");
    }
  }

  // ══ Community Chat + Auto-moderation ═══════════════════════════════
  // Bad-word filter (basic list). Blocks message + escalating punishment.
  const BAD_WORDS = ["fuck","shit","bitch","asshole","cunt","nigger","faggot","retard","whore","slut","dick","pussy","bastard","motherfucker","rape","kill yourself","kys"];
  function containsBadWord(text) {
    const t = text.toLowerCase().replace(/[^a-z\s]/g, ""); // strip symbols to catch f*ck etc.
    return BAD_WORDS.some(w => t.includes(w));
  }
  function isChatMuted() {
    return chatMutedUntil && Date.now() < chatMutedUntil;
  }
  function muteTimeLeft() {
    if (!chatMutedUntil) return "";
    const ms = chatMutedUntil - Date.now();
    if (ms <= 0) return "";
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    if (hrs >= 24) return Math.floor(hrs/24) + " day(s)";
    if (hrs >= 1) return hrs + "h " + mins + "m";
    return mins + " min";
  }
  async function loadChat() {
    try {
      const { data } = await supabase.from("chat_messages").select("*").order("created_at", { ascending: false }).limit(40);
      if (data) setChatMessages(data.reverse());
    } catch (e) {}
  }
  async function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    // Muted? Block.
    if (isChatMuted()) {
      setChatNotice("🔇 You're muted for " + muteTimeLeft() + " due to rule violations.");
      return;
    }
    // Bad content? Warn + escalating punishment (like big apps do).
    if (containsBadWord(text)) {
      const strikes = chatWarnings + 1;
      setChatWarnings(strikes);
      let msg, until = null;
      if (strikes === 1) msg = "⚠️ Warning: Your message was blocked for inappropriate language. This is a friendly space — please keep it respectful. Next time you'll be muted.";
      else if (strikes === 2) { until = Date.now() + 3600000; msg = "🔇 You've been muted for 1 HOUR for repeated abuse. Keep breaking rules and mutes get longer."; }
      else if (strikes === 3) { until = Date.now() + 86400000; msg = "🔇 Muted for 1 DAY. Final warnings — next violation is a 7-day ban."; }
      else { until = Date.now() + 7 * 86400000; msg = "🚫 Banned from chat for 7 DAYS due to repeated violations."; }
      if (until) setChatMutedUntil(until);
      setChatNotice(msg);
      setChatInput("");
      sfx("sad");
      return;
    }
    // Clean message — send to Supabase
    setChatInput("");
    setChatNotice("");
    try {
      const { error } = await supabase.from("chat_messages").insert({ player_name: user?.name || "anon", message: text });
      if (error) { setChatNotice("⚠️ " + error.message + " (chat_messages table Supabase mein banayi?)"); return; }
      loadChat();
    } catch (e) { setChatNotice("⚠️ " + (e?.message || "Couldn't send")); }
  }

  // Load chat messages when chat opens, refresh every 5s while open
  useEffect(() => {
    if (!showChat) return;
    loadChat();
    const iv = setInterval(loadChat, 5000);
    return () => clearInterval(iv);
  }, [showChat]); // eslint-disable-line react-hooks/exhaustive-deps

  function claimDailyReward() {
    const today = new Date().toISOString().slice(0,10);
    const usedToday = dailyReward.claimDay === today ? (dailyReward.claimCount || 0) : 0;
    if (usedToday >= 3) { showToast("All 3 daily rewards claimed! Come back tomorrow 🎁", "err"); setShowDailyReward(false); return; }
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    const newStreak = (usedToday === 0 && dailyReward.lastClaim === yesterday) ? dailyReward.streak + 1
                    : (usedToday === 0 ? 1 : dailyReward.streak);
    setBalance(b => parseFloat((b + dailyAmount).toFixed(2)));
    setDailyReward({ streak:newStreak, lastClaim:today, claimDay:today, claimCount:usedToday + 1 });
    setShowDailyReward(false);
    sfx("coin");
    setBurst(true); setTimeout(()=>setBurst(false), 650);
    showToast("Reward claimed! +$" + dailyAmount + " 🎁 (" + (usedToday+1) + "/3 today)");
    track("daily_reward_claim", { amount: dailyAmount, streak: newStreak });
  }

  // ══ Daily Spin Wheel ════════════════════════════════════════════════
  // 8 segments with different cash prizes. One free spin per day.
  const SPIN_PRIZES = [100, 500, 250, 1000, 150, 750, 300, 2000];
  function doSpin() {
    if (spinning) return;
    const today = new Date().toISOString().slice(0,10);
    const usedToday = spinData.spinDay === today ? (spinData.spinCount || 0) : 0;
    if (usedToday >= 5) { showToast("All 5 spins used today! Come back tomorrow 🎡", "err"); return; }
    setSpinning(true);
    setSpinResult(null);
    // Pick a random winning segment
    const idx = Math.floor(Math.random() * SPIN_PRIZES.length);
    const prize = SPIN_PRIZES[idx];
    const segAngle = 360 / SPIN_PRIZES.length;
    // Spin 5 full turns + land on the chosen segment (pointer at top)
    const target = 360 * 5 + (360 - idx * segAngle - segAngle / 2);
    setSpinAngle(target);
    sfx("hype");
    setTimeout(() => {
      setSpinning(false);
      setSpinResult(prize);
      setBalance(b => parseFloat((b + prize).toFixed(2)));
      setSpinData(prev => {
        const d = new Date().toISOString().slice(0,10);
        const cnt = prev.spinDay === d ? (prev.spinCount || 0) + 1 : 1;
        return { lastSpin: d, spinDay: d, spinCount: cnt };
      });
      sfx("win");
      setBurst(true); setTimeout(()=>setBurst(false), 650);
      showToast("You won $" + prize + " on the wheel! 🎡");
      track("spin_wheel", { prize });
    }, 3200);
  }

  // Background music — start/stop based on the music setting
  useEffect(() => {
    if (settings.music) startBGM();
    else stopBGM();
    return () => stopBGM();
  }, [settings.music]);

  // Keep the sound engine's volume scales in sync with the slider settings
  useEffect(() => {
    setSfxVolumeScale((settings.sfxVolume ?? 100) / 100);
  }, [settings.sfxVolume]);
  useEffect(() => {
    setMusicVolumeScale((settings.musicVolume ?? 50) / 100);
  }, [settings.musicVolume]);

  // Unlock audio on the very first user interaction anywhere (browsers require a gesture).
  // After this, all sounds + music work normally.
  useEffect(() => {
    const unlock = () => {
      const ctx = getAudioCtx();
      if (ctx && ctx.state === "suspended") ctx.resume().catch(()=>{});
      if (settings.music) startBGM();
    };
    window.addEventListener("pointerdown", unlock, { once:true });
    window.addEventListener("keydown", unlock, { once:true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [settings.music]);

  // ══ Real multiplayer: init device id + fetch real leaderboard ═══════
  useEffect(() => {
    deviceIdRef.current = getOrCreateDeviceId();
    if (user) {
      // returning user — make sure their profile exists in Supabase too
      ensureProfile(deviceIdRef.current, user.name).then(ok => { if (ok) setIsOnline(true); });
    }
    fetchLeaderboard().then(lb => { if (lb) setRealLeaderboard(lb); });
    // Refresh leaderboard frequently so other players appear quickly
    const interval = setInterval(() => {
      fetchLeaderboard().then(lb => { if (lb) setRealLeaderboard(lb); });
    }, 12000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ══ PWA install prompt ══════════════════════════════════════════════
  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isStandalone) { setIsInstalled(true); return; } // already installed — no button needed

    // Show the install button by default (unless already installed). If the
    // browser fires beforeinstallprompt we'll use the native dialog; otherwise
    // tapping the button shows manual step-by-step instructions.
    setCanInstall(true);

    const onPrompt = e => {
      e.preventDefault();
      deferRef.current = e; // native install available — button will use it
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // When the app gets installed, hide the button
    const onInstalled = () => { setIsInstalled(true); setCanInstall(false); setPwaPrompt(false); };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function handleAddToHome() {
    if (deferRef.current) {
      // Android/Chrome/Edge with native support: show the real install dialog
      deferRef.current.prompt();
      deferRef.current.userChoice.then(() => { deferRef.current = null; setCanInstall(false); });
    } else {
      // No native prompt (iPhone, or Chrome hasn't fired it yet) — show manual steps
      setShowIosHelp(true);
    }
    setPwaPrompt(false);
  }

  // ══ Price simulator (rAF, every 1s — fast & volatile like Binance) ══
  useEffect(() => {
    function tick(ts) {
      if (ts - lastTickRef.current >= 1000) {
        lastTickRef.current = ts;
        setAssets(prev => prev.map(a => {
          // Combine a smooth wave with random jitter for lively, crypto-like movement
          const wave = ((Math.sin(ts * 0.0015 + a.id * 17.3) + 1) / 2);
          const jitter = (Math.random() - 0.5) * 1.6; // extra randomness each tick
          const swing = ((wave - 0.48) + jitter) * a.price * a.volatility * 1.8;
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

  // ══ Real news feed from backend (celebrity/sports/entertainment) ════
  useEffect(() => {
    const BACKEND = "https://oddex-backend-production.up.railway.app";
    let cancelled = false;

    async function loadNews() {
      try {
        const res = await fetch(BACKEND + "/news");
        const data = await res.json();
        if (cancelled || !data.events || data.events.length === 0) return;
        // Keep only REAL news (filter out the "Market buzz around X" demo fallback)
        const real = data.events.filter(e => e.headline && !e.headline.includes("Market buzz around"));
        // Use real news if available; otherwise keep whatever we have
        setNewsEvents(real.length > 0 ? real : data.events);
      } catch (e) { /* backend offline — game keeps working without news */ }
    }
    loadNews();
    const iv = setInterval(loadNews, 60000); // refresh every 60s
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // Rotate through news events — each becomes "active" and nudges its asset's price
  useEffect(() => {
    if (newsEvents.length === 0) return;
    let idx = 0;
    const showNext = () => {
      const ev = newsEvents[idx % newsEvents.length];
      idx++;
      if (!ev) return;
      setActiveNews(ev);
      // Fetch a funny AI trading-host reaction for this headline.
      // Keep the previous comment on screen until the new one arrives (no blink).
      (async () => {
        try {
          const r = await fetch("https://oddex-backend-production.up.railway.app/comment?headline=" + encodeURIComponent(ev.headline) + "&symbol=" + encodeURIComponent(ev.symbol));
          const d = await r.json();
          if (d.comment) setAiComment(d.comment);
        } catch (e) {}
      })();
      // Apply the news impact to the matching asset's price (pump or dump)
      setAssets(prev => prev.map(a => {
        if (a.symbol !== ev.symbol) return a;
        const factor = 1 + (ev.impact / 100) * 0.15; // scaled so it's noticeable but not crazy
        const newPrice = Math.max(0.01, a.price * factor);
        const rounded = parseFloat(newPrice.toFixed(4));
        // Save this news-driven price so chart history builds even without trades
        savePriceToHistory(a.symbol, rounded);
        return { ...a, price: rounded, change: ev.impact };
      }));
    };
    showNext();
    const iv = setInterval(showNext, 8000); // new headline every 8s
    return () => clearInterval(iv);
  }, [newsEvents]);

  // ══ Fake "Recent Trades" live stream (Binance-style activity feed) ═══
  useEffect(() => {
    const names = ["Trader", "Whale", "Ape", "Degen", "HODLer", "Sniper", "Bull", "Bear"];
    const gen = () => {
      const a = assets[Math.floor(Math.random() * assets.length)];
      if (!a) return null;
      const side = Math.random() > 0.5 ? "buy" : "sell";
      const qty = [50, 100, 150, 200, 250, 500, 750, 1200][Math.floor(Math.random() * 8)];
      const who = names[Math.floor(Math.random() * names.length)] + "#" + Math.floor(1000 + Math.random() * 8999);
      return { id: Date.now() + Math.random(), who, side, qty, symbol: a.symbol, price: a.price.toFixed(2) };
    };
    // Seed a few so it's not empty at start
    setRecentTrades(Array.from({ length: 8 }, gen).filter(Boolean));
    const iv = setInterval(() => {
      const t = gen();
      if (t) setRecentTrades(prev => [t, ...prev].slice(0, 25));
    }, 700);
    return () => clearInterval(iv);
  }, [assets.length]);

  const pickAsset = useCallback(id => {
    setSelId(id);
    setChart([]);
    const a = ASSETS.find(x => x.id === id);
    if (a && settings.sound) playSound(assetMood(a.symbol));
  }, [settings.sound]);

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

  // ══ Save a price point to Supabase (builds real chart history over time) ══
  // Fire-and-forget: if it fails (offline, etc.) the game keeps running normally.
  async function savePriceToHistory(symbol, price) {
    try {
      await supabase.from("price_history").insert({
        symbol: symbol,
        price: parseFloat(Number(price).toFixed(4)),
      });
    } catch (e) { /* offline or error — ignore, never block gameplay */ }
  }

  // ══ Trade ════════════════════════════════════════════════════════════
  function updateTradeStreak() {
    const today = new Date().toISOString().slice(0,10);
    if (lastTradeDay === today) return; // already counted today
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    const newStreak = lastTradeDay === yesterday ? tradeStreak + 1 : 1;
    setTradeStreak(newStreak);
    setLastTradeDay(today);
    setTradedToday(true);
    // Reward for keeping the daily trading habit
    const bonus = Math.min(500 + newStreak * 250, 5000);
    setBalance(b => parseFloat((b + bonus).toFixed(2)));
    setShowStreakPop(true);
    setTimeout(() => setShowStreakPop(false), 3500);
    sfx("coin");
  }

  function executeTrade() {
    updateTradeStreak();
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
      sfx("buy");
      savePriceToHistory(sel.symbol, sel.price); // record price on buy
      track("trade_buy", { symbol: sel.symbol, quantity: oQty, cost: Math.round(cost) });
      showToast("Bought " + oQty + " " + sel.symbol + " (slip " + (luck > 1 ? "+" : "") + slip + "%) ✅");
    } else {
      const held = portfolio.find(p => p.id === selId);
      if (!held || held.qty < oQty) { showToast("You don't own enough 😭", "err"); return; }
      setBalance(b => parseFloat((b + cost).toFixed(2)));
      setPortfolio(prev => prev.map(p => p.id === selId ? { ...p, qty: p.qty - oQty } : p).filter(p => p.qty > 0));
      unlock("first_trade");
      sfx("sell");
      savePriceToHistory(sel.symbol, sel.price); // record price on sell
      track("trade_sell", { symbol: sel.symbol, quantity: oQty, value: Math.round(cost) });
      showToast("Sold " + oQty + " " + sel.symbol + " 💰");
    }
    setOQty(1);
  }

  // ══ Profit + whale achievements (check on every tick) ═══════════════
  useEffect(() => {
    if (netWorth >= 50000) unlock("whale_club");
    if (netWorth >= 250000) unlock("millionaire");
    if (portfolio.length >= 10) unlock("portfolio_10");
    for (const p of portfolio) {
      const a = assets.find(x => x.id === p.id);
      if (a && a.price > p.avg) { unlock("profit"); }
      if (a && (a.price - p.avg) * p.qty >= 10000) { unlock("big_profit"); }
    }
  }, [netWorth, portfolio, assets, unlock]);

  // ══ Sync score to Supabase every 20s (throttled, never blocks UI) ════
  const lastSyncRef = useRef(0);
  useEffect(() => {
    if (!user) return;
    const now = Date.now();
    if (now - lastSyncRef.current < 20000) return; // throttle
    lastSyncRef.current = now;
    const id = deviceIdRef.current || getOrCreateDeviceId();
    // Build a compact portfolio summary for sharing (symbol + qty only — no personal data)
    const pfStr = JSON.stringify(portfolio.map(p => {
      const a = assets.find(x => x.id === p.id);
      return { s: a?.symbol || "?", q: p.qty, v: a ? Math.round(a.price * p.qty) : 0 };
    }));
    pushScore(id, netWorth, academyProgress.xp, pfStr, user?.name).then(ok => { if (ok) setIsOnline(true); });
  }, [netWorth, user, academyProgress.xp]);

  function handleStart(name, plan, isAccount) {
    setUser({ name, plan, account: !!isAccount });
    setBalance(PLAN_CASH[plan]);
    setPortfolio([]);
    setAchieved([]);
    setTab("trade"); // always land on the trading screen after starting
    track(isAccount ? "signup" : "play_as_guest", { plan });
    // Register this trader name in Supabase (silently — never blocks gameplay)
    const deviceId = getOrCreateDeviceId();
    deviceIdRef.current = deviceId;
    ensureProfile(deviceId, name).then(ok => { if (ok) setIsOnline(true); });
  }

  // Called when an existing account logs in — restore their identity
  function handleLogin(profile) {
    const uname = profile.username || profile.Username || "Trader";
    setUser({ name: uname, plan: "free", account: true });
    setIsOnline(true);
    setTab("trade");
    track("login");
    // Use their profile id as the stable identity for scores
    try { localStorage.setItem("oddex_device_id", String(profile.id)); } catch {}
    deviceIdRef.current = String(profile.id);
  }

  function handleUpgrade(planId) {
    if (!user) return;
    if (user.plan === planId) { showToast("You're already on " + planId.toUpperCase() + " ✓"); return; }
    track("plan_upgrade_click", { plan: planId });
    setPayLoader(planId);
    setTimeout(() => {
      setPayLoader(null);
      setUser(prev => ({ ...prev, plan: planId }));
      // Top up balance to the new plan's starting cash (only if higher, so we don't punish)
      setBalance(b => Math.max(b, PLAN_CASH[planId]));
      showToast("Welcome to " + planId.toUpperCase() + " 🎉");
      setTab("trade");
    }, 1500);
  }

  // ══ Quiz logic ══════════════════════════════════════════════════════
  function loadQuestion(level) {
    // Use a shuffled queue stored in ref. Pull from front. When empty, reshuffle.
    if (!queueRef.current || queueRef.current.length === 0) {
      const pool = QUIZ_BANK.filter(q => q.lvl === level);
      queueRef.current = shuffle(pool);
    }
    const q = queueRef.current.shift(); // take next, remove from queue
    const opts = shuffle(q.o.map((text, idx) => ({ text, idx })));
    setQuizQ(q);
    setQuizOpts(opts);
    setQuizAnswered(null);
  }

  function startQuiz(level) {
    setQuizLevel(level);
    track("quiz_start", { level });
    const pool = QUIZ_BANK.filter(q => q.lvl === level);
    queueRef.current = shuffle(pool);
    const q = queueRef.current.shift();
    const opts = shuffle(q.o.map((text, idx) => ({ text, idx })));
    setQuizQ(q);
    setQuizOpts(opts);
    setQuizAnswered(null);
    setPendingReward(0);
  }

  function answerQuiz(pickedIdx) {
    if (quizAnswered) return; // already answered
    const correct = pickedIdx === quizQ.a;
    // junior/senior/pro = 300. secret uses the question's own reward field.
    const reward = quizLevel === "secret" ? (quizQ.reward || 900) : 300;
    const penalty = 300;
    setQuizAnswered({ picked: pickedIdx, correct });
    sfx(correct ? "win" : "wrong");
    if (correct) {
      setPendingReward(reward); // wait for user to choose CASH or PORTFOLIO
      const newStreak = quizStreak + 1;
      setQuizStreak(newStreak);
      const newCorrect = quizStats.correct + 1;
      setQuizStats(st => ({ ...st, correct: st.correct + 1, earned: st.earned + reward }));
      track("quiz_complete", { correct: true });
      // If currently broke, count correct answers toward the 3-quiz early unlock
      if (brokeUntil) setBrokeQuizzes(q => Math.min(3, q + 1));
      setBurst(true); setTimeout(() => setBurst(false), 650);
      showToast("Correct! +$" + reward + " 🎉 — choose where to add it");
      // Quiz achievements
      unlock("first_quiz");
      if (newCorrect >= 5) unlock("quiz_5");
      if (newCorrect >= 20) unlock("quiz_20");
      if (newStreak >= 5) unlock("streak_5");
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

  // ══ Academy logic (Duolingo-style course) ═══════════════════════════
  function isLevelUnlocked(levelIdx) {
    if (levelIdx === 0) return true;
    const prevLevel = ACADEMY[levelIdx - 1];
    return prevLevel.lessons.every(l => academyProgress.completed.includes(l.id));
  }
  function isLessonUnlocked(levelIdx, lessonIdx) {
    if (!isLevelUnlocked(levelIdx)) return false;
    if (lessonIdx === 0) return true;
    const prevLesson = ACADEMY[levelIdx].lessons[lessonIdx - 1];
    return academyProgress.completed.includes(prevLesson.id);
  }
  function startLesson(levelId, lessonId) {
    setAcademyLevelId(levelId);
    setAcademyLessonId(lessonId);
    // Resume from where the user left off (if they didn't finish this lesson before)
    const saved = academyProgress.inProgress;
    if (saved && saved.lessonId === lessonId && !academyProgress.completed.includes(lessonId)) {
      setAcademyQIdx(saved.qIdx || 0);
      setAcademyCorrectCount(saved.correct || 0);
    } else {
      setAcademyQIdx(0);
      setAcademyCorrectCount(0);
    }
    setAcademyAnswered(null);
    setAcademyLessonDone(false);
    track("academy_lesson_open", { level: levelId, lesson: lessonId });
  }
  function exitLesson() {
    setAcademyLevelId(null);
    setAcademyLessonId(null);
  }
  function answerAcademy(pickedIdx, correctIdx) {
    if (academyAnswered !== null) return;
    const correct = pickedIdx === correctIdx;
    setAcademyAnswered({ picked: pickedIdx, correct });
    sfx(correct ? "coin" : "wrong");
    if (correct) setAcademyCorrectCount(c => c + 1);
  }
  function nextAcademyQ(lesson) {
    if (academyQIdx + 1 < lesson.qs.length) {
      const nextIdx = academyQIdx + 1;
      setAcademyQIdx(nextIdx);
      setAcademyAnswered(null);
      // Save progress so the user can resume this lesson later from here
      setAcademyProgress(prev => ({
        ...prev,
        inProgress: { lessonId: academyLessonId, qIdx: nextIdx, correct: academyCorrectCount + (academyAnswered?.correct ? 0 : 0) }
      }));
    } else {
      // Lesson finished — mark complete, award XP + cash, update streak
      const xpEarned = 20;
      const cashEarned = 150;
      const today = new Date().toISOString().slice(0,10);
      setAcademyProgress(prev => {
        const alreadyDone = prev.completed.includes(academyLessonId);
        const newCompleted = alreadyDone ? prev.completed : [...prev.completed, academyLessonId];
        let newStreak = prev.streak;
        if (prev.lastDay !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
          newStreak = prev.lastDay === yesterday ? prev.streak + 1 : 1;
        }
        return { completed:newCompleted, streak:newStreak, lastDay:today, xp: prev.xp + (alreadyDone?0:xpEarned), inProgress:null };
      });
      if (!academyProgress.completed.includes(academyLessonId)) {
        setBalance(b => parseFloat((b + cashEarned).toFixed(2)));
      }
      setAcademyLessonDone(true);
      track("academy_lesson_complete", { level: academyLevelId, lesson: academyLessonId, correct: academyCorrectCount });
      sfx("level");
      setBurst(true); setTimeout(()=>setBurst(false), 650);
    }
  }

  function submitFeedback() {
    if (!feedbackRating && !feedbackText.trim()) {
      showToast("Please add a rating or comment", "err");
      return;
    }
    // Save feedback to localStorage so owner can view all feedback
    try {
      const existing = JSON.parse(localStorage.getItem("oddex_feedback") || "[]");
      existing.push({
        rating: feedbackRating,
        text: feedbackText.trim(),
        user: user?.name || "anon",
        date: new Date().toISOString(),
      });
      localStorage.setItem("oddex_feedback", JSON.stringify(existing));
    } catch {}
    // Send feedback to Supabase so YOU can read every user's feedback in the dashboard
    (async () => {
      try {
        await supabase.from("feedback").insert({
          rating: feedbackRating || null,
          comment: feedbackText.trim() || null,
          player_name: user?.name || "anon",
        });
      } catch (e) { /* offline — localStorage still has it */ }
    })();
    // Also send to Google Analytics as an event (if GA is loaded)
    try {
      if (window.gtag) {
        window.gtag("event", "feedback_submitted", {
          rating: feedbackRating,
          has_comment: feedbackText.trim().length > 0,
        });
      }
    } catch {}
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackSent(false);
      setFeedbackText("");
      setFeedbackRating(0);
    }, 1800);
  }

  function handleReset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("oddex_device_id"); // fresh identity on Supabase too
    } catch {}
    deviceIdRef.current = getOrCreateDeviceId();
    setIsOnline(false);
    setUser(null);
    setBalance(10000);
    setPortfolio([]);
    setAchieved([]);
    setQuizStats({ correct:0, wrong:0, earned:0 });
    setDailyReward({ streak:0, lastClaim:null });
    setShowDailyReward(false);
    setSpinData({ lastSpin:null });
    setShowBroke(false); setBrokeUntil(null); setBrokeQuizzes(0);
    setWeekBaseline(null);
    setShowSpin(false);
    setQuizQ(null);
    setConfirmReset(false);
    setTab("trade");
  }

  // Real leaderboard from Supabase (if loaded), with current user's live net worth merged in.
  // Falls back to mock LEADERBOARD if Supabase hasn't returned data yet (e.g. first load, offline).
  const myId = deviceIdRef.current;
  // Current user's own weekly profit (tracked locally so it's instant, before Supabase sync)
  const myWeekProfit = user ? Math.max(0, netWorth - (weekBaseline?.worth ?? netWorth)) : 0;
  let board;
  if (realLeaderboard && realLeaderboard.length > 0) {
    const others = realLeaderboard.filter(p => p.id !== myId);
    const mine = user ? [{ id:myId, name:user.name, worth:netWorth, plan:user.plan, isMe:true, titleCount:achieved.length, weekProfit:myWeekProfit }] : [];
    const all = [...mine, ...others.map(p => ({ ...p, isMe:false, plan:"free" }))];
    // Sort by weekly profit in weekly view, otherwise by total net worth
    if (boardView === "weekly") {
      board = all.sort((a,b) => (b.weekProfit||0) - (a.weekProfit||0)).map((p,i) => ({ ...p, rank:i+1, pct:0 }));
    } else {
      board = all.sort((a,b) => b.worth - a.worth).map((p,i) => ({ ...p, rank:i+1, pct:0 }));
    }
  } else {
    board = user
      ? [{ name:user.name, worth:netWorth, pct:0, plan:user.plan, isMe:true, weekProfit:myWeekProfit }, ...LEADERBOARD]
          .sort((a, b) => b.worth - a.worth).map((p, i) => ({ ...p, rank:i+1 }))
      : LEADERBOARD.map((p, i) => ({ ...p, rank:i+1, isMe:false }));
  }

  const CW = 1000, CH = 460;
  // Binance-style candlesticks — change with timeframe
  const baseCandles = genCandles(sel.id, sel.basePrice, timeframe);
  // How fast the newest (live) candle evolves per timeframe. Shorter frames
  // update visibly fast (like 1s/1m on Binance), longer frames drift slowly.
  const tfSpeed = { "1s":350, "1m":600, "5m":900, "15m":1300, "1h":1800, "4h":2400, "12h":3200, "1D":4000, "1W":5200, "1M":6500, "1Y":8000 };
  const speed = tfSpeed[timeframe] || 1000;
  // Live clock — nowTick updates every second, so the chart re-renders and the
  // last candle animates over time. The phase is timeframe-dependent so every
  // frame moves at a different, believable pace.
  const clock = nowTick / speed;
  const candles = baseCandles.map((c, i) => {
    if (i !== baseCandles.length - 1) return c;
    // Newest candle "forms" live: it breathes up/down around its open, biased
    // by the asset's current % change, and prints new highs/lows over time.
    const pct = (sel.change || 0) / 100;
    const wob = Math.sin(clock) * 0.012 + Math.sin(clock * 2.3) * 0.006; // organic wiggle
    const open = c.open;
    const close = Math.max(0.001, c.open * (1 + pct * 0.35 + wob));
    const spread = Math.abs(close - open);
    const high = Math.max(c.high, close, open) + spread * (0.3 + Math.abs(Math.sin(clock * 1.7)) * 0.4);
    const low = Math.min(c.low, close, open) - spread * (0.3 + Math.abs(Math.cos(clock * 1.3)) * 0.4);
    return { open, close, high, low: Math.max(0.001, low), live: true };
  });
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const cLo = Math.min(...allPrices) * 0.995;
  const cHi = Math.max(...allPrices) * 1.005;
  const cRng = cHi - cLo > 0 ? cHi - cLo : 1;
  const candleW = CW / candles.length;
  // Leave 8% padding top & bottom so wicks never clip the edges
  const yOf = (p) => CH - ((p - cLo) / cRng) * CH * 0.84 - CH * 0.08;
  const cUp = candles.length > 1 && candles[candles.length - 1].close >= candles[0].open;
  const CC = cUp ? upColor : downColor;
  // Wave (line) path from candle closes
  const wavePts = candles.map((c, i) =>
    (i === 0 ? "M" : "L") + " " + ((i / (candles.length - 1)) * CW).toFixed(1) + " " + yOf(c.close).toFixed(1));
  const wavePath = wavePts.join(" ");
  const waveArea = wavePath + " L " + CW + " " + CH + " L 0 " + CH + " Z";

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
        @keyframes ticker { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
        .tick { display:inline-block; animation:ticker 300s linear infinite; white-space:nowrap; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
        @keyframes newsMarquee { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
        .news-scroll { display:inline-block; animation:newsMarquee 165s linear infinite; white-space:nowrap; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
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

      {!user && <Onboarding onStart={handleStart} onLogin={handleLogin} />}
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

      {/* Feedback modal */}
      {showFeedback && (
        <div style={{ position:"fixed", inset:0, background:"rgba(2,2,10,0.92)", zIndex:8600,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#0c0c1e", border:"1px solid #7c6fff44", borderRadius:14, padding:"22px 20px", maxWidth:360, width:"100%" }}>
            {!feedbackSent ? (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem", letterSpacing:"0.06em", color:"#fff" }}>💬 YOUR FEEDBACK</div>
                  <button className="btn" onClick={()=>setShowFeedback(false)} style={{ background:"transparent", color:"#888899", fontSize:"1rem" }}>✕</button>
                </div>
                <div style={{ color:"#888899", fontSize:"0.66rem", marginBottom:14 }}>Help make ODDEX better! How was it?</div>
                {/* Star rating */}
                <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:14 }}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} className="btn" onClick={()=>setFeedbackRating(star)}
                      style={{ background:"transparent", fontSize:"1.8rem", padding:2,
                        filter: star <= feedbackRating ? "none" : "grayscale(1) opacity(0.4)" }}>
                      ⭐
                    </button>
                  ))}
                </div>
                <textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value)}
                  placeholder="What did you like? What can be better? (optional)" rows={3} maxLength={300}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, resize:"none", marginBottom:12,
                    fontSize:"0.72rem", fontFamily:"'JetBrains Mono',monospace" }} />
                <button className="btn" onClick={submitFeedback}
                  style={{ width:"100%", minHeight:46, borderRadius:8, background:"linear-gradient(135deg,#7c6fff,#4433cc)", color:"#fff",
                    fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.9rem", letterSpacing:"0.12em" }}>
                  SEND FEEDBACK
                </button>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <div style={{ fontSize:"2.6rem", marginBottom:10 }}>🙏</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem", color:"#00ff88", letterSpacing:"0.06em" }}>THANK YOU!</div>
                <div style={{ color:"#888899", fontSize:"0.66rem", marginTop:6 }}>Your feedback was saved 💚</div>
              </div>
            )}
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

      {/* Install help — manual steps for any device without a native prompt */}
      {showIosHelp && (() => {
        const ua = navigator.userAgent;
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        const isAndroid = /Android/i.test(ua);
        return (
        <div onClick={()=>setShowIosHelp(false)}
          style={{ position:"fixed", inset:0, zIndex:6000, background:"rgba(0,0,0,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#12122a", border:"1px solid #7c6fff55", borderRadius:16, padding:"24px 20px",
              maxWidth:340, width:"100%", textAlign:"center" }}>
            <div style={{fontSize:"2.4rem",marginBottom:8}}>📲</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.3rem",letterSpacing:"0.06em",color:"#fff",marginBottom:12}}>
              ADD TO HOME SCREEN
            </div>
            <div style={{textAlign:"left",fontSize:"0.78rem",color:"#ccc",lineHeight:1.9}}>
              {isIOS ? (
                <>
                  <div>1️⃣ Tap the <b style={{color:"#7c6fff"}}>Share</b> button (box with ↑) at the bottom of Safari</div>
                  <div>2️⃣ Scroll down → tap <b style={{color:"#7c6fff"}}>"Add to Home Screen"</b> ➕</div>
                  <div>3️⃣ Tap <b style={{color:"#7c6fff"}}>"Add"</b> — done! 🎉</div>
                  <div style={{fontSize:"0.62rem",color:"#888899",marginTop:10}}>⚠️ On iPhone use <b>Safari</b> (not Chrome).</div>
                </>
              ) : isAndroid ? (
                <>
                  <div>1️⃣ Tap the <b style={{color:"#7c6fff"}}>⋮ menu</b> (top-right corner of Chrome)</div>
                  <div>2️⃣ Tap <b style={{color:"#7c6fff"}}>"Add to Home screen"</b> or <b style={{color:"#7c6fff"}}>"Install app"</b></div>
                  <div>3️⃣ Tap <b style={{color:"#7c6fff"}}>"Add" / "Install"</b> — done! 🎉</div>
                </>
              ) : (
                <>
                  <div>1️⃣ Look at the <b style={{color:"#7c6fff"}}>address bar</b> (top). Find the install icon (⊕ or a small screen icon) on the right side</div>
                  <div>2️⃣ Click it → then click <b style={{color:"#7c6fff"}}>"Install"</b></div>
                  <div style={{marginTop:6}}>Or: <b style={{color:"#7c6fff"}}>⋮ menu</b> → <b style={{color:"#7c6fff"}}>"Install ODDEX VIBE"</b></div>
                  <div>3️⃣ Done! The app opens from your desktop 🎉</div>
                </>
              )}
            </div>
            <button className="btn" onClick={()=>setShowIosHelp(false)}
              style={{width:"100%",minHeight:44,borderRadius:8,marginTop:16,background:"#7c6fff",color:"#fff",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.9rem",letterSpacing:"0.08em"}}>GOT IT</button>
          </div>
        </div>
        );
      })()}

      {/* Header */}
      <header style={{ padding:"clamp(6px,1.5vw,9px) clamp(12px,4vw,20px)", borderBottom:"1px solid #111122",
        background:"rgba(4,4,9,0.98)", display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0, zIndex:100, flexWrap:"wrap", gap:8 }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.3rem,5vw,1.7rem)", letterSpacing:"0.1em", lineHeight:1 }}>
            ODD<span style={{color:"#7c6fff"}}>EX</span>{" "}
            <span style={{color:"#00ff88",fontSize:"0.65em"}}>VIBE</span>
          </div>
          <span style={{ background:"#7c6fff22", border:"1px solid #7c6fff44", borderRadius:4, padding:"2px 6px",
            fontSize:"clamp(0.48rem,1.8vw,0.56rem)", color:"#7c6fff", letterSpacing:"0.1em" }}>● LIVE</span>
          {isOnline && (
            <span title="Connected to global leaderboard" style={{ background:"#00ff8822", border:"1px solid #00ff8844", borderRadius:4, padding:"2px 6px",
              fontSize:"clamp(0.44rem,1.6vw,0.5rem)", color:"#00ff88", letterSpacing:"0.08em" }}>🌐</span>
          )}
          {/* Settings + Install pinned to the top row (always visible on mobile) */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
            {canInstall && !isInstalled && (
              <button className="btn" onClick={handleAddToHome} title="Install app"
                style={{ background:"linear-gradient(135deg,#7c6fff,#4433cc)", border:"none", borderRadius:8,
                  height:32, padding:"0 10px", display:"flex", alignItems:"center", gap:4, flexShrink:0,
                  fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.68rem", letterSpacing:"0.06em", color:"#fff" }}>
                ⬇️ INSTALL
              </button>
            )}
            {user && (
              <button className="btn" onClick={()=>{ sfx("tap"); setShowChat(true); }} title="Community Chat"
                style={{ background:"#0d0d1e", border:"1px solid #7c6fff44", borderRadius:8, width:32, height:32,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>
                💬
              </button>
            )}
            <button className="btn" onClick={()=>{ sfx("tap"); setShowSettings(true); }} title="Settings"
              style={{ background:"#0d0d1e", border:"1px solid #2a2a40", borderRadius:8, width:32, height:32,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>
              ⚙️
            </button>
          </div>
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
          {user && (() => {
            const title = getTitle(achieved.length);
            return (
              <div title="Your trader ID & title"
                style={{ display:"flex",alignItems:"center",gap:6,
                background:"#0d0d1e", border:"1px solid " + planColor + "33", borderRadius:8, padding:"4px 9px" }}>
                <span style={{fontSize:"clamp(0.8rem,3vw,0.95rem)"}}>{planBadge || "👤"}</span>
                <div>
                  <div style={{fontSize:"clamp(0.58rem,2vw,0.66rem)",fontWeight:700,color:"#ddd"}}>{user.name}</div>
                  <div style={{fontSize:"clamp(0.5rem,1.6vw,0.56rem)",color:title.color,letterSpacing:"0.04em"}}>{title.emoji} {title.name}</div>
                </div>
              </div>
            );
          })()}
        </div>
      </header>

      {/* Ticker — mixes app messages with real news headlines */}
      <div style={{background:"#060612",borderBottom:"1px solid #111122",height:24,overflow:"hidden",display:"flex",alignItems:"center",flexShrink:0}}>
        <div className="tick" style={{fontSize:"clamp(0.64rem,2.2vw,0.72rem)",color:"#888899",letterSpacing:"0.04em"}}>
          {(() => {
            const newsHeadlines = newsEvents.map(e => `${e.headline}  (${e.symbol} ${e.impact>0?"▲":"▼"}${Math.abs(e.impact)}%)`);
            const mixed = newsHeadlines.length > 0 ? [...newsHeadlines, ...FEED_ITEMS] : FEED_ITEMS;
            return [...mixed, ...mixed].map((f,i)=><span key={i} style={{marginRight:64}}>{f}</span>);
          })()}
        </div>
      </div>

      {/* Live news event banner — shows the current market-moving headline */}
      {newsEvents.length > 0 && (
        <div style={{background:"linear-gradient(90deg,#ffd70018,#0a0a18 70%)",
          borderBottom:"2px solid #ffd70055",
          padding:"9px 0",display:"flex",alignItems:"center",gap:10,flexShrink:0,overflow:"hidden"}}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.9rem",letterSpacing:"0.08em",color:"#ffd700",
            flexShrink:0,textShadow:"0 0 8px #ffd70066",display:"flex",alignItems:"center",gap:4,paddingLeft:"clamp(10px,3vw,16px)"}}>
            📰 LIVE
          </span>
          <div style={{flex:1,overflow:"hidden"}}>
            <div className="news-scroll" style={{fontSize:"clamp(0.9rem,3.2vw,1.05rem)",fontWeight:700,letterSpacing:"0.02em"}}>
              {/* Duplicate the list so the marquee loops seamlessly */}
              {[...newsEvents, ...newsEvents].map((ev, i) => {
                const up = ev.impact > 0;
                return (
                  <span key={i} style={{marginRight:56,color:"#ffffff",display:"inline-flex",alignItems:"center",gap:8}}>
                    <span style={{color:"#f3f3ff"}}>{ev.headline}</span>
                    <span style={{
                      display:"inline-flex",alignItems:"center",gap:3,
                      background:up?"rgba(0,255,136,0.12)":"rgba(255,68,102,0.12)",
                      border:"1px solid "+(up?"#00ff8855":"#ff446655"),borderRadius:5,padding:"1px 7px",
                      color:up?"#00ff88":"#ff4466",fontFamily:"'JetBrains Mono',monospace",
                      fontWeight:700,fontSize:"0.86em",letterSpacing:"0.03em"}}>
                      {ev.symbol} {up?"▲":"▼"}{Math.abs(ev.impact)}%
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI Trading Host commentary — funny reaction to current news */}
      {aiComment && (
        <div style={{ background:"linear-gradient(90deg,#7c6fff18,transparent)", borderBottom:"1px solid #7c6fff33",
          padding:"6px clamp(10px,3vw,16px)", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <span style={{fontSize:"0.9rem",flexShrink:0}}>🎙️</span>
          <span style={{fontSize:"clamp(0.66rem,2.3vw,0.76rem)",color:"#c4bbff",fontStyle:"italic",lineHeight:1.3}}>
            {aiComment}
          </span>
        </div>
      )}

      {/* Install / Download app banner — clear call to action (dismissable) */}
      {canInstall && !isInstalled && !installBannerClosed && (
        <div style={{ background:"linear-gradient(90deg,#7c6fff22,#00ff8811)", borderBottom:"1px solid #7c6fff44",
          padding:"8px clamp(10px,3vw,16px)", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <span style={{fontSize:"1.1rem"}}>📲</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"clamp(0.66rem,2.2vw,0.74rem)",fontWeight:700,color:"#fff"}}>Install ODDEX VIBE on your device</div>
            <div style={{fontSize:"clamp(0.54rem,1.8vw,0.6rem)",color:"#aaaabb"}}>Play offline anytime — no app store needed</div>
          </div>
          <button className="btn" onClick={handleAddToHome}
            style={{ background:"linear-gradient(135deg,#7c6fff,#4433cc)", border:"none", borderRadius:8,
              minHeight:36, padding:"0 14px", flexShrink:0, fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"0.76rem", letterSpacing:"0.06em", color:"#fff" }}>
            ⬇️ INSTALL
          </button>
          <button className="btn" onClick={()=>setInstallBannerClosed(true)}
            style={{ background:"transparent", border:"none", color:"#888899", fontSize:"1rem", flexShrink:0, padding:"0 4px" }}>
            ✕
          </button>
        </div>
      )}

      {/* Weekly tournament notification banner */}
      {user && (
        <div onClick={()=>{ sfx("tap"); setTab("board"); setBoardView("weekly"); }}
          style={{ background:"linear-gradient(90deg,#ffaa0022,#ff774422)", borderBottom:"1px solid #ffaa0044",
            padding:"6px clamp(10px,3vw,16px)", display:"flex", alignItems:"center", gap:8, cursor:"pointer", flexShrink:0 }}>
          <span style={{fontSize:"0.9rem"}}>🏆</span>
          <span style={{fontSize:"clamp(0.6rem,2vw,0.66rem)",color:"#ffaa00",fontWeight:700,letterSpacing:"0.02em"}}>
            WEEKLY TOURNAMENT LIVE
          </span>
          <span style={{fontSize:"clamp(0.56rem,1.8vw,0.62rem)",color:"#ccaa77",flex:1}}>
            Ends in {timeUntilNextSaturday()} — tap to view rankings →
          </span>
        </div>
      )}

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
            <div style={{width:"100%",height:"clamp(300px,58vh,560px)"}}>
              <svg width="100%" height="100%" viewBox={"0 0 " + CW + " " + CH} preserveAspectRatio="none">
                {/* Faint horizontal grid lines — Binance/TradingView look */}
                {chartType === "candle" && [0.2,0.4,0.6,0.8].map((g,gi)=>(
                  <line key={"g"+gi} x1="0" y1={CH*g} x2={CW} y2={CH*g} stroke="#ffffff" strokeWidth="0.5" opacity="0.04" />
                ))}
                {/* Chart: candle OR wave */}
                {chartType === "candle" ? candles.map((c, i) => {
                  const x = i * candleW + candleW / 2;
                  const green = c.close >= c.open;
                  const col = green ? upColor : downColor;
                  const bodyTop = yOf(Math.max(c.open, c.close));
                  const bodyBot = yOf(Math.min(c.open, c.close));
                  const bodyH = Math.max(1.5, bodyBot - bodyTop);           // real body, never invisible
                  const bw = Math.max(3, candleW * 0.66);                    // thick readable bodies
                  const wickW = Math.max(1, candleW * 0.09);                 // thin wick like real candles
                  return (
                    <g key={i} style={c.live ? {filter:"drop-shadow(0 0 4px "+col+")"} : undefined}>
                      <rect x={x - wickW/2} y={yOf(c.high)} width={wickW} height={Math.max(0.5, yOf(c.low)-yOf(c.high))} fill={col} opacity={c.live?1:0.9} />
                      <rect x={x - bw/2} y={bodyTop} width={bw} height={bodyH} fill={col} rx="0.5" opacity={c.live?0.95:1} />
                      {c.live && <line x1={x} y1={yOf(c.close)} x2={CW} y2={yOf(c.close)} stroke={col} strokeWidth="0.7" strokeDasharray="4 3" opacity="0.55" />}
                    </g>
                  );
                }) : (
                  <>
                    <defs><linearGradient id="wgrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CC} stopOpacity="0.2"/><stop offset="100%" stopColor={CC} stopOpacity="0"/>
                    </linearGradient></defs>
                    <path d={waveArea} fill="url(#wgrd)" />
                    <path d={wavePath} fill="none" stroke={CC} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
              </svg>
            </div>
            {/* Timeframe selector — Binance-style (scrollable) */}
            <div style={{display:"flex",gap:5,marginTop:10,alignItems:"center",overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
              {["1s","1m","5m","15m","1h","4h","12h","1D","1W","1M","1Y"].map(tf=>(
                <button key={tf} className="btn" onClick={()=>setTimeframe(tf)}
                  style={{minHeight:30,padding:"0 clamp(7px,2vw,11px)",borderRadius:6,flexShrink:0,
                    fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(0.58rem,2vw,0.68rem)",fontWeight:700,
                    background:timeframe===tf?"rgba(124,111,255,0.18)":"rgba(255,255,255,0.03)",
                    color:timeframe===tf?"#9988ff":"#666677",
                    border:"1px solid "+(timeframe===tf?"#7c6fff44":"transparent"),letterSpacing:"0.03em"}}>
                  {tf}
                </button>
              ))}
              {/* Chart type toggle */}
              <div style={{display:"flex",gap:3,marginLeft:6,background:"rgba(255,255,255,0.03)",borderRadius:6,padding:2}}>
                <button className="btn" onClick={()=>setChartType("candle")} title="Candlestick"
                  style={{minHeight:28,padding:"0 8px",borderRadius:4,fontSize:"0.85rem",
                    background:chartType==="candle"?"rgba(0,255,136,0.18)":"transparent",
                    color:chartType==="candle"?"#00ff88":"#666677"}}>
                  📊
                </button>
                <button className="btn" onClick={()=>setChartType("wave")} title="Line/Wave"
                  style={{minHeight:28,padding:"0 8px",borderRadius:4,fontSize:"0.85rem",
                    background:chartType==="wave"?"rgba(0,255,136,0.18)":"transparent",
                    color:chartType==="wave"?"#00ff88":"#666677"}}>
                  〰️
                </button>
              </div>
            </div>
          </div>

          {/* Live "Recent Trades" stream — Binance-style activity feed */}
          <div style={{borderTop:"1px solid #111122",borderBottom:"1px solid #111122",background:"#060610",
            padding:"5px clamp(10px,3vw,16px)",flexShrink:0,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 6px #00ff88"}}/>
              <span style={{fontSize:"0.54rem",color:"#888899",letterSpacing:"0.1em",fontWeight:700}}>LIVE TRADES</span>
            </div>
            <div style={{display:"flex",gap:14,overflowX:"hidden",whiteSpace:"nowrap",fontSize:"0.62rem",fontFamily:"'JetBrains Mono',monospace"}}>
              {recentTrades.slice(0,8).map(t=>(
                <span key={t.id} style={{color:"#999",flexShrink:0}}>
                  <span style={{color:"#666677"}}>{t.who}</span>{" "}
                  <span style={{color:t.side==="buy"?"#00ff88":"#ff4466",fontWeight:700}}>{t.side==="buy"?"bought":"sold"}</span>{" "}
                  {t.qty} <span style={{color:"#bbb"}}>{t.symbol}</span> @ ${t.price}
                </span>
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
          <div style={{display:"flex",borderBottom:"1px solid #111122",flexShrink:0}}>
            {[{id:"trade",icon:"📊",label:"TRADE"},{id:"academy",icon:"🎓",label:"LEARN"},{id:"quiz",icon:"🧠",label:"QUIZ"},{id:"board",icon:"🏆",label:"RANKS"},{id:"awards",icon:"🏅",label:"AWARDS"}].map(t=>(
              <button key={t.id} className="tab-btn" onClick={()=>{ sfx("tap"); setTab(t.id); }}
                style={{minHeight:46,flex:1,minWidth:0,padding:"4px 2px",textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
                  fontSize:"clamp(0.5rem,1.7vw,0.62rem)",letterSpacing:"0.03em",whiteSpace:"nowrap",
                  color:tab===t.id?"#fff":"#888899",borderBottom:"2px solid "+(tab===t.id?"#7c6fff":"transparent"),transition:"all 0.15s"}}>
                <span style={{fontSize:"0.95rem"}}>{t.icon}</span>
                <span>{t.label}</span>
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
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:"0.65rem",color:"#888899",letterSpacing:"0.06em",marginBottom:6}}>QUANTITY</div>
                  {/* Input box with − / + steppers (Binance-style) */}
                  <div style={{display:"flex",alignItems:"stretch",border:"1px solid #1a1a2e",borderRadius:8,overflow:"hidden",marginBottom:8}}>
                    <button className="btn" onClick={()=>setOQty(q=>Math.max(1,q-1))}
                      style={{background:"#0e0e1e",color:"#888",minWidth:42,fontSize:"1.3rem",border:"none"}}>−</button>
                    <input type="number" min="1" value={oQty}
                      onChange={e=>{
                        const v = parseInt(e.target.value,10);
                        setOQty(isNaN(v) || v < 1 ? 1 : v);
                      }}
                      style={{flex:1,textAlign:"center",background:"transparent",border:"none",color:"#fff",
                        fontSize:"1rem",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",minWidth:0,outline:"none"}}/>
                    <button className="btn" onClick={()=>setOQty(q=>q+1)}
                      style={{background:"#0e0e1e",color:"#888",minWidth:42,fontSize:"1.3rem",border:"none"}}>+</button>
                  </div>
                  {/* Quick amount presets */}
                  <div style={{display:"flex",gap:5}}>
                    {[5,10,25,50].map(n=>(
                      <button key={n} className="btn" onClick={()=>setOQty(n)}
                        style={{flex:1,minHeight:30,borderRadius:6,fontSize:"0.66rem",fontWeight:700,
                          background:oQty===n?"rgba(124,111,255,0.2)":"rgba(255,255,255,0.03)",
                          border:"1px solid "+(oQty===n?"#7c6fff":"#1a1a2e"),color:oQty===n?"#bbaaff":"#888899"}}>
                        {n}
                      </button>
                    ))}
                    {oType==="sell" && heldQty>0 && (
                      <button className="btn" onClick={()=>setOQty(heldQty)}
                        style={{flex:1,minHeight:30,borderRadius:6,fontSize:"0.62rem",fontWeight:700,
                          background:"rgba(255,68,102,0.15)",border:"1px solid #ff446644",color:"#ff6688"}}>
                        MAX
                      </button>
                    )}
                  </div>
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

          {tab==="academy" && (
            <div style={{flex:1,overflow:"auto",padding:"14px clamp(10px,3vw,16px)",minHeight:0,WebkitOverflowScrolling:"touch"}}>

              {/* ── Lesson player view ── */}
              {academyLevelId && academyLessonId ? (() => {
                const level = ACADEMY.find(l => l.id === academyLevelId);
                const lesson = level.lessons.find(l => l.id === academyLessonId);
                const q = lesson.qs[academyQIdx];
                return (
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <span style={{fontSize:"0.6rem",letterSpacing:"0.1em",padding:"3px 8px",borderRadius:4,background:level.color+"22",color:level.color}}>
                        {level.emoji} {level.title}
                      </span>
                      <button className="btn" onClick={exitLesson} style={{background:"transparent",color:"#888899",fontSize:"0.62rem"}}>✕ exit</button>
                    </div>

                    {!academyLessonDone ? (
                      <>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.95rem",letterSpacing:"0.06em",color:"#fff",marginBottom:8}}>{lesson.title}</div>
                        {/* progress bar */}
                        <div style={{height:6,background:"#1a1a2e",borderRadius:3,marginBottom:14,overflow:"hidden"}}>
                          <div style={{height:"100%",width:((academyQIdx)/lesson.qs.length*100)+"%",background:level.color,borderRadius:3,transition:"width 0.3s"}}/>
                        </div>

                        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e1e38",borderRadius:10,padding:"14px",marginBottom:12}}>
                          <div style={{fontSize:"0.82rem",color:"#fff",lineHeight:1.5,fontWeight:700}}>{q.q}</div>
                        </div>

                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {q.o.map((opt,i)=>{
                            let bg="rgba(255,255,255,0.03)", border="#2a2a40", color="#ddd";
                            if (academyAnswered) {
                              if (i === q.a) { bg="rgba(0,255,136,0.15)"; border="#00ff88"; color="#00ff88"; }
                              else if (i === academyAnswered.picked) { bg="rgba(255,68,102,0.15)"; border="#ff4466"; color="#ff4466"; }
                            }
                            return (
                              <button key={i} className="btn" onClick={()=>answerAcademy(i,q.a)} disabled={!!academyAnswered}
                                style={{minHeight:46,borderRadius:8,padding:"8px 12px",textAlign:"left",background:bg,border:"1px solid "+border,color,
                                  fontFamily:"'JetBrains Mono',monospace",fontSize:"0.7rem",fontWeight:600,
                                  cursor:academyAnswered?"default":"pointer",display:"flex",alignItems:"center",gap:8}}>
                                <span style={{opacity:0.5}}>{String.fromCharCode(65+i)}.</span>
                                <span style={{flex:1}}>{opt}</span>
                                {academyAnswered && i===q.a && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>

                        {academyAnswered && (
                          <button className="btn" onClick={()=>nextAcademyQ(lesson)}
                            style={{width:"100%",minHeight:46,borderRadius:8,marginTop:14,background:"linear-gradient(135deg,"+level.color+",#333)",color:"#000",
                              fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.85rem",letterSpacing:"0.1em"}}>
                            {academyQIdx+1 < lesson.qs.length ? "NEXT →" : "FINISH LESSON 🎉"}
                          </button>
                        )}
                      </>
                    ) : (
                      <div style={{textAlign:"center",padding:"30px 10px"}}>
                        <div style={{fontSize:"3rem",marginBottom:10}}>🎉</div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.3rem",color:level.color,letterSpacing:"0.08em",marginBottom:6}}>LESSON COMPLETE!</div>
                        <div style={{color:"#aaaabb",fontSize:"0.72rem",marginBottom:4}}>{academyCorrectCount} / {lesson.qs.length} correct</div>
                        <div style={{color:"#00ff88",fontSize:"0.8rem",fontWeight:700,marginBottom:18}}>+20 XP · +$150 cash 💰</div>
                        <button className="btn" onClick={exitLesson}
                          style={{width:"100%",minHeight:48,borderRadius:8,background:"linear-gradient(135deg,#7c6fff,#4433cc)",color:"#fff",
                            fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.88rem",letterSpacing:"0.1em"}}>
                          BACK TO COURSE MAP
                        </button>
                      </div>
                    )}
                  </>
                );
              })() : (
                /* ── Course map view ── */
                <>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.14em",color:"#aaaabb"}}>🎓 TRADING ACADEMY</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:"0.7rem",color:"#ffaa00"}}>🔥{academyProgress.streak}</span>
                      <span style={{fontSize:"0.7rem",color:"#7c6fff"}}>⭐{academyProgress.xp}XP</span>
                    </div>
                  </div>
                  <div style={{color:"#888899",fontSize:"0.62rem",marginBottom:16}}>Learn trading & crypto, one bite-size lesson at a time. Each lesson = +$150 cash.</div>

                  {ACADEMY.map((level, levelIdx) => {
                    const unlocked = isLevelUnlocked(levelIdx);
                    const doneCount = level.lessons.filter(l=>academyProgress.completed.includes(l.id)).length;
                    return (
                      <div key={level.id} style={{marginBottom:18,opacity:unlocked?1:0.45}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <span style={{fontSize:"1.1rem"}}>{unlocked?level.emoji:"🔒"}</span>
                          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.85rem",letterSpacing:"0.08em",color:unlocked?level.color:"#666677"}}>{level.title}</span>
                          <span style={{fontSize:"0.58rem",color:"#777788",marginLeft:"auto"}}>{doneCount}/{level.lessons.length}</span>
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:7,paddingBottom:4}}>
                          {level.lessons.map((lesson, lessonIdx) => {
                            const lessonUnlocked = isLessonUnlocked(levelIdx, lessonIdx);
                            const lessonDone = academyProgress.completed.includes(lesson.id);
                            return (
                              <button key={lesson.id} className="btn" disabled={!lessonUnlocked}
                                onClick={()=>lessonUnlocked && startLesson(level.id, lesson.id)}
                                style={{width:"calc(20% - 6px)",minWidth:64,aspectRatio:"1",borderRadius:12,
                                  background:lessonDone?level.color+"22":lessonUnlocked?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.015)",
                                  border:"1.5px solid "+(lessonDone?level.color:lessonUnlocked?"#2a2a40":"#1a1a28"),
                                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
                                  cursor:lessonUnlocked?"pointer":"default",padding:"4px 3px",boxSizing:"border-box"}}>
                                <span style={{fontSize:"1.2rem"}}>{lessonDone?"✓":lessonUnlocked?"▶":"🔒"}</span>
                                <span style={{fontSize:"0.46rem",color:lessonUnlocked?"#aaaabb":"#555566",textAlign:"center",lineHeight:1.15}}>{lesson.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {tab==="quiz" && (
            <div style={{flex:1,overflow:"auto",padding:"14px clamp(10px,3vw,16px)",minHeight:0,WebkitOverflowScrolling:"touch"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.14em",color:"#aaaabb",marginBottom:4}}>🧠 QUIZ TEST</div>
              <div style={{color:"#888899",fontSize:"0.64rem",marginBottom:12}}>Test what you learned in Trading Academy! Answer right → earn cash. Wrong → lose some. Cash goes to your CASH balance (top of screen).</div>

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

                  {/* NEXT button — shows after answering, once reward is handled (or wrong answer) */}
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
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",letterSpacing:"0.14em",color:"#aaaabb"}}>🏆 LIVE RANKINGS</div>
                {realLeaderboard && realLeaderboard.length > 0 ? (
                  <span style={{fontSize:"0.5rem",background:"#00ff8822",color:"#00ff88",borderRadius:4,padding:"2px 6px",letterSpacing:"0.06em"}}>🌐 LIVE</span>
                ) : (
                  <span style={{fontSize:"0.5rem",background:"#88889922",color:"#888899",borderRadius:4,padding:"2px 6px",letterSpacing:"0.06em"}}>DEMO DATA</span>
                )}
                <button className="btn" onClick={()=>{
                    if (refreshingBoard) return;
                    setRefreshingBoard(true); sfx("tap");
                    fetchLeaderboard().then(lb=>{ if(lb) setRealLeaderboard(lb); setRefreshingBoard(false); });
                  }}
                  style={{marginLeft:"auto",background:"transparent",border:"1px solid #2a2a40",borderRadius:6,
                    width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",
                    color:"#888899",transform:refreshingBoard?"rotate(360deg)":"none",transition:"transform 0.5s"}}>
                  🔄
                </button>
              </div>

              {/* Flex / Share button — viral growth */}
              {user && (
                <button className="btn" onClick={()=>{ sfx("tap"); setShowShare(true); }}
                  style={{width:"100%",minHeight:42,borderRadius:10,marginBottom:10,marginTop:4,
                    background:"linear-gradient(135deg,#00ff8833,#7c6fff22)",border:"1px solid #00ff8844",
                    color:"#00ff88",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.85rem",letterSpacing:"0.08em",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  🔥 FLEX MY PORTFOLIO — CHALLENGE FRIENDS
                </button>
              )}

              {/* Invite friends button — referral rewards */}
              {user && (
                <button className="btn" onClick={()=>{ sfx("tap"); setShowInvite(true); }}
                  style={{width:"100%",minHeight:42,borderRadius:10,marginBottom:10,
                    background:"linear-gradient(135deg,#ffd70033,#ff7a0022)",border:"1px solid #ffd70044",
                    color:"#ffd700",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.85rem",letterSpacing:"0.08em",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  🎁 INVITE FRIENDS — EARN $$$ & PRO
                </button>
              )}

              {/* Community chat button */}
              {user && (
                <button className="btn" onClick={()=>{ sfx("tap"); setShowChat(true); }}
                  style={{width:"100%",minHeight:42,borderRadius:10,marginBottom:10,
                    background:"linear-gradient(135deg,#7c6fff33,#4433cc22)",border:"1px solid #7c6fff44",
                    color:"#9988ff",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.85rem",letterSpacing:"0.08em",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  💬 COMMUNITY CHAT — TALK TO TRADERS
                </button>
              )}

              {/* All-time / Weekly tournament toggle */}
              <div style={{display:"flex",gap:6,marginBottom:10,marginTop:8}}>
                <button className="btn" onClick={()=>{ sfx("tap"); setBoardView("alltime"); }}
                  style={{flex:1,minHeight:34,borderRadius:8,fontSize:"0.66rem",letterSpacing:"0.06em",fontWeight:700,
                    background:boardView==="alltime"?"#7c6fff":"rgba(255,255,255,0.04)",
                    color:boardView==="alltime"?"#fff":"#888899",border:"1px solid "+(boardView==="alltime"?"#7c6fff":"#2a2a40")}}>
                  🌐 ALL TIME
                </button>
                <button className="btn" onClick={()=>{ sfx("tap"); setBoardView("weekly"); }}
                  style={{flex:1,minHeight:34,borderRadius:8,fontSize:"0.66rem",letterSpacing:"0.06em",fontWeight:700,
                    background:boardView==="weekly"?"#ffaa00":"rgba(255,255,255,0.04)",
                    color:boardView==="weekly"?"#000":"#888899",border:"1px solid "+(boardView==="weekly"?"#ffaa00":"#2a2a40")}}>
                  🏆 THIS WEEK
                </button>
              </div>

              {boardView === "weekly" && (
                <div style={{background:"linear-gradient(135deg,#ffaa0018,transparent)",border:"1px solid #ffaa0044",
                  borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.06em",color:"#ffaa00",marginBottom:2}}>
                    🏆 WEEKLY TOURNAMENT
                  </div>
                  <div style={{fontSize:"0.6rem",color:"#aaaabb",lineHeight:1.5}}>
                    Highest net worth this week wins! Resets every Saturday.<br/>
                    ⏳ Ends in: <span style={{color:"#ffaa00",fontWeight:700}}>{timeUntilNextSaturday()}</span>
                  </div>
                </div>
              )}

              <div style={{color:"#888899",fontSize:"0.64rem",marginBottom:12}}>Ranked by net worth · Tap a trader to see their portfolio 👀</div>
              {board.map(p=>(
                <div key={(p.id||p.name)+p.rank} onClick={()=>{ if(!p.isMe){ sfx("tap"); setViewPlayer(p); } }}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",marginBottom:4,borderRadius:8,
                  cursor:p.isMe?"default":"pointer",
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
                    {p.isMe && (() => { const t = getTitle(p.titleCount||0); return (
                      <div style={{fontSize:"0.52rem",color:t.color,marginTop:1}}>{t.emoji} {t.name}</div>
                    ); })()}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    {boardView === "weekly" ? (
                      <>
                        <div style={{fontSize:"0.79rem",fontWeight:700,color:(p.weekProfit||0)>0?"#00ff88":"#888899"}}>
                          {(p.weekProfit||0)>0?"+":""}{fmt(p.weekProfit||0)}
                        </div>
                        <div style={{fontSize:"0.5rem",color:"#888899"}}>this week</div>
                      </>
                    ) : (
                      <>
                        <div style={{fontSize:"0.79rem",fontWeight:700,color:"#ccc"}}>{fmt(p.worth)}</div>
                        <div style={{fontSize:"0.53rem",color:p.pct>=0?"#00ff88":"#ff4466"}}>{p.pct>=0?"+":""}{p.pct.toFixed(1)}%</div>
                      </>
                    )}
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
                return (
                  <div key={p.id} style={{border:"1px solid "+(isCurr?p.accent:"#111122"),borderRadius:10,padding:"12px 13px",marginBottom:10,position:"relative",
                    background:isCurr?p.accent+"0e":"rgba(255,255,255,0.01)"}}>
                    {p.popular&&!isCurr&&<div style={{position:"absolute",top:-9,right:12,background:"#7c6fff",borderRadius:4,padding:"1px 7px",fontSize:"0.5rem",color:"#fff",letterSpacing:"0.1em"}}>POPULAR</div>}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.1em",color:p.accent}}>{p.name}</span>
                      <div><span style={{color:"#ddd",fontWeight:700}}>{p.price}</span><span style={{color:"#999",fontSize:"0.79rem"}}>{p.per}</span></div>
                    </div>
                    <div style={{marginBottom:10}}>
                      {p.features.map((f,i)=><div key={i} style={{display:"flex",gap:6,fontSize:"0.79rem",color:"#aaaabb",padding:"2px 0"}}><span style={{color:p.accent}}>✓</span>{f==="All odd assets"?`All ${assets.length} odd assets`:f}</div>)}
                    </div>
                    {isCurr?<div style={{textAlign:"center",fontSize:"0.69rem",color:p.accent,padding:"8px",background:p.accent+"0e",borderRadius:6}}>✓ Active Plan</div>
                      :<button className="btn" onClick={()=>handleUpgrade(p.id)} style={{width:"100%",minHeight:44,borderRadius:6,background:p.accent+"1a",color:p.accent,fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(0.75rem,2.8vw,0.82rem)",letterSpacing:"0.1em"}}>SWITCH TO {p.name} →</button>}
                  </div>
                );
              })}
            </div>
          )}

          {tab==="awards" && (
            <div style={{flex:1,overflow:"auto",padding:"12px clamp(10px,3vw,15px)",minHeight:0,WebkitOverflowScrolling:"touch"}}>
              {/* Title progress card */}
              {(() => {
                const t = getTitle(achieved.length);
                const nextTier = TITLES.find(tier => tier.min > achieved.length);
                return (
                  <div style={{background:"linear-gradient(135deg,"+t.color+"18,transparent)",border:"1px solid "+t.color+"44",
                    borderRadius:12,padding:"14px",marginBottom:14,textAlign:"center"}}>
                    <div style={{fontSize:"2rem",marginBottom:4}}>{t.emoji}</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:"0.08em",color:t.color}}>{t.name}</div>
                    <div style={{fontSize:"0.6rem",color:"#888899",marginTop:4}}>
                      {nextTier ? `${nextTier.min - achieved.length} more achievement${nextTier.min-achieved.length>1?"s":""} → ${nextTier.emoji} ${nextTier.name}` : "Max title reached! 👑"}
                    </div>
                  </div>
                );
              })()}
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
              <button className="btn" onClick={()=>setShowFeedback(true)}
                style={{width:"100%",minHeight:46,borderRadius:8,marginTop:14,
                  background:"linear-gradient(135deg,#7c6fff,#4433cc)",color:"#fff",
                  fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.85rem",letterSpacing:"0.1em"}}>
                💬 GIVE FEEDBACK
              </button>
              <div style={{marginTop:14,padding:"10px 12px",background:"rgba(255,68,102,0.06)",border:"1px solid #ff446633",borderRadius:8}}>
                <div style={{fontSize:"0.66rem",color:"#999",marginBottom:8,lineHeight:1.5}}>
                  Your trader ID <span style={{color:"#9988ff",fontWeight:700}}>{user?.name}</span> is permanent — it stays the same every time. Only reset if you really want a brand new account (this erases everything).
                </div>
                <button className="btn" onClick={()=>setConfirmReset(true)}
                  style={{width:"100%",minHeight:46,borderRadius:8,background:"transparent",border:"1px solid #ff446655",color:"#ff6677",
                    fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.8rem",letterSpacing:"0.1em"}}>
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

      {/* View another player's portfolio */}
      {viewPlayer && (() => {
        let pf = [];
        try { pf = viewPlayer.portfolio ? JSON.parse(viewPlayer.portfolio) : []; } catch { pf = []; }
        return (
          <div onClick={()=>setViewPlayer(null)}
            style={{ position:"fixed", inset:0, zIndex:5500, background:"rgba(0,0,0,0.8)",
              display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
            <div onClick={e=>e.stopPropagation()}
              style={{ background:"#0c0c1a", border:"1px solid #2a2a44", borderRadius:16, padding:20,
                width:"100%", maxWidth:340, maxHeight:"80vh", overflow:"auto" }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:"0.06em",color:"#fff"}}>
                  👤 {viewPlayer.name}
                </div>
                <button className="btn" onClick={()=>setViewPlayer(null)} style={{background:"transparent",color:"#888899",fontSize:"1.1rem"}}>✕</button>
              </div>
              <div style={{fontSize:"0.66rem",color:"#aaaabb",marginBottom:14}}>
                Net worth: <span style={{color:"#00ff88",fontWeight:700}}>{fmt(viewPlayer.worth)}</span>
                {viewPlayer.xp ? <span> · {viewPlayer.xp} XP</span> : null}
              </div>
              <div style={{fontSize:"0.6rem",color:"#888899",letterSpacing:"0.08em",marginBottom:8}}>PORTFOLIO ({pf.length} assets)</div>
              {pf.length === 0 ? (
                <div style={{textAlign:"center",padding:"24px 10px",color:"#666677",fontSize:"0.72rem"}}>
                  This trader holds only cash 💵<br/>(or hasn't traded yet)
                </div>
              ) : (
                pf.map((h, i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"10px 12px",marginBottom:6,borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid #1e1e38"}}>
                    <div>
                      <div style={{fontSize:"0.76rem",fontWeight:700,color:"#ddd"}}>{h.s}</div>
                      <div style={{fontSize:"0.58rem",color:"#888899"}}>{h.q} units</div>
                    </div>
                    <div style={{fontSize:"0.78rem",fontWeight:700,color:"#00ff88"}}>${(h.v||0).toLocaleString()}</div>
                  </div>
                ))
              )}
              <div style={{fontSize:"0.52rem",color:"#666677",textAlign:"center",marginTop:12}}>
                💡 Learn from top traders — see what they're holding!
              </div>
            </div>
          </div>
        );
      })()}

      {/* Skins / Theme shop */}
      {showShop && (
        <div onClick={()=>setShowShop(false)}
          style={{ position:"fixed", inset:0, zIndex:5500, background:"rgba(0,0,0,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#0c0c1a", border:"1px solid #2a2a44", borderRadius:16, padding:20,
              width:"100%", maxWidth:360, maxHeight:"82vh", overflow:"auto" }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.3rem",letterSpacing:"0.06em",color:"#fff"}}>🎨 THEME SHOP</div>
              <button className="btn" onClick={()=>setShowShop(false)} style={{background:"transparent",color:"#888899",fontSize:"1.1rem"}}>✕</button>
            </div>
            <div style={{fontSize:"0.64rem",color:"#888899",marginBottom:14}}>Spend in-game cash to unlock themes. Balance: <span style={{color:"#00ff88",fontWeight:700}}>{fmtExact(balance)}</span></div>
            {SKINS.map(skin => {
              const owned = ownedSkins.includes(skin.id);
              const active = activeSkin === skin.id;
              return (
                <div key={skin.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px",marginBottom:8,borderRadius:12,
                  background: active ? skin.accent+"18" : "rgba(255,255,255,0.03)",
                  border:"1px solid "+(active ? skin.accent : "#1e1e38")}}>
                  <div style={{width:44,height:44,borderRadius:10,background:skin.accent+"22",border:"1px solid "+skin.accent+"55",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",flexShrink:0}}>{skin.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.82rem",fontWeight:700,color:"#fff"}}>{skin.name}</div>
                    <div style={{fontSize:"0.62rem",color:skin.accent}}>{skin.price === 0 ? "Free" : "$" + skin.price.toLocaleString()}</div>
                  </div>
                  <button className="btn" onClick={()=>buySkin(skin)}
                    style={{minHeight:36,padding:"0 14px",borderRadius:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.74rem",letterSpacing:"0.04em",
                      background: active ? "transparent" : owned ? skin.accent+"22" : "linear-gradient(135deg,"+skin.accent+","+skin.accent+"99)",
                      color: active ? skin.accent : owned ? skin.accent : "#000", fontWeight:700,
                      border: active ? "1px solid "+skin.accent : "none"}}>
                    {active ? "ACTIVE ✓" : owned ? "USE" : "BUY"}
                  </button>
                </div>
              );
            })}
            {/* ── Candle & price color customization ── */}
            <div style={{marginTop:18,paddingTop:16,borderTop:"1px solid #1e1e38"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.95rem",letterSpacing:"0.06em",color:"#fff",marginBottom:4}}>📈 CANDLE COLORS</div>
              <div style={{fontSize:"0.6rem",color:"#888899",marginBottom:12}}>Pick your own up & down colors (free!)</div>

              {/* Up color */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:36,height:36,borderRadius:8,background:upColor,flexShrink:0,border:"1px solid #ffffff22"}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.7rem",color:"#ccc",fontWeight:700}}>Up / Buy color</div>
                  <div style={{display:"flex",gap:5,marginTop:4}}>
                    {["#00ff88","#00e5ff","#ffd700","#7cff00","#ff9500"].map(c=>(
                      <button key={c} onClick={()=>setUpColor(c)} className="btn"
                        style={{width:24,height:24,borderRadius:6,background:c,border:upColor===c?"2px solid #fff":"1px solid #ffffff22"}}/>
                    ))}
                    <input type="color" value={upColor} onChange={e=>setUpColor(e.target.value)}
                      style={{width:24,height:24,borderRadius:6,border:"none",background:"transparent",cursor:"pointer",padding:0}}/>
                  </div>
                </div>
              </div>

              {/* Down color */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:36,height:36,borderRadius:8,background:downColor,flexShrink:0,border:"1px solid #ffffff22"}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.7rem",color:"#ccc",fontWeight:700}}>Down / Sell color</div>
                  <div style={{display:"flex",gap:5,marginTop:4}}>
                    {["#ff4466","#ff2d95","#ff5e00","#b388ff","#ff0055"].map(c=>(
                      <button key={c} onClick={()=>setDownColor(c)} className="btn"
                        style={{width:24,height:24,borderRadius:6,background:c,border:downColor===c?"2px solid #fff":"1px solid #ffffff22"}}/>
                    ))}
                    <input type="color" value={downColor} onChange={e=>setDownColor(e.target.value)}
                      style={{width:24,height:24,borderRadius:6,border:"none",background:"transparent",cursor:"pointer",padding:0}}/>
                  </div>
                </div>
              </div>

              <button className="btn" onClick={()=>{ setUpColor("#00ff88"); setDownColor("#ff4466"); }}
                style={{width:"100%",minHeight:34,borderRadius:8,background:"transparent",border:"1px solid #2a2a44",color:"#888899",
                  fontSize:"0.66rem",letterSpacing:"0.04em"}}>
                ↺ Reset to default (green/red)
              </button>
            </div>

            <div style={{fontSize:"0.54rem",color:"#666677",textAlign:"center",marginTop:12}}>Your colors apply to charts instantly! 🎨</div>
          </div>
        </div>
      )}

      {/* Bankruptcy / "Went Broke" overlay */}
      {showBroke && (
        <div style={{ position:"fixed", inset:0, zIndex:6000, background:"rgba(10,0,0,0.92)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"linear-gradient(160deg,#2a1010,#0a0a0a)", border:"1px solid #ff446655", borderRadius:18,
            padding:"28px 22px", width:"100%", maxWidth:360, textAlign:"center", boxShadow:"0 0 50px rgba(255,68,102,0.3)" }}>
            <div style={{fontSize:"3.4rem",marginBottom:6}}>💸</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.8rem",letterSpacing:"0.04em",color:"#ff4466",marginBottom:4}}>YOU WENT BROKE!</div>
            <div style={{fontSize:"0.72rem",color:"#ccaaaa",marginBottom:18,lineHeight:1.5}}>
              Your portfolio got wiped out 📉<br/>Get a fresh $10,000 to try again!
            </div>

            {canRecover ? (
              <button className="btn" onClick={recoverFromBroke}
                style={{width:"100%",minHeight:52,borderRadius:10,background:"linear-gradient(135deg,#00ff88,#009955)",color:"#000",
                  fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.05rem",letterSpacing:"0.1em",fontWeight:700}}>
                🎉 CLAIM FRESH $10,000
              </button>
            ) : (
              <>
                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #2a2a40",borderRadius:12,padding:"16px",marginBottom:12}}>
                  <div style={{fontSize:"0.6rem",color:"#888899",letterSpacing:"0.1em",marginBottom:6}}>WAIT FOR RESET</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2rem",color:"#ffaa00"}}>
                    {Math.floor(brokeTimeLeft/60000)}:{String(Math.floor((brokeTimeLeft%60000)/1000)).padStart(2,"0")}
                  </div>
                  <div style={{fontSize:"0.54rem",color:"#777788",marginTop:2}}>minutes until free reset</div>
                </div>
                <div style={{fontSize:"0.66rem",color:"#aaaabb",marginBottom:10}}>OR unlock instantly:</div>
                <div style={{background:"rgba(124,111,255,0.1)",border:"1px solid #7c6fff44",borderRadius:12,padding:"14px",marginBottom:12}}>
                  <div style={{fontSize:"0.72rem",color:"#fff",marginBottom:8}}>🧠 Complete 3 Quizzes ({brokeQuizzes}/3)</div>
                  <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:10}}>
                    {[1,2,3].map(n=>(
                      <div key={n} style={{width:36,height:8,borderRadius:4,background:brokeQuizzes>=n?"#00ff88":"#2a2a40"}}/>
                    ))}
                  </div>
                  <button className="btn" onClick={()=>{ setShowBroke(false); setTab("quiz"); }}
                    style={{width:"100%",minHeight:42,borderRadius:8,background:"linear-gradient(135deg,#7c6fff,#4433cc)",color:"#fff",
                      fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.06em"}}>
                    GO TO QUIZ →
                  </button>
                </div>
                <div style={{fontSize:"0.54rem",color:"#666677"}}>The timer keeps running — come back anytime!</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Daily trade streak popup */}
      {showStreakPop && (
        <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", zIndex:6500,
          background:"linear-gradient(135deg,#ff9500,#ff5e00)", borderRadius:14, padding:"12px 20px",
          boxShadow:"0 6px 24px rgba(255,120,0,0.4)", display:"flex", alignItems:"center", gap:10, maxWidth:"90%" }}>
          <span style={{fontSize:"1.6rem"}}>🔥</span>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",color:"#fff",letterSpacing:"0.04em"}}>
              {tradeStreak}-DAY TRADING STREAK!
            </div>
            <div style={{fontSize:"0.62rem",color:"#fff8ee"}}>Keep trading daily for bigger bonuses 💰</div>
          </div>
        </div>
      )}

      {/* Community Chat — full-screen page (like WhatsApp/Discord) */}
      {showChat && (
        <div style={{ position:"fixed", inset:0, zIndex:6000, background:"rgba(0,0,0,0.7)",
            display:"flex", justifyContent:"center" }}>
          <div style={{ width:"100%", maxWidth:600, height:"100%", maxHeight:"100vh", background:"#0a0a16",
            display:"flex", flexDirection:"column", boxShadow:"0 0 40px rgba(0,0,0,0.5)", overflow:"hidden" }}>
            {/* Header */}
            <div style={{padding:"14px 16px",borderBottom:"1px solid #1a1a30",display:"flex",alignItems:"center",gap:12,
              background:"linear-gradient(180deg,#12122a,#0a0a16)",flexShrink:0}}>
              <button className="btn" onClick={()=>setShowChat(false)}
                style={{background:"transparent",color:"#9988ff",fontSize:"1.4rem",padding:"0 4px",lineHeight:1}}>‹</button>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.15rem",letterSpacing:"0.05em",color:"#fff",display:"flex",alignItems:"center",gap:6}}>
                  💬 COMMUNITY CHAT
                  <span style={{width:7,height:7,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 6px #00ff88"}}/>
                </div>
                <div style={{fontSize:"0.54rem",color:"#888899"}}>Be respectful • No abuse/spam • Breaking rules = mute/ban</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflow:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:9,WebkitOverflowScrolling:"touch"}}>
              {chatMessages.length === 0 ? (
                <div style={{textAlign:"center",color:"#666677",fontSize:"0.76rem",marginTop:40}}>
                  <div style={{fontSize:"2.5rem",marginBottom:8}}>👋</div>
                  No messages yet — be the first to say hi!
                </div>
              ) : chatMessages.map(m => {
                const mine = m.player_name===user?.name;
                return (
                <div key={m.id} style={{maxWidth:"82%",alignSelf: mine?"flex-end":"flex-start"}}>
                  {!mine && <div style={{fontSize:"0.58rem",color:"#7c6fff",marginBottom:2,paddingLeft:4,fontWeight:700}}>{m.player_name}</div>}
                  <div style={{background: mine?"linear-gradient(135deg,#7c6fff,#5a4fd0)":"#16162a",
                    borderRadius: mine?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"8px 12px",
                    fontSize:"0.82rem",color:mine?"#fff":"#e0e0f0",wordBreak:"break-word",lineHeight:1.35}}>{m.message}</div>
                </div>
                );
              })}
            </div>

            {/* Notice (warning/mute info) */}
            {chatNotice && (
              <div style={{padding:"10px 16px",background:"#ff446618",borderTop:"1px solid #ff446633",fontSize:"0.68rem",color:"#ffaaaa",flexShrink:0,lineHeight:1.4}}>
                {chatNotice}
              </div>
            )}

            {/* Input */}
            <div style={{padding:"10px 12px",borderTop:"1px solid #1a1a30",display:"flex",gap:8,flexShrink:0,
              background:"#0c0c1a",paddingBottom:"max(10px, env(safe-area-inset-bottom))"}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") sendChat(); }}
                placeholder={isChatMuted() ? "🔇 Muted ("+muteTimeLeft()+")" : "Type a message..."}
                disabled={isChatMuted()}
                maxLength={200}
                style={{flex:1,minHeight:44,borderRadius:22,border:"1px solid #2a2a44",background:"#12122a",
                  color:"#fff",padding:"0 16px",fontSize:"0.85rem",outline:"none"}}/>
              <button className="btn" onClick={sendChat} disabled={isChatMuted()}
                style={{minWidth:52,minHeight:44,borderRadius:22,
                  background:isChatMuted()?"#1a1a2e":"linear-gradient(135deg,#7c6fff,#4433cc)",
                  color:isChatMuted()?"#666677":"#fff",fontSize:"1.1rem"}}>➤</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite friends / Referral modal */}
      {showInvite && (
        <div onClick={()=>setShowInvite(false)}
          style={{ position:"fixed", inset:0, zIndex:5500, background:"rgba(0,0,0,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"linear-gradient(160deg,#1a1630,#0a0a1e)", border:"1px solid #ffd70055", borderRadius:18,
              padding:"22px 20px", width:"100%", maxWidth:370, maxHeight:"85vh", overflow:"auto",
              boxShadow:"0 0 40px rgba(255,215,0,0.2)" }}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:"2.2rem",marginBottom:2}}>🎁</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:"0.05em",color:"#fff"}}>INVITE FRIENDS</div>
              <div style={{fontSize:"0.68rem",color:"#ffd700"}}>You both get $5,000 — plus milestone rewards!</div>
            </div>

            {/* My referral link */}
            <div style={{background:"#0a0a18",border:"1px solid #ffd70033",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:"0.56rem",color:"#888899",marginBottom:4}}>YOUR INVITE LINK</div>
              <div style={{fontSize:"0.66rem",color:"#ffd700",wordBreak:"break-all",fontFamily:"'JetBrains Mono',monospace"}}>{myReferralLink()}</div>
            </div>
            <button className="btn" onClick={copyInvite}
              style={{width:"100%",minHeight:48,borderRadius:10,marginBottom:6,
                background: inviteCopied ? "#009955" : "linear-gradient(135deg,#ffd700,#ff9500)",
                color:"#000",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.95rem",letterSpacing:"0.08em",fontWeight:700}}>
              {inviteCopied ? "✓ COPIED! NOW SHARE IT" : "📋 COPY LINK (+$1,000/day)"}
            </button>
            <div style={{fontSize:"0.56rem",color:"#888899",textAlign:"center",marginBottom:14}}>
              Share on Discord, Reddit, WhatsApp & X — earn $1,000 every day you share!
            </div>

            {/* Referral milestones */}
            <div style={{fontSize:"0.6rem",color:"#888899",letterSpacing:"0.08em",marginBottom:8}}>MILESTONE REWARDS — {referrals} joined</div>
            {REF_TIERS.map(tier => {
              const reached = referrals >= tier.need;
              const claimed = claimedRefTiers.includes(tier.need);
              return (
                <div key={tier.need} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",marginBottom:6,borderRadius:9,
                  background: claimed ? "rgba(0,255,136,0.06)" : reached ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.02)",
                  border:"1px solid "+(claimed?"#00ff8833":reached?"#ffd70055":"#1e1e38")}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.72rem",color:"#fff",fontWeight:700}}>{tier.need} friend{tier.need>1?"s":""}</div>
                    <div style={{fontSize:"0.6rem",color:"#ffd700"}}>+${tier.reward.toLocaleString()}</div>
                  </div>
                  <button className="btn" disabled={!reached||claimed} onClick={()=>claimRefTier(tier)}
                    style={{minHeight:32,padding:"0 12px",borderRadius:7,fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.68rem",letterSpacing:"0.04em",
                      background: claimed ? "transparent" : reached ? "linear-gradient(135deg,#ffd700,#ff9500)" : "#1a1a2e",
                      color: claimed ? "#00ff88" : reached ? "#000" : "#666677",fontWeight:700,
                      border: claimed ? "1px solid #00ff8844" : "none"}}>
                    {claimed ? "CLAIMED ✓" : reached ? "CLAIM" : "LOCKED"}
                  </button>
                </div>
              );
            })}

            {/* Community join bonuses */}
            <div style={{fontSize:"0.6rem",color:"#888899",letterSpacing:"0.08em",margin:"12px 0 8px"}}>JOIN THE COMMUNITY (+$2,500 each)</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <button className="btn" onClick={()=>joinCommunity("discord")}
                style={{flex:1,minHeight:44,borderRadius:9,background:joinedDiscord?"#5865F222":"linear-gradient(135deg,#5865F2,#4048c0)",
                  color:joinedDiscord?"#8891f5":"#fff",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.74rem",letterSpacing:"0.04em",
                  border:joinedDiscord?"1px solid #5865F244":"none"}}>
                {joinedDiscord?"✓ DISCORD":"💬 DISCORD"}
              </button>
              <button className="btn" onClick={()=>joinCommunity("reddit")}
                style={{flex:1,minHeight:44,borderRadius:9,background:joinedReddit?"#ff450022":"linear-gradient(135deg,#ff4500,#cc3700)",
                  color:joinedReddit?"#ff7744":"#fff",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.74rem",letterSpacing:"0.04em",
                  border:joinedReddit?"1px solid #ff450044":"none"}}>
                {joinedReddit?"✓ REDDIT":"🤖 REDDIT"}
              </button>
            </div>

            <button className="btn" onClick={()=>setShowInvite(false)}
              style={{width:"100%",minHeight:38,borderRadius:8,background:"transparent",color:"#888899",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.76rem",letterSpacing:"0.08em"}}>CLOSE</button>
          </div>
        </div>
      )}

      {/* Flex / Share portfolio modal */}
      {showShare && (
        <div onClick={()=>setShowShare(false)}
          style={{ position:"fixed", inset:0, zIndex:5500, background:"rgba(0,0,0,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"linear-gradient(160deg,#161636,#0a0a1e)", border:"1px solid #00ff8855", borderRadius:18,
              padding:"24px 20px", width:"100%", maxWidth:360, boxShadow:"0 0 40px rgba(0,255,136,0.2)" }}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:"2.4rem",marginBottom:4}}>🔥</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:"0.06em",color:"#fff"}}>FLEX YOUR PORTFOLIO</div>
              <div style={{fontSize:"0.66rem",color:"#aaaabb"}}>Share your stats — challenge your friends!</div>
            </div>

            {/* Preview card */}
            <div style={{background:"#0a0a18",border:"1px solid #1e2e24",borderRadius:12,padding:"16px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.9rem",letterSpacing:"0.06em",color:"#00ff88"}}>ODDEX VIBE</span>
                <span style={{fontSize:"0.56rem",color:"#666677"}}>oddexvibe.com</span>
              </div>
              <div style={{fontSize:"0.6rem",color:"#888899",marginBottom:2}}>NET WORTH</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.8rem",color:"#fff",marginBottom:8}}>{fmt(netWorth)}</div>
              {(() => {
                const myRank = board.find(p => p.isMe)?.rank;
                return myRank ? (
                  <div style={{display:"inline-block",background:"#7c6fff22",border:"1px solid #7c6fff44",borderRadius:6,padding:"3px 10px",fontSize:"0.66rem",color:"#9988ff",fontWeight:700}}>
                    🏆 Rank #{myRank}
                  </div>
                ) : null;
              })()}
            </div>

            <button className="btn" onClick={copyShare}
              style={{width:"100%",minHeight:50,borderRadius:10,background: shareCopied ? "#009955" : "linear-gradient(135deg,#00ff88,#009955)",
                color:"#000",fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.1em",fontWeight:700,marginBottom:8}}>
              {shareCopied ? "✓ COPIED! NOW PASTE IT" : "📋 COPY & SHARE"}
            </button>
            <div style={{fontSize:"0.58rem",color:"#888899",textAlign:"center",lineHeight:1.5,marginBottom:10}}>
              Paste it on WhatsApp, Reddit, X (Twitter), or Discord!
            </div>
            <button className="btn" onClick={()=>setShowShare(false)}
              style={{width:"100%",minHeight:40,borderRadius:8,background:"transparent",color:"#888899",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",letterSpacing:"0.08em"}}>CLOSE</button>
          </div>
        </div>
      )}

      {/* Spin wheel popup */}
      {showSpin && (
        <div style={{ position:"fixed", inset:0, zIndex:5500, background:"rgba(0,0,0,0.85)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"linear-gradient(160deg,#1a1238,#0a0a1e)", border:"1px solid #ffaa0055", borderRadius:18,
            padding:"24px 20px", width:"100%", maxWidth:340, textAlign:"center", boxShadow:"0 0 40px rgba(255,170,0,0.25)" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", letterSpacing:"0.08em", color:"#ffaa00", marginBottom:4 }}>🎡 SPIN THE WHEEL</div>
            <div style={{ fontSize:"0.66rem", color:"#aaaabb", marginBottom:16 }}>One free spin per day — win up to $2000!</div>

            {/* Wheel */}
            <div style={{ position:"relative", width:240, height:240, margin:"0 auto 18px" }}>
              {/* Pointer */}
              <div style={{ position:"absolute", top:-6, left:"50%", transform:"translateX(-50%)", zIndex:3,
                width:0, height:0, borderLeft:"12px solid transparent", borderRight:"12px solid transparent",
                borderTop:"20px solid #fff", filter:"drop-shadow(0 2px 3px rgba(0,0,0,0.5))" }}/>
              <svg viewBox="0 0 200 200" style={{ width:"100%", height:"100%",
                transform:`rotate(${spinAngle}deg)`, transition: spinning ? "transform 3.1s cubic-bezier(0.17,0.67,0.2,1)" : "none" }}>
                {SPIN_PRIZES.map((prize, i) => {
                  const seg = 360 / SPIN_PRIZES.length;
                  const start = (i * seg - 90) * Math.PI / 180;
                  const end = ((i + 1) * seg - 90) * Math.PI / 180;
                  const x1 = 100 + 100 * Math.cos(start), y1 = 100 + 100 * Math.sin(start);
                  const x2 = 100 + 100 * Math.cos(end),   y2 = 100 + 100 * Math.sin(end);
                  const colors = ["#7c6fff","#00ff88","#ff6b9d","#ffaa00","#4fc3f7","#ff7744","#a78bfa","#ffd700"];
                  const midAng = ((i + 0.5) * seg - 90) * Math.PI / 180;
                  const tx = 100 + 62 * Math.cos(midAng), ty = 100 + 62 * Math.sin(midAng);
                  return (
                    <g key={i}>
                      <path d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`} fill={colors[i]} stroke="#0a0a1e" strokeWidth="1.5"/>
                      <text x={tx} y={ty} fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle"
                        transform={`rotate(${(i + 0.5) * seg}, ${tx}, ${ty})`}>${prize}</text>
                    </g>
                  );
                })}
                <circle cx="100" cy="100" r="14" fill="#0a0a1e" stroke="#ffaa00" strokeWidth="3"/>
              </svg>
            </div>

            {spinResult !== null ? (
              <>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", color:"#00ff88", marginBottom:12 }}>YOU WON ${spinResult}! 🎉</div>
                <button className="btn" onClick={()=>{ setShowSpin(false); setSpinResult(null); setSpinAngle(0); }}
                  style={{ width:"100%", minHeight:48, borderRadius:10, background:"linear-gradient(135deg,#7c6fff,#4433cc)", color:"#fff",
                    fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.95rem", letterSpacing:"0.1em" }}>AWESOME!</button>
              </>
            ) : (
              <button className="btn" onClick={doSpin} disabled={spinning}
                style={{ width:"100%", minHeight:50, borderRadius:10, opacity: spinning ? 0.6 : 1,
                  background:"linear-gradient(135deg,#ffaa00,#ff7744)", color:"#000",
                  fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"0.12em", fontWeight:700 }}>
                {spinning ? "SPINNING..." : "SPIN NOW 🎡"}
              </button>
            )}
            {!spinning && spinResult === null && (
              <button className="btn" onClick={()=>setShowSpin(false)}
                style={{ width:"100%", minHeight:40, borderRadius:8, marginTop:8, background:"transparent", color:"#888",
                  fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.78rem", letterSpacing:"0.1em" }}>CLOSE</button>
            )}
          </div>
        </div>
      )}

      {/* Daily reward popup */}
      {showDailyReward && (
        <div style={{ position:"fixed", inset:0, zIndex:5500, background:"rgba(0,0,0,0.8)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"linear-gradient(160deg,#161636,#0a0a1e)", border:"1px solid #7c6fff55", borderRadius:18,
            padding:"28px 22px", width:"100%", maxWidth:330, textAlign:"center", boxShadow:"0 0 40px rgba(124,111,255,0.3)" }}>
            <div style={{ fontSize:"3.2rem", marginBottom:8 }}>🎁</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", letterSpacing:"0.08em", color:"#fff", marginBottom:4 }}>DAILY REWARD!</div>
            <div style={{ fontSize:"0.7rem", color:"#aaaabb", marginBottom:16 }}>
              {dailyReward.streak >= 1 && dailyReward.lastClaim ? "Welcome back! " : "Welcome! "}
              You're on a <span style={{color:"#ffaa00",fontWeight:700}}>🔥 {(dailyReward.lastClaim === new Date(Date.now()-86400000).toISOString().slice(0,10) ? dailyReward.streak + 1 : 1)} day</span> streak!
            </div>
            <div style={{ background:"rgba(0,255,136,0.08)", border:"1px solid #00ff8833", borderRadius:12, padding:"16px", marginBottom:14 }}>
              <div style={{ fontSize:"0.6rem", color:"#888899", letterSpacing:"0.1em", marginBottom:4 }}>TODAY'S BONUS</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem", color:"#00ff88" }}>+${dailyAmount}</div>
            </div>

            {/* 7-day streak tracker */}
            {(() => {
              const curStreak = (dailyReward.lastClaim === new Date(Date.now()-86400000).toISOString().slice(0,10) ? dailyReward.streak + 1 : 1);
              const dayNum = ((curStreak - 1) % 7) + 1; // which day of the 7-day cycle
              return (
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:"0.56rem",color:"#888899",letterSpacing:"0.08em",marginBottom:6}}>7-DAY STREAK — Day 7 = 🎁 $2000 MEGA BONUS</div>
                  <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                    {[1,2,3,4,5,6,7].map(d => {
                      const done = d < dayNum;
                      const today = d === dayNum;
                      const isMega = d === 7;
                      return (
                        <div key={d} style={{flex:1,aspectRatio:"1",borderRadius:6,display:"flex",flexDirection:"column",
                          alignItems:"center",justifyContent:"center",
                          background: today ? "#00ff8833" : done ? "#00ff8815" : "rgba(255,255,255,0.03)",
                          border:"1px solid "+(today?"#00ff88":done?"#00ff8844":"#2a2a40")}}>
                          <span style={{fontSize:"0.7rem"}}>{done?"✓":isMega?"🎁":d}</span>
                          <span style={{fontSize:"0.4rem",color:"#888899"}}>{isMega?"MEGA":"D"+d}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <button className="btn" onClick={claimDailyReward}
              style={{ width:"100%", minHeight:50, borderRadius:10, background:"linear-gradient(135deg,#00ff88,#009955)", color:"#000",
                fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"0.12em", fontWeight:700 }}>
              CLAIM 🎉
            </button>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div onClick={()=>setShowSettings(false)}
          style={{ position:"fixed", inset:0, zIndex:5000, background:"rgba(0,0,0,0.7)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#0c0c1a", border:"1px solid #2a2a44", borderRadius:16, padding:20,
              width:"100%", maxWidth:340, maxHeight:"85vh", overflow:"auto" }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:"0.1em",color:"#fff"}}>⚙️ SETTINGS</div>
              <button className="btn" onClick={()=>setShowSettings(false)} style={{background:"transparent",color:"#888899",fontSize:"1.1rem"}}>✕</button>
            </div>

            {/* Sound toggle */}
            <div style={{padding:"12px 0",borderBottom:"1px solid #1a1a2e"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:"0.78rem",color:"#ddd",fontWeight:700}}>🔊 Sound Effects</div>
                  <div style={{fontSize:"0.6rem",color:"#888899"}}>Clicks, trades, wins</div>
                </div>
                <button className="btn" onClick={()=>{ setSettings(s=>({...s,sound:!s.sound})); playSound("tap"); }}
                  style={{ width:48, height:28, borderRadius:14, position:"relative", transition:"all 0.2s",
                    background: settings.sound ? "#00ff88" : "#2a2a40" }}>
                  <span style={{ position:"absolute", top:3, left: settings.sound ? 23 : 3, width:22, height:22,
                    borderRadius:"50%", background:"#fff", transition:"all 0.2s" }}/>
                </button>
              </div>
              {settings.sound && (
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                  <span style={{fontSize:"0.7rem"}}>🔉</span>
                  <input type="range" min="0" max="100" step="5" value={settings.sfxVolume ?? 100}
                    onChange={e=>setSettings(s=>({...s,sfxVolume:parseInt(e.target.value,10)}))}
                    onMouseUp={()=>playSound("tap")} onTouchEnd={()=>playSound("tap")}
                    style={{flex:1,accentColor:"#00ff88",cursor:"pointer"}}/>
                  <span style={{fontSize:"0.62rem",color:"#888899",minWidth:28,textAlign:"right"}}>{settings.sfxVolume ?? 100}%</span>
                </div>
              )}
            </div>

            {/* Background music toggle */}
            <div style={{padding:"12px 0",borderBottom:"1px solid #1a1a2e"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:"0.78rem",color:"#ddd",fontWeight:700}}>🎵 Background Music</div>
                  <div style={{fontSize:"0.6rem",color:"#888899"}}>Chill lo-fi trading vibe</div>
                </div>
                <button className="btn" onClick={()=>setSettings(s=>({...s,music:!s.music}))}
                  style={{ width:48, height:28, borderRadius:14, position:"relative", transition:"all 0.2s",
                    background: settings.music ? "#7c6fff" : "#2a2a40" }}>
                  <span style={{ position:"absolute", top:3, left: settings.music ? 23 : 3, width:22, height:22,
                    borderRadius:"50%", background:"#fff", transition:"all 0.2s" }}/>
                </button>
              </div>
              {settings.music && (
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                  <span style={{fontSize:"0.7rem"}}>🎶</span>
                  <input type="range" min="0" max="100" step="5" value={settings.musicVolume ?? 50}
                    onChange={e=>setSettings(s=>({...s,musicVolume:parseInt(e.target.value,10)}))}
                    style={{flex:1,accentColor:"#7c6fff",cursor:"pointer"}}/>
                  <span style={{fontSize:"0.62rem",color:"#888899",minWidth:28,textAlign:"right"}}>{settings.musicVolume ?? 50}%</span>
                </div>
              )}
            </div>

            {/* Theme (dark only for now, light coming soon) */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #1a1a2e"}}>
              <div>
                <div style={{fontSize:"0.78rem",color:"#ddd",fontWeight:700}}>🎨 Theme</div>
                <div style={{fontSize:"0.6rem",color:"#888899"}}>Dark mode (Light coming soon)</div>
              </div>
              <span style={{fontSize:"0.62rem",color:"#9988ff",border:"1px solid #9988ff44",borderRadius:6,padding:"4px 10px"}}>🌙 DARK</span>
            </div>

            {/* Account info */}
            {user && (
              <div style={{padding:"12px 0",borderBottom:"1px solid #1a1a2e"}}>
                <div style={{fontSize:"0.78rem",color:"#ddd",fontWeight:700,marginBottom:4}}>👤 Account</div>
                <div style={{fontSize:"0.64rem",color:"#aaaabb"}}>Trader: <span style={{color:"#9988ff",fontWeight:700}}>{user.name}</span></div>
                <div style={{fontSize:"0.64rem",color:"#aaaabb"}}>Plan: {user.plan.toUpperCase()}</div>
                <div style={{fontSize:"0.64rem",color:isOnline?"#00ff88":"#888899"}}>{isOnline ? "🌐 Connected to global leaderboard" : "⚪ Local mode"}</div>
              </div>
            )}

            {/* Daily reward button — up to 3 per day */}
            {(() => {
              const today = new Date().toISOString().slice(0,10);
              const usedToday = dailyReward.claimDay === today ? (dailyReward.claimCount || 0) : 0;
              const left = 3 - usedToday;
              const noneLeft = left <= 0;
              return (
                <button className="btn" disabled={noneLeft}
                  onClick={()=>{
                    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
                    const ns = (usedToday===0 && dailyReward.lastClaim === yesterday) ? dailyReward.streak + 1 : (usedToday===0?1:dailyReward.streak);
                    const dc = ((ns-1)%7)+1;
                    setDailyAmount(dc===7?2000:(100+dc*100));
                    setShowSettings(false); setShowDailyReward(true);
                  }}
                  style={{width:"100%",minHeight:44,borderRadius:8,marginTop:14,
                    background: noneLeft ? "#1a1a2e" : "linear-gradient(135deg,#00ff88,#009955)",
                    color: noneLeft ? "#666677" : "#000", cursor: noneLeft ? "default" : "pointer",
                    fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.08em",fontWeight:700}}>
                  {noneLeft ? "🎁 ALL 3 REWARDS CLAIMED ✓" : "🎁 CLAIM DAILY REWARD (" + left + " left)"}
                </button>
              );
            })()}

            {/* Spin wheel button */}
            {(() => {
              const today = new Date().toISOString().slice(0,10);
              const usedToday = spinData.spinDay === today ? (spinData.spinCount || 0) : 0;
              const spinsLeft = 5 - usedToday;
              const noneLeft = spinsLeft <= 0;
              return (
                <button className="btn" disabled={noneLeft}
                  onClick={()=>{ setShowSettings(false); setSpinResult(null); setSpinAngle(0); setShowSpin(true); }}
                  style={{width:"100%",minHeight:44,borderRadius:8,marginTop:10,
                    background: noneLeft ? "#1a1a2e" : "linear-gradient(135deg,#ffaa00,#ff7744)",
                    color: noneLeft ? "#666677" : "#000", cursor: noneLeft ? "default" : "pointer",
                    fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.08em",fontWeight:700}}>
                  {noneLeft ? "🎡 ALL SPINS USED ✓" : "🎡 SPIN THE WHEEL (" + spinsLeft + " left)"}
                </button>
              );
            })()}

            {/* Theme shop */}
            <button className="btn" onClick={()=>{ setShowSettings(false); setShowShop(true); }}
              style={{width:"100%",minHeight:44,borderRadius:8,marginTop:10,background:"linear-gradient(135deg,#ff2d95,#7c6fff)",color:"#fff",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.08em"}}>
              🎨 THEME SHOP
            </button>

            {/* Test bankruptcy (demo the Went Broke screen) */}
            <button className="btn" onClick={()=>{ setShowSettings(false); setShowBroke(true); setBrokeUntil(Date.now()+30*60*1000); setBrokeQuizzes(0); }}
              style={{width:"100%",minHeight:40,borderRadius:8,marginTop:10,background:"transparent",border:"1px solid #ff446644",color:"#ff6688",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.74rem",letterSpacing:"0.06em"}}>
              💸 PREVIEW "WENT BROKE" SCREEN
            </button>

            {/* Feedback shortcut */}
            <button className="btn" onClick={()=>{ setShowSettings(false); setShowFeedback(true); }}
              style={{width:"100%",minHeight:44,borderRadius:8,marginTop:10,background:"linear-gradient(135deg,#7c6fff,#4433cc)",color:"#fff",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.08em"}}>
              💬 GIVE FEEDBACK
            </button>

            {/* Reset account shortcut */}
            <button className="btn" onClick={()=>{ setShowSettings(false); setConfirmReset(true); }}
              style={{width:"100%",minHeight:44,borderRadius:8,marginTop:10,background:"transparent",
                border:"1px solid #ff446644",color:"#ff6688",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.78rem",letterSpacing:"0.08em"}}>
              🗑️ RESET ACCOUNT
            </button>

            <div style={{fontSize:"0.56rem",color:"#666677",textAlign:"center",marginTop:14,lineHeight:1.5}}>
              ODDEX VIBE · For entertainment only.<br/>No real money is involved.
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback button */}
      {user && !showFeedback && (
        <button className="btn" onClick={()=>setShowFeedback(true)} title="Give feedback"
          style={{ position:"fixed", bottom:"clamp(70px,14vw,90px)", right:"clamp(12px,3vw,20px)", zIndex:4000,
            background:"linear-gradient(135deg,#7c6fff,#4433cc)", color:"#fff", borderRadius:"50%",
            width:46, height:46, fontSize:"1.2rem", boxShadow:"0 4px 16px rgba(124,111,255,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #0c0c1e" }}>
          💬
        </button>
      )}

      <div style={{padding:"5px 14px",background:"#030307",borderTop:"1px solid #0d0d1a",
        fontSize:"clamp(0.54rem,1.8vw,0.6rem)",color:"#666677",textAlign:"center",flexShrink:0}}>
        ODDEX VIBE — For entertainment only. Simulated prices. No real money. No financial services. Not regulated.
      </div>
    </div>
  );
}
