// Judging past days: misses, penalty quests, blowouts, rank drops, and pauses.

import { localDate, addDays, dateRange, startOfDay, daysBetween } from './dates.js';
import { isScheduled, isPaused, pauseOn, pausesUsed, settleSchedule } from './schedule.js';
import { levelFor, xpToReach, resetStreak, rankDown, judgeWeeks } from './progress.js';

const HOUR = 3600000;
const DAY = 24 * HOUR;
export const PENALTY_HOURS = 48;
export const BLOWOUTS_FOR_RANK_DROP = 3;
export const MAX_PAUSE_DAYS = 7;
export const MAX_PAUSES_PER_30_DAYS = 2;

/** Blow the open penalty at time `at`: XP loss inside the level, streak reset, maybe a rank drop. */
function blow(s, at, events) {
  if (!s.penalty) return;
  s.log[s.penalty.missedDate] = 'blown';
  const level = levelFor(s.totalXp);
  const loss = Math.floor((s.totalXp - xpToReach(level)) * 0.5);
  s.totalXp -= loss;
  resetStreak(s);
  s.penalty = null;
  s.blowouts = [...s.blowouts.filter((t) => t > at - 30 * DAY), at];
  events.push({ type: 'penaltyBlown', xpLost: loss });
  if (s.blowouts.length >= BLOWOUTS_FOR_RANK_DROP) {
    rankDown(s, events);
    s.blowouts = [];
  }
}

/**
 * Judge every day from the last evaluation up to yesterday, in order, then check
 * the open penalty's deadline against `now`. Days are judged once; if the clock
 * goes backwards nothing is re-judged. Call on every app open and focus.
 */
export function evaluate(state, now) {
  const today = localDate(now);
  const yesterday = addDays(today, -1);
  if (state.lastEvaluated >= yesterday && !(state.penalty && state.penalty.deadline <= now)) {
    const settled = settleSchedule(state, today);
    return { state: settled, events: [] };
  }
  const s = structuredClone(state);
  const events = [];

  for (const d of dateRange(addDays(s.lastEvaluated, 1), yesterday)) {
    const midnight = startOfDay(addDays(d, 1));
    if (s.penalty && s.penalty.deadline <= midnight) blow(s, s.penalty.deadline, events);
    if (isScheduled(s, d) && s.log[d] !== 'cleared') {
      if (isPaused(s, d)) {
        s.log[d] = 'paused';
      } else {
        if (s.penalty) blow(s, midnight, events); // a second miss while one is open
        s.log[d] = 'missed';
        s.penalty = { missedDate: d, issuedAt: midnight, deadline: midnight + PENALTY_HOURS * HOUR };
        events.push({ type: 'penaltyIssued', missedDate: d });
      }
    }
    s.lastEvaluated = d;
  }
  if (s.penalty && s.penalty.deadline <= now) blow(s, s.penalty.deadline, events);

  judgeWeeks(s, events);
  return { state: settleSchedule(s, today), events };
}

/** Why a pause can't start today, or null if it can. */
export function pauseBlocker(state, today) {
  if (state.pauses.some((p) => p.end >= today && p.start <= p.end)) return 'already-paused';
  if (pausesUsed(state, today) >= MAX_PAUSES_PER_30_DAYS) return 'limit';
  return null;
}

/** Pause for 1–7 days starting today. An open penalty's deadline moves back by the same days. */
export function pause(state, now, days) {
  const today = localDate(now);
  const n = Math.max(1, Math.min(MAX_PAUSE_DAYS, Math.floor(days)));
  if (pauseBlocker(state, today)) return { state, events: [] };
  const s = structuredClone(state);
  s.pauses.push({ start: today, end: addDays(today, n - 1), startedAt: now });
  if (s.penalty) s.penalty.deadline += n * DAY;
  return { state: s, events: [{ type: 'paused', until: addDays(today, n - 1) }] };
}

/** End the current pause now. Today becomes a normal day again. */
export function resume(state, now) {
  const today = localDate(now);
  const p = pauseOn(state, today);
  if (!p) return { state, events: [] };
  const s = structuredClone(state);
  const mine = s.pauses.find((x) => x.start === p.start && x.startedAt === p.startedAt);
  const unused = daysBetween(today, mine.end) + 1;
  mine.end = addDays(today, -1);
  if (s.penalty) s.penalty.deadline -= unused * DAY;
  return { state: s, events: [{ type: 'resumed' }] };
}
