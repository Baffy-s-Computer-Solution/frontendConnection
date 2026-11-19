// frontend/src/hooks/useMediaQuery.js
// ============================================================

import { useEffect, useState } from 'react';

export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;

    try {
      const mediaQuery = window.matchMedia(query);
      return mediaQuery && typeof mediaQuery.matches === 'boolean' ? mediaQuery.matches : false;
    } catch (error) {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    let mql;
    try {
      mql = window.matchMedia(query);
    } catch (error) {
      return undefined;
    }

    if (!mql || typeof mql.matches !== 'boolean') return undefined;

    const handler = (e) => setMatches(e.matches);

    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);

    setMatches(mql.matches);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, [query]);

  return matches;
}