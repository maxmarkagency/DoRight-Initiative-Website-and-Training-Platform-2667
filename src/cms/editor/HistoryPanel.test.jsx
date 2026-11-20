import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoryPanel from './HistoryPanel';
import { listVersions, restoreVersion } from '../pageContentApi';

vi.mock('../pageContentApi', () => ({ listVersions: vi.fn(), restoreVersion: vi.fn() }));

test('restore clears queued edits before restoring (I-3)', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  const calls = [];
  listVersions.mockResolvedValue([{ id: 'v1', published_at: '2026-11-20T10:00:00Z' }]);
  restoreVersion.mockImplementation(async () => {
    calls.push('restore');
    return { content: [] };
  });
  const onBeforeRestore = vi.fn(async () => {
    calls.push('reset');
  });
  const onRestored = vi.fn();
  render(<HistoryPanel slug="home" onBeforeRestore={onBeforeRestore} onRestored={onRestored} onClose={() => {}} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Restore' }));
  await waitFor(() => expect(onRestored).toHaveBeenCalledWith({ content: [] }));
  expect(calls).toEqual(['reset', 'restore']);
});
