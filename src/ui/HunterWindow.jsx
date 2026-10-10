import { useState, useEffect, useRef } from 'preact/hooks';
import { Window } from './Window.jsx';
import { useCountUp } from './motion.jsx';
import { levelProgress, stats } from '../game/progress.js';

/**
 * Name, rank, level, EXP bar and stats: the top window on the Quest tab.
 * EXP counts up and the bar fills when it changes. `hold` keeps the old value
 * while an overlay covers the window, so the fill happens where you can see it.
 */
export function HunterWindow({ state, hold = false }) {
  const xp = useCountUp(state.totalXp, { ms: 1000, delay: 150, hold });
  const lp = levelProgress(xp);
  const st = stats(state);

  const [gain, setGain] = useState(null);
  const last = useRef(state.totalXp);
  useEffect(() => {
    if (hold) return;
    const diff = state.totalXp - last.current;
    last.current = state.totalXp;
    if (diff > 0) setGain({ n: diff, k: state.totalXp });
  }, [state.totalXp, hold]);

  return (
    <Window label="Hunter status">
      <div class="row">
        <div class="px hunter-name">Hunter</div>
        <div class="px hunter-rank">Rank <span class="gold rank-letter glyph">{state.rank}</span> · Lv <span key={lp.level} class="num pop-in">{lp.level}</span></div>
      </div>
      <div class="xp">
        <div class="row small"><span>EXP</span><span class="num">{lp.into.toLocaleString()} / {lp.need.toLocaleString()}</span></div>
        <div class="bar live" role="progressbar" aria-valuemin="0" aria-valuemax={lp.need} aria-valuenow={lp.into} aria-label="EXP to next level">
          <div style={{ width: `${Math.round(lp.pct * 100)}%` }} />
        </div>
        {gain && <span key={gain.k} class="px gold xp-gain" aria-hidden="true">+<span class="num">{gain.n}</span> EXP</span>}
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
