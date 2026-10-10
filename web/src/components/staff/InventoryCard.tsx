import { Link } from 'react-router-dom';
import type { ItemListRow } from '../../api/types';
import { ItemPhoto } from '../ItemPhoto';
import { ShapeIcon } from '../m3/ExpressiveShape';
import { Icon } from '../m3/Icon';
import { StatusChip } from '../m3/StatusChip';
import { categoryIcon } from '../../lib/categoryIcon';
import { categoryShape, categoryTone } from '../../lib/categoryStyle';
import { relativeTime } from '../../lib/format';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import './InventoryCard.css';

/**
 * One inventory item. Compact / medium: a horizontal row card (64px photo, title, caption, status).
 * Expanded: the same markup becomes a gallery card with a cover photo (CSS only).
 * Items without a photo show their category's expressive shape.
 */
export function InventoryCard({ item, categoryLabel }: { item: ItemListRow; categoryLabel: string }) {
  const icon = categoryIcon(item.category);
  return (
    <Link to={`/staff/items/${item.id}`} className="inv-card md-card--interactive">
      <span className={`inv-card__media${item.hasPhoto ? '' : ` inv-card__media--shape inv-card__media--${categoryTone(item.category)}`}`}>
        {item.hasPhoto ? (
          <ItemPhoto itemId={item.id} sensitive={!!item.sensitive} small fallbackIcon={icon} className="inv-card__photo" />
        ) : (
          <ShapeIcon shape={categoryShape(item.category)} tone={categoryTone(item.category)} icon={icon} size={64} className="inv-card__shape" />
        )}
      </span>
      <span className="inv-card__body">
        <span className="inv-card__title">{item.title}</span>
        <span className="inv-card__kind">
          <span>{categoryLabel}</span>
          <span className="inv-card__dot" aria-hidden="true">·</span>
          <span className="inv-card__swatch" style={{ background: colorSwatch(item.color) }} aria-hidden="true" />
          <span>{colorLabel(item.color)}</span>
        </span>
        <span className="inv-card__where">{item.foundArea} · {relativeTime(item.foundAt)}</span>
      </span>
      <span className="inv-card__trailing">
        <StatusChip state={item.state} />
        <span className={`inv-card__bin${item.binCode ? '' : ' inv-card__bin--none'}`}>
          {item.binCode ? (<><Icon name="warehouse" size={16} /> {item.binCode}</>) : 'No bin'}
        </span>
      </span>
    </Link>
  );
}
