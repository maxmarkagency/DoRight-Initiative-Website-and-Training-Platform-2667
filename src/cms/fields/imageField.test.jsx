import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { imageField, ImageFieldInput } from './imageField';
import MediaLibraryPicker from './MediaLibraryPicker';

const { list, getPublicUrl } = vi.hoisted(() => ({ list: vi.fn(), getPublicUrl: vi.fn() }));

vi.mock('../../lib/supabase', () => ({
  default: { storage: { from: () => ({ list, getPublicUrl }) } },
}));

vi.mock('../../components/admin/MediaUpload', () => ({
  default: ({ onUploadSuccess }) => (
    <button type="button" onClick={() => onUploadSuccess({ url: 'u.jpg' })}>
      mock upload
    </button>
  ),
}));

const ImageInput = imageField('Background image').render;
const renderInput = (value, onChange = vi.fn()) => {
  render(<ImageInput value={value} onChange={onChange} field={{ label: 'Background image' }} />);
  return onChange;
};

test('typing alt text keeps the url', () => {
  const onChange = renderInput({ url: 'a.jpg', alt: '' });
  fireEvent.change(screen.getByLabelText(/Alt text/), { target: { value: 'Kids' } });
  expect(onChange).toHaveBeenCalledWith({ url: 'a.jpg', alt: 'Kids' });
});

test('uploading sets the new url', () => {
  const onChange = renderInput({ url: '', alt: '' });
  fireEvent.click(screen.getByText('mock upload'));
  expect(onChange).toHaveBeenCalledWith({ url: 'u.jpg', alt: '' });
});

test('remove clears the image', () => {
  const onChange = renderInput({ url: 'a.jpg', alt: 'x' });
  fireEvent.click(screen.getByRole('button', { name: 'Remove image' }));
  expect(onChange).toHaveBeenCalledWith({ url: '', alt: '' });
});

test('missing value renders without crashing', () => {
  renderInput(undefined);
  expect(screen.getByRole('button', { name: 'Choose from library' })).toBeInTheDocument();
});

test('library picker shows only images and returns the picked url', async () => {
  list.mockResolvedValue({ data: [{ name: 'x.png' }, { name: 'y.pdf' }], error: null });
  getPublicUrl.mockImplementation((name) => ({ data: { publicUrl: `https://cdn/${name}` } }));
  const onSelect = vi.fn();
  render(<MediaLibraryPicker open onClose={() => {}} onSelect={onSelect} />);
  const thumbs = await screen.findAllByRole('button', { name: /Use image/ });
  expect(thumbs).toHaveLength(1);
  fireEvent.click(thumbs[0]);
  expect(onSelect).toHaveBeenCalledWith('https://cdn/x.png');
});

test('library picker shows an error when listing fails', async () => {
  list.mockResolvedValue({ data: null, error: new Error('denied') });
  render(<MediaLibraryPicker open onClose={() => {}} onSelect={() => {}} />);
  expect(await screen.findByText(/Couldn't load the media library/)).toBeInTheDocument();
});

test('showAlt={false} hides the alt input and helper text', () => {
  render(<ImageFieldInput value={{ url: 'a.jpg', alt: '' }} onChange={vi.fn()} field={{ label: 'Photo' }} showAlt={false} />);
  expect(screen.queryByLabelText(/Alt text/)).not.toBeInTheDocument();
  expect(screen.queryByText(/screen readers/)).not.toBeInTheDocument();
});
