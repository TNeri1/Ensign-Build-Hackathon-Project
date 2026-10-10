import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, ITEM_NAME_MAX, itemTitle, type VisionSuggestion } from '@vlf/shared';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import type { Bin, CategoryInfo } from '../../api/types';
import { CategoryFields } from '../../components/CategoryFields';
import { CategoryChips } from '../../components/staff/CategoryChips';
import { FormSection } from '../../components/staff/FormSection';
import { PhotoPicker } from '../../components/staff/PhotoPicker';
import { PhotoAssistNote } from '../../components/staff/PhotoAssistNote';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { ChoiceChips } from '../../components/m3/Chips';
import { PageHeader } from '../../components/m3/PageHeader';
import { Select } from '../../components/m3/Select';
import { useSnackbar } from '../../components/m3/Snackbar';
import { TextField } from '../../components/m3/TextField';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import { applySuggestion } from '../../lib/applySuggestion';
import { usePhotoAssist } from './usePhotoAssist';
import '../../components/claims/claims.css';
import './Intake.css';

const BIN_KEY = 'vlf:lastBin';
const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const COLOR_OPTIONS = COLORS.map((c) => ({ value: c as string, label: colorLabel(c) }));

function readLastBin(): string {
  try { return localStorage.getItem(BIN_KEY) ?? ''; } catch { return ''; }
}

export function Intake() {
  const cats = useGet<CategoryInfo[]>('/categories').data ?? [];
  const bins = useGet<Bin[]>('/bins').data ?? [];
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [area, setArea] = useState('');
  const [foundAt, setFoundAt] = useState(toLocalInput(new Date()));
  const [binId, setBinId] = useState(readLastBin);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const def = useMemo(() => cats.find((c) => c.id === category), [cats, category]);

  // Latest form values for merging a photo suggestion that arrives asynchronously.
  const draft = useRef({ category, name, color, fields });
  draft.current = { category, name, color, fields };
  const onSuggestion = useCallback((sug: VisionSuggestion) => {
    const { draft: next, filled } = applySuggestion(draft.current, sug, cats);
    setCategory(next.category); setName(next.name); setColor(next.color); setFields(next.fields);
    if (next.color && error === 'Pick a color') setError('');
    return filled;
  }, [cats, error]);
  const assist = usePhotoAssist(onSuggestion);

  // Read each new photo once, as soon as both the photo and the model status are known (either order).
  const autoRead = useRef<File | null>(null);
  useEffect(() => {
    if (photo && assist.available && autoRead.current !== photo) {
      autoRead.current = photo;
      void assist.run(photo);
    }
  }, [photo, assist.available, assist.run]);

  function choosePhoto(file: File | null) {
    setPhoto(file);
    if (!file) assist.reset();
  }

  function chooseCategory(next: string) {
    if (next !== category) setFields({});
    setCategory(next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!color) return setError('Pick a color');
    setBusy(true); setError('');
    const fd = new FormData();
    fd.append('data', JSON.stringify({
      category, name: name.trim() || undefined, color, foundArea: area, foundAt: new Date(foundAt).toISOString(), binId: binId || undefined, fields,
    }));
    if (photo) fd.append('photo', photo);
    try {
      const { id } = await api.post<{ id: string }>('/items', fd);
      if (binId) { try { localStorage.setItem(BIN_KEY, binId); } catch { /* storage unavailable */ } }
      setCategory(''); setName(''); setColor(''); setFields({}); setPhoto(null); assist.reset();
      setFoundAt(toLocalInput(new Date()));
      snackbar.show('Item saved', { actionLabel: 'View', onAction: () => navigate(`/staff/items/${id}`) });
      window.scrollTo({ top: 0 });
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="app-page intake">
      <PageHeader title="Log found item" subtitle="Photo, category, color, where. About 20 seconds." back="/staff" />
      <div className="intake__layout">
        <FormSection icon="photo_camera" title="Photo" shape="sunny" tone="primary" className="intake__section intake__photo">
          <PhotoPicker file={photo} onChange={choosePhoto} />
          <PhotoAssistNote state={assist.state} canRun={!!photo && assist.available && assist.state.kind !== 'reading'}
            onRun={() => photo && void assist.run(photo)} />
        </FormSection>

        <div className="intake__main">
          <FormSection icon="category" title="What is it" shape="clover" tone="tertiary" className="intake__section">
            <div className="intake__group">
              <span className="intake__label">Category *</span>
              <CategoryChips
                options={cats.map((c) => ({ value: c.id, label: c.label }))}
                value={category}
                onChange={chooseCategory}
                ariaLabel="Category"
              />
            </div>
            <TextField
              label="Item name"
              value={name}
              onChange={(v) => setName(v.slice(0, ITEM_NAME_MAX))}
              required={!!def?.nameRequired}
              leadingIcon="label"
              placeholder="e.g. iPhone, Leather wallet, AirPods case"
              supportingText={
                def?.nameRequired
                  ? `Required for ${def.label}. Shown publicly as the item's heading; no owner-only details.`
                  : `Shown publicly as the heading; no owner-only details. Empty shows "${itemTitle(null, def?.label ?? 'Category', fields.brand)}".`
              }
              name="itemName"
              autoComplete="off"
            />
            <div className="intake__group">
              <span className="intake__label">Color *</span>
              <ChoiceChips
                options={COLOR_OPTIONS}
                value={color}
                onChange={(c) => { setColor(c); if (error === 'Pick a color') setError(''); }}
                ariaLabel="Color"
                swatch={colorSwatch}
              />
              {error === 'Pick a color' && <span className="intake__error" role="alert">Pick a color</span>}
            </div>
          </FormSection>

          <FormSection icon="location_on" title="Where & when" shape="puffy" tone="secondary" className="intake__section">
            <div className="intake__pair">
              <TextField
                label="Found where (area / zone)"
                value={area}
                onChange={setArea}
                required
                leadingIcon="location_on"
                supportingText="e.g. Gate 3, Section 112"
              />
              <TextField label="Found at" type="datetime-local" value={foundAt} onChange={setFoundAt} required leadingIcon="schedule" />
            </div>
          </FormSection>

          <FormSection
            icon="edit"
            title="Details"
            shape="flower"
            tone="primary"
            hint={def ? 'Public details appear in the listing. Private ones become claim questions.' : undefined}
            className="intake__section"
          >
            {def ? (
              <CategoryFields fields={def.fields} values={fields} onChange={(n, v) => setFields((f) => ({ ...f, [n]: v }))} />
            ) : (
              <p className="intake__placeholder md-typescale-body-medium">Pick a category to see its fields.</p>
            )}
          </FormSection>

          <FormSection icon="warehouse" title="Storage" shape="soft-square" tone="secondary" className="intake__section">
            <Select
              label="Storage bin"
              value={binId}
              onChange={setBinId}
              placeholder="Not stored yet"
              leadingIcon="warehouse"
              options={bins.map((b) => ({ value: b.id, label: `${b.code} — ${b.label}` }))}
              supportingText="Remembered for your next item"
            />
          </FormSection>

          {error && error !== 'Pick a color' && <Alert kind="error" title="Couldn't save">{error}</Alert>}

          <div className="intake__savebar">
            <Button type="submit" size="large" full icon="check" disabled={busy || !category}>
              {busy ? 'Saving…' : 'Save item'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
