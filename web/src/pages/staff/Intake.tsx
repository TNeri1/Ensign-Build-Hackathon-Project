import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '@vlf/shared';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import type { Bin, CategoryInfo } from '../../api/types';
import { ChipPicker } from '../../components/ChipPicker';
import { CategoryFields } from '../../components/CategoryFields';

const BIN_KEY = 'vlf:lastBin';
const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export function Intake() {
  const cats = useGet<CategoryInfo[]>('/categories').data ?? [];
  const bins = useGet<Bin[]>('/bins').data ?? [];
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [area, setArea] = useState('');
  const [foundAt, setFoundAt] = useState(toLocalInput(new Date()));
  const [binId, setBinId] = useState(localStorage.getItem(BIN_KEY) ?? '');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState('');
  const [busy, setBusy] = useState(false);

  const def = useMemo(() => cats.find((c) => c.id === category), [cats, category]);
  useEffect(() => setFields({}), [category]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!color) return setError('Pick a color');
    setBusy(true); setError('');
    const fd = new FormData();
    fd.append('data', JSON.stringify({
      category, color, foundArea: area, foundAt: new Date(foundAt).toISOString(), binId: binId || undefined, fields,
    }));
    if (photo) fd.append('photo', photo);
    try {
      const { id } = await api.post<{ id: string }>('/items', fd);
      if (binId) localStorage.setItem(BIN_KEY, binId);
      setSavedId(id);
      setCategory(''); setColor(''); setFields({}); setPhoto(null);
      setFoundAt(toLocalInput(new Date()));
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="stack">
      <h1>Log found item</h1>
      {savedId && <p className="ok">Saved. <Link to={`/staff/items/${savedId}`}>View</Link> — ready for the next one.</p>}
      <label className="field"><span>Photo</span>
        <input type="file" accept="image/*" capture="environment" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      </label>
      <div className="field"><span>Category</span>
        <ChipPicker options={cats.map((c) => ({ value: c.id, label: c.label }))} value={category} onChange={setCategory} />
      </div>
      <div className="field"><span>Color</span>
        <ChipPicker options={COLORS.map((c) => ({ value: c, label: c }))} value={color as never} onChange={setColor} />
      </div>
      <label className="field"><span>Found where (area / zone)</span>
        <input value={area} onChange={(e) => setArea(e.target.value)} required placeholder="e.g. Gate 3, Section 112" />
      </label>
      <label className="field"><span>Found at</span>
        <input type="datetime-local" value={foundAt} onChange={(e) => setFoundAt(e.target.value)} required />
      </label>
      {def && <CategoryFields fields={def.fields} values={fields} onChange={(n, v) => setFields((f) => ({ ...f, [n]: v }))} />}
      <label className="field"><span>Storage bin</span>
        <select value={binId} onChange={(e) => setBinId(e.target.value)}>
          <option value="">Not stored yet</option>
          {bins.map((b) => <option key={b.id} value={b.id}>{b.code} — {b.label}</option>)}
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      <button className="primary big" disabled={busy || !category}>{busy ? 'Saving…' : 'Save item'}</button>
    </form>
  );
}
