// Calendar helpers. Days are local-date strings 'YYYY-MM-DD'. Arithmetic runs
// at UTC noon so DST shifts can never push a date onto the wrong day.

/** @param {Date|number} t a Date or epoch ms @returns {string} its local calendar date */
export function localDate(t) {
  const d = t instanceof Date ? t : new Date(t);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toUTC(s) {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d, 12);
}

function fromUTC(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** @returns {string} `s` shifted by `n` days */
export function addDays(s, n) {
  return fromUTC(toUTC(s) + n * 86400000);
}

/** @returns {number} whole days from `a` to `b` (negative when b is earlier) */
export function daysBetween(a, b) {
  return Math.round((toUTC(b) - toUTC(a)) / 86400000);
}

/** @returns {number} 0 = Monday … 6 = Sunday */
export function weekday(s) {
  return (new Date(toUTC(s)).getUTCDay() + 6) % 7;
}

/** @returns {string} the Monday of the week containing `s` */
export function weekStart(s) {
  return addDays(s, -weekday(s));
}

/** Every date from `from` to `to`, both inclusive. Empty when from > to. */
export function dateRange(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** The instant local midnight starts on date `s`, as epoch ms. */
export function startOfDay(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
