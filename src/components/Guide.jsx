import { useEffect, useRef } from "react";
import { startGuide } from "../lib/guideRig.js";

/* Illustrated guide, direction A: refined semi-flat editorial vector.
   Waist-up, three-quarter view facing the content. Cel shading with two tones
   per surface, an azure rim light from behind-right, soft occlusion under the
   chin. Likeness anchors from the reference photo: short dark hair with a
   lifted textured top and faded sides, broad rounded face, full groomed beard
   with moustache, thick straight brows, navy blazer over a light-blue open
   collar. Every moving part has its pivot at the joint it rotates around. */

const C = {
  skin: "#b8775a",
  skinSh: "#94573f",
  hair: "#1d191b",
  hairHi: "#3a3237",
  blazer: "#1d2746",
  blazerSh: "#131a33",
  shirt: "#c9d6ee",
  shirtSh: "#9fb1d2",
  lip: "#7d4136",
  rim: "#3cc8ff"
};

/* Hands, drawn in forearm space: the wrist sits at (0,0) and fingers point +y. */
function Hand({ side }) {
  const flip = side === "l" ? -1 : 1;
  return (
    <g data-g={`hand-${side}`} transform={`scale(${flip} 1)`}>
      <g data-g={`hand-${side}-fist`}>
        <path d="M-9 -1 C-10.5 7 -9 15 -2 17 C5 18.5 10.5 13.5 10 5 C9.8 0 7 -2 0 -2 C-4 -2 -7.5 -2 -9 -1 Z" fill={C.skin} />
        <path d="M4 1 C10 2 13 7 10.5 11 C8.5 9.5 6 8 3.5 7.5 Z" fill={C.skinSh} />
      </g>
      <g data-g={`hand-${side}-open`} opacity="0">
        <path d="M-9 -1 C-10 8 -9.5 17 -7.5 24 C-6.5 29 6.5 29 7.5 24 C9.5 17 10 8 9 -1 C5 -3 -5 -3 -9 -1 Z" fill={C.skin} />
        <path d="M-3.4 14 L-3.4 27 M1.8 14 L1.8 28" stroke={C.skinSh} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8.5 3 C15 4 18 9 15.5 13 C13 14 10.5 12 9 10 Z" fill={C.skin} />
      </g>
      <g data-g={`hand-${side}-point`} opacity="0">
        <path d="M-9 -1 C-10.5 7 -9 15 -2 17 C5 18.5 10.5 13.5 10 5 C9.8 0 7 -2 0 -2 C-4 -2 -7.5 -2 -9 -1 Z" fill={C.skin} />
        <path d="M-4 13 L-4.2 33 C-4.2 37 2 37 2 33 L2.2 13 Z" fill={C.skin} />
        <path d="M4 1 C10 2 13 7 10.5 11 C8.5 9.5 6 8 3.5 7.5 Z" fill={C.skinSh} />
      </g>
    </g>
  );
}

/* Arm: shoulder pivot at the group origin, elbow pivot at (0,60). */
function Arm({ side }) {
  const x = side === "l" ? 74 : 176;
  const near = side === "r";
  return (
    <g transform={`translate(${x} 194)`}>
      <g data-g={`arm-${side}-u`}>
        <path d="M-16 0 C-17 20 -15 42 -12.5 62 L12.5 62 C15 42 17 20 16 0 C11 -9 -11 -9 -16 0 Z" fill={C.blazer} />
        <path d={near ? "M5 -10 C12 10 14 38 12.5 62 L5 62 C6 40 6 14 5 -10 Z" : "M-5 -10 C-12 10 -14 38 -12.5 62 L-5 62 C-6 40 -6 14 -5 -10 Z"} fill={C.blazerSh} />
        {near ? <path d="M15 4 C16.4 24 15 44 12.8 60" stroke={C.rim} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".8" /> : null}
        <g transform="translate(0 60)">
          <g data-g={`arm-${side}-f`}>
            <circle r="12.4" fill={C.blazer} />
            <path d="M-12 0 C-12 20 -10.5 38 -9.5 50 L9.5 50 C10.5 38 12 20 12 0 Z" fill={C.blazer} />
            <path d={near ? "M4 0 C8 18 9.5 36 9.5 50 L3.5 50 C4 34 4 16 4 0 Z" : "M-4 0 C-8 18 -9.5 36 -9.5 50 L-3.5 50 C-4 34 -4 16 -4 0 Z"} fill={C.blazerSh} />
            <rect x="-9" y="47" width="18" height="7" rx="2.5" fill={C.shirt} />
            <g transform="translate(0 55)"><Hand side={side} /></g>
          </g>
        </g>
      </g>
    </g>
  );
}

export function GuideSVG() {
  return (
    <svg className="guide-svg" viewBox="-80 -40 400 340" width="400" height="340" focusable="false" overflow="visible">
      <defs>
        <radialGradient id="gHalo" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#3cc8ff" stopOpacity=".16" />
          <stop offset="100%" stopColor="#3cc8ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gScreen" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3cc8ff" stopOpacity=".7" />
          <stop offset="100%" stopColor="#3cc8ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gUnder" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3cc8ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#3cc8ff" stopOpacity=".42" />
        </linearGradient>
        <radialGradient id="gAOg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity=".38" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="126" cy="176" rx="124" ry="134" fill="url(#gHalo)" />

      <g>
      <g data-g="root">
        {/* torso (core; arms are separate so they can pivot cleanly) */}
        <g data-g="torso">
          <path d="M70 196 C76 176 92 166 106 162 L144 162 C160 166 174 176 180 196 L188 300 L62 300 Z" fill={C.blazer} />
          <path d="M156 170 C168 178 176 188 180 204 L188 300 L166 300 C168 256 166 214 156 170 Z" fill={C.blazerSh} />
          <path d="M103 158 L139 158 L127 232 L117 232 Z" fill={C.shirt} />
          <path d="M128 160 L139 158 L127 232 L124 212 Z" fill={C.shirtSh} />
          <path d="M106 132 L140 132 L142 162 C132 170 112 170 102 162 Z" fill={C.skinSh} />
          <ellipse cx="122" cy="150" rx="22" ry="12" fill="url(#gAOg)" />
          <path d="M103 157 L94 178 L115 171 Z" fill="#e2e9f6" />
          <path d="M139 157 L150 175 L127 171 Z" fill={C.shirt} />
          <path d="M99 161 L84 179 L114 242 L119 231 Z" fill={C.blazerSh} />
          <path d="M143 161 L162 180 L125 242 L122 231 Z" fill="#16203d" />
          <circle cx="121" cy="266" r="2.4" fill="#0d1224" />
          <path d="M62 300 L188 300 L186 262 C150 276 100 276 64 262 Z" fill="url(#gUnder)" opacity=".35" />
        </g>

        {/* props that sit behind the hands */}
        <g data-g="laptop">
          <path d="M-47 -44 L47 -44 L49 10 L-49 10 Z" fill="#20283b" />
          <path d="M-47 -44 L47 -44 L47.4 -40 L-47.4 -40 Z" fill={C.rim} opacity=".6" />
          <path d="M-47 -44 L47 -44 L49 10 L-49 10 Z" fill="url(#gScreen)" opacity=".25" data-g="laptop-glow" />
          <circle cx="-9" cy="-17" r="3.6" fill="#c9895b" />
          <circle cx="0" cy="-17" r="3.6" fill="#c9d3dd" />
          <circle cx="9" cy="-17" r="3.6" fill="#f2b544" />
          <path d="M-55 10 L55 10 L47 19 L-47 19 Z" fill="#2e3649" />
        </g>
        <g data-g="packet">
          <circle r="26" fill="url(#gScreen)" opacity=".55" />
          <path d="M0 -15 L15 -6.5 L0 2 L-15 -6.5 Z" data-g="pk-top" fill="#e0a578" />
          <path d="M-15 -6.5 L0 2 L0 19 L-15 10.5 Z" data-g="pk-left" fill="#c9895b" />
          <path d="M15 -6.5 L0 2 L0 19 L15 10.5 Z" data-g="pk-right" fill="#9c6640" />
        </g>

        <Arm side="l" />
        <Arm side="r" />

        {/* head: pivots at the neck (124,150) */}
        <g data-g="head">
          <path d="M154 96 C160 88 171 92 170 104 C169 115 161 119 155 115 Z" fill={C.skin} />
          <path d="M158 98 C163 96 166 100 165 106 C164 110 160 111 158 109 Z" fill={C.skinSh} />
          <path d="M93 62 C86 76 84 94 88 109 C92 126 103 141 118 148 C133 153 148 141 155 125 C160 110 161 92 158 72 C151 53 105 49 93 62 Z" fill={C.skin} />
          <path d="M150 70 C157 86 158 106 153 124 C149 134 144 141 137 145 C146 128 150 110 150 92 Z" fill={C.skinSh} />
          <path d="M157 92 C158.5 106 157 118 152.5 127" stroke={C.rim} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".75" />

          {/* features shift slightly more than the outline: cheap 3/4 parallax */}
          <g data-g="features">
            <path d="M119 96 C119 104 117 110 113 114 C116 117 121 117 124 115 C123 109 121 103 121 96 Z" fill={C.skinSh} />
            <path d="M114.5 115.5 C116.5 117 119 117 120 115.5" stroke="#6e3b2a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M156 104 C157 123 150 139 138 149 C128 157 115 159 105 153 C95 147 89 134 87 116 L91 113 C95 122 102 127 110 126 C116 122 127 121 136 124 C143 120 150 111 152 101 Z" fill={C.hair} />
            <path d="M140 128 C144 134 145 140 138 149 C130 155 122 157 115 157 C126 152 136 144 140 128 Z" fill={C.hairHi} opacity=".45" />
            <path data-g="mouth" d="M108 133 C113 136 120 136 125 132 C121 138 112 139 108 133 Z" fill={C.lip} />
            <g data-g="eye-r">
              <path d="M128 94 C131 89 141 89 145 94 C141 98 132 98 128 94 Z" fill="#efe8e0" />
              <g data-g="pupil-r"><circle cx="137.5" cy="94" r="3.7" fill="#2d1f19" /><circle cx="138.6" cy="92.8" r="1" fill="#fff" /></g>
              <path d="M127 94 C131 87 142 87 146 93 C142 90 132 90 127 94 Z" fill={C.hair} />
            </g>
            <g data-g="eye-l">
              <path d="M100 94 C102 90 109 89 113 93 C110 97 103 97 100 94 Z" fill="#efe8e0" />
              <g data-g="pupil-l"><circle cx="107" cy="93.6" r="3.2" fill="#2d1f19" /><circle cx="108" cy="92.6" r=".9" fill="#fff" /></g>
              <path d="M99 94 C102 88 110 88 114 93 C110 90 103 90 99 94 Z" fill={C.hair} />
            </g>
            <g data-g="brows">
              <path d="M125 84 C133 79 143 79 151 83 L150 88 C142 85 134 85 126 89 Z" fill={C.hair} />
              <path d="M97 85 C102 81 109 80 115 82 L114 87 C109 85 103 86 98 89 Z" fill={C.hair} />
            </g>
          </g>

          {/* hair: lifted textured top, faded sides; lags the head slightly */}
          <g data-g="hair">
            <path d="M87 80 C80 56 92 32 117 25 C125 22 132 22 138 24 C150 25 159 31 163 41 C168 50 168 62 164 76 C162 83 160 88 158 94 L155 94 C154 84 152 76 148 70 C144 66 140 64 134 64 C126 62 116 63 106 66 C99 69 94 72 91 82 Z" fill={C.hair} />
            {/* volume: highlight planes swept up and back */}
            <path d="M99 52 C107 41 119 35 133 34 C125 38 115 44 107 54 Z" fill={C.hairHi} />
            <path d="M127 30 C141 28 153 35 159 46 C151 40 140 35.5 127 35 Z" fill={C.hairHi} />
            <path d="M137 57 C145 54 152 58 156 65 C150 62 143 60 137 61 Z" fill={C.hairHi} opacity=".8" />
            <path d="M94 74 C97 68 102 65 108 64 C103 67 99 70 96 76 Z" fill={C.hairHi} opacity=".7" />
            <path d="M148 68 C153 74 156 84 157 94 L155 94 C153 85 150 77 146 71 Z" fill="#4a3f44" opacity=".55" />
            <path d="M88 82 C88 76 90 72 92 70 L91 84 Z" fill="#4a3f44" opacity=".55" />
            <path d="M163 50 C166 60 166 72 162 86" stroke={C.rim} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".85" />
          </g>

          {/* graduation cap (education) */}
          <g data-g="cap">
            <path d="M98 34 L98 22 Q126 13 154 22 L154 34 Q126 43 98 34 Z" fill="#11131a" />
            <path d="M74 20 L126 3 L178 20 L126 37 Z" fill="#191c26" />
            <path d="M126 37 L178 20 L178 22 L126 39 Z" fill={C.rim} opacity=".55" />
            <circle cx="126" cy="20" r="2.4" fill="#f2b544" />
            <g data-g="tassel"><path d="M126 20 L168 29 L168 48" stroke="#f2b544" strokeWidth="2" fill="none" strokeLinecap="round" /><rect x="165" y="46" width="6" height="11" rx="2" fill="#f2b544" /></g>
          </g>
        </g>
      </g>
      </g>
    </svg>
  );
}

export default function Guide() {
  const wrapRef = useRef(null);
  useEffect(() => startGuide(wrapRef.current), []);
  return (
    <div className="guide" ref={wrapRef} aria-hidden="true">
      <div className="guide-bubble"><span></span></div>
      <GuideSVG />
    </div>
  );
}
