# Visual Page Editor (Admin CMS Refactor) — Design

Date: 2026-11-20
Status: Draft for approval

## Intent

DoRight's admin should let a non-technical staff member update **any content on the public
site** themselves, with an editing experience that feels like Elementor: click a section on the
real page, edit its fields in a side panel, see the change live. Images are **uploaded** (or
picked from the Media Library), never pasted as URLs.

The site's **layout and design stay fixed**. Editors change content (text, images, buttons,
links, list items such as slides, program cards, trustees), not structure or styling. This
protects the "Civic Standard-Bearer" look defined in `DESIGN.md`.

## Current state (why this is needed)

- `ContentManagement.jsx` (915 lines) is a form-based editor for `page_sections`, `programs`,
  `team_members`, `site_settings`. Every image is a raw "Image URL" text input.
- Section editing requires typing a `section_key` by hand that must match a string the public
  page code looks for (`getSectionByKey(sections, 'hero')`). A typo silently hides content.
- Only About, Programs, Contact read `page_sections`. **Home, Trustees, SubCommittees, Join,
  Training** have their marketing content hardcoded in JSX, so it cannot be edited at all.
- The admin "Programs" and "Team" tabs write to `programs` / `team_members`, but **no public page
  reads those tables** — edits there currently do nothing on the site.
- Blog, Events, Webinars, Gallery editors already use `MediaUpload`, but still show a duplicate
  raw URL field alongside it.
- Upload infra exists: `MediaUpload.jsx` → Supabase Storage bucket `media-library`;
  `MediaManagement.jsx` lists the bucket.

## Goals

1. Visual editor (side panel + live preview, mockup "A") for every public content page.
2. All image fields: upload new **or** choose from Media Library, with preview. No URL inputs.
3. Draft → Publish workflow. Saving never changes the live site; **Publish** does.
4. Keep the last published versions of each page with one-click **Restore**.
5. Every hardcoded marketing page migrated into editable content **with identical output** —
   the public site must look exactly the same the day this ships.
6. Section fields are fixed and labelled per section ("Headline", "Background image"); no
   hand-typed keys.
7. Repeatable items (slides, program cards, trustees, values, timeline entries) can be added,
   edited, reordered, removed within their section.
   **Exception (user decision):** lists that forms or payments depend on — sub-committees
   (IDs, WhatsApp links, join-modal preselection) and membership tiers / prices (leads,
   Paystack) — are **edit-only**: names, descriptions and images editable; no add / remove /
   reorder, and IDs and amounts are not editable fields. Adding a committee or tier stays a
   developer change.
8. Blog, Events, Webinars, Gallery keep their own list screens but get the shared image field
   (remove the raw URL inputs).

## Non-goals

- Adding, removing, reordering, or restyling **sections** (no page building). Puck's insert /
  drag / delete / duplicate are disabled. Hiding a section is allowed (see below).
- Editing colors, fonts, spacing.
- Editing forms' logic (Join, Contact, Foundation member, payments) — only their surrounding
  marketing copy and images.
- Podcast episodes (pulled live from pod.co) and LMS/course content.
- Multi-language content.
- Per-user/per-page permissions — any active admin can edit and publish.

## Anti-goals (failure even if it "works")

- Public site looks different after migration, or a page renders blank if content fails to load.
- Public pages get noticeably slower (the Puck editor bundle must never load on public routes).
- An editor can put the site off-brand.
- Content silently disappears because of a mismatch between stored data and code.

## Approaches considered

| | Approach | Trade-off |
|---|---|---|
| 1 | Hand-built editor on Supabase | Full control, no dependency; most code (panel, selection outlines, array editing, preview sync all custom). |
| **2** | **Puck (`@puckeditor/core`, MIT) on Supabase** — **chosen** | Elementor-style panel, live iframe preview, click-to-select, array fields out of the box; permissions API locks layout. Adds a dependency; Puck chrome needs light restyling. Section library later is a config change. |
| 3 | Hosted headless CMS (Storyblok / Sanity) | Polished editor, but monthly cost, separate login, content leaves Supabase. Rejected. |

**Validated by spike** (branch `spike/puck-editor`, throwaway): Puck 0.24.1 works with React 18 /
Vite 4; Home hero slideshow edited as array field with a custom image field wrapping
`MediaUpload`; `permissions={{ insert:false, drag:false, delete:false, duplicate:false }}` locks
layout. User confirmed the experience is right.

## Design

### Content model

One Puck document per page. Each page is a fixed, ordered list of **section components**.

New table `page_content` (replaces `pages`/`page_sections` for editable pages):

| column | type | notes |
|---|---|---|
| `slug` | text PK | `home`, `about`, `programs`, `contact`, `trustees`, `sub-committees`, `join` (+ `site` only if header/footer have marketing copy) |
| `draft` | jsonb | Puck `Data` being edited |
| `published` | jsonb | Puck `Data` the public site renders; null = never published |
| `updated_at`, `updated_by` | | last draft save |
| `published_at`, `published_by` | | last publish |

New table `page_content_versions`: `id`, `slug`, `data jsonb`, `published_at`, `published_by`.
A row is inserted on every publish; keep the latest **10** per slug (trim on publish).

RLS: anon/public `SELECT` of `slug, published` only (via a view or column-limited policy — the
draft must not be publicly readable); admins (`public.is_admin()`) full access to both tables.

Publishing is a single Postgres function `publish_page(slug)` (security definer, admin-checked)
that copies `draft` → `published`, writes the version row, and trims old versions atomically.
Restore = copy a version's `data` into `draft` (then the admin reviews and publishes).

### Section components (code registry)

`src/cms/` (new):

- `sections/<Page>/<Section>.jsx` — the public rendering of each section, extracted from today's
  page JSX, taking content as props. Pure presentation, no data fetching.
- `config/<page>.config.js` — Puck config per page: the components allowed on that page, their
  labelled fields, `defaultProps` equal to **today's hardcoded content**.
- `fields/ImageField.jsx` — shared custom Puck field: preview, "Upload" (wraps `MediaUpload`,
  images only) and "Choose from library" (modal listing `media-library` bucket, reusing
  MediaManagement's listing logic). Stores `{ url, alt }`. Alt text is required for
  non-decorative images.
- `fields/LinkField.jsx` — label + destination (internal route picker or external URL).
- `fields/RichTextField.jsx` — only where a section genuinely needs formatted body text; reuses
  the existing Quill config and `sanitizeHtml`.

Each section has `permissions: { insert:false, drag:false, delete:false, duplicate:false }` and a
boolean `hidden` field ("Hide this section on the site").

### Public rendering

Each public page becomes: load `published` for its slug → render its sections in order with
Puck's `<Render>` (or our own map over `content`, whichever keeps the editor bundle out of public
chunks — must verify; see open items).

**Fallback rule:** if the fetch fails, or `published` is null, or a section's props are missing,
render that section with its `defaultProps` (today's content). The site never renders blank.

Non-content parts of pages (forms, payment flow, data lists like Events/Blog/Gallery grids) stay
as they are; only their surrounding copy becomes sections.

### Admin editor

- New admin route `/admin/pages` lists editable pages with draft/published status ("Unpublished
  changes" badge when `draft ≠ published`).
- `/admin/pages/:slug` mounts `<Puck>` lazy-loaded (`React.lazy`) with that page's config and
  `draft` data.
- Header actions: **Save draft** (autosave on change, debounced, plus manual), **Publish**
  (confirm dialog), **Preview** (open public route with `?preview=draft`, admins only),
  **History** (list versions, Restore into draft).
- Puck UI restyled to the admin's look via its overrides/CSS; component list ("insert") hidden.
- Replaces the "Page Sections", "Programs", "Team" tabs of `ContentManagement.jsx`.
- **Operational data stays in `site_settings`** *(design call)*: contact email/phone/address,
  social links, tier / sub-committee WhatsApp links, bank details. They are read by the
  `send-lead-welcome-email` edge function, `leadsService`, `PaymentPage`, Footer, and edited in
  `admin/Settings.jsx`; moving them behind Publish would delay or break emails. The editor panel
  shows a read-only note + link to Settings where a section displays these values. `ImageField`
  is still added to any image setting there. The `site` document therefore holds only marketing
  copy in the header/footer, if any; drop the `site` slug if there is none.
- **Page SEO** *(design call)*: each page document has Puck `root` fields for page title and meta
  description, consumed by `useSeo` (falling back to today's hardcoded values).
- **Data-driven sections in the editor** *(design call)*: sections that list live records
  (Home programs/courses, Events/Blog/Gallery grids) load real data in the editor canvas, same as
  the public site; only their headings/intro copy are editable.
- **Draft preview security** *(design call)*: drafts are only fetched through an admin-checked RPC
  (`get_page_draft(slug)`); `?preview=draft` on a public route calls it and falls back to
  published for non-admins. RLS, not client checks, protects drafts.

### List-type managers

`BlogManagement`, `EventManagement`, `WebinarManagement`, `GalleryManagement` keep their screens;
replace their upload + raw URL inputs with the shared `ImageField` (Gallery keeps YouTube URL
support for video items, since that is a link, not an image).

### Migration

1. Migration creates `page_content`, `page_content_versions`, RLS, `publish_page()`.
2. Seed: for each page, `draft = published =` the Puck data built from config `defaultProps`
   (generated by a script from the configs so seed and code can't drift). *(Design call)* Wherever
   the live site currently shows a database value that overrides a hardcoded default
   (`page_sections` on About / Programs / Contact, any others found), the seed script reads the
   **production** value so day-one output is identical. Run it against production data, review
   the generated JSON before applying.
3. Public pages switch to the new renderer one at a time; each switch verified visually against
   the current page (screenshots at 375 / 768 / 1440).
4. After all pages are switched and verified: remove the old ContentManagement tabs and
   `pageContentService`. Old tables (`pages`, `page_sections`, `programs`, `team_members`) are left
   in place (not dropped) and documented as legacy in `CMS_DOCUMENTATION.md`.

### Delivery order

1. Foundation: tables + RLS + publish function, `ImageField`, `LinkField`, editor shell with
   draft/publish/history, lazy loading.
2. Home page end to end (hero slideshow, who we are, programs, courses, call to action) — proves
   the full loop in production.
3. Remaining pages: About, Programs, Trustees, Contact, SubCommittees, Join.
   *(Design call)* **Training is out of scope**: its public route is disabled in `App.jsx`, so
   there is nothing live to edit or verify. Migrate it when the route is re-enabled.
4. List managers switched to `ImageField`.
5. Remove old editor tabs; update `CMS_DOCUMENTATION.md`, `UPLOAD_SYSTEM.md`.

## Constraints

- Stack: React 18, Vite 4, JS (no TypeScript), Tailwind, Supabase (no custom server). Writes go
  through Supabase with RLS; Storage policies on `media-library` remain the upload gate.
- `DESIGN.md` governs public rendering; the admin is product-register.
- Existing known design departures on Home (gradient hero, etc.) are **preserved as-is** in this
  work; fixing them is separate.

## Left to the builder

- Exact section split for each page (follow the visible sections of today's JSX).
- Whether public pages use Puck's `<Render>` or a hand-rolled renderer, decided by bundle impact.
- Autosave debounce interval, history UI layout, Puck restyling details.
- Test approach (unit tests for publish/restore logic and fallback rendering; visual comparison
  for migrated pages).
