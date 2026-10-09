// Test helpers: a fake calendar. Not imported by the app.

import { newState } from './save.js';
import { dateRange } from './dates.js';
import { evaluate } from './penalty.js';
import { completeQuest, canComplete } from './progress.js';

/** Epoch ms for a local date at an hour. */
export function at(date, hour = 12) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hour).getTime();
}

/** A player who joined on Monday 2026-10-05 training Mon/Wed/Fri at a gym. */
export function player(overrides = {}, profile = {}) {
  const p = { location: 'gym', daysPerWeek: 3, experience: 'some', ...profile };
  const s = newState(p, overrides.joinDate || '2026-10-05', at(overrides.joinDate || '2026-10-05', 9));
  return { ...s, ...overrides };
}

/**
 * Live through days: open the app at 08:00, and at 18:00 tap QUEST COMPLETE
 * whenever there's something to clear and `train(date)` says so.
 */
export function live(state, from, to, train = () => true) {
  let s = state;
  const events = [];
  for (const d of dateRange(from, to)) {
    const e = evaluate(s, at(d, 8));
    s = e.state;
    events.push(...e.events.map((x) => ({ ...x, date: d })));
    if (canComplete(s, d) && train(d)) {
      const c = completeQuest(s, at(d, 18));
      s = { ...c.state, feedbackFor: null };
      events.push(...c.events.map((x) => ({ ...x, date: d })));
    }
  }
  return { state: s, events };
}
