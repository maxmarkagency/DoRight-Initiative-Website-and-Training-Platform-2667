import React, { useId, useState } from 'react';
import MediaUpload from '../../components/admin/MediaUpload';
import MediaLibraryPicker from './MediaLibraryPicker';

const EMPTY = { url: '', alt: '' };

// Puck custom field. Value shape: { url, alt }. Upload goes to the media-library bucket.
export const ImageFieldInput = ({ value, onChange, field, showAlt = true }) => {
  const image = { ...EMPTY, ...value };
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const [pasteError, setPasteError] = useState('');
  const altId = useId();
  const pasteId = useId();
  const update = (patch) => onChange({ ...image, ...patch });

  const usePastedAddress = () => {
    const address = pasted.trim();
    if (!/^https?:\/\/\S+$/i.test(address)) {
      setPasteError('The address must start with https:// (or http://).');
      return;
    }
    setPasteError('');
    setPasted('');
    update({ url: address });
  };

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
      <label htmlFor={pasteId} className="block text-xs text-neutral-700">Or paste an image address</label>
      <div className="flex gap-2">
        <input
          id={pasteId}
          type="url"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder="https://…"
          className="flex-1 min-w-0 text-sm px-2 py-1.5 rounded border border-neutral-300"
        />
        <button type="button" onClick={usePastedAddress} className="text-xs px-2 py-1.5 rounded border border-neutral-300 hover:bg-neutral-100">
          Use address
        </button>
      </div>
      {pasteError && <p className="text-xs text-red-600">{pasteError}</p>}
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
      {showAlt && (
        <>
        <label htmlFor={altId} className="block text-xs text-neutral-700">Alt text</label>
        <input
          id={altId}
          type="text"
          value={image.alt}
          onChange={(e) => update({ alt: e.target.value })}
          className="w-full text-sm px-2 py-1.5 rounded border border-neutral-300"
        />
        <p className="text-xs text-neutral-500">Describe the image for people using screen readers.</p>
        </>
      )}
      <MediaLibraryPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => update({ url })} />
    </div>
  );
};

export const imageField = (label) => ({ type: 'custom', label, render: ImageFieldInput });
