import { useState, useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { Cursor } from './Window.jsx';

export const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Types `text` out one character at a time. The untyped rest is laid out but
 * invisible, so the window doesn't grow line by line. Screen readers get the
 * whole sentence at once.
 */
export function Typed({ text, speed = 35, onDone }) {
  const [n, setN] = useState(reduceMotion() ? text.length : 0);
  useEffect(() => {
    if (n >= text.length) {
      onDone && onDone();
      return undefined;
    }
    const id = setTimeout(() => setN(n + 1), speed);
    return () => clearTimeout(id);
  }, [n, text]);
  return (
    <span>
      <span class="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, n)}
        <span class="caret">{n < text.length ? '▌' : ''}</span>
        <span class="typed-rest">{text.slice(n)}</span>
      </span>
    </span>
  );
}

/**
 * A number that counts toward `target` instead of jumping. `from` sets the
 * first value, `hold` freezes it (e.g. while an overlay covers it), `instant`
 * skips to the end.
 */
export function useCountUp(target, { from = target, ms = 900, delay = 0, hold = false, instant = false } = {}) {
  const [shown, setShown] = useState(from);
  const cur = useRef(from);
  useEffect(() => {
    if (hold) return undefined;
    const start = cur.current;
    if (start === target || instant || reduceMotion()) {
      cur.current = target;
      setShown(target);
      return undefined;
    }
    let raf = 0;
    let t0 = 0;
    const step = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      const v = Math.round(start + (target - start) * (1 - (1 - k) ** 3));
      cur.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    const id = setTimeout(() => { raf = requestAnimationFrame(step); }, delay);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [target, hold, instant]);
  return shown;
}

/**
 * The FF hand-pointer that slides between rows of a menu. Put it inside a
 * positioned wrapper next to the list; `listRef` is the list, `index` the row.
 */
export function MenuCursor({ listRef, index }) {
  const [y, setY] = useState(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const measure = () => {
      const el = list.children[index];
      if (el) setY(el.offsetTop + el.offsetHeight / 2 - 7);
    };
    measure();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(list);
    return () => ro && ro.disconnect();
  }, [index, listRef]);
  if (y === null || index < 0) return null;
  return (
    <span class="menu-cursor" aria-hidden="true" style={{ transform: `translateY(${y}px)` }}>
      <Cursor />
    </span>
  );
}
