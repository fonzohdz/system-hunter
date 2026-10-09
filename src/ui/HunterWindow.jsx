import { Window } from './Window.jsx';
import { levelProgress, stats } from '../game/progress.js';

/** Name, rank, level, EXP bar and stats: the top window on the Quest tab. */
export function HunterWindow({ state }) {
  const lp = levelProgress(state.totalXp);
  const st = stats(state);
  return (
    <Window label="Hunter status">
      <div class="row">
        <div class="px hunter-name">Hunter</div>
        <div class="px hunter-rank">Rank <span class="gold rank-letter glyph">{state.rank}</span> · Lv <span class="num">{lp.level}</span></div>
      </div>
      <div class="xp">
        <div class="row small"><span>EXP</span><span class="num">{lp.into.toLocaleString()} / {lp.need.toLocaleString()}</span></div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax={lp.need} aria-valuenow={lp.into} aria-label="EXP to next level">
          <div style={{ width: `${Math.round(lp.pct * 100)}%` }} />
        </div>
      </div>
      <div class="stats px">
        <div><div class="stat-lbl">STR</div><span class="num">{st.str}</span></div>
        <div><div class="stat-lbl">AGI</div><span class="num">{st.agi}</span></div>
        <div><div class="stat-lbl">VIT</div><span class="num">{st.vit}</span></div>
        <div><div class="stat-lbl">STREAK</div><span class="gold"><span class="num">{state.streak}</span> {state.streak === 1 ? 'day' : 'days'}</span></div>
      </div>
    </Window>
  );
}
