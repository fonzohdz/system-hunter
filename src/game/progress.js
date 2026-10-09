// XP, levels, streaks, perfect weeks, ranks, stats, and the "quest complete" actions.
// Public actions take a state and return {state, events}; they never mutate their input.

import { localDate, addDays, dateRange } from './dates.js';
import { isScheduled, isPaused } from './schedule.js';
import { buildQuest, dayStateFor, CARDIO_XP } from './quest.js';

export const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];
/** What it takes to hold each rank. `run` = perfect weeks in a row, `weeks` = total. */
export const RANK_REQ = {
  E: { weeks: 0, level: 1 },
  D: { weeks: 2, run: 2, level: 1 },
  C: { weeks: 6, level: 10 },
  B: { weeks: 16, level: 20 },
  A: { weeks: 30, level: 30 },
  S: { weeks: 45, level: 40 }
};
export const STREAK_MILESTONES = { 7: 100, 30: 300, 100: 1000 };
export const PERFECT_WEEK_XP = 50;

/** XP needed to go from level L to L+1. */
export function xpForNext(level) {
  return 100 + 25 * (level - 1);
}

/** Total XP at which `level` begins. */
export function xpToReach(level) {
  const n = level - 1;
  return 100 * n + (25 * n * (n - 1)) / 2;
}

export function levelFor(totalXp) {
  let level = 1;
  while (xpToReach(level + 1) <= totalXp) level++;
  return level;
}

/** Progress inside the current level, for the EXP bar. */
export function levelProgress(totalXp) {
  const level = levelFor(totalXp);
  const into = totalXp - xpToReach(level);
  const need = xpForNext(level);
  return { level, into, need, pct: into / need };
}

export function stats(state) {
  return {
    str: 5 + Math.floor(state.trainingClears / 3),
    agi: 5 + Math.floor(state.cardioClears / 2),
    vit: 5 + state.vitWeeks
  };
}

/** How far the player is from the next rank, for the Status tab. */
export function nextRankProgress(state) {
  const i = RANKS.indexOf(state.rank);
  if (i === RANKS.length - 1) return null;
  const next = RANKS[i + 1];
  const req = RANK_REQ[next];
  return {
    rank: next,
    weeks: req.run ? state.perfectWeekRun : state.perfectWeeks,
    weeksNeeded: req.run || req.weeks,
    inARow: !!req.run,
    level: levelFor(state.totalXp),
    levelNeeded: req.level
  };
}

// ── internal mutators (operate on a clone) ──

export function addXp(s, amount, events, reason) {
  const before = levelFor(s.totalXp);
  s.totalXp += amount;
  events.push({ type: 'xp', amount, reason });
  const after = levelFor(s.totalXp);
  if (after > before) events.push({ type: 'levelUp', level: after });
}

export function bumpStreak(s, events) {
  s.streak += 1;
  s.bestStreak = Math.max(s.bestStreak, s.streak);
  for (const [days, xp] of Object.entries(STREAK_MILESTONES)) {
    const m = Number(days);
    if (s.streak >= m && !s.milestonesPaid.includes(m)) {
      s.milestonesPaid.push(m);
      events.push({ type: 'milestone', days: m });
      addXp(s, xp, events, `${m}-day streak`);
    }
  }
}

export function resetStreak(s) {
  s.streak = 0;
  s.milestonesPaid = [];
}

export function checkRankUp(s, events) {
  for (;;) {
    const i = RANKS.indexOf(s.rank);
    if (i === RANKS.length - 1) return;
    const next = RANKS[i + 1];
    const req = RANK_REQ[next];
    const weeksOk = req.run ? s.perfectWeekRun >= req.run : s.perfectWeeks >= req.weeks;
    if (!weeksOk || levelFor(s.totalXp) < req.level) return;
    s.rank = next;
    events.push({ type: 'rankUp', rank: next });
  }
}

export function rankDown(s, events) {
  const i = RANKS.indexOf(s.rank);
  if (i === 0) return;
  s.rank = RANKS[i - 1];
  s.perfectWeeks = RANK_REQ[s.rank].weeks;
  s.perfectWeekRun = 0;
  events.push({ type: 'rankDown', rank: s.rank });
}

/**
 * Judge every finished week (Mon–Sun, fully evaluated) in order. A week waits
 * while a penalty for one of its days is still open, since clearing it can save the week.
 */
export function judgeWeeks(s, events) {
  for (;;) {
    const week = addDays(s.lastJudgedWeek, 7);
    const sunday = addDays(week, 6);
    if (sunday > s.lastEvaluated) return;
    if (s.penalty && s.penalty.missedDate >= week && s.penalty.missedDate <= sunday) return;
    const counted = dateRange(week, sunday)
      .filter((d) => d > s.joinDate)
      .map((d) => s.log[d])
      .filter((e) => e === 'cleared' || e === 'missed' || e === 'saved' || e === 'blown');
    if (counted.length) {
      if (counted.every((e) => e === 'cleared' || e === 'saved')) {
        s.perfectWeeks += 1;
        s.perfectWeekRun += 1;
        s.vitWeeks += 1;
        events.push({ type: 'perfectWeek', week });
        addXp(s, PERFECT_WEEK_XP, events, 'perfect week');
      } else {
        s.perfectWeekRun = 0;
      }
    }
    s.lastJudgedWeek = week;
    checkRankUp(s, events);
  }
}

// ── public actions ──

/** Can the main button clear a training (or penalty) quest right now? */
export function canComplete(state, today) {
  if (isPaused(state, today)) return false;
  if (state.penalty) return true;
  return isScheduled(state, today) && state.log[today] !== 'cleared';
}

/**
 * The one tap. Clears today's training quest, or the open penalty quest
 * (which saves the missed day and, on a training day, counts for today too).
 * @param {{noGym?:boolean, short?:boolean}} [override]
 */
export function completeQuest(state, now, override = {}) {
  const today = localDate(now);
  if (!canComplete(state, today)) return { state, events: [] };
  const s = structuredClone(state);
  const events = [];
  const quest = buildQuest(s, override);

  if (s.penalty) {
    s.log[s.penalty.missedDate] = 'saved';
    s.penalty = null;
    events.push({ type: 'penaltySaved' });
    bumpStreak(s, events);
  }
  if (isScheduled(s, today) && s.log[today] !== 'cleared') {
    s.log[today] = 'cleared';
    bumpStreak(s, events);
  }
  addXp(s, quest.xp, events, quest.finisher ? 'penalty quest' : 'quest');

  const ds = dayStateFor(s, quest.dayKey);
  s.dayState[quest.dayKey] = { ...ds, weightCue: false };
  s.cycleIndex += 1;
  s.trainingClears += 1;
  s.totalQuests += 1;
  s.feedbackFor = quest.dayKey;
  events.push({ type: 'cleared', kind: 'training' });

  checkRankUp(s, events);
  judgeWeeks(s, events);
  return { state: s, events };
}

export function canDoCardio(state, today) {
  return !isPaused(state, today) && !state.penalty && !isScheduled(state, today) && state.log[today] !== 'cardio';
}

/** The optional rest-day cardio quest. */
export function completeCardio(state, now) {
  const today = localDate(now);
  if (!canDoCardio(state, today)) return { state, events: [] };
  const s = structuredClone(state);
  const events = [];
  s.log[today] = 'cardio';
  s.cardioClears += 1;
  s.totalQuests += 1;
  addXp(s, CARDIO_XP, events, 'cardio');
  events.push({ type: 'cleared', kind: 'cardio' });
  checkRankUp(s, events);
  return { state: s, events };
}
