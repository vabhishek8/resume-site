import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Decide motion mode before first paint so animated elements never flash.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { root.classList.add("reduce-motion"); return; }
  root.classList.add("anim");
  try { if (sessionStorage.getItem("av-preloaded") === "1") root.classList.add("no-pre"); } catch { /* ignore */ }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
