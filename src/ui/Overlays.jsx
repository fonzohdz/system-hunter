import { useState, useEffect, useRef } from 'preact/hooks';
import { Window } from './Window.jsx';
import { useCountUp } from './motion.jsx';
import { play, buzz } from './sfx.js';
import { levelFor, levelProgress } from '../game/progress.js';

/** A centered dialog over a dimmed screen. Tap outside or Escape-free: buttons close it. */
export function Dialog({ label, children, onBackdrop, class: cls = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const first = ref.current && ref.current.querySelector('button');
    if (first) first.focus();
  }, []);
  return (
    <div class="backdrop" onClick={(e) => e.target === e.currentTarget && onBackdrop && onBackdrop()}>
      <div class={`dialog ${cls}`} role="dialog" aria-modal="true" aria-label={label} ref={ref}>
        {children}
      </div>
    </div>
  );
}

/**
 * The "QUEST CLEARED" sequence: title stamps in, EXP counts up while the bar
 * fills, LEVEL UP flashes the moment the bar crosses, then RANK UP lands last.
 * A plain clear closes itself; a level or rank up waits for a tap. Tapping
 * mid-sequence skips to the end.
 */
export function ClearedOverlay({ events, total, streak, onDone }) {
  const gained = events.filter((e) => e.type === 'xp').reduce((n, e) => n + e.amount, 0);
  const before = total - gained;
  const startLevel = levelFor(before);
  const rank = events.filter((e) => e.type === 'rankUp').map((e) => e.rank).pop();
  const milestone = events.find((e) => e.type === 'milestone');
  const saved = events.some((e) => e.type === 'penaltySaved');
  const cardio = events.some((e) => e.type === 'cleared' && e.kind === 'cardio');
  const big = levelFor(total) > startLevel || !!rank;

  const [instant, setInstant] = useState(false);
  const shown = useCountUp(total, { from: before, ms: 1200, delay: 450, instant });
  const lp = levelProgress(shown);
  const [leveled, setLeveled] = useState(false);
  const [rankShown, setRankShown] = useState(false);
  const counted = shown === total;
  const finished = counted && (!rank || rankShown);

  useEffect(() => {
    play('clear');
    buzz([30, 40, 30]);
  }, []);
  useEffect(() => {
    if (lp.level > startLevel && !leveled) {
      setLeveled(true);
      play('levelUp');
      buzz([60, 40, 140]);
    }
  }, [lp.level]);
  useEffect(() => {
    if (!counted || !rank || rankShown) return undefined;
    const id = setTimeout(() => {
      setRankShown(true);
      play('rankUp');
      buzz([100, 60, 100, 60, 240]);
    }, instant ? 0 : 600);
    return () => clearTimeout(id);
  }, [counted, instant]);
  useEffect(() => {
    if (!finished || big) return undefined;
    const id = setTimeout(onDone, 1600);
    return () => clearTimeout(id);
  }, [finished]);

  const tap = () => (finished ? onDone() : setInstant(true));
  const title = saved ? 'PENALTY CLEARED' : cardio ? 'CARDIO CLEARED' : 'QUEST CLEARED';
  return (
    <div class={`backdrop cleared-bg ${rankShown ? 'shake' : ''}`} onClick={tap}>
      {leveled && <div class="flash" />}
      {rankShown && <div class="flash gold-flash" />}
      <div class="cleared" role="status" aria-live="assertive">
        <div class="px cleared-title stamp">{title}</div>
        <div class="px gold cleared-xp">+<span class="num">{shown - before}</span> EXP</div>
        <div class="cleared-bar">
          <div class="row small"><span class="px">Lv <span key={lp.level} class="num pop-in">{lp.level}</span></span><span class="num">{lp.into.toLocaleString()} / {lp.need.toLocaleString()}</span></div>
          <div class="bar live big"><div style={{ width: `${Math.round(lp.pct * 100)}%` }} /></div>
        </div>
        {leveled && (
          <div class="levelup-wrap">
            <div class="px levelup" aria-label="Level up">
              {'LEVEL UP'.split('').map((c, i) => <span key={i} style={{ '--d': i }}>{c === ' ' ? ' ' : c}</span>)}
            </div>
            <div class="small">Lv <span class="num">{startLevel}</span> → Lv <span class="num">{lp.level}</span></div>
          </div>
        )}
        {rankShown && (
          <div class="rankup">
            <div class="eyebrow gold">RANK UP</div>
            <div class="px rank-stamp gold">{rank}</div>
          </div>
        )}
        {finished && milestone && <div class="px banner pop-in"><span class="num">{milestone.days}</span>-DAY STREAK</div>}
        {!cardio && <div class="small">Streak <span class="num">{streak}</span></div>}
        <div class="small tap-hint">{finished ? 'Tap to continue' : 'Tap to skip'}</div>
      </div>
    </div>
  );
}

/** One optional tap after a training quest. Skip counts as "just right". */
export function FeedbackPrompt({ onAnswer }) {
  return (
    <Dialog label="How did that feel?" onBackdrop={() => onAnswer(null)}>
      <Window label="Feedback">
        <div class="eyebrow">SYSTEM</div>
        <p>How did that quest feel?</p>
        <div class="feedback-grid">
          <button class="btn" data-sfx="confirm" onClick={() => onAnswer('easy')}>Too easy</button>
          <button class="btn" data-sfx="confirm" onClick={() => onAnswer('right')}>Just right</button>
          <button class="btn" data-sfx="confirm" onClick={() => onAnswer('hard')}>Too hard</button>
        </div>
        <button class="btn ghost" data-sfx="back" onClick={() => onAnswer(null)}>Skip</button>
      </Window>
    </Dialog>
  );
}

/** Tapped exercise: target, cue, how-to, and a rest timer. */
export function ExerciseCard({ item, onClose }) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (left === null || left <= 0) {
      if (left === 0) {
        play('done');
        buzz([200, 100, 200]);
      }
      return undefined;
    }
    if (left <= 3) play('tick');
    const id = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  const mm = left === null ? '' : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return (
    <Dialog label={item.name} onBackdrop={onClose}>
      <Window label={item.name}>
        <div class="row">
          <h2 class="px card-title">{item.name}</h2>
          <span class="px muted num">{item.target}</span>
        </div>
        <p>{item.howTo}</p>
        {item.cue && <p class={item.cue.startsWith('Go up') ? 'gold' : 'muted'}>{item.cue}</p>}
        <div class="timer">
          {left === null && <button class="btn solid" onClick={() => setLeft(item.restSec)}>Start {item.restSec}s rest</button>}
          {left !== null && left > 0 && (
            <>
              <div class="timer-main">
                <div class="px timer-num num" aria-live="polite">{mm}</div>
                <div class="bar live timer-bar"><div style={{ width: `${(left / item.restSec) * 100}%` }} /></div>
              </div>
              <button class="btn" data-sfx="back" onClick={() => setLeft(null)}>Stop</button>
            </>
          )}
          {left === 0 && (
            <>
              <div class="px timer-num ice">REST COMPLETE</div>
              <button class="btn" onClick={() => setLeft(item.restSec)}>Again</button>
            </>
          )}
        </div>
        <button class="btn" data-sfx="back" onClick={onClose}>Close</button>
      </Window>
    </Dialog>
  );
}
