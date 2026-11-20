import { useCallback, useEffect, useRef, useState } from 'react';
import { saveDraft } from '../pageContentApi';

const RETRY_MS = 5000;

// Debounced draft saving. Saves run strictly one after another (a chain), so:
// - `flush()` resolves only after every earlier save AND the latest pending data are stored,
//   and rethrows on failure, so Publish never runs ahead of a save.
// - `reset()` drops queued edits (used before restoring a version) and waits for any running save.
// Failed saves keep their data and retry; pending edits are saved on unmount.
export default function useDraftAutosave(slug, { delayMs = 1500, save = saveDraft } = {}) {
  const [status, setStatus] = useState('saved');
  const pending = useRef(null);
  const timer = useRef(null);
  const chain = useRef(Promise.resolve());
  const latest = useRef({ slug, save });
  latest.current = { slug, save };

  const saveNow = useCallback(async () => {
    if (pending.current === null) return;
    const data = pending.current;
    pending.current = null;
    setStatus('saving');
    try {
      await latest.current.save(latest.current.slug, data);
      setStatus(pending.current === null ? 'saved' : 'unsaved');
    } catch (error) {
      if (pending.current === null) pending.current = data;
      setStatus('error');
      if (!timer.current) timer.current = setTimeout(() => runTimer(), RETRY_MS); // eslint-disable-line no-use-before-define
      throw error;
    }
  }, []);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    const run = chain.current.catch(() => {}).then(saveNow);
    chain.current = run;
    return run;
  }, [saveNow]);

  function runTimer() {
    timer.current = null;
    flush().catch(() => {});
  }

  const schedule = useCallback(
    (data) => {
      pending.current = data;
      setStatus('unsaved');
      clearTimeout(timer.current);
      timer.current = setTimeout(runTimer, delayMs);
    },
    [delayMs] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const reset = useCallback(async () => {
    clearTimeout(timer.current);
    timer.current = null;
    pending.current = null;
    await chain.current.catch(() => {});
    pending.current = null;
    setStatus('saved');
  }, []);

  const hasUnsaved = status !== 'saved';
  useEffect(() => {
    if (!hasUnsaved) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsaved]);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (pending.current !== null) {
        latest.current.save(latest.current.slug, pending.current).catch(() => {});
      }
    },
    []
  );

  return { schedule, flush, reset, status };
}
