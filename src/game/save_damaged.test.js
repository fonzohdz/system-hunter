import { describe, it, expect } from 'vitest';
import { read, load, save, isValidState, backupDamaged, SAVE_KEY } from './save.js';
import { player, live, at } from './testkit.js';

function memoryStorage(failWrites = false) {
  const m = new Map();
  return {
    m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => {
      if (failWrites) throw new Error('QuotaExceededError');
      m.set(k, String(v));
    },
    removeItem: (k) => m.delete(k)
  };
}

describe('damaged saves', () => {
  it('a real save, fresh or well played, is valid', () => {
    expect(isValidState(player())).toBe(true);
    const played = live(player(), '2026-10-06', '2026-11-30', (d) => d.slice(8) !== '14').state;
    expect(isValidState(played)).toBe(true);
  });

  it('tells "nothing saved" apart from "saved but unreadable"', () => {
    const st = memoryStorage();
    expect(read(st).status).toBe('none');
    save(player(), st);
    expect(read(st).status).toBe('ok');
    for (const raw of ['{not json', '{"schemaVersion":1,"totalXp":500}', '{"schemaVersion":99}', '[]', 'null']) {
      st.setItem(SAVE_KEY, raw);
      const r = read(st);
      expect(r.status, raw).toBe('damaged');
      expect(load(st)).toBeNull();
    }
  });

  it('a save missing a field the game needs is damaged, not a crash waiting to happen', () => {
    const bad = { ...player() };
    delete bad.log;
    expect(isValidState(bad)).toBe(false);
    expect(isValidState({ ...player(), totalXp: 'lots' })).toBe(false);
    expect(isValidState({ ...player(), penalty: { missedDate: 'x' } })).toBe(false);
  });

  it('backs a damaged save up under its own key', () => {
    const st = memoryStorage();
    expect(backupDamaged('{broken', 1234, st)).toBe(`${SAVE_KEY}.corrupt-1234`);
    expect(st.getItem(`${SAVE_KEY}.corrupt-1234`)).toBe('{broken');
    expect(backupDamaged('{broken', 1234, memoryStorage(true))).toBeNull();
  });
});
