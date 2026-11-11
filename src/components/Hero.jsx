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

  useEffect(() => {
    const stop = startMedallionField(canvasRef.current);
    return stop;
  }, []);

  return (
    <section className="hero" aria-label="Introduction">
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true"></canvas>
      <div className="hero-vignette" aria-hidden="true"></div>

      <div className="hero-gates" aria-hidden="true">
        <span style={{ "--x": "0%" }}>raw</span>
        <span style={{ "--x": "33.333%" }}>bronze</span>
        <span style={{ "--x": "58%" }}>silver</span>
        <span style={{ "--x": "80%" }}>gold</span>
      </div>

      <div className="hero-inner">
        <p className="eyebrow hero-eyebrow" data-hero>
          <span className="eyebrow-dash" aria-hidden="true"></span>
          {SITE.location} · {SITE.availability}
        </p>

        <h1 className="hero-name" aria-label={`${SITE.name.first} ${SITE.name.last}`}>
          <span className="line"><span className="line-inner bold" data-hero-line>{SITE.name.first}</span></span>
          <span className="line"><span className="line-inner bold" data-hero-line>{SITE.name.last}<span className="dot">.</span></span></span>
        </h1>

        <p className="hero-tagline" data-hero>
          {SITE.tagline.plain} <em className="serif">{SITE.tagline.italic}</em>
        </p>

        <p className="hero-role" data-hero>
          <span>{SITE.role.from}</span>
          <span className="role-arrow" aria-hidden="true"><i></i></span>
          <span className="role-to">{SITE.role.to}</span>
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

      <figure className="hero-portrait" data-hero-portrait>
        <div className="portrait-frame">
          <img src={SITE.portrait} alt={`Portrait of ${SITE.name.first} ${SITE.name.last}`} width="720" height="960" fetchPriority="high" />
          <span className="portrait-scan" aria-hidden="true"></span>
        </div>
        <figcaption>
          <span className="fc-k">node</span> av-01 <span className="fc-k">status</span> <span className="ok">● online</span>
        </figcaption>
      </figure>

      <div className="hero-bar" data-hero>
        <span><span className="live-dot" aria-hidden="true"></span> SYD <SydneyClock /> AEST</span>
        <span className="hb-mid">3 live pipelines · scheduled daily</span>
        <span className="hb-scroll">Scroll <i aria-hidden="true"></i></span>
      </div>
    </section>
  );
}
