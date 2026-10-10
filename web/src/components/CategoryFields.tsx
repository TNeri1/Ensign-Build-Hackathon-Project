import type { FieldDef } from '@vlf/shared';
import { Select } from './m3/Select';
import { TextField } from './m3/TextField';
import './CategoryFields.css';

interface Props {
  fields: FieldDef[];
  values: Record<string, string>;
  onChange(name: string, value: string): void;
}

/** Public fields appear in the public listing; private ones stay staff-only and feed claim questions. */
function visibilityHint(f: FieldDef): string {
  return f.public ? 'Public · shown in the listing' : 'Private · used for claim questions';
}

/** Category-specific intake fields as M3 outlined text fields / selects (2 columns on medium+). */
export function CategoryFields({ fields, values, onChange }: Props) {
  return (
    <div className="category-fields">
      {fields.map((f) =>
        f.type === 'select' ? (
          <Select
            key={f.name}
            label={f.label}
            value={values[f.name] ?? ''}
            onChange={(v) => onChange(f.name, v)}
            options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
            required={f.required}
            placeholder="Select…"
            leadingIcon={f.public ? 'visibility' : 'lock'}
            supportingText={visibilityHint(f)}
          />
        ) : (
          <TextField
            key={f.name}
            label={f.label}
            type={f.type === 'number' ? 'number' : 'text'}
            inputMode={f.type === 'number' ? 'numeric' : undefined}
            value={values[f.name] ?? ''}
            onChange={(v) => onChange(f.name, v)}
            required={f.required}
            leadingIcon={f.public ? 'visibility' : 'lock'}
            supportingText={visibilityHint(f)}
          />
        ),
      )}
    </div>
  );
}
