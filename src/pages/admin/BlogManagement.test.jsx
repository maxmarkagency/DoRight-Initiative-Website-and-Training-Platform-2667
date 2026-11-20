import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BlogManagement from './BlogManagement';

const { insert } = vi.hoisted(() => ({ insert: vi.fn() }));

vi.mock('../../lib/supabase', () => ({
  default: {
    from: () => ({
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
      insert,
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

vi.mock('react-quill', () => ({ default: () => <div /> }));

test('uploading a featured image saves its url string in the payload', async () => {
  window.alert = vi.fn();
  insert.mockReset().mockResolvedValue({ error: null });
  render(<BlogManagement />);
  fireEvent.click(await screen.findByRole('button', { name: /new post|create/i }));
  const [title, slug] = screen.getAllByRole('textbox');
  fireEvent.change(title, { target: { value: 'Hello' } });
  fireEvent.change(slug, { target: { value: 'hello' } });
  fireEvent.click(screen.getByText('mock upload'));
  fireEvent.click(screen.getByRole('button', { name: /Create Post/ }));
  await waitFor(() => expect(insert).toHaveBeenCalled());
  expect(insert.mock.calls[0][0][0].featured_image_url).toBe('u.jpg');
});
