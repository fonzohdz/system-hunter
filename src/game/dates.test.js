import { describe, it, expect } from 'vitest';
import { localDate, addDays, daysBetween, weekday, weekStart, dateRange, startOfDay } from './dates.js';

describe('dates', () => {
  it('formats local dates with padding', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('adds days across month and year rollovers', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('is unaffected by DST weeks', () => {
    // US DST starts 2026-03-08, EU 2026-03-29, US ends 2026-11-01
    expect(addDays('2026-03-07', 2)).toBe('2026-03-09');
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30');
    expect(daysBetween('2026-10-31', '2026-11-02')).toBe(2);
  });

  it('counts days between, signed', () => {
    expect(daysBetween('2026-10-01', '2026-10-09')).toBe(8);
    expect(daysBetween('2026-10-09', '2026-10-01')).toBe(-8);
  });

  it('uses Monday as the first weekday', () => {
    expect(weekday('2026-10-05')).toBe(0); // Monday
    expect(weekday('2026-10-11')).toBe(6); // Sunday
    expect(weekStart('2026-10-11')).toBe('2026-10-05');
    expect(weekStart('2026-10-05')).toBe('2026-10-05');
    expect(weekStart('2027-01-01')).toBe('2026-12-28');
  });

  it('builds inclusive ranges', () => {
    expect(dateRange('2026-10-30', '2026-11-02')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
    expect(dateRange('2026-10-02', '2026-10-01')).toEqual([]);
  });

  it('finds local midnight', () => {
    expect(startOfDay('2026-10-09')).toBe(new Date(2026, 9, 9).getTime());
  });
});
