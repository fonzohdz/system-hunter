import { describe, it, expect } from 'vitest';
import { boot, fromOtherTab } from './useGame.js';
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
    expect(boot(memoryStorage(), at('2026-10-09'))).toEqual({ state: null, events: [], changed: false });
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
