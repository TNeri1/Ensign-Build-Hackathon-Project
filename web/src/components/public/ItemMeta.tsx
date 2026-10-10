import { Icon } from '../m3/Icon';
import type { IconName } from '../m3/icons';
import { ShapeIcon } from '../m3/ExpressiveShape';
import { categoryIcon } from '../../lib/categoryIcon';
import { categoryShape, categoryTone } from '../../lib/categoryStyle';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import './ItemMeta.css';

/** The category's icon in its own expressive shape + tone (same on every screen). 56px; 72px when large. */
export function CategoryAvatar({ category, large = false, size }: { category: string; large?: boolean; size?: number }) {
  return (
    <ShapeIcon shape={categoryShape(category)} tone={categoryTone(category)} icon={categoryIcon(category)}
      size={size ?? (large ? 72 : 56)} className="pub-avatar" />
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

/** One line of item metadata with a small leading icon (location, date...); `pill` draws it as a tonal tag. */
export function MetaLine({ icon, pill = false, children }: { icon: IconName; pill?: boolean; children: React.ReactNode }) {
  return (
    <span className={pill ? 'pub-meta pub-meta--pill' : 'pub-meta'}>
      <Icon name={icon} size={18} className="pub-meta__icon" />
      <span>{children}</span>
    </span>
  );
}

/** Best-effort category id from a display label ("Payment card" -> "payment_card") for the icon. */
export function categoryIdFromLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}
