# Database Setup Guide

The database schema lives in `supabase/migrations/` and is the CLI-tracked source of truth for
this project. There is no in-app migration runner, no `npm run migrate`, and no seed script —
schema changes are applied to Supabase directly, either with the Supabase CLI or through the
Studio SQL Editor.

## Option A: Supabase CLI (recommended)

1. [Install the Supabase CLI](https://supabase.com/docs/guides/cli) if you don't have it.
2. Log in and link this repo to your Supabase project:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```
   Your project ref is the subdomain in your project URL: `https://<project-ref>.supabase.co`.
3. Push every migration in `supabase/migrations/` to the linked project:
   ```bash
   supabase db push
   ```
   This applies migrations in filename (timestamp) order and records which ones have run.

## Option B: Supabase Studio SQL Editor (manual)

If you don't want to install the CLI:

1. Open your project's SQL Editor: Supabase Dashboard → your project → **SQL Editor**.
2. Open each file in `supabase/migrations/` **in filename order** (the leading timestamp is the
   order they must run in — later migrations alter or patch tables created by earlier ones).
3. For each file: click **"+ New query"**, paste the entire file's contents, click **Run**, and
   wait for a success message before moving to the next file.
4. Repeat for every migration in the folder.

Both options are equivalent — the CLI just automates what Option B does by hand and tracks which
migrations have already been applied so you don't re-run them.

## Verifying the Schema Applied

In Supabase Dashboard → **Database** → **Tables**, confirm the expected tables exist (core ones
include `users`, `courses`, `modules`, `lessons`, `enrollments`, `progress`, `blog_posts`,
`gallery_items`, `pages`, `page_sections`, `events`, `webinars`). In **Database** → **Policies**,
confirm RLS policies are attached to each table — every table in this schema is expected to have
RLS enabled.

## Creating Admin / Staff Accounts

There is no `create-users` script anymore. To give someone an elevated role (admin, instructor,
etc.):

1. Have them sign up normally through the app (this creates their `auth.users` entry via
   Supabase Auth) — **or** invite them directly from Supabase Dashboard → **Authentication** →
   **Users** → **Invite user**.
2. A matching profile row in the `public.users` table is **not** created automatically — there
   is no database trigger wiring `auth.users` inserts to `public.users` in this schema today.
   Add or update their `public.users` row directly (Table Editor, or SQL):
   ```sql
   -- After they've signed up and you have their auth user id:
   update public.users
   set role = 'admin', is_active = true
   where id = 'their-auth-user-id';
   ```
   The app's own read of this table (`src/context/AuthContext.jsx`) is what determines a
   logged-in user's role and permissions in the UI, and RLS policies key off the same
   `public.users.role` column via the `public.is_admin()` / `public.has_role()` helper functions.
3. If email confirmation is enabled for your project (Authentication → Providers → Email →
   "Confirm email"), the user must confirm their email before `supabase.auth.signInWithPassword`
   will succeed.

## Rerunning Migrations / "relation already exists"

If you re-run a migration file that's already applied, you may see `relation already exists` or
`type already exists` — most migrations in this folder use `IF NOT EXISTS` guards, so this is
usually safe to ignore. Using `supabase db push` avoids this altogether since it tracks what's
already applied.

To start a project's schema over from nothing (⚠️ destroys all data in that project):
```sql
drop schema public cascade;
create schema public;
grant all on schema public to postgres;
grant all on schema public to public;
```
Then re-run every migration from the start.

## Security Notes

- Never commit a project's `service_role` key anywhere — this repo doesn't use it at all (the
  frontend only ever uses the `anon` key, protected by RLS).
- Review RLS policies before going live; they are the only access-control layer in this
  architecture.
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common RLS and schema-cache errors.
