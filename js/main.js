(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  function closeMobileNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.hidden = true;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  function openMobileNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.hidden = false;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMobileNav();
      else openMobileNav();
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileNav();
    });
  }

  /* ---------- Focus management for in-page nav (a11y) ---------- */
  document.querySelectorAll('a[data-nav]').forEach(function (link) {
    link.addEventListener("click", function () {
      var id = link.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      // Defer so native scroll happens first, then move focus for screen readers.
      window.setTimeout(function () {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 500);
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('a[data-nav]'));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            var match = link.getAttribute("href") === "#" + id;
            link.setAttribute("aria-current", match ? "true" : "false");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (revealEls.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      // Stagger siblings that reveal together.
      var groups = {};
      revealEls.forEach(function (el) {
        var parent = el.parentElement;
        var key = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
        if (!groups[parent]) groups[parent] = [];
      });

      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var parent = el.parentElement;
            var siblings = parent ? Array.prototype.filter.call(parent.children, function (c) {
              return c.hasAttribute && c.hasAttribute("data-reveal");
            }) : [el];
            var index = siblings.indexOf(el);
            var delay = Math.max(0, index) * 90;
            el.style.transitionDelay = delay + "ms";
            el.classList.add("is-visible");
            obs.unobserve(el);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      // Reduced motion or no IO support: show everything immediately.
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ---------- Skill bar fill on view ---------- */
  var skillCards = Array.prototype.slice.call(document.querySelectorAll(".skill-card"));
  if (skillCards.length && "IntersectionObserver" in window) {
    var skillObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );
    skillCards.forEach(function (card) { skillObserver.observe(card); });
  } else {
    skillCards.forEach(function (card) { card.classList.add("in-view"); });
  }

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById("scrollProgress");
  var siteHeader = document.querySelector(".site-header");
  var heroNet = document.querySelector(".hero-net");
  var heroSection = document.querySelector(".hero");
  var timelineEl = document.querySelector(".timeline");
  var ticking = false;

  function onScrollFrame() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

    if (progressBar) progressBar.style.width = (pct * 100) + "%";
    if (siteHeader) siteHeader.classList.toggle("is-scrolled", scrollTop > 8);

    if (heroNet && heroSection && !reduceMotion) {
      var heroRect = heroSection.getBoundingClientRect();
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        var shift = scrollTop * 0.12;
        heroNet.style.transform = "translateY(" + shift.toFixed(1) + "px)";
      }
    }

    if (timelineEl) {
      var tlRect = timelineEl.getBoundingClientRect();
      var viewportMid = window.innerHeight * 0.72;
      var total = tlRect.height;
      var traveled = viewportMid - tlRect.top;
      var tlPct = total > 0 ? Math.min(1, Math.max(0, traveled / total)) : 0;
      timelineEl.style.setProperty("--tl-progress", tlPct.toFixed(3));
    }

    ticking = false;
  }

  function requestScrollTick() {
    if (!ticking) {
      window.requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  }

  if (progressBar || siteHeader || timelineEl || (heroNet && !reduceMotion)) {
    window.addEventListener("scroll", requestScrollTick, { passive: true });
    window.addEventListener("resize", requestScrollTick);
    onScrollFrame();
  }

  /* ---------- Timeline marker light-up on view ---------- */
  var timelineItems = Array.prototype.slice.call(document.querySelectorAll(".timeline-item"));
  if (timelineItems.length && "IntersectionObserver" in window) {
    var tlObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.4 }
    );
    timelineItems.forEach(function (item) { tlObserver.observe(item); });
  } else {
    timelineItems.forEach(function (item) { item.classList.add("in-view"); });
  }

  /* ---------- Animated stat counters ---------- */
  var statNums = Array.prototype.slice.call(document.querySelectorAll(".stat-num[data-count-to]"));
  if (statNums.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var countObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var target = parseFloat(el.getAttribute("data-count-to"));
            var prefix = el.getAttribute("data-prefix") || "";
            var suffix = el.getAttribute("data-suffix") || "";
            var duration = 1200;
            var startTime = null;

            function step(ts) {
              if (startTime === null) startTime = ts;
              var elapsed = ts - startTime;
              var t = Math.min(1, elapsed / duration);
              var eased = 1 - Math.pow(1 - t, 3);
              var current = Math.round(target * eased);
              el.textContent = prefix + current + suffix;
              if (t < 1) window.requestAnimationFrame(step);
              else el.textContent = prefix + target + suffix;
            }
            window.requestAnimationFrame(step);
            obs.unobserve(el);
          });
        },
        { threshold: 0.4 }
      );
      statNums.forEach(function (el) { countObserver.observe(el); });
    } else {
      statNums.forEach(function (el) {
        var target = el.getAttribute("data-count-to");
        var prefix = el.getAttribute("data-prefix") || "";
        var suffix = el.getAttribute("data-suffix") || "";
        el.textContent = prefix + target + suffix;
      });
    }
  }

  /* ---------- Cursor spotlight on cards ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var spotlightEls = Array.prototype.slice.call(
      document.querySelectorAll(".project-card, .project-featured, .skill-card, .stat-card")
    );
    spotlightEls.forEach(function (el) {
      el.classList.add("spotlight");
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", x + "%");
        el.style.setProperty("--my", y + "%");
      });
    });
  }
})();
