import { gsap } from "gsap";
import { bus } from "./guideBus.js";

// Rig for the illustrated guide (waist-up, 3/4 view, viewBox 240x300).
// Pose parameters are tweened with eased GSAP tweens (no linear motion);
// per-frame secondary motion (breathing, blink, look-at, hair lag, lean,
// squash and stretch) is layered on top and written to SVG transform
// attributes once per frame. No inline script, no CSS-transform/SVG-origin
// ambiguity: every rotation names its pivot explicitly.

// Angles in degrees; 0 = arm hanging straight down. hL/hR: 0 fist, 1 open, 2 point.
const POSES = {
  idle:   { aLU: 4,   aLF: 6,    aRU: -4,   aRF: -6,  hL: 0, hR: 0, lap: 0, pk: 0, cap: 0, wave: 0 },
  laptop: { aLU: 26,  aLF: -100, aRU: -26,  aRF: 100,  hL: 0, hR: 0, lap: 1, pk: 0, cap: 0, wave: 0 },
  carry:  { aLU: -6,  aLF: -142, aRU: 6,    aRF: 142, hL: 0, hR: 0, lap: 0, pk: 1, cap: 0, wave: 0 },
  think:  { aLU: 4,   aLF: 6,    aRU: -136, aRF: -84, hL: 0, hR: 2, lap: 0, pk: 0, cap: 0, wave: 0 },
  point:  { aLU: 78,  aLF: 16,   aRU: -4,   aRF: -6,  hL: 2, hR: 0, lap: 0, pk: 0, cap: 0, wave: 0 },
  cap:    { aLU: 4,   aLF: 6,    aRU: -4,   aRF: -6,  hL: 0, hR: 0, lap: 0, pk: 0, cap: 1, wave: 0 },
  wave:   { aLU: 4,   aLF: 6,    aRU: -148, aRF: -26, hL: 0, hR: 1, lap: 0, pk: 0, cap: 0, wave: 1 },
  cheer:  { aLU: 148, aLF: 22,   aRU: -148, aRF: -22, hL: 1, hR: 1, lap: 0, pk: 0, cap: 0, wave: 0 },
  glide:  { aLU: 8,   aLF: 10,   aRU: -8,   aRF: -10, hL: 0, hR: 0, lap: 0, pk: 0, cap: 0, wave: 0 }
};

const SECTIONS = [
  { sel: ".hero",            mode: "hero",       pose: "laptop", say: "Hi, I'm Abhishek." },
  { sel: "#about",           mode: "about",      pose: "idle",   say: "I build the layer under the dashboards." },
  { sel: "[data-medallion]", mode: "medallion",  pose: "carry",  say: "Hit run. I'll carry the data." },
  { sel: "#skills",          mode: "skills",     pose: "think",  say: "Gold dot means production." },
  { sel: "#experience",      mode: "experience", pose: "glide",  say: "Following the timeline with you." },
  { sel: "#projects",        mode: "projects",   pose: "point",  say: "These pipelines run daily." },
  { sel: "#education",       mode: "education",  pose: "cap",    say: "The foundations." },
  { sel: "#contact",         mode: "contact",    pose: "wave",   say: "Let's build something." }
];
const FOOTER = { mode: "footer", pose: "wave", say: "Thanks for scrolling!" };

const MOUTH_SMILE = "M108 133 C113 136 120 136 125 132 C121 138 112 139 108 133 Z";
const MOUTH_OPEN = "M107 132 C113 135 121 135 126 131 C123 141 111 142 107 132 Z";

// Box is the SVG viewBox (-80 -40 400 340); the figure itself spans x 0..240, y 0..300.
const OX = 80, OY = 40;
const VB_W = 400, VB_H = 340, CX = 124;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const shade = (hex, f) => {
  const [r, g, b] = hexToRgb(hex);
  const m = (c) => Math.round(clamp(c * f, 0, 255)).toString(16).padStart(2, "0");
  return `#${m(r)}${m(g)}${m(b)}`;
};

export const POSE_NAMES = Object.keys(POSES);

// Renderer bound to one SVG; also used for the static (reduced motion) frame.
export function makeRenderer(svg) {
  const $ = (k) => svg.querySelector(`[data-g="${k}"]`);
  const el = {
    root: $("root"), torso: $("torso"), head: $("head"), features: $("features"), hair: $("hair"),
    eyeL: $("eye-l"), eyeR: $("eye-r"), pupilL: $("pupil-l"), pupilR: $("pupil-r"),
    brows: $("brows"), mouth: $("mouth"),
    aLU: $("arm-l-u"), aLF: $("arm-l-f"), aRU: $("arm-r-u"), aRF: $("arm-r-f"),
    hand: {
      l: [$("hand-l-fist"), $("hand-l-open"), $("hand-l-point")],
      r: [$("hand-r-fist"), $("hand-r-open"), $("hand-r-point")]
    },
    laptop: $("laptop"), laptopGlow: $("laptop-glow"),
    packet: $("packet"), pkTop: $("pk-top"), pkL: $("pk-left"), pkR: $("pk-right"),
    cap: $("cap"), tassel: $("tassel")
  };
  let packetHex = "";
  let mouthOpen = null;
  const setT = (node, v) => node && node.setAttribute("transform", v);
  const setHand = (list, v) => list.forEach((n, i) => n && n.setAttribute("opacity", clamp(1 - Math.abs(v - i), 0, 1).toFixed(2)));

  return function draw(P, S, t) {
    const breath = Math.sin(t * 1.9);                 // ~0.3 Hz chest rise
    const chest = 1 + breath * 0.004;                 // ~0.6px at chest height
    const lift = breath * 0.7;                        // head/arms ride the breath
    const sq = S.sq;                                  // squash & stretch, volume-preserving
    const sx = 1 / Math.sqrt(sq);
    const wave = P.wave ? Math.sin(t * 9.5) * 18 * P.wave : 0;

    setT(el.root, `translate(${CX} 300) rotate(${S.lean.toFixed(2)}) scale(${sx.toFixed(4)} ${sq.toFixed(4)}) translate(${-CX} ${(-300 + S.hop).toFixed(2)})`);
    setT(el.torso, `translate(0 300) scale(1 ${chest.toFixed(4)}) translate(0 -300)`);
    setT(el.head, `translate(0 ${(-lift).toFixed(2)}) rotate(${S.headR.toFixed(2)} ${CX} 150)`);
    setT(el.features, `translate(${S.headX.toFixed(2)} ${(S.headY * 0.6).toFixed(2)})`);
    setT(el.hair, `translate(${(S.headX * 0.35).toFixed(2)} 0) rotate(${(S.hairLag).toFixed(2)} ${CX} 92)`);
    setT(el.eyeR, `translate(137 94) scale(1 ${S.lid.toFixed(3)}) translate(-137 -94)`);
    setT(el.eyeL, `translate(106 93) scale(1 ${S.lid.toFixed(3)}) translate(-106 -93)`);
    setT(el.pupilR, `translate(${S.eyeX.toFixed(2)} ${S.eyeY.toFixed(2)})`);
    setT(el.pupilL, `translate(${(S.eyeX * 0.85).toFixed(2)} ${S.eyeY.toFixed(2)})`);
    setT(el.brows, `translate(0 ${S.brow.toFixed(2)})`);

    setT(el.aLU, `translate(0 ${(-lift * 0.6).toFixed(2)}) rotate(${P.aLU.toFixed(2)})`);
    setT(el.aLF, `rotate(${P.aLF.toFixed(2)})`);
    setT(el.aRU, `translate(0 ${(-lift * 0.6).toFixed(2)}) rotate(${P.aRU.toFixed(2)})`);
    setT(el.aRF, `rotate(${(P.aRF + wave).toFixed(2)})`);
    setHand(el.hand.l, P.hL);
    setHand(el.hand.r, P.hR);

    el.laptop.setAttribute("opacity", P.lap.toFixed(3));
    setT(el.laptop, `translate(125 ${(252 + (1 - P.lap) * 24 - lift * 0.5).toFixed(2)}) scale(${(0.7 + 0.3 * P.lap).toFixed(3)})`);
    el.laptopGlow.setAttribute("opacity", (0.22 + bus.pulse * 0.7).toFixed(3));
    el.packet.setAttribute("opacity", P.pk.toFixed(3));
    setT(el.packet, `translate(125 ${(180 + Math.sin(t * 2.6) * 1.6).toFixed(2)}) scale(${(0.55 + 0.6 * P.pk).toFixed(3)}) rotate(${(Math.sin(t * 1.3) * 5).toFixed(2)})`);
    el.cap.setAttribute("opacity", P.cap.toFixed(3));
    setT(el.cap, `translate(0 ${((1 - P.cap) * -30).toFixed(2)}) rotate(${((1 - P.cap) * -8).toFixed(2)} 126 20)`);
    setT(el.tassel, `rotate(${(Math.sin(t * 2.1) * 6 - S.headR * 0.8).toFixed(2)} 126 20)`);

    if (bus.packet !== packetHex) {
      packetHex = bus.packet;
      el.pkTop.setAttribute("fill", shade(packetHex, 1.18));
      el.pkL.setAttribute("fill", packetHex);
      el.pkR.setAttribute("fill", shade(packetHex, 0.75));
    }
    const open = S.open > 0.5;
    if (open !== mouthOpen) { mouthOpen = open; el.mouth.setAttribute("d", open ? MOUTH_OPEN : MOUTH_SMILE); }
  };
}

const NEUTRAL = { eyeX: 0, eyeY: 0, headR: -2, headX: 0, headY: 0, hairLag: 0, lid: 1, brow: 0, hop: 0, sq: 1, lean: 0, open: 0 };

export function drawStaticPose(svg, name) {
  bus.packet = bus.packet || "#c9895b";
  makeRenderer(svg)({ ...POSES[name] }, { ...NEUTRAL }, 0);
}

export function startGuide(wrap) {
  if (!wrap) return () => {};
  const svg = wrap.querySelector("svg");
  const draw = makeRenderer(svg);
  const bubble = wrap.querySelector(".guide-bubble");
  const bubbleText = bubble.querySelector("span");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesk = () => window.innerWidth >= 1024;

  const P = { ...POSES.laptop };
  const S = { x: 0, y: 0, s: 1, fade: 1, ...NEUTRAL, hairV: 0 };
  let pointer = { x: window.innerWidth * 0.4, y: window.innerHeight * 0.4 };
  let focusEl = null;
  let mode = "hero";
  let poseName = "laptop";
  let override = null;
  let lastScroll = window.scrollY;
  let vel = 0;
  let introDone = false;
  let bubbleTimer = 0;

  function placement() {
    const W = window.innerWidth, H = window.innerHeight;
    if (!isDesk()) {
      if (mode === "hero") { const s = 0.5; return { x: W - (240 + OX) * s - 6, y: 66 - OY * s, s }; }
      const s = 0.36;
      return { x: W - (240 + OX) * s - 2, y: H - (300 + OY) * s + 2, s };
    }
    if (mode === "hero") {
      const s = clamp((H * 0.62) / VB_H, 0.95, 1.7);
      return { x: W * 0.8 - (CX + OX) * s, y: H - 74 - (300 + OY) * s, s };
    }
    if (mode === "experience") {
      const rail = document.querySelector(".tl-rail");
      const fill = document.querySelector("[data-tl-fill]");
      if (rail && fill) {
        const r = rail.getBoundingClientRect();
        const f = fill.getBoundingClientRect();
        const s = 0.34;
        const tip = clamp(f.bottom, H * 0.3, H * 0.86);
        return { x: r.left - (CX + OX) * s, y: tip - (150 + OY) * s, s };
      }
    }
    if (mode === "medallion") {
      const n = document.querySelectorAll("[data-med-node]")[bus.medIndex || 0];
      if (n) {
        const r = n.getBoundingClientRect();
        if (r.width > 0 && r.top > 80 && r.top < H) {
          const s = 0.3;
          return { x: r.left + r.width / 2 - (CX + OX) * s, y: r.top - 12 - (300 + OY) * s, s };
        }
      }
    }
    const s = 0.44;
    return { x: W - (240 + OX) * s + 6, y: H - (300 + OY) * s + 4, s };
  }

  function say(text, ms = 3200) {
    if (reduce || !text) return;
    bubbleText.textContent = text;
    bubble.classList.remove("show");
    void bubble.offsetWidth;
    bubble.classList.add("show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove("show"), ms);
  }

  // Pose-to-pose with anticipation (squash), overshoot (back ease) and
  // overlapping action (forearms and hands settle after the upper arms).
  function setPose(name, dur = 0.65) {
    poseName = name;
    const tgt = POSES[name];
    const upper = { aLU: tgt.aLU, aRU: tgt.aRU, lap: tgt.lap, pk: tgt.pk, cap: tgt.cap, wave: tgt.wave };
    const lower = { aLF: tgt.aLF, aRF: tgt.aRF, hL: tgt.hL, hR: tgt.hR };
    gsap.to(P, { ...upper, duration: dur, ease: "back.out(1.5)", overwrite: "auto" });
    gsap.to(P, { ...lower, duration: dur * 1.1, delay: dur * 0.12, ease: "back.out(2)", overwrite: "auto" });
    pop();
  }

  function pop(strength = 1) {
    gsap.timeline()
      .to(S, { sq: 1 - 0.035 * strength, duration: 0.11, ease: "power2.in" })
      .to(S, { sq: 1 + 0.03 * strength, hop: -5 * strength, duration: 0.16, ease: "power2.out" })
      .to(S, { sq: 1, hop: 0, duration: 0.42, ease: "back.out(2.2)" });
  }

  let blinkCall = null;
  function blink() {
    const twice = Math.random() < 0.2;
    const tl = gsap.timeline();
    tl.to(S, { lid: 0.06, duration: 0.06, ease: "power2.in" }).to(S, { lid: 1, duration: 0.11, ease: "power2.out" });
    if (twice) tl.to(S, { lid: 0.06, duration: 0.06, ease: "power2.in", delay: 0.08 }).to(S, { lid: 1, duration: 0.11, ease: "power2.out" });
    blinkCall = gsap.delayedCall(2 + Math.random() * 4, blink);
  }

  bus.react = (kind) => {
    if (reduce) return;
    if (kind === "cheer") {
      override = "cheer";
      setPose("cheer", 0.5);
      pop(1.6);
      gsap.to(S, { open: 1, brow: -2.5, duration: 0.2, ease: "power2.out" });
      say("Run complete. Bad rows quarantined.", 2600);
      gsap.delayedCall(1.7, () => {
        override = null;
        gsap.to(S, { open: 0, brow: 0, duration: 0.35, ease: "power2.out" });
        setPose(currentSection().pose);
      });
    } else if (kind === "carry") {
      override = "carry";
      setPose("carry", 0.45);
    } else if (kind === "release") {
      override = null;
      setPose(currentSection().pose);
    }
  };

  function currentSection() {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 30) return FOOTER;
    const line = window.innerHeight * 0.55;
    let found = SECTIONS[0];
    for (const sec of SECTIONS) {
      const n = document.querySelector(sec.sel);
      if (n && n.getBoundingClientRect().top <= line) found = sec;
    }
    return found;
  }

  function onSectionChange(sec) {
    mode = sec.mode;
    if (override) return;
    if (sec.pose !== poseName) setPose(sec.pose);
    if (introDone) say(sec.say);
  }

  const render = (t) => draw(P, S, t);

  /* ── Reduced motion: one static, friendly frame in the hero ───────────── */
  if (reduce) {
    wrap.classList.add("is-static");
    const place = () => {
      mode = "hero";
      const p = placement();
      wrap.style.setProperty("--s", p.s);
      wrap.style.transform = `translate(${p.x}px, ${p.y + window.scrollY}px)`;
    };
    place();
    render(0);
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }

  /* ── Live loop ─────────────────────────────────────────────────────────── */
  Object.assign(S, placement());
  let lastSec = null;
  let frame = 0;
  let prevHeadR = S.headR;

  const tick = (time) => {
    frame++;
    const sy = window.scrollY;
    vel = vel * 0.85 + (sy - lastScroll) * 0.15 * 60;
    lastScroll = sy;
    if (frame % 4 === 0) {
      const sec = currentSection();
      if (sec !== lastSec) { lastSec = sec; onSectionChange(sec); }
    }

    // placement: damped follow, with a lean into the direction of travel
    const tgt = placement();
    const k = mode === "experience" || mode === "medallion" ? 0.16 : 0.085;
    const dx = (tgt.x - S.x) * k, dy = (tgt.y - S.y) * k;
    S.x += dx; S.y += dy;
    S.s += (tgt.s - S.s) * 0.085;
    const travel = clamp(dx * 0.35 + (mode === "experience" ? vel * 0.004 : 0), -7, 7);
    S.lean += (travel - S.lean) * 0.12;
    wrap.style.setProperty("--s", S.s.toFixed(4));
    wrap.style.transform = `translate3d(${S.x.toFixed(1)}px, ${S.y.toFixed(1)}px, 0)`;
    wrap.classList.toggle("left-side", S.x + (CX + OX) * S.s < window.innerWidth / 2);
    const docked = mode !== "hero" && mode !== "experience" && mode !== "medallion";
    const fadeT = docked && Math.abs(vel) > 120 ? 0.35 : 1;
    S.fade += (fadeT - S.fade) * 0.12;
    wrap.style.opacity = S.fade.toFixed(3);

    // look-at (pointer or hovered CTA), clamped and smoothed
    let tx = pointer.x, ty = pointer.y;
    if (focusEl) { const r = focusEl.getBoundingClientRect(); tx = r.left + r.width / 2; ty = r.top + r.height / 2; }
    const hx = S.x + (CX + OX) * S.s, hy = S.y + (95 + OY) * S.s;
    const nx = clamp((tx - hx) / 420, -1, 1), ny = clamp((ty - hy) / 360, -1, 1);
    S.eyeX += (nx * 2.4 - S.eyeX) * 0.18;
    S.eyeY += (ny * 1.6 - S.eyeY) * 0.18;
    S.headR += (nx * 5 - 2 - S.headR) * 0.06;
    S.headX += (nx * 2.6 - S.headX) * 0.07;
    S.headY += (ny * 1.6 - S.headY) * 0.07;

    // hair: spring that lags the head (overlapping action)
    const dHead = S.headR - prevHeadR;
    prevHeadR = S.headR;
    S.hairV += (-dHead * 1.8 - S.hairLag) * 0.12;
    S.hairV *= 0.8;
    S.hairLag += S.hairV;

    bus.laptop.x = S.x + (125 + OX) * S.s;
    bus.laptop.y = S.y + (236 + OY) * S.s;
    bus.laptop.active = mode === "hero" && P.lap > 0.6;
    bus.pulse *= 0.94;

    render(time);
  };
  gsap.ticker.add(tick);
  blinkCall = gsap.delayedCall(1.6, blink);

  const greet = () => {
    if (introDone) return;
    introDone = true;
    setPose("wave", 0.55);
    say("Hi, I'm Abhishek.", 2600);
    gsap.delayedCall(2, () => { if (!override) setPose(currentSection().pose); });
  };
  window.addEventListener("av:name-ready", greet);
  const greetFallback = gsap.delayedCall(4.5, greet);

  const onMove = (e) => { pointer = { x: e.clientX, y: e.clientY }; };
  const onOver = (e) => {
    const b = e.target.closest && e.target.closest(".btn, [data-magnetic]");
    if (b === focusEl) return;
    focusEl = b;
    if (b) {
      gsap.to(S, { brow: -2.5, open: 1, duration: 0.22, ease: "power2.out" });
      pop(0.7);
    } else {
      gsap.to(S, { brow: 0, open: 0, duration: 0.35, ease: "power2.out" });
    }
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerover", onOver);

  return () => {
    gsap.ticker.remove(tick);
    greetFallback.kill();
    if (blinkCall) blinkCall.kill();
    gsap.killTweensOf(S); gsap.killTweensOf(P);
    window.removeEventListener("av:name-ready", greet);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    clearTimeout(bubbleTimer);
    bus.react = null;
    bus.laptop.active = false;
  };
}
