import { describe, it, expect } from 'vitest';
import { PROGRAMS, EXERCISES, programFor, defaultTrainingDays, toBodyweight, BODYWEIGHT_FALLBACK } from './programs.js';
import { buildQuest, targetFor, todayMode, currentDay, LOAD_CUE, WEIGHT_UP_CUE } from './quest.js';
import { player } from './testkit.js';

describe('programs', () => {
  it('every slot points at a real exercise and every pattern has a fallback entry', () => {
    for (const p of Object.values(PROGRAMS)) {
      for (const day of p.days) {
        expect(day.slots.length).toBeGreaterThan(0);
        for (const slot of day.slots) {
          const ex = EXERCISES[slot.ex];
          expect(ex, `${p.id}/${day.key}/${slot.ex}`).toBeTruthy();
          expect(slot.lo).toBeLessThanOrEqual(slot.hi);
          expect(ex.pattern in BODYWEIGHT_FALLBACK).toBe(true);
        }
      }
    }
  });

  it('day keys are unique across programs', () => {
    const keys = Object.values(PROGRAMS).flatMap((p) => p.days.map((d) => d.key));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every exercise has a how-to line', () => {
    for (const ex of Object.values(EXERCISES)) expect(ex.howTo.length).toBeGreaterThan(20);
  });

  it('picks the program from the onboarding answers', () => {
    expect(programFor('gym', 2)).toBe('gym_full');
    expect(programFor('gym', 3)).toBe('gym_full');
    expect(programFor('gym', 4)).toBe('gym_ul');
    expect(programFor('gym', 5)).toBe('gym_ppl');
    expect(programFor('home', 5)).toBe('db_full');
    expect(programFor('none', 2)).toBe('bw_full');
  });

  it('gives default weekdays with the right count', () => {
    for (const n of [2, 3, 4, 5]) expect(defaultTrainingDays(n)).toHaveLength(n);
  });

  it('bodyweight version drops nulls and duplicates, caps at 5, keeps bodyweight moves as-is', () => {
    const upper = PROGRAMS.gym_ul.days[0].slots; // bench,row,ohp,pulldown,curl,pushdown
    const bw = toBodyweight(upper).map((s) => s.ex);
    expect(bw).toEqual(['pushup', 'ytw', 'pike', 'superman', 'chair_dip']);
    const bwDay = PROGRAMS.bw_full.days[1].slots;
    expect(toBodyweight(bwDay)).toEqual(bwDay);
    for (const p of Object.values(PROGRAMS)) for (const d of p.days) {
      const out = toBodyweight(d.slots);
      expect(out.length).toBeLessThanOrEqual(5);
      expect(out.every((s) => !EXERCISES[s.ex].loaded)).toBe(true);
    }
  });
});

describe('quest', () => {
  it('maps feedback levels to reps and sets', () => {
    const slot = { sets: 3, lo: 6, hi: 10 };
    expect(targetFor(slot, -2)).toEqual({ sets: 2, reps: 6 });
    expect(targetFor(slot, -1)).toEqual({ sets: 3, reps: 6 });
    expect(targetFor(slot, 0)).toEqual({ sets: 3, reps: 8 });
    expect(targetFor(slot, 1)).toEqual({ sets: 3, reps: 10 });
    expect(targetFor({ sets: 2, lo: 10, hi: 15 }, -2).sets).toBe(2);
  });

  it('builds the current day with targets, cues and rest', () => {
    const q = buildQuest(player());
    expect(q.name).toBe('Full Body A');
    expect(q.dayNumber).toBe(1);
    expect(q.dayCount).toBe(2);
    expect(q.xp).toBe(100);
    expect(q.items[0]).toMatchObject({ name: 'Back Squat', target: '3 × 8', cue: LOAD_CUE, restSec: 90 });
    expect(q.items[4]).toMatchObject({ name: 'Plank', target: '3 × 37s', cue: null, restSec: 60 });
  });

  it('new players start at the bottom of each range', () => {
    const q = buildQuest(player({}, { experience: 'new' }));
    expect(q.items[0].target).toBe('3 × 6');
  });

  it('cycles days by cleared quests, wrapping around', () => {
    const s = player({ cycleIndex: 3 });
    expect(currentDay(s).day.key).toBe('gymFullB');
    expect(buildQuest({ ...s, cycleIndex: 4 }).name).toBe('Full Body A');
  });

  it('no gym today swaps to bodyweight', () => {
    const q = buildQuest(player({ programId: 'gym_ppl' }), { noGym: true });
    expect(q.name).toBe('Push Day (anywhere)');
    expect(q.items.map((i) => i.name)).toEqual(['Push-up', 'Pike Push-up', 'Chair Dip']);
    expect(q.items.every((i) => i.cue === null)).toBe(true);
    expect(q.xp).toBe(100);
  });

  it('short on time keeps 3 exercises with one fewer set', () => {
    const q = buildQuest(player({ programId: 'gym_ul' }), { short: true });
    expect(q.items).toHaveLength(3);
    expect(q.items.map((i) => i.sets)).toEqual([3, 3, 2]);
    expect(q.minutes).toBe(20);
  });

  it('both overrides together = bodyweight, then shortened', () => {
    const q = buildQuest(player({ programId: 'gym_ul' }), { noGym: true, short: true });
    expect(q.items.map((i) => i.name)).toEqual(['Push-up', 'Prone Y-T-W Raise', 'Pike Push-up']);
  });

  it('shows the weight-up cue and bodyweight extra sets from feedback', () => {
    const s = player({ dayState: { gymFullA: { adj: 0, weightCue: true, bwExtra: 1 } } });
    const q = buildQuest(s);
    expect(q.items[0].cue).toBe(WEIGHT_UP_CUE);
    expect(q.items[4].sets).toBe(4); // plank 3 + 1
  });

  it('caps bodyweight sets at 5', () => {
    const s = player({ programId: 'gym_ppl', dayState: { push: { adj: 0, weightCue: false, bwExtra: 2 } } });
    const q = buildQuest(s, { noGym: true });
    expect(q.items[0].sets).toBe(5); // push-up 4 + 2 capped
  });

  it('adds the finisher and bonus XP while a penalty is open', () => {
    const q = buildQuest(player({ penalty: { missedDate: '2026-10-07', issuedAt: 0, deadline: 1 } }));
    expect(q.finisher).toEqual({ rounds: 3, burpees: 10, climbers: 20, plankSec: 30 });
    expect(q.xp).toBe(150);
    const qNew = buildQuest(player({ penalty: { missedDate: '2026-10-07', issuedAt: 0, deadline: 1 } }, { experience: 'new' }));
    expect(qNew.finisher).toMatchObject({ rounds: 2, burpees: 6 });
  });

  it('knows what today is', () => {
    const s = player();
    expect(todayMode(s, '2026-10-05')).toBe('training'); // Monday
    expect(todayMode(s, '2026-10-06')).toBe('rest');
    expect(todayMode({ ...s, log: { '2026-10-05': 'cleared' } }, '2026-10-05')).toBe('cleared');
    expect(todayMode({ ...s, log: { '2026-10-06': 'cardio' } }, '2026-10-06')).toBe('cardio-done');
    expect(todayMode({ ...s, pauses: [{ start: '2026-10-05', end: '2026-10-07' }] }, '2026-10-06')).toBe('paused');
    expect(todayMode({ ...s, penalty: { missedDate: '2026-10-05' } }, '2026-10-06')).toBe('penalty');
  });
});
