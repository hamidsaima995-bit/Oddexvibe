// ODDEX VIBE asset catalog. Every market is a sentiment index: its price
// tracks public mood around a topic and moves on real news.
//
// `seed` is the asset's original ticker. The price engine seeds from it, so
// renaming a market never changes its price history.

export const SECTORS = [
  { id: "Index", color: "#7c5cff" },
  { id: "Entertainment", color: "#e0457b" },
  { id: "Social", color: "#2f80ed" },
  { id: "Trends", color: "#e8890c" },
  { id: "Lifestyle", color: "#0fa38f" },
  { id: "Work & Tech", color: "#5865f2" },
];
export const SECTOR_COLOR = Object.fromEntries(SECTORS.map((s) => [s.id, s.color]));

export const ASSETS = [
  { id: 1, symbol: "VIBE", seed: "VIBE", name: "ODDEX Mood Index", sector: "Index", basePrice: 420.69, volatility: 0.032, vol: "2.1M", hot: true, desc: "Composite of overall public sentiment across every market." },
  { id: 2, symbol: "CELEB", seed: "DRAM", name: "Celebrity Sentiment Index", sector: "Entertainment", basePrice: 69, volatility: 0.055, vol: "9.9M", hot: true, desc: "Public mood around celebrity news and public figures." },
  { id: 3, symbol: "CALM", seed: "SLEE", name: "Calm & Rest Index", sector: "Lifestyle", basePrice: 7.5, volatility: 0.018, vol: "312K", hot: false, desc: "How rested and relaxed people say they feel." },
  { id: 4, symbol: "VIRAL", seed: "CRNG", name: "Viral Content Index", sector: "Trends", basePrice: 0.03, volatility: 0.09, vol: "99M", hot: true, desc: "Attention on whatever is spreading fastest online." },
  { id: 5, symbol: "TVIX", seed: "EXNRG", name: "Television Index", sector: "Entertainment", basePrice: 55.55, volatility: 0.028, vol: "887K", hot: false, desc: "Sentiment around TV shows, networks and premieres." },
  { id: 6, symbol: "COLL", seed: "CLOUD", name: "Rare Collectibles Index", sector: "Trends", basePrice: 1200, volatility: 0.01, vol: "18.4K", hot: false, desc: "Demand for art, collectibles and one-of-a-kind items." },
  { id: 7, symbol: "CRTR", seed: "MENT", name: "Creator Economy Index", sector: "Trends", basePrice: 333.33, volatility: 0.04, vol: "450K", hot: true, desc: "Momentum of independent creators and their audiences." },
  { id: 8, symbol: "NOST", seed: "DEJA", name: "Nostalgia Index", sector: "Entertainment", basePrice: 42, volatility: 0.042, vol: "42K", hot: false, desc: "Interest in retro trends, reboots and comebacks." },
  { id: 9, symbol: "FANT", seed: "LORE", name: "Fantasy & Sci-Fi Index", sector: "Entertainment", basePrice: 888, volatility: 0.022, vol: "1.2M", hot: true, desc: "Buzz around fantasy and sci-fi worlds and franchises." },
  { id: 10, symbol: "QUIET", seed: "AWKW", name: "Low Attention Index", sector: "Trends", basePrice: 0.01, volatility: 0.005, vol: "61.2K", hot: false, desc: "Topics nobody is talking about. Very slow moving." },
  { id: 11, symbol: "ARTS", seed: "RDBR", name: "Arts & Culture Index", sector: "Entertainment", basePrice: 6.66, volatility: 0.066, vol: "6.6M", hot: true, desc: "Sentiment around art, music halls and culture news." },
  { id: 12, symbol: "RUMR", seed: "GOSR", name: "Rumor Mill Index", sector: "Social", basePrice: 17.42, volatility: 0.038, vol: "224K", hot: false, desc: "Volume of unconfirmed stories and speculation." },
  { id: 13, symbol: "SOCL", seed: "AWKE", name: "Social Comfort Index", sector: "Social", basePrice: 3.14, volatility: 0.075, vol: "5.5M", hot: true, desc: "How easy people find everyday social situations." },
  { id: 14, symbol: "PROD", seed: "PROC", name: "Productivity Index", sector: "Work & Tech", basePrice: 99.99, volatility: 0.048, vol: "3.3M", hot: false, desc: "How much people feel they are getting done." },
  { id: 15, symbol: "CONN", seed: "WIFI", name: "Connectivity Index", sector: "Work & Tech", basePrice: 12.5, volatility: 0.025, vol: "1.1M", hot: false, desc: "Satisfaction with internet and mobile connections." },
  { id: 16, symbol: "TEAM", seed: "GRPJ", name: "Teamwork Index", sector: "Work & Tech", basePrice: 250, volatility: 0.058, vol: "678K", hot: true, desc: "Sentiment around group work and collaboration." },
  { id: 17, symbol: "MSGS", seed: "TYPO", name: "Messaging Index", sector: "Social", basePrice: 0.99, volatility: 0.085, vol: "12M", hot: false, desc: "Activity and mood across chats and messaging apps." },
  { id: 18, symbol: "FILM", seed: "GHOST", name: "Film & Box Office Index", sector: "Entertainment", basePrice: 404.04, volatility: 0.052, vol: "890K", hot: true, desc: "Sentiment around movies, casting and box office news." },
  { id: 19, symbol: "MORN", seed: "SNZE", name: "Morning Energy Index", sector: "Lifestyle", basePrice: 5.55, volatility: 0.03, vol: "2.7M", hot: false, desc: "How energetic people feel at the start of the day." },
  { id: 20, symbol: "EMPA", seed: "VIBE2", name: "Empathy Index", sector: "Social", basePrice: 88.88, volatility: 0.062, vol: "1.4M", hot: false, desc: "How strongly people react to others' moments." },
  { id: 21, symbol: "RESP", seed: "LEFT", name: "Response Rate Index", sector: "Social", basePrice: 200, volatility: 0.07, vol: "4.2M", hot: true, desc: "How quickly people reply to each other." },
  { id: 22, symbol: "SPRT", seed: "MNDY", name: "Sports & Events Index", sector: "Entertainment", basePrice: 24, volatility: 0.045, vol: "7.7M", hot: false, desc: "Sentiment around matches, fights and live events." },
  { id: 23, symbol: "NETS", seed: "BUFF", name: "Internet Speed Index", sector: "Work & Tech", basePrice: 3.6, volatility: 0.055, vol: "9.1M", hot: true, desc: "Complaints and praise about load times and streaming." },
  { id: 24, symbol: "WKND", seed: "PLAN", name: "Weekend Plans Index", sector: "Lifestyle", basePrice: 150, volatility: 0.04, vol: "2.2M", hot: false, desc: "Excitement around weekend and free-time plans." },
  { id: 25, symbol: "LIFE", seed: "BATT", name: "Lifestyle Index", sector: "Lifestyle", basePrice: 45, volatility: 0.08, vol: "5.8M", hot: true, desc: "Mood around everyday living, horoscopes and habits." },
  { id: 26, symbol: "STRS", seed: "OVRT", name: "Stress Index", sector: "Lifestyle", basePrice: 300, volatility: 0.066, vol: "6.3M", hot: false, desc: "Reported stress and pressure levels." },
  { id: 27, symbol: "LANG", seed: "AUTO", name: "Language & Text Index", sector: "Work & Tech", basePrice: 8.88, volatility: 0.072, vol: "4.4M", hot: true, desc: "Activity around writing tools, typing and text." },
  { id: 28, symbol: "RMTE", seed: "MUTE", name: "Remote Work Index", sector: "Work & Tech", basePrice: 19.99, volatility: 0.05, vol: "3.9M", hot: false, desc: "Sentiment around video calls and working from home." },
  { id: 29, symbol: "TREND", seed: "FOMO", name: "Trending Topics Index", sector: "Trends", basePrice: 77.7, volatility: 0.062, vol: "2.6M", hot: true, desc: "Whatever the internet is talking about right now." },
  { id: 30, symbol: "NUTR", seed: "DIET", name: "Nutrition Index", sector: "Lifestyle", basePrice: 14.2, volatility: 0.095, vol: "8.8M", hot: false, desc: "Interest in healthy eating and food goals." },
  { id: 31, symbol: "FAND", seed: "SPOI", name: "Fandom Index", sector: "Entertainment", basePrice: 66.6, volatility: 0.058, vol: "1.9M", hot: false, desc: "Energy of fan communities and spoilers." },
  { id: 32, symbol: "CHAT", seed: "REPL", name: "Chat Activity Index", sector: "Social", basePrice: 33.3, volatility: 0.068, vol: "5.1M", hot: true, desc: "How busy group chats and DMs are." },
  { id: 33, symbol: "SLPD", seed: "ALRM", name: "Sleep Debt Index", sector: "Lifestyle", basePrice: 9.09, volatility: 0.044, vol: "6.6M", hot: false, desc: "How much sleep people feel they are missing." },
  { id: 34, symbol: "STRM", seed: "TABS", name: "Streaming Index", sector: "Entertainment", basePrice: 47.47, volatility: 0.036, vol: "1.3M", hot: false, desc: "Sentiment around streaming platforms and releases." },
  { id: 35, symbol: "MEDIA", seed: "DELV", name: "Media Buzz Index", sector: "Entertainment", basePrice: 120, volatility: 0.054, vol: "2.0M", hot: true, desc: "Overall attention on entertainment headlines." },
  { id: 36, symbol: "NIGHT", seed: "SEEN", name: "Night Owl Index", sector: "Lifestyle", basePrice: 188, volatility: 0.066, vol: "3.1M", hot: true, desc: "Late-night online activity." },
  { id: 37, symbol: "LNCH", seed: "HYPE", name: "Product Launch Index", sector: "Trends", basePrice: 512, volatility: 0.078, vol: "4.8M", hot: true, desc: "Excitement ahead of launches and releases." },
  { id: 38, symbol: "CONF", seed: "RGRT", name: "Confidence Index", sector: "Social", basePrice: 27, volatility: 0.071, vol: "5.4M", hot: false, desc: "How sure people feel about their decisions." },
  { id: 39, symbol: "INFL", seed: "CLOUT", name: "Influencer Index", sector: "Trends", basePrice: 640, volatility: 0.088, vol: "7.2M", hot: true, desc: "Reach and momentum of online personalities." },
  { id: 40, symbol: "TRST", seed: "GASL", name: "Trust Index", sector: "Social", basePrice: 11.11, volatility: 0.06, vol: "2.3M", hot: false, desc: "How much people trust what they read and hear." },
  { id: 41, symbol: "HOUS", seed: "RENT", name: "Housing Pressure Index", sector: "Lifestyle", basePrice: 95, volatility: 0.05, vol: "6.1M", hot: true, desc: "Sentiment around rent and housing costs." },
  { id: 42, symbol: "FIT", seed: "GYM", name: "Fitness Index", sector: "Lifestyle", basePrice: 31, volatility: 0.092, vol: "4.0M", hot: false, desc: "Motivation around workouts and fitness goals." },
  { id: 43, symbol: "COMM", seed: "UNSE", name: "Communication Index", sector: "Social", basePrice: 73, volatility: 0.064, vol: "3.7M", hot: true, desc: "How openly people say what they think." },
  { id: 44, symbol: "CSAT", seed: "QUEU", name: "Customer Service Index", sector: "Work & Tech", basePrice: 4.2, volatility: 0.048, vol: "8.9M", hot: false, desc: "Satisfaction with support lines and service." },
  { id: 45, symbol: "WTCH", seed: "BINGE", name: "Watch Time Index", sector: "Entertainment", basePrice: 144, volatility: 0.07, vol: "5.9M", hot: true, desc: "Hours spent watching shows and videos." },
  { id: 46, symbol: "DATE", seed: "SWIPE", name: "Dating Sentiment Index", sector: "Social", basePrice: 58, volatility: 0.075, vol: "6.6M", hot: false, desc: "Mood around dating apps and relationships." },
  { id: 47, symbol: "CMUT", seed: "TRAF", name: "Commute Index", sector: "Lifestyle", basePrice: 22, volatility: 0.056, vol: "7.8M", hot: false, desc: "How people feel about getting from A to B." },
  { id: 48, symbol: "GROC", seed: "EMPT", name: "Grocery Index", sector: "Lifestyle", basePrice: 16.5, volatility: 0.058, vol: "4.5M", hot: false, desc: "Sentiment around food shopping and prices." },
  { id: 49, symbol: "NOTF", seed: "NOTIF", name: "Notification Index", sector: "Work & Tech", basePrice: 38, volatility: 0.069, vol: "5.2M", hot: true, desc: "Volume and fatigue from alerts and pings." },
  { id: 50, symbol: "DDLN", seed: "DEAD", name: "Deadline Pressure Index", sector: "Work & Tech", basePrice: 230, volatility: 0.085, vol: "6.9M", hot: true, desc: "Pressure around due dates and crunch time." },
];

export const ASSET_BY_SYMBOL = Object.fromEntries(ASSETS.map((a) => [a.symbol, a]));

// Old tickers (used by the news backend, old saves and old trades) -> current ticker.
export const LEGACY_SYMBOL = Object.fromEntries(ASSETS.map((a) => [a.seed, a.symbol]));

// Accepts a current or old ticker; returns the current ticker or null.
export function resolveSymbol(sym) {
  if (!sym) return null;
  const s = String(sym).toUpperCase();
  if (ASSET_BY_SYMBOL[s]) return s;
  return LEGACY_SYMBOL[s] || null;
}
