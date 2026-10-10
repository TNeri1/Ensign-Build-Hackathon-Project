import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGet } from '../../api/useApi';
import type { Bin } from '../../api/types';
import { ItemPhoto } from '../../components/ItemPhoto';
import { CategoryAvatar } from '../../components/claims/CategoryAvatar';
import { CustodyTimeline, type CustodyEvent } from '../../components/staff/CustodyTimeline';
import { useCategories } from '../../components/staff/useCategories';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { ShapeIcon } from '../../components/m3/ExpressiveShape';
import { Icon } from '../../components/m3/Icon';
import { iconButtonClassName } from '../../components/m3/IconButton';
import type { IconName } from '../../components/m3/icons';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { PageHeader } from '../../components/m3/PageHeader';
import { StatusChip } from '../../components/m3/StatusChip';
import { categoryIcon } from '../../lib/categoryIcon';
import { categoryShape, categoryTone } from '../../lib/categoryStyle';
import { formatDateTime } from '../../lib/format';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import '../../components/claims/claims.css';
import './ItemDetail.css';

interface Detail {
  id: string; title: string; name: string | null; category: string; color: string; state: string; found_area: string; found_at: string;
  sensitive: number; photo_path: string | null; bin_id?: string | null;
  attributes: { key: string; value: string; is_public: number }[];
  custody: CustodyEvent[];
}

export function ItemDetail() {
  const { id } = useParams();
  const { data, error, reload } = useGet<Detail>(`/items/${id}`);
  const bins = useGet<Bin[]>('/bins').data;
  const { label, fieldLabel } = useCategories();
  const title = data?.title;
  useEffect(() => {
    if (title) document.title = `${title} · Lost & Found`;
  }, [title]);

  if (error) {
    return (
      <div className="app-page app-page--wide">
        <PageHeader title="Item" back="/staff" />
        <Alert kind="error" title="Couldn't load this item" action={<Button variant="text" onClick={reload}>Retry</Button>}>
          {error}
        </Alert>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="app-page app-page--wide">
        <PageHeader title="Item" back="/staff" />
        <LinearProgress label="Loading item" />
      </div>
    );
  }

  const bin = data.bin_id ? bins?.find((b) => b.id === data.bin_id) : undefined;
  const swatch = colorSwatch(data.color);

  return (
    <div className="app-page app-page--wide item-detail">
      <header className="item-detail__hero md-rise">
        <Link to="/staff" className={iconButtonClassName('standard', undefined, 'item-detail__back')} aria-label="Back" title="Back">
          <Icon name="arrow_back" size={24} />
        </Link>
        <div className="item-detail__hero-main">
          <CategoryAvatar category={data.category} color={data.color} size="xlarge" />
          <div className="item-detail__hero-text">
            <span className="item-detail__category">{label(data.category)} · {colorLabel(data.color)}</span>
            <h1 className="item-detail__title">{data.title}</h1>
            <span className="item-detail__subtitle">
              <StatusChip state={data.state} />
              {!!data.sensitive && (
                <span className="item-detail__flag">
                  <Icon name="shield" size={16} /> Sensitive
                </span>
              )}
            </span>
          </div>
        </div>
      </header>

      <div className="item-detail__layout">
        <div className="item-detail__primary">
          {data.photo_path ? (
            <ItemPhoto itemId={data.id} sensitive={!!data.sensitive} fallbackIcon={categoryIcon(data.category)} />
          ) : (
            <div className="item-detail__nophoto">
              <ShapeIcon shape={categoryShape(data.category)} tone={categoryTone(data.category)} icon={categoryIcon(data.category)} size={112} />
              <span className="md-typescale-body-medium">No photo</span>
            </div>
          )}

          <Card variant="filled" as="section" aria-labelledby="item-details-title" className="staff-card item-detail__card">
            <h2 id="item-details-title" className="claims-card-title item-detail__card-title">
              <ShapeIcon shape="cookie" tone="primary" icon="info" size={40} /> Details
            </h2>
            <dl className="item-detail__dl">
              <Row icon="location_on" term="Found where">{data.found_area}</Row>
              <Row icon="schedule" term="Found at">{formatDateTime(data.found_at)}</Row>
              <Row icon="palette" term="Color">
                <span className="item-detail__color">
                  {swatch && <span className="item-detail__swatch" style={{ background: swatch }} aria-hidden="true" />}
                  {colorLabel(data.color)}
                </span>
              </Row>
              <Row icon="warehouse" term="Storage bin">{bin ? `${bin.code} — ${bin.label}` : data.bin_id ? '…' : 'Not stored yet'}</Row>
              {data.attributes.map((a) => (
                <Row key={a.key} icon={a.is_public ? 'visibility' : 'lock'} term={fieldLabel(data.category, a.key)} isPrivate={!a.is_public}>
                  {a.value}
                </Row>
              ))}
            </dl>
            {data.attributes.some((a) => !a.is_public) && (
              <p className="item-detail__legend">
                <Icon name="lock" size={16} /> Private: never shown publicly, used for claim questions.
              </p>
            )}
          </Card>
        </div>

        <Card variant="filled" as="section" aria-labelledby="custody-title" className="staff-card item-detail__card item-detail__custody">
          <h2 id="custody-title" className="claims-card-title item-detail__card-title">
            <ShapeIcon shape="clover" tone="tertiary" icon="history" size={40} /> Chain of custody
          </h2>
          <CustodyTimeline events={data.custody} />
        </Card>
      </div>
    </div>
  );
}

function Row({ icon, term, isPrivate, children }: { icon: IconName; term: string; isPrivate?: boolean; children: React.ReactNode }) {
  return (
    <div className={`item-detail__row${isPrivate ? ' item-detail__row--private' : ''}`}>
      <dt>
        <Icon name={icon} size={18} className="item-detail__row-icon" />
        <span>{term}</span>
        {isPrivate && <span className="md-visually-hidden"> (private)</span>}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
