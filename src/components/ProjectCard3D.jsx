import { useRef } from "react";

const MAX_TILT = 10;

export default function ProjectCard3D({ children, className = "" }) {
  const cardRef = useRef();
  const frame = useRef(null);

  function onMouseMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * (MAX_TILT * 2);
    const ry = (px - 0.5) * (MAX_TILT * 2);
    const mx = px * 100;
    const my = py * 100;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!el) return;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      el.style.setProperty("--mx", mx + "%");
      el.style.setProperty("--my", my + "%");
    });
  }

  function onMouseLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  }

  return (
    <div className="project-card-3d" data-reveal>
      <article
        ref={cardRef}
        className={"project-card spotlight " + className}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </article>
    </div>
  );
}
