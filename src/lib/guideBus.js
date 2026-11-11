// Tiny shared state between the guide character, the hero canvas and the
// pipeline runner. Plain mutable object: no subscriptions, read per frame.
export const bus = {
  // Laptop screen centre in viewport px, and whether the hero stream should sink into it
  laptop: { x: 0, y: 0, active: false },
  // 0..1, bumped when particles land in the laptop; decays in the guide loop
  pulse: 0,
  // Set by the guide; lets other modules trigger reactions
  react: null,
  // Current packet colour while carrying data through the medallion
  packet: "#c9895b",
  // Active medallion stage (0..4); the guide stands on that node
  medIndex: 0
};
