import { useEffect, useState } from 'react';
import { PAGES } from './pages';
import { buildDefaultData, resolvePageData } from './pageData';
import { fetchPublished, fetchPageRow } from './pageContentApi';

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

// Renders today's defaults immediately, then swaps in stored content. Never leaves the page blank.
export default function usePageContent(slug) {
  const { config } = PAGES[slug];
  const [state, setState] = useState(() => ({ data: buildDefaultData(config), loading: true }));

  useEffect(() => {
    let cancelled = false;
    loadContent(slug)
      .then((stored) => {
        if (!cancelled) setState({ data: resolvePageData(stored, config), loading: false });
      })
      .catch((error) => {
        console.warn(`Using default content for "${slug}":`, error);
        if (!cancelled) setState((prev) => ({ ...prev, loading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, [slug, config]);

  return state;
}
