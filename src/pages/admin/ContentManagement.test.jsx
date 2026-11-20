import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentManagement from './ContentManagement';

const { upsert, select } = vi.hoisted(() => ({ upsert: vi.fn(), select: vi.fn() }));

vi.mock('../../lib/supabase', () => ({
  default: {
    from: () => ({
      select: () => ({ order: select }),
      upsert,
    }),
    storage: { from: () => ({ list: vi.fn(), getPublicUrl: vi.fn() }) },
  },
}));

vi.mock('../../components/admin/MediaUpload', () => ({
  default: ({ onUploadSuccess }) => (
    <button type="button" onClick={() => onUploadSuccess({ url: 'u.jpg' })}>
      mock upload
    </button>
  ),
}));

beforeEach(() => {
  upsert.mockReset().mockResolvedValue({ error: null });
  select.mockReset().mockResolvedValue({
    data: [{ id: 1, setting_key: 'logo', setting_type: 'image', setting_value: 'https://x/a.png' }],
    error: null,
  });
});

test('shows Site Settings and no page-section tabs', async () => {
  render(<ContentManagement />);
  expect(await screen.findByRole('heading', { name: 'Site Settings' })).toBeInTheDocument();
  expect(screen.queryByText(/Page Sections/)).not.toBeInTheDocument();
  expect(await screen.findByText('Logo')).toBeInTheDocument();
});

test('uploading an image setting saves the url as a string', async () => {
  window.alert = vi.fn();
  render(<ContentManagement />);
  await screen.findByText('Logo');
  fireEvent.click(screen.getByRole('button', { name: 'Edit Logo' }));
  fireEvent.click(screen.getByText('mock upload'));
  fireEvent.click(screen.getByRole('button', { name: /Save/ }));
  await waitFor(() => expect(upsert).toHaveBeenCalled());
  expect(upsert.mock.calls[0][0].setting_value).toBe('u.jpg');
});
