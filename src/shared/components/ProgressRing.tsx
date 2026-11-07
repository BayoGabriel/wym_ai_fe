import './ProgressRing.css';

export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  label,
  sublabel,
}: {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const pct = Math.min(Math.max(value, 0), 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ui-ring" style={{ width: size, height: size }} role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size}>
        <circle className="ui-ring__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        <circle
          className="ui-ring__bar"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ui-ring__label">
        <strong>{label ?? `${Math.round(pct * 100)}%`}</strong>
        {sublabel && <small>{sublabel}</small>}
      </span>
    </div>
  );
}
