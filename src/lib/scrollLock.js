// iOS-safe scroll lock. overflow:hidden on html/body is ignored by iOS Safari
// for touch scrolling, so the body is pinned with position: fixed at the
// current offset and restored on release. Reference-counted so the menu and
// the case-study overlay can't leave the page locked.
let locks = 0;
let savedY = 0;

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  savedY = window.scrollY;
  const b = document.body.style;
  b.position = "fixed";
  b.top = `-${savedY}px`;
  b.left = "0";
  b.right = "0";
  b.width = "100%";
}

export function unlockScroll() {
  if (locks === 0) return;
  locks -= 1;
  if (locks > 0) return;
  const b = document.body.style;
  b.position = ""; b.top = ""; b.left = ""; b.right = ""; b.width = "";
  window.scrollTo(0, savedY);
}

// Failsafe: whatever happens during the intro, the page must scroll.
export function ensureScrollable() {
  const root = document.documentElement;
  const caseOpen = Boolean(document.querySelector(".cs-backdrop"));
  const menuOpen = root.classList.contains("menu-open");
  if (!caseOpen && !menuOpen) {
    if (locks > 0 || document.body.style.position === "fixed") {
      locks = 1;
      unlockScroll();
    }
    root.classList.remove("case-open");
  }
  const pre = document.querySelector(".preloader");
  if (pre && (performance.now() > 5000)) pre.remove();
  // never let <body> become its own scroll container
  const cs = getComputedStyle(document.body);
  if (cs.overflowY !== "visible" || cs.overflowX !== "visible") document.body.style.overflow = "visible";
}
