import { describe, it, expect } from 'vitest';
import { applyFeedback } from './feedback.js';
import { buildQuest, WEIGHT_UP_CUE, LOAD_CUE } from './quest.js';
import { completeQuest } from './progress.js';
import { evaluate, pause } from './penalty.js';
import { systemLine } from './system.js';
import { newState, load, save, migrate, wipe, SAVE_KEY } from './save.js';
import { player, at } from './testkit.js';

const ask = (s, key) => ({ ...s, feedbackFor: key });

describe('feedback', () => {
  it('climbs the ladder: -1 → 0 → +1 → weight up, back to 0', () => {
    let s = player({}, { experience: 'new' }); // starts at -1
    s = applyFeedback(ask(s, 'gymFullA'), 'easy');
    expect(s.dayState.gymFullA.adj).toBe(0);
    s = applyFeedback(ask(s, 'gymFullA'), 'easy');
    expect(s.dayState.gymFullA.adj).toBe(1);
    s = applyFeedback(ask(s, 'gymFullA'), 'easy');
    expect(s.dayState.gymFullA).toEqual({ adj: 0, weightCue: true, bwExtra: 1 });
    expect(s.feedbackFor).toBeNull();
  });

  it('too hard goes down to a floor of -2', () => {
    let s = player();
    for (let i = 0; i < 4; i++) s = applyFeedback(ask(s, 'gymFullA'), 'hard');
    expect(s.dayState.gymFullA.adj).toBe(-2);
  });

  it('just right or skipped changes nothing but clears the prompt', () => {
    const s = ask(player(), 'gymFullA');
    expect(applyFeedback(s, 'right').dayState.gymFullA).toEqual({ adj: 0, weightCue: false, bwExtra: 0 });
    expect(applyFeedback(s, null).feedbackFor).toBeNull();
  });

  it('the weight cue shows once on the next time that day comes up', () => {
    let s = player({ dayState: { gymFullA: { adj: 1, weightCue: false, bwExtra: 0 } } });
    s = completeQuest(s, at('2026-10-05', 18)).state;
    s = applyFeedback(s, 'easy');
    s = { ...s, cycleIndex: 2 }; // back to day A
    expect(buildQuest(s).items[0].cue).toBe(WEIGHT_UP_CUE);
    s = completeQuest(s, at('2026-10-07', 18)).state;
    s = applyFeedback(s, null);
    expect(buildQuest({ ...s, cycleIndex: 2 }).items[0].cue).toBe(LOAD_CUE);
  });

  it('bodyweight extra sets cap at +2', () => {
    let s = player({ dayState: { gymFullA: { adj: 1, weightCue: false, bwExtra: 2 } } });
    s = applyFeedback(ask(s, 'gymFullA'), 'easy');
    expect(s.dayState.gymFullA.bwExtra).toBe(2);
  });
});

describe('the System', () => {
  const today = '2026-10-05';
  it('greets the first quest and later ones differently', () => {
    expect(systemLine(player(), today, at(today)).text).toBe('Your first Daily Quest has arrived.');
    expect(systemLine(player({ totalQuests: 3 }), today, at(today)).text).toBe('The Daily Quest has arrived.');
  });

  it('rest, cardio, cleared', () => {
    expect(systemLine(player(), '2026-10-06', at('2026-10-06')).text).toBe('Rest day. Recovery is part of the quest.');
    expect(systemLine(player({ log: { '2026-10-06': 'cardio' } }), '2026-10-06', 0).text).toBe('Cardio logged. Recovery continues.');
    const cleared = completeQuest(player(), at(today, 18)).state;
    expect(systemLine(cleared, today, at(today, 18)).text).toBe('Quest cleared. Next quest: Wednesday.');
  });

  it('penalty with hours left, in danger tone', () => {
    const s = evaluate(player(), at('2026-10-08', 8)).state;
    const line = systemLine(s, '2026-10-08', at('2026-10-08', 8));
    expect(line).toEqual({ text: 'PENALTY QUEST ISSUED. Clear it within 40h or lose EXP and your streak.', tone: 'danger' });
  });

  it('paused', () => {
    const s = pause(player(), at('2026-10-06', 9), 3).state;
    expect(systemLine(s, '2026-10-06', 0).text).toBe('Training paused until Thursday. Nothing counts against you.');
  });

  it('reacts to events first', () => {
    const s = player({ rank: 'D' });
    expect(systemLine(s, today, 0, [{ type: 'rankUp' }]).text).toBe('Rank up. You are now Rank D.');
    expect(systemLine(s, today, 0, [{ type: 'penaltyBlown' }]).tone).toBe('danger');
    expect(systemLine(s, today, 0, [{ type: 'penaltyBlown' }, { type: 'rankDown' }]).text).toBe('Repeated non-compliance. Rank reduced to D.');
  });
});

describe('save file', () => {
  const memory = () => {
    const m = new Map();
    return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
  };

  it('everyone starts at Rank E, Lv 1, whatever their experience', () => {
    for (const experience of ['new', 'some', 'experienced']) {
      const s = newState({ location: 'gym', daysPerWeek: 4, experience }, '2026-10-05', 0);
      expect(s.rank).toBe('E');
      expect(s.totalXp).toBe(0);
      expect(s.programId).toBe('gym_ul');
    }
  });

  it('round-trips', () => {
    const st = memory();
    const s = player();
    expect(save(s, st)).toBe(true);
    expect(load(st)).toEqual(s);
  });

  it('returns null for missing, corrupt or unknown saves', () => {
    const st = memory();
    expect(load(st)).toBeNull();
    st.setItem(SAVE_KEY, '{nope');
    expect(load(st)).toBeNull();
    st.setItem(SAVE_KEY, JSON.stringify({ schemaVersion: 99 }));
    expect(load(st)).toBeNull();
    expect(migrate(null)).toBeNull();
  });

  it('never touches the old app keys', () => {
    const st = memory();
    st.setItem('asc:hunter:v4', 'old');
    save(player(), st);
    wipe(st);
    expect(st.getItem('asc:hunter:v4')).toBe('old');
    expect(st.getItem(SAVE_KEY)).toBeNull();
  });

  it('survives blocked storage', () => {
    const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
    expect(load(broken)).toBeNull();
    expect(save(player(), broken)).toBe(false);
    expect(() => wipe(broken)).not.toThrow();
  });
});
