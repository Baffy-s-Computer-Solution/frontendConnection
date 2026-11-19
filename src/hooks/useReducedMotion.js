// frontend/src/hooks/useReducedMotion.js
// ============================================================
// Returns true when the user prefers reduced motion.
// ============================================================

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const getInitial = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;

  try {
    const mediaQuery = window.matchMedia(QUERY);
    return mediaQuery && typeof mediaQuery.matches === 'boolean' ? mediaQuery.matches : false;
  } catch (error) {
    return false;
  }
};

export default function useReducedMotion() {
  const [reduced, setReduced] = useState(getInitial);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    let mql;
    try {
      mql = window.matchMedia(QUERY);
    } catch (error) {
      return undefined;
    }

    if (!mql || typeof mql.matches !== 'boolean') return undefined;

    const onChange = (e) => setReduced(e.matches);

    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);

    setReduced(mql.matches);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  return reduced;
}