import { describe, it, expect } from 'vitest';
import { cellLabel } from './StatusTab.jsx';
import { player } from '../game/testkit.js';

describe('calendar day labels (what a screen reader hears)', () => {
  // Joined Monday 2026-10-05, trains Mon/Wed/Fri.
  const s = {
    ...player(),
    log: { '2026-10-07': 'cleared', '2026-10-09': 'saved', '2026-10-12': 'blown', '2026-10-14': 'missed', '2026-10-11': 'cardio' }
  };
  const today = '2026-10-15';

  it('says the date and the status shown by the color', () => {
    expect(cellLabel(s, '2026-10-07', today)).toBe('Wednesday, October 7: Cleared');
    expect(cellLabel(s, '2026-10-09', today)).toBe('Friday, October 9: Penalty cleared');
    expect(cellLabel(s, '2026-10-11', today)).toBe('Sunday, October 11: Cardio');
    expect(cellLabel(s, '2026-10-12', today)).toBe('Monday, October 12: Missed');
    expect(cellLabel(s, '2026-10-14', today)).toBe('Wednesday, October 14: Penalty open');
  });

  it('marks today, upcoming training days, rest days and days before joining', () => {
    expect(cellLabel(s, '2026-10-15', today)).toBe('Thursday, October 15, today: Rest day');
    expect(cellLabel(s, '2026-10-16', today)).toBe('Friday, October 16: Training day');
    expect(cellLabel(s, '2026-10-13', today)).toBe('Tuesday, October 13: Rest day');
    expect(cellLabel(s, '2026-10-01', today)).toBe('Thursday, October 1: Before you joined');
  });
});
