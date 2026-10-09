import { useState } from 'preact/hooks';
import { Window } from './Window.jsx';
import { Onboarding } from './Onboarding.jsx';
import { PROGRAMS, defaultTrainingDays } from '../game/programs.js';
import { changeProgram, setTrainingDays } from '../game/settings.js';
import { pause, resume, pauseBlocker, MAX_PAUSE_DAYS } from '../game/penalty.js';
import { trainingDaysOn, pauseOn } from '../game/schedule.js';
import { addDays, WEEKDAY_SHORT, WEEKDAY_NAMES, weekday } from '../game/dates.js';

export function SettingsTab({ game }) {
  const { state, today, act, reset } = game;
  const [changing, setChanging] = useState(false);
  const tomorrow = addDays(today, 1);
  const upcoming = trainingDaysOn(state, tomorrow);
  const [days, setDays] = useState(upcoming);
  const [pauseDays, setPauseDays] = useState(3);
  const [confirmText, setConfirmText] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  if (changing) {
    return (
      <Onboarding
        initial={state.profile}
        onCancel={() => setChanging(false)}
        onFinish={(answers) => {
          act(changeProgram, answers);
          setDays(defaultTrainingDays(answers.daysPerWeek));
          setChanging(false);
          setSavedMsg('Program changed. Your level and rank are kept.');
        }}
      />
    );
  }

  const daysChanged = days.slice().sort().join() !== upcoming.slice().sort().join();
  const daysValid = days.length >= 2 && days.length <= 5;
  const toggleDay = (d) => setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);

  const p = pauseOn(state, today);
  const blocker = pauseBlocker(state, today);

  return (
    <main class="screen">
      {savedMsg && <Window label="Saved" class="system-line"><p class="sys-text"><span class="px sys-tag">SYSTEM</span> {savedMsg}</p></Window>}

      <Window label="Program">
        <div class="eyebrow">PROGRAM</div>
        <div class="row"><span class="px setting-value">{PROGRAMS[state.programId].name}</span></div>
        <p class="small">Change where you train, how often, or your experience. Level and rank stay.</p>
        <button class="btn" onClick={() => setChanging(true)}>Change program</button>
      </Window>

      <Window label="Training days">
        <div class="eyebrow">TRAINING DAYS</div>
        <div class="weekdays">
          {WEEKDAY_SHORT.map((name, d) => (
            <button key={name} class="btn day" aria-pressed={days.includes(d)} onClick={() => toggleDay(d)} aria-label={WEEKDAY_NAMES[d]}>{name}</button>
          ))}
        </div>
        <p class="small">{daysValid ? `${days.length} days a week. Changes start tomorrow.` : 'Pick 2 to 5 days.'}</p>
        <button class="btn solid" disabled={!daysChanged || !daysValid} onClick={() => {
          act(setTrainingDays, days);
          setSavedMsg(`Training days set from ${WEEKDAY_NAMES[weekday(tomorrow)]}.`);
        }}>Save days</button>
      </Window>

      <Window label="Pause">
        <div class="eyebrow">PAUSE</div>
        {p ? (
          <>
            <p>Paused through {WEEKDAY_NAMES[weekday(p.end)]} ({p.end}).</p>
            <button class="btn" onClick={() => act(resume)}>Resume now</button>
          </>
        ) : (
          <>
            <p class="small">Sick, travelling, rough week? Nothing counts while paused. Up to {MAX_PAUSE_DAYS} days, twice a month.</p>
            <div class="pause-row">
              <label for="pause-days" class="small">Days</label>
              <select id="pause-days" class="select" value={pauseDays} onChange={(e) => setPauseDays(Number(e.currentTarget.value))}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => <option value={n}>{n}</option>)}
              </select>
              <button class="btn solid" disabled={!!blocker} onClick={() => {
                act(pause, pauseDays);
                setSavedMsg(`Paused for ${pauseDays} ${pauseDays === 1 ? 'day' : 'days'}.`);
              }}>Pause</button>
            </div>
            {blocker === 'limit' && <p class="small">You've used both pauses for the last 30 days.</p>}
          </>
        )}
      </Window>

      <Window label="Save progress">
        <div class="eyebrow">SAVE PROGRESS</div>
        <p class="small">Your progress lives on this phone. Accounts to back it up and switch phones are coming soon.</p>
        <button class="btn" disabled>Coming soon</button>
      </Window>

      <Window label="Reset" class={resetOpen ? 'danger-win' : ''}>
        <div class="eyebrow danger">RESET</div>
        {!resetOpen ? (
          <button class="btn" onClick={() => setResetOpen(true)}>Reset everything</button>
        ) : (
          <>
            <p class="small">This deletes your level, rank, streak and history on this phone. It can't be undone. Type RESET to confirm.</p>
            <input id="reset-confirm" class="input" value={confirmText} onInput={(e) => setConfirmText(e.currentTarget.value)} autocomplete="off" autocapitalize="characters" aria-label="Type RESET to confirm" />
            <div class="row">
              <button class="btn" onClick={() => { setResetOpen(false); setConfirmText(''); }}>Cancel</button>
              <button class="btn danger-btn" disabled={confirmText.trim().toUpperCase() !== 'RESET'} onClick={reset}>Delete everything</button>
            </div>
          </>
        )}
      </Window>
    </main>
  );
}
