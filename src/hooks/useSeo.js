import { useEffect } from 'react';

const SITE_URL = 'https://doright.ng';
const DEFAULT_IMAGE = `${SITE_URL}/doing_right_logo.png`;
const SITE_NAME = 'DoRight Awareness Initiative';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets per-page title, meta tags, canonical link, and optional JSON-LD.
 * `path` is the route path (e.g. '/about') used to build the canonical/OG URL.
 */
export default function useSeo({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website', noindex = false, jsonLd }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:type', type);

    upsertMeta('property', 'twitter:title', fullTitle);
    upsertMeta('property', 'twitter:description', description);
    upsertMeta('property', 'twitter:url', url);
    upsertMeta('property', 'twitter:image', image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    let jsonLdEl = document.getElementById('page-jsonld');
    if (jsonLd) {
      if (!jsonLdEl) {
        jsonLdEl = document.createElement('script');
        jsonLdEl.id = 'page-jsonld';
        jsonLdEl.type = 'application/ld+json';
        document.head.appendChild(jsonLdEl);
      }
      jsonLdEl.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdEl) {
      jsonLdEl.remove();
    }
  }, [title, description, path, image, type, noindex, jsonLd]);
}
