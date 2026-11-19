// frontend/src/hooks/useScrollProgress.js
// ============================================================
// Returns 0..1 progress of the page scroll, throttled via rAF.
// ============================================================

import { useEffect, useState } from 'react';

export default function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = null;

    const update = () => {
      raf = null;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const height = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      const ratio = height > 0 ? Math.min(Math.max(scrollTop / height, 0), 1) : 0;
      setProgress(ratio);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return progress;
}