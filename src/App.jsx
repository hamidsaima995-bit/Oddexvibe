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
  { lvl:"secret", q:"What is 'impermanent loss' related to?", o:["Bank savings","Crypto liquidity pools","Stock dividends","Government bonds"], a:1, reward:1500 },
  { lvl:"secret", q:"What does 'gas fee' mean in crypto?", o:["Car fuel cost","Fee to process a blockchain transaction","A trading bonus","A bank charge"], a:1, reward:2000 },
  { lvl:"secret", q:"What is a 'DAO'?", o:["A type of coin","Decentralized Autonomous Organization","A trading bot","A bank"], a:1, reward:2500 },
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
function playSound(type) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    // A single tone with optional pitch slide, filter, and punch
    const tone = (freq, start, dur, vol = 0.4, shape = "sine", slideTo = null) => {
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
    master.gain.value = 0.22; // audible but not overpowering
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
    const { data: existing } = await supabase
      .from("profiles").select("id").ilike("username", uname).maybeSingle();
    if (existing) return { ok:false, error:"That username is already taken." };
    const password_hash = await hashPassword(password);
    const row = { username: uname, password_hash, food_name: (foodName||"").trim().toLowerCase() };
    if (gender) row.gender = gender;
    if (birthdate) row.birthdate = birthdate;
    const { error } = await supabase.from("profiles").insert(row);
    if (error) return { ok:false, error:"Could not create account. Try a different name." };
    return { ok:true };
  } catch { return { ok:false, error:"Network error. Please try again." }; }
}

// Log in. Returns { ok, error, profile }.
async function loginAccount({ username, password }) {
  try {
    const { data: profile } = await supabase
      .from("profiles").select("*").ilike("username", username.trim()).maybeSingle();
    if (!profile) return { ok:false, error:"No account with that username." };
    const hash = await hashPassword(password);
    if (profile.password_hash !== hash) return { ok:false, error:"Wrong password." };
    return { ok:true, profile };
  } catch { return { ok:false, error:"Network error. Please try again." }; }
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
async function pushScore(deviceId, netWorth, xp) {
  try {
    const { data: existing } = await supabase
      .from("scores").select("id").eq("user_id", deviceId).maybeSingle();
    if (existing) {
      await supabase.from("scores").update({ net_worth: netWorth, xp }).eq("user_id", deviceId);
    } else {
      await supabase.from("scores").insert({ user_id: deviceId, net_worth: netWorth, xp });
    }
    return true;
  } catch { return false; }
}

// Fetch top scores for the real leaderboard.
// We try to attach a display name from profiles, but since profiles.id (int8)
// and scores.user_id (uuid) aren't directly linked yet in this simple schema,
// we fall back to a friendly generated name if no match is found — this way
// the leaderboard always renders safely, never breaks, and never shows raw IDs.
async function fetchLeaderboard(limit = 25) {
  try {
    const { data: scores, error } = await supabase
      .from("scores").select("user_id, net_worth, xp")
      .order("net_worth", { ascending: false }).limit(limit);
    if (error || !scores) return null;
    return scores.map((s, i) => ({
      id: s.user_id,
      name: "Trader#" + String(s.user_id || i).slice(-4).toUpperCase(),
      worth: s.net_worth,
      xp: s.xp,
    }));
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
      // account created — go to plan selection, then start logged-in
      setName(username.trim());
      setStep(1); setMode("plan");
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
        <button style={btnPrimary} onClick={() => { if (!name.trim()) { setNameErr(true); return; } setStep(1); }}>NEXT — CHOOSE PLAN →</button>
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
                  background:"#0c0c1e", borderRadius:4, padding:"2px 6px" }}>{f}</span>
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
  const [settings, setSettings] = useState(saved?.settings ?? { sound:true, music:false, theme:"dark" });
  const [showSettings, setShowSettings] = useState(false);

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
  const portVal = portfolio.reduce((s, p) => { const a = assets.find(x => x.id === p.id); return s + (a ? a.price : 0) * p.qty; }, 0);
  const netWorth = balance + portVal;

  // ══ Save to localStorage whenever key data changes ══════════════════
  useEffect(() => {
    if (user) writeSave({ user, balance, portfolio, achieved, quizStats, academyProgress, settings });
  }, [user, balance, portfolio, achieved, quizStats, academyProgress, settings]);

  // Sound helper — only plays if the user has sound enabled in settings
  const sfx = useCallback((type) => { if (settings.sound) playSound(type); }, [settings.sound]);

  // Background music — start/stop based on the music setting
  useEffect(() => {
    if (settings.music) startBGM();
    else stopBGM();
    return () => stopBGM();
  }, [settings.music]);

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
    // Refresh leaderboard periodically so it feels "live"
    const interval = setInterval(() => {
      fetchLeaderboard().then(lb => { if (lb) setRealLeaderboard(lb); });
    }, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      sfx("buy");
      showToast("Bought " + oQty + " " + sel.symbol + " (slip " + (luck > 1 ? "+" : "") + slip + "%) ✅");
    } else {
      const held = portfolio.find(p => p.id === selId);
      if (!held || held.qty < oQty) { showToast("You don't own enough 😭", "err"); return; }
      setBalance(b => parseFloat((b + cost).toFixed(2)));
      setPortfolio(prev => prev.map(p => p.id === selId ? { ...p, qty: p.qty - oQty } : p).filter(p => p.qty > 0));
      unlock("first_trade");
      sfx("sell");
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
    pushScore(id, netWorth, academyProgress.xp).then(ok => { if (ok) setIsOnline(true); });
  }, [netWorth, user, academyProgress.xp]);

  function handleStart(name, plan, isAccount) {
    setUser({ name, plan, account: !!isAccount });
    setBalance(PLAN_CASH[plan]);
    setPortfolio([]);
    setAchieved([]);
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
    // Use their profile id as the stable identity for scores
    try { localStorage.setItem("oddex_device_id", String(profile.id)); } catch {}
    deviceIdRef.current = String(profile.id);
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
    setAcademyQIdx(0);
    setAcademyAnswered(null);
    setAcademyCorrectCount(0);
    setAcademyLessonDone(false);
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
      setAcademyQIdx(i => i + 1);
      setAcademyAnswered(null);
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
        return { completed:newCompleted, streak:newStreak, lastDay:today, xp: prev.xp + (alreadyDone?0:xpEarned) };
      });
      if (!academyProgress.completed.includes(academyLessonId)) {
        setBalance(b => parseFloat((b + cashEarned).toFixed(2)));
      }
      setAcademyLessonDone(true);
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
    setQuizQ(null);
    setConfirmReset(false);
    setTab("trade");
  }

  // Real leaderboard from Supabase (if loaded), with current user's live net worth merged in.
  // Falls back to mock LEADERBOARD if Supabase hasn't returned data yet (e.g. first load, offline).
  const myId = deviceIdRef.current;
  let board;
  if (realLeaderboard && realLeaderboard.length > 0) {
    const others = realLeaderboard.filter(p => p.id !== myId);
    const mine = user ? [{ id:myId, name:user.name, worth:netWorth, plan:user.plan, isMe:true }] : [];
    board = [...mine, ...others.map(p => ({ ...p, isMe:false, plan:"free" }))]
      .sort((a,b) => b.worth - a.worth).map((p,i) => ({ ...p, rank:i+1, pct:0 }));
  } else {
    board = user
      ? [{ name:user.name, worth:netWorth, pct:0, plan:user.plan, isMe:true }, ...LEADERBOARD]
          .sort((a, b) => b.worth - a.worth).map((p, i) => ({ ...p, rank:i+1 }))
      : LEADERBOARD.map((p, i) => ({ ...p, rank:i+1, isMe:false }));
  }

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
          {isOnline && (
            <span title="Connected to global leaderboard" style={{ background:"#00ff8822", border:"1px solid #00ff8844", borderRadius:4, padding:"2px 6px",
              fontSize:"clamp(0.44rem,1.6vw,0.5rem)", color:"#00ff88", letterSpacing:"0.08em" }}>🌐</span>
          )}
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
            <div title="Your trader ID"
              style={{ display:"flex",alignItems:"center",gap:6,
              background:"#0d0d1e", border:"1px solid " + planColor + "33", borderRadius:8, padding:"4px 9px" }}>
              <span style={{fontSize:"clamp(0.8rem,3vw,0.95rem)"}}>{planBadge || "👤"}</span>
              <div>
                <div style={{fontSize:"clamp(0.58rem,2vw,0.66rem)",fontWeight:700,color:"#ddd"}}>{user.name}</div>
                <div style={{fontSize:"clamp(0.56rem,1.8vw,0.62rem)",color:planColor,letterSpacing:"0.08em"}}>{user.plan.toUpperCase()}</div>
              </div>
            </div>
          )}
          <button className="btn" onClick={()=>{ sfx("tap"); setShowSettings(true); }} title="Settings"
            style={{ background:"#0d0d1e", border:"1px solid #2a2a40", borderRadius:8, width:34, height:34,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>
            ⚙️
          </button>
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
                {/* Chart: candle OR wave */}
                {chartType === "candle" ? candles.map((c, i) => {
                  const x = i * candleW + candleW / 2;
                  const green = c.close >= c.open;
                  const col = green ? "#00ff88" : "#ff4466";
                  const bodyTop = yOf(Math.max(c.open, c.close));
                  const bodyBot = yOf(Math.min(c.open, c.close));
                  const bodyH = Math.max(0.8, bodyBot - bodyTop);
                  const bw = Math.max(1.5, candleW * 0.6);
                  return (
                    <g key={i}>
                      <line x1={x} y1={yOf(c.high)} x2={x} y2={yOf(c.low)} stroke={col} strokeWidth="0.6" />
                      <rect x={x - bw/2} y={bodyTop} width={bw} height={bodyH} fill={col} />
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
            {/* Timeframe selector */}
            <div style={{display:"flex",gap:6,marginTop:10,justifyContent:"center",alignItems:"center",flexWrap:"wrap"}}>
              {["1D","1W","1M","1Y","ALL"].map(tf=>(
                <button key={tf} className="btn" onClick={()=>setTimeframe(tf)}
                  style={{minHeight:32,padding:"0 clamp(8px,2.5vw,14px)",borderRadius:6,
                    fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(0.62rem,2.2vw,0.72rem)",fontWeight:700,
                    background:timeframe===tf?"rgba(124,111,255,0.18)":"rgba(255,255,255,0.03)",
                    color:timeframe===tf?"#9988ff":"#666677",
                    border:"1px solid "+(timeframe===tf?"#7c6fff44":"transparent"),letterSpacing:"0.05em"}}>
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
          <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #111122",flexShrink:0,WebkitOverflowScrolling:"touch"}}>
            {[{id:"trade",icon:"📊",label:"TRADE"},{id:"academy",icon:"🎓",label:"TRADING ACADEMY"},{id:"quiz",icon:"🧠",label:"QUIZ TEST"},{id:"board",icon:"🏆",label:"RANKS"},{id:"plans",icon:"💎",label:"PLANS"},{id:"awards",icon:"🏅",label:"AWARDS"}].map(t=>(
              <button key={t.id} className="tab-btn" onClick={()=>{ sfx("tap"); setTab(t.id); }}
                style={{minHeight:44,minWidth:"18.5%",flexShrink:0,padding:"0 6px",textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",
                  fontSize:"clamp(0.6rem,2.1vw,0.7rem)",letterSpacing:"0.04em",whiteSpace:"nowrap",
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
                        <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
                          {level.lessons.map((lesson, lessonIdx) => {
                            const lessonUnlocked = isLessonUnlocked(levelIdx, lessonIdx);
                            const lessonDone = academyProgress.completed.includes(lesson.id);
                            return (
                              <button key={lesson.id} className="btn" disabled={!lessonUnlocked}
                                onClick={()=>lessonUnlocked && startLesson(level.id, lesson.id)}
                                style={{minWidth:78,minHeight:78,borderRadius:12,flexShrink:0,
                                  background:lessonDone?level.color+"22":lessonUnlocked?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.015)",
                                  border:"1.5px solid "+(lessonDone?level.color:lessonUnlocked?"#2a2a40":"#1a1a28"),
                                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
                                  cursor:lessonUnlocked?"pointer":"default",padding:"6px 4px"}}>
                                <span style={{fontSize:"1.3rem"}}>{lessonDone?"✓":lessonUnlocked?"▶":"🔒"}</span>
                                <span style={{fontSize:"0.5rem",color:lessonUnlocked?"#aaaabb":"#555566",textAlign:"center",lineHeight:1.2}}>{lesson.title}</span>
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
              </div>
              <div style={{color:"#888899",fontSize:"0.64rem",marginBottom:12}}>Ranked by net worth</div>
              {board.map(p=>(
                <div key={(p.id||p.name)+p.rank} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",marginBottom:4,borderRadius:8,
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
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #1a1a2e"}}>
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

            {/* Background music toggle */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #1a1a2e"}}>
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

            {/* Feedback shortcut */}
            <button className="btn" onClick={()=>{ setShowSettings(false); setShowFeedback(true); }}
              style={{width:"100%",minHeight:44,borderRadius:8,marginTop:14,background:"linear-gradient(135deg,#7c6fff,#4433cc)",color:"#fff",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.82rem",letterSpacing:"0.08em"}}>
              💬 GIVE FEEDBACK
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
