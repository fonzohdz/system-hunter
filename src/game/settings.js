// Settings actions. Level, rank, streak and history always survive these.

import { localDate, addDays, weekStart } from './dates.js';
import { programFor, defaultTrainingDays } from './programs.js';

/** Re-answer the setup questions: new program from day 1; weekdays change from tomorrow. */
export function changeProgram(state, now, profile) {
  const s = structuredClone(state);
  const tomorrow = addDays(localDate(now), 1);
  const programId = programFor(profile.location, profile.daysPerWeek);
  if (programId !== s.programId) s.cycleIndex = 0;
  s.profile = { ...profile };
  s.programId = programId;
  s.pendingTrainingDays = { days: defaultTrainingDays(profile.daysPerWeek), from: tomorrow };
  s.feedbackFor = null;
  s.pendingProgram = null; // an explicit program choice replaces any scheduled switch
  return s;
}

/**
 * Pick training weekdays (0 = Monday). 2–5 days. Takes effect tomorrow.
 * If the new day count calls for a different program (gym: 2–3 Full Body,
 * 4 Upper/Lower, 5 Push/Pull/Legs+), that switch is scheduled for next Monday.
 */
export function setTrainingDays(state, now, days) {
  const clean = [...new Set(days)].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6).sort((a, b) => a - b);
  if (clean.length < 2 || clean.length > 5) return state;
  const s = structuredClone(state);
  s.pendingTrainingDays = { days: clean, from: addDays(localDate(now), 1) };
  s.profile = { ...s.profile, daysPerWeek: clean.length };
  s.pendingProgram = programSwitchFor(s, localDate(now));
  return s;
}

/**
 * The program setup would pick for the player's day count. If that's a
 * different program, it starts next Monday, never mid-week (null = no switch).
 */
export function programSwitchFor(state, today) {
  const target = programFor(state.profile.location, state.profile.daysPerWeek);
  if (target === state.programId) return null;
  return { programId: target, from: addDays(weekStart(today), 7) };
}
