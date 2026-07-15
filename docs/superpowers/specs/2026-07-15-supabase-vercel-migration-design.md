# Supabase-Only Backend + Vercel Deployment Migration

Status: Approved (design phase)
Date: 2026-07-15

## Goal

Restructure the DoRight platform so that:
1. Supabase is the entire backend (Postgres, Auth, Storage) — no separate application server.
2. Every cPanel deployment artifact is removed.
3. Vercel is the main deployment target for the frontend.

## Current State (as found)

- **Frontend**: React/Vite SPA in `src/`, using `HashRouter`. Already calls Supabase directly in some places (`src/lib/supabase.js`), but routes blog, gallery, uploads, admin, and a SQL-migration admin panel through a custom Express backend via `src/services/api.js` (`ApiService`, relative `/api` in prod, `localhost:4000/api` in dev).
- **Backend**: Standalone Express app in `backend/` (`server.js` + `routes/*`). The live code path (`config/supabase.js`, `middleware/supabaseAuth.js`, `routes/supabaseAuth.js`, `routes/supabaseUsers.js`, `routes/adminBlog.js`, `routes/adminGallery.js`, `routes/upload.js`, `routes/migrations.js`, `routes/cms.js`, `routes/gallery.js`, `routes/blog.js`, `routes/cleanBlog.js`, `routes/publicBlog.js`) already uses Supabase as its data store, authenticating requests via `supabaseAdmin.auth.getUser(token)` and checking a `role` column on a `public.users` profile row.
- **Dead/legacy code**: `backend/routes/auth.js`, `backend/routes/users.js`, `backend/middleware/auth.js`, `backend/config/database.js`, `backend/config/redis.js`, `backend/routes/test-blog.js` — a raw Postgres/Redis/bcrypt/custom-JWT auth stack that is not wired into `server.js` and predates the Supabase migration.
- **Database**: `supabase/migrations/` already holds the real, current schema (RLS already partially enabled — `enable_users_rls`, `fix_users_rls_policies_v2`, `fix_users_rls_complete`, `fix_users_rls_infinite_recursion`, `fix_blog_gallery_rls_policies`, etc.).
- **File uploads**: `multer` writes to local disk on the Express server (`backend/uploads`), served via `express.static('/uploads')`.
- **In-app migration runner**: `backend/routes/migrations.js` lets an authenticated admin list/run SQL files from `backend/migrations/supabase` through the API.
- **cPanel/self-host deployment artifacts**: `CPANEL_DEPLOYMENT.md`, `CPANEL_DEPLOYMENT_CHECKLIST.md`, `FINAL_CPANEL_DEPLOYMENT_GUIDE.md`, `deploy.sh`, `start.js` (explicitly commented "cPanel Node.js Application Startup Script"), `health`, `nginx.conf`, `docker-compose.yml`, `Dockerfile.frontend`, `backend/Dockerfile`.
- **Superseded root SQL files**: `complete_fresh_setup.sql`, `complete_migration.sql`, `complete_setup_v2.sql`, `step1_basic_tables.sql`, `step2_enrollments_table.sql`, `step2b_create_lessons.sql`, `missing_tables_only.sql`, `simple_enrollments_only.sql`, `blog_gallery_migration.sql`, `blog_g` — ad-hoc SQL predating the `supabase/migrations/` folder.
- **Docs describing the old setup**: `README.md`, `DATABASE_SETUP.md`, `SETUP_GUIDE.md`, `TROUBLESHOOTING.md`, `QUICK_FIX.md`, `UPLOAD_SYSTEM.md`, `CMS_DOCUMENTATION.md`, `.env.production.example`.
- **Domain**: `doright.ng` currently points at cPanel hosting.

## Decisions

These were confirmed with the user during design:

| Decision | Choice |
|---|---|
| Backend replacement | Pure Supabase — delete Express entirely, frontend calls Supabase directly, RLS enforces access control |
| In-app SQL migration runner | Retire it — schema changes go through Supabase CLI / Studio SQL editor instead |
| File uploads | Supabase Storage, direct-from-client upload, secured by Storage RLS policies |
| Domain/DNS cutover | In scope — plan includes moving `doright.ng` DNS to Vercel |
| Rollout strategy | Big-bang cutover on a branch, verified via Vercel preview, then single cutover + cPanel decommission |

## Target Architecture

- **Frontend**: React/Vite SPA, statically built (`vite build` → `dist`), deployed to Vercel. `HashRouter` means no SPA rewrite rules are required in Vercel config.
- **Backend**: Supabase only —
  - **Postgres** via `supabase/migrations/` (already the source of truth).
  - **Auth** via Supabase Auth (already in use) — `public.users.role` continues to be the authorization signal, now enforced in RLS instead of Express middleware.
  - **Storage** for uploads (new), with bucket-level RLS policies.
  - **Edge Functions**: not expected to be needed. If, during implementation, something is found that genuinely requires `service_role` privilege that RLS cannot express, it becomes a narrowly-scoped Edge Function — this is an exception path, not the default.
- No Node process runs in production. No Docker, no nginx, no PM2, no cPanel Node app.

## Work Breakdown

### 1. Authorization via RLS
Audit existing RLS policies on `users`, `blog_posts`/blog tables, gallery tables, webinars/events, and CMS content tables. For every write path that the Express `requireRole(['admin'])` middleware currently gates, ensure an equivalent RLS policy exists (`EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')`, reusing whatever helper function the existing "infinite recursion" fix migration already established, rather than re-deriving a new one). Add any missing policies as new migrations in `supabase/migrations/`.

### 2. Frontend: remove `src/services/api.js`
Replace every call site currently going through `ApiService` with direct `supabase.from(...)` / `supabase.auth...` calls, using the corresponding Express route (`adminBlog.js`, `adminGallery.js`, `cms.js`, `gallery.js`, `blog.js`, `cleanBlog.js`, `publicBlog.js`, `supabaseUsers.js`) as the reference for exact query/filter/shape behavior so nothing regresses. Remove the admin panel's SQL-migration UI page along with it.

### 3. File uploads → Supabase Storage
Create Storage bucket(s) (e.g. `gallery`, `blog-media`) with RLS policies mirroring current access rules (admin-only write, public read where content is public today). Replace `multer`-based upload components with direct `supabase.storage.from(bucket).upload(...)` calls. Check `backend/uploads` for any real files that need to be migrated into the new bucket(s) before the backend is deleted.

### 4. Delete the backend and related infra
Remove `backend/` entirely (including the dead legacy auth/database/redis code). Remove cPanel artifacts (`CPANEL_DEPLOYMENT*.md`, `deploy.sh`, `start.js`, `health`, `nginx.conf`) and Docker/self-host artifacts (`docker-compose.yml`, `Dockerfile.frontend`). Diff the superseded root SQL files against `supabase/migrations/` to confirm nothing is un-migrated, then delete them.

### 5. Vercel project setup
Configure Vercel project: framework preset Vite, build command `vite build`, output directory `dist`. Set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as Vercel environment variables (Production + Preview), not committed to the repo. Confirm Git integration produces preview deployments per branch/PR.

### 6. Documentation rewrite
Rewrite `README.md`, `DATABASE_SETUP.md`, `SETUP_GUIDE.md`, `TROUBLESHOOTING.md`, `UPLOAD_SYSTEM.md`, `CMS_DOCUMENTATION.md` to describe the Supabase + Vercel setup. Retire `QUICK_FIX.md` if it's cPanel-specific troubleshooting. Rewrite `.env.production.example` to only list Vite/Supabase vars relevant to a Vercel deployment.

### 7. Domain cutover
Add `doright.ng` (and `www`) to the Vercel project. Update registrar DNS records per Vercel's current instructions. Verify SSL issuance and propagation.

### 8. Rollout sequence
1. Do all of the above on a branch.
2. Verify against the Vercel preview deployment: every public flow, every admin CRUD flow (blog, gallery, users), auth login, and uploads — directly against the real Supabase project. RLS mistakes fail silently as empty results rather than errors, so this needs to be a deliberate pass through each flow, not just "does it build."
3. Merge to `main` → Vercel production deployment (on the `*.vercel.app` URL).
4. Cut DNS over to Vercel.
5. Once verified live on the custom domain, decommission the cPanel hosting account.

## Open Items to Resolve During Implementation

- Whether `backend/uploads` currently contains real files that must be migrated into Supabase Storage.
- Whether existing RLS policies already fully cover every admin write path, or whether new policies must be authored per table.
- Whether `QUICK_FIX.md` and `TROUBLESHOOTING.md` contain anything worth preserving in rewritten form vs. being purely cPanel-era noise.

## Out of Scope

- Any new product features. This is a pure infrastructure/architecture migration.
- Changing the Supabase project itself (same project, same `supabase/migrations/` history).
