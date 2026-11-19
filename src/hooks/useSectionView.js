// frontend/src/hooks/useSectionView.js
// ============================================================
// Fires a callback once when a section enters the viewport.
// ============================================================

import { useEffect, useRef } from 'react';

/**
 * @param {string} sectionId
 * @param {(id: string) => void} onView
 * @param {object} [options]
 */
export default function useSectionView(sectionId, onView, options = {}) {
  const ref = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            try {
              onView?.(sectionId);
            } catch {
              // swallow analytics errors
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, ...(options || {}) }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [sectionId, onView, options]);

  return ref;
}