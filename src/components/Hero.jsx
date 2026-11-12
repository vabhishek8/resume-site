import { useEffect, useRef } from "react";
import { SITE } from "../content.js";
import { startMedallionField } from "../lib/medallionField.js";

function SydneyClock() {
  const ref = useRef(null);
  useEffect(() => {
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      });
    } catch {
      return;
    }
    const tick = () => { if (ref.current) ref.current.textContent = fmt.format(new Date()); };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <span ref={ref} className="clock">--:--:--</span>;
}

export default function Hero() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    // Phones get the magazine-cover hero instead of the particle field. One
    // passive, rAF-throttled scroll listener drives two things:
    //  - header.m-clear: transparent header while over the top of the hero
    //  - --hp (0..1): depth parallax, the subject sinks and the masthead
    //    rises, so the name slides out from behind his head (transform only).
    if (window.matchMedia("(max-width: 899px)").matches) {
      const reveal = () => window.dispatchEvent(new Event("av:name-ready"));
      window.addEventListener("av:hero-intro", reveal);
      const hero = heroRef.current;
      const header = document.querySelector(".site-header");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let raf = 0;
      let lastP = -1;
      const update = () => {
        raf = 0;
        const y = window.scrollY;
        if (header) header.classList.toggle("m-clear", y < 12 && !document.documentElement.classList.contains("menu-open"));
        if (reduce || !hero) return;
        const p = Math.min(1, Math.max(0, y / (hero.offsetHeight || 1)));
        // On :root, because the subject (.m-cover) lives outside the React tree
        if (Math.abs(p - lastP) > 0.001) { lastP = p; document.documentElement.style.setProperty("--hp", p.toFixed(4)); }
      };
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("av:hero-intro", reveal);
        window.removeEventListener("scroll", onScroll);
        if (raf) cancelAnimationFrame(raf);
        if (header) header.classList.remove("m-clear");
        document.documentElement.style.removeProperty("--hp");
      };
    }
    const stop = startMedallionField(canvasRef.current, document.querySelector("[data-hero-name]"));
    return stop;
  }, []);

  return (
    <section className="hero" aria-label="Introduction" ref={heroRef}>
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true"></canvas>
      <div className="hero-vignette" aria-hidden="true"></div>

      <div className="hero-gates" aria-hidden="true">
        <span style={{ "--x": "0%" }}>raw</span>
        <span style={{ "--x": "24%" }}>bronze</span>
        <span style={{ "--x": "42%" }}>silver</span>
        <span style={{ "--x": "60%" }}>gold</span>
      </div>

      {/* Mobile subject cut-out: static in index.html (.m-cover) so the LCP
          image doesn't wait for this bundle. */}
      <div className="hero-inner">
        <p className="eyebrow hero-eyebrow" data-hero>
          <span className="eyebrow-dash" aria-hidden="true"></span>
          {SITE.location} · {SITE.availability}
        </p>

        <h1 className="hero-name" data-hero-name aria-label={`${SITE.name.first} ${SITE.name.last}`}>
          <span className="line"><span className="line-inner bold">{SITE.name.first}</span></span>
          <span className="line"><span className="line-inner bold">{SITE.name.last}<span className="dot">.</span></span></span>
        </h1>

        <p className="hero-tagline" data-hero>
          {SITE.tagline.plain} <em className="serif">{SITE.tagline.italic}</em>
        </p>

        <p className="hero-role" data-hero>
          <span>{SITE.role}</span>
        </p>

        <p className="hero-lede" data-hero>{SITE.lede}</p>

        <div className="hero-actions" data-hero>
          <a className="btn btn-primary" href="#experience" data-magnetic data-cursor="Go">
            <span>View experience</span><span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </a>
          <a className="btn btn-ghost" href="#contact" data-magnetic data-cursor="Say hi">
            <span>Get in touch</span>
          </a>
        </div>
      </div>


      <div className="hero-bar" data-hero>
        <span><span className="live-dot" aria-hidden="true"></span> SYD <SydneyClock /> AEST</span>
        <span className="hb-mid">3 live pipelines · scheduled daily</span>
        <span className="hb-scroll">Scroll <i aria-hidden="true"></i></span>
      </div>
    </section>
  );
}
