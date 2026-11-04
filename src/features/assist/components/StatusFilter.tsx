export function StatusFilter({
  value,
  options,
  onChange,
  label = 'Status',
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <label className="field" style={{ marginBottom: 0 }}>
      <span className="field__label">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0) + o.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
