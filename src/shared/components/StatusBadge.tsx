import { toneForStatus } from './status-tone';
import './StatusBadge.css';

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = toneForStatus(status);
  return <span className={`stag stag--${tone}`}>{label ?? status}</span>;
}
