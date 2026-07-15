# Media Upload System

File uploads go straight from the browser to **Supabase Storage** — there is no upload API route,
no `multer`, and no server-side file handling of any kind. The frontend calls
`supabase.storage.from('media-library')` directly.

## Where This Lives

- **`src/components/admin/MediaUpload.jsx`** — the drag-and-drop upload widget. Validates files
  client-side, then uploads each one straight to the `media-library` bucket.
- **`src/pages/admin/MediaManagement.jsx`** — the Media Library admin page. Lists, previews, and
  deletes files in the bucket, and embeds `MediaUpload` for adding new ones.

Both import the shared client from `src/lib/supabase.js` and call `supabase.storage` methods
directly — there's no intermediate service layer.

## The Bucket

Everything lives in one Storage bucket: **`media-library`**. It is **not** created or configured
by `supabase/migrations/` — it must exist in the Supabase project already (create it via
Dashboard → Storage → New bucket if it doesn't). Its access policies are configured in
Storage → `media-library` → Policies, not tracked in this repo's migrations, so treat the
Dashboard as the source of truth for who can read/write it.

Recommended policy shape: public (or authenticated) read for serving media on the public site,
writes (`INSERT`/`UPDATE`/`DELETE`) restricted to authenticated admins.

## Upload Flow

`MediaUpload.jsx` validates each file client-side before uploading:

- **Size limit:** 100MB per file
- **Allowed types:** images (jpeg, png, gif, webp), video (mp4, webm, ogg), audio (mpeg, wav,
  ogg), documents (pdf, doc)

For each valid file, it generates a unique filename (`Date.now()` + a random suffix, keeping the
original extension) and calls:

```js
const { data, error } = await supabase.storage
  .from('media-library')
  .upload(filePath, file, { cacheControl: '3600', upsert: false });

const { data: { publicUrl } } = supabase.storage
  .from('media-library')
  .getPublicUrl(filePath);
```

The resulting `publicUrl` is what gets stored elsewhere (e.g. a blog post's
`featured_image_url`, a gallery item's `media_url`) and what the browser renders directly.

This client-side validation is a UX convenience, not a security boundary — since there's no
server in the path, the bucket's own Storage policies are what actually enforce file-type and
access rules. Client-side checks can be bypassed by anyone calling the Supabase API directly.

## Listing and Deleting

`MediaManagement.jsx` lists the bucket's contents and derives each file's category from its
extension (there's no stored metadata table — everything about a file is inferred from what
Storage returns):

```js
const { data, error } = await supabase.storage
  .from('media-library')
  .list('', { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });
```

Deleting a file:

```js
const { error } = await supabase.storage
  .from('media-library')
  .remove([fileName]);
```

## Using Uploaded Media Elsewhere

Blog and gallery admin pages just store the `publicUrl` returned by the upload call as a plain
text field — e.g. `BlogManagement.jsx` sets `featured_image_url`, `GalleryManagement.jsx` sets
`media_url`. There's no linking table between `media-library` objects and the rows that reference
them; deleting a file from the Media Library does not automatically clear references to it
elsewhere.

## Known Limitations

- No image processing (thumbnails, compression, format conversion) — files are stored and served
  as-is.
- No CDN beyond whatever Supabase Storage provides by default.
- No virus/malware scanning.
- No usage tracking — deleting a file that's still referenced by a blog post or gallery item will
  break that reference (the URL will 404).
