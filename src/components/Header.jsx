import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" }
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={"site-header" + (scrolled ? " is-scrolled" : "")} id="top">
      <div className="wrap header-inner">
        <a className="brand" href="#top" aria-label="Abhishek Vadlamudi home">
          <span className="brand-mark" aria-hidden="true">AV</span>
          <span className="brand-name">Abhishek<span className="brand-dot">.</span>Vadlamudi</span>
        </a>
        <nav className="main-nav" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}><a href={l.href} data-nav>{l.label}</a></li>
            ))}
          </ul>
        </nav>
        <button
          className="nav-toggle"
          aria-expanded={mobileOpen}
          aria-controls="mobileNav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
      <div className="mobile-nav" id="mobileNav" hidden={!mobileOpen}>
        <ul>
          {NAV_LINKS.map((l) => (
            <li key={l.href}><a href={l.href} data-nav onClick={() => setMobileOpen(false)}>{l.label}</a></li>
          ))}
        </ul>
      </div>
    </header>
  );
}
