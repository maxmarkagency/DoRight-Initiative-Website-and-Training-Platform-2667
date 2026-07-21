# Admin App Shared Components Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract three pieces of scaffolding that six admin management pages currently duplicate — the modal shell, the Quill editor config, and the search/filter bar row — into shared components, with zero visual or behavioral change.

**Architecture:** Two new presentational components (`src/components/admin/AdminModal.jsx`, `src/components/admin/SearchFilterBar.jsx`) and one shared config module (`src/lib/quillConfig.js`). Each of the six pages (`BlogManagement.jsx`, `EventManagement.jsx`, `WebinarManagement.jsx`, `CourseManagement.jsx`, `GalleryManagement.jsx`, `LeadsManagement.jsx`) is then updated to import and use these instead of its own hand-rolled copy. Each page keeps 100% of its own data-fetching, form state, and field logic — only the shared shell/scaffolding markup moves.

**Tech Stack:** React, Tailwind CSS, framer-motion (for the modal's entrance animation), react-icons/fi.

**Testing note:** This repo has no automated test suite. `npm run build` succeeding, plus a manual before/after comparison confirming the rendered markup and behavior are unchanged, is the verification bar for every task.

**Global constraint — do not change behavior:** None of these three components may introduce new behavior (e.g. click-outside-to-close on the modal, keyboard escape handling) that the original pages didn't already have. This is a lift-and-share refactor, not a feature addition. If you notice an inconsistency between pages (e.g. one page's modal has slightly different classes), preserve each page's own classes on that page — do not silently unify them beyond what's in scope below.

---

### Task 1: Create the three shared components

**Files:**
- Create: `src/lib/quillConfig.js`
- Create: `src/components/admin/AdminModal.jsx`
- Create: `src/components/admin/SearchFilterBar.jsx`

**Step 1: Create the Quill config module**

This is lifted verbatim from `src/pages/admin/BlogManagement.jsx` lines 29-46 (identical in `EventManagement.jsx` and `WebinarManagement.jsx` too — verify this yourself by reading those two files' `quillModules`/`quillFormats` definitions before writing this file, in case of any drift).

```javascript
export const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ]
};

export const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'align',
  'link', 'image'
];
```

**Step 2: Create the modal shell component**

This is lifted from `BlogManagement.jsx` lines 275-281 and 395-396 (the outer `{showModal && (...)}` wrapper, the backdrop `<div>`, and the animated card `<motion.div>`) — identical in shape across all six target pages, with only the card's max-width class varying (`max-w-2xl` in most places, `max-w-lg` in `LeadsManagement.jsx`'s referral-creation modal).

```jsx
import React from 'react';
import { motion } from 'framer-motion';

const AdminModal = ({ isOpen, maxWidth = 'max-w-2xl', children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AdminModal;
```

Note: this component takes no `onClose` prop and has no backdrop click handler — none of the six pages currently support click-outside-to-close (each has its own explicit Cancel/X button inside `children`), so adding one would be new behavior, out of scope. `isOpen` fully controls rendering; each page keeps its own `showModal`/`setShowModal` state and passes `isOpen={showModal}`.

**Step 3: Create the search/filter bar component**

This is lifted from `BlogManagement.jsx` lines 195-217 — the outer flex row, the search input with its `FiSearch` icon, and the filter `<select>`. Some pages have more than one filter dropdown (e.g. `LeadsManagement.jsx`), so this component accepts an array of filter configs rather than a single one.

```jsx
import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch } = FiIcons;

const SearchFilterBar = ({ searchValue, onSearchChange, searchPlaceholder = 'Search...', filters = [] }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
      <div className="relative w-full sm:w-64">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
        <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {filters.map((filter, index) => (
        <select
          key={index}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400"
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
};

export default SearchFilterBar;
```

**Step 4: Verify**

```bash
npm run build
```

Expected: succeeds (these are new, unimported files — this only confirms no syntax errors).

**Step 5: Commit**

```bash
git add src/lib/quillConfig.js src/components/admin/AdminModal.jsx src/components/admin/SearchFilterBar.jsx
git commit -m "feat: add shared AdminModal, SearchFilterBar, and quillConfig for admin pages"
```

---

### Task 2: Refactor BlogManagement.jsx (fully-worked reference example)

**Files:**
- Modify: `src/pages/admin/BlogManagement.jsx`

This task is fully specified because this exact file was read in full to write Task 1. Tasks 3-7 apply the identical pattern to other files that follow the same shape but weren't individually transcribed here — read each of those files yourself before editing, and use this task as your reference for what "done" looks like.

**Step 1: Update imports**

Replace:

```javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import MediaUpload from '../../components/admin/MediaUpload';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } = FiIcons;
```

With:

```javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import MediaUpload from '../../components/admin/MediaUpload';
import AdminModal from '../../components/admin/AdminModal';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { quillModules, quillFormats } from '../../lib/quillConfig';

const { FiPlus, FiEdit2, FiTrash2, FiEye } = FiIcons;
```

(`FiSearch` is dropped from this file's destructure since `SearchFilterBar` now owns that icon; keep `FiPlus`/`FiEdit2`/`FiTrash2`/`FiEye` since they're still used directly in this file's own JSX.)

**Step 2: Remove the now-duplicated Quill config**

Delete these lines entirely (now imported from `quillConfig.js` instead):

```javascript
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

```

**Step 3: Replace the search/filter row**

Replace:

```javascript
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
```

With:

```javascript
        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search posts..."
          filters={[{
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' }
            ]
          }]}
        />
```

**Step 4: Replace the modal wrapper**

Replace the opening:

```javascript
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
```

With:

```javascript
      {/* Modal */}
      <AdminModal isOpen={showModal}>
        <h2 className="text-2xl font-bold mb-4">
```

And the closing:

```javascript
            </form>
          </motion.div>
        </div>
      )}
```

With:

```javascript
            </form>
      </AdminModal>
```

(Indentation of the lines between the opening and closing tags can stay as-is — React/JSX doesn't care about whitespace-only indentation drift, and a strict re-indent of the whole block is optional cleanup, not required for this task. If your editor auto-formats it, that's fine too.)

**Step 5: Verify**

```bash
npm run build
```

Expected: succeeds, no new errors/warnings.

**Step 6: Manual review**

Read the final file and confirm:
- [ ] `quillModules`/`quillFormats` are imported, not locally defined
- [ ] The search/filter row renders via `<SearchFilterBar>` with the exact same options/labels as before
- [ ] The modal renders via `<AdminModal isOpen={showModal}>`, and `editingPost ? 'Edit Post' : 'Create New Post'` heading, the full form, and the Cancel/Submit buttons are all still present unchanged inside it
- [ ] `ReactQuill` usage inside the form is untouched (still references `quillModules`/`quillFormats`, now from the import)
- [ ] No unused imports remain (`FiSearch` should no longer be imported from `FiIcons` in this file)

**Step 7: Commit**

```bash
git add src/pages/admin/BlogManagement.jsx
git commit -m "refactor: use shared AdminModal/SearchFilterBar/quillConfig in BlogManagement"
```

---

### Task 3: Refactor EventManagement.jsx

**Files:**
- Modify: `src/pages/admin/EventManagement.jsx`

**Step 1:** Read the file in full. It has the same shape as `BlogManagement.jsx` (Task 2): a `quillModules`/`quillFormats` definition, a search+status-filter row (`searchTerm`/`statusFilter` or similarly named state — use whatever the file actually calls them), and a modal wrapped in the same `fixed inset-0 bg-black bg-opacity-50...` / `bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto` classes.

**Step 2:** Apply the identical four substitutions from Task 2, adapted to this file's actual variable names, filter options, and form fields:
- Import `AdminModal`, `SearchFilterBar` from `../../components/admin/`, and `quillModules`/`quillFormats` from `../../lib/quillConfig`; drop the local `quillModules`/`quillFormats` definition and the `FiSearch` destructure if `SearchFilterBar` is now the only thing using it.
- Replace the search+filter row with `<SearchFilterBar searchValue={...} onSearchChange={...} searchPlaceholder="..." filters={[...]} />`, preserving the exact placeholder text and filter options/labels already in the file — do not change what the filter actually filters by, only how the row is rendered.
- Replace the modal's opening/closing wrapper with `<AdminModal isOpen={showModal}>...</AdminModal>`, preserving everything between unchanged (including the `ReactQuill` usage, which should now reference the imported `quillModules`/`quillFormats`).

**Step 3:** `npm run build`, expect success.

**Step 4:** Manual review — same checklist as Task 2, Step 6, adapted to this file.

**Step 5: Commit**

```bash
git add src/pages/admin/EventManagement.jsx
git commit -m "refactor: use shared AdminModal/SearchFilterBar/quillConfig in EventManagement"
```

---

### Task 4: Refactor WebinarManagement.jsx

**Files:**
- Modify: `src/pages/admin/WebinarManagement.jsx`

**Step 1:** Read the file in full. Known from prior inspection: it has `searchTerm` and `publishedFilter` state (values `'all'`/`'published'`/`'draft'`, filtering on an `is_published` boolean column rather than a 3-state status column — this is different from Blog/Event's filter semantics, but the *row layout* is the same, which is all `SearchFilterBar` needs to know about). It also has its own `quillModules`/`quillFormats` definition and a modal in the same shell shape.

**Step 2:** Apply the same four substitutions as Task 2/3, preserving this file's actual `publishedFilter` values/labels exactly as they exist today (e.g. if the options are "All", "Published", "Draft" — keep those exact labels, don't invent new ones).

**Step 3:** `npm run build`, expect success.

**Step 4:** Manual review — same checklist pattern as Task 2.

**Step 5: Commit**

```bash
git add src/pages/admin/WebinarManagement.jsx
git commit -m "refactor: use shared AdminModal/SearchFilterBar/quillConfig in WebinarManagement"
```

---

### Task 5: Refactor CourseManagement.jsx

**Files:**
- Modify: `src/pages/admin/CourseManagement.jsx`

**Step 1:** Read the file in full (it's short — 178 lines). It does not use `ReactQuill`/Quill at all (confirmed: no `ReactQuill` references in this file), so this task only touches the modal shell and the search/filter row — there is no `quillConfig` import to add here.

**Step 2:**
- Import `AdminModal` and `SearchFilterBar` from `../../components/admin/`.
- Replace the search+filter row with `<SearchFilterBar ... />`, preserving this file's actual filter field(s)/options exactly as they exist today.
- Replace the modal's opening/closing wrapper with `<AdminModal isOpen={...}>...</AdminModal>` (confirm the actual modal-open state variable's name in this file — it may not be called `showModal`).

**Step 3:** `npm run build`, expect success.

**Step 4:** Manual review — same checklist pattern as Task 2 (minus the Quill-specific checks, since this file has none).

**Step 5: Commit**

```bash
git add src/pages/admin/CourseManagement.jsx
git commit -m "refactor: use shared AdminModal/SearchFilterBar in CourseManagement"
```

---

### Task 6: Refactor GalleryManagement.jsx

**Files:**
- Modify: `src/pages/admin/GalleryManagement.jsx`

**Step 1:** Read the file in full. Known from prior inspection: it uses `MediaUpload` (not `ReactQuill` — no Quill config to touch here) and has one modal in the same shell shape (`fixed inset-0 bg-black bg-opacity-50...` / `bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`, confirmed identical to Blog/Leads via direct comparison). It also has a search/filter row, though confirm its exact filter field(s) by reading the file — it may filter by category/media-type rather than a status enum.

**Step 2:**
- Import `AdminModal` and `SearchFilterBar` from `../../components/admin/`.
- Replace the search+filter row with `<SearchFilterBar ... />`, preserving this file's actual filter options exactly as they exist today.
- Replace the modal's opening/closing wrapper with `<AdminModal isOpen={...}>...</AdminModal>`.

**Step 3:** `npm run build`, expect success.

**Step 4:** Manual review — same checklist pattern as Task 2 (minus Quill-specific checks).

**Step 5: Commit**

```bash
git add src/pages/admin/GalleryManagement.jsx
git commit -m "refactor: use shared AdminModal/SearchFilterBar in GalleryManagement"
```

---

### Task 7: Refactor LeadsManagement.jsx

**Files:**
- Modify: `src/pages/admin/LeadsManagement.jsx`

This file is the most distinct of the six — it has **two** modals (a lead detail/status-update modal, and a "New Referral" creation modal added in Phase 5) and more state than the others (status-advancement, signed-URL photo fetch). Read the whole file (480 lines) before touching anything.

**Step 1: Identify what's in scope vs. not**

In scope (genuinely identical scaffolding, per prior inspection — both this file's modals already use the exact `fixed inset-0 bg-black bg-opacity-50...` / `bg-white dark:bg-gray-800 rounded-lg p-6 ... w-full max-h-[90vh] overflow-y-auto` shell, one at `max-w-2xl`, the referral modal at `max-w-lg`):
- Both modals' outer shell → `<AdminModal isOpen={...} maxWidth="...">`.
- The top-level search/status-filter row (the one filtering the leads *list*, not anything inside a modal) → `<SearchFilterBar ... />`.

Out of scope (bespoke to this page, do not touch beyond what wrapping in `AdminModal` requires):
- The status-advancement `<select>` inside the detail modal (`new`/`contacted`/`integrated`/`full_member`) — this is domain logic, not a list filter. Leave it exactly as-is.
- The signed-URL photo fetch/display logic.
- The referral-creation modal's form fields (Full Name, Email, Phone, Sub-committee, Referred By).

**Step 2:** Apply the substitutions:
- Import `AdminModal` and `SearchFilterBar` from `../../components/admin/` (no `quillConfig` needed — this file has no `ReactQuill` usage).
- Replace the top-level search/filter row with `<SearchFilterBar ... />`, preserving the exact filter options already in the file.
- Wrap the detail modal's content in `<AdminModal isOpen={...} maxWidth="max-w-2xl">...</AdminModal>`.
- Wrap the referral-creation modal's content in `<AdminModal isOpen={...} maxWidth="max-w-lg">...</AdminModal>`.

**Step 3:** `npm run build`, expect success.

**Step 4: Manual review**

- [ ] Both modals still render their full original content unchanged (status select, photo signed-URL display, referral form fields all present)
- [ ] The search/filter row's options match what existed before
- [ ] Nothing about the status-advancement logic, timestamp-stamping, or signed-URL fetch was altered
- [ ] No unused imports remain

**Step 5: Commit**

```bash
git add src/pages/admin/LeadsManagement.jsx
git commit -m "refactor: use shared AdminModal/SearchFilterBar in LeadsManagement"
```
