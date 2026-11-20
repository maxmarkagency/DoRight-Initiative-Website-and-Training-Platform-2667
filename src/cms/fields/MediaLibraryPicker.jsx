import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

const BUCKET = 'media-library';
const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;

const loadImages = async () => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) throw error;
  return data
    .filter((file) => IMAGE_EXT.test(file.name))
    .map((file) => ({ name: file.name, url: supabase.storage.from(BUCKET).getPublicUrl(file.name).data.publicUrl }));
};

const MediaLibraryPicker = ({ open, onClose, onSelect }) => {
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    loadImages()
      .then(setImages)
      .catch((err) => setError(`Couldn't load the media library: ${err.message}`));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div role="dialog" aria-label="Media library" className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Choose an image</h2>
          <button type="button" onClick={onClose} aria-label="Close media library" className="text-neutral-500 hover:text-black">✕</button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!images && !error && <p className="text-neutral-500 text-sm">Loading…</p>}
        {images?.length === 0 && <p className="text-neutral-500 text-sm">No images in the library yet. Upload one instead.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images?.map((img) => (
            <button
              key={img.name}
              type="button"
              aria-label={`Use image ${img.name}`}
              onClick={() => {
                onSelect(img.url);
                onClose();
              }}
              className="aspect-square rounded overflow-hidden border border-neutral-200 hover:ring-2 hover:ring-accent focus:ring-2 focus:ring-accent"
            >
              <img src={img.url} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryPicker;
