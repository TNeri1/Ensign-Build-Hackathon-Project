import { ShapeIcon } from '../m3/ExpressiveShape';
import { categoryIcon } from '../../lib/categoryIcon';
import { categoryShape, categoryTone } from '../../lib/categoryStyle';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import './claims.css';

/** "id_card" -> "Id card". Category ids are lowercase with underscores (see shared category defs). */
export function categoryName(id: string): string {
  const s = id.replace(/_+/g, ' ').trim();
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Caption under an item's name: "Phone · Black". */
export function categoryColorLine(category: string, color: string): string {
  return color ? `${categoryName(category)} · ${colorLabel(color)}` : categoryName(category);
}

/** Small round swatch for an item color (outlined so white/black stay visible). */
export function ColorDot({ color }: { color: string }) {
  const bg = colorSwatch(color);
  if (!bg) return null;
  return <span className="claims-dot" style={{ background: bg }} aria-hidden="true" />;
}

const SIZE = { medium: 48, large: 64, xlarge: 88 } as const;

/**
 * The category's expressive shape (same shape + tone on every screen, see lib/categoryStyle); `color`
 * adds a swatch badge in the corner so the item color reads at a glance in lists.
 */
export function CategoryAvatar({ category, color, size = 'medium' }: { category: string; color?: string; size?: keyof typeof SIZE }) {
  const bg = color ? colorSwatch(color) : undefined;
  return (
    <span className={`claims-avatar claims-avatar--${size}`} aria-hidden="true">
      <ShapeIcon shape={categoryShape(category)} tone={categoryTone(category)} icon={categoryIcon(category)} size={SIZE[size]} />
      {bg && <span className="claims-avatar__swatch" style={{ background: bg }} />}
    </span>
  );
}
