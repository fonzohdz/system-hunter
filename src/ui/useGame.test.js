import { describe, it, expect } from 'vitest';
import { boot, fromOtherTab, recoverDamaged, saveWarning } from './useGame.js';
import { save, load, wipe, SAVE_KEY } from '../game/save.js';
import { completeQuest } from '../game/progress.js';
import { evaluate } from '../game/penalty.js';
import { systemLine } from '../game/system.js';
import { player, at } from '../game/testkit.js';

/** A Storage stand-in, the same shape localStorage has. */
function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k)
  };
}

describe('boot (app open)', () => {
  it('returns nothing to judge when there is no save', () => {
    expect(boot(memoryStorage(), at('2026-10-09'))).toEqual({ state: null, events: [], changed: false, damaged: null });
  });

  it('keeps the events from judging the days the app was closed', () => {
    // Mon/Wed/Fri player, app last open on join day Monday. Opened again Saturday:
    // Wednesday was missed (penalty), then Friday was missed while it was open (blown).
    const store = memoryStorage();
    save(player(), store);
    const r = boot(store, at('2026-10-10'));
    expect(r.changed).toBe(true);
    expect(r.events.map((e) => e.type)).toContain('penaltyBlown');
    // …so the System can say what happened instead of the XP silently changing.
    expect(systemLine(r.state, '2026-10-10', at('2026-10-10'), r.events).tone).toBe('danger');
  });

  it('says nothing changed when the save is already up to date', () => {
    const store = memoryStorage();
    save(player(), store);
    const first = boot(store, at('2026-10-06'));
    save(first.state, store);
    const again = boot(store, at('2026-10-06', 15));
    expect(again.changed).toBe(false);
    expect(again.state).toEqual(load(store));
  });
});

describe('two copies of the app open (tabs, or installed app + browser)', () => {
  // Wednesday 2026-10-07 is a training day. Both copies opened that morning.
  function twoTabs() {
    const store = memoryStorage();
    save(player(), store);
    const tabA = boot(store, at('2026-10-07', 8)).state;
    const tabB = boot(store, at('2026-10-07', 8)).state;
    // Tab A clears the quest and saves.
    const cleared = completeQuest(tabA, at('2026-10-07', 18)).state;
    save(cleared, store);
    return { store, tabB };
  }

  it('a stale copy left alone would judge the cleared day as missed (the bug)', () => {
    const { tabB } = twoTabs();
    const stale = evaluate(tabB, at('2026-10-08', 0)).state; // tab B's midnight tick
    expect(stale.log['2026-10-07']).toBe('missed');
    expect(stale.penalty).not.toBeNull();
  });

  it("adopts the other copy's save, so the clear survives midnight", () => {
    const { store } = twoTabs();
    const synced = fromOtherTab(SAVE_KEY, store, at('2026-10-07', 18)).state;
    const after = evaluate(synced, at('2026-10-08', 0)).state;
    expect(after.log['2026-10-07']).toBe('cleared');
    expect(after.penalty).toBeNull();
    expect(after.totalXp).toBe(100);
  });

  it('follows a reset made in the other copy', () => {
    const { store } = twoTabs();
    wipe(store);
    expect(fromOtherTab(SAVE_KEY, store, at('2026-10-07', 19)).state).toBeNull();
  });

  it('ignores other keys, like sound preferences', () => {
    const { store } = twoTabs();
    expect(fromOtherTab('sh:prefs:v1', store, at('2026-10-07', 19))).toBeUndefined();
  });
});

describe('damaged save on open', () => {
  it('reports a damaged save instead of crashing', () => {
    const store = memoryStorage();
    store.setItem(SAVE_KEY, '{"schemaVersion":1,"totalXp":500}');
    const r = boot(store, at('2026-10-07'));
    expect(r.state).toBeNull();
    expect(r.damaged).toBe('{"schemaVersion":1,"totalXp":500}');
  });

  it('"start over" keeps a backup, then clears the save', () => {
    const store = memoryStorage();
    store.setItem(SAVE_KEY, '{broken');
    const key = recoverDamaged('{broken', 555, store);
    expect(key).toBe(`${SAVE_KEY}.corrupt-555`);
    expect(store.getItem(key)).toBe('{broken');
    expect(store.getItem(SAVE_KEY)).toBeNull();
    expect(boot(store, at('2026-10-07')).damaged).toBeNull();
  });

  it('refuses to clear anything if the backup fails', () => {
    const store = memoryStorage();
    store.setItem(SAVE_KEY, '{broken');
    const full = { ...store, setItem: () => { throw new Error('QuotaExceededError'); } };
    expect(recoverDamaged('{broken', 555, full)).toBeNull();
    expect(store.getItem(SAVE_KEY)).toBe('{broken');
  });
});

describe('save failure warning', () => {
  const quiet = { failing: false, show: false };

  it('shows once when saving starts failing', () => {
    const w = saveWarning(quiet, false);
    expect(w).toEqual({ failing: true, show: true });
  });

  it('does not come back after "Got it" while saves keep failing', () => {
    const dismissed = { failing: true, show: false };
    expect(saveWarning(dismissed, false)).toEqual(dismissed);
  });

  it('clears on a good save, and warns again if a new failure run starts', () => {
    let w = saveWarning(quiet, false);
    w = saveWarning(w, true);
    expect(w).toEqual(quiet);
    expect(saveWarning(w, false).show).toBe(true);
  });

  it('a good save with nothing failing changes nothing', () => {
    expect(saveWarning(quiet, true)).toBe(quiet);
  });
});
