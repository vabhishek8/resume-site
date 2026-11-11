import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { bus } from "../lib/guideBus.js";
import { initRunPipeline } from "../lib/runPipeline.js";

gsap.registerPlugin(ScrollTrigger);

const SEEN_KEY = "av-preloaded";

function seenPreloader() {
  try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; }
}
function markPreloaded() {
  try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage unavailable: fine */ }
}

// All page choreography lives here. Everything is additive: if this hook never
// runs, CSS leaves every element visible (animation states are gated on the
// `html.anim` class, which is only set when motion is allowed).
export function useSiteEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups = [];

    root.classList.toggle("reduce-motion", reduce);
    if (!reduce) root.classList.add("anim");

    const ctx = gsap.context(() => {
      /* ── Preloader + hero intro ───────────────────────────────────────── */
      const heroIntro = () => {
        root.classList.add("is-loaded");
        const name = document.querySelector("[data-hero-name]");
        let shown = false;
        const showName = () => {
          if (shown) return;
          shown = true;
          window.__avNameReady = true;
          if (name) name.classList.add("name-in");
          if (!reduce) {
            gsap.to("[data-hero]", { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: "expo.out", delay: 0.15 });
          }
        };
        window.addEventListener("av:name-ready", showName, { once: true });
        gsap.delayedCall(3.6, showName);
        window.dispatchEvent(new Event("av:hero-intro"));
      };

      const pre = document.querySelector(".preloader");
      if (pre && !reduce && !seenPreloader()) {
        const counter = pre.querySelector("[data-pre-count]");
        const obj = { v: 0 };
        const tl = gsap.timeline({ onComplete: () => { markPreloaded(); pre.remove(); } });
        tl.from(pre.querySelectorAll(".pre-line"), { opacity: 0, x: -12, stagger: 0.18, duration: 0.35 }, 0)
          .to(pre.querySelector(".pre-bar span"), { scaleX: 1, duration: 0.95, ease: "power2.inOut" }, 0)
          .to(obj, {
            v: 100, duration: 0.95, ease: "power2.inOut",
            onUpdate: () => { if (counter) counter.textContent = String(Math.round(obj.v)).padStart(3, "0"); }
          }, 0)
          .to(pre, { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, 1.05)
          .add(heroIntro, 1.25);
      } else {
        if (pre) pre.remove();
        heroIntro();
      }

      if (reduce) return;

      /* ── Generic reveals ─────────────────────────────────────────────── */
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 })
      });

      // Kinetic headings: a colour wipe sweeps across, characters flip up behind it
      gsap.utils.toArray("[data-split]").forEach((h) => {
        const chars = h.querySelectorAll(".ch");
        const wipe = h.querySelector(".wipe");
        const tl = gsap.timeline({ scrollTrigger: { trigger: h, start: "top 85%", once: true } });
        if (wipe) {
          tl.fromTo(wipe, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.45, ease: "expo.inOut" }, 0)
            .set(wipe, { transformOrigin: "100% 50%" }, 0.45)
            .to(wipe, { scaleX: 0, duration: 0.5, ease: "expo.inOut" }, 0.45);
        }
        tl.fromTo(chars,
          { yPercent: 115, rotateX: -85, opacity: 0 },
          { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: { each: 0.018 } },
          0.3);
      });

      /* ── Counters ─────────────────────────────────────────────────────── */
      gsap.utils.toArray("[data-count-to]").forEach((el) => {
        const to = Number(el.dataset.countTo);
        const pre = el.dataset.prefix || "";
        const suf = el.dataset.suffix || "";
        const o = { v: 0 };
        el.textContent = pre + "0" + suf;
        gsap.to(o, {
          v: to, duration: 1.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; }
        });
      });

      /* ── Skill meters ─────────────────────────────────────────────────── */
      gsap.utils.toArray(".skill-group").forEach((g) => {
        ScrollTrigger.create({ trigger: g, start: "top 80%", once: true, onEnter: () => g.classList.add("in") });
      });

      /* ── Scroll progress ──────────────────────────────────────────────── */
      gsap.to(".sp-fill", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 }
      });

      /* ── Timeline draws on scroll ─────────────────────────────────────── */
      const tl = document.querySelector("[data-timeline]");
      if (tl) {
        gsap.to("[data-tl-fill]", {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: tl, start: "top 70%", end: "bottom 60%", scrub: 0.4 }
        });
        gsap.utils.toArray(".tl-item").forEach((it) => {
          ScrollTrigger.create({ trigger: it, start: "top 65%", onEnter: () => it.classList.add("lit"), onLeaveBack: () => it.classList.remove("lit") });
        });
      }

      /* ── Responsive-only choreography ─────────────────────────────────── */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 900px)", () => {
        // Medallion: pin + scrub the walkthrough
        const sec = document.querySelector("[data-medallion]");
        if (!sec) return;
        const path = sec.querySelector("[data-med-path]");
        const nodes = sec.querySelectorAll("[data-med-node]");
        const steps = sec.querySelectorAll("[data-med-step]");
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        sec.classList.add("is-pinned");
        let last = -1;
        const setActive = (idx) => {
          if (idx === last) return;
          last = idx;
          nodes.forEach((n, i) => { n.classList.toggle("on", i <= idx); n.classList.toggle("current", i === idx); });
          steps.forEach((s, i) => s.classList.toggle("current", i === idx));
          bus.packet = ["#8b93a3", "#c9895b", "#c9d3dd", "#f2b544", "#3cc8ff"][idx] || "#c9895b";
          bus.medIndex = idx;
        };
        setActive(0);
        ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          end: "+=260%",
          pin: sec.querySelector(".med-pin"),
          scrub: 0.4,
          onUpdate: (self) => {
            gsap.set(path, { strokeDashoffset: len * (1 - self.progress) });
            setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
          }
        });
        return () => sec.classList.remove("is-pinned");
      });

      mm.add("(min-width: 900px)", () => {
        // Stacking case studies: earlier cards recede as the next one lands
        const cards = gsap.utils.toArray("[data-case]");
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card.querySelector(".case-inner"), {
            scale: 0.92, opacity: 0.35, filter: "blur(2px)", ease: "none",
            scrollTrigger: { trigger: next, start: "top 85%", end: "top 18%", scrub: true }
          });
        });
      });

      /* ── Contact: the section lights up as you arrive (scrubbed clip) ─── */
      const glow = document.querySelector(".contact-light");
      if (glow) {
        gsap.fromTo(glow, { clipPath: "circle(0% at 82% 100%)" }, {
          clipPath: "circle(140% at 82% 100%)", ease: "none",
          scrollTrigger: { trigger: "#contact", start: "top 85%", end: "top 15%", scrub: 0.6 }
        });
      }

      /* ── Header hide/show + scrolled state ────────────────────────────── */
      const header = document.querySelector(".site-header");
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: (self) => {
          if (!header) return;
          header.classList.toggle("is-scrolled", self.scroll() > 12);
          header.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 600 && !root.classList.contains("menu-open"));
          const mq = document.querySelector(".mq-track");
          if (mq) mq.classList.toggle("rev", self.direction === -1);
        }
      });

      /* ── Nav scroll-spy ───────────────────────────────────────────────── */
      document.querySelectorAll("[data-nav]").forEach((a) => {
        const sec = document.getElementById(a.dataset.nav);
        if (!sec) return;
        ScrollTrigger.create({
          trigger: sec, start: "top 45%", end: "bottom 45%",
          onToggle: (self) => a.classList.toggle("active", self.isActive)
        });
      });
    });

    /* ── Run-the-pipeline widget (lazy: wires up when first near view) ── */
    const runRoot = document.querySelector("[data-run]");
    if (runRoot) {
      let stopRun = null;
      const io2 = new IntersectionObserver(([en]) => {
        if (en.isIntersecting && !stopRun) { stopRun = initRunPipeline(runRoot); io2.disconnect(); }
      }, { rootMargin: "300px" });
      io2.observe(runRoot);
      cleanups.push(() => { io2.disconnect(); if (stopRun) stopRun(); });
    }

    /* ── Footer finale: the giant name's light follows the pointer ─────── */
    const foot = document.querySelector("[data-footer]");
    if (foot && !reduce) {
      const mv = (e) => {
        const r = foot.getBoundingClientRect();
        foot.style.setProperty("--fx", `${((e.clientX - r.left) / r.width) * 100}%`);
        foot.style.setProperty("--fy", `${((e.clientY - r.top) / r.height) * 100}%`);
      };
      foot.addEventListener("pointermove", mv);
      cleanups.push(() => foot.removeEventListener("pointermove", mv));
    }

    /* ── Scroll-spy for reduced motion (no ScrollTrigger needed) ────────── */
    if (reduce) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          const a = document.querySelector(`[data-nav="${en.target.id}"]`);
          if (a) a.classList.toggle("active", en.isIntersecting);
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));
      cleanups.push(() => io.disconnect());
    }

    /* ── Cursor, magnetic buttons, tilt (fine pointers only) ────────────── */
    if (finePointer && !reduce) {
      root.classList.add("has-cursor");
      const dot = document.querySelector(".cursor-dot");
      const ring = document.querySelector(".cursor-ring");
      const label = document.querySelector(".cursor-label");
      const pos = { x: innerWidth / 2, y: innerHeight / 2 };
      const ringPos = { ...pos };
      const xDot = gsap.quickSetter(dot, "x", "px"), yDot = gsap.quickSetter(dot, "y", "px");
      const xRing = gsap.quickSetter(ring, "x", "px"), yRing = gsap.quickSetter(ring, "y", "px");

      const onMove = (e) => { pos.x = e.clientX; pos.y = e.clientY; xDot(pos.x); yDot(pos.y); };
      const tick = () => {
        ringPos.x += (pos.x - ringPos.x) * 0.16;
        ringPos.y += (pos.y - ringPos.y) * 0.16;
        xRing(ringPos.x); yRing(ringPos.y);
      };
      gsap.ticker.add(tick);

      const onOver = (e) => {
        const t = e.target.closest("a, button, [data-cursor], [data-cursor-hover], input, textarea");
        if (!t) { root.classList.remove("cursor-hover", "cursor-label-on"); return; }
        root.classList.add("cursor-hover");
        const txt = t.getAttribute("data-cursor");
        if (txt) { label.textContent = txt; root.classList.add("cursor-label-on"); }
        else root.classList.remove("cursor-label-on");
      };
      const onDown = () => root.classList.add("cursor-down");
      const onUp = () => root.classList.remove("cursor-down");
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver);
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);

      const mags = document.querySelectorAll("[data-magnetic]");
      const magHandlers = [];
      mags.forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
        const mv = (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
        };
        const lv = () => { xTo(0); yTo(0); };
        el.addEventListener("pointermove", mv);
        el.addEventListener("pointerleave", lv);
        magHandlers.push([el, mv, lv]);
      });

      const tilts = document.querySelectorAll("[data-tilt]");
      const tiltHandlers = [];
      tilts.forEach((el) => {
        const mv = (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
          el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
          gsap.to(el, { rotateY: px * 6, rotateX: -py * 6, duration: 0.5, ease: "power2.out", transformPerspective: 900 });
        };
        const lv = () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });
        el.addEventListener("pointermove", mv);
        el.addEventListener("pointerleave", lv);
        tiltHandlers.push([el, mv, lv]);
      });

      cleanups.push(() => {
        gsap.ticker.remove(tick);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        [...magHandlers, ...tiltHandlers].forEach(([el, mv, lv]) => {
          el.removeEventListener("pointermove", mv);
          el.removeEventListener("pointerleave", lv);
        });
        root.classList.remove("has-cursor");
      });
    }

    // Fonts shift layout; re-measure pinned sections once they land.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);
}
