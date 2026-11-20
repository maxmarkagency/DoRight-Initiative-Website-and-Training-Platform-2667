# Visual Page Editor — Phase 2 (Remaining Pages, Image Pickers, Cleanup) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make About, Programs, Trustees, Contact, Sub-Committees and Join editable in Admin → Pages; replace every raw image-URL input in the admin with the shared image picker; retire the old Content tabs.

**Architecture:** Reuses phase 1 unchanged: per-page config in `src/cms/pages/<slug>.config.js` (`order`, `root` SEO fields, `components` with labelled fields + `defaultProps`), `usePageContent(slug)` + `PageRenderer` on the public page, Puck editor at `/admin/pages/:slug`. New in this phase: a page-actions context so sections on form pages can trigger page behaviour (open a modal, scroll to the form) without owning it, and "fixed lists" whose items are matched to code by a stable key so editors can change text but not add/remove/reorder items that forms depend on.

**Tech Stack:** React 18, Vite 4, Tailwind, Supabase, `@puckeditor/core@0.24.1`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-20-visual-page-editor-design.md` (phase 1 plan: `docs/superpowers/plans/2026-11-21-visual-page-editor-phase1.md`)

## Global Constraints

- Every migrated public page renders **identically** to today before anything is published. "Today" = what the live page shows: for About and Programs that is the `page_sections` value where the page reads one, else the hardcoded fallback. Snapshot of live DB values: `docs/superpowers/plans/data/2026-11-21-page-sections-snapshot.json` (Contact's only row is inactive, so Contact uses its code fallbacks).
- Form, payment, lead and modal **logic** is not changed; only surrounding copy and images become editable.
- **Edit-only lists (user decision):** Sub-Committees (`SUB_COMMITTEES_DATA` ids, WhatsApp links, colours, icons) and Join "ways" (`interestKey` drives the form) — editors may change text/images only; no add/remove/reorder; ids/keys/links/amounts are not editable fields.
- Operational settings (contact email/phone/address, social links, WhatsApp links, bank details) stay in `site_settings` / Admin → Settings. Sections that show them display a note in the editor field label: `Contact details come from Admin → Settings`.
- Puck stays out of public bundles (only `PageEditor-*.js` may contain it).
- Pages whose first section is a dark hero under the transparent header (`src/lib/headerRoutes.js` `hasTransparentHero`) must not expose a `hidden` toggle on that hero.
- Images stored as `{ url, alt }` via `imageField`; links rendered via `ButtonLink`.
- Old tables `pages`, `page_sections`, `programs`, `team_members` are left in the database (not dropped).

## Review Focus

1. Editor removes every item from a fixed list (or Puck strips the key) → page still renders all code-defined items with default text; nothing crashes. (Task 1 tests)
2. A stored fixed-list item whose key no longer exists in code (committee renamed in code) → ignored. (Task 1 tests)
3. Section on a form page clicked inside the Puck canvas (no page actions provided) → no crash, no navigation. (Task 1 test)
4. A migrated page loaded with no published content and the Supabase request failing → identical to today's page. (each page task's fallback test)
5. Admin Settings image setting saved via the new picker → stored as a plain URL string exactly as before (other code reads it as a string). (Task 8 test)

---

## File Structure

| File | Responsibility |
|---|---|
| `src/cms/pageActions.js` | `PageActionsContext` (default no-op actions) + `usePageActions()` |
| `src/cms/fields/fixedList.js` | `fixedListField(...)` + `mergeByKey(codeItems, storedItems, key)` |
| `src/cms/pages/{about,programs,trustees,contact,sub-committees,join}.config.js` | Page configs |
| `src/cms/sections/<page>/*.jsx` | Section components moved from each page |
| `src/cms/pages/index.js` | Register all pages |
| `src/pages/{About,Programs,Trustees,Contact,SubCommittees,Join}.jsx` | Use `usePageContent` + `PageRenderer`; keep form/modal state and provide it via `PageActionsContext` |
| `src/cms/fields/imageField.jsx` | Export `ImageFieldInput` for non-Puck use; `showAlt` prop |
| `src/pages/admin/{Blog,Event,Webinar,Gallery}Management.jsx` | Replace upload + raw URL inputs with `ImageFieldInput` |
| `src/pages/admin/ContentManagement.jsx` | Reduced to Site Settings only (image settings use the picker) |
| `src/components/admin/AdminSidebar.jsx` | Rename "Content" link to "Site Settings" |
| `src/services/pageContentService.js` | Deleted once no page imports it |

---

### Task 1: Shared pieces — page actions + fixed lists

**Files:** Create `src/cms/pageActions.js`, `src/cms/fields/fixedList.js`, `src/cms/fields/fixedList.test.js`

**Interfaces:**
- Produces:
  - `PageActionsContext` (React context, default value `{}`) and `usePageActions() -> object` where any missing action is a no-op: implement as returning a `Proxy`-free plain object merge `{ ...NOOP_ACTIONS, ...useContext(PageActionsContext) }` with `NOOP_ACTIONS = { openCommittee: () => {}, selectWay: () => {}, scrollToForm: () => {} }`.
  - `mergeByKey(codeItems: object[], storedItems: unknown, key: string, editable: string[]) -> object[]` — returns one item per `codeItems` entry, **in code order**: the code item with, for each field name in `editable`, the value from the stored item whose `[key]` matches, unless that value is `undefined`/`null`/`''`. Fields not in `editable` (ids, links, colours) always come from code. Stored items with unknown keys dropped. Non-array `storedItems` treated as `[]`.
  - `fixedListField({ label, key, itemLabel, arrayFields })` → Puck array field `{ type:'array', label, min: n, max: n, getItemSummary: item => item[itemLabel] || item[key], arrayFields }` where `n` is set by the page config to the code list length (pass `count`). Signature: `fixedListField({ label, count, key, itemLabel, arrayFields })`.
- [ ] **Step 1: Failing tests** (`fixedList.test.js`), code items `[{id:'a', name:'A', link:'x'}, {id:'b', name:'B', link:'y'}]`, `editable = ['name']`:
  - stored `[{id:'b', name:'Bee'}]` → `[{id:'a',name:'A',link:'x'}, {id:'b',name:'Bee',link:'y'}]`.
  - stored `[{id:'a', link:'evil'}]` → item `a` keeps `link: 'x'`.
  - stored `[{id:'z', name:'Z'}]` → equals code items.
  - stored `null` / `'junk'` → equals code items.
  - stored `[{id:'a', name:''}]` → `name` stays `'A'`.
  - stored order `[b, a]` → output order `a, b`.
  - `fixedListField({ label:'L', count:6, key:'id', itemLabel:'name', arrayFields:{} })` has `min === 6 && max === 6`.
- [ ] **Step 2:** `npx vitest run src/cms/fields/fixedList.test.js` — Expected: FAIL (module missing).
- [ ] **Step 3:** Implement both files.
- [ ] **Step 4:** Run — Expected: PASS.
- [ ] **Step 5:** Commit `feat: add page actions context and fixed-key lists for CMS`.

### Pattern for every page task (Tasks 2–7)

Each page task follows the Home pattern from phase 1, Task 3–4:
1. **Failing tests** in `src/cms/sections/<page>/<page>.test.jsx` (wrap in `MemoryRouter`):
   - *Fallback identity:* render the page component itself with `pageContentApi.fetchPublished` mocked to reject; `await` ready; assert the page's `h1` text and **every section heading** listed in the task equal today's values.
   - Per-task assertions listed below.
2. Run → FAIL. 3. Move each listed section's JSX verbatim into `src/cms/sections/<page>/<Section>.jsx` taking content props; write `<slug>.config.js` with root SEO defaults = the page's current `useSeo` title/description and section `defaultProps` = today's rendered values (see Global Constraints); register in `PAGES` with `{ title, path }`. Replace the page body with `usePageContent(slug)`, `useSeo` from root props, the existing outer wrapper, and `{ready ? <PageRenderer …/> : placeholder}` where placeholder = a `div` with the hero's min-height and background classes (`aria-hidden="true"`). Form pages wrap `PageRenderer` in `<PageActionsContext.Provider value={…}>` and render their modals/forms outside `PageRenderer` exactly as today.
4. Run tests → PASS; `npm run build` → success.
5. Commit `feat: make <Page> page editable`.

Remove `getPageContent`/`getSectionByKey` imports from each migrated page.

### Task 2: About (`about`, path `/about`)

Sections (order): `AboutHero` (title, subtitle, badge, stats list `{number,label}` — from `hero` row), `AboutMissionVision` (mission title/text, vision title/text, `hidden`), `AboutValues` (title, subtitle, values `{icon,title,description}` with `iconField`; DB has the 7 values), `AboutImpact` ("Our Impact Since 2018" block, its stats), `AboutTimeline` (title, items `{year,title,description}` from DB `timeline`), `AboutTeam` (title, subtitle, image from DB `team.image_url`), `AboutCallToAction` ("Join Our Mission", text, buttons).
- Extra tests: values section renders 7 cards incl. `Meritocracy`; timeline renders the DB snapshot's items in order.
- `iconField` options must include every icon About uses today (add `FiEye`, `FiCalendar`, `FiZap` to `ICONS` if used).

### Task 3: Programs (`programs`, path `/programs`)

Sections: `ProgramsHero`, `ProgramsImpactStats` (DB `impact_stats.stats`), `ProgramsList` (DB `programs_list.programs`; items keep today's shape incl. subtitle/features/image → image becomes `{url,alt}`), `ProgramsHowWeWork`, `ProgramsRealImpact` ("Real Programs, Real Impact" with classroom/community blocks + images), `ProgramsGetInvolved`.
- Extra tests: program list renders every DB snapshot program title.

### Task 4: Trustees (`trustees`, path `/trustees`)

Sections: `TrusteesHero` ("OUR TRUSTEES"), `TrusteesIntro` ("Leadership with Purpose"), `TrusteesList` (trustees `{name, role, bio, photo:{url,alt}}` from the hardcoded `trustees` array; add/remove allowed), `TrusteesClosing` ("Guided by Excellence").
- Extra tests: every current trustee name renders; a trustee with empty photo renders no `<img>`.

### Task 5: Contact (`contact`, path `/contact`)

Editable: `ContactHero` (title/subtitle), `ContactInfoIntro` (heading "Contact Information" + field-label note that values come from Settings — the info values themselves still come from `site_settings`), `ContactFormIntro` (heading "Send Us a Message", success heading "Message Sent Successfully!" and text), `ContactDepartments` (departments `{name, email, …}` from the hardcoded `departments` array; add/remove allowed), `ContactMap` ("Find Us" heading + embed/address text as today), `ContactFaq` (heading + `{question, answer}` items).
- The form component and its submit/Turnstile/lead logic stay in `Contact.jsx`; `ContactFormIntro` receives the form element via `usePageActions().renderContactForm?.()` — in the editor (no provider) it renders a static placeholder box `Contact form appears here`.
- Extra tests: FAQ renders every current question; in a render **without** a provider the form placeholder text shows and no `<form>` exists.

### Task 6: Sub-Committees (`sub-committees`, path `/sub-committees`)

Editable: `SubCommitteesHero` (badge, title, greeting heading, greeting paragraphs list), `SubCommitteesList` (fixed list keyed by `id`, `count: SUB_COMMITTEES_DATA.length`, editable fields: `name`, `shortName`, `description`, `responsibilities` list `{title, desc}`); colours, icon, number, `whatsappLink` stay in `SUB_COMMITTEES_DATA` and are merged with `mergeByKey`. "Join" buttons call `usePageActions().openCommittee(committee)`.
- `SUB_COMMITTEES_DATA` stays exported and unchanged; the join modal and `customWhatsAppLinks` logic stay in the page.
- Extra tests: six committees render in code order; stored edit of `strategy.name` shows; clicking a Join button without a provider does not throw; with a provider `openCommittee` receives the merged committee incl. `whatsappLink`.

### Task 7: Join (`join`, path `/join`)

Editable: `JoinHero`, `JoinWays` (fixed list keyed by `interestKey`, count 3; editable `title`, `description`, `features` list `{text}`, `ctaText`; `icon`/`color`/`interestKey` from code; CTA calls `usePageActions().selectWay(interestKey)`), `JoinFormIntro` (text around the signup form only), `JoinImpactStats` ("Our Growing Impact", stats `{number,label}`, add/remove allowed), `JoinEveryAction` ("Every Action Counts" block).
- The signup form, tier logic, photo upload, payment redirects stay in `Join.jsx` untouched.
- Extra tests: three ways render with their CTAs; stored edit of the `Donating` description shows; CTA without provider doesn't throw.

### Task 8: Image picker everywhere + retire old Content tabs

**Files:** Modify `src/cms/fields/imageField.jsx`, `src/pages/admin/{Blog,Event,Webinar,Gallery}Management.jsx`, `src/pages/admin/ContentManagement.jsx`, `src/components/admin/AdminSidebar.jsx`; delete `src/services/pageContentService.js`; Test `src/cms/fields/imageField.test.jsx`, `src/pages/admin/ContentManagement.test.jsx`

**Interfaces:**
- `export const ImageFieldInput` with new optional prop `showAlt = true` (when false, alt input + helper text hidden).
- Admin forms: `featured_image_url` (Blog), `image_url` (Event, Webinar), `thumbnail_url` (Gallery) use `<ImageFieldInput field={{label}} showAlt={false} value={{url: form.X, alt:''}} onChange={(img) => set X = img.url} />`; their separate `MediaUpload` + raw URL inputs for that field are removed. Gallery's `media_url` keeps its URL input (YouTube links) and its existing `MediaUpload`.
- `ContentManagement.jsx`: remove the Page Sections, Programs and Team tabs and their editors/loaders; keep Settings; `setting_type === 'image'` uses `ImageFieldInput showAlt={false}` storing the URL string; select option label `Image` (not `Image URL`). Page heading `Site Settings`. Sidebar link `Content` → `Site Settings` (same path `/admin/content`).
- [ ] **Step 1: Failing tests:** `showAlt={false}` → no `Alt text` label; ContentManagement (mock supabase `site_settings` select returning one `{setting_key:'logo', setting_type:'image', setting_value:'https://x/a.png'}`) shows heading `Site Settings`, no `Page Sections` text; editing that setting and mock-uploading `u.jpg` then saving calls `update`/`upsert` with `setting_value: 'u.jpg'` (a string).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** `npm test` → all PASS; `npm run build` → success; `grep -rn "pageContentService" src` → no results.
- [ ] **Step 5:** Commit `feat: use image picker across admin and retire old page content tabs`.

### Task 9: Docs + ship

- [ ] Update `CMS_DOCUMENTATION.md` (pages now editable; page-actions + fixed-list pattern; Content tab is now Site Settings only; legacy tables list) and `UPLOAD_SYSTEM.md` (picker used in Blog/Event/Webinar/Gallery/Settings).
- [ ] `npm test` all PASS; `npm run build` success; `grep -l puckeditor dist/assets/index-*.js` → none.
- [ ] Commit `docs: document phase 2 page editor`; after final review merge to `main`, push, wait for Vercel `success`, confirm each migrated page URL returns 200 and its `h1` text is unchanged (`curl -sL https://www.doright.ng/<path>` is a SPA shell, so check via the built bundle containing the new config strings instead).
