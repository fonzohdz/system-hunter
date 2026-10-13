// The save file: one JSON object in localStorage. This is the only game module
// allowed to touch storage. Any change to the state shape needs a step in migrate().

import { programFor, defaultTrainingDays, PROGRAMS } from './programs.js';
import { addDays, weekStart } from './dates.js';

export const SAVE_KEY = 'sh:save:v1';
export const SCHEMA_VERSION = 1;

/**
 * A fresh player. Everyone starts Rank E, Lv 1, whatever their experience.
 * @param {{location:'gym'|'home'|'none', daysPerWeek:number, experience:'new'|'some'|'experienced'}} profile
 * @param {string} today YYYY-MM-DD
 * @param {number} now epoch ms
 */
export function newState(profile, today, now) {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    joinDate: today,
    profile: { ...profile },
    programId: programFor(profile.location, profile.daysPerWeek),
    trainingDays: defaultTrainingDays(profile.daysPerWeek),
    pendingTrainingDays: null, // {days, from} — schedule edits apply from tomorrow
    pendingProgram: null, // {programId, from} — a day-count change that needs another program applies next Monday
    cycleIndex: 0,
    totalXp: 0,
    rank: 'E',
    perfectWeeks: 0, // counts toward rank; set back on a rank drop
    perfectWeekRun: 0, // consecutive perfect weeks
    vitWeeks: 0, // every perfect week ever, for VIT; never set back
    lastJudgedWeek: addDays(weekStart(today), -7), // Monday of the last week judged for "perfect"
    trainingClears: 0,
    cardioClears: 0,
    streak: 0,
    bestStreak: 0,
    milestonesPaid: [],
    log: {}, // date → 'cleared' | 'cardio' | 'missed' | 'saved' | 'blown' | 'paused'
    penalty: null, // {missedDate, issuedAt, deadline}
    blowouts: [], // epoch ms of each blown penalty
    pauses: [], // {start, end, startedAt} dates inclusive
    lastEvaluated: today, // the join day is never judged as a miss
    dayState: {}, // program day key → {adj, weightCue, bwExtra}
    feedbackFor: null, // day key waiting on "too easy / just right / too hard"
    totalQuests: 0
  };
}

/** Bring an older save up to the current schema. Returns null if it can't. */
export function migrate(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.schemaVersion === SCHEMA_VERSION) {
    // Added 2026-10-13 (still schema 1, purely additive): older saves have no pending program.
    if (!('pendingProgram' in obj)) return { ...obj, pendingProgram: null };
    return obj;
  }
  return null;
}

const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const COUNTERS = ['cycleIndex', 'totalXp', 'perfectWeeks', 'perfectWeekRun', 'vitWeeks', 'trainingClears', 'cardioClears', 'streak', 'bestStreak', 'totalQuests'];

/**
 * Does `s` have every field the game reads, with the right types? A save that
 * fails this would crash the app, so it's treated as damaged instead.
 */
export function isValidState(s) {
  if (!isObj(s)) return false;
  if (!isDate(s.joinDate) || !isDate(s.lastEvaluated) || !isDate(s.lastJudgedWeek)) return false;
  if (!isObj(s.profile) || !PROGRAMS[s.programId]) return false;
  if (!Array.isArray(s.trainingDays) || !s.trainingDays.every(Number.isInteger)) return false;
  if (!COUNTERS.every((k) => isNum(s[k]))) return false;
  if (!['E', 'D', 'C', 'B', 'A', 'S'].includes(s.rank)) return false;
  if (!isObj(s.log) || !isObj(s.dayState)) return false;
  if (!Array.isArray(s.milestonesPaid) || !Array.isArray(s.blowouts) || !Array.isArray(s.pauses)) return false;
  if (!s.pauses.every((p) => isObj(p) && isDate(p.start) && isDate(p.end))) return false;
  if (s.penalty !== null && !(isObj(s.penalty) && isDate(s.penalty.missedDate) && isNum(s.penalty.deadline))) return false;
  const pt = s.pendingTrainingDays;
  if (pt !== null && !(isObj(pt) && Array.isArray(pt.days) && isDate(pt.from))) return false;
  if (s.feedbackFor !== null && typeof s.feedbackFor !== 'string') return false;
  const pp = s.pendingProgram;
  if (pp !== null && !(isObj(pp) && PROGRAMS[pp.programId] && isDate(pp.from))) return false;
  return true;
}

/**
 * Read the save and say what was found:
 * 'none' (nothing saved yet), 'ok' (state is usable) or 'damaged' (something is
 * stored but the game can't use it; `raw` holds it so it can be backed up).
 * @param {Storage} [storage]
 * @returns {{status:'none'|'ok'|'damaged', state:object|null, raw:string|null}}
 */
export function read(storage = globalThis.localStorage) {
  let raw;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return { status: 'none', state: null, raw: null }; // storage blocked: nothing readable
  }
  if (!raw) return { status: 'none', state: null, raw: null };
  try {
    const s = migrate(JSON.parse(raw));
    if (s && isValidState(s)) return { status: 'ok', state: s, raw };
  } catch {
    /* not JSON: damaged */
  }
  return { status: 'damaged', state: null, raw };
}

/** @param {Storage} [storage] @returns the usable save, or null when missing or damaged */
export function load(storage = globalThis.localStorage) {
  return read(storage).state;
}

/**
 * Keep a copy of a damaged save under its own key so it can be recovered later.
 * @returns {string|null} the backup key, or null if it couldn't be written
 */
export function backupDamaged(raw, now, storage = globalThis.localStorage) {
  const key = `${SAVE_KEY}.corrupt-${now}`;
  try {
    storage.setItem(key, raw);
    return storage.getItem(key) === raw ? key : null;
  } catch {
    return null;
  }
}

/** @param {Storage} [storage] @returns {boolean} whether it was written */
export function save(state, storage = globalThis.localStorage) {
  try {
    const raw = JSON.stringify(state);
    storage.setItem(SAVE_KEY, raw);
    return true;
  } catch {
    return false;
  }
}

/** @param {Storage} [storage] */
export function wipe(storage = globalThis.localStorage) {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    /* storage blocked: nothing to wipe */
  }
}
