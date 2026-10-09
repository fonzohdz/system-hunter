// "Too easy / Just right / Too hard": progression without logging weights.

import { dayStateFor } from './quest.js';

export const ADJ_MIN = -2;
export const ADJ_MAX = 1;
const BW_EXTRA_MAX = 2;

/**
 * @param {'easy'|'right'|'hard'|null} answer null = skipped, same as "just right"
 */
export function applyFeedback(state, answer) {
  const key = state.feedbackFor;
  if (!key) return state;
  const s = structuredClone(state);
  const ds = { ...dayStateFor(s, key) };
  if (answer === 'easy') {
    if (ds.adj >= ADJ_MAX) {
      // top of the range and still easy: heavier weight, back to mid-range
      ds.adj = 0;
      ds.weightCue = true;
      ds.bwExtra = Math.min(BW_EXTRA_MAX, ds.bwExtra + 1);
    } else {
      ds.adj += 1;
    }
  } else if (answer === 'hard') {
    ds.adj = Math.max(ADJ_MIN, ds.adj - 1);
  }
  s.dayState[key] = ds;
  s.feedbackFor = null;
  return s;
}
