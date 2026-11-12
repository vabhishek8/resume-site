import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ensureScrollable } from "./lib/scrollLock.js";
import "./fonts.css";
import "./index.css";
import "./mobile.css";

// Decide motion mode before first paint so animated elements never flash.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dropPreloader = () => { const p = document.querySelector(".preloader"); if (p) p.remove(); };
  if (reduce) { root.classList.add("reduce-motion"); dropPreloader(); return; }
  root.classList.add("anim");
  try { if (sessionStorage.getItem("av-preloaded") === "1") { root.classList.add("no-pre"); dropPreloader(); } } catch { /* ignore */ }
})();

// Hard failsafes: release any scroll lock left behind by the intro.
[2500, 6500].forEach((ms) => setTimeout(ensureScrollable, ms));
window.addEventListener("pageshow", () => setTimeout(ensureScrollable, 300));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
