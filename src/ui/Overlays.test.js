import { describe, it, expect } from 'vitest';
import { restLeft } from './Overlays.jsx';

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
