import type { CSSProperties } from 'react';

export type IconName =
  | 'book'
  | 'chat'
  | 'lead'
  | 'handoff'
  | 'calendar'
  | 'shield'
  | 'chart'
  | 'flow'
  | 'widget'
  | 'bolt'
  | 'doc'
  | 'check'
  | 'arrow'
  | 'spark'
  | 'inbox'
  | 'gear'
  | 'globe'
  | 'lock';

const PATHS: Record<IconName, string> = {
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5zm0 15A2.5 2.5 0 0 1 6.5 18H20M8 7h8M8 10.5h5',
  chat: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1zM8 9.5h8M8 13h5',
  lead: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-5.5 6-5.5 1.9 0 3.6.8 4.7 2.1M16 8v6m3-3h-6',
  handoff:
    'M16 3.5l4.5 4.5L16 12.5M20 8H9m-1 3.5L3.5 16 8 20.5M4 16h11',
  calendar:
    'M4 6.5h16a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1zM3 11h18M8 3.5V7m8-3.5V7m-8.5 7h3v3h-3z',
  shield:
    'M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3zm-3 9l2.2 2.2L15.5 10',
  chart: 'M4 20V10m6 10V4m6 16v-8m4 8H2',
  flow: 'M5 4.5h4v4H5zM15 15.5h4v4h-4zM9 6.5h6a2 2 0 0 1 2 2v7M15 17.5H9a2 2 0 0 1-2-2v-7',
  widget:
    'M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6l-2 3-2-3H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm4 6h8m-8 3.5h5',
  bolt: 'M13 2L4.5 13.5H11l-1 8.5L18.5 10.5H12l1-8.5z',
  doc: 'M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm8 0v5h5M8.5 12.5h7m-7 3.5h7',
  check: 'M4.5 12.5l5 5 10-11',
  arrow: 'M4 12h15m0 0l-6-6m6 6l-6 6',
  spark:
    'M12 3v4m0 10v4M3 12h4m10 0h4M6.3 6.3l2.1 2.1m7.2 7.2l2.1 2.1m0-11.3l-2.1 2.1M8.4 15.6l-2.1 2.1',
  inbox:
    'M3 13.5l3.2-8a1 1 0 0 1 .9-.6h9.8a1 1 0 0 1 .9.6l3.2 8V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5.5zm0 0h5.6a3.5 3.5 0 0 0 6.8 0H21',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm8 3l1.8 1.4-2 3.4-2.2-.5a8 8 0 0 1-1.7 1l-.3 2.2h-4l-.3-2.2a8 8 0 0 1-1.7-1l-2.2.5-2-3.4L6.2 12l-1.8-1.4 2-3.4 2.2.5a8 8 0 0 1 1.7-1L10.6 4h4l.3 2.2a8 8 0 0 1 1.7 1l2.2-.5 2 3.4L19.8 12z',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-9 9h18M12 3c2.5 2.4 3.8 5.5 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3z',
  lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zm2 0V7.5a4 4 0 0 1 8 0V11m-4 4v2.5',
};

export function Icon({
  name,
  size = 20,
  style,
  className,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={style}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
