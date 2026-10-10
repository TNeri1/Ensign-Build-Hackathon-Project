import { useState } from 'react';
import { COLORS } from '@vlf/shared';
import { useGet } from '../../api/useApi';
import { Alert } from '../../components/m3/Alert';
import { ChoiceChips } from '../../components/m3/Chips';
import { EmptyState } from '../../components/m3/EmptyState';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { LinkButton } from '../../components/m3/LinkButton';
import { PageHeader } from '../../components/m3/PageHeader';
import { Select } from '../../components/m3/Select';
import { TextField } from '../../components/m3/TextField';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import { FoundItemCard, type PublicItem } from './FoundItemCard';
import './Search.css';

const COLOR_OPTIONS = [{ value: '', label: 'Any color' }, ...COLORS.map((c) => ({ value: c as string, label: colorLabel(c) }))];

export function Search() {
  const cats = useGet<{ id: string; label: string }[]>('/public/categories').data ?? [];
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [area, setArea] = useState('');
  const qs = new URLSearchParams(Object.entries({ category, color, area }).filter(([, v]) => v)).toString();
  const { data, loading, error } = useGet<PublicItem[]>(`/public/items${qs ? `?${qs}` : ''}`);
  const filtered = Boolean(qs);

  return (
    <div className="app-page app-page--wide search">
      <PageHeader title="Found items" subtitle="Items staff have found at the venue and are holding for their owners." />

      <section className="search-filters" aria-label="Filters">
        <div className="search-filters__fields">
          <Select label="Category" value={category} onChange={setCategory} placeholder="Any category" leadingIcon="category"
            options={cats.map((c) => ({ value: c.id, label: c.label }))} />
          <TextField label="Area" value={area} onChange={setArea} placeholder="e.g. Gate 3" leadingIcon="search"
            trailingIcon={area ? 'close' : undefined} onTrailingIconClick={area ? () => setArea('') : undefined} trailingIconLabel="Clear area" />
        </div>
        <div className="search-filters__colors">
          <ChoiceChips ariaLabel="Color" options={COLOR_OPTIONS} value={color} onChange={setColor}
            swatch={(c) => (c ? colorSwatch(c) : undefined)} />
        </div>
      </section>

      <Alert kind="info">
        For security, photos and identifying details are not shown. File a lost report and we will contact you if we find a match.
      </Alert>

      <section className="search-results" aria-label="Results" aria-busy={loading}>
        <div className="search-results__bar">
          <p className="search-results__count" aria-live="polite">
            {data ? `${data.length} ${data.length === 1 ? 'item' : 'items'}${filtered ? ' match your filters' : ' being held'}` : 'Searching…'}
          </p>
          <div className="search-results__progress">{loading && <LinearProgress label="Searching" />}</div>
        </div>
        {error && <Alert kind="error">{error}</Alert>}
        {data && data.length === 0 && (
          <EmptyState icon="travel_explore" title="No matching items yet"
            body="Try fewer filters, or file a lost report and we will email you if something turns up."
            action={<LinkButton to="/report" variant="tonal" icon="assignment">File a lost report</LinkButton>} />
        )}
        {data && data.length > 0 && (
          <ul className="search-grid" role="list">
            {data.map((i) => <li key={i.id}><FoundItemCard item={i} /></li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
