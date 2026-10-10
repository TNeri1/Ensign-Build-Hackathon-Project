import { useState, type FormEvent } from 'react';
import { COLORS } from '@vlf/shared';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { ChoiceChips } from '../../components/m3/Chips';
import { PageHeader } from '../../components/m3/PageHeader';
import { TextField } from '../../components/m3/TextField';
import { categoryIcon } from '../../lib/categoryIcon';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import { ReportReceived } from './ReportReceived';
import './ReportLost.css';

const local = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const COLOR_OPTIONS = COLORS.map((c) => ({ value: c as string, label: colorLabel(c) }));

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

  if (done) return <ReportReceived email={email} onAgain={() => setDone(false)} />;

  return (
    <div className="app-page report">
      <PageHeader title="Report a lost item" subtitle="Tell us what you lost. If staff find a match, we will email you a link to claim it." />
      <form onSubmit={submit} className="report-form">
        <fieldset className="report-section">
          <legend className="report-section__title">What did you lose?</legend>
          <div className="report-group">
            <span className="report-group__label">Category</span>
            <ChoiceChips ariaLabel="Category" value={category} onChange={setCategory}
              options={cats.map((c) => ({ value: c.id, label: c.label, icon: categoryIcon(c.id) }))} />
          </div>
          <div className="report-group">
            <span className="report-group__label">Color</span>
            <ChoiceChips ariaLabel="Color" value={color} onChange={(c) => { setColor(c); setError(''); }}
              options={COLOR_OPTIONS} swatch={colorSwatch} />
          </div>
          <TextField label="Description" value={description} onChange={setDescription} multiline rows={3}
            supportingText="Brand, case, stickers, anything that helps us recognise it." />
        </fieldset>

        <fieldset className="report-section">
          <legend className="report-section__title">Where and when?</legend>
          <TextField label="Where did you lose it?" value={area} onChange={setArea} required placeholder="e.g. Gate 3" leadingIcon="location_on" />
          <div className="report-pair">
            <TextField label="Lost after" type="datetime-local" value={start} onChange={setStart} required />
            <TextField label="Lost before" type="datetime-local" value={end} onChange={setEnd} required />
          </div>
        </fieldset>

        <fieldset className="report-section">
          <legend className="report-section__title">How can we reach you?</legend>
          <TextField label="Your email" type="email" value={email} onChange={setEmail} required leadingIcon="mail" autoComplete="email"
            supportingText="Only used to contact you about this item." />
        </fieldset>

        {error && <Alert kind="error">{error}</Alert>}
        <div className="report-actions">
          <Button type="submit" size="large" full icon="send" disabled={!category} className="report-submit">Submit report</Button>
          {!category && <p className="report-actions__hint">Choose a category to continue.</p>}
        </div>
      </form>
    </div>
  );
}
