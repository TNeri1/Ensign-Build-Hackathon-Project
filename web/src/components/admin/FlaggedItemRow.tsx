import { Checkbox } from '../m3/Checkbox';
import { Icon } from '../m3/Icon';
import { categoryIcon } from '../../lib/categoryIcon';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import { formatDate } from '../../lib/format';
import './FlaggedItemRow.css';

export interface FlaggedItem {
  id: string;
  category: string;
  categoryLabel: string;
  color: string;
  foundArea: string;
  foundAt: string;
  sensitive: number;
  daysOverdue: number;
}

interface Props {
  item: FlaggedItem;
  selected: boolean;
  onToggle: () => void;
}

/** One overdue item: the whole row is the checkbox label, so it is a single large hit target. */
export function FlaggedItemRow({ item, selected, onToggle }: Props) {
  const swatch = colorSwatch(item.color);
  return (
    <li className={`admin-flagged${selected ? ' admin-flagged--selected' : ''}`}>
      <Checkbox
        checked={selected}
        onChange={onToggle}
        label={
          <span className="admin-flagged__body">
            <span className="admin-flagged__avatar" aria-hidden="true">
              <Icon name={categoryIcon(item.category)} size={24} />
            </span>
            <span className="admin-flagged__text">
              <span className="admin-flagged__headline">
                {item.categoryLabel}
                {item.sensitive ? <Icon name="lock" size={16} className="admin-flagged__lock" title="Sensitive item" /> : null}
              </span>
              <span className="admin-flagged__supporting">
                <span className="admin-flagged__color">
                  {swatch && <span className="admin-flagged__swatch" style={{ background: swatch }} aria-hidden="true" />}
                  {colorLabel(item.color)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{item.foundArea}</span>
                {item.foundAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Found {formatDate(item.foundAt)}</span>
                  </>
                )}
              </span>
            </span>
            <span className="admin-flagged__overdue">
              <Icon name="schedule" size={16} />
              {item.daysOverdue} days overdue
            </span>
          </span>
        }
      />
    </li>
  );
}
