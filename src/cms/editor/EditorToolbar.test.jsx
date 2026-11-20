import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditorToolbar from './EditorToolbar';
import { publishPage } from '../pageContentApi';

vi.mock('../pageContentApi', () => ({ publishPage: vi.fn() }));

beforeEach(() => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  publishPage.mockReset();
});

test('Publish saves pending edits before publishing', async () => {
  const calls = [];
  const flush = vi.fn(async () => {
    await Promise.resolve();
    calls.push('flush');
  });
  publishPage.mockImplementation(async () => calls.push('publish'));
  render(<EditorToolbar slug="home" autosave={{ flush, status: 'unsaved' }} onShowHistory={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
  expect(await screen.findByText('Published')).toBeInTheDocument();
  expect(calls).toEqual(['flush', 'publish']);
});

test('a failed save stops the publish and shows an error', async () => {
  const flush = vi.fn().mockRejectedValue(new Error('offline'));
  render(<EditorToolbar slug="home" autosave={{ flush, status: 'error' }} onShowHistory={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
  expect(await screen.findByText(/Publish failed: offline/)).toBeInTheDocument();
  expect(publishPage).not.toHaveBeenCalled();
});

test('a failed publish shows an error, not success', async () => {
  publishPage.mockRejectedValue(new Error('not authorized'));
  render(<EditorToolbar slug="home" autosave={{ flush: vi.fn(), status: 'saved' }} onShowHistory={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
  expect(await screen.findByText(/Publish failed: not authorized/)).toBeInTheDocument();
  expect(screen.queryByText('Published')).toBeNull();
});
