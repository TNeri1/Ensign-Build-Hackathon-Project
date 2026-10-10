import type { Color } from '@vlf/shared';

/** CSS background for a small color swatch next to an item color name (see COLORS in @vlf/shared). */
const SWATCH: Record<Color, string> = {
  black: '#1f1f1f',
  white: '#fafafa',
  gray: '#8e8e8e',
  silver: '#c4c7cc',
  red: '#d32f2f',
  orange: '#f57c00',
  yellow: '#fbc02d',
  green: '#388e3c',
  blue: '#1976d2',
  purple: '#7b1fa2',
  pink: '#e91e63',
  brown: '#795548',
  gold: '#c9a227',
  multicolor: 'conic-gradient(#d32f2f, #fbc02d, #388e3c, #1976d2, #7b1fa2, #d32f2f)',
};

export function colorSwatch(color: string): string | undefined {
  return SWATCH[color as Color];
}

/** "multicolor" -> "Multicolor" */
export function colorLabel(color: string): string {
  return color ? color[0].toUpperCase() + color.slice(1) : color;
}
