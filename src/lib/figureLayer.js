// Controller for the image-based figure layer (used once generated poses are
// configured in content.js). Mirrors the reference video's behaviour:
//   - fixed layer, full strength in the hero, ~40% behind later sections
//   - per-section pose cross-fades (CSS opacity transitions, 600ms)
//   - About pose sits on the left
//   - gentle scroll-linked parallax (2-4%) and a very subtle idle breath (CSS)
//   - soft mask into the page (CSS)
import { CHAPTERS, FIGURE } from "../content.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function startFigureLayer(wrap) {
  if (!wrap) return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const poses = {};
  wrap.querySelectorAll("[data-pose]").forEach((n) => (poses[n.dataset.pose] = n));
  const resolve = (key) => (poses[key] ? key : "hero");
  let current = null;
  let raf = 0;

  const STRENGTH = { Hello: 1, Profile: 1, Contact: 0.5 };

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
      wrap.classList.toggle("is-left", key === "about");
      current = key;
    }
    const strength = STRENGTH[chapter.label] ?? 0.4;
    wrap.style.setProperty("--fig-op", String(strength));
    if (!reduce) {
      const hero = document.querySelector(".hero");
      const p = hero ? clamp(window.scrollY / Math.max(1, hero.offsetHeight), 0, 1) : 0;
      const sec = document.querySelector(chapter.sel);
      const r = sec ? sec.getBoundingClientRect() : { top: 0, height: vh };
      const within = clamp(-r.top / Math.max(1, r.height), 0, 1);
      wrap.style.setProperty("--fig-par", `${(-p * 3 - within * 2).toFixed(2)}%`);
    }
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
