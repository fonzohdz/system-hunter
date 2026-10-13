import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { load, save, wipe } from '../game/save.js';
import { evaluate } from '../game/penalty.js';
import { localDate } from '../game/dates.js';

/**
 * Read the save and judge every day since it was last open.
 * `changed` says the judged state differs from what's stored, so it needs saving.
 * @param {Storage} storage
 * @param {number} now
 */
export function boot(storage, now) {
  const s = load(storage);
  if (!s) return { state: null, events: [], changed: false };
  const r = evaluate(s, now);
  return { state: r.state, events: r.events, changed: r.state !== s };
}

/**
 * Holds the save, persists every change, and re-judges the calendar whenever
 * the app opens, comes back to the foreground, or a minute passes.
 */
export function useGame() {
  // Judge the days since the last open once, keep its events (penalty blown,
  // rank up/down…) so the System line can report them, and save the result.
  const [booted] = useState(() => boot(globalThis.localStorage, Date.now()));
  const [state, setState] = useState(booted.state);
  const [events, setEvents] = useState(booted.events);
  const [now, setNow] = useState(Date.now());
  const stateRef = useRef(state);
  stateRef.current = state;

  const commit = useCallback((next, evts = []) => {
    stateRef.current = next;
    setState(next);
    if (next) save(next);
    if (evts.length) setEvents(evts);
  }, []);

  /** Run a game action `(state, now, ...args) → {state, events}` or `→ state`. */
  const act = useCallback((fn, ...args) => {
    const cur = stateRef.current;
    if (!cur) return [];
    const r = fn(cur, Date.now(), ...args);
    const next = r && r.state ? r.state : r;
    const evts = (r && r.events) || [];
    commit(next, evts);
    return evts;
  }, [commit]);

  useEffect(() => {
    if (booted.changed && booted.state) save(booted.state);
  }, []);

  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      const cur = stateRef.current;
      if (!cur) return;
      const r = evaluate(cur, t);
      if (r.state !== cur) commit(r.state, r.events);
    };
    tick();
    const id = setInterval(tick, 60000);
    const onVis = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', tick);
    };
  }, [commit]);

  const start = useCallback((fresh) => commit(fresh), [commit]);
  const reset = useCallback(() => {
    wipe();
    stateRef.current = null;
    setState(null);
    setEvents([]);
  }, []);

  return { state, events, now, today: localDate(now), act, start, reset, clearEvents: () => setEvents([]) };
}
