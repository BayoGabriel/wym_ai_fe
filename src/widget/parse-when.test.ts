import { describe, expect, it } from 'vitest';
import { parseWhen } from './parse-when';

// Fixed reference point: Thursday 2026-11-05, 12:00 local time.
const NOW = new Date(2026, 10, 5, 12, 0);

describe('parseWhen', () => {
  it('parses ISO dates with 24h times', () => {
    expect(parseWhen('2026-11-12 14:30', NOW)).toEqual({ date: '2026-11-12', time: '14:30' });
  });

  it('parses day-first slashed dates', () => {
    expect(parseWhen('14/11 10:30', NOW)).toEqual({ date: '2026-11-14', time: '10:30' });
    expect(parseWhen('14/11/2026 10:30', NOW)).toEqual({ date: '2026-11-14', time: '10:30' });
  });

  it('parses named months in either order', () => {
    expect(parseWhen('Nov 12, 2:30 pm', NOW)).toEqual({ date: '2026-11-12', time: '14:30' });
    expect(parseWhen('12th of November 9am', NOW)).toEqual({ date: '2026-11-12', time: '09:00' });
  });

  it('parses relative days', () => {
    expect(parseWhen('tomorrow 4pm', NOW)).toEqual({ date: '2026-11-06', time: '16:00' });
    expect(parseWhen('today 15:00', NOW)).toEqual({ date: '2026-11-05', time: '15:00' });
  });

  it('parses weekday names to the next occurrence', () => {
    // Thursday → Friday is +1 day; Thursday → next Thursday rolls a week.
    expect(parseWhen('friday 2pm', NOW)).toEqual({ date: '2026-11-06', time: '14:00' });
    expect(parseWhen('thursday 2pm', NOW)).toEqual({ date: '2026-11-12', time: '14:00' });
  });

  it('rolls a past ambiguous date into next year', () => {
    expect(parseWhen('Jan 5 10am', NOW)).toEqual({ date: '2027-01-05', time: '10:00' });
  });

  it('returns null when the time is missing', () => {
    expect(parseWhen('next friday', NOW)).toBeNull();
    expect(parseWhen('sometime soon', NOW)).toBeNull();
  });

  it('rejects impossible dates', () => {
    expect(parseWhen('31/2 10am', NOW)).toBeNull();
  });
});
