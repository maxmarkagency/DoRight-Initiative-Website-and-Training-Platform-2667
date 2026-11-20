# CMS Documentation

There is no separate CMS API — admin pages under `src/pages/admin/` read and write content
tables directly via `supabase.from(...)`, and RLS policies decide who's allowed to do what. The
previously-documented Express `/api/cms/*` endpoints are gone; this reflects what the admin UI
actually calls today.

## Visual Page Editor (Admin → Pages)

Marketing pages are being moved to a visual editor built on [Puck](https://puckeditor.com)
(`@puckeditor/core`). **Home** is migrated; other pages still use the legacy tables below.

- **Storage:** `page_content` (one row per page `slug`: `draft` and `published` Puck JSON) and
  `page_content_versions` (one row per publish, newest 10 kept). Migration:
  `supabase/migrations/20261121090000_create_page_content.sql`.
- **Access:** both tables are admin-only via RLS (`public.is_admin()`). The public site reads
  published content only through `get_published_page(slug)`. Publishing and restoring go
  through `publish_page(slug)` and `restore_page_version(version_id)`, which check admin
  themselves.
- **Editing flow:** edits autosave to `draft` (debounced). **Publish** saves any pending edit,
  then copies draft → published and records a version. **History** restores an old version into
  the draft for review. `/?preview=draft` shows the draft to signed-in admins.
- **Fixed layout:** each page has a config in `src/cms/pages/<page>.config.js` listing its
  sections (`order`), each section's labelled fields, and `defaultProps` equal to the page's
  original hardcoded content. Editors can't add, move or delete sections; they can hide one.
- **Fallback:** public pages wait up to 1.5 s for published content (showing a dark hero-sized
  placeholder), then render it (`src/cms/usePageContent.js` + `src/cms/pageData.js`). Missing
  sections, missing props, empty lists, failed or slow requests and never-published pages all
  fall back to the defaults, so a page never renders blank. The Home hero can't be hidden
  because the transparent header needs it.
- **Autosave:** saves run one at a time, retry every 5 s after a failure, save on leaving the
  editor, and the browser warns before closing a tab with unsaved changes.
- **Bundle:** public pages render with `src/cms/PageRenderer.jsx`; Puck is only loaded (lazily)
  by `src/pages/admin/PageEditor.jsx`.
- **Links:** button links accept `/internal-paths`, `http(s)`, `mailto:` and `tel:`; anything
  else renders as plain text (`src/cms/sections/ButtonLink.jsx`).

**To make another page editable:** move each visible section of the page into
`src/cms/sections/<page>/<Section>.jsx` taking content as props, write
`src/cms/pages/<page>.config.js` with today's content as `defaultProps`, register it in
`src/cms/pages/index.js`, and render the page with `usePageContent('<slug>')` + `PageRenderer`.

## Content Tables in Active Use

| Table | Admin page | Public-facing page(s) |
|---|---|---|
| `pages`, `page_sections` | `ContentManagement.jsx` | read via `src/services/pageContentService.js` |
| `blog_posts` | `BlogManagement.jsx` | `Blog.jsx`, `BlogPost.jsx` |
| `gallery_items` | `GalleryManagement.jsx` | `Gallery.jsx` |
| `events` | `EventManagement.jsx` | `Events.jsx` |
| `webinars` | `WebinarManagement.jsx` | `Webinars.jsx` |

All of these follow the same pattern: public/anonymous users get read access to published rows,
and writes are gated to admins by RLS.

### `pages` / `page_sections`

Each row in `pages` represents a site page (`slug`, `title`). `page_sections` holds that page's
content blocks: `page_id` (FK), `section_key`, `position`, a JSON-ish content payload, and
`is_active`. `pageContentService.getPageContent(slug)` looks up the page by slug, then fetches its
active sections ordered by `position`:

```js
const { data: page } = await supabase.from('pages').select('id').eq('slug', pageSlug).maybeSingle();
const { data: sections } = await supabase
  .from('page_sections')
  .select('*')
  .eq('page_id', page.id)
  .eq('is_active', true)
  .order('position', { ascending: true });
```

`ContentManagement.jsx` is the admin editor for this — it currently exposes a "Page Sections" tab
per page (home, about, programs, events, contact, trustees).

### `blog_posts`, `gallery_items`, `events`, `webinars`

Each has its own admin management page doing direct CRUD (`select`/`insert`/`update`/`delete`)
against its table, and its own public page reading published rows. There's nothing more
centralized than that — no shared "content service" layer wraps them the way `pageContentService`
does for pages.

## RLS Model

Access control is enforced entirely by Postgres RLS policies, not application code:

- **Public/anonymous read**: policies allow `SELECT` on published content to anyone.
- **Admin-only write**: `INSERT`/`UPDATE`/`DELETE` policies are scoped to admins, generally via
  the `public.is_admin()` SQL helper function (defined in
  `supabase/migrations/20260107101011_fix_users_schema_and_helpers.sql`), which checks
  `public.users.role = 'admin' and is_active = true` for the current `auth.uid()`.

To find or change these rules for a given table, go to Supabase Dashboard → Database → Tables →
*table* → Policies, or search `supabase/migrations/` for that table name.

## Legacy / Unused Tables

An earlier CMS design created additional tables — `content_sections`, `site_settings`,
`team_members`, `programs_cms`, `events_calendar`, `navigation_items` (from
`supabase/migrations/20251213000542_002_create_cms_content_tables.sql`) and a second, overlapping
attempt (`page_sections`, `programs`, `team_members`, `events`, `site_settings` from
`20251213073224_create_cms_content_tables.sql`). These migrations are already applied and are
left in place (removing an applied migration file doesn't undo it in a live database), but as of
this writing **no frontend code reads or writes** `content_sections`, `site_settings`,
`team_members`, `programs_cms`, `events_calendar`, or `navigation_items` — grep `src/` for
`.from('<table>')` before building anything against them, since some of these names are shared
between the two historical schema attempts and may not mean what their column comments say.

## Troubleshooting

**Content not updating on the public site:**
- Confirm the row is marked visible/active (`is_active` on `page_sections`, `is_published` on
  events/webinars where applicable).
- Hard-refresh — there's no server cache, but the browser may cache the JS bundle.
- Check the browser console for the actual Supabase error.

**Admin can't edit:**
- Confirm the logged-in user's `public.users.role` is `admin` and `is_active` is `true`.
- Check Database → Tables → *table* → Policies for a write policy that actually covers this
  operation.

**Images not displaying:**
- Confirm the stored URL is a public Supabase Storage URL (see
  [UPLOAD_SYSTEM.md](./UPLOAD_SYSTEM.md)) and not a broken reference to a deleted file.
