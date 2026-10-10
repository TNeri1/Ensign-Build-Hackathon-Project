import { useState } from 'react';

interface Props { itemId: string; sensitive: boolean; small?: boolean }

/** Sensitive photos render blurred until staff deliberately reveal them; list thumbnails stay blurred. */
export function ItemPhoto({ itemId, sensitive, small }: Props) {
  const [revealed, setRevealed] = useState(false);
  const blurred = sensitive && (small || !revealed);
  return (
    <span className="photo-wrap">
      <img className={`${small ? 'thumb' : 'photo'}${blurred ? ' blurred' : ''}`} src={`/api/items/${itemId}/photo`} alt="Found item" loading="lazy" />
      {sensitive && !small && (
        <button type="button" onClick={() => setRevealed((r) => !r)}>{revealed ? 'Hide photo' : 'Reveal sensitive photo'}</button>
      )}
    </span>
  );
}
