// Builds today's quest from the program, the day's feedback state and overrides.

import { PROGRAMS, EXERCISES, toBodyweight, finisher, cardioQuest } from './programs.js';
import { isScheduled, isPaused } from './schedule.js';

export const QUEST_XP = 100;
export const CARDIO_XP = 40;
export const PENALTY_BONUS_XP = 50;

/** The program day the cycle is on. Days advance per cleared training quest, never by weekday. */
export function currentDay(state) {
  const program = PROGRAMS[state.programId];
  const index = state.cycleIndex % program.days.length;
  return { program, day: program.days[index], index, count: program.days.length };
}

export function dayStateFor(state, key) {
  return state.dayState[key] || { adj: state.profile.experience === 'new' ? -1 : 0, weightCue: false, bwExtra: 0 };
}

/** Reps (or seconds) to show for a slot at a feedback level. */
export function targetFor(slot, adj) {
  const mid = Math.floor((slot.lo + slot.hi) / 2);
  const reps = adj <= -1 ? slot.lo : adj === 0 ? mid : slot.hi;
  const sets = adj <= -2 ? Math.max(2, slot.sets - 1) : slot.sets;
  return { sets, reps };
}

function formatTarget(sets, reps, slot) {
  const unit = slot.unit === 'sec' ? 's' : '';
  const side = slot.perSide ? '/side' : '';
  return `${sets} × ${reps}${unit}${side}`;
}

export const LOAD_CUE = 'Pick a weight where the last rep is hard but clean, about 2 reps left in the tank.';
export const WEIGHT_UP_CUE = 'Go up a little in weight.';

/**
 * @param {object} state
 * @param {{noGym?:boolean, short?:boolean}} [override]
 */
export function buildQuest(state, override = {}) {
  const { program, day, index, count } = currentDay(state);
  const ds = dayStateFor(state, day.key);
  let slots = override.noGym ? toBodyweight(day.slots) : day.slots;
  if (override.short) slots = slots.slice(0, 3).map((s) => ({ ...s, sets: Math.max(2, s.sets - 1) }));

  const items = slots.map((slot) => {
    const ex = EXERCISES[slot.ex];
    let { sets, reps } = targetFor(slot, ds.adj);
    if (!ex.loaded && ds.bwExtra) sets = Math.min(5, sets + ds.bwExtra);
    if (override.short) sets = Math.min(sets, Math.max(2, slot.sets));
    return {
      id: ex.id,
      name: ex.name,
      howTo: ex.howTo,
      loaded: ex.loaded,
      compound: ex.compound,
      sets,
      reps,
      target: formatTarget(sets, reps, slot),
      cue: ex.loaded ? (ds.weightCue ? WEIGHT_UP_CUE : LOAD_CUE) : null,
      restSec: ex.compound ? 90 : 60
    };
  });

  const minutes = override.short ? 20 : Math.round(items.reduce((m, it) => m + it.sets * (it.compound ? 2.5 : 2), 0) / 5) * 5;
  const penalty = state.penalty ? finisher(state.profile.experience) : null;

  return {
    kind: 'training',
    programName: program.name,
    dayKey: day.key,
    name: override.noGym && !day.name.includes('Body') ? `${day.name} (anywhere)` : day.name,
    dayNumber: index + 1,
    dayCount: count,
    items,
    minutes: penalty ? minutes + 10 : minutes,
    xp: QUEST_XP + (penalty ? PENALTY_BONUS_XP : 0),
    finisher: penalty,
    noGym: !!override.noGym,
    short: !!override.short
  };
}

/**
 * What today asks of the player.
 * @returns {'penalty'|'paused'|'cleared'|'training'|'rest'|'cardio-done'}
 */
export function todayMode(state, today) {
  if (isPaused(state, today)) return 'paused';
  const entry = state.log[today];
  if (state.penalty) return 'penalty';
  if (entry === 'cleared') return 'cleared';
  if (isScheduled(state, today)) return 'training';
  if (entry === 'cardio') return 'cardio-done';
  return 'rest';
}

export function buildCardio(state) {
  return { kind: 'cardio', xp: CARDIO_XP, ...cardioQuest(state.profile.experience) };
}
