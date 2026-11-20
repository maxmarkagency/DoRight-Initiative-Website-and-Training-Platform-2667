import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PageEditor from './PageEditor';

vi.mock('../../cms/pageContentApi', () => ({
  fetchPageRow: vi.fn().mockResolvedValue(null),
  saveDraft: vi.fn().mockResolvedValue(),
  publishPage: vi.fn(),
  listVersions: vi.fn().mockResolvedValue([]),
  restoreVersion: vi.fn(),
}));

beforeAll(() => {
  global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/pages/:slug" element={<PageEditor />} />
      </Routes>
    </MemoryRouter>
  );

test('mounts the Puck editor for Home with our toolbar', async () => {
  renderAt('/admin/pages/home');
  // Puck renders header actions in both its desktop header and mobile menu, so match all.
  expect((await screen.findAllByText('Publish', { selector: 'button' })).length).toBeGreaterThan(0);
  expect(screen.getAllByText('History', { selector: 'button' }).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Hero slideshow').length).toBeGreaterThan(0);
});

test('a never-saved page gets a draft so Publish works without edits (M-2)', async () => {
  const { saveDraft } = await import('../../cms/pageContentApi');
  saveDraft.mockClear();
  renderAt('/admin/pages/home');
  await waitFor(() => expect(saveDraft).toHaveBeenCalledWith('home', expect.objectContaining({ content: expect.any(Array) })), { timeout: 3000 });
});

test('unknown page slug shows a friendly message', () => {
  renderAt('/admin/pages/nope');
  expect(screen.getByText(/Unknown page/)).toBeInTheDocument();
});
