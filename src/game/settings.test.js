import { describe, it, expect } from 'vitest';
import { changeProgram, setTrainingDays } from './settings.js';
import { isScheduled } from './schedule.js';
import { player, at } from './testkit.js';

describe('settings', () => {
  it('changing program keeps level, rank and streak and restarts the rotation', () => {
    const s = player({ totalXp: 900, rank: 'D', streak: 5, cycleIndex: 3 });
    const c = changeProgram(s, at('2026-10-06'), { location: 'none', daysPerWeek: 4, experience: 'some' });
    expect(c).toMatchObject({ totalXp: 900, rank: 'D', streak: 5, cycleIndex: 0, programId: 'bw_full' });
    expect(c.pendingTrainingDays).toEqual({ days: [0, 1, 3, 4], from: '2026-10-07' });
  });

  it('weekday edits apply from tomorrow and need 2–5 days', () => {
    const s = player();
    const c = setTrainingDays(s, at('2026-10-05'), [1, 3]);
    expect(isScheduled(c, '2026-10-05')).toBe(true); // still Monday's plan today
    expect(isScheduled(c, '2026-10-12')).toBe(false);
    expect(isScheduled(c, '2026-10-06')).toBe(true);
    expect(c.profile.daysPerWeek).toBe(2);
    expect(setTrainingDays(s, at('2026-10-05'), [1])).toBe(s);
    expect(setTrainingDays(s, at('2026-10-05'), [0, 1, 2, 3, 4, 5])).toBe(s);
  });
});
