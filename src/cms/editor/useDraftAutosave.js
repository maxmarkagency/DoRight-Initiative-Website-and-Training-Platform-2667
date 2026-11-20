import { useCallback, useEffect, useRef, useState } from 'react';
import { saveDraft } from '../pageContentApi';

// Debounced draft saving. `flush()` saves anything pending right now (used before Publish)
// and rethrows on failure so callers never publish a stale draft.
export default function useDraftAutosave(slug, { delayMs = 1500, save = saveDraft } = {}) {
  const [status, setStatus] = useState('saved');
  const pending = useRef(null);
  const timer = useRef(null);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    timer.current = null;
    if (pending.current === null) return;
    const data = pending.current;
    pending.current = null;
    setStatus('saving');
    try {
      await save(slug, data);
      setStatus(pending.current === null ? 'saved' : 'unsaved');
    } catch (error) {
      if (pending.current === null) pending.current = data; // keep it so the next save retries
      setStatus('error');
      throw error;
    }
  }, [slug, save]);

  const schedule = useCallback(
    (data) => {
      pending.current = data;
      setStatus('unsaved');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => flush().catch(() => {}), delayMs);
    },
    [delayMs, flush]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { schedule, flush, status };
}
