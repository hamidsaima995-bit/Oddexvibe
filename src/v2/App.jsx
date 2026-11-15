import { StoreProvider, useStore } from "./store.jsx";
import { fmtUSD } from "./lib/format.js";
import { Icon } from "./components/ui.jsx";
import MarketsPage from "./pages/MarketsPage.jsx";
import TradePage from "./pages/TradePage.jsx";
import AssetsPage from "./pages/AssetsPage.jsx";
import RanksPage from "./pages/RanksPage.jsx";

const NAV = [
  ["markets", "Markets"],
  ["trade", "Spot"],
  ["futures", "Futures"],
  ["assets", "Assets"],
  ["ranks", "Ranks"],
];

function href(page, lastSymbol) {
  return "#/" + page + (page === "trade" || page === "futures" ? "/" + lastSymbol : "");
}

function Shell() {
  const { route, lastSymbol, theme, toggleTheme, equity, toasts } = useStore();
  const page = route.page;
  return (
    <div className="app">
      <header className="topbar">
        <a href="#/markets" className="logo" style={{ color: "inherit", textDecoration: "none" }}>ODD<b>EX</b><small>VIBE</small></a>
        <nav className="topnav">
          {NAV.map(([k, label]) => <a key={k} href={href(k, lastSymbol)} className={page === k ? "on" : ""}>{label}</a>)}
        </nav>
        <span className="spacer" />
        <a href="#/assets" className="equity-chip num" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="label">EQUITY</div>
          <div className="val">{fmtUSD(equity.total)}</div>
        </a>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle light or dark mode">
          {theme === "dark" ? Icon.sun : Icon.moon}
        </button>
      </header>

      <main>
        {page === "markets" && <MarketsPage />}
        {page === "trade" && <TradePage key="spot" mode="trade" />}
        {page === "futures" && <TradePage key="futures" mode="futures" />}
        {page === "assets" && <AssetsPage />}
        {page === "ranks" && <RanksPage />}
        <div className="disclaimer">ODDEX VIBE is a simulated market for entertainment. No real money, no real assets.</div>
      </main>

      <nav className="bottomnav">
        {NAV.map(([k, label]) => (
          <a key={k} href={href(k, lastSymbol)} className={page === k ? "on" : ""}>
            {Icon[k === "trade" ? "trade" : k]}
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="toasts">
        {toasts.map((t) => <div key={t.id} className={"toast " + (t.kind === "err" ? "err" : "")}>{t.msg}</div>)}
      </div>
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
