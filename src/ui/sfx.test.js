import { describe, it, expect, afterEach } from 'vitest';
import { play } from './sfx.js';

describe('menu sounds', () => {
  afterEach(() => {
    delete globalThis.window;
  });

  it('never throws when the device refuses to give the app audio', () => {
    globalThis.window = {
      AudioContext: class {
        constructor() {
          throw new Error('NotAllowedError: audio unavailable');
        }
      }
    };
    expect(() => play('confirm')).not.toThrow();
  });
});
