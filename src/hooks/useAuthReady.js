// frontend/src/hooks/useAuthReady.js
// ============================================================
// Debounces the "auth resolved" state to avoid CTA flicker.
// ============================================================

import { useEffect, useState } from 'react';

export default function useAuthReady(currentUser, userProfile, delay = 120) {
  const initialReady = !currentUser || !!userProfile;
  const [ready, setReady] = useState(initialReady);

  useEffect(() => {
    if (!currentUser || !!userProfile) {
      setReady(true);
      return undefined;
    }

    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [currentUser, userProfile, delay]);

  return ready;
}