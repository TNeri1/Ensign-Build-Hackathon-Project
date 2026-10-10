import type { ShapeName, ShapeTone } from '../components/m3/ExpressiveShape';

/** One expressive shape + tone per category, so a category looks the same on every screen. */
const STYLE: Record<string, [ShapeName, ShapeTone]> = {
  phone: ['cookie', 'primary'],
  wallet: ['clover', 'tertiary'],
  keys: ['sunny', 'warning'],
  bag: ['puffy', 'secondary'],
  clothing: ['flower', 'tertiary'],
  id_card: ['soft-square', 'error'],
  payment_card: ['soft-square', 'warning'],
  laptop: ['cookie', 'secondary'],
  water_bottle: ['puffy', 'success'],
  headphones: ['sunny', 'primary'],
  other: ['flower', 'surface'],
};

export function categoryShape(categoryId: string): ShapeName {
  return STYLE[categoryId]?.[0] ?? 'cookie';
}
export function categoryTone(categoryId: string): ShapeTone {
  return STYLE[categoryId]?.[1] ?? 'secondary';
}
