// The save file: one JSON object in localStorage. This is the only game module
// allowed to touch storage. Any change to the state shape needs a step in migrate().

import { programFor, defaultTrainingDays } from './programs.js';
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
  if (obj.schemaVersion === SCHEMA_VERSION) return obj;
  return null;
}

/** @param {Storage} [storage] */
export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
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
