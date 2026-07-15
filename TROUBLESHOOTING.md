# Troubleshooting Guide

This app is a Vite/React frontend that talks directly to Supabase — there is no backend server,
so most issues trace back to either the database schema, RLS policies, or environment variables.

## "Could not find the table 'public.X' in the schema cache"

**Cause:** The migrations in `supabase/migrations/` haven't been applied to your Supabase
project yet.

**Fix:** Follow [DATABASE_SETUP.md](./DATABASE_SETUP.md) — apply migrations via `supabase db
push` or by running each file in `supabase/migrations/` (in filename order) through the Studio
SQL Editor.

## "Invalid login credentials"

This means Supabase Auth rejected the email/password combination. Check, in order:

1. **Does the user exist?** Supabase Dashboard → **Authentication** → **Users**.
2. **Is email confirmation blocking them?** Authentication → Providers → Email → "Confirm email".
   If it's enabled and the user hasn't clicked the confirmation link, sign-in fails.
3. **Is the password actually correct?** There's no password-reset flow to fall back on here
   except Supabase's own (Authentication → Users → select user → send password reset).

## App loads, but no data shows up ("No courses yet", empty gallery, etc.)

RLS mistakes fail **silently** — a denied query returns an empty result, not an error. Before
assuming something is broken:

1. Confirm rows actually exist in the table (Supabase Dashboard → Database → Table Editor).
2. Confirm the logged-in user has the role the RLS policy expects — check their row in
   `public.users` and the policy definition (Database → Tables → *table* → Policies).
3. Test the same query as an admin. Admin RLS policies typically grant broader access via the
   `public.is_admin()` helper function (see `supabase/migrations/20260107101011_fix_users_schema_and_helpers.sql`).

## "new row violates row-level security policy"

The RLS policy on that table doesn't allow the current user to perform that write.

1. Confirm you're authenticated (`supabase.auth.getSession()` should return a session — check
   the browser console or React DevTools for the app's auth state).
2. Check the user's role:
   ```sql
   select id, email, role, is_active from public.users where id = auth.uid();
   ```
3. Review the policies on the target table in Supabase Dashboard → Database → Tables → *table* →
   Policies, and confirm one of them covers this operation for this role.

## Frontend shows a Supabase configuration error in the console

`src/lib/supabase.js` validates `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at startup and
logs a clear error if either is missing. Check your `.env` file has both set, and restart
`npm run dev` after editing it (Vite only reads `.env` at startup).

## Media upload / Storage errors

See [UPLOAD_SYSTEM.md](./UPLOAD_SYSTEM.md). Common causes:

- The `media-library` bucket doesn't exist yet in this Supabase project — create it in
  Storage, and set its access policies (this bucket isn't tracked in `supabase/migrations/`).
- A Storage RLS policy is blocking the upload/delete — check Storage → `media-library` →
  Policies.

## "relation already exists" / "type already exists" while applying migrations

You've already run that migration. Most files in `supabase/migrations/` use `IF NOT EXISTS`
guards, so this is safe to ignore. Using `supabase db push` instead of manual SQL avoids this,
since it tracks which migrations already ran.

## Diagnostic Checklist

- [ ] `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set
- [ ] Migrations applied (Database → Tables shows the expected tables)
- [ ] RLS enabled and policies present on the table in question
- [ ] The logged-in user has the expected row and role in `public.users`
- [ ] Browser console (F12) checked for the actual Supabase error message — it's usually more
      specific than the generic UI error

## Getting Help

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) — local dev setup
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) — applying the schema
- Supabase docs: https://supabase.com/docs
- Supabase status: https://status.supabase.com
