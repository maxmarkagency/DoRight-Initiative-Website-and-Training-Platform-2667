# Supabase-Only Backend + Vercel Deployment Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Delete the unused Express backend and every cPanel deployment artifact, and configure Vercel as the sole deployment target for the frontend, which already talks to Supabase directly.

**Architecture:** Investigation (see `docs/superpowers/specs/2026-07-15-supabase-vercel-migration-design.md`) found that the frontend already migrated itself off the Express backend for every live feature (auth, blog, gallery, media storage, training/enrollment data all call Supabase directly already). The only genuinely live remnant of the old API is one dead-code trail (`cmsService.js` → `DynamicSection.jsx`, which is itself unused by any page) and one broken import in `MediaManagement.jsx`. So this plan is mostly deletion: remove `backend/`, remove cPanel/Docker artifacts, remove now-pointless dead frontend code, rewrite docs, then configure Vercel + cut over DNS.

**Tech Stack:** React 18 + Vite, `@supabase/supabase-js`, Vercel (static hosting), Supabase (Postgres + Auth + Storage).

**Testing note:** This repo has no automated test runner (no Jest/Vitest/Playwright configured). Steps below use manual verification via `npm run dev` / the browser instead of automated test commands — do not introduce a new test framework as part of this migration; that's out of scope.

---

### Task 1: Remove the dead CMS-fetch trail (`cmsService.js` + `DynamicSection.jsx`)

**Files:**
- Delete: `src/services/cmsService.js`
- Delete: `src/components/DynamicSection.jsx`

**Why these are safe to delete:** `cmsService.js` only has one real caller anywhere in `src` — `DynamicSection.jsx`'s `getSection()` call. `DynamicSection.jsx` itself is exported but never imported by any page or component in `src` (confirmed by grep). Both only existed to talk to the Express `/api/cms/*` routes being deleted in Task 4, and nothing renders them today.

**Step 1: Confirm nothing else references them (safety check before deleting)**

Run:
```bash
grep -rn "cmsService\|DynamicSection" src --include=*.jsx --include=*.js
```
Expected: only matches inside `src/services/cmsService.js` and `src/components/DynamicSection.jsx` themselves (their own definitions/exports). If you find a real import from a page or another component, STOP and re-scope this task — do not delete.

**Step 2: Delete the files**

```bash
git rm src/services/cmsService.js src/components/DynamicSection.jsx
```

**Step 3: Verify the app still builds and runs**

```bash
npm run dev
```
Expected: Vite starts cleanly with no "failed to resolve import" errors for `cmsService` or `DynamicSection`. Stop the dev server after confirming (Ctrl+C).

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused CMS API client and DynamicSection component"
```

---

### Task 2: Fix `MediaManagement.jsx`'s dead import and add the missing `supabase` import

**Files:**
- Modify: `src/pages/admin/MediaManagement.jsx`

**Context:** This file already calls `supabase.storage.from('media-library')...` directly (list/upload/remove/getPublicUrl) but only imports `apiService` from `../../services/api` — it never imports `supabase`. That import is dead (no `apiService.*` call exists in the file) and the `supabase` calls would throw a `ReferenceError` at runtime today. Since we're deleting `src/services/api.js` in Task 3, this file's dead import must go first (or the build will fail on a missing module), and the missing `supabase` import needs adding regardless.

**Step 1: Open the file and inspect the current imports**

Read `src/pages/admin/MediaManagement.jsx` lines 1-10 to see the exact current import block before editing (it may have shifted slightly since the design phase — confirm the `apiService` import line and that `supabase` is indeed absent).

**Step 2: Replace the import**

Find:
```jsx
import apiService from '../../services/api';
```
Replace with:
```jsx
import supabase from '../../lib/supabase';
```
(Adjust the relative path if the file's actual location differs from `src/pages/admin/` — verify via the path confirmed in Step 1.)

**Step 3: Verify manually in the browser**

```bash
npm run dev
```
Log in as an admin user, navigate to the Media Management admin page, and confirm:
- The file list loads (calls `supabase.storage.from('media-library').list(...)`).
- Uploading a file works.
- Deleting a file works.

If the `media-library` bucket doesn't exist or access is denied, note that as a finding but do not block this task on it — bucket provisioning is verified separately in Task 9.

**Step 4: Commit**

```bash
git add src/pages/admin/MediaManagement.jsx
git commit -m "fix: import supabase client in MediaManagement instead of dead apiService"
```

---

### Task 3: Delete the dead `ApiService` (`src/services/api.js`)

**Files:**
- Delete: `src/services/api.js`

**Step 1: Confirm no remaining imports**

```bash
grep -rn "services/api'" src --include=*.jsx --include=*.js
```
Expected: no results (Task 2 removed the only real import).

**Step 2: Delete the file**

```bash
git rm src/services/api.js
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: build succeeds with no unresolved-import errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused Express-backed ApiService"
```

---

### Task 4: Delete the entire Express backend

**Files:**
- Delete: `backend/` (entire directory)

**Context:** Every route in `backend/routes/` is unreachable from the frontend today — auth, blog, gallery, CMS, users, and uploads are all already served by direct Supabase calls (see design spec). `backend/routes/auth.js`, `backend/middleware/auth.js`, `backend/config/database.js`, and `backend/config/redis.js` are additionally dead code even from the Express app's own perspective (never wired into `server.js`).

**Step 1: Confirm nothing in `src/` references the backend's HTTP API**

```bash
grep -rn "localhost:4000\|VITE_API_URL\|/api/" src --include=*.jsx --include=*.js
```
Expected: no results (or only comments) after Tasks 1-3. If you find a live call site, STOP and investigate before deleting — do not proceed with this task until resolved.

**Step 2: Delete the backend directory**

```bash
git rm -r backend
```

**Step 3: Verify the frontend build is unaffected**

```bash
npm run build
```
Expected: succeeds — the frontend build never depended on `backend/` (separate `package.json`, never imported cross-directory).

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete unused Express backend (frontend already calls Supabase directly)"
```

---

### Task 5: Delete cPanel deployment artifacts

**Files:**
- Delete: `CPANEL_DEPLOYMENT.md`
- Delete: `CPANEL_DEPLOYMENT_CHECKLIST.md`
- Delete: `FINAL_CPANEL_DEPLOYMENT_GUIDE.md`
- Delete: `deploy.sh`
- Delete: `start.js` (labeled in its own header comment as "cPanel Node.js Application Startup Script")
- Delete: `health` (cPanel health-check script)
- Delete: `nginx.conf`

**Step 1: Delete the files**

```bash
git rm CPANEL_DEPLOYMENT.md CPANEL_DEPLOYMENT_CHECKLIST.md FINAL_CPANEL_DEPLOYMENT_GUIDE.md deploy.sh start.js health nginx.conf
```

**Step 2: Verify nothing referenced them**

```bash
grep -rn "start\.js\|nginx\.conf\|deploy\.sh" package.json src --include=*.jsx --include=*.js 2>/dev/null
```
Expected: no results (root `package.json` scripts only reference `vite`).

**Step 3: Commit**

```bash
git commit -m "chore: remove cPanel deployment scripts and docs"
```

---

### Task 6: Delete Docker/self-host artifacts

**Files:**
- Delete: `docker-compose.yml`
- Delete: `Dockerfile.frontend`

**Context:** `docker-compose.yml` orchestrates a local Postgres container, the now-deleted `backend/` Express app, and a `./admin` React-Admin app that doesn't exist in this repo — it's stale/vestigial regardless of the cPanel question. `Dockerfile.frontend` only existed to containerize the frontend for that same compose stack.

**Step 1: Delete the files**

```bash
git rm docker-compose.yml Dockerfile.frontend
```

**Step 2: Commit**

```bash
git commit -m "chore: remove Docker self-host artifacts for the deleted backend stack"
```

---

### Task 7: Delete stray debug/test files that target the deleted backend

**Files:**
- Delete: `test_api.js` (hardcodes `http://localhost:4000`, tests the deleted Express API)
- Delete: `test_login.html` (static HTML hitting the deleted backend's login endpoint)
- Delete: `test_complete.html`
- Delete: `test.txt`

**Step 1: Confirm each file's content still matches this description**

```bash
head -5 test_api.js test_login.html test_complete.html test.txt
```
Confirm each is indeed a standalone debug artifact (not referenced by `package.json` scripts or CI) before deleting.

**Step 2: Delete**

```bash
git rm test_api.js test_login.html test_complete.html test.txt
```

**Step 3: Commit**

```bash
git commit -m "chore: remove stray debug scripts for the deleted backend"
```

**Note — leave `public.yaml` alone.** It's an OpenAPI spec for an unrelated third-party API ("Podcast.co Public API") that has nothing to do with this project's backend or cPanel deployment. It's outside this migration's scope; flag it to the user separately rather than deleting it here.

---

### Task 8: Clean up superseded root-level SQL files

**Files to evaluate for deletion:**
- `complete_fresh_setup.sql`, `complete_migration.sql`, `complete_setup_v2.sql`, `step1_basic_tables.sql`, `step2_enrollments_table.sql`, `step2b_create_lessons.sql`, `missing_tables_only.sql`, `simple_enrollments_only.sql`, `blog_gallery_migration.sql`, `blog_g`
- Also: `src/supabase/migrations/1718886001000-add_blog_gallery.sql` and its parent `src/supabase/` directory — a duplicate, CLI-untracked migrations folder (the real one Supabase CLI applies is `supabase/migrations/` at repo root). Confirmed nothing in `src` imports from `src/supabase/`.

**Do NOT touch** `supabase/migrations/*.sql` (the root, CLI-tracked folder) — those are the applied migration history and are out of scope for deletion in this task, even the two duplicate/orphaned-looking ones noted during investigation (`20251213073224_create_cms_content_tables.sql` defines an unused parallel schema, but removing an already-applied migration file doesn't undo it in the live database and risks confusing the migration chain — leave it, just don't build anything new on it).

**Step 1: For each root-level ad-hoc SQL file, confirm its tables already exist in `supabase/migrations/`**

```bash
grep -oE "CREATE TABLE( IF NOT EXISTS)? [a-zA-Z_.\"]+" complete_fresh_setup.sql complete_migration.sql complete_setup_v2.sql step1_basic_tables.sql step2_enrollments_table.sql step2b_create_lessons.sql missing_tables_only.sql simple_enrollments_only.sql blog_gallery_migration.sql blog_g 2>/dev/null | sort -u
```
For each table name found, confirm it's also created somewhere under `supabase/migrations/*.sql`:
```bash
grep -rl "CREATE TABLE.*<table_name>" supabase/migrations/
```
If any table exists ONLY in a root-level file and nowhere in `supabase/migrations/`, STOP — that table may not actually be provisioned in the live database via the tracked migration chain. Flag it to the user before deleting; do not silently drop the only record of it.

**Step 2: Once confirmed superseded, delete**

```bash
git rm complete_fresh_setup.sql complete_migration.sql complete_setup_v2.sql step1_basic_tables.sql step2_enrollments_table.sql step2b_create_lessons.sql missing_tables_only.sql simple_enrollments_only.sql blog_g blog_gallery_migration.sql
git rm -r src/supabase
```

**Step 3: Commit**

```bash
git commit -m "chore: remove superseded ad-hoc SQL files and duplicate migrations folder"
```

---

### Task 9: Confirm RLS and Storage already cover everything the frontend needs

**No code changes expected in this task** — it's a verification pass, since the investigation found existing RLS policies (using the `public.is_admin()` helper from `supabase/migrations/20251213072605_fix_users_rls_infinite_recursion.sql` and `20260107101011_fix_users_schema_and_helpers.sql`) already fully cover admin-only writes on `users`, `blog_posts`, `gallery_items`, and every CMS table. Do not author new RLS migrations unless this verification finds a real gap.

**Step 1: Log in as a non-admin (or logged-out) user and confirm you cannot write**

In the browser, without an admin session, attempt (via devtools console, using the app's own `supabase` client) an insert against `blog_posts` or `gallery_items`. Expected: RLS rejects it (a Postgres permission-denied error or an empty/error response), not a silent success.

**Step 2: Log in as an admin and confirm the existing admin CRUD pages work end-to-end**

Walk through: Blog Management (create/edit/delete a post), Gallery Management (create/edit/delete an item), Media Management (upload/delete a file — from Task 2). Expected: all succeed.

**Step 3: Confirm the `media-library` Storage bucket's access policy**

In the Supabase Studio dashboard → Storage → `media-library` bucket → Policies. Confirm there's a policy restricting writes to admins (or authenticated users, per whatever the product actually wants) and note the current state — this bucket was created manually and isn't tracked in `supabase/migrations/`, so this is your only record of its config. If it's fully public-write, flag that to the user as a gap to close (write a Storage RLS policy) before going live — do not silently ship a public-write media bucket.

**Step 4: No commit needed** (verification-only task). If a real gap was found and fixed, commit that fix with a message describing exactly what was missing, e.g. `git commit -m "fix: restrict media-library Storage bucket writes to admins"`.

---

### Task 10: Rewrite documentation for the new setup

**Files:**
- Modify: `README.md`
- Modify: `DATABASE_SETUP.md`
- Modify: `SETUP_GUIDE.md`
- Modify: `TROUBLESHOOTING.md`
- Modify: `UPLOAD_SYSTEM.md`
- Modify: `CMS_DOCUMENTATION.md`
- Delete or rewrite: `QUICK_FIX.md` (read it first — if it's purely cPanel-era troubleshooting with no reusable content, delete it; otherwise rewrite the still-relevant parts)
- Modify: `.env.production.example`

**Step 1: Read each file's current content before rewriting**

These docs currently describe the cPanel/Express setup being deleted. Read each one fully so the rewrite reflects what it actually covers today, rather than guessing.

**Step 2: Rewrite `.env.production.example`**

Replace its content with only what a Vercel + Supabase deployment needs:
```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
VITE_APP_NAME=DoRight LMS
VITE_APP_URL=https://doright.ng
```
Remove `DATABASE_URL`, `JWT_SECRET`, `SMTP_*`, `LOG_LEVEL`, and any other Express-only vars — none of them apply once there's no server process.

**Step 3: Rewrite `README.md`**

Cover: what the project is, the Supabase-only architecture (Postgres + Auth + Storage, no custom backend), local dev (`npm install`, `npm run dev`, required `.env` vars), how schema changes are made (`supabase db push` / Studio SQL editor — no in-app migration runner), and that deployment is via Vercel (link to Task 11/12 details or a new `DEPLOYMENT.md` if you prefer splitting it out).

**Step 4: Rewrite or retire the remaining docs**

- `DATABASE_SETUP.md` → describe the real schema location (`supabase/migrations/`) and how to apply it to a fresh Supabase project.
- `SETUP_GUIDE.md` → local dev setup only (no backend step).
- `TROUBLESHOOTING.md` → keep genuinely reusable Supabase/RLS troubleshooting content, drop cPanel/Express-specific sections.
- `UPLOAD_SYSTEM.md` → describe the Supabase Storage (`media-library` bucket) flow, since `multer` is gone.
- `CMS_DOCUMENTATION.md` → describe the CMS tables and RLS-gated admin CRUD, since the Express `cms.js` endpoints it currently documents are deleted.
- `QUICK_FIX.md` → delete if purely cPanel-era, per Step 1's read.

**Step 5: Commit**

```bash
git add README.md DATABASE_SETUP.md SETUP_GUIDE.md TROUBLESHOOTING.md UPLOAD_SYSTEM.md CMS_DOCUMENTATION.md .env.production.example
git commit -m "docs: rewrite documentation for Supabase-only backend and Vercel deployment"
```
(If `QUICK_FIX.md` was deleted: `git rm QUICK_FIX.md` and include it in the same commit, or a separate `chore:` commit — your call.)

---

### Task 11: Configure the Vercel project

**Files:**
- Create: `vercel.json`

**Step 1: Create `vercel.json`**

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```
No `rewrites` entry is needed — the app uses `HashRouter` (confirmed via git history: "Fix share links for HashRouter"), so all client-side routes live under the `#` fragment and Vercel's default static serving of `index.html` at `/` handles it with no server-side rewrite rules.

**Step 2: Set environment variables in the Vercel dashboard**

In the Vercel project's Settings → Environment Variables, add for both Production and Preview:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use this project's actual values from the root `.env` file (not committed — set them directly in the dashboard, matching how they're already handled for local dev).

**Step 3: Verify a local production build matches what Vercel will build**

```bash
npm run build
npm run preview
```
Open the preview URL and click through the site (public pages, login, an admin CRUD flow) to confirm the production build works before pushing to Vercel.

**Step 4: Commit**

```bash
git add vercel.json
git commit -m "build: add Vercel project configuration"
```

---

### Task 12: Verify on a real Vercel preview deployment

**No file changes** — this is a deployment + manual verification task.

**Step 1: Push the branch and connect it to Vercel**

Push this branch to the remote and import/link the repo in Vercel (or push to trigger a preview build if the project is already linked). Confirm the preview build succeeds using the config from Task 11.

**Step 2: Walk through every flow against the live preview URL**

- Public site: home page, blog list/detail, gallery, training/programs pages.
- Auth: register, login, logout.
- Admin: blog CRUD, gallery CRUD, media upload/delete, any user-management screens.
- Student-facing: training dashboard, courses, certificates (per `TrainingContext.jsx` and the student pages found during investigation).

Since RLS mistakes fail silently as empty results rather than errors, actively check that expected data actually appears — don't just check for the absence of console errors.

**Step 3: Note anything broken**

If anything fails, fix it on this branch and redeploy the preview before proceeding to Task 13. Do not cut over DNS with known-broken flows.

---

### Task 13: Domain cutover and cPanel decommission

**No file changes** — infrastructure/DNS task, done last per the big-bang rollout strategy agreed in the design phase.

**Step 1: Add the domain in Vercel**

In the Vercel project → Settings → Domains, add `doright.ng` and `www.doright.ng`.

**Step 2: Update DNS at the registrar**

Follow the exact records Vercel's dashboard displays at the time (apex via its recommended A/ALIAS record, `www` via `CNAME` to `cname.vercel-dns.com`) — Vercel shows the current required values on the Domains page, use those rather than hardcoding values here that may drift.

**Step 3: Verify propagation and SSL**

Wait for DNS propagation, then confirm `https://doright.ng` serves the Vercel deployment with a valid SSL certificate.

**Step 4: Decommission cPanel**

Once the site is confirmed live and working on the custom domain via Vercel, cancel/decommission the cPanel hosting account.

**Step 5: Merge the branch**

With everything verified live, merge this branch to `main` (if not already merged) so `main` reflects the new architecture going forward.
