import { useState } from 'preact/hooks';
import { Window } from './Window.jsx';
import { levelProgress, stats, nextRankProgress } from '../game/progress.js';
import { isScheduled, isPaused } from '../game/schedule.js';
import { addDays, weekday } from '../game/dates.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const LEGEND = [
  ['cleared', 'Cleared'],
  ['saved', 'Penalty cleared'],
  ['cardio', 'Cardio'],
  ['missed', 'Penalty open'],
  ['blown', 'Missed'],
  ['paused', 'Paused']
];

/** What a calendar cell shows for date `d`. */
function cellKind(state, d, today) {
  const entry = state.log[d];
  if (entry) return entry;
  if (d < state.joinDate) return 'before';
  if (isPaused(state, d)) return 'paused';
  if (d === today) return isScheduled(state, d) ? 'today-training' : 'today';
  if (d > today) return isScheduled(state, d) ? 'planned' : 'future';
  return 'rest';
}

function Calendar({ state, today }) {
  const [y0, m0] = today.split('-').map(Number);
  const [offset, setOffset] = useState(0);
  const total = y0 * 12 + (m0 - 1) + offset;
  const y = Math.floor(total / 12);
  const m = total % 12;
  const first = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const daysIn = new Date(y, m + 1, 0).getDate();
  const lead = weekday(first);
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let i = 0; i < daysIn; i++) cells.push(addDays(first, i));
  const joinMonth = state.joinDate.slice(0, 7);
  const canBack = first.slice(0, 7) > joinMonth;
  return (
    <Window label="Calendar">
      <div class="row cal-head">
        <button class="btn icon" onClick={() => setOffset(offset - 1)} disabled={!canBack} aria-label="Previous month">‹</button>
        <div class="px">{MONTHS[m]} {y}</div>
        <button class="btn icon" onClick={() => setOffset(offset + 1)} disabled={offset >= 0} aria-label="Next month">›</button>
      </div>
      <div class="cal" role="grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={`h${i}`} class="cal-dow small">{d}</div>)}
        {cells.map((d, i) => (d
          ? <div key={d} class={`cal-cell k-${cellKind(state, d, today)}`} title={d}><span class="num">{Number(d.slice(8))}</span></div>
          : <div key={`e${i}`} />))}
      </div>
      <div class="legend">
        {LEGEND.map(([k, label]) => <span key={k} class="legend-item"><span class={`swatch k-${k}`} />{label}</span>)}
      </div>
    </Window>
  );
}

export function StatusTab({ game }) {
  const { state, today } = game;
  const lp = levelProgress(state.totalXp);
  const st = stats(state);
  const nr = nextRankProgress(state);
  return (
    <main class="screen">
      <Window label="Rank">
        <div class="status-top">
          <div class="rank-badge px gold" aria-label={`Rank ${state.rank}`}>{state.rank}</div>
          <div class="status-main">
            <div class="px status-level">Lv <span class="num">{lp.level}</span></div>
            <div class="small num">{(lp.need - lp.into).toLocaleString()} EXP to Lv {lp.level + 1}</div>
            <div class="bar"><div style={{ width: `${Math.round(lp.pct * 100)}%` }} /></div>
          </div>
        </div>
        {nr ? (
          <div class="next-rank">
            <div class="eyebrow">NEXT RANK: <span class="glyph">{nr.rank}</span></div>
            <div class="row"><span>{nr.inARow ? 'Perfect weeks in a row' : 'Perfect weeks'}</span><span class="px num">{Math.min(nr.weeks, nr.weeksNeeded)} / {nr.weeksNeeded}</span></div>
            {nr.levelNeeded > 1 && <div class="row"><span>Level</span><span class="px num">{Math.min(nr.level, nr.levelNeeded)} / {nr.levelNeeded}</span></div>}
            <p class="small">A perfect week = every training day cleared (penalty quests you clear count).</p>
          </div>
        ) : <div class="eyebrow gold">MAX RANK</div>}
      </Window>

      <Window label="Stats">
        <div class="stats-big">
          <div><div class="stat-lbl">STR</div><div class="num stat-num">{st.str}</div><div class="small">from training</div></div>
          <div><div class="stat-lbl">AGI</div><div class="num stat-num">{st.agi}</div><div class="small">from cardio</div></div>
          <div><div class="stat-lbl">VIT</div><div class="num stat-num">{st.vit}</div><div class="small">from perfect weeks</div></div>
        </div>
        <div class="row"><span>Streak</span><span class="px gold num">{state.streak}</span></div>
        <div class="row"><span>Best streak</span><span class="px num">{state.bestStreak}</span></div>
        <div class="row"><span>Quests cleared</span><span class="px num">{state.totalQuests}</span></div>
      </Window>

      <Calendar state={state} today={today} />
    </main>
  );
}
