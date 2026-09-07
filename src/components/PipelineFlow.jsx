import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../hooks/useReducedMotion.js";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { label: "Source Systems", x: 60, y: 190, color: "teal" },
  { label: "SQL Server", x: 240, y: 70, color: "amber" },
  { label: "Azure Data Factory", x: 420, y: 190, color: "teal" },
  { label: "Data Lake Storage", x: 600, y: 70, color: "amber" },
  { label: "Databricks", x: 780, y: 190, color: "teal" },
  { label: "Synapse", x: 960, y: 70, color: "amber" },
  { label: "Power BI", x: 1140, y: 190, color: "teal" }
];

const PATH_D = STAGES.map((s, i) => (i === 0 ? `M${s.x},${s.y}` : `L${s.x},${s.y}`)).join(" ");

// A crisp, scroll-scrubbed 2D pipeline diagram: the connecting line draws
// itself and each stage pops in as the section moves through view.
export default function PipelineFlow() {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path || reduceMotion) return;

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    const nodes = wrap.querySelectorAll(".pf-node");
    gsap.set(nodes, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top 78%",
        end: "bottom 55%",
        scrub: 0.6
      }
    });

    tl.to(path, { strokeDashoffset: 0, ease: "none" }, 0);
    nodes.forEach((node, i) => {
      tl.to(node, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }, i * (1 / nodes.length));
    });

    return () => {
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
    };
  }, [reduceMotion]);

  return (
    <div className="about-flow-scroll" ref={wrapRef}>
      <svg
        className="pipeline-flow"
        viewBox="0 0 1200 260"
        role="img"
        aria-label="Data pipeline flow: Source Systems into SQL Server, Azure Data Factory, Data Lake Storage, Databricks, Synapse, and Power BI"
      >
        <path ref={pathRef} className="pf-edge-active" d={PATH_D} />
        {STAGES.map((s, i) => (
          <g className={"pf-node is-" + s.color} key={s.label} transform={`translate(${s.x}, ${s.y})`}>
            <circle r="7" />
            <text x="0" y="-18" textAnchor="middle">{s.label}</text>
            <text className="pf-index" x="0" y="30" textAnchor="middle">{String(i + 1).padStart(2, "0")}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
