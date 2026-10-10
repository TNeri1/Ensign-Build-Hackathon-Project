import type { FieldDef } from '@vlf/shared';

interface Props {
  fields: FieldDef[];
  values: Record<string, string>;
  onChange(name: string, value: string): void;
}

export function CategoryFields({ fields, values, onChange }: Props) {
  return (
    <>
      {fields.map((f) => (
        <label key={f.name} className="field">
          <span>{f.label}{f.required ? ' *' : ''} <em className="muted">{f.public ? 'public' : 'private'}</em></span>
          {f.type === 'select' ? (
            <select value={values[f.name] ?? ''} onChange={(e) => onChange(f.name, e.target.value)} required={f.required}>
              <option value="">Select…</option>
              {f.options?.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input type={f.type === 'number' ? 'number' : 'text'} value={values[f.name] ?? ''}
              onChange={(e) => onChange(f.name, e.target.value)} required={f.required} />
          )}
        </label>
      ))}
    </>
  );
}
