import { describe, it, expect } from 'vitest';
import { xpForNext, xpToReach, levelFor, levelProgress, stats, addXp, completeQuest, completeCardio, canComplete, nextRankProgress, RANK_REQ } from './progress.js';
import { player, at, live } from './testkit.js';

describe('levels', () => {
  it('follows the XP table', () => {
    expect(xpForNext(1)).toBe(100);
    expect(xpForNext(2)).toBe(125);
    expect(xpToReach(1)).toBe(0);
    expect(xpToReach(2)).toBe(100);
    expect(xpToReach(3)).toBe(225);
    expect(xpToReach(10)).toBe(1800);
    expect(levelFor(0)).toBe(1);
    expect(levelFor(99)).toBe(1);
    expect(levelFor(100)).toBe(2);
    expect(levelFor(1800)).toBe(10);
    expect(levelProgress(150)).toMatchObject({ level: 2, into: 50, need: 125 });
  });

  it('levels up across several levels in one award', () => {
    const s = { totalXp: 90 };
    const events = [];
    addXp(s, 300, events, 'test');
    expect(s.totalXp).toBe(390);
    expect(events.filter((e) => e.type === 'levelUp')).toEqual([{ type: 'levelUp', level: 4 }]);
  });
});

describe('quest complete', () => {
  it('pays XP, logs the day, bumps streak and cycle, asks for feedback', () => {
    const { state, events } = completeQuest(player(), at('2026-10-05', 18));
    expect(state.totalXp).toBe(100);
    expect(state.log['2026-10-05']).toBe('cleared');
    expect(state.streak).toBe(1);
    expect(state.cycleIndex).toBe(1);
    expect(state.trainingClears).toBe(1);
    expect(state.feedbackFor).toBe('gymFullA');
    expect(events.map((e) => e.type)).toContain('levelUp');
  });

  it('cannot clear twice in a day or on a rest day', () => {
    const once = completeQuest(player(), at('2026-10-05', 18)).state;
    expect(canComplete(once, '2026-10-05')).toBe(false);
    expect(completeQuest(once, at('2026-10-05', 20)).state).toBe(once);
    expect(canComplete(player(), '2026-10-06')).toBe(false);
  });

  it('does not mutate the input state', () => {
    const s = player();
    const copy = structuredClone(s);
    completeQuest(s, at('2026-10-05', 18));
    expect(s).toEqual(copy);
  });

  it('pays streak milestones once per run', () => {
    // Mon/Wed/Fri for 3 weeks + = 7 clears by Mon 2026-10-19
    const { state, events } = live(player(), '2026-10-05', '2026-10-19');
    expect(state.streak).toBe(7);
    expect(events.filter((e) => e.type === 'milestone')).toHaveLength(1);
    expect(state.milestonesPaid).toEqual([7]);
  });

  it('cardio only on rest days, once, for 40 XP', () => {
    const s = player();
    expect(completeCardio(s, at('2026-10-05', 18)).state).toBe(s); // Monday is a training day
    const c = completeCardio(s, at('2026-10-06', 18)).state;
    expect(c.totalXp).toBe(40);
    expect(c.cardioClears).toBe(1);
    expect(c.streak).toBe(0);
    expect(completeCardio(c, at('2026-10-06', 19)).state).toBe(c);
  });

  it('stats grow from what you do', () => {
    expect(stats(player())).toEqual({ str: 5, agi: 5, vit: 5 });
    expect(stats(player({ trainingClears: 7, cardioClears: 5, vitWeeks: 3 }))).toEqual({ str: 7, agi: 7, vit: 8 });
  });
});

describe('perfect weeks and ranks', () => {
  it('a full week cleared is perfect: +50 XP, VIT, run', () => {
    const { state, events } = live(player(), '2026-10-05', '2026-10-12');
    expect(events.filter((e) => e.type === 'perfectWeek')).toHaveLength(1);
    expect(state.perfectWeeks).toBe(1);
    expect(state.perfectWeekRun).toBe(1);
    expect(state.vitWeeks).toBe(1);
  });

  it('the join week only counts days after joining', () => {
    // joined Friday 2026-10-09; nothing scheduled after Friday that week → neutral
    const s = player({ joinDate: '2026-10-09' });
    const { state } = live(s, '2026-10-09', '2026-10-12');
    expect(state.perfectWeeks).toBe(0);
    expect(state.perfectWeekRun).toBe(0);
  });

  it('two perfect weeks in a row → Rank D', () => {
    const { state, events } = live(player(), '2026-10-05', '2026-10-19');
    expect(state.rank).toBe('D');
    expect(events.find((e) => e.type === 'rankUp')).toMatchObject({ rank: 'D', date: '2026-10-19' });
  });

  it('a miss breaks the run (week not perfect even if the penalty is blown)', () => {
    const skipWed = (d) => d !== '2026-10-07' && d !== '2026-10-08' && d !== '2026-10-09';
    const { state } = live(player(), '2026-10-05', '2026-10-13', skipWed);
    expect(state.perfectWeekRun).toBe(0);
  });

  it('a penalty cleared in time saves the week', () => {
    const skipWed = (d) => d !== '2026-10-07';
    const { state } = live(player(), '2026-10-05', '2026-10-12', skipWed);
    expect(state.log['2026-10-07']).toBe('saved');
    expect(state.perfectWeeks).toBe(1);
  });

  it('higher ranks need total weeks and level', () => {
    expect(RANK_REQ.C).toEqual({ weeks: 6, level: 10 });
    const s = player({ rank: 'D', perfectWeeks: 6, perfectWeekRun: 6, totalXp: 1799 });
    expect(nextRankProgress(s)).toMatchObject({ rank: 'C', weeks: 6, weeksNeeded: 6, level: 9, levelNeeded: 10 });
    const { state } = completeQuest(s, at('2026-10-05', 18));
    expect(state.rank).toBe('C');
  });

  it('S is the top', () => {
    expect(nextRankProgress(player({ rank: 'S' }))).toBeNull();
  });

  it('about a month of 3x/week lands near Lv 10 / Rank D', () => {
    const { state } = live(player(), '2026-10-05', '2026-11-04');
    expect(state.rank).toBe('D');
    expect(levelFor(state.totalXp)).toBeGreaterThanOrEqual(8);
    expect(levelFor(state.totalXp)).toBeLessThanOrEqual(11);
  });
});
