import { gsap } from "gsap";
import { bus } from "./guideBus.js";

// "Run the pipeline": a visitor-triggered, simulated batch. Packets travel the
// medallion path, a few fail the silver gate and drop out, counters roll, and
// the guide carries the data and cheers when gold is served. Synthetic only.

const SVG_NS = "http://www.w3.org/2000/svg";
const STAGE_X = [80, 330, 580, 830, 1080];
const STAGE_COLOR = ["#8b93a3", "#c9895b", "#c9d3dd", "#f2b544", "#3cc8ff"];

export function initRunPipeline(root) {
  if (!root) return () => {};
  const btn = root.querySelector("[data-run-btn]");
  const label = root.querySelector(".run-label");
  const svg = document.querySelector("[data-med-svg]");
  const layer = svg ? svg.querySelector("[data-run-layer]") : null;
  const nodes = document.querySelectorAll("[data-med-node]");
  const steps = document.querySelectorAll("[data-med-step]");
  const out = {};
  root.querySelectorAll("[data-run-n]").forEach((n) => (out[n.dataset.runN] = n));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let running = false;
  let tl = null;

  const fmt = (n) => Math.round(n).toLocaleString("en-AU");
  const setStage = (i) => {
    steps.forEach((s, k) => s.classList.toggle("run-hit", k === i));
    nodes.forEach((n, k) => n.classList.toggle("run-hit", k === i));
    bus.packet = STAGE_COLOR[Math.max(0, Math.min(4, i))];
    bus.medIndex = Math.max(0, Math.min(4, i));
  };

  function run() {
    if (running) return;
    running = true;
    btn.disabled = true;
    label.textContent = "Running…";
    const total = 1200 + Math.round(Math.random() * 400);
    const bad = Math.round(total * (0.04 + Math.random() * 0.04));
    const counts = { in: 0, bronze: 0, bad: 0, gold: 0 };
    const paint = () => ["in", "bronze", "bad", "gold"].forEach((k) => { if (out[k]) out[k].textContent = fmt(counts[k]); });

    if (reduce) {
      Object.assign(counts, { in: total, bronze: total, bad, gold: total - bad });
      paint();
      running = false; btn.disabled = false; label.textContent = "Run it again";
      return;
    }

    if (bus.react) bus.react("carry");
    tl = gsap.timeline({
      onComplete: () => {
        running = false;
        btn.disabled = false;
        label.textContent = "Run it again";
        steps.forEach((s) => s.classList.remove("run-hit"));
        nodes.forEach((n) => n.classList.remove("run-hit"));
        if (layer) layer.replaceChildren();
        root.classList.add("done");
        if (bus.react) bus.react("cheer");
      }
    });

    root.classList.remove("done");
    tl.call(() => setStage(0), null, 0)
      .to(counts, { in: total, duration: 0.9, ease: "power2.out", onUpdate: paint }, 0)
      .call(() => setStage(1), null, 0.6)
      .to(counts, { bronze: total, duration: 0.8, ease: "power2.out", onUpdate: paint }, 0.6)
      .call(() => setStage(2), null, 1.3)
      .to(counts, { bad, duration: 0.7, ease: "power2.out", onUpdate: paint }, 1.4)
      .call(() => setStage(3), null, 2.0)
      .to(counts, { gold: total - bad, duration: 0.9, ease: "power2.out", onUpdate: paint }, 2.0)
      .call(() => setStage(4), null, 2.7)
      .to({}, { duration: 0.5 }, 2.7);

    // packets along the drawn path (desktop diagram only)
    if (layer && svg.getBoundingClientRect().width > 0) {
      layer.replaceChildren();
      const N = 28;
      for (let i = 0; i < N; i++) {
        const c = document.createElementNS(SVG_NS, "circle");
        c.setAttribute("r", "5");
        c.setAttribute("cy", "110");
        c.setAttribute("cx", String(STAGE_X[0]));
        c.setAttribute("class", "run-pk");
        layer.appendChild(c);
        const isBad = i % 9 === 4;
        const o = { x: STAGE_X[0], y: 110, a: 1 };
        const upd = () => {
          c.setAttribute("cx", o.x.toFixed(1));
          c.setAttribute("cy", o.y.toFixed(1));
          c.setAttribute("opacity", o.a.toFixed(2));
          const st = o.x < 300 ? 0 : o.x < 560 ? 1 : o.x < 810 ? 2 : o.x < 1060 ? 3 : 4;
          c.setAttribute("fill", isBad && o.x >= 560 ? "#ff5468" : STAGE_COLOR[st]);
        };
        const start = i * 0.07;
        if (isBad) {
          tl.to(o, { x: 590, duration: 1.4, ease: "none", onUpdate: upd }, start)
            .to(o, { y: 190, a: 0, duration: 0.6, ease: "power2.in", onUpdate: upd }, start + 1.4);
        } else {
          tl.to(o, { x: STAGE_X[4], duration: 2.3, ease: "none", onUpdate: upd }, start)
            .to(o, { a: 0, duration: 0.25, onUpdate: upd }, start + 2.3);
        }
      }
    }
  }

  btn.addEventListener("click", run);
  return () => {
    btn.removeEventListener("click", run);
    if (tl) tl.kill();
  };
}
