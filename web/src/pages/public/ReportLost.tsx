import { useState, type FormEvent } from 'react';
import { COLORS } from '@vlf/shared';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import { ChipPicker } from '../../components/ChipPicker';

const local = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export function ReportLost() {
  const cats = useGet<{ id: string; label: string }[]>('/public/categories').data ?? [];
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [area, setArea] = useState('');
  const [start, setStart] = useState(local(new Date(Date.now() - 6 * 3600_000)));
  const [end, setEnd] = useState(local(new Date()));
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!color) return setError('Pick a color');
    try {
      await api.post('/public/lost-reports', {
        category, color, area, description, contactEmail: email,
        windowStart: new Date(start).toISOString(), windowEnd: new Date(end).toISOString(),
      });
      setDone(true); setError('');
    } catch (err) { setError((err as Error).message); }
  }

  if (done) {
    return (
      <div className="stack">
        <h1>Report received</h1>
        <p>If an item matching your description is found, we will email you a link to verify and claim it.</p>
        <button onClick={() => setDone(false)}>File another report</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="stack">
      <h1>Report a lost item</h1>
      <div className="field"><span>Category</span>
        <ChipPicker options={cats.map((c) => ({ value: c.id, label: c.label }))} value={category} onChange={setCategory} />
      </div>
      <div className="field"><span>Color</span>
        <ChipPicker options={COLORS.map((c) => ({ value: c, label: c }))} value={color as never} onChange={setColor} />
      </div>
      <label className="field"><span>Where did you lose it?</span><input value={area} onChange={(e) => setArea(e.target.value)} required placeholder="e.g. Gate 3" /></label>
      <label className="field"><span>Lost between</span><input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required /></label>
      <label className="field"><span>and</span><input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required /></label>
      <label className="field"><span>Description</span><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      <label className="field"><span>Your email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="primary big" disabled={!category}>Submit report</button>
    </form>
  );
}
