import { Icon } from '../m3/Icon';
import type { IconName } from '../m3/icons';
import { categoryIcon } from '../../lib/categoryIcon';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import './ItemMeta.css';

/** Tonal circle with the category's icon (40px; 56px when large). */
export function CategoryAvatar({ category, large = false }: { category: string; large?: boolean }) {
  return (
    <span className={large ? 'pub-avatar pub-avatar--large' : 'pub-avatar'} aria-hidden="true">
      <Icon name={categoryIcon(category)} size={large ? 28 : 24} />
    </span>
  );
}

/** Color swatch dot + color name, e.g. "● Black". */
export function ColorTag({ color }: { color: string }) {
  const swatch = colorSwatch(color);
  return (
    <span className="pub-color">
      {swatch && <span className="pub-color__dot" style={{ background: swatch }} aria-hidden="true" />}
      {colorLabel(color)}
    </span>
  );
}

/** One line of item metadata with a small leading icon (location, date...). */
export function MetaLine({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <span className="pub-meta">
      <Icon name={icon} size={18} className="pub-meta__icon" />
      <span>{children}</span>
    </span>
  );
}

/** Best-effort category id from a display label ("Payment card" -> "payment_card") for the icon. */
export function categoryIdFromLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}
