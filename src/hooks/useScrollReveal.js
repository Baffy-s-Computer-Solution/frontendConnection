// frontend/src/hooks/useScrollReveal.js
// ============================================================
// IntersectionObserver-based reveal-on-scroll hook.
// Returns a ref and a boolean `revealed`.
// ============================================================

import { useEffect, useRef, useState } from 'react';

/**
 * @param {object} [options]
 * @param {number} [options.threshold=0.15]
 * @param {string} [options.rootMargin='0px 0px -10% 0px']
 * @param {boolean} [options.once=true]
 */
export default function useScrollReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true } = options;

  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setRevealed(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, revealed };
}