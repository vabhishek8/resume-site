import { useEffect, useRef } from "react";
import { FIGURE } from "../content.js";

/* Mobile-only (<900px) section-anchored pose: a tall, faded portrait behind
   the section heading, masked into the page, with a scroll drift and a
   fade-in on enter. Desktop uses the fixed figure layer instead (CSS hides
   these at >=900px, and the images never load there because of loading=lazy
   on a display:none element). */
export default function SectionFigure({ pose }) {
  const ref = useRef(null);
  const base = FIGURE.poses[pose] || FIGURE.poses.hero;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const mq = window.matchMedia("(max-width: 899px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) el.classList.add("is-in");
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(el);
    const drift = () => {
      raf = 0;
      if (!mq.matches || reduce) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; // -1..1
      el.style.setProperty("--drift", `${(p * 28).toFixed(1)}px`);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(drift); };
    drift();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  if (!base) return null;
  return (
    <div className={"sec-fig sec-fig-" + pose} ref={ref} aria-hidden="true">
      <img
        alt=""
        loading="lazy"
        decoding="async"
        width="1342"
        height="1800"
        src={`${base}-480.webp`}
        srcSet={`${base}-480.webp 480w, ${base}-720.webp 720w`}
        sizes="(max-width: 899px) 72vw, 1px"
      />
    </div>
  );
}
