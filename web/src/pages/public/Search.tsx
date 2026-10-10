import { useState } from 'react';
import { COLORS } from '@vlf/shared';
import { useGet } from '../../api/useApi';
import { Alert } from '../../components/m3/Alert';
import { ChoiceChips } from '../../components/m3/Chips';
import { ShapeIcon } from '../../components/m3/ExpressiveShape';
import { HeroHeader } from '../../components/m3/HeroHeader';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { LinkButton } from '../../components/m3/LinkButton';
import { Select } from '../../components/m3/Select';
import { TextField } from '../../components/m3/TextField';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import { FoundItemCard, type PublicItem } from './FoundItemCard';
import { ClaimDialog } from './ClaimDialog';
import './Search.css';

const COLOR_OPTIONS = [{ value: '', label: 'Any color' }, ...COLORS.map((c) => ({ value: c as string, label: colorLabel(c) }))];

export function Search() {
  const cats = useGet<{ id: string; label: string }[]>('/public/categories').data ?? [];
  const [claiming, setClaiming] = useState<PublicItem | null>(null);
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [area, setArea] = useState('');
  const qs = new URLSearchParams(Object.entries({ category, color, area }).filter(([, v]) => v)).toString();
  const { data, loading, error } = useGet<PublicItem[]>(`/public/items${qs ? `?${qs}` : ''}`);
  const filtered = Boolean(qs);

  return (
    <div className="app-page app-page--wide search">
      <HeroHeader title="Found items" icon="travel_explore" shape="cookie"
        subtitle="Items staff have found at the venue and are holding for their owners.">
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
      </HeroHeader>

      <Alert kind="info">
        For security, photos and identifying details are not shown. See yours? Tap <strong>This is mine</strong> and answer a few questions only the owner would know. Not listed yet? File a lost report and we will email you if it turns up.
      </Alert>

      <section className="search-results" aria-label="Results" aria-busy={loading}>
        <div className="search-results__bar">
          <p className="search-results__count" aria-live="polite">
            {data ? <><strong>{data.length}</strong> {`${data.length === 1 ? 'item' : 'items'}${filtered ? ' match your filters' : ' being held'}`}</> : 'Searching…'}
          </p>
          <div className="search-results__progress">{loading && <LinearProgress label="Searching" />}</div>
        </div>
        {error && <Alert kind="error">{error}</Alert>}
        {data && data.length === 0 && (
          <div className="search-empty md-rise">
            <ShapeIcon shape="flower" tone="tertiary" icon="travel_explore" size={112} spin />
            <h2 className="search-empty__title">No matching items yet</h2>
            <p className="search-empty__body">Try fewer filters, or file a lost report and we will email you if something turns up.</p>
            <LinkButton to="/report" variant="filled" icon="assignment">File a lost report</LinkButton>
          </div>
        )}
        {data && data.length > 0 && (
          <ul className="search-grid" role="list">
            {data.map((i) => <li key={i.id} className="md-rise"><FoundItemCard item={i} onClaim={setClaiming} /></li>)}
          </ul>
        )}
      </section>
      <ClaimDialog item={claiming} onClose={() => setClaiming(null)} />
    </div>
  );
}
