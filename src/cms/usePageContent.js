import { useEffect, useState } from 'react';
import { PAGES } from './pages';
import { buildDefaultData, resolvePageData } from './pageData';
import { fetchPublished, fetchPageRow } from './pageContentApi';

// How long to wait for stored content before showing the built-in defaults anyway.
const MAX_WAIT_MS = 1500;

const wantsDraftPreview = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'draft';

// Draft preview only works for admins: RLS returns no row to anyone else, so we fall back to published.
const loadContent = async (slug) => {
  if (wantsDraftPreview()) {
    const row = await fetchPageRow(slug).catch(() => null);
    if (row?.draft) return row.draft;
  }
  return fetchPublished(slug);
};

// `data` always holds renderable content (defaults until stored content arrives).
// `ready` turns true once stored content loads, fails, or MAX_WAIT_MS passes — render on `ready`
// so visitors don't see old defaults flash before the published version.
export default function usePageContent(slug) {
  const { config } = PAGES[slug];
  const [state, setState] = useState(() => ({ data: buildDefaultData(config), loading: true, ready: false }));

  useEffect(() => {
    let cancelled = false;
    const giveUp = setTimeout(() => {
      if (!cancelled) setState((prev) => ({ ...prev, ready: true }));
    }, MAX_WAIT_MS);
    loadContent(slug)
      .then((stored) => {
        if (!cancelled) setState({ data: resolvePageData(stored, config), loading: false, ready: true });
      })
      .catch((error) => {
        console.warn(`Using default content for "${slug}":`, error);
        if (!cancelled) setState((prev) => ({ ...prev, loading: false, ready: true }));
      })
      .finally(() => clearTimeout(giveUp));
    return () => {
      cancelled = true;
      clearTimeout(giveUp);
    };
  }, [slug, config]);

  return state;
}
