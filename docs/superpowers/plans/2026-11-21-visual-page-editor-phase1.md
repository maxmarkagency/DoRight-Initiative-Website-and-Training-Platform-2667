# Visual Page Editor — Phase 1 (Foundation + Home) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Puck-based visual page editor with draft/publish/history and the Home page fully editable, with the public Home page looking identical to today.

**Architecture:** Page content is a Puck `Data` JSON document per page slug, stored in Supabase (`page_content`: `draft` + `published`; `page_content_versions` for history). Each page has a code config listing its fixed sections, their labelled fields and `defaultProps` = today's hardcoded content. Public pages merge published content over defaults with a pure resolver and render through a tiny in-house renderer (Puck itself is only loaded, lazily, in the admin editor).

**Tech Stack:** React 18, Vite 4, JS/JSX, Tailwind, Supabase JS v2, `@puckeditor/core@0.24.1`, Vitest + jsdom + @testing-library/react (new, dev only).

**Spec:** `docs/superpowers/specs/2026-11-20-visual-page-editor-design.md`

Later phases (separate plans, after this ships): remaining pages (About, Programs, Trustees, Contact, SubCommittees, Join); `ImageField` in Blog/Event/Webinar/Gallery managers; removing old ContentManagement tabs.

## Global Constraints

- Public Home page must render identically to the current `src/pages/Home.jsx` when no content is published, and after the first publish of unchanged defaults.
- Public route chunks must not import `@puckeditor/core` (editor is `React.lazy`-loaded under `/admin`).
- Layout locked: Puck `permissions={{ insert: false, drag: false, delete: false, duplicate: false }}`; component list hidden.
- Drafts never readable by non-admins: enforced in Postgres (RLS + security-definer functions), not client code.
- Admin check everywhere in SQL: `public.is_admin()`.
- Keep the latest **10** versions per slug.
- Images stored as `{ url: string, alt: string }`; uploads go to Storage bucket `media-library` via existing `MediaUpload`.
- No new runtime dependency other than `@puckeditor/core`.
- Existing Home design departures (gradient hero overlay etc.) preserved as-is.

## Review Focus

1. Published JSON missing a section, or a section missing props (e.g. `slides: []` or no `slides`) → that section renders its defaults, never blank/crash. (Task 2 tests)
2. Network/RLS failure loading content → public page still renders defaults immediately with no visible error. (Task 4 test)
3. Two quick edits then Publish before autosave fires → Publish saves the latest draft first, then publishes. (Task 7 test)
4. Hero slide added in editor with no image → slide renders with no `<img>` broken icon (renders background colour only). (Task 3 test)
5. Unknown section `type` in stored JSON (e.g. config renamed later) → ignored, not rendered, no crash. (Task 2 test)

---

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations/20261121090000_create_page_content.sql` | Tables, RLS, `get_published_page`, `publish_page`, `restore_page_version` |
| `src/cms/pageData.js` | Pure: `buildDefaultData`, `resolvePageData`, `isSameData` |
| `src/cms/pageContentApi.js` | Supabase calls for page content |
| `src/cms/usePageContent.js` | Public hook: defaults first, then published (or draft in admin preview) |
| `src/cms/PageRenderer.jsx` | Renders resolved data with a page config, skipping hidden sections |
| `src/cms/fields/imageField.jsx` | Puck custom image field (upload + library picker + alt) |
| `src/cms/fields/MediaLibraryPicker.jsx` | Modal listing `media-library` images |
| `src/cms/fields/iconField.js` | Icon `select` field + `ICONS` map |
| `src/cms/sections/home/*.jsx` | `HomeHero`, `HomeWhoWeAre`, `HomePrograms`, `HomeCallToAction` |
| `src/cms/pages/home.config.js` | Puck config for Home (fields, defaults, root SEO fields) |
| `src/cms/pages/index.js` | `PAGES` registry |
| `src/pages/Home.jsx` | Becomes: `usePageContent('home')` + `useSeo` + `PageRenderer` |
| `src/pages/admin/PagesList.jsx` | `/admin/pages` list with status |
| `src/pages/admin/PageEditor.jsx` | `/admin/pages/:slug` Puck editor (lazy) |
| `src/cms/editor/EditorToolbar.jsx` | Save status, Publish, History, View live |
| `src/cms/editor/HistoryPanel.jsx` | Versions list + Restore |
| `src/cms/editor/useDraftAutosave.js` | Debounced draft save + `flush()` |
| `src/components/admin/AdminLayout.jsx`, `AdminSidebar.jsx` | Routes + "Pages" nav link |
| `vitest.config.js`, `src/test/setup.js` | Test runner |

---

### Task 1: Test runner + database schema

**Files:**
- Create: `vitest.config.js`, `src/test/setup.js`, `supabase/migrations/20261121090000_create_page_content.sql`
- Modify: `package.json` (scripts `"test": "vitest run"`; devDeps `vitest@^1.6.0`, `jsdom@^24`, `@testing-library/react@^14`, `@testing-library/jest-dom@^6`)

**Interfaces:**
- Produces (SQL):
  - table `page_content(slug text pk, draft jsonb, published jsonb, updated_at timestamptz default now(), updated_by uuid, published_at timestamptz, published_by uuid)`
  - table `page_content_versions(id uuid pk default gen_random_uuid(), slug text references page_content(slug) on delete cascade, data jsonb not null, published_at timestamptz default now(), published_by uuid)`
  - `get_published_page(p_slug text) returns jsonb` — security definer, granted to anon + authenticated; returns `published` or null.
  - `publish_page(p_slug text) returns timestamptz` — security definer; raises `'not authorized'` unless `is_admin()`; raises `'nothing to publish'` if no draft; copies draft→published, sets `published_at/by`, inserts version, deletes versions beyond newest 10 for slug.
  - `restore_page_version(p_version_id uuid) returns jsonb` — admin-only; copies version `data` into that slug's `draft`, returns it.
  - RLS on both tables enabled; single policy each: `for all to authenticated using (is_admin()) with check (is_admin())`. No anon policy (anon reads only through `get_published_page`).

- [ ] **Step 1:** Install dev deps; add `vitest.config.js` (`environment: 'jsdom'`, `setupFiles: ['src/test/setup.js']`, `globals: true`, react plugin); `setup.js` imports `@testing-library/jest-dom`.
- [ ] **Step 2:** Run `npm test` — Expected: "No test files found" (exit code may be 1; runner works).
- [ ] **Step 3:** Write the migration per Interfaces.
- [ ] **Step 4:** Apply: `supabase db push` — Expected: "Applying migration 20261121090000_create_page_content.sql... Finished".
- [ ] **Step 5:** Verify as anon: `curl "$VITE_SUPABASE_URL/rest/v1/page_content?select=slug" -H "apikey: $ANON"` → `[]`; `curl -X POST "$URL/rest/v1/rpc/get_published_page" -H "apikey: $ANON" -H "Content-Type: application/json" -d '{"p_slug":"home"}'` → `null`; `rpc/publish_page` as anon → error containing `not authorized`.
- [ ] **Step 6:** Commit `feat: add page_content schema and test runner`.

### Task 2: Pure page-data resolver

**Files:**
- Create: `src/cms/pageData.js`, `src/cms/pageData.test.js`

**Interfaces:**
- Produces:
  - `buildDefaultData(config) -> Data` — `{ root: { props: config.root?.defaultProps ?? {} }, content: config.order.map(type => ({ type, props: { id: type, ...config.components[type].defaultProps } })) }`
  - `resolvePageData(stored: Data|null|undefined, config) -> Data` — for each `type` in `config.order` (fixed layout): take the first stored item with that type; props = `{ ...defaultProps, ...storedProps }` but any stored prop that is `undefined`, `null`, or an empty array where the default is a non-empty array falls back to the default. Unknown stored types dropped. Root props merged the same way.
  - `isSameData(a, b) -> boolean` — `JSON.stringify` equality.
- Page config shape used by all later tasks: `{ order: string[], root: { fields, defaultProps }, components: { [type]: { label, fields, defaultProps, render } } }` (Puck config plus `order`).

- [ ] **Step 1: Write failing tests** with a tiny fake config `{ order: ['A','B'], components: { A: { defaultProps: { title: 'Def A', items: [1,2] } }, B: { defaultProps: { text: 'Def B' } } }, root: { defaultProps: { title: 'T' } } }`:
  - `buildDefaultData` → content types `['A','B']`, `content[0].props.title === 'Def A'`, `root.props.title === 'T'`.
  - `resolvePageData(null, cfg)` deep-equals `buildDefaultData(cfg)`.
  - stored `{content:[{type:'A',props:{title:'Mine'}}]}` → A.title `'Mine'`, A.items `[1,2]`, B present with `'Def B'`.
  - stored A with `items: []` → items `[1,2]`.
  - stored with `{type:'Z',...}` → no item of type `Z`; order still `['A','B']`.
  - stored B before A → output order `['A','B']`.
- [ ] **Step 2:** `npx vitest run src/cms/pageData.test.js` — Expected: FAIL (module not found).
- [ ] **Step 3:** Implement per Interfaces (no mutation of inputs).
- [ ] **Step 4:** Run — Expected: PASS (6 tests).
- [ ] **Step 5:** Commit `feat: add page data resolver with default fallback`.

### Task 3: Home section components + Home config

**Files:**
- Create: `src/cms/sections/home/HomeHero.jsx`, `HomeWhoWeAre.jsx`, `HomePrograms.jsx`, `HomeCallToAction.jsx`, `src/cms/fields/iconField.js`, `src/cms/pages/home.config.js`, `src/cms/pages/index.js`, `src/cms/sections/home/home.test.jsx`
- Field-type placeholder: `imageField` imported from `src/cms/fields/imageField.jsx` (Task 6); in this task create that file exporting `imageField(label) => ({ type: 'custom', label, render: () => null })` so config compiles; Task 6 replaces `render`.

**Interfaces:**
- Consumes: page config shape (Task 2).
- Produces:
  - `ICONS` map `{ FiUsers, FiTarget, FiTrendingUp, FiShield, FiHeart, FiAward, FiBookOpen, FiGlobe, FiStar, FiCheckCircle }` and `iconField(label)` → `{ type: 'select', label, options: Object.keys(ICONS).map(k => ({ label: k.slice(2), value: k })) }`.
  - Shared field shapes: `button` = `{ type: 'object', objectFields: { label: {type:'text'}, href: {type:'text', label:'Link (e.g. /join or https://…)'} } }`.
  - `homeConfig` (default export) with `order: ['HomeHero','HomeWhoWeAre','HomePrograms','HomeCallToAction']`, root fields `seoTitle` (text), `seoDescription` (textarea), root defaults = current `useSeo` title/description in Home.jsx.
  - Each component has a `hidden` radio field (`{type:'radio', label:'Show on site', options:[{label:'Show',value:false},{label:'Hide',value:true}]}`), default `false`.
  - Section props (defaults = exact current Home.jsx text/URLs):
    - `HomeHero`: `slides: [{ image:{url,alt}, badge, headline, headlineAccent, subtext }]` (3 current slides), `primaryButton` (`Join The Movement` → `/join`), `secondaryButton` (`Explore Programs` → `/programs`). Array field `getItemSummary: item => item.headline || 'Slide'`.
    - `HomeWhoWeAre`: `heading`, `paragraphs: [{ text }]` (2), `button` (`Learn More About Our Work` → `/programs`), `image:{url,alt}`, `imageCaptionTitle`, `imageCaptionText`.
    - `HomePrograms`: `heading`, `intro`, `cards: [{ icon, title, description }]` (4 current, icons as `ICONS` keys), `cardLinkLabel` (`Learn More`), `cardLinkHref` (`/programs`).
    - `HomeCallToAction`: `heading`, `text`, `primaryButton` (`Join The Movement` → `/join`), `secondaryButton` (`Partner With Us` → `/contact`).
  - `PAGES` = `{ home: { title: 'Home', path: '/', config: homeConfig } }`.
  - Section render markup: moved verbatim from Home.jsx (classes, motion props, slider state/autoplay inside `HomeHero`), reading props instead of constants. Buttons: internal hrefs (start with `/`) render `<Link>`, others `<a href target="_blank" rel="noopener noreferrer">`. Hero slide `key` = slide index. Slide with no `image.url` renders no `<img>`. Hidden sections handled by `PageRenderer`, not components.

- [ ] **Step 1: Write failing tests** (`home.test.jsx`, wrap in `MemoryRouter`):
  - Renders `HomeHero` with `homeConfig.components.HomeHero.defaultProps` → heading text `Building a Nigeria That Does Right` present; link `Join The Movement` has `href="/join"`.
  - `HomeHero` with one slide `{ image:{url:'',alt:''}, headline:'X', ... }` → `container.querySelector('img')` is null; no prev/next buttons (`queryByLabelText('Next slide')` null).
  - `HomePrograms` defaults → 4 headings incl. `Policy Advocacy`.
  - `HomeCallToAction` with `secondaryButton.href='https://example.org'` → that link has `target="_blank"`.
- [ ] **Step 2:** Run `npx vitest run src/cms/sections` — Expected: FAIL.
- [ ] **Step 3:** Implement components, `iconField.js`, `home.config.js`, `pages/index.js`.
- [ ] **Step 4:** Run — Expected: PASS.
- [ ] **Step 5:** Commit `feat: extract Home sections into editable components`.

### Task 4: Public rendering (API, hook, renderer, Home page)

**Files:**
- Create: `src/cms/pageContentApi.js`, `src/cms/usePageContent.js`, `src/cms/PageRenderer.jsx`, `src/cms/usePageContent.test.jsx`
- Modify: `src/pages/Home.jsx` (replace body)

**Interfaces:**
- Consumes: `resolvePageData`, `buildDefaultData` (Task 2); `PAGES` (Task 3).
- Produces (`pageContentApi.js`, all throw on Supabase error):
  - `fetchPublished(slug) -> Promise<Data|null>` — `supabase.rpc('get_published_page', { p_slug: slug })`
  - `fetchPageRow(slug) -> Promise<{slug, draft, published, updated_at, published_at}|null>` (admin)
  - `listPageRows() -> Promise<Array<{slug, draft, published, updated_at, published_at}>>` (admin)
  - `saveDraft(slug, data) -> Promise<void>` — upsert `{ slug, draft: data, updated_at: now ISO, updated_by: auth user id }` on conflict `slug`
  - `publishPage(slug) -> Promise<string>` — rpc `publish_page`
  - `listVersions(slug) -> Promise<Array<{id, published_at}>>` — newest first
  - `restoreVersion(versionId) -> Promise<Data>` — rpc `restore_page_version`
- `usePageContent(slug) -> { data: Data, loading: boolean }` — initial `data = buildDefaultData(config)` synchronously; then if URL has `?preview=draft` → `fetchPageRow(slug)?.draft` (errors/null fall back to published), else `fetchPublished`; result passed through `resolvePageData`. Errors are caught, logged with `console.warn`, defaults kept.
- `<PageRenderer data config />` — maps `data.content`, renders `config.components[item.type].render(item.props)` unless `item.props.hidden === true` or type unknown.
- `Home.jsx`: `const { data } = usePageContent('home'); useSeo({ path:'/', title: data.root.props.seoTitle, description: data.root.props.seoDescription });` then existing `MotionConfig`/outer `motion.div` wrapper around `<PageRenderer data={data} config={homeConfig} />`.

- [ ] **Step 1: Write failing tests** (mock `./pageContentApi`):
  - `fetchPublished` rejects → hook's first and final `data` deep-equal `buildDefaultData(homeConfig)`.
  - `fetchPublished` resolves data with HomeCallToAction heading `'New'` → after `waitFor`, `data.content[3].props.heading === 'New'`.
  - `PageRenderer` with HomeWhoWeAre `hidden: true` → text `Who We Are` absent; others present.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run tests — PASS. Run `npm run build` — Expected: success; `grep -l "puckeditor" dist/assets/*.js` lists no file whose name starts with `index-`.
- [ ] **Step 5:** Visual check: `npm run dev`, compare `/` against production `https://doright.ng/` at 375 / 768 / 1440 widths — identical text, images, buttons, slider behaviour.
- [ ] **Step 6:** Commit `feat: render Home page from CMS content with default fallback`.

### Task 5: Editor shell, autosave, publish, history, routing

**Files:**
- Create: `src/pages/admin/PagesList.jsx`, `src/pages/admin/PageEditor.jsx`, `src/cms/editor/EditorToolbar.jsx`, `src/cms/editor/HistoryPanel.jsx`, `src/cms/editor/useDraftAutosave.js`, `src/cms/editor/useDraftAutosave.test.js`
- Modify: `src/components/admin/AdminLayout.jsx` (routes `pages` → `PagesList`, `pages/:slug` → lazy `PageEditor` in `<Suspense>`), `src/components/admin/AdminSidebar.jsx` (add `{ name: 'Pages', path: '/admin/pages', icon: FiLayout }` before `Content`)
- Modify: `package.json` (dep `@puckeditor/core@0.24.1`)

**Interfaces:**
- Consumes: API functions (Task 4), `PAGES`, `resolvePageData`, `isSameData`.
- Produces:
  - `useDraftAutosave(slug, { delayMs = 1500, save = saveDraft }) -> { schedule(data), flush() : Promise<void>, status: 'saved'|'unsaved'|'saving'|'error' }` — `schedule` debounces; `flush` cancels the timer and saves the latest scheduled data immediately (no-op if nothing pending).
  - `PagesList`: one row per `PAGES` entry: title, status (`Not published yet` if no row/`published` null; `Unpublished changes` if `!isSameData(draft, published)`; else `Published <date>`), "Edit" → `/admin/pages/:slug`.
  - `PageEditor`: loads row; initial data = `resolvePageData(row?.draft ?? row?.published, config)`; renders `<Puck config={config} data={...} onChange={schedule} permissions={{insert:false,drag:false,delete:false,duplicate:false}} overrides={{ headerActions: () => <EditorToolbar .../> }} />` with `import '@puckeditor/core/puck.css'`; Puck's left component-list panel hidden (`overrides.components = () => null` or equivalent in 0.24.1). Container fills the admin main area height.
  - `EditorToolbar`: status text (`All changes saved` / `Saving…` / `Unsaved changes` / `Couldn't save — retrying`); **Publish** (confirm `Publish these changes to the live site?` → `await flush(); await publishPage(slug)`; success toast `Published`); **History** toggles `HistoryPanel`; **View live** opens `PAGES[slug].path` in new tab.
  - `HistoryPanel`: `listVersions` rows `Published <date time>` + **Restore** (confirm `Replace your current draft with this version? You can review it before publishing.`) → `restoreVersion(id)` then reload editor data from the returned draft.
  - Errors from any API call show an inline message in the toolbar; never lose the in-memory editor data.

- [ ] **Step 1: Write failing tests** (`useDraftAutosave.test.js`, fake timers, mock `save`):
  - two `schedule` calls within 1500 ms → after 1500 ms `save` called once with the second data.
  - `schedule(d)` then immediate `await flush()` → `save` called once with `d` before timers advance; advancing timers afterwards → no second call.
  - `save` rejects → `status === 'error'`.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement hook, then list/editor/toolbar/history and routes.
- [ ] **Step 4:** Run tests — PASS. `npm run build` — success.
- [ ] **Step 5:** Manual check (logged in as admin, `npm run dev`): edit hero headline → "All changes saved"; public `/` unchanged; `/?preview=draft` shows edit; Publish → `/` shows edit; History lists the version; Restore an older one → editor shows it. Try insert/drag/delete — not possible.
- [ ] **Step 6:** Commit `feat: add visual page editor with draft, publish and history`.

### Task 6: Image field with upload + media library

**Files:**
- Modify: `src/cms/fields/imageField.jsx` (real `render`)
- Create: `src/cms/fields/MediaLibraryPicker.jsx`, `src/cms/fields/imageField.test.jsx`

**Interfaces:**
- Consumes: `MediaUpload` (`onUploadSuccess(file)` with `file.url`, prop `allowedTypes="image"`).
- Produces:
  - `imageField(label)` → `{ type:'custom', label, render: ImageFieldInput }`; `ImageFieldInput({ value, onChange, field })` where `value = { url, alt }`; shows preview thumbnail when `url`, an **Alt text** input (helper text `Describe the image for people using screen readers`), **Upload** (`MediaUpload`), **Choose from library** (opens picker), **Remove** (sets `{ url:'', alt:'' }`). Every change calls `onChange({ ...value, ...patch })`.
  - `MediaLibraryPicker({ open, onClose, onSelect(url) })` — lists `media-library` images (same `.list('', { limit: 100, sortBy: created_at desc })` + `getPublicUrl` as MediaManagement, filtered to image extensions jpg/jpeg/png/gif/webp), grid of thumbnails, click selects + closes; empty state `No images in the library yet. Upload one instead.`; load error message shown.

- [ ] **Step 1: Write failing tests** (mock `supabase`, mock `MediaUpload` to a button calling `onUploadSuccess({url:'u.jpg'})`):
  - Typing alt → `onChange` called with `{ url: 'a.jpg', alt: 'Kids' }` given `value {url:'a.jpg', alt:''}`.
  - Mock upload click → `onChange({ url: 'u.jpg', alt: '' })`.
  - Picker with storage list `[x.png, y.pdf]` → one thumbnail; click → `onSelect` with public URL of `x.png`.
  - Remove → `onChange({ url: '', alt: '' })`.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run all tests — PASS; `npm run build` — success.
- [ ] **Step 5:** Manual: in editor, upload a new hero image and pick one from library; preview updates.
- [ ] **Step 6:** Commit `feat: add image upload and media library picker to page editor`.

### Task 7: Publish-flush guarantee, docs, ship

**Files:**
- Create: `src/cms/editor/EditorToolbar.test.jsx`
- Modify: `CMS_DOCUMENTATION.md` (new "Visual Page Editor" section: tables, functions, how to add a page/section, fallback rule; mark `pages`/`page_sections` as legacy for Home), `UPLOAD_SYSTEM.md` (image field + picker)

**Interfaces:**
- Consumes: `EditorToolbar` props `{ slug, autosave: { flush, status }, onShowHistory }`, `publishPage`.

- [ ] **Step 1: Write failing test:** mock `publishPage`, `window.confirm = () => true`; `flush` mock resolves after a tick and records order; click **Publish** → call order is `['flush', 'publish']`; then text `Published` visible. Second test: `publishPage` rejects → error message shown, no `Published`.
- [ ] **Step 2:** Run — FAIL if Task 5 ordering is wrong; fix toolbar until PASS.
- [ ] **Step 3:** Update docs.
- [ ] **Step 4:** Full check: `npm test` all PASS; `npm run build` success.
- [ ] **Step 5:** Commit `docs: document visual page editor`; `git push origin main`; wait for Vercel status `success` on the pushed commit (`gh api repos/<owner>/<repo>/commits/<sha>/status --jq .state`); load `https://doright.ng/` and `/admin/pages` to confirm.
