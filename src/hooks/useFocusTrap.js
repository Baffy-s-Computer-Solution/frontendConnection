// frontend/src/hooks/useFocusTrap.js
// ============================================================
// Traps focus inside `ref` while `active` is true.
// Also handles Escape key.
// ============================================================

import { useEffect } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function useFocusTrap(ref, active, onEscape) {
  useEffect(() => {
    if (!active || !ref.current) return undefined;

    const node = ref.current;
    const previouslyFocused = document.activeElement;

    const focusables = () => Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);

    const first = focusables()[0];
    if (first) first.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && typeof onEscape === 'function') {
        onEscape();
        return;
      }
      if (e.key !== 'Tab') return;

      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = list[0];
      const lastEl = list[list.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [ref, active, onEscape]);
}