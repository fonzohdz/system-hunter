// The System's voice. One pure function so push notifications can reuse it later.
// Cold, precise, never guilt-tripping.

import { todayMode } from './quest.js';
import { pauseOn, nextTrainingDay } from './schedule.js';
import { WEEKDAY_NAMES, weekday } from './dates.js';

const HOUR = 3600000;

/**
 * The line shown at the top of the Quest tab.
 * @param {object} state
 * @param {string} today
 * @param {number} now
 * @param {{type:string}[]} [events] events from the last action or evaluation, newest last
 */
export function systemLine(state, today, now, events = []) {
  const types = events.map((e) => e.type);
  if (types.includes('rankDown')) return { text: `Repeated non-compliance. Rank reduced to ${state.rank}.`, tone: 'danger' };
  if (types.includes('penaltyBlown')) return { text: 'The Player has failed to comply. Penalty applied.', tone: 'danger' };
  if (types.includes('rankUp')) return { text: `Rank up. You are now Rank ${state.rank}.`, tone: 'gold' };
  if (types.includes('penaltySaved')) return { text: 'Penalty cleared. Your streak survives.', tone: 'normal' };

  const mode = todayMode(state, today);
  if (mode === 'paused') {
    const p = pauseOn(state, today);
    return { text: `Training paused until ${WEEKDAY_NAMES[weekday(p.end)]}. Nothing counts against you.`, tone: 'normal' };
  }
  if (mode === 'penalty') {
    const hours = Math.max(0, Math.ceil((state.penalty.deadline - now) / HOUR));
    return { text: `PENALTY QUEST ISSUED. Clear it within ${hours}h or lose EXP and your streak.`, tone: 'danger' };
  }
  if (mode === 'cleared') {
    const next = nextTrainingDay(state, today);
    return { text: next ? `Quest cleared. Next quest: ${WEEKDAY_NAMES[weekday(next)]}.` : 'Quest cleared.', tone: 'normal' };
  }
  if (mode === 'training') {
    return state.totalQuests === 0
      ? { text: 'Your first Daily Quest has arrived.', tone: 'normal' }
      : { text: 'The Daily Quest has arrived.', tone: 'normal' };
  }
  if (mode === 'cardio-done') return { text: 'Cardio logged. Recovery continues.', tone: 'normal' };
  return { text: 'Rest day. Recovery is part of the quest.', tone: 'normal' };
}
