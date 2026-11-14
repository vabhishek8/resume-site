// Hero signature: a 2D canvas particle field that behaves like a medallion
// pipeline. On first load the particles assemble into the name, hand over to
// the real heading, then stream left to right: raw records (bronze) pass a
// quality gate where a few are rejected, get aligned into lanes (silver), and
// converge into gold streams that flow into the guide's laptop.
// No dependencies. Pauses off-screen / hidden tab. DPR capped at 2.
// Static frame for prefers-reduced-motion.

import { bus } from "./guideBus.js";

const COLORS = {
  bronze: [201, 137, 91],
  silver: [201, 211, 221],
  gold: [242, 181, 68],
  reject: [255, 84, 104],
  ink: [236, 234, 227]
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function startMedallionField(canvas, nameEl) {
  if (!canvas || !canvas.getContext) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1, particles = [], lanes = [], streams = [];
  let raf = 0, running = false, visible = true;
  const mouse = { x: -9999, y: -9999, active: false };
  let GATE_B = 0.24, GATE_S = 0.42, GATE_G = 0.6;

  // intro state
  let intro = null;          // { pts: [...], start }
  let flowAlpha = 1;

  function layout() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const narrow = W < 700;
    GATE_B = narrow ? 0.3 : 0.24;
    GATE_S = narrow ? 0.55 : 0.42;
    GATE_G = narrow ? 0.78 : 0.6;
    const laneCount = narrow ? 5 : 9;
    lanes = Array.from({ length: laneCount }, (_, i) => H * (0.18 + (0.64 * i) / (laneCount - 1)));
    const cy = H * 0.56;
    streams = [cy - H * 0.06, cy, cy + H * 0.06];

    const target = clamp(Math.round((W * H) / 5200), 70, narrow ? 110 : 320);
    particles = Array.from({ length: target }, () => spawn(true));
  }

  function spawn(anywhere) {
    return {
      x: anywhere ? Math.random() * W : -10 - Math.random() * W * 0.2,
      y: H * (0.08 + Math.random() * 0.84),
      vy: 0,
      speed: 0.55 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      size: 0.8 + Math.random() * 1.5,
      lane: Math.floor(Math.random() * lanes.length),
      stream: Math.floor(Math.random() * 3),
      reject: Math.random() < 0.07,
      rejected: false,
      life: 1,
      trail: []
    };
  }

  function sink() {
    if (!bus.laptop.active) return null;
    const r = canvas.getBoundingClientRect();
    const x = bus.laptop.x - r.left, y = bus.laptop.y - r.top;
    if (x < W * 0.62 || x > W + 40 || y < 0 || y > H) return null;
    return { x, y };
  }

  function step(t) {
    const sk = sink();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const u = p.x / W;
      const v = p.speed * (u < GATE_B ? 1 : u < GATE_S ? 1.25 : 1.6);
      p.x += v;

      if (p.rejected) {
        p.vy += 0.08; p.y += p.vy; p.x -= v * 0.6; p.life -= 0.02;
      } else if (u < GATE_B) {
        p.vy += Math.sin(t * 0.002 + p.phase) * 0.06 + (Math.random() - 0.5) * 0.18;
        p.vy *= 0.94; p.y += p.vy;
      } else if (u < GATE_S) {
        if (p.reject && u < GATE_B + 0.015) { p.rejected = true; continue; }
        p.y = lerp(p.y, lanes[p.lane], 0.035); p.vy *= 0.8;
      } else {
        const k = clamp((u - GATE_S) / (GATE_G - GATE_S), 0, 1);
        let ty = lerp(lanes[p.lane], streams[p.stream], k * k);
        if (sk && u >= GATE_G) {
          // gold stream bends into the laptop
          const kk = clamp((p.x - GATE_G * W) / Math.max(40, sk.x - GATE_G * W), 0, 1);
          ty = lerp(ty, sk.y, kk * kk);
          if (p.x >= sk.x - 4) {
            bus.pulse = Math.min(1, bus.pulse + 0.05);
            particles[i] = spawn(false);
            continue;
          }
        }
        p.y = lerp(p.y, ty, 0.08);
      }

      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) p.y += (dy / Math.sqrt(d2 + 0.01)) * (1 - d2 / 12000) * 2.2;
      }

      p.trail.push(p.x, p.y);
      if (p.trail.length > 16) p.trail.splice(0, 2);
      if (p.x > W + 20 || p.life <= 0 || p.y > H + 20) particles[i] = spawn(false);
    }
  }

  function colorFor(p) {
    if (p.rejected) return COLORS.reject;
    const u = p.x / W;
    if (u < GATE_B) return COLORS.bronze;
    if (u < GATE_S) return mix(COLORS.bronze, COLORS.silver, clamp((u - GATE_B) / 0.06, 0, 1));
    return mix(COLORS.silver, COLORS.gold, clamp((u - GATE_S) / 0.12, 0, 1));
  }

  function drawFlow() {
    [GATE_B, GATE_S, GATE_G].forEach((g, i) => {
      const x = g * W;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      const c = i === 0 ? COLORS.bronze : i === 1 ? COLORS.silver : COLORS.gold;
      grad.addColorStop(0, `rgba(${c},0)`);
      grad.addColorStop(0.5, `rgba(${c},${0.22 * flowAlpha})`);
      grad.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(x - 0.5, 0, 1, H);
    });

    ctx.lineCap = "round";
    for (const p of particles) {
      const c = colorFor(p);
      const a = (p.rejected ? p.life : 0.85) * flowAlpha;
      const tr = p.trail;
      if (tr.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(tr[0], tr[1]);
        for (let j = 2; j < tr.length; j += 2) ctx.lineTo(tr[j], tr[j + 1]);
        ctx.strokeStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a * 0.28})`;
        ctx.lineWidth = p.size * 0.9;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
      ctx.fill();
    }
  }

  /* ── Intro: particles assemble into the heading text ───────────────────── */
  function sampleName() {
    if (!nameEl) return [];
    const crect = canvas.getBoundingClientRect();
    const off = document.createElement("canvas");
    off.width = Math.ceil(W); off.height = Math.ceil(H);
    const o = off.getContext("2d");
    o.fillStyle = "#fff";
    o.textBaseline = "alphabetic";
    let fs = 0;
    nameEl.querySelectorAll(".line").forEach((line) => {
      const r = line.getBoundingClientRect();
      const inner = line.querySelector(".line-inner");
      const cs = getComputedStyle(inner);
      fs = parseFloat(cs.fontSize);
      o.font = `900 ${fs}px Archivo, "Arial Black", sans-serif`;
      try { o.fontStretch = "semi-expanded"; } catch { /* older engines */ }
      try { o.letterSpacing = `${-0.035 * fs}px`; } catch { /* older engines */ }
      const text = (inner.textContent || "").toUpperCase();
      // caps sit on the baseline; line box is ~0.82em tall
      o.fillText(text, r.left - crect.left, r.top - crect.top + fs * 0.74);
    });
    if (!fs) return [];
    const stepPx = Math.max(3, Math.round(fs / 26));
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const pts = [];
    for (let y = 0; y < off.height; y += stepPx) {
      for (let x = 0; x < off.width; x += stepPx) {
        if (data[(y * off.width + x) * 4 + 3] > 140) pts.push([x, y]);
      }
    }
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    return pts.slice(0, W < 700 ? 900 : 1800);
  }

  function startIntro(onReveal) {
    const pts = sampleName();
    if (!pts.length) { onReveal(); return; }
    intro = {
      start: performance.now(),
      revealed: false,
      onReveal,
      dots: pts.map(([tx, ty]) => ({
        sx: Math.random() < 0.6 ? -20 - Math.random() * 80 : Math.random() * W,
        sy: Math.random() * H,
        tx, ty,
        d: Math.random() * 0.45,
        c: mix(COLORS.bronze, COLORS.gold, Math.random())
      }))
    };
    flowAlpha = 0;
    start();
  }

  function drawIntro(now) {
    const e = (now - intro.start) / 1000;
    const ASSEMBLE = 1.15, HOLD = 0.35, RELEASE = 0.9;
    const all = ASSEMBLE + 0.45;
    if (!intro.revealed && e > all + HOLD * 0.4) {
      intro.revealed = true;
      intro.onReveal();
    }
    const rel = clamp((e - all - HOLD) / RELEASE, 0, 1);
    flowAlpha = rel;
    for (const d of intro.dots) {
      const k = easeOutExpo(clamp((e - d.d) / ASSEMBLE, 0, 1));
      let x = lerp(d.sx, d.tx, k), y = lerp(d.sy, d.ty, k);
      // release: drift right and fade as the real heading takes over
      x += rel * rel * 220;
      const a = (1 - rel) * (0.45 + 0.55 * k);
      const c = k > 0.98 ? mix(d.c, COLORS.ink, 0.6) : d.c;
      ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
      ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
    }
    if (rel >= 1) { intro = null; flowAlpha = 1; }
  }

  function frame(t) {
    if (!running) return;
    step(t);
    ctx.clearRect(0, 0, W, H);
    if (flowAlpha > 0) drawFlow();
    if (intro) drawIntro(performance.now());
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const warm = () => { for (let i = 0; i < 420; i++) step(i * 16); ctx.clearRect(0, 0, W, H); drawFlow(); };

  layout();
  if (reduce) warm(); else start();

  const onIntro = () => {
    if (reduce) { window.dispatchEvent(new Event("av:name-ready")); return; }
    const go = () => startIntro(() => window.dispatchEvent(new Event("av:name-ready")));
    const fontReady = document.fonts && document.fonts.load
      ? Promise.race([document.fonts.load('900 100px "Archivo"'), new Promise((r) => setTimeout(r, 1200))])
      : Promise.resolve();
    fontReady.then(go, go);
  };
  window.addEventListener("av:hero-intro", onIntro);

  let rT;
  const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { layout(); if (reduce) warm(); }, 150); };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    mouse.active = mouse.y > 0 && mouse.y < r.height;
  };
  const onLeave = () => { mouse.active = false; };
  const onVis = () => (document.hidden ? stop() : start());
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); });
  io.observe(canvas);

  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVis);

  return () => {
    stop();
    io.disconnect();
    window.removeEventListener("av:hero-intro", onIntro);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVis);
  };
}
