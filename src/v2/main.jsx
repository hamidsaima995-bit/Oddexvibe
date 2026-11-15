import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./theme.css";

// Apply the saved theme before first paint so there is no flash.
try {
  const t = localStorage.getItem("oddex_theme");
  document.documentElement.dataset.theme =
    t === "light" || t === "dark" ? t : (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
} catch { document.documentElement.dataset.theme = "dark"; }

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
