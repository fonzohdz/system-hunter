import { useState, useEffect } from 'preact/hooks';
import { Window, Cursor } from './Window.jsx';
import { newState } from '../game/save.js';
import { PROGRAMS } from '../game/programs.js';
import { WEEKDAY_SHORT, localDate } from '../game/dates.js';

const QUESTIONS = [
  {
    key: 'location', title: 'Where do you usually train?', options: [
      { value: 'gym', label: 'Full gym' },
      { value: 'home', label: 'Home with some gear', hint: 'Dumbbells' },
      { value: 'none', label: 'No equipment' }
    ]
  },
  {
    key: 'daysPerWeek', title: 'How many days a week?', options: [2, 3, 4, 5].map((n) => ({ value: n, label: `${n} days` }))
  },
  {
    key: 'experience', title: 'Experience?', options: [
      { value: 'new', label: 'New', hint: 'Shows how-to tips and starts lighter' },
      { value: 'some', label: 'Some' },
      { value: 'experienced', label: 'Experienced' }
    ]
  }
];

const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Types `text` out one character at a time. */
function Typed({ text, onDone }) {
  const [n, setN] = useState(reduceMotion() ? text.length : 0);
  useEffect(() => {
    if (n >= text.length) {
      onDone && onDone();
      return undefined;
    }
    const id = setTimeout(() => setN(n + 1), 35);
    return () => clearTimeout(id);
  }, [n, text]);
  return <span>{text.slice(0, n)}<span aria-hidden="true" class="caret">{n < text.length ? '▌' : ''}</span></span>;
}

/**
 * First open: the System detects a Player, three one-tap questions, a program
 * is assigned. Also reused from Settings to change program (`initial` given).
 */
export function Onboarding({ onFinish, initial, onCancel }) {
  const changing = !!initial;
  const [step, setStep] = useState(changing ? 0 : -1); // -1 = intro
  const [answers, setAnswers] = useState(initial || {});
  const [line2, setLine2] = useState(false);
  const [typed, setTyped] = useState(false);

  if (step === -1) {
    return (
      <main class="screen no-tabs onboard">
        <h1 class="px wordmark">LIMIT BREAK</h1>
        <Window label="System" class="system-intro">
          <div class="eyebrow">SYSTEM</div>
          <p class="intro-text"><Typed text="A Player has been detected." onDone={() => setLine2(true)} /></p>
          {line2 && <p class="intro-text"><Typed text="Will you accept?" onDone={() => setTyped(true)} /></p>}
        </Window>
        <button class="cta" disabled={!typed} onClick={() => setStep(0)}>ACCEPT</button>
      </main>
    );
  }

  if (step < QUESTIONS.length) {
    const q = QUESTIONS[step];
    const pick = (value) => {
      setAnswers({ ...answers, [q.key]: value });
      setStep(step + 1);
    };
    return (
      <main class="screen no-tabs onboard">
        <div class="row small"><span>{changing ? 'CHANGE PROGRAM' : 'SETUP'}</span><span class="num">{step + 1} / {QUESTIONS.length}</span></div>
        <Window label={q.title}>
          <h1 class="px q-title">{q.title}</h1>
          <div class="choices">
            {q.options.map((o) => (
              <button class="choice" onClick={() => pick(o.value)} aria-pressed={answers[q.key] === o.value}>
                <span class="cursor">{answers[q.key] === o.value && <Cursor />}</span>
                <span class="choice-label">{o.label}{o.hint && <span class="small choice-hint">{o.hint}</span>}</span>
              </button>
            ))}
          </div>
        </Window>
        <div class="row">
          {step > 0 || changing
            ? <button class="btn" onClick={() => (step > 0 ? setStep(step - 1) : onCancel())}>{step > 0 ? 'Back' : 'Cancel'}</button>
            : <span />}
        </div>
      </main>
    );
  }

  const fresh = newState(answers, localDate(Date.now()), Date.now());
  const program = PROGRAMS[fresh.programId];
  return (
    <main class="screen no-tabs onboard">
      <Window label="Program assigned">
        <div class="eyebrow">SYSTEM</div>
        <p class="intro-text">Program assigned.</p>
        <h1 class="px q-title">{program.name}</h1>
        <p class="muted">{program.days.length} workouts that rotate · {answers.daysPerWeek} days a week</p>
        <p class="muted">Training days: {fresh.trainingDays.map((d) => WEEKDAY_SHORT[d]).join(', ')}{changing ? ' (from tomorrow)' : ''}</p>
        <p class="small">You can change your days anytime in Settings.</p>
      </Window>
      <button class="cta" onClick={() => onFinish(answers, fresh)}>{changing ? 'CONFIRM' : 'BEGIN'}</button>
      <button class="btn" onClick={() => setStep(QUESTIONS.length - 1)}>Back</button>
    </main>
  );
}
