import { Card } from '../../components/m3/Card';
import { CategoryAvatar, ColorTag, MetaLine } from '../../components/public/ItemMeta';
import { formatDate } from '../../lib/format';

export interface PublicItem {
  id: string; category: string; categoryLabel: string; color: string; area: string; foundDate: string;
  details: { label: string; value: string }[];
}

/** One public search result: category, color, where/when found and public details only. */
export function FoundItemCard({ item }: { item: PublicItem }) {
  // foundDate is a plain YYYY-MM-DD; anchor at noon so no timezone shifts it a day.
  const date = formatDate(`${item.foundDate}T12:00:00`) || item.foundDate;
  return (
    <Card variant="outlined" className="search-card">
      <div className="search-card__head">
        <CategoryAvatar category={item.category} />
        <div className="search-card__titles">
          <h3>{item.categoryLabel}</h3>
          <ColorTag color={item.color} />
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
    </Card>
  );
}
