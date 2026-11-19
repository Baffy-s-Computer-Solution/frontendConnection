// frontend/src/utils/trackEvent.js
// ============================================================
// Analytics wrapper — swap implementation for GA4/PostHog/etc.
// ============================================================

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

const getAnalyticsTarget = () => {
  if (typeof window === 'undefined') return null;
  return window.gtag || window.analytics || window.posthog || null;
};

/**
 * Track a user-facing event.
 * @param {string} name - snake_case event name
 * @param {object} [payload] - additional properties
 */
export const trackEvent = (name, payload = {}) => {
  if (!name || typeof name !== 'string') return;

  const event = {
    event: name,
    timestamp: new Date().toISOString(),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    ...payload,
  };

  // Dev logging for observability
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug('[trackEvent]', event);
  }

  // Production: forward to whatever analytics SDK is on window
  if (isProd) {
    const target = getAnalyticsTarget();
    if (target && typeof target === 'function') {
      try {
        target('event', name, payload);
      } catch (err) {
        // never throw from analytics
        // eslint-disable-next-line no-console
        console.warn('[trackEvent] failed to dispatch', err);
      }
    }
  }

  // Always emit a CustomEvent so tests and other code can listen
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('cc:analytics', { detail: event }));
  }

  return event;
};

/**
 * Track a page/section view.
 * @param {string} sectionId
 */
export const trackSectionView = (sectionId) => {
  return trackEvent('section_view', { section: sectionId });
};

/**
 * Track a CTA click.
 * @param {string} ctaId
 * @param {string} [location]
 */
export const trackCta = (ctaId, location = 'unknown') => {
  return trackEvent('cta_click', { cta: ctaId, location });
};

export default trackEvent;