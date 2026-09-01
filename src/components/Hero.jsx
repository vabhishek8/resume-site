import { Suspense, lazy } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";

const HeroScene = lazy(() => import("../three/HeroScene.jsx"));

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero-canvas-wrap" aria-hidden="true">
        {!reduceMotion && (
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        )}
        {reduceMotion && (
          <svg className="hero-fallback-net" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
            <g stroke="#7a8598" strokeWidth="1.4" fill="none" opacity="0.5">
              <path d="M120,560 L340,420 L560,480 L780,300 L980,360 L1120,180" />
              <path d="M60,300 L280,260 L480,150 L720,190 L940,90 L1150,140" />
              <path d="M180,150 L400,300 L620,340 L860,470 L1040,470" />
            </g>
            <g fill="#f2a541">
              <circle cx="120" cy="560" r="4" /><circle cx="340" cy="420" r="5" /><circle cx="560" cy="480" r="4" />
              <circle cx="780" cy="300" r="5" /><circle cx="980" cy="360" r="4" /><circle cx="1120" cy="180" r="4" />
            </g>
            <g fill="#4fd8c4">
              <circle cx="60" cy="300" r="4" /><circle cx="280" cy="260" r="4" /><circle cx="480" cy="150" r="5" />
              <circle cx="720" cy="190" r="4" /><circle cx="940" cy="90" r="4" /><circle cx="1150" cy="140" r="4" />
            </g>
          </svg>
        )}
      </div>

      <div className="wrap hero-inner">
        <div className="hero-text">
          <p className="eyebrow" data-reveal>Sydney, AU · Open to relocation</p>
          <h1 data-reveal>Building data platforms that don't fall over at 2&nbsp;a.m.</h1>
          <p className="hero-role" data-reveal>
            Senior Business Intelligence Engineer&ensp;<span className="arrow" aria-hidden="true">→</span>&ensp;Azure Data Engineer
          </p>
          <p className="hero-lede" data-reveal>
            4+ years architecting ETL/ELT pipelines, data models, and CI/CD-governed delivery on Microsoft Azure
            (Azure Data Factory, Databricks, Data Lake Storage, and Synapse) for teams that need the data to just be there, correctly, on time.
          </p>
          <div className="hero-actions" data-reveal>
            <a className="btn btn-primary" href="#experience">View experience</a>
            <a className="btn btn-ghost" href="#contact">Get in touch</a>
          </div>
        </div>

        <div className="hero-portrait" data-reveal>
          <div className="portrait-frame">
            <img src="/img/portrait.jpg" alt="Portrait of Abhishek Vadlamudi" width="720" height="960" loading="eager" fetchPriority="high" />
          </div>
        </div>
      </div>
    </section>
  );
}
