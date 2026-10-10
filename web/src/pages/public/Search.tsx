import { useState } from 'react';
import { COLORS } from '@vlf/shared';
import { useGet } from '../../api/useApi';

interface PublicItem {
  id: string; categoryLabel: string; color: string; area: string; foundDate: string;
  details: { label: string; value: string }[];
}

export function Search() {
  const cats = useGet<{ id: string; label: string }[]>('/public/categories').data ?? [];
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [area, setArea] = useState('');
  const qs = new URLSearchParams(Object.entries({ category, color, area }).filter(([, v]) => v)).toString();
  const { data, loading } = useGet<PublicItem[]>(`/public/items${qs ? `?${qs}` : ''}`);

  return (
    <div className="stack">
      <h1>Found items</h1>
      <p className="muted">For security, photos and identifying details are not shown. File a lost report and we will contact you if we find a match.</p>
      <div className="card stack">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Any category</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="">Any color</option>
          {COLORS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area (e.g. Gate 3)" />
      </div>
      {loading && <p className="muted">Searching…</p>}
      {data && data.length === 0 && <p>No matching items yet.</p>}
      <ul className="list">
        {data?.map((i) => (
          <li key={i.id}>
            <strong>{i.categoryLabel}</strong> · {i.color} · {i.area} · {i.foundDate}
            {i.details.length > 0 && <div className="muted">{i.details.map((d) => `${d.label}: ${d.value}`).join(' · ')}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
