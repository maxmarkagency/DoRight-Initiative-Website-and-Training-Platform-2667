import React, { useState } from 'react';
import { publishPage } from '../pageContentApi';
import { PAGES } from '../pages';

const STATUS_TEXT = {
  saved: 'All changes saved',
  saving: 'Saving…',
  unsaved: 'Unsaved changes',
  error: "Couldn't save — retrying",
};

const EditorToolbar = ({ slug, autosave, onShowHistory }) => {
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePublish = async () => {
    if (!window.confirm('Publish these changes to the live site?')) return;
    setPublishing(true);
    setMessage(null);
    try {
      await autosave.flush();
      await publishPage(slug);
      setMessage({ type: 'ok', text: 'Published' });
    } catch (error) {
      setMessage({ type: 'error', text: `Publish failed: ${error.message || 'please try again'}` });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={autosave.status === 'error' ? 'text-red-600' : 'text-neutral-500'} aria-live="polite">
        {STATUS_TEXT[autosave.status]}
      </span>
      {message && (
        <span role="status" className={message.type === 'error' ? 'text-red-600' : 'text-green-700'}>
          {message.text}
        </span>
      )}
      <a href={PAGES[slug].path} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded border border-neutral-300 hover:bg-neutral-100">
        View live
      </a>
      <button type="button" onClick={onShowHistory} className="px-3 py-1.5 rounded border border-neutral-300 hover:bg-neutral-100">
        History
      </button>
      <button
        type="button"
        onClick={handlePublish}
        disabled={publishing}
        className="px-4 py-1.5 rounded bg-black text-accent font-semibold hover:bg-neutral-800 disabled:opacity-60"
      >
        {publishing ? 'Publishing…' : 'Publish'}
      </button>
    </div>
  );
};

export default EditorToolbar;
