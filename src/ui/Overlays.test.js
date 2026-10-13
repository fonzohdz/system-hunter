import { describe, it, expect } from 'vitest';
import { restLeft, trapTarget } from './Overlays.jsx';

describe('rest timer', () => {
  const end = 1_000_000 + 90_000; // a 90s rest started at t = 1,000,000

  it('counts whole seconds down from the end time', () => {
    expect(restLeft(end, 1_000_000)).toBe(90);
    expect(restLeft(end, 1_000_001)).toBe(90);
    expect(restLeft(end, 1_001_000)).toBe(89);
    expect(restLeft(end, end - 1)).toBe(1);
    expect(restLeft(end, end)).toBe(0);
  });

  it('is right after the phone was locked mid-rest, and never goes negative', () => {
    expect(restLeft(end, 1_000_000 + 75_400)).toBe(15); // came back 75s later
    expect(restLeft(end, end + 300_000)).toBe(0); // came back long after
  });
});

describe('keeping focus inside a pop-up', () => {
  const [a, b, c] = ['start', 'middle', 'close'];
  const items = [a, b, c];

  it('Tab on the last button wraps to the first, Shift+Tab on the first wraps to the last', () => {
    expect(trapTarget(items, c, false)).toBe(a);
    expect(trapTarget(items, a, true)).toBe(c);
  });

  it('lets Tab move normally in the middle', () => {
    expect(trapTarget(items, a, false)).toBeNull();
    expect(trapTarget(items, b, true)).toBeNull();
  });

  it('pulls focus back in if it somehow got outside', () => {
    expect(trapTarget(items, 'page behind', false)).toBe(a);
    expect(trapTarget(items, 'page behind', true)).toBe(c);
    expect(trapTarget([], 'x', false)).toBeNull();
  });
});
