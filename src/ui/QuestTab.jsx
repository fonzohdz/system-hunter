import { useState } from 'preact/hooks';
import { Window, Cursor } from './Window.jsx';
import { HunterWindow } from './HunterWindow.jsx';
import { ClearedOverlay, FeedbackPrompt, ExerciseCard } from './Overlays.jsx';
import { buildQuest, buildCardio, todayMode } from '../game/quest.js';
import { completeQuest, completeCardio } from '../game/progress.js';
import { applyFeedback } from '../game/feedback.js';
import { resume } from '../game/penalty.js';
import { systemLine } from '../game/system.js';
import { nextTrainingDay } from '../game/schedule.js';
import { WEEKDAY_NAMES, weekday } from '../game/dates.js';

export function QuestTab({ game }) {
  const { state, today, now, events, act, clearEvents } = game;
  const [ovr, setOvr] = useState({ date: today, noGym: false, short: false });
  const override = ovr.date === today ? ovr : { date: today, noGym: false, short: false };
  const [open, setOpen] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const [askFeedback, setAskFeedback] = useState(false);

  const mode = todayMode(state, today);
  const line = systemLine(state, today, now, events);
  const isNew = state.profile.experience === 'new';
  const penalty = mode === 'penalty';
  const active = mode === 'training' || penalty;
  const quest = buildQuest(state, active ? override : {});

  const toggle = (key) => setOvr({ ...override, [key]: !override[key] });

  const clear = () => {
    const evts = act(completeQuest, override);
    if (evts.length) setCelebrate({ events: evts, kind: 'training' });
  };
  const clearCardio = () => {
    const evts = act(completeCardio);
    if (evts.length) setCelebrate({ events: evts, kind: 'cardio' });
  };
  const afterCelebrate = () => {
    const kind = celebrate && celebrate.kind;
    setCelebrate(null);
    if (kind === 'training') setAskFeedback(true);
  };
  const answer = (a) => {
    act((s) => applyFeedback(s, a));
    setAskFeedback(false);
    clearEvents();
  };

  const next = nextTrainingDay(state, today);
  const nextLabel = next ? WEEKDAY_NAMES[weekday(next)] : '';

  return (
    <main class="screen">
      <Window label="System message" class={`system-line ${line.tone === 'danger' ? 'danger-win' : ''}`}>
        <p class={`sys-text ${line.tone === 'danger' ? 'danger' : line.tone === 'gold' ? 'gold' : ''}`}>
          <span class="px sys-tag">SYSTEM</span> {line.text}
        </p>
      </Window>

      <HunterWindow state={state} />

      {active && (
        <Window label={penalty ? 'Penalty quest' : 'Daily quest'} class={`quest ${penalty ? 'danger-win' : ''}`}>
          <div class="row">
            <div class={`eyebrow ${penalty ? 'danger' : ''}`}>{penalty ? 'PENALTY QUEST' : 'DAILY QUEST'}</div>
            <div class="small num">~{quest.minutes} min</div>
          </div>
          <h1 class="px quest-name">{quest.name}</h1>
          <div class="small quest-meta">{quest.programName} · day {quest.dayNumber} of {quest.dayCount}</div>
          <ol class="moves">
            {quest.items.map((it, i) => (
              <li key={it.id}>
                <button class={`move ${i === 0 ? 'sel' : ''}`} onClick={() => setOpen(it)} aria-label={`${it.name}, ${it.target}. Show details`}>
                  <span class="cursor">{i === 0 && <Cursor />}</span>
                  <span class="move-main">
                    <span class="move-name">{it.name}</span>
                    {isNew && <span class="move-howto">{it.howTo}</span>}
                  </span>
                  <span class="px move-sets num">{it.target}</span>
                </button>
              </li>
            ))}
          </ol>
          {quest.finisher && (
            <div class="finisher">
              <div class="eyebrow danger">FINISHER</div>
              <p>{quest.finisher.rounds} rounds: {quest.finisher.burpees} burpees, {quest.finisher.climbers} mountain climbers, {quest.finisher.plankSec}s plank</p>
            </div>
          )}
          <div class="row px reward"><span class="muted">Reward</span><span class="gold">+<span class="num">{quest.xp}</span> EXP</span></div>
        </Window>
      )}

      {mode === 'cleared' && (
        <Window label="Quest cleared" class="quest">
          <div class="eyebrow">QUEST CLEARED</div>
          <h1 class="px quest-name">Done for today.</h1>
          <p class="muted">Next quest: {quest.name}{nextLabel && `, ${nextLabel}`}.</p>
          <p class="small">{quest.programName} · day {quest.dayNumber} of {quest.dayCount}</p>
        </Window>
      )}

      {(mode === 'rest' || mode === 'cardio-done') && (
        <Window label="Rest day" class="quest">
          <div class="eyebrow">REST DAY</div>
          <h1 class="px quest-name">Recovery is part of the quest.</h1>
          <p class="muted">Next quest: {quest.name}{nextLabel && `, ${nextLabel}`}.</p>
          <div class="cardio">
            <div class="row"><span class="eyebrow">OPTIONAL · CARDIO</span><span class="px gold">+<span class="num">{buildCardio(state).xp}</span> EXP</span></div>
            <p>{buildCardio(state).text}</p>
            <p class="small">Skipping it never counts against you.</p>
            {mode === 'rest'
              ? <button class="btn solid" onClick={clearCardio}>Cardio done</button>
              : <p class="ice px">Cardio cleared</p>}
          </div>
        </Window>
      )}

      {mode === 'paused' && (
        <Window label="Paused" class="quest">
          <div class="eyebrow">PAUSED</div>
          <h1 class="px quest-name">Training paused.</h1>
          <p class="muted">Nothing counts against you while you're paused.</p>
          <button class="btn" onClick={() => act(resume)}>Resume now</button>
        </Window>
      )}

      {active && (
        <Window label="Adjust today" class="tight ovr">
          <button class="btn" aria-pressed={override.noGym} onClick={() => toggle('noGym')}>No gym today</button>
          <button class="btn" aria-pressed={override.short} onClick={() => toggle('short')}>Short on time</button>
        </Window>
      )}

      {active && (
        <button class={`cta ${penalty ? 'danger' : ''}`} onClick={clear}>
          {penalty ? 'CLEAR PENALTY QUEST' : 'QUEST COMPLETE'}
        </button>
      )}

      {open && <ExerciseCard item={open} onClose={() => setOpen(null)} />}
      {celebrate && <ClearedOverlay events={celebrate.events} streak={state.streak} onDone={afterCelebrate} />}
      {askFeedback && state.feedbackFor && <FeedbackPrompt onAnswer={answer} />}
    </main>
  );
}
