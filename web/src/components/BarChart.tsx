interface Props { data: { label: string; value: number }[]; unit?: string }

/** Plain-CSS horizontal bars. No chart library needed. */
export function BarChart({ data, unit = '' }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars" role="list">
      {data.map((d) => (
        <div key={d.label} className="bar-row" role="listitem">
          <span className="bar-label">{d.label}</span>
          <span className="bar-track"><span className="bar-fill" style={{ width: `${(d.value / max) * 100}%` }} /></span>
          <span className="bar-value">{d.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}
