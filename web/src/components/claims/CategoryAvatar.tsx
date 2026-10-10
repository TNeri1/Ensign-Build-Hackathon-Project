import { Icon } from '../m3/Icon';
import { categoryIcon } from '../../lib/categoryIcon';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import './claims.css';

/** "id_card" -> "Id card". Category ids are lowercase with underscores (see shared category defs). */
export function categoryName(id: string): string {
  const s = id.replace(/_+/g, ' ').trim();
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** "Phone · Red" */
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

/**
 * 40px tonal circle with the category icon (56px when size="large"); `color` adds a swatch badge
 * in the corner so the item color reads at a glance in lists.
 */
export function CategoryAvatar({ category, color, size = 'medium' }: { category: string; color?: string; size?: 'medium' | 'large' }) {
  const bg = color ? colorSwatch(color) : undefined;
  return (
    <span className={`claims-avatar${size === 'large' ? ' claims-avatar--large' : ''}`} aria-hidden="true">
      <Icon name={categoryIcon(category)} size={size === 'large' ? 28 : 24} />
      {bg && <span className="claims-avatar__swatch" style={{ background: bg }} />}
    </span>
  );
}
