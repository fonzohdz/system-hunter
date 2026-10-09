import { describe, it, expect } from 'vitest';
import { evaluate, pause, resume, pauseBlocker } from './penalty.js';
import { completeQuest, levelFor, xpToReach } from './progress.js';
import { player, at, live } from './testkit.js';

const HOUR = 3600000;

describe('misses and penalties', () => {
  it('the join day never counts as a miss', () => {
    const { state, events } = evaluate(player(), at('2026-10-06', 8));
    expect(state.penalty).toBeNull();
    expect(events).toEqual([]);
    expect(state.lastEvaluated).toBe('2026-10-05');
  });

  it('a missed training day issues a penalty at midnight with a 48h deadline', () => {
    const s = completeQuest(player(), at('2026-10-05', 18)).state;
    const { state, events } = evaluate(s, at('2026-10-08', 8));
    expect(state.log['2026-10-07']).toBe('missed');
    expect(state.penalty).toEqual({
      missedDate: '2026-10-07',
      issuedAt: at('2026-10-08', 0),
      deadline: at('2026-10-08', 0) + 48 * HOUR
    });
    expect(events.map((e) => e.type)).toEqual(['penaltyIssued']);
    expect(state.streak).toBe(1); // not reset until blown
  });

  it('rest days never count', () => {
    const { state } = evaluate(player(), at('2026-10-07', 8)); // Tue skipped, it's a rest day
    expect(state.penalty).toBeNull();
    expect(state.log['2026-10-06']).toBeUndefined();
  });

  it('clearing at 47h saves the day, keeps the streak and pays +50', () => {
    let s = completeQuest(player(), at('2026-10-05', 18)).state; // streak 1
    s = evaluate(s, at('2026-10-08', 8)).state; // Wed missed
    s = evaluate(s, at('2026-10-09', 23)).state; // Fri 23:00 = 47h after issue
    expect(s.penalty).not.toBeNull();
    const xpBefore = s.totalXp;
    const { state, events } = completeQuest(s, at('2026-10-09', 23));
    expect(state.penalty).toBeNull();
    expect(state.log['2026-10-07']).toBe('saved');
    expect(state.log['2026-10-09']).toBe('cleared');
    expect(state.streak).toBe(3);
    expect(state.totalXp - xpBefore).toBeGreaterThanOrEqual(150);
    expect(events.map((e) => e.type)).toContain('penaltySaved');
  });

  it('at 49h the penalty is blown: half the level progress lost, never a level, streak reset', () => {
    let s = player({ totalXp: 260, streak: 4, bestStreak: 4 }); // Lv 3, 35 into the level
    s = evaluate(s, at('2026-10-08', 8)).state; // Wed missed
    const { state, events } = evaluate(s, at('2026-10-10', 1)); // Sat 01:00
    expect(state.log['2026-10-07']).toBe('blown');
    expect(state.totalXp).toBe(260 - 17);
    expect(levelFor(state.totalXp)).toBe(3);
    expect(state.totalXp).toBeGreaterThanOrEqual(xpToReach(3));
    expect(state.streak).toBe(0);
    expect(state.bestStreak).toBe(4);
    expect(events.find((e) => e.type === 'penaltyBlown')).toMatchObject({ xpLost: 17 });
    // Friday was also missed, so a fresh penalty is open
    expect(state.penalty.missedDate).toBe('2026-10-09');
  });

  it('a second miss while a penalty is open blows the first', () => {
    let s = evaluate(player(), at('2026-10-08', 8)).state; // Wed missed
    const { state, events } = evaluate(s, at('2026-10-09', 23)); // Thu is rest; nothing yet
    expect(events).toEqual([]);
    // Wed penalty open, Fri missed too → judged Sat morning... deadline hits first at Sat 00:00
    s = player();
    s = evaluate(s, at('2026-10-08', 8)).state;
    // move Wed's deadline out so Friday's miss is what blows it
    s = { ...s, penalty: { ...s.penalty, deadline: at('2026-10-12', 0) } };
    const r = evaluate(s, at('2026-10-10', 8));
    expect(r.events.map((e) => e.type)).toEqual(['penaltyBlown', 'penaltyIssued']);
    expect(r.state.log['2026-10-07']).toBe('blown');
    expect(r.state.penalty.missedDate).toBe('2026-10-09');
    expect(state.penalty.missedDate).toBe('2026-10-07');
  });

  it('3 blown penalties within 30 days drop one rank and reset the counter', () => {
    let s = player({ rank: 'C', perfectWeeks: 7, perfectWeekRun: 3, totalXp: 2000 });
    const r = live(s, '2026-10-06', '2026-10-20', () => false);
    const types = r.events.map((e) => e.type);
    expect(types.filter((t) => t === 'penaltyBlown').length).toBeGreaterThanOrEqual(3);
    expect(types).toContain('rankDown');
    expect(r.state.rank).toBe('D');
    expect(r.state.perfectWeeks).toBe(2);
    expect(r.state.perfectWeekRun).toBe(0);
  });

  it('rank never drops below E', () => {
    const r = live(player(), '2026-10-06', '2026-11-30', () => false);
    expect(r.state.rank).toBe('E');
    expect(r.state.totalXp).toBe(0);
  });

  it('blowouts older than 30 days do not count', () => {
    const old = at('2026-09-01');
    let s = player({ rank: 'D', blowouts: [old, old + 1] });
    s = evaluate(s, at('2026-10-08', 8)).state;
    const r = evaluate(s, at('2026-10-10', 8));
    expect(r.state.rank).toBe('D');
  });

  it('not opening the app for 10 days judges every day in order', () => {
    const s = completeQuest(player(), at('2026-10-05', 18)).state;
    const { state, events } = evaluate(s, at('2026-10-16', 8));
    // misses: Wed 7, Fri 9, Mon 12, Wed 14 → each new one blows the last; Fri 9 penalty also passes deadline first
    expect(state.lastEvaluated).toBe('2026-10-15');
    expect(state.log['2026-10-07']).toBe('blown');
    expect(state.log['2026-10-09']).toBe('blown');
    expect(state.log['2026-10-12']).toBe('blown');
    expect(state.log['2026-10-14']).toBe('missed');
    expect(state.penalty.missedDate).toBe('2026-10-14');
    expect(events.filter((e) => e.type === 'penaltyBlown')).toHaveLength(3);
    expect(events.filter((e) => e.type === 'penaltyIssued')).toHaveLength(4);
  });

  it('nothing is re-judged when the clock goes backwards', () => {
    const s = evaluate(player(), at('2026-10-12', 8)).state;
    const back = evaluate(s, at('2026-10-06', 8));
    expect(back.events).toEqual([]);
    expect(back.state.lastEvaluated).toBe('2026-10-11');
  });

  it('judges by local day even when opened just after midnight', () => {
    const s = completeQuest(player(), at('2026-10-05', 18)).state;
    const r = evaluate(s, at('2026-10-08', 0) + 60000);
    expect(r.state.penalty.missedDate).toBe('2026-10-07');
  });
});

describe('pause', () => {
  it('paused days are never misses', () => {
    let s = pause(player(), at('2026-10-06', 9), 5).state; // Tue–Sat
    const { state, events } = evaluate(s, at('2026-10-12', 8));
    expect(events).toEqual([]);
    expect(state.log['2026-10-07']).toBe('paused');
    expect(state.log['2026-10-09']).toBe('paused');
  });

  it('limits: 1–7 days, one at a time, two per 30 days', () => {
    const p1 = pause(player(), at('2026-10-06', 9), 30).state;
    expect(p1.pauses[0]).toMatchObject({ start: '2026-10-06', end: '2026-10-12' });
    expect(pauseBlocker(p1, '2026-10-08')).toBe('already-paused');
    const p2 = pause(p1, at('2026-10-20', 9), 2).state;
    expect(p2.pauses).toHaveLength(2);
    expect(pauseBlocker(p2, '2026-10-25')).toBe('limit');
    expect(pauseBlocker(p2, '2026-11-06')).toBeNull();
  });

  it('pushes an open penalty deadline back by the paused days', () => {
    const s = evaluate(player(), at('2026-10-08', 8)).state;
    const d0 = s.penalty.deadline;
    const p = pause(s, at('2026-10-08', 9), 3).state;
    expect(p.penalty.deadline).toBe(d0 + 3 * 24 * HOUR);
  });

  it('resume early: today counts again and unused days come off the deadline', () => {
    let s = evaluate(player(), at('2026-10-08', 8)).state;
    const d0 = s.penalty.deadline;
    s = pause(s, at('2026-10-08', 9), 5).state; // Thu–Mon
    const r = resume(s, at('2026-10-09', 9)).state; // resume Fri
    expect(r.pauses[0].end).toBe('2026-10-08');
    expect(r.penalty.deadline).toBe(d0 + 1 * 24 * HOUR);
  });

  it('a pause resumed the same day still counts toward the limit', () => {
    let s = pause(player(), at('2026-10-06', 9), 3).state;
    s = resume(s, at('2026-10-06', 10)).state;
    expect(s.pauses).toHaveLength(1);
    expect(pauseBlocker(s, '2026-10-06')).toBeNull();
    s = pause(s, at('2026-10-06', 11), 1).state;
    expect(pauseBlocker(s, '2026-10-08')).toBe('limit');
  });
});

describe('schedule edits', () => {
  it('apply from tomorrow, not today', () => {
    let s = player({ pendingTrainingDays: { days: [1, 3], from: '2026-10-06' } }); // Tue/Thu from Tue
    const r = evaluate(s, at('2026-10-09', 8));
    expect(r.state.log['2026-10-07']).toBeUndefined(); // Wed is no longer a training day
    expect(r.state.log['2026-10-06']).toBe('blown'); // Tue was, and so was Thu (second miss blows Tue)
    expect(r.state.penalty.missedDate).toBe('2026-10-08');
    expect(r.state.trainingDays).toEqual([1, 3]);
    expect(r.state.pendingTrainingDays).toBeNull();
  });
});
