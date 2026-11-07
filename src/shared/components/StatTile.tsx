import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import './StatTile.css';

function Spark({ points }: { points: number[] }) {
  if (!points.length) return null;
  const w = 88;
  const h = 28;
  const max = Math.max(...points, 1);
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - (p / max) * (h - 3) - 1).toFixed(1)}`)
    .join(' ');
  return (
    <svg className="ui-stat__spark" viewBox={`0 0 ${w} ${h}`} aria-hidden preserveAspectRatio="none">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function StatTile({
  label,
  value,
  hint,
  delta,
  spark,
  to,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  delta?: { value: number; invert?: boolean; label?: string };
  spark?: number[];
  to?: string;
  icon?: React.ReactNode;
}) {
  const dir = !delta || delta.value === 0 ? 'flat' : delta.value > 0 ? 'up' : 'down';
  const good = delta ? (delta.invert ? dir === 'down' : dir === 'up') : true;
  const DeltaIcon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus;

  const inner = (
    <>
      <div className="ui-stat__top">
        <span className="ui-stat__label">{label}</span>
        {icon && <span className="ui-stat__icon">{icon}</span>}
      </div>
      <div className="ui-stat__value">{value}</div>
      <div className="ui-stat__foot">
        {delta && (
          <span className={`ui-stat__delta ui-stat__delta--${good ? 'good' : 'bad'}`}>
            <DeltaIcon size={12} />
            {Math.abs(delta.value)}%{delta.label ? ` ${delta.label}` : ''}
          </span>
        )}
        {hint && <span className="ui-stat__hint">{hint}</span>}
      </div>
      {spark && <Spark points={spark} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="ui-stat ui-stat--link">
        {inner}
      </Link>
    );
  }
  return <div className="ui-stat">{inner}</div>;
}
