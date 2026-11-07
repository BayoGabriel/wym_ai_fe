import { Select } from '../../../shared/components/Select';

const ALL = '__all__';

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
    <div className="field" style={{ marginBottom: 0 }}>
      <span className="field__label">{label}</span>
      <Select
        value={value === '' ? ALL : value}
        onChange={(v) => onChange(v === ALL ? '' : v)}
        ariaLabel={label}
        placeholder="All"
        options={[
          { value: ALL, label: 'All' },
          ...options.map((o) => ({
            value: o,
            label: o.charAt(0) + o.slice(1).toLowerCase(),
          })),
        ]}
      />
    </div>
  );
}
