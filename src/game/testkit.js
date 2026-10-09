// Test helpers: a fake calendar. Not imported by the app.

import { newState } from './save.js';

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
