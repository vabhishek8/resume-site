// Hero signature: a 2D canvas particle field that behaves like a medallion
// pipeline. Particles enter left as noisy "raw" records (bronze), pass a
// quality gate where a few are rejected (they flash red and drop out), get
// aligned into lanes (silver), then converge into tight gold streams.
// No dependencies. Pauses off-screen / hidden tab. Static frame for
// prefers-reduced-motion.

const COLORS = {
  bronze: [201, 137, 91],
  silver: [201, 211, 221],
  gold: [242, 181, 68],
  reject: [255, 84, 104],
  accent: [60, 200, 255]
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

export function startMedallionField(canvas) {
  if (!canvas || !canvas.getContext) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1, particles = [], lanes = [], streams = [];
  let raf = 0, running = false, visible = true;
  const mouse = { x: -9999, y: -9999, active: false };

  const GATE_B = 0.3333, GATE_S = 0.58, GATE_G = 0.80;

  function layout() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const laneCount = W < 700 ? 5 : 9;
    lanes = Array.from({ length: laneCount }, (_, i) => H * (0.18 + (0.64 * i) / (laneCount - 1)));
    const cy = H * 0.56;
    streams = [cy - H * 0.07, cy, cy + H * 0.07];

    const target = clamp(Math.round((W * H) / 5200), 70, W < 700 ? 110 : 340);
    particles = Array.from({ length: target }, () => spawn(true));
  }

  function spawn(anywhere) {
    const y = H * (0.08 + Math.random() * 0.84);
    return {
      x: anywhere ? Math.random() * W : -10 - Math.random() * W * 0.2,
      y,
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

  function step(t) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const u = p.x / W;
      // speed ramps up as data gets cleaner
      const v = p.speed * (u < GATE_B ? 1 : u < GATE_S ? 1.25 : 1.6);
      p.x += v;

      if (p.rejected) {
        p.vy += 0.08;
        p.y += p.vy;
        p.x -= v * 0.6;
        p.life -= 0.02;
      } else if (u < GATE_B) {
        // raw: noisy brownian wander
        p.vy += (Math.sin(t * 0.002 + p.phase) * 0.06) + (Math.random() - 0.5) * 0.18;
        p.vy *= 0.94;
        p.y += p.vy;
      } else if (u < GATE_S) {
        if (p.reject && u < GATE_B + 0.015) { p.rejected = true; continue; }
        const ty = lanes[p.lane];
        p.y = lerp(p.y, ty, 0.035);
        p.vy *= 0.8;
      } else {
        const k = clamp((u - GATE_S) / (GATE_G - GATE_S), 0, 1);
        const ty = lerp(lanes[p.lane], streams[p.stream], k * k);
        p.y = lerp(p.y, ty, 0.08);
      }

      // pointer: records part around the cursor
      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const f = (1 - d2 / 12000) * 2.2;
          p.y += (dy / Math.sqrt(d2 + 0.01)) * f;
        }
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

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // gates
    [GATE_B, GATE_S, GATE_G].forEach((g, i) => {
      const x = g * W;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      const c = i === 0 ? COLORS.bronze : i === 1 ? COLORS.silver : COLORS.gold;
      grad.addColorStop(0, `rgba(${c},0)`);
      grad.addColorStop(0.5, `rgba(${c},0.22)`);
      grad.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(x - 0.5, 0, 1, H);
    });

    ctx.lineCap = "round";
    for (const p of particles) {
      const c = colorFor(p);
      const a = p.rejected ? p.life : 0.85;
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

    // gold sink glow
    const gx = W * 0.97, gy = streams[1];
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, H * 0.28);
    g.addColorStop(0, "rgba(242,181,68,0.16)");
    g.addColorStop(1, "rgba(242,181,68,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function frame(t) {
    if (!running) return;
    step(t);
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  layout();
  if (reduce) {
    for (let i = 0; i < 420; i++) step(i * 16);
    draw();
  } else {
    start();
  }

  let rT;
  const onResize = () => {
    clearTimeout(rT);
    rT = setTimeout(() => { layout(); if (reduce) { for (let i = 0; i < 420; i++) step(i * 16); draw(); } }, 150);
  };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = mouse.y > 0 && mouse.y < r.height;
  };
  const onLeave = () => { mouse.active = false; };
  const onVis = () => (document.hidden ? stop() : start());

  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    visible ? start() : stop();
  });
  io.observe(canvas);

  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVis);

  return () => {
    stop();
    io.disconnect();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVis);
  };
}
