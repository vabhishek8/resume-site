import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Scroll-storytelling engine: GSAP-batched reveals for a choreographed
// section-by-section flow, plus the supporting motion (nav highlighting,
// stat counters, skill bar fill, timeline progress, cursor spotlight,
// nav-click focus management + section-arrival sweep).
export function useSiteEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {});

    // Hero entrance: staggered, plays once on load, no scroll trigger.
    const heroEls = Array.from(document.querySelectorAll(".hero [data-reveal]"));
    if (heroEls.length) {
      if (reduceMotion) {
        heroEls.forEach((el) => el.classList.add("is-visible"));
      } else {
        gsap.to(heroEls, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.09,
          delay: 0.15,
          onStart: () => heroEls.forEach((el) => el.classList.add("is-visible")),
          onComplete: () => heroEls.forEach((el) => (el.style.transform = ""))
        });
      }
    }

    // Section-by-section reveal: batched per section so siblings arrive
    // together with a short stagger, this is the "story" pacing.
    const sectionsForReveal = Array.from(document.querySelectorAll("main > section"));
    let revealTriggers = [];
    if (!reduceMotion && "IntersectionObserver" in window) {
      sectionsForReveal.forEach((section) => {
        const els = Array.from(section.querySelectorAll("[data-reveal]"));
        if (!els.length) return;
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top 78%",
          once: true,
          onEnter: () => {
            gsap.to(els, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.09,
              onStart: () => els.forEach((el) => el.classList.add("is-visible")),
              onComplete: () => els.forEach((el) => (el.style.transform = ""))
            });
          }
        });
        revealTriggers.push(trigger);
      });
    } else {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
    }

    // Active nav link on scroll
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const navLinks = Array.from(document.querySelectorAll("a[data-nav]"));
    let navObserver;
    if (sections.length && navLinks.length && "IntersectionObserver" in window) {
      navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.setAttribute("aria-current", link.getAttribute("href") === "#" + id ? "true" : "false");
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((s) => navObserver.observe(s));
    }

    // Animated stat counters
    const statNums = Array.from(document.querySelectorAll(".stat-num[data-count-to]"));
    let countObserver;
    if (statNums.length) {
      if ("IntersectionObserver" in window && !reduceMotion) {
        countObserver = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target;
              const target = parseFloat(el.getAttribute("data-count-to"));
              const prefix = el.getAttribute("data-prefix") || "";
              const suffix = el.getAttribute("data-suffix") || "";
              const duration = 1200;
              let startTime = null;
              function step(ts) {
                if (startTime === null) startTime = ts;
                const t = Math.min(1, (ts - startTime) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = prefix + Math.round(target * eased) + suffix;
                if (t < 1) window.requestAnimationFrame(step);
                else el.textContent = prefix + target + suffix;
              }
              window.requestAnimationFrame(step);
              obs.unobserve(el);
            });
          },
          { threshold: 0.4 }
        );
        statNums.forEach((el) => countObserver.observe(el));
      }
    }

    // Skill bar fill on view
    const skillCards = Array.from(document.querySelectorAll(".skill-card"));
    let skillObserver;
    if (skillCards.length && "IntersectionObserver" in window) {
      skillObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      skillCards.forEach((c) => skillObserver.observe(c));
    } else {
      skillCards.forEach((c) => c.classList.add("in-view"));
    }

    // Timeline light-up + scroll-linked progress
    const timelineItems = Array.from(document.querySelectorAll(".timeline-item"));
    let tlObserver;
    if (timelineItems.length && "IntersectionObserver" in window) {
      tlObserver = new IntersectionObserver(
        (entries) => entries.forEach((entry) => entry.target.classList.toggle("in-view", entry.isIntersecting)),
        { threshold: 0.4 }
      );
      timelineItems.forEach((item) => tlObserver.observe(item));
    } else {
      timelineItems.forEach((item) => item.classList.add("in-view"));
    }

    const timelineEl = document.querySelector(".timeline");
    let ticking = false;
    function onScrollFrame() {
      if (timelineEl) {
        const rect = timelineEl.getBoundingClientRect();
        const viewportMid = window.innerHeight * 0.72;
        const traveled = viewportMid - rect.top;
        const pct = rect.height > 0 ? Math.min(1, Math.max(0, traveled / rect.height)) : 0;
        timelineEl.style.setProperty("--tl-progress", pct.toFixed(3));
      }
      ticking = false;
    }
    function requestTick() {
      if (!ticking) { window.requestAnimationFrame(onScrollFrame); ticking = true; }
    }
    if (timelineEl) {
      window.addEventListener("scroll", requestTick, { passive: true });
      window.addEventListener("resize", requestTick);
      onScrollFrame();
    }

    // Cursor spotlight (project cards, skill cards, stat cards)
    let spotlightEls = [];
    function onSpotMove(e) {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width) * 100 + "%");
      el.style.setProperty("--my", ((e.clientY - rect.top) / rect.height) * 100 + "%");
    }
    if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
      spotlightEls = Array.from(document.querySelectorAll(".project-featured, .skill-card, .stat-card"));
      spotlightEls.forEach((el) => {
        el.classList.add("spotlight");
        el.addEventListener("mousemove", onSpotMove);
      });
    }

    // Nav click: focus management
    const navClickLinks = Array.from(document.querySelectorAll("a[data-nav]"));
    const handlers = [];
    navClickLinks.forEach((link) => {
      function handler() {
        const id = link.getAttribute("href");
        if (!id || id.charAt(0) !== "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        window.setTimeout(() => {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 500);
      }
      link.addEventListener("click", handler);
      handlers.push([link, handler]);
    });

    return () => {
      revealTriggers.forEach((t) => t.kill());
      navObserver && navObserver.disconnect();
      skillObserver && skillObserver.disconnect();
      countObserver && countObserver.disconnect();
      tlObserver && tlObserver.disconnect();
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
      spotlightEls.forEach((el) => el.removeEventListener("mousemove", onSpotMove));
      handlers.forEach(([link, handler]) => link.removeEventListener("click", handler));
      ctx.revert();
    };
  }, []);
}
