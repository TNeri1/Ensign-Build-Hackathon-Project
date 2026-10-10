import { useState } from 'react';
import { Button } from './m3/Button';
import { Icon } from './m3/Icon';
import type { IconName } from './m3/icons';
import './ItemPhoto.css';

interface Props {
  itemId: string;
  sensitive: boolean;
  /** Rounded thumbnail for list rows / cards, 64px by default (sensitive thumbnails always stay blurred). */
  small?: boolean;
  /** Icon shown when the photo cannot be loaded. */
  fallbackIcon?: IconName;
  /** Extra class, e.g. to size a thumbnail to its container (cards). */
  className?: string;
}

/**
 * Staff-only item photo. Sensitive photos render blurred until staff deliberately reveal them; list
 * thumbnails stay blurred. The blur is clipped inside the rounded frame so it never spills.
 */
export function ItemPhoto({ itemId, sensitive, small, fallbackIcon = 'image', className }: Props) {
  const extra = className ? ` ${className}` : '';
  const [revealed, setRevealed] = useState(false);
  const [failed, setFailed] = useState(false);
  const blurred = sensitive && (small || !revealed);
  const src = `/api/items/${itemId}/photo`;

  if (small) {
    return (
      <span className={`item-photo item-photo--small${extra}`}>
        {failed ? (
          <Icon name={fallbackIcon} size={24} className="item-photo__fallback" />
        ) : (
          <img
            className={`item-photo__img${blurred ? ' item-photo__img--blurred' : ''}`}
            src={src}
            alt={sensitive ? 'Sensitive photo (blurred)' : 'Found item'}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
        {sensitive && (
          <span className="item-photo__badge" title="Sensitive photo">
            <Icon name="lock" size={16} />
          </span>
        )}
      </span>
    );
  }

  return (
    <figure className={`item-photo item-photo--large${extra}`}>
      {failed ? (
        <span className="item-photo__empty">
          <Icon name={fallbackIcon} size={40} />
          <span className="md-typescale-body-medium">Photo unavailable</span>
        </span>
      ) : (
        <img
          className={`item-photo__img${blurred ? ' item-photo__img--blurred' : ''}`}
          src={src}
          alt={blurred ? 'Sensitive photo (blurred)' : 'Found item'}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      {sensitive && !failed && !revealed && (
        <figcaption className="item-photo__scrim">
          <span className="item-photo__scrim-icon">
            <Icon name="shield" size={24} />
          </span>
          <span className="item-photo__scrim-text md-typescale-title-small">Sensitive item</span>
          <span className="item-photo__scrim-hint md-typescale-body-small">May show IDs or payment cards</span>
          <Button variant="filled" icon="visibility" onClick={() => setRevealed(true)}>
            Reveal sensitive photo
          </Button>
        </figcaption>
      )}
      {sensitive && !failed && revealed && (
        <Button variant="tonal" icon="visibility_off" className="item-photo__hide" onClick={() => setRevealed(false)}>
          Hide photo
        </Button>
      )}
    </figure>
  );
}
