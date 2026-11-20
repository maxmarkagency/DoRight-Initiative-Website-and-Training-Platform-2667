import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../cms/pages';
import { listPageRows } from '../../cms/pageContentApi';
import { isSameData } from '../../cms/pageData';

const statusFor = (row) => {
  if (!row?.published) return { text: 'Not published yet', tone: 'text-neutral-500' };
  if (row.draft && !isSameData(row.draft, row.published)) return { text: 'Unpublished changes', tone: 'text-amber-700' };
  return { text: `Published ${new Date(row.published_at).toLocaleDateString()}`, tone: 'text-green-700' };
};

const PagesList = () => {
  const [rows, setRows] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    listPageRows()
      .then((list) => setRows(Object.fromEntries(list.map((r) => [r.slug, r]))))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Pages</h1>
      <p className="text-neutral-600 mb-6">Click a page to edit its text and images. Changes stay as a draft until you publish.</p>
      {error && <p className="text-red-600 mb-4">Couldn't load page status: {error}</p>}
      <ul className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-200">
        {Object.entries(PAGES).map(([slug, page]) => {
          const status = statusFor(rows[slug]);
          return (
            <li key={slug} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-neutral-900">{page.title}</p>
                <p className={`text-sm ${status.tone}`}>{status.text}</p>
              </div>
              <Link to={`/admin/pages/${slug}`} className="px-4 py-2 rounded bg-black text-accent font-semibold hover:bg-neutral-800">
                Edit
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PagesList;
