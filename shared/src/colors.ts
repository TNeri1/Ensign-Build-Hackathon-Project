export const COLORS = [
  'black', 'white', 'gray', 'silver', 'red', 'orange', 'yellow',
  'green', 'blue', 'purple', 'pink', 'brown', 'gold', 'multicolor',
] as const;
export type Color = (typeof COLORS)[number];
