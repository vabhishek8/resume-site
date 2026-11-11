// Data portrait: a halftone likeness rebuilt from a luminance grid sampled
// from the reference photo (see portraitData.js). Rendered on canvas as three
// baked depth layers (head, shoulders, rim light) so the settled state costs
// three drawImage calls per frame. Particles only animate individually during
// the assemble (hero) and dissolve (pipeline) transitions.
// Behaviour mirrors the reference video: a fixed, faded portrait layer with
// scroll-linked depth, a subtle head turn toward the cursor via layer offsets,
// and cross-fades between sections.

import { PORTRAIT } from "./portraitData.js";
import { bus } from "./guideBus.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const C_LOW = [28, 96, 170];
const C_HIGH = [150, 222, 255];
const NECK_ROW = 0.6; // rows above this fraction belong to the head layer

function parse() {
  const rows = PORTRAIT.rows.split("\n");
  const gw = PORTRAIT.w, gh = PORTRAIT.h;
  const cells = [];
  const inside = (x, y) => y >= 0 && y < gh && x >= 0 && x < gw && rows[y][x] !== ".";
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const ch = rows[y][x];
      if (ch === ".") continue;
      const l = ch === "-" ? 0 : parseInt(ch, 36) / 35;
      const rim = x > gw * 0.45 && !inside(x + 1, y) && !inside(x + 2, y);
      cells.push({ x, y, l, rim, head: y < gh * NECK_ROW });
    }
  }
  return { cells, gw, gh };
}

export function startPortrait(wrap, canvas) {
  if (!wrap || !canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { cells, gw, gh } = parse();

  let W = 0, H = 0, dpr = 1, cellPx = 1;
  let layers = null;           // { body, head, rim } offscreen canvases
  let dots = [];               // per-particle animation state
  let assemble = reduce ? 1 : 0;
  let assembling = false;
  let raf = 0, alive = true;
  const S = { nx: 0, ny: 0, op: 1, dis: 0, headY: 0, bodyY: 0, pulse: 0 };
  let pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 };

  const isDesk = () => window.innerWidth >= 1024;

  function size() {
    const r = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    cellPx = Math.min(W / gw, H / gh);
    bake();
    // particle targets in canvas px
    const ox = (W - gw * cellPx) / 2, oy = H - gh * cellPx;
    dots = cells.map((c) => {
      const tx = ox + (c.x + 0.5 + (c.y % 2 ? 0.25 : -0.25)) * cellPx;
      const ty = oy + (c.y + 0.5) * cellPx;
      return {
        c, tx, ty,
        sx: tx - (180 + Math.random() * 520) - (gw - c.x) * cellPx * 0.6,
        sy: ty + (Math.random() - 0.5) * 220,
        d: (c.x / gw) * 0.55 + Math.random() * 0.25,
        drift: 0.4 + Math.random() * 0.8,
        wob: Math.random() * Math.PI * 2
      };
    });
  }

  function colorFor(l) {
    const t = Math.min(1, l * 1.05);
    return `rgb(${lerp(C_LOW[0], C_HIGH[0], t) | 0},${lerp(C_LOW[1], C_HIGH[1], t) | 0},${lerp(C_LOW[2], C_HIGH[2], t) | 0})`;
  }

  // Bake the settled portrait into three layers.
  function bake() {
    const mk = () => { const c = document.createElement("canvas"); c.width = canvas.width; c.height = canvas.height; return c; };
    layers = { body: mk(), head: mk(), rim: mk() };
    const ox = (W - gw * cellPx) / 2, oy = H - gh * cellPx;
    // navy silhouette base: drawn once, unfiltered, then blurred in a single pass
    const base = mk();
    {
      const b = base.getContext("2d");
      b.scale(dpr, dpr);
      b.fillStyle = "rgba(14,22,48,0.92)";
      for (const c of cells) b.fillRect(ox + c.x * cellPx - 0.5, oy + c.y * cellPx - 0.5, cellPx + 1, cellPx + 1);
    }
    {
      const g = layers.body.getContext("2d");
      try { g.filter = `blur(${Math.max(1, cellPx * 0.6 * dpr)}px)`; } catch { /* no filter support */ }
      g.drawImage(base, 0, 0);
      g.filter = "none";
    }
    // halftone dots, split into head and shoulder layers for 2.5D offsets
    for (const key of ["body", "head"]) {
      const g = layers[key].getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const c of cells) {
        if (c.head !== (key === "head") || c.l <= 0) continue;
        const r = cellPx * 0.6 * Math.sqrt(c.l);
        if (r < 0.35) continue;
        g.fillStyle = colorFor(c.l);
        g.beginPath();
        g.arc(ox + (c.x + 0.5 + (c.y % 2 ? 0.25 : -0.25)) * cellPx, oy + (c.y + 0.5) * cellPx, r, 0, Math.PI * 2);
        g.fill();
      }
    }
    // rim light: an accent edge with glow on the right of the silhouette
    const g = layers.rim.getContext("2d");
    g.scale(dpr, dpr);
    g.shadowColor = "rgba(60,200,255,0.9)";
    g.shadowBlur = cellPx * 3;
    g.fillStyle = "rgba(160,232,255,0.95)";
    for (const c of cells) {
      if (!c.rim) continue;
      g.fillRect(ox + (c.x + 0.55) * cellPx, oy + c.y * cellPx, Math.max(1.2, cellPx * 0.32), cellPx + 0.6);
    }
  }

  function drawBaked(alpha) {
    const hx = S.nx * 5, hy = S.ny * 2.5 + S.headY;
    const bx = S.nx * 1.5, by = S.bodyY;
    const rx = -S.nx * 3;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = alpha;
    ctx.drawImage(layers.body, bx * dpr, by * dpr);
    ctx.drawImage(layers.head, hx * dpr, hy * dpr);
    ctx.globalAlpha = alpha * (0.75 + 0.25 * S.pulse);
    ctx.drawImage(layers.rim, (bx + rx) * dpr, by * dpr);
    ctx.globalAlpha = 1;
  }

  // Individual particles for transitions: a = assemble progress, dis = dissolve
  function drawParticles(time, a, dis, alpha) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const p of dots) {
      if (p.c.l <= 0.04) continue;
      const k = easeOutExpo(clamp((a * 1.8 - p.d) / 1.0, 0, 1));
      let x = lerp(p.sx, p.tx, k), y = lerp(p.sy, p.ty, k);
      if (dis > 0) {
        const q = easeInOut(clamp(dis * 1.6 - p.d * 0.6, 0, 1));
        x -= q * (260 + p.drift * 520);
        y += Math.sin(p.wob + time * 1.4) * 18 * q - q * 40 * p.drift;
      }
      const head = p.c.head ? 1 : 0;
      x += S.nx * (head ? 5 : 1.5);
      y += head ? S.ny * 2.5 + S.headY : S.bodyY;
      const fade = dis > 0 ? 1 - easeInOut(clamp(dis * 1.4 - p.d * 0.3, 0, 1)) : 1;
      const r = Math.max(0.6, cellPx * 0.6 * Math.sqrt(p.c.l));
      ctx.globalAlpha = alpha * fade * (0.35 + 0.65 * k);
      ctx.fillStyle = colorFor(p.c.l);
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  /* ── Section-driven state (same model as the reference: a persistent,
        faded portrait that steps forward in the hero and contact) ───────── */
  const q = (s) => document.querySelector(s);
  function targets() {
    const vh = window.innerHeight, y = window.scrollY;
    const hero = q(".hero"), med = q("[data-medallion]"), proj = q("#projects"), contact = q("#contact");
    if (!hero) return { op: 1, dis: 0, h: 0 };
    const h = clamp(y / (hero.offsetHeight * 0.7), 0, 1);
    let dis = 0, projOut = 0, back = 0;
    if (med) {
      const r = med.getBoundingClientRect();
      const inn = clamp((vh * 0.95 - r.top) / (vh * 0.7), 0, 1);
      const out = clamp((vh * 0.35 - r.bottom) / (vh * 0.6), 0, 1);
      dis = inn * (1 - out);
    }
    if (proj) projOut = clamp((vh * 0.65 - proj.getBoundingClientRect().top) / (vh * 0.45), 0, 1);
    if (contact) back = clamp((vh * 0.85 - contact.getBoundingClientRect().top) / (vh * 0.55), 0, 1);
    const base = lerp(1, 0.16, h);
    const op = base * (1 - projOut) + back * 0.34;
    return { op, dis: back > 0 ? 0 : dis, h };
  }

  function frame(time) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const t = time / 1000;
    const desk = isDesk();

    // pointer: subtle head turn via layer offsets, clamped and smoothed
    const r = wrap.getBoundingClientRect();
    const nx = clamp((pointer.x - (r.left + r.width / 2)) / 600, -1, 1);
    const ny = clamp((pointer.y - (r.top + r.height * 0.32)) / 500, -1, 1);
    S.nx += ((desk ? nx : 0) - S.nx) * 0.06;
    S.ny += ((desk ? ny : 0) - S.ny) * 0.06;

    const tg = desk ? targets() : { op: 1, dis: 0, h: clamp(window.scrollY / (window.innerHeight * 0.6), 0, 1) };
    if (!desk) tg.op = 0.45 * (1 - tg.h);
    S.op += (tg.op - S.op) * 0.1;
    S.dis += (tg.dis - S.dis) * 0.08;
    S.headY += (-tg.h * 4.5 - S.headY) * 0.1;      // head rises faster than shoulders: depth
    S.bodyY += (-tg.h * 3 - S.bodyY) * 0.1;
    S.pulse += (Math.min(1, bus.pulse) - S.pulse) * 0.1;

    // hero stream sinks into the portrait's chest once assembled
    bus.laptop.x = r.left + r.width * 0.5;
    bus.laptop.y = r.top + r.height * 0.78;
    bus.laptop.active = desk && assemble >= 1 && tg.h < 0.3;
    bus.pulse *= 0.94;

    wrap.style.opacity = S.op < 0.01 ? "0" : "1";
    if (S.op < 0.01) return;
    if (assemble <= 0 && !assembling) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (assembling || (S.dis > 0.01 && S.dis < 0.995)) {
      drawParticles(t, assemble, S.dis, S.op);
    } else if (S.dis >= 0.995) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      drawBaked(S.op);
    }
  }

  function playAssemble() {
    if (reduce || assembling || assemble >= 1) return;
    assembling = true;
    const t0 = performance.now(), dur = 2100;
    const step = () => {
      if (!alive) return;
      assemble = clamp((performance.now() - t0) / dur, 0, 1);
      if (assemble < 1) requestAnimationFrame(step);
      else assembling = false;
    };
    requestAnimationFrame(step);
  }

  size();

  if (reduce) {
    wrap.classList.add("is-static");
    drawBaked(1);
    const onR = () => { size(); drawBaked(1); };
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }

  // Start hidden; assemble after the hero name has formed (or a fallback)
  assemble = 0;
  const onReady = () => setTimeout(playAssemble, 250);
  window.addEventListener("av:name-ready", onReady);
  const fallback = setTimeout(playAssemble, window.__avNameReady ? 150 : 4200);
  raf = requestAnimationFrame(frame);

  let rT;
  const onResize = () => { clearTimeout(rT); rT = setTimeout(size, 150); };
  const onMove = (e) => { pointer = { x: e.clientX, y: e.clientY }; };
  const onVis = () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("visibilitychange", onVis);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    clearTimeout(fallback);
    window.removeEventListener("av:name-ready", onReady);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", onVis);
    bus.laptop.active = false;
  };
}
