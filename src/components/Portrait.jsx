import { useEffect, useRef } from "react";
import { startPortrait } from "../lib/portraitField.js";

/* Data portrait: a halftone likeness drawn from a luminance grid sampled from
   the reference photo. Fixed layer on desktop (assembles in the hero, fades
   behind the content, dissolves into the pipeline, returns at contact);
   a quieter hero-only version on mobile; a static frame for reduced motion. */
export default function Portrait() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => startPortrait(wrapRef.current, canvasRef.current), []);
  return (
    <div className="portrait-layer" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
