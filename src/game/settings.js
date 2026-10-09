// Settings actions. Level, rank, streak and history always survive these.

import { localDate, addDays } from './dates.js';
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
  return s;
}

/** Pick training weekdays (0 = Monday). 2–5 days. Takes effect tomorrow. */
export function setTrainingDays(state, now, days) {
  const clean = [...new Set(days)].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  if (clean.length < 2 || clean.length > 5) return state;
  const s = structuredClone(state);
  s.pendingTrainingDays = { days: clean, from: addDays(localDate(now), 1) };
  s.profile = { ...s.profile, daysPerWeek: clean.length };
  return s;
}
