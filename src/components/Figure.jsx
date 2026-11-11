import { useEffect, useRef } from "react";
import { FIGURE } from "../content.js";
import { startFigureLayer } from "../lib/figureLayer.js";

/* Figure layer, modelled on the reference video: a fixed portrait on the
   right, full strength in the hero, dimmed behind later sections, with a
   cross-fade to a different pose per section. The hero pose is preloaded
   (see index.html); the other poses get their sources after page load. */
const SIZES = "(min-width: 1024px) min(690px, 44vw), 360px";
const srcSet = (base) => FIGURE.widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");

export default function Figure() {
  const wrapRef = useRef(null);
  useEffect(() => startFigureLayer(wrapRef.current), []);
  const keys = Object.keys(FIGURE.poses).filter((k) => FIGURE.poses[k]);
  if (!keys.length) return null;

  return (
    <div className="figure-layer" ref={wrapRef}>
      {keys.map((k) => {
        const base = FIGURE.poses[k];
        const hero = k === "hero";
        return (
          <div className={"fig-pose pose-" + k + (hero ? " is-active" : "")} data-pose={k} key={k} aria-hidden={hero ? undefined : "true"}>
            <img
              alt={hero ? FIGURE.alt : ""}
              width="1493"
              height="2000"
              sizes={SIZES}
              decoding="async"
              {...(hero
                ? { src: `${base}-960.webp`, srcSet: srcSet(base), fetchPriority: "high" }
                : { "data-src": `${base}-960.webp`, "data-srcset": srcSet(base) })}
            />
          </div>
        );
      })}
    </div>
  );
}
