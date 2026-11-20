import React, { useId, useState } from 'react';
import MediaUpload from '../../components/admin/MediaUpload';
import MediaLibraryPicker from './MediaLibraryPicker';

const EMPTY = { url: '', alt: '' };

// Puck custom field. Value shape: { url, alt }. Upload goes to the media-library bucket.
const ImageFieldInput = ({ value, onChange, field }) => {
  const image = { ...EMPTY, ...value };
  const [pickerOpen, setPickerOpen] = useState(false);
  const altId = useId();
  const update = (patch) => onChange({ ...image, ...patch });

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-neutral-700">{field.label}</div>
      {image.url ? (
        <img src={image.url} alt="" className="w-full h-28 object-cover rounded border border-neutral-200" />
      ) : (
        <div className="w-full h-16 rounded border border-dashed border-neutral-300 flex items-center justify-center text-xs text-neutral-500">
          No image
        </div>
      )}
      <MediaUpload allowedTypes="image" onUploadSuccess={(file) => update({ url: file.url })} />
      <div className="flex gap-2">
        <button type="button" onClick={() => setPickerOpen(true)} className="flex-1 text-xs px-2 py-1.5 rounded border border-neutral-300 hover:bg-neutral-100">
          Choose from library
        </button>
        {image.url && (
          <button type="button" onClick={() => onChange(EMPTY)} aria-label="Remove image" className="text-xs px-2 py-1.5 rounded border border-neutral-300 hover:bg-neutral-100">
            Remove
          </button>
        )}
      </div>
      <label htmlFor={altId} className="block text-xs text-neutral-700">Alt text</label>
      <input
        id={altId}
        type="text"
        value={image.alt}
        onChange={(e) => update({ alt: e.target.value })}
        className="w-full text-sm px-2 py-1.5 rounded border border-neutral-300"
      />
      <p className="text-xs text-neutral-500">Describe the image for people using screen readers.</p>
      <MediaLibraryPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => update({ url })} />
    </div>
  );
};

export const imageField = (label) => ({ type: 'custom', label, render: ImageFieldInput });
