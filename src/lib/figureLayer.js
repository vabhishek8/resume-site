// Controller for the figure layer. Mirrors the reference video:
//   - fixed layer, full strength in the hero, dimmed behind later sections
//   - per-section pose cross-fades (CSS opacity transitions)
//   - gentle scroll-linked parallax and a very subtle idle breath (CSS)
//   - soft mask into the page (CSS)
// Also sinks the hero particle stream into the portrait's chest.
import { CHAPTERS, FIGURE } from "../content.js";
import { bus } from "./guideBus.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const STRENGTH = { Hello: 1, Contact: 0.5 };
const DIM = 0.36;

export function startFigureLayer(wrap) {
  if (!wrap) return () => {};
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const poses = {};
  wrap.querySelectorAll("[data-pose]").forEach((n) => (poses[n.dataset.pose] = n));
  const resolve = (key) => (poses[key] ? key : "hero");
  let current = "hero";
  let raf = 0;

  // Non-hero poses: attach sources once the page has loaded (keeps LCP lean)
  const hydrate = () => {
    wrap.querySelectorAll("img[data-srcset]").forEach((img) => {
      img.srcset = img.dataset.srcset; img.src = img.dataset.src;
      img.removeAttribute("data-srcset"); img.removeAttribute("data-src");
    });
  };
  const hydrateLater = () => setTimeout(hydrate, 1200);
  if (document.readyState === "complete") hydrateLater(); else window.addEventListener("load", hydrateLater, { once: true });

  // Fade in after the hero name forms (or immediately for reduced motion)
  const show = () => wrap.classList.add("is-in");
  if (reduce || window.__avNameReady) show();
  window.addEventListener("av:name-ready", show);
  const showFallback = setTimeout(show, 3800);

  function update() {
    raf = 0;
    const vh = window.innerHeight;
    const line = vh * 0.5;
    let chapter = CHAPTERS[0];
    for (const c of CHAPTERS) {
      const n = document.querySelector(c.sel);
      if (n && n.getBoundingClientRect().top <= line) chapter = c;
    }
    const key = resolve(FIGURE.sectionPose[chapter.label] || "hero");
    if (key !== current) {
      Object.entries(poses).forEach(([k, n]) => n.classList.toggle("is-active", k === key));
      current = key;
    }
    wrap.style.setProperty("--fig-op", String(STRENGTH[chapter.label] ?? DIM));
    const hero = document.querySelector(".hero");
    const p = hero ? clamp(window.scrollY / Math.max(1, hero.offsetHeight), 0, 1) : 0;
    if (!reduce) {
      const sec = document.querySelector(chapter.sel);
      const r = sec ? sec.getBoundingClientRect() : { top: 0, height: vh };
      const within = clamp(-r.top / Math.max(1, r.height), 0, 1);
      wrap.style.setProperty("--fig-par", `${(-p * 3 - within * 2).toFixed(2)}%`);
    }
    const wr = wrap.getBoundingClientRect();
    bus.laptop.x = wr.left + wr.width * 0.5;
    bus.laptop.y = wr.top + wr.height * 0.72;
    bus.laptop.active = window.innerWidth >= 1024 && p < 0.3 && wrap.classList.contains("is-in");
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  const tick = setInterval(update, 1000); // keeps the stream sink fresh before any scroll
  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(showFallback);
    clearInterval(tick);
    window.removeEventListener("av:name-ready", show);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    bus.laptop.active = false;
    root.classList.remove("fig-ready");
  };
}
