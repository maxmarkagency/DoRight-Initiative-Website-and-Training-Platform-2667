import React, { useEffect, useState } from 'react';
import { listVersions, restoreVersion } from '../pageContentApi';

const formatDate = (iso) => new Date(iso).toLocaleString();

const HistoryPanel = ({ slug, onRestored, onClose }) => {
  const [versions, setVersions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listVersions(slug)
      .then(setVersions)
      .catch((err) => setError(`Couldn't load history: ${err.message}`));
  }, [slug]);

  const handleRestore = async (id) => {
    if (!window.confirm('Replace your current draft with this version? You can review it before publishing.')) return;
    try {
      onRestored(await restoreVersion(id));
    } catch (err) {
      setError(`Restore failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <aside className="w-full max-w-sm h-full bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()} aria-label="Publish history">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Publish history</h2>
          <button type="button" onClick={onClose} className="text-neutral-500 hover:text-black" aria-label="Close history">✕</button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {!versions && !error && <p className="text-neutral-500 text-sm">Loading…</p>}
        {versions?.length === 0 && <p className="text-neutral-500 text-sm">Nothing published yet.</p>}
        <ul className="space-y-2">
          {versions?.map((v, i) => (
            <li key={v.id} className="flex items-center justify-between border border-neutral-200 rounded p-3 text-sm">
              <span>
                Published {formatDate(v.published_at)}
                {i === 0 && <span className="ml-2 text-xs text-green-700">(live)</span>}
              </span>
              <button type="button" onClick={() => handleRestore(v.id)} className="text-black underline">
                Restore
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default HistoryPanel;
