// frontend/src/hooks/useDocumentMeta.js
// ============================================================
// Sets document title, meta, OpenGraph, Twitter, canonical, and
// JSON-LD — and restores previous values on unmount.
// ============================================================

import { useEffect } from 'react';

const upsertMeta = (attr, key, content) => {
  if (!content) return null;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  const previous = el ? el.getAttribute('content') : null;
  const isNew = !el;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return { el, previous, isNew };
};

const upsertLink = (rel, href) => {
  if (!href) return null;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  const previous = el ? el.getAttribute('href') : null;
  const isNew = !el;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  return { el, previous, isNew };
};

const upsertJsonLd = (id, data) => {
  let el = document.head.querySelector(`script[data-jsonld="${id}"]`);
  const previous = el ? el.textContent : null;
  const isNew = !el;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-jsonld', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
  return { el, previous, isNew };
};

/**
 * @param {object} meta
 * @param {string} meta.title
 * @param {string} [meta.description]
 * @param {string[]} [meta.keywords]
 * @param {string} [meta.canonical]
 * @param {string} [meta.ogImage]
 * @param {string} [meta.ogType]
 * @param {string} [meta.siteName]
 * @param {string} [meta.locale]
 * @param {string} [meta.twitterHandle]
 * @param {object[]} [meta.jsonLd] - array of { id, data }
 */
export default function useDocumentMeta(meta = {}) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const restorers = [];
    const prevTitle = document.title;

    if (meta.title) document.title = meta.title;

    const metaTags = [
      ['name', 'description', meta.description],
      ['name', 'keywords', Array.isArray(meta.keywords) ? meta.keywords.join(', ') : meta.keywords],
      ['property', 'og:title', meta.title],
      ['property', 'og:description', meta.description],
      ['property', 'og:type', meta.ogType || 'website'],
      ['property', 'og:url', meta.canonical],
      ['property', 'og:image', meta.ogImage],
      ['property', 'og:site_name', meta.siteName],
      ['property', 'og:locale', meta.locale],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:site', meta.twitterHandle],
      ['name', 'twitter:title', meta.title],
      ['name', 'twitter:description', meta.description],
      ['name', 'twitter:image', meta.ogImage],
    ];

    metaTags.forEach(([attr, key, content]) => {
      const result = upsertMeta(attr, key, content);
      if (result) restorers.push(() => result);
    });

    const canonicalResult = upsertLink('canonical', meta.canonical);
    if (canonicalResult) restorers.push(() => canonicalResult);

    const jsonLdResults = [];
    if (Array.isArray(meta.jsonLd)) {
      meta.jsonLd.forEach(({ id, data }) => {
        const result = upsertJsonLd(id, data);
        jsonLdResults.push({ result, id });
      });
    }

    return () => {
      document.title = prevTitle;

      restorers.forEach((getResult) => {
        const { el, previous, isNew } = getResult();
        if (!el) return;
        if (isNew) {
          el.remove();
        } else if (previous != null) {
          if (el.tagName === 'LINK') el.setAttribute('href', previous);
          else el.setAttribute('content', previous);
        }
      });

      jsonLdResults.forEach(({ result, id }) => {
        const { el, previous, isNew } = result;
        if (!el) return;
        if (isNew) {
          el.remove();
        } else if (previous != null) {
          el.textContent = previous;
        }
        // id kept for clarity
        void id;
      });
    };
  }, [
    meta.title,
    meta.description,
    meta.canonical,
    meta.ogImage,
    meta.ogType,
    meta.siteName,
    meta.locale,
    meta.twitterHandle,
    JSON.stringify(meta.keywords || []),
    JSON.stringify(meta.jsonLd || []),
  ]);
}