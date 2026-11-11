import { useEffect, useRef } from "react";
import { startPortrait } from "../lib/portraitField.js";

/* Data portrait: a halftone likeness drawn from a luminance grid sampled from
   the reference photo. Fixed layer on desktop (assembles in the hero, fades
   behind the content, dissolves into the pipeline, returns at contact);
   a quieter hero-only version on mobile; a static frame for reduced motion. */
export default function Portrait() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    // Start after the first paint settles so the bake never competes with
    // the hero intro for the main thread.
    let stop = null;
    const go = () => { stop = startPortrait(wrapRef.current, canvasRef.current); };
    const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
    const cic = window.cancelIdleCallback || clearTimeout;
    const id = ric(go, { timeout: 1500 });
    return () => { cic(id); if (stop) stop(); };
  }, []);
  return (
    <div className="portrait-layer" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
