interface Props<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T | '';
  onChange(v: T): void;
}

/** Large tap targets for the 20-second intake flow. */
export function ChipPicker<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="chips" role="radiogroup">
      {options.map((o) => (
        <button type="button" key={o.value} role="radio" aria-checked={o.value === value}
          className={o.value === value ? 'chip on' : 'chip'} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
