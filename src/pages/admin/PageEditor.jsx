import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Puck } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import { PAGES } from '../../cms/pages';
import { resolvePageData } from '../../cms/pageData';
import { fetchPageRow } from '../../cms/pageContentApi';
import useDraftAutosave from '../../cms/editor/useDraftAutosave';
import EditorToolbar from '../../cms/editor/EditorToolbar';
import HistoryPanel from '../../cms/editor/HistoryPanel';

// Layout is fixed: editors change section content, never add/move/remove sections.
const LOCKED = { insert: false, drag: false, delete: false, duplicate: false };

const PageEditor = () => {
  const { slug } = useParams();
  const page = PAGES[slug];
  const autosave = useDraftAutosave(slug);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!page) return;
    fetchPageRow(slug)
      .then((row) => {
        const initial = resolvePageData(row?.draft ?? row?.published, page.config);
        setData(initial);
        // A page that was never saved has no draft; queue one so Publish works without an edit.
        if (!row?.draft) autosave.schedule(initial);
      })
      .catch((err) => setLoadError(err.message));
  }, [slug, page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!page) return <p className="p-8">Unknown page. <Link to="/admin/pages" className="underline">Back to pages</Link></p>;
  if (loadError) return <p className="p-8 text-red-600">Couldn't load this page: {loadError}</p>;
  if (!data) return <p className="p-8 text-neutral-500">Loading editor…</p>;

  const handleRestored = (restored) => {
    setData(resolvePageData(restored, page.config));
    setEditorKey((k) => k + 1); // remount Puck with the restored draft
    setShowHistory(false);
  };

  return (
    <div className="h-full">
      <Puck
        key={editorKey}
        config={page.config}
        data={data}
        onChange={autosave.schedule}
        permissions={LOCKED}
        headerTitle={`Editing: ${page.title}`}
        overrides={{
          drawer: () => null,
          headerActions: () => <EditorToolbar slug={slug} autosave={autosave} onShowHistory={() => setShowHistory(true)} />,
        }}
      />
      {showHistory && (
        <HistoryPanel slug={slug} onBeforeRestore={autosave.reset} onRestored={handleRestored} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};

export default PageEditor;
