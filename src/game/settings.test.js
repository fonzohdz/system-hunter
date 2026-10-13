import { describe, it, expect } from 'vitest';
import { changeProgram, setTrainingDays } from './settings.js';
import { isScheduled } from './schedule.js';
import { player, at } from './testkit.js';
import { evaluate } from './penalty.js';
import { systemLine } from './system.js';
import { migrate, isValidState } from './save.js';

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

describe('settings input checks', () => {
  it('ignores weekdays that are not whole numbers 0–6', () => {
    const s = player();
    const c = setTrainingDays(s, at('2026-10-05'), [0, 1.5, '2', 3, 9, -1]);
    expect(c.pendingTrainingDays.days).toEqual([0, 3]);
  });
});

describe('changing day count across a program boundary', () => {
  // Gym, 4 days (Upper/Lower), joined Monday 2026-10-05, some history.
  const base = () => {
    const s = player({ joinDate: '2026-10-05' }, { daysPerWeek: 4 });
    return { ...s, totalXp: 640, streak: 4, cycleIndex: 3, log: { '2026-10-06': 'cleared', '2026-10-08': 'cleared' } };
  };
  const wed = at('2026-10-07', 10);

  it('5 days on a gym plan schedules Push/Pull/Legs+ for next Monday, not now', () => {
    const s = setTrainingDays(base(), wed, [0, 1, 2, 4, 5]);
    expect(s.programId).toBe('gym_ul');
    expect(s.pendingProgram).toEqual({ programId: 'gym_ppl', from: '2026-10-12' });
  });

  it('nothing changes mid-week, even days later', () => {
    const s = setTrainingDays(base(), wed, [0, 1, 2, 4, 5]);
    const sun = evaluate({ ...s, lastEvaluated: '2026-10-10' }, at('2026-10-11', 20));
    expect(sun.state.programId).toBe('gym_ul');
    expect(sun.events.map((e) => e.type)).not.toContain('programChanged');
  });

  it('on Monday it switches, starts the rotation at day 1, keeps XP, streak and history, and the System says so', () => {
    const s = setTrainingDays(base(), wed, [0, 1, 2, 4, 5]);
    const r = evaluate({ ...s, lastEvaluated: '2026-10-11' }, at('2026-10-12', 7));
    expect(r.state).toMatchObject({ programId: 'gym_ppl', cycleIndex: 0, pendingProgram: null, totalXp: 640, streak: 4 });
    expect(r.state.log).toEqual(base().log);
    expect(r.events).toContainEqual({ type: 'programChanged', programId: 'gym_ppl' });
    expect(systemLine(r.state, '2026-10-12', at('2026-10-12', 7), r.events).text).toBe('New program assigned: Push/Pull/Legs+. Rotation starts at day 1.');
  });

  it('going back to a day count that fits the current program cancels the switch', () => {
    let s = setTrainingDays(base(), wed, [0, 1, 2, 4, 5]);
    s = setTrainingDays(s, wed, [0, 1, 3, 4]);
    expect(s.pendingProgram).toBeNull();
  });

  it('home and no-equipment plans never switch on day count', () => {
    const home = player({}, { location: 'home', daysPerWeek: 3 });
    expect(setTrainingDays(home, wed, [0, 1, 2, 3, 4]).pendingProgram).toBeNull();
  });

  it('choosing a program in "Change program" replaces a scheduled switch', () => {
    const s = setTrainingDays(base(), wed, [0, 1, 2, 4, 5]);
    expect(changeProgram(s, wed, { location: 'gym', daysPerWeek: 4, experience: 'some' }).pendingProgram).toBeNull();
  });

  it('older saves without the new field load fine', () => {
    const old = { ...player() };
    delete old.pendingProgram;
    const m = migrate(old);
    expect(m.pendingProgram).toBeNull();
    expect(isValidState(m)).toBe(true);
  });
});
