import { useEffect } from "react";

// Ports the behavior that used to live in main.js: reveal-on-scroll,
// active nav highlighting, timeline progress, skill bar fill,
// cursor spotlight glow, and nav-click section-arrival sweep + focus mgmt.
export function useSiteEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal on scroll
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    let revealObserver;
    if (revealEls.length) {
      if ("IntersectionObserver" in window && !reduceMotion) {
        revealObserver = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target;
              const parent = el.parentElement;
              const siblings = parent
                ? Array.from(parent.children).filter((c) => c.hasAttribute && c.hasAttribute("data-reveal"))
                : [el];
              const index = siblings.indexOf(el);
              el.style.transitionDelay = Math.max(0, index) * 90 + "ms";
              el.classList.add("is-visible");
              obs.unobserve(el);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
      } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }
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

    // Timeline light-up + progress
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

    // Cursor spotlight (non-tilt elements)
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

    // Nav click: focus management + section-arrival sweep
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
          if (target.classList.contains("section") && !reduceMotion) {
            target.classList.remove("section-arrive");
            void target.offsetWidth;
            target.classList.add("section-arrive");
            window.setTimeout(() => target.classList.remove("section-arrive"), 950);
          }
        }, reduceMotion ? 0 : 500);
      }
      link.addEventListener("click", handler);
      handlers.push([link, handler]);
    });

    return () => {
      revealObserver && revealObserver.disconnect();
      navObserver && navObserver.disconnect();
      skillObserver && skillObserver.disconnect();
      countObserver && countObserver.disconnect();
      tlObserver && tlObserver.disconnect();
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
      spotlightEls.forEach((el) => el.removeEventListener("mousemove", onSpotMove));
      handlers.forEach(([link, handler]) => link.removeEventListener("click", handler));
    };
  }, []);
}
