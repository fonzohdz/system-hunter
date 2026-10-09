import { useState, useEffect, useRef } from 'preact/hooks';
import { Window } from './Window.jsx';

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

/** The short "QUEST CLEARED" moment. Auto-closes after 2.5s, or tap to skip. */
export function ClearedOverlay({ events, streak, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2500);
    return () => clearTimeout(id);
  }, []);
  const xp = events.filter((e) => e.type === 'xp').reduce((n, e) => n + e.amount, 0);
  const level = events.filter((e) => e.type === 'levelUp').map((e) => e.level).pop();
  const rank = events.filter((e) => e.type === 'rankUp').map((e) => e.rank).pop();
  const milestone = events.find((e) => e.type === 'milestone');
  const saved = events.some((e) => e.type === 'penaltySaved');
  const cardio = events.some((e) => e.type === 'cleared' && e.kind === 'cardio');
  return (
    <div class="backdrop" onClick={onDone}>
      <div class="cleared" role="status" aria-live="assertive">
        <div class="px cleared-title">{saved ? 'PENALTY CLEARED' : cardio ? 'CARDIO CLEARED' : 'QUEST CLEARED'}</div>
        <div class="px gold cleared-xp">+<span class="num">{xp}</span> EXP</div>
        {level && <div class="px banner">LEVEL UP → Lv <span class="num">{level}</span></div>}
        {rank && <div class="px banner gold">RANK UP → <span class="glyph">{rank}</span></div>}
        {milestone && <div class="px banner"><span class="num">{milestone.days}</span>-DAY STREAK</div>}
        {!cardio && <div class="small">Streak <span class="num">{streak}</span></div>}
        <div class="small tap-hint">Tap to continue</div>
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
          <button class="btn" onClick={() => onAnswer('easy')}>Too easy</button>
          <button class="btn" onClick={() => onAnswer('right')}>Just right</button>
          <button class="btn" onClick={() => onAnswer('hard')}>Too hard</button>
        </div>
        <button class="btn ghost" onClick={() => onAnswer(null)}>Skip</button>
      </Window>
    </Dialog>
  );
}

/** Tapped exercise: target, cue, how-to, and a rest timer. */
export function ExerciseCard({ item, onClose }) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (left === null || left <= 0) {
      if (left === 0 && navigator.vibrate) navigator.vibrate([200, 100, 200]);
      return undefined;
    }
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
              <div class="px timer-num num" aria-live="polite">{mm}</div>
              <button class="btn" onClick={() => setLeft(null)}>Stop</button>
            </>
          )}
          {left === 0 && (
            <>
              <div class="px timer-num ice">REST COMPLETE</div>
              <button class="btn" onClick={() => setLeft(item.restSec)}>Again</button>
            </>
          )}
        </div>
        <button class="btn" onClick={onClose}>Close</button>
      </Window>
    </Dialog>
  );
}
