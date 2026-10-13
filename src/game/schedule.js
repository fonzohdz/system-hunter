// Which days are training days, which are paused. Shared by quest, penalty and UI.

import { weekday, addDays, daysBetween } from './dates.js';

/** Training weekdays in effect on date `d` (edits apply from their `from` date). */
export function trainingDaysOn(state, d) {
  const p = state.pendingTrainingDays;
  return p && d >= p.from ? p.days : state.trainingDays;
}

export function isScheduled(state, d) {
  return trainingDaysOn(state, d).includes(weekday(d));
}

export function pauseOn(state, d) {
  return state.pauses.find((p) => p.start <= d && d <= p.end) || null;
}

export function isPaused(state, d) {
  return !!pauseOn(state, d);
}

/** Pauses started in the 30 days up to and including `today`. */
export function pausesUsed(state, today) {
  return state.pauses.filter((p) => daysBetween(p.start, today) < 30 && daysBetween(p.start, today) >= 0).length;
}

/** The next scheduled, unpaused training date strictly after `d` (within 2 weeks). */
export function nextTrainingDay(state, d) {
  for (let i = 1; i <= 14; i++) {
    const x = addDays(d, i);
    if (isScheduled(state, x) && !isPaused(state, x)) return x;
  }
  return null;
}

/**
 * Fold a pending schedule edit into trainingDays once it's in effect, and
 * switch to a pending program once its Monday arrives (rotation restarts at
 * day 1, like changing program; XP, rank, streak and history are untouched).
 */
export function settleSchedule(state, today) {
  let s = state;
  const p = s.pendingTrainingDays;
  if (p && today >= p.from && s.lastEvaluated >= addDays(p.from, -1)) {
    s = { ...s, trainingDays: p.days, pendingTrainingDays: null };
  }
  const pp = s.pendingProgram;
  if (pp && today >= pp.from) {
    s = { ...s, programId: pp.programId, cycleIndex: pp.programId === s.programId ? s.cycleIndex : 0, pendingProgram: null, feedbackFor: null };
  }
  return s;
}
