import type { ReactNode } from 'react';

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  center,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  center?: boolean;
}) {
  return (
    <div className={`section-head${center ? ' section-head--center' : ''}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="display display--section">{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}

export function StatusTag({ status }: { status: 'available' | 'planned' }) {
  return (
    <span className={`status-tag ${status}`}>
      {status === 'available' ? 'Available now' : 'Planned'}
    </span>
  );
}
