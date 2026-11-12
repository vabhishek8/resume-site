import { useEffect, useState } from "react";
import { NAV, SITE, MARQUEE, CHAPTERS } from "../content.js";
import { lockScroll, unlockScroll } from "../lib/scrollLock.js";

/* Section heading: bold sans line(s) + italic serif line(s) + accent full stop.
   Characters are split for the kinetic reveal; screen readers get the plain text. */
export function Heading({ id, label, lines, dot = true, as: Tag = "h2", className = "" }) {
  const plain = lines.map(([, t]) => t).join(" ");
  return (
    <header className={"sec-head " + className}>
      <p className="eyebrow" data-reveal>
        <span className="eyebrow-dash" aria-hidden="true"></span>
        {label}
      </p>
      <Tag id={id} className="display" data-split aria-label={plain}>
        <span className="wipe" aria-hidden="true"></span>
        {lines.map(([style, text], i) => (
          <span className="line" key={i} aria-hidden="true">
            <span className={"line-inner " + (style === "serif" ? "serif" : "bold")}>
              {text.split(" ").map((word, wi, arr) => (
                <span key={wi}>
                  <span className="word">
                    {[...word].map((ch, ci) => <span className="ch" key={ci}>{ch}</span>)}
                  </span>
                  {wi < arr.length - 1 ? " " : null}
                </span>
              ))}
              {dot && i === lines.length - 1 ? <span className="dot ch">.</span> : null}
            </span>
          </span>
        ))}
      </Tag>
    </header>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return undefined;
    lockScroll();
    return () => unlockScroll();
  }, [open]);

  return (
    <header className="site-header" id="top">
      <a className="brand" href="#top" aria-label={`${SITE.name.first} ${SITE.name.last}, home`} data-cursor="Top">
        <span className="brand-mark" aria-hidden="true">AV</span>
        <span className="brand-name">
          {SITE.name.first}<span className="brand-dot">.</span>{SITE.name.last}
        </span>
      </a>
      <nav className="main-nav" aria-label="Primary">
        <ul>
          {NAV.map((l, i) => (
            <li key={l.id}>
              <a href={`#${l.id}`} data-nav={l.id}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <button
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="mobileNav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span></span>
        <span></span>
      </button>
      <div className="mobile-nav" id="mobileNav" hidden={!open}>
        <ul>
          {NAV.map((l, i) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={(e) => {
                  // close first so the scroll lock releases, then travel
                  e.preventDefault();
                  setOpen(false);
                  setTimeout(() => {
                    let t = document.getElementById(l.id);
                    // Contact is introduced by its portrait band on phones
                    if (t && t.previousElementSibling && t.previousElementSibling.classList.contains("portrait-band")) t = t.previousElementSibling;
                    const header = document.querySelector(".site-header");
                    const offset = header ? header.getBoundingClientRect().height : 0;
                    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
                  }, 60);
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mobile-nav-foot">{SITE.location} · {SITE.availability}</p>
      </div>
    </header>
  );
}

export function ScrollProgress() {
  return (
    <div className="scroll-progress" aria-hidden="true">
      <span className="sp-fill"></span>
    </div>
  );
}

export function Cursor() {
  return (
    <div className="cursor" aria-hidden="true">
      <span className="cursor-dot"></span>
      <span className="cursor-ring"><span className="cursor-label"></span></span>
    </div>
  );
}

export function Marquee() {
  const row = MARQUEE.map((m, i) => (
    <span className="mq-item" key={i}>
      {m}
      <span className="mq-sep" aria-hidden="true">✦</span>
    </span>
  ));
  return (
    <div className="marquee" aria-hidden="true">
      <div className="mq-track">
        <div className="mq-row">{row}</div>
        <div className="mq-row">{row}</div>
      </div>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" data-footer>
      <p className="footer-kicker" data-reveal>That's the whole pipeline. Thanks for scrolling.</p>
      <p className="footer-giant" aria-hidden="true">
        <span className="bold">{SITE.name.first}</span> <span className="serif">{SITE.name.last}</span>
        <span className="dot">.</span>
      </p>
      <div className="footer-row">
        <p>&copy; {year} {SITE.name.first} {SITE.name.last}. Built from scratch, no template.</p>
        <p className="footer-stack">React · GSAP · Azure Static Web Apps</p>
        <a href="#top" data-cursor="Top">Back to top &uarr;</a>
      </div>
    </footer>
  );
}

/* Story rail: the page as one pipeline run. Fixed on wide screens; each
   chapter is a stage and doubles as navigation. */
export function StoryRail() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.5;
      let idx = 0;
      CHAPTERS.forEach((c, i) => {
        const n = document.querySelector(c.sel);
        if (n && n.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  const go = (sel) => {
    const n = document.querySelector(sel);
    if (n) window.scrollTo({ top: n.getBoundingClientRect().top + window.scrollY - 10, behavior: "smooth" });
  };
  return (
    <nav className="story-rail" aria-label="Story progress">
      <ol>
        {CHAPTERS.map((c, i) => (
          <li key={c.label} className={(i === active ? "is-active " : "") + (i < active ? "is-done " : "") + "st-" + c.stage.toLowerCase()}>
            <button type="button" onClick={() => go(c.sel)} aria-current={i === active ? "step" : undefined}>
              <span className="sr-dot" aria-hidden="true"></span>
              <span className="sr-text"><span className="sr-stage">{c.stage}</span><span className="sr-label">{c.label}</span></span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
