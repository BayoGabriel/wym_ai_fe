const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Parse loose visitor text like "tomorrow 2pm", "14/11 10:30", "Nov 12 at 3pm"
    into the strict { date: 'YYYY-MM-DD', time: 'HH:mm' } the API expects.
    Returns null when either a date or a time can't be found. */
export function parseWhen(input: string, now: Date = new Date()): { date: string; time: string } | null {
  const text = input.toLowerCase().trim();
  let year = now.getFullYear();
  let month: number | null = null;
  let day: number | null = null;

  const iso = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  const slashed = text.match(/\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/);
  const namedFirst = text.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/
  );
  const namedLast = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?(?:,?\s*(\d{4}))?\b/
  );

  const monthOf = (s: string) =>
    MONTHS.findIndex((m) => m.startsWith(s.slice(0, 3)) || (s === 'sept' && m === 'september'));

  if (iso) {
    year = +iso[1];
    month = +iso[2];
    day = +iso[3];
  } else if (namedFirst || namedLast) {
    const m = namedFirst ?? namedLast!;
    const monStr = namedFirst ? m[1] : m[2];
    const dayStr = namedFirst ? m[2] : m[1];
    const yrStr = m[3];
    month = monthOf(monStr) + 1;
    day = +dayStr;
    if (yrStr) year = +yrStr;
  } else if (slashed) {
    // Day-first is the dominant convention outside the US; unambiguous
    // values (>12) resolve themselves either way.
    let d = +slashed[1];
    let mo = +slashed[2];
    if (mo > 12 && d <= 12) [d, mo] = [mo, d];
    month = mo;
    day = d;
    if (slashed[3]) year = +slashed[3].length === 2 ? 2000 + +slashed[3] : +slashed[3];
  } else if (/\btomorrow\b/.test(text)) {
    const t = new Date(now.getTime() + 86400000);
    year = t.getFullYear();
    month = t.getMonth() + 1;
    day = t.getDate();
  } else if (/\btoday\b/.test(text)) {
    month = now.getMonth() + 1;
    day = now.getDate();
  } else {
    const wd = text.match(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/);
    if (wd) {
      const target = WEEKDAYS.findIndex((w) => w.startsWith(wd[1].slice(0, 3)));
      if (target < 0) return null;
      const delta = (target - now.getDay() + 7) % 7 || 7;
      const t = new Date(now.getTime() + delta * 86400000);
      year = t.getFullYear();
      month = t.getMonth() + 1;
      day = t.getDate();
    }
  }

  const ampm = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/);
  const twentyFour = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  let hour: number | null = null;
  let minute = 0;
  if (ampm) {
    hour = +ampm[1] % 12;
    if (ampm[3][0] === 'p') hour += 12;
    minute = +(ampm[2] ?? 0);
  } else if (twentyFour) {
    hour = +twentyFour[1];
    minute = +twentyFour[2];
  }

  if (month === null || day === null || hour === null) return null;
  const picked = new Date(year, month - 1, day);
  // Reject impossible dates (e.g. 31 Feb) that Date would silently roll over.
  if (picked.getMonth() !== month - 1 || picked.getDate() !== day) return null;
  // An ambiguous year ("Nov 3") that already passed rolls to next year.
  if (
    !iso &&
    !slashed?.[3] &&
    !namedFirst?.[3] &&
    !namedLast?.[3] &&
    picked.getTime() < now.getTime() - 86400000
  ) {
    year += 1;
  }
  return { date: `${year}-${pad(month)}-${pad(day)}`, time: `${pad(hour)}:${pad(minute)}` };
}
