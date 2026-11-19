// frontend/src/hooks/useCountUp.js
// ============================================================
// Animates a number from 0 to `end` when `start` becomes true.
// Respects prefers-reduced-motion.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * @param {number} end
 * @param {object} [options]
 * @param {number} [options.duration=1500]
 * @param {boolean} [options.start=true]
 * @param {number} [options.decimals=0]
 * @param {boolean} [options.useGrouping=true]
 */
export default function useCountUp(end, options = {}) {
  const { duration = 1500, start = true, decimals = 0, useGrouping = true } = options;
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? end : 0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!start) return undefined;
    if (reduced) {
      setValue(end);
      return undefined;
    }

    const target = Number(end) || 0;
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(target * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, start, reduced]);

  const format = (val) => {
    const fixed = Number(val).toFixed(decimals);
    if (!useGrouping) return fixed;
    const [intPart, decPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart ? `${withCommas}.${decPart}` : withCommas;
  };

  return { value, display: format(value) };
}