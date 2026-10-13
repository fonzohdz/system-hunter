import { describe, it, expect } from 'vitest';
import { TabBar } from './TabBar.jsx';

/** All text in a rendered Preact tree that a screen reader would get (skips aria-hidden). */
function spoken(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(spoken).join('');
  if (node.props && node.props['aria-hidden'] === 'true') return '';
  return spoken(node.props && node.props.children);
}

describe('tab bar', () => {
  const tabs = (alert) => TabBar({ tab: 'status', setTab: () => {}, alert }).props.children;

  it('the Quest tab says "quest waiting" in real text when a quest is waiting', () => {
    expect(spoken(tabs(true)[0])).toBe('Quest, quest waiting');
  });

  it('and says nothing extra otherwise', () => {
    expect(spoken(tabs(false)[0])).toBe('Quest');
  });
});
