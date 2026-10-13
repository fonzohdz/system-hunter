import { describe, it, expect } from 'vitest';
import { boot } from './useGame.js';
import { save, load } from '../game/save.js';
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
