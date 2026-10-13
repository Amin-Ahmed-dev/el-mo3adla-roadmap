import { useEffect, useRef, useState } from 'react';

/**
 * One-shot dashboard count-up: animates 0 → value on first mount only, over a
 * single rAF loop (<700ms, then it stops for good). Later value changes — e.g.
 * the live study timer ticking — update instantly so numbers never re-animate.
 * Disabled entirely under prefers-reduced-motion.
 */
export default function CountUp({ value, duration = 700 }) {
  const [shown, setShown] = useState(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduce || !Number.isFinite(value) || value === 0 ? value : 0;
  });
  const doneRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (doneRef.current || reduce || !Number.isFinite(value)) {
      setShown(value);
      return undefined;
    }
    const to = value;
    if (to === 0) { doneRef.current = true; setShown(0); return undefined; }
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setShown(Math.round(to * eased));
      if (p < 1) { rafRef.current = requestAnimationFrame(step); return; }
      doneRef.current = true;
      setShown(to);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return shown;
}