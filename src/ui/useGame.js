import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { read, save, wipe, backupDamaged, SAVE_KEY } from '../game/save.js';
import { evaluate } from '../game/penalty.js';
import { localDate } from '../game/dates.js';

/**
 * Read the save and judge every day since it was last open.
 * `changed` says the judged state differs from what's stored, so it needs saving.
 * `damaged` holds the raw stored text when a save exists but can't be used
 * (the app shows the recovery screen instead of crashing).
 * @param {Storage} storage
 * @param {number} now
 */
export function boot(storage, now) {
  const found = read(storage);
  const none = { state: null, events: [], changed: false, damaged: null };
  if (found.status === 'none') return none;
  if (found.status === 'damaged') return { ...none, damaged: found.raw };
  try {
    const r = evaluate(found.state, now);
    return { state: r.state, events: r.events, changed: r.state !== found.state, damaged: null };
  } catch {
    return { ...none, damaged: found.raw }; // looked fine but the rules choked on it
  }
}

/**
 * Track whether saving works. The warning shows when a run of failed saves
 * starts, stays dismissed for the rest of that run, and a good save ends it.
 * @param {{failing:boolean, show:boolean}} prev
 * @param {boolean} ok whether the latest save was written
 */
export function saveWarning(prev, ok) {
  if (ok) return prev.failing || prev.show ? { failing: false, show: false } : prev;
  if (prev.failing) return prev;
  return { failing: true, show: true };
}

/**
 * Recovery screen "start over": back up the damaged save, then clear it.
 * Refuses (returns null) if the backup couldn't be written, so nothing is lost.
 * @returns {string|null} the backup key
 */
export function recoverDamaged(raw, now, storage) {
  const key = backupDamaged(raw, now, storage);
  if (!key) return null;
  wipe(storage);
  return key;
}

/**
 * A `storage` event says another tab or window of the app wrote storage.
 * Returns what this copy should switch to (`boot` result), or undefined to ignore it.
 * Without this, a stale copy would later save over the newer progress.
 * @param {string|null} key the changed key (null = storage cleared)
 */
export function fromOtherTab(key, storage, now) {
  if (key !== SAVE_KEY && key !== null) return undefined;
  return boot(storage, now);
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
  const [damaged, setDamaged] = useState(booted.damaged);
  const [saveWarn, setSaveWarn] = useState({ failing: false, show: false });
  const [now, setNow] = useState(Date.now());
  const stateRef = useRef(state);
  stateRef.current = state;

  const commit = useCallback((next, evts = []) => {
    stateRef.current = next;
    setState(next);
    if (next) {
      const ok = save(next);
      setSaveWarn((w) => saveWarning(w, ok));
    }
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
    if (booted.changed && booted.state) {
      const ok = save(booted.state);
      setSaveWarn((w) => saveWarning(w, ok));
    }
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
    // Another tab or window saved (or reset): adopt its save instead of keeping a stale copy.
    const onStorage = (e) => {
      const r = fromOtherTab(e.key, globalThis.localStorage, Date.now());
      if (!r) return;
      stateRef.current = r.state;
      setState(r.state);
      setEvents(r.events);
      setDamaged(r.damaged);
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', tick);
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', tick);
      window.removeEventListener('storage', onStorage);
    };
  }, [commit]);

  const start = useCallback((fresh) => commit(fresh), [commit]);
  const reset = useCallback(() => {
    wipe();
    stateRef.current = null;
    setState(null);
    setEvents([]);
  }, []);
  /** Back up the damaged save and start fresh. Returns false if the backup failed. */
  const recover = useCallback(() => {
    if (!recoverDamaged(damaged, Date.now(), globalThis.localStorage)) return false;
    setDamaged(null);
    return true;
  }, [damaged]);

  const dismissSaveWarn = useCallback(() => setSaveWarn((w) => ({ ...w, show: false })), []);

  return {
    state, events, now, today: localDate(now), act, start, reset, damaged, recover,
    saveWarn: saveWarn.show, dismissSaveWarn, clearEvents: () => setEvents([])
  };
}
