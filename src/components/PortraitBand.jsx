import { FIGURE } from "../content.js";

/* Mobile-only editorial portrait band before Contact: one full-bleed image
   with a gradient into the sections around it. Hidden on desktop, where the
   fixed figure layer carries the poses. */
export default function PortraitBand({ pose = "contact" }) {
  const base = FIGURE.poses[pose] || FIGURE.poses.hero;
  return (
    <figure className="portrait-band" aria-hidden="true">
      <img
        alt=""
        loading="lazy"
        decoding="async"
        width="1342"
        height="1800"
        src={`${base}-720.webp`}
        srcSet={FIGURE.widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ")}
        sizes="(max-width: 899px) 100vw, 1px"
      />
    </figure>
  );
}
