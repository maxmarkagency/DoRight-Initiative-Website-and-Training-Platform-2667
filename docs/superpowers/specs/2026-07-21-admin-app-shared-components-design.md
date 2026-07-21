# Admin App Shared Components Refactor

Status: Approved
Date: 2026-07-21

## Background

Six admin management pages — `BlogManagement.jsx`, `EventManagement.jsx`, `WebinarManagement.jsx`, `CourseManagement.jsx`, `LeadsManagement.jsx`, `GalleryManagement.jsx` (178-480 lines each) — independently reimplement the same three pieces of scaffolding:

- **Modal shell**: the overlay + card markup (`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4` wrapping `bg-white dark:bg-gray-800 rounded-lg p-6 ... max-h-[90vh] overflow-y-auto`) is byte-for-byte identical everywhere it appears, including both of `LeadsManagement.jsx`'s two modals.
- **Quill editor config**: `BlogManagement.jsx`, `EventManagement.jsx`, and `WebinarManagement.jsx` each define an identical `quillModules`/`quillFormats` pair.
- **Search + filter bar**: a search `<input>` with a `FiSearch` icon plus one or more `<select>` filter dropdowns, wrapped in the same `flex flex-col sm:flex-row items-center justify-between mb-6 gap-4` row, appears in some form across all six pages.

This is a pure code-quality refactor: extract the scaffolding that's already identical, leave every page's actual data logic (Supabase queries, field validation, exact form fields) and every page's genuinely distinct concerns untouched.

## Scope

### 1. `src/components/admin/AdminModal.jsx`

A presentational wrapper taking `isOpen`, `onClose`, `maxWidth` (pages currently vary between `max-w-2xl` and `max-w-lg` — becomes a prop, not hardcoded), and `children`. Replaces the hand-rolled overlay+card markup in every modal across all six pages. No behavior change — same classes, same structure, just written once.

### 2. `src/lib/quillConfig.js`

Exports the shared `quillModules` and `quillFormats` objects, currently duplicated verbatim in `BlogManagement.jsx`, `EventManagement.jsx`, and `WebinarManagement.jsx`. Each file imports from here instead of redefining them.

### 3. `src/components/admin/SearchFilterBar.jsx`

Takes a search value/onChange pair (plus a placeholder string) and an array of filter configs (`{ value, onChange, options: [{ value, label }] }`), rendering the same search-input-plus-dropdowns row every page currently hand-rolls. Supports one or more filter dropdowns per page, since `LeadsManagement.jsx` and others use more than one.

## Non-goals

- **No generic "admin CRUD framework."** Each page keeps its own Supabase fetch/insert/update/delete calls, its own form state, and its own field set. Only the three genuinely-identical scaffolding pieces above are extracted.
- **No visual changes.** The extracted components use the exact classes already in use today — this is a lift-and-share, not a redesign.
- **`LeadsManagement.jsx`'s bespoke logic stays bespoke**: the status-advancement `<select>`, the signed-URL photo fetch, and the referral-creation modal's distinct field set are untouched beyond wrapping in `AdminModal` and reusing `SearchFilterBar` for its existing search/status row.
- **No changes to `MediaManagement.jsx`, `UserManagement.jsx`, `CourseAnalytics.jsx`, `DashboardOverview.jsx`, `Settings.jsx`, or `ContentManagement.jsx`** — none of these share the modal/search/Quill pattern closely enough to benefit, and `ContentManagement.jsx`'s size (834 lines) is a separate, later concern not part of this pass.
- **No test suite added.** This repo has none; `npm run build` succeeding, plus a manual before/after read-back confirming identical rendered markup, is the verification bar — consistent with every other phase this session.
