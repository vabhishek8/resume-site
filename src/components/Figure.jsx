import { useEffect, useRef } from "react";
import { FIGURE } from "../content.js";
import Portrait from "./Portrait.jsx";
import { startFigureLayer } from "../lib/figureLayer.js";

/* Figure layer, modelled on the reference video: a fixed portrait on the
   right that is full strength in the hero, dims behind later sections, and
   cross-fades between poses per section (About shows its pose on the left).
   Until generated poses are added in content.js, the halftone data portrait
   is used as the fallback. */
export default function Figure() {
  const hasPoses = Boolean(FIGURE.poses.hero);
  const wrapRef = useRef(null);
  useEffect(() => (hasPoses ? startFigureLayer(wrapRef.current) : undefined), [hasPoses]);

  if (!hasPoses) return <Portrait />;

  const keys = Object.keys(FIGURE.poses).filter((k) => FIGURE.poses[k]);
  return (
    <div className="figure-layer" ref={wrapRef} aria-hidden="true">
      {keys.map((k) => (
        <div className={"fig-pose pose-" + k} data-pose={k} key={k}>
          <img src={FIGURE.poses[k]} alt="" decoding="async" loading={k === "hero" ? "eager" : "lazy"} fetchPriority={k === "hero" ? "high" : "low"} />
        </div>
      ))}
    </div>
  );
}
