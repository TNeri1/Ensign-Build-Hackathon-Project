import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { Icon } from '../../components/m3/Icon';
import { CategoryAvatar, ColorTag, MetaLine } from '../../components/public/ItemMeta';
import { formatDate } from '../../lib/format';

export interface PublicItem {
  id: string; category: string; categoryLabel: string; color: string; area: string; foundDate: string;
  /** The item's own name when recorded (e.g. "AirPods case"); the card title falls back to the category. */
  name: string | null;
  details: { label: string; value: string }[];
  /** Shelved items can be claimed straight from the listing. */
  claimable: boolean;
}

/** One public search result: category, color, where/when found and public details only. */
export function FoundItemCard({ item, onClaim }: { item: PublicItem; onClaim: (item: PublicItem) => void }) {
  // foundDate is a plain YYYY-MM-DD; anchor at noon so no timezone shifts it a day.
  const date = formatDate(`${item.foundDate}T12:00:00`) || item.foundDate;
  return (
    <Card variant="outlined" className="search-card">
      <div className="search-card__head">
        <CategoryAvatar category={item.category} />
        <div className="search-card__titles">
          <h3>{item.name ?? item.categoryLabel}</h3>
          <span className="search-card__sub">
            {item.name && <span className="search-card__category">{item.categoryLabel}</span>}
            <ColorTag color={item.color} />
          </span>
        </div>
      </div>
      <div className="search-card__meta">
        <MetaLine icon="location_on">{item.area}</MetaLine>
        <MetaLine icon="event">Found {date}</MetaLine>
      </div>
      {item.details.length > 0 && (
        <dl className="search-card__details">
          {item.details.map((d) => (
            <div key={d.label}><dt>{d.label}</dt><dd>{d.value}</dd></div>
          ))}
        </dl>
      )}
      <div className="search-card__action">
        {item.claimable ? (
          <Button variant="tonal" icon="verified" onClick={() => onClaim(item)}>This is mine</Button>
        ) : (
          <p className="search-card__note"><Icon name="hourglass_empty" size={18} /> Still being logged. File a lost report to be notified.</p>
        )}
      </div>
    </Card>
  );
}
