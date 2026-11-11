import { gsap } from "gsap";
import { bus } from "./guideBus.js";

// Rig for the illustrated guide. All motion is computed into a plain state
// object and written to SVG transform attributes once per frame, so there is
// no CSS-transform/SVG-origin ambiguity and nothing that needs inline script.

const POSES = {
  idle:   { aLU: -8,  aLF: -6,  aRU: 8,    aRF: 6,   lap: 0, pk: 0, cap: 0, wave: 0 },
  laptop: { aLU: -6,  aLF: -84, aRU: 6,    aRF: 84,  lap: 1, pk: 0, cap: 0, wave: 0 },
  carry:  { aLU: -10, aLF: -105, aRU: 10,  aRF: 105,  lap: 0, pk: 1, cap: 0, wave: 0 },
  think:  { aLU: -8,  aLF: -6,  aRU: -120, aRF: -55,  lap: 0, pk: 0, cap: 0, wave: 0 },
  point:  { aLU: 100, aLF: 12,  aRU: 10,   aRF: 12,  lap: 0, pk: 0, cap: 0, wave: 0 },
  cap:    { aLU: -8,  aLF: -6,  aRU: 8,    aRF: 6,   lap: 0, pk: 0, cap: 1, wave: 0 },
  wave:   { aLU: -8,  aLF: -6,  aRU: -152, aRF: -18, lap: 0, pk: 0, cap: 0, wave: 1 },
  cheer:  { aLU: 150, aLF: 22,  aRU: -150, aRF: -22, lap: 0, pk: 0, cap: 0, wave: 0 },
  walk:   { aLU: -6,  aLF: -10, aRU: 6,    aRF: 10,  lap: 0, pk: 0, cap: 0, wave: 0 }
};

const SECTIONS = [
  { sel: ".hero",            mode: "hero",       pose: "laptop", say: "Hi, I'm Abhishek." },
  { sel: "#about",           mode: "about",      pose: "idle",   say: "I build the layer under the dashboards." },
  { sel: "[data-medallion]", mode: "medallion",  pose: "carry",  say: "Hit run. I'll carry the data." },
  { sel: "#skills",          mode: "skills",     pose: "think",  say: "Gold dot means production." },
  { sel: "#experience",      mode: "experience", pose: "walk",   say: "Walking the timeline with you." },
  { sel: "#projects",        mode: "projects",   pose: "point",  say: "These pipelines run daily." },
  { sel: "#education",       mode: "education",  pose: "cap",    say: "The foundations." },
  { sel: "#contact",         mode: "contact",    pose: "wave",   say: "Let's build something." }
];
const FOOTER = { mode: "footer", pose: "wave", say: "Thanks for scrolling!" };

const MOUTH_SMILE = "M100 137 Q110 143 120 137 Q110 140 100 137 Z";
const MOUTH_OPEN = "M99 135 Q110 148 121 135 Q110 139 99 135 Z";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const shade = (hex, f) => {
  const [r, g, b] = hexToRgb(hex);
  const m = (c) => Math.round(clamp(c * f, 0, 255)).toString(16).padStart(2, "0");
  return `#${m(r)}${m(g)}${m(b)}`;
};

export const POSE_NAMES = Object.keys(POSES);

// Builds a renderer bound to one SVG. Exported so the static (reduced motion)
// pose and tests can draw a frame without the live loop.
export function makeRenderer(svg) {
  const $ = (k) => svg.querySelector(`[data-g="${k}"]`);
  const el = {
    root: $("root"), torso: $("torso"), head: $("head"),
    eyeL: $("eye-l"), eyeR: $("eye-r"), pupilL: $("pupil-l"), pupilR: $("pupil-r"),
    brows: $("brows"), mouth: $("mouth"), faceLight: $("face-light"),
    aLU: $("arm-l-u"), aLF: $("arm-l-f"), aRU: $("arm-r-u"), aRF: $("arm-r-f"),
    legL: $("leg-l"), legR: $("leg-r"),
    laptop: $("laptop"), laptopGlow: $("laptop-glow"),
    packet: $("packet"), pkTop: $("pk-top"), pkL: $("pk-left"), pkR: $("pk-right"),
    cap: $("cap"), tassel: $("tassel")
  };
  let packetHex = "";
  const setT = (node, v) => node && node.setAttribute("transform", v);
  return function draw(P, S, t) {
    // breathing, bob, walk cycle
    const breath = 1 + Math.sin(t * 2.2) * 0.012;
    const bob = Math.sin(t * 2.2) * 1.1;
    const w = S.walk;
    const legSwing = Math.sin(t * 9) * 24 * w;
    const walkBob = -Math.abs(Math.sin(t * 9)) * 3 * w;
    const wave = P.wave ? Math.sin(t * 11) * 24 * P.wave : 0;

    setT(el.root, `translate(0 ${(bob * 0.4 + walkBob + S.hop).toFixed(2)})`);
    setT(el.torso, `translate(110 250) scale(1 ${breath.toFixed(4)}) translate(-110 -250)`);
    setT(el.head, `translate(${S.headX.toFixed(2)} ${(bob * 0.6).toFixed(2)}) rotate(${S.headR.toFixed(2)} 110 150)`);
    setT(el.eyeL, `translate(91 98) scale(1 ${S.lid.toFixed(3)}) translate(-91 -98)`);
    setT(el.eyeR, `translate(129 98) scale(1 ${S.lid.toFixed(3)}) translate(-129 -98)`);
    setT(el.pupilL, `translate(${S.eyeX.toFixed(2)} ${S.eyeY.toFixed(2)})`);
    setT(el.pupilR, `translate(${S.eyeX.toFixed(2)} ${S.eyeY.toFixed(2)})`);
    setT(el.brows, `translate(0 ${S.brow.toFixed(2)})`);
    setT(el.aLU, `rotate(${(P.aLU - legSwing * 0.7).toFixed(2)})`);
    setT(el.aLF, `rotate(${P.aLF.toFixed(2)})`);
    setT(el.aRU, `rotate(${(P.aRU + legSwing * 0.7).toFixed(2)})`);
    setT(el.aRF, `rotate(${(P.aRF + wave).toFixed(2)})`);
    setT(el.legL, `rotate(${legSwing.toFixed(2)})`);
    setT(el.legR, `rotate(${(-legSwing).toFixed(2)})`);

    el.laptop.setAttribute("opacity", P.lap.toFixed(3));
    setT(el.laptop, `translate(110 200) scale(${(0.6 + 0.4 * P.lap).toFixed(3)})`);
    el.laptopGlow.setAttribute("opacity", (0.2 + bus.pulse * 0.7).toFixed(3));
    el.faceLight.setAttribute("opacity", (P.lap * (0.55 + bus.pulse * 0.45)).toFixed(3));
    el.packet.setAttribute("opacity", P.pk.toFixed(3));
    setT(el.packet, `translate(110 ${(172 + Math.sin(t * 3) * 2).toFixed(2)}) scale(${(0.5 + 0.8 * P.pk).toFixed(3)}) rotate(${(Math.sin(t * 1.5) * 6).toFixed(2)})`);
    el.cap.setAttribute("opacity", P.cap.toFixed(3));
    setT(el.cap, `translate(0 ${((1 - P.cap) * -26).toFixed(2)})`);
    setT(el.tassel, `rotate(${(Math.sin(t * 2.4) * 7).toFixed(2)} 110 32)`);

    if (bus.packet !== packetHex) {
      packetHex = bus.packet;
      el.pkTop.setAttribute("fill", shade(packetHex, 1.18));
      el.pkL.setAttribute("fill", packetHex);
      el.pkR.setAttribute("fill", shade(packetHex, 0.75));
    }
    el.mouth.setAttribute("d", S.open > 0.5 ? MOUTH_OPEN : MOUTH_SMILE);
  
  };
}

export function drawStaticPose(svg, name) {
  const draw = makeRenderer(svg);
  bus.packet = bus.packet || "#c9895b";
  draw({ ...POSES[name] }, { eyeX: 0, eyeY: 0, headR: 0, headX: 0, lid: 1, brow: 0, hop: 0, walk: 0, open: 0 }, 0);
}

export function startGuide(wrap) {
  if (!wrap) return () => {};
  const svg = wrap.querySelector("svg");
  const draw = makeRenderer(svg);
  const bubble = wrap.querySelector(".guide-bubble");
  const bubbleText = bubble.querySelector("span");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesk = () => window.innerWidth >= 1024;

  // Pose parameters (tweened) + live dynamics (per frame)
  const P = { ...POSES.laptop };
  const S = { x: 0, y: 0, s: 1, eyeX: 0, eyeY: 0, headR: 0, headX: 0, lid: 1, brow: 0, hop: 0, walk: 0, open: 0 };
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
      if (mode === "hero") {
        const s = 0.5;
        return { x: W - 220 * s - 8, y: 70, s };
      }
      const s = 0.34;
      return { x: W - 220 * s - 6, y: H - 312 * s - 8, s };
    }
    if (mode === "hero") {
      const s = clamp((H * 0.62) / 320, 0.85, 1.45);
      return { x: W * 0.8 - 110 * s, y: H * 0.88 - 306 * s, s };
    }
    if (mode === "experience") {
      const rail = document.querySelector(".tl-rail");
      const fill = document.querySelector("[data-tl-fill]");
      if (rail && fill) {
        const r = rail.getBoundingClientRect();
        const f = fill.getBoundingClientRect();
        const s = 0.4;
        const tip = clamp(f.bottom, H * 0.3, H * 0.9);
        return { x: r.left - 110 * s, y: tip - 300 * s, s };
      }
    }
    if (mode === "medallion") {
      // stand on the active node of the pipeline diagram, carrying the packet
      const n = document.querySelectorAll("[data-med-node]")[bus.medIndex || 0];
      if (n) {
        const r = n.getBoundingClientRect();
        if (r.width > 0 && r.top > 80 && r.top < H) {
          const s = 0.3;
          return { x: r.left + r.width / 2 - 110 * s, y: r.top - 18 - 300 * s, s };
        }
      }
    }
    const s = mode === "projects" ? 0.36 : 0.38;
    const y = mode === "projects" ? H * 0.58 - 160 * s : H - 312 * s - 10;
    return { x: W - 220 * s + (mode === "projects" ? 4 : -6), y, s };
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

  function setPose(name, dur = 0.7) {
    poseName = name;
    gsap.to(P, { ...POSES[name], duration: dur, ease: "back.out(1.4)", overwrite: true });
  }

  function hop(h = 10) {
    gsap.fromTo(S, { hop: 0 }, { hop: -h, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1, overwrite: "auto" });
  }

  function blink() {
    gsap.to(S, { lid: 0.08, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.in" });
    gsap.delayedCall(2.4 + Math.random() * 3.2, blink);
  }

  // Reactions available to other modules (pipeline runner, CTAs)
  bus.react = (kind) => {
    if (reduce) return;
    if (kind === "cheer") {
      override = "cheer";
      setPose("cheer", 0.45);
      hop(14);
      gsap.to(S, { open: 1, brow: -3, duration: 0.2 });
      say("Run complete. Bad rows quarantined.", 2600);
      gsap.delayedCall(1.6, () => {
        override = null;
        gsap.to(S, { open: 0, brow: 0, duration: 0.3 });
        setPose(currentSection().pose);
      });
    } else if (kind === "carry") {
      override = "carry";
      setPose("carry", 0.4);
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
    hop(6);
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
  const first = placement();
  Object.assign(S, first);
  let lastSec = null;
  let frame = 0;

  const tick = (time) => {
    const t = time;
    frame++;
    // section + velocity
    const sy = window.scrollY;
    vel = vel * 0.85 + (sy - lastScroll) * 0.15 * 60;
    lastScroll = sy;
    if (frame % 4 === 0) {
      const sec = currentSection();
      if (sec !== lastSec) { lastSec = sec; onSectionChange(sec); }
    }

    // placement (eased follow)
    const tgt = placement();
    const k = mode === "experience" ? 0.22 : 0.09;
    S.x += (tgt.x - S.x) * k;
    S.y += (tgt.y - S.y) * k;
    S.s += (tgt.s - S.s) * 0.09;
    wrap.style.setProperty("--s", S.s.toFixed(4));
    wrap.style.transform = `translate3d(${S.x.toFixed(1)}px, ${S.y.toFixed(1)}px, 0)`;
    wrap.classList.toggle("left-side", S.x + 110 * S.s < window.innerWidth / 2);
    const docked = mode !== "hero" && mode !== "experience" && mode !== "medallion";
    const fadeT = docked && Math.abs(vel) > 120 ? 0.35 : 1;
    S.fade = (S.fade ?? 1) + (fadeT - (S.fade ?? 1)) * 0.12;
    wrap.style.opacity = S.fade.toFixed(3);

    // walk when travelling along the timeline (or moving far)
    const travelling = Math.abs(tgt.y - S.y) > 30 || Math.abs(tgt.x - S.x) > 30;
    const walkTarget = mode === "experience" ? clamp(Math.abs(vel) / 500, 0, 1) : travelling ? 0.6 : 0;
    S.walk += (walkTarget - S.walk) * 0.1;

    // look-at: pointer, or a hovered CTA
    let tx = pointer.x, ty = pointer.y;
    if (focusEl) {
      const r = focusEl.getBoundingClientRect();
      tx = r.left + r.width / 2; ty = r.top + r.height / 2;
    }
    const hx = S.x + 110 * S.s, hy = S.y + 100 * S.s;
    const dx = tx - hx, dy = ty - hy;
    S.eyeX += (clamp(dx / 260, -1, 1) * 3.2 - S.eyeX) * 0.2;
    S.eyeY += (clamp(dy / 260, -1, 1) * 2.2 - S.eyeY) * 0.2;
    S.headR += (clamp(dx / 700, -1, 1) * 7 - S.headR) * 0.08;
    S.headX += (clamp(dx / 600, -1, 1) * 2 - S.headX) * 0.08;

    // laptop sink for the hero stream
    bus.laptop.x = S.x + 110 * S.s;
    bus.laptop.y = S.y + 186 * S.s;
    bus.laptop.active = mode === "hero" && P.lap > 0.6;
    bus.pulse *= 0.94;

    render(t);
  };
  gsap.ticker.add(tick);
  gsap.delayedCall(2, blink);

  // Greeting: wave once the hero name has assembled (or after a fallback)
  const greet = () => {
    if (introDone) return;
    introDone = true;
    setPose("wave", 0.5);
    say("Hi, I'm Abhishek.", 2600);
    gsap.delayedCall(1.9, () => { if (!override && mode === "hero") setPose("laptop"); else if (!override) setPose(currentSection().pose); });
  };
  window.addEventListener("av:name-ready", greet);
  const greetFallback = gsap.delayedCall(4.5, greet);

  const onMove = (e) => { pointer = { x: e.clientX, y: e.clientY }; };
  const onOver = (e) => {
    const b = e.target.closest && e.target.closest(".btn, [data-magnetic]");
    if (b === focusEl) return;
    focusEl = b;
    if (b) {
      gsap.to(S, { brow: -3.5, open: 1, duration: 0.2 });
      hop(9);
    } else {
      gsap.to(S, { brow: 0, open: 0, duration: 0.3 });
    }
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerover", onOver);

  return () => {
    gsap.ticker.remove(tick);
    greetFallback.kill();
    gsap.killTweensOf(S); gsap.killTweensOf(P);
    gsap.killTweensOf(blink);
    window.removeEventListener("av:name-ready", greet);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    clearTimeout(bubbleTimer);
    bus.react = null;
    bus.laptop.active = false;
  };
}
