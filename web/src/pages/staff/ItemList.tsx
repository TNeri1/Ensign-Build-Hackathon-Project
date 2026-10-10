import { useMemo, useState } from 'react';
import { useGet } from '../../api/useApi';
import type { ItemListRow } from '../../api/types';
import { ItemPhoto } from '../../components/ItemPhoto';
import { useCategories } from '../../components/staff/useCategories';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { AssistChip, ChoiceChips } from '../../components/m3/Chips';
import { EmptyState } from '../../components/m3/EmptyState';
import { Fab } from '../../components/m3/Fab';
import { Icon } from '../../components/m3/Icon';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { LinkButton } from '../../components/m3/LinkButton';
import { List, ListItem } from '../../components/m3/ListItem';
import { PageHeader } from '../../components/m3/PageHeader';
import { StatusChip, stateLabel } from '../../components/m3/StatusChip';
import { categoryIcon } from '../../lib/categoryIcon';
import { relativeTime } from '../../lib/format';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import './ItemList.css';

/** Lifecycle order for the state filter. */
const STATE_ORDER = ['found', 'stored', 'claim_pending', 'verified', 'released', 'disposed'];
const ALL = 'all';

export function ItemList() {
  const { data, error, loading, reload } = useGet<ItemListRow[]>('/items');
  const { label } = useCategories();
  const [filter, setFilter] = useState<string>(ALL);

  const items = useMemo(() => data ?? [], [data]);
  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const i of items) c.set(i.state, (c.get(i.state) ?? 0) + 1);
    return c;
  }, [items]);
  const filterOptions = [
    { value: ALL, label: `All ${items.length}` },
    ...STATE_ORDER.filter((s) => counts.has(s)).map((s) => ({ value: s, label: `${capitalize(stateLabel(s))} ${counts.get(s)}` })),
  ];
  const shown = filter === ALL ? items : items.filter((i) => i.state === filter);
  const total = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
  const subtitle = !data ? 'Found items at this venue' : filter === ALL ? total : `${total} · showing ${shown.length} ${stateLabel(filter)}`;

  return (
    <div className="app-page app-page--wide item-list">
      <PageHeader
        title="Inventory"
        subtitle={subtitle}
        actions={<AssistChip label="Bins & labels" icon="warehouse" to="/staff/bins" />}
      />
      {loading && !data && <LinearProgress label="Loading inventory" />}
      {error && (
        <Alert kind="error" title="Couldn't load inventory" action={<Button variant="text" onClick={reload}>Retry</Button>}>
          {error}
        </Alert>
      )}
      {data && items.length === 0 && (
        <EmptyState
          icon="inventory_2"
          title="No items yet"
          body="Items you log will appear here with their status and bin."
          action={<LinkButton to="/staff/intake" icon="add">Log item</LinkButton>}
        />
      )}
      {items.length > 0 && (
        <>
          <div className="item-list__filters">
            <ChoiceChips options={filterOptions} value={filter} onChange={setFilter} ariaLabel="Filter by state" />
          </div>
          {shown.length === 0 ? (
            <EmptyState icon="filter_list" title="No items in this state" action={<Button variant="text" onClick={() => setFilter(ALL)}>Show all</Button>} />
          ) : (
            <div className="item-list__surface">
              <List className="item-list__list">
                {shown.map((i) => (
                  <ListItem
                    key={i.id}
                    to={`/staff/items/${i.id}`}
                    leading={
                      i.hasPhoto ? (
                        <ItemPhoto itemId={i.id} sensitive={!!i.sensitive} small fallbackIcon={categoryIcon(i.category)} />
                      ) : (
                        <span className="item-list__avatar">
                          <Icon name={categoryIcon(i.category)} size={24} />
                        </span>
                      )
                    }
                    headline={
                      <span className="item-list__headline">
                        <span>{label(i.category)}</span>
                        <span className="item-list__dot" aria-hidden="true">·</span>
                        <span className="item-list__swatch" style={{ background: colorSwatch(i.color) }} aria-hidden="true" />
                        <span className="item-list__color">{colorLabel(i.color)}</span>
                      </span>
                    }
                    supporting={`${i.foundArea} · ${relativeTime(i.foundAt)}`}
                    trailing={
                      <span className="item-list__trailing">
                        <StatusChip state={i.state} />
                        <span className="item-list__bin">
                          {i.binCode ? (<><Icon name="warehouse" size={14} /> {i.binCode}</>) : 'No bin'}
                        </span>
                      </span>
                    }
                  />
                ))}
              </List>
            </div>
          )}
        </>
      )}
      {/* The navigation rail already shows a "Log item" FAB on medium+ windows. */}
      <Fab icon="add" label="Log item" to="/staff/intake" className="app-fab item-list__fab md-only-compact" />
    </div>
  );
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
