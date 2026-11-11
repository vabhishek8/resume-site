import { useEffect, useState } from "react";
import { NAV, SITE, MARQUEE } from "../content.js";

/* Section heading: bold sans line(s) + italic serif line(s) + accent full stop.
   lines: [["bold"|"serif", "text"], ...] — each line is masked for the reveal. */
export function Heading({ id, index, label, lines, dot = true, as: Tag = "h2", className = "" }) {
  return (
    <header className={"sec-head " + className}>
      <p className="eyebrow" data-reveal>
        <span className="eyebrow-dash" aria-hidden="true"></span>
        <span className="eyebrow-idx">{index}</span> {label}
      </p>
      <Tag id={id} className="display" data-split>
        {lines.map(([style, text], i) => (
          <span className="line" key={i}>
            <span className={"line-inner " + (style === "serif" ? "serif" : "bold")}>
              {text}
              {dot && i === lines.length - 1 ? <span className="dot" aria-hidden="true">.</span> : null}
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
                <span className="nav-idx">0{i + 1}</span>
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
              <a href={`#${l.id}`} onClick={() => setOpen(false)}>
                <span className="nav-idx">0{i + 1}</span>
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

export function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="pre-inner">
        <p className="pre-line"><span>bronze</span><span className="pre-ok">landed</span></p>
        <p className="pre-line"><span>silver</span><span className="pre-ok">quality-gated</span></p>
        <p className="pre-line"><span>gold</span><span className="pre-ok">served</span></p>
        <div className="pre-bar"><span></span></div>
        <p className="pre-count"><span data-pre-count>000</span>%</p>
      </div>
    </div>
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
    <footer className="site-footer">
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
