// Node layout ported from the original flat SVG hero-net diagram,
// normalized into 3D space centered at the origin.
// Source coords were on a 1200x700 viewBox; we map to roughly -4..4 / -2.3..2.3.

const RAW_NODES = [
  { x: 120, y: 560, color: "amber" },
  { x: 340, y: 420, color: "amber" },
  { x: 560, y: 480, color: "amber" },
  { x: 780, y: 300, color: "amber" },
  { x: 980, y: 360, color: "amber" },
  { x: 1120, y: 180, color: "amber" },
  { x: 60, y: 300, color: "teal" },
  { x: 280, y: 260, color: "teal" },
  { x: 480, y: 150, color: "teal" },
  { x: 720, y: 190, color: "teal" },
  { x: 940, y: 90, color: "teal" },
  { x: 1150, y: 140, color: "teal" },
  { x: 180, y: 150, color: "neutral" },
  { x: 400, y: 300, color: "neutral" },
  { x: 620, y: 340, color: "neutral" },
  { x: 860, y: 470, color: "neutral" },
  { x: 1040, y: 470, color: "neutral" }
];

const EDGES_BY_INDEX = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
  [12, 13], [13, 14], [14, 15], [15, 16],
  [1, 13], [2, 14], [3, 9], [4, 10]
];

const SCALE_X = 8 / 1200;
const SCALE_Y = 4.6 / 700;

export const NODES = RAW_NODES.map((n) => ({
  position: [
    (n.x - 600) * SCALE_X,
    -(n.y - 350) * SCALE_Y,
    (Math.random() - 0.5) * 0.6
  ],
  color: n.color
}));

export const EDGES = EDGES_BY_INDEX.map(([a, b]) => [NODES[a].position, NODES[b].position]);
