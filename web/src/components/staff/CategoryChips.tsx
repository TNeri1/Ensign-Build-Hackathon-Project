import { ShapeIcon } from '../m3/ExpressiveShape';
import { useRovingRadio } from '../m3/rovingRadio';
import { categoryIcon } from '../../lib/categoryIcon';
import { categoryShape, categoryTone } from '../../lib/categoryStyle';
import './CategoryChips.css';

interface Props {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}

/**
 * Single-select category chips (radio semantics, roving focus like ChoiceChips), each led by the
 * category's expressive shape so categories look the same as in the inventory. 48px touch targets.
 */
export function CategoryChips({ options, value, onChange, ariaLabel }: Props) {
  const roving = useRovingRadio(options.map((o) => o.value), value, onChange);
  return (
    <div className="category-chips" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`category-chip${selected ? ' category-chip--selected' : ''}`}
            onClick={() => onChange(o.value)}
            {...roving.itemProps(i)}
          >
            <ShapeIcon
              shape={selected ? 'sunny' : categoryShape(o.value)}
              tone={selected ? 'primary' : categoryTone(o.value)}
              icon={selected ? 'check' : categoryIcon(o.value)}
              size={32}
              className="category-chip__shape"
            />
            <span className="category-chip__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
