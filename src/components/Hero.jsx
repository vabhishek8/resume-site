import { useEffect, useRef } from "react";
import { SITE, FIGURE } from "../content.js";
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

  useEffect(() => {
    // Phones get a static gradient instead of the particle field (one signature
    // motion per viewport, and the battery/CPU it saves). The name still
    // reveals immediately.
    if (window.matchMedia("(max-width: 899px)").matches) {
      const reveal = () => window.dispatchEvent(new Event("av:name-ready"));
      window.addEventListener("av:hero-intro", reveal);
      return () => window.removeEventListener("av:hero-intro", reveal);
    }
    const stop = startMedallionField(canvasRef.current, document.querySelector("[data-hero-name]"));
    return stop;
  }, []);

  return (
    <section className="hero" aria-label="Introduction">
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true"></canvas>
      <div className="hero-vignette" aria-hidden="true"></div>

      <div className="hero-gates" aria-hidden="true">
        <span style={{ "--x": "0%" }}>raw</span>
        <span style={{ "--x": "24%" }}>bronze</span>
        <span style={{ "--x": "42%" }}>silver</span>
        <span style={{ "--x": "60%" }}>gold</span>
      </div>

      <figure className="hero-photo" aria-hidden="true">
        <picture>
        <source
          media="(max-width: 899px)"
          type="image/webp"
          srcSet={FIGURE.mobileWidths.map((w) => `${FIGURE.poses.hero}-m-${w}.webp ${w}w`).join(", ")}
          sizes="100vw"
        />
        <img
          alt=""
          width="1493"
          height="2000"
          src={`${FIGURE.poses.hero}-960.webp`}
          srcSet={FIGURE.widths.map((w) => `${FIGURE.poses.hero}-${w}.webp ${w}w`).join(", ")}
          sizes="(min-width: 1024px) min(690px, 44vw), 100vw"
          fetchPriority="high"
          decoding="async"
        />
        </picture>
      </figure>
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
