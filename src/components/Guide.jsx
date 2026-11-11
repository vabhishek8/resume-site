import { useEffect, useRef } from "react";
import { startGuide } from "../lib/guideRig.js";

/* Illustrated guide: a stylised, original vector version of Abhishek.
   Short black hair with a textured top and faded sides, thick straight brows,
   warm brown skin, full groomed beard, navy blazer over a light-blue open
   collar. Rigged by guideRig.js (head, eyes, brows, arms, legs, props). */

const C = {
  skin: "#b9785a",
  skinShade: "#9a5f45",
  skinLight: "#d29470",
  hair: "#1c1a1e",
  beard: "#2a2324",
  lip: "#8e4a42",
  blazer: "#18213d",
  blazerDark: "#111830",
  shirt: "#c9d6ee",
  shirtLight: "#e3eaf7",
  trouser: "#161c2e",
  shoe: "#0b0d12"
};

function Arm({ side }) {
  const sx = side === "l" ? 60 : 160;
  return (
    <g transform={`translate(${sx} 172)`}>
      <g data-g={`arm-${side}-u`}>
        <rect x="-9.5" y="-6" width="19" height="48" rx="9.5" fill={C.blazer} />
        <rect x="-9.5" y="-6" width="6" height="44" rx="3" fill={C.blazerDark} opacity=".55" />
        <g transform="translate(0 38)">
          <g data-g={`arm-${side}-f`}>
            <rect x="-8.5" y="-5" width="17" height="40" rx="8.5" fill={C.blazer} />
            <rect x="-8" y="30" width="16" height="6" rx="2" fill={C.shirt} />
            <g data-g={`hand-${side}`}>
              <circle cy="42" r="8.6" fill={C.skin} />
              <path d="M-6 44 Q0 50 6 44" stroke={C.skinShade} strokeWidth="1.4" fill="none" opacity=".7" />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

export function GuideSVG() {
  return (
      <svg className="guide-svg" viewBox="0 0 220 320" width="220" height="320" focusable="false" overflow="visible">
        <defs>
          <radialGradient id="gGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3cc8ff" stopOpacity=".55" />
            <stop offset="100%" stopColor="#3cc8ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gFaceLight" cx="50%" cy="85%" r="70%">
            <stop offset="0%" stopColor="#3cc8ff" stopOpacity=".38" />
            <stop offset="100%" stopColor="#3cc8ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="gRim" x1="0" x2="1">
            <stop offset="0%" stopColor="#3cc8ff" stopOpacity="0" />
            <stop offset="100%" stopColor="#3cc8ff" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="gFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={C.hair} stopOpacity=".9" />
            <stop offset="100%" stopColor={C.hair} stopOpacity="0" />
          </linearGradient>
          <filter id="gSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* floor */}
        <ellipse cx="110" cy="306" rx="62" ry="10" fill="url(#gGlow)" opacity=".5" />
        <ellipse cx="110" cy="306" rx="44" ry="6" fill="#000" opacity=".5" />

        <g data-g="root">
          {/* legs */}
          <g transform="translate(95 244)">
            <g data-g="leg-l">
              <rect x="-11" y="-4" width="22" height="54" rx="9" fill={C.trouser} />
              <rect x="-14" y="44" width="30" height="13" rx="6.5" fill={C.shoe} />
            </g>
          </g>
          <g transform="translate(125 244)">
            <g data-g="leg-r">
              <rect x="-11" y="-4" width="22" height="54" rx="9" fill={C.trouser} />
              <rect x="-16" y="44" width="30" height="13" rx="6.5" fill={C.shoe} />
            </g>
          </g>

          {/* torso */}
          <g data-g="torso">
            <path d="M58 178 C58 164 72 158 86 156 L134 156 C148 158 162 164 162 178 L157 248 C140 255 80 255 63 248 Z" fill={C.blazer} />
            <path d="M94 156 L126 156 L110 198 Z" fill={C.shirt} />
            <path d="M94 156 L104 172 L110 160 Z" fill={C.shirtLight} />
            <path d="M126 156 L116 172 L110 160 Z" fill={C.shirtLight} />
            <path d="M86 157 L106 202 L96 208 L79 168 Z" fill={C.blazerDark} />
            <path d="M134 157 L114 202 L124 208 L141 168 Z" fill={C.blazerDark} />
            <circle cx="110" cy="220" r="2.6" fill="#0c1120" />
            <circle cx="110" cy="234" r="2.6" fill="#0c1120" />
            <path d="M128 214 L146 213" stroke={C.blazerDark} strokeWidth="2" strokeLinecap="round" />
            <path d="M160 178 L155 246" stroke="url(#gRim)" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* props held in front of the body */}
          <g data-g="laptop" transform="translate(110 200)">
            <rect x="-42" y="-40" width="84" height="50" rx="5" fill="#1f2638" stroke="#3cc8ff" strokeOpacity=".45" />
            <rect x="-42" y="-40" width="84" height="50" rx="5" fill="url(#gGlow)" data-g="laptop-glow" opacity=".25" />
            <circle cx="-9" cy="-15" r="3.4" fill="#c9895b" />
            <circle cx="0" cy="-15" r="3.4" fill="#c9d3dd" />
            <circle cx="9" cy="-15" r="3.4" fill="#f2b544" />
            <path d="M-46 10 L46 10 L52 18 L-52 18 Z" fill="#2b3346" />
          </g>

          <g data-g="packet" transform="translate(110 192)">
            <circle r="22" fill="url(#gGlow)" opacity=".7" data-g="packet-halo" />
            <path d="M0 -14 L14 -6 L0 2 L-14 -6 Z" data-g="pk-top" fill="#e0a578" />
            <path d="M-14 -6 L0 2 L0 18 L-14 10 Z" data-g="pk-left" fill="#c9895b" />
            <path d="M14 -6 L0 2 L0 18 L14 10 Z" data-g="pk-right" fill="#9c6640" />
          </g>

          <Arm side="l" />
          <Arm side="r" />

          {/* head */}
          <g data-g="head">
            <rect x="98" y="138" width="24" height="24" rx="6" fill={C.skinShade} />
            <ellipse cx="64" cy="104" rx="9" ry="13" fill={C.skin} />
            <ellipse cx="64" cy="105" rx="4.5" ry="7" fill={C.skinShade} />
            <ellipse cx="156" cy="104" rx="9" ry="13" fill={C.skin} />
            <ellipse cx="156" cy="105" rx="4.5" ry="7" fill={C.skinShade} />

            <path d="M66 92 C66 60 86 46 110 46 C134 46 154 60 154 92 L154 112 C154 140 135 156 110 156 C85 156 66 140 66 112 Z" fill={C.skin} />
            <ellipse cx="88" cy="112" rx="9" ry="5" fill={C.skinLight} opacity=".35" />
            <ellipse cx="132" cy="112" rx="9" ry="5" fill={C.skinLight} opacity=".35" />
            <path d="M66 112 C66 140 85 156 110 156 C135 156 154 140 154 112" fill="url(#gFaceLight)" data-g="face-light" opacity="0" />

            {/* faded sides */}
            <path d="M66 70 C68 84 68 96 68 104 L72 104 C72 92 72 82 74 72 Z" fill="url(#gFade)" />
            <path d="M154 70 C152 84 152 96 152 104 L148 104 C148 92 148 82 146 72 Z" fill="url(#gFade)" />

            {/* beard + moustache */}
<path d="M66 106 C67 123 72 138 84 148 C93 156 101 161 110 161 C119 161 127 156 136 148 C148 138 153 123 154 106 L149 109 C147 121 141 129 134 133 C128 127 119 124 110 124 C101 124 92 127 86 133 C79 129 73 121 71 109 Z" fill={C.beard} />
            <path d="M84 147 C93 155 101 161 110 161 C119 161 127 155 136 147" stroke="#3a3230" strokeWidth="1.2" fill="none" opacity=".6" />
            <path data-g="mouth" d="M100 137 Q110 143 120 137 Q110 140 100 137 Z" fill={C.lip} />

            {/* nose */}
            <path d="M107 100 Q103 114 104 118 Q110 122 116 118 Q117 114 113 100" fill={C.skinShade} opacity=".5" />
            <path d="M104 118 Q110 123 116 118" stroke={C.skinShade} strokeWidth="1.6" fill="none" />

            {/* eyes */}
            <g data-g="eye-l">
              <ellipse cx="91" cy="98" rx="8.2" ry="5.6" fill="#f3eee8" />
              <g data-g="pupil-l"><circle cx="91" cy="98.5" r="4.3" fill="#3b2a22" /><circle cx="91" cy="98.5" r="2" fill="#120d0b" /><circle cx="92.6" cy="96.9" r="1.2" fill="#fff" /></g>
            </g>
            <g data-g="eye-r">
              <ellipse cx="129" cy="98" rx="8.2" ry="5.6" fill="#f3eee8" />
              <g data-g="pupil-r"><circle cx="129" cy="98.5" r="4.3" fill="#3b2a22" /><circle cx="129" cy="98.5" r="2" fill="#120d0b" /><circle cx="130.6" cy="96.9" r="1.2" fill="#fff" /></g>
            </g>
            <path d="M82 96 Q91 89.5 100.5 95.5" stroke={C.hair} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M119.5 95.5 Q129 89.5 138 96" stroke={C.hair} strokeWidth="2.4" fill="none" strokeLinecap="round" />

            {/* brows */}
            <g data-g="brows">
              <path d="M78 86 Q90 79 103 83 L102 88.5 Q90 85.5 79 91 Z" fill={C.hair} />
              <path d="M117 83 Q130 79 142 86 L141 91 Q130 85.5 118 88.5 Z" fill={C.hair} />
            </g>

            {/* hair: short, textured, lifted at the front; faded sides */}
            <path d="M65 92 C61 72 64 54 77 44 C80 33 94 25 108 28 C117 20 135 23 142 33 C153 38 159 54 157 71 C157 79 156 86 155 92 C152 80 148 72 142 67 C134 61 124 65 112 63 C100 65 90 61 81 66 C74 70 69 80 65 92 Z" fill={C.hair} />
            <path d="M80 47 C86 38 98 32 110 33 C124 32 136 38 142 48 C134 42 122 40 110 41 C98 41 88 43 80 47 Z" fill="#2f2a31" />
            <path d="M86 46 Q92 36 102 35 M108 31 Q118 27 128 33 M96 52 Q106 45 118 47 M124 50 Q134 46 142 54 M78 58 Q84 52 92 54" stroke="#403a42" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M82 66 Q96 60 110 63 Q124 60 140 66" stroke="#2f2a31" strokeWidth="1.5" fill="none" opacity=".8" />
            <path d="M153 66 C157 76 157 86 155 92" stroke="url(#gRim)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* graduation cap (education) */}
            <g data-g="cap">
              <path d="M84 44 L84 34 Q110 26 136 34 L136 44 Q110 52 84 44 Z" fill="#11131a" />
              <path d="M62 32 L110 16 L158 32 L110 48 Z" fill="#171a23" stroke="#2a2f3c" />
              <circle cx="110" cy="32" r="2.4" fill="#f2b544" />
              <g data-g="tassel"><path d="M110 32 L150 40 L150 58" stroke="#f2b544" strokeWidth="2" fill="none" /><rect x="147" y="56" width="6" height="10" rx="2" fill="#f2b544" /></g>
            </g>
          </g>
        </g>
      </svg>
  );
}

export default function Guide() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const stop = startGuide(wrapRef.current);
    return stop;
  }, []);

  return (
    <div className="guide" ref={wrapRef} aria-hidden="true">
      <div className="guide-bubble"><span></span></div>
      <GuideSVG />
    </div>
  );
}
