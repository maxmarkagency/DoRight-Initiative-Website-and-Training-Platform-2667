# Member Onboarding Data Model (Phase 1) Implementation Plan

**Goal:** Add the `sub_committees` and `leads` tables (plus a private Storage bucket for lead photos) that the rest of the member-onboarding pipeline (join form, admin review, referral path, email automation) will build on.

**Architecture:** One new Supabase migration file following this project's existing conventions exactly — `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')` inline RLS checks (the pattern actually used by `blog_posts`/`gallery_items`, not the less-consistently-used `is_admin()` helper), the shared `update_updated_at_column()` trigger function already defined in the initial schema migration, and Storage bucket + policies created via SQL (`storage.buckets` / `storage.objects`) for reproducibility, since this project's one existing bucket (`media-library`) was set up by hand and isn't tracked anywhere.

**Tech Stack:** PostgreSQL (via Supabase migrations), Supabase Row Level Security, Supabase Storage.

**Testing note:** Per the approved design, this phase is verified by careful file-level review against this project's existing migration conventions, not by running the migration against a live or local Supabase instance (no local dev stack exists yet; applying for real happens later via `supabase db push`). "Test" steps below are review/read-back steps, not automated test runs.

---

### Task 1: Create the onboarding data model migration

**Files:**
- Create: `supabase/migrations/20260717090000_create_onboarding_leads_schema.sql`

**Step 1: Read the reference migration this follows**

Read `supabase/migrations/20260107154733_fix_blog_gallery_rls_policies.sql` in full. This is the exact RLS style to match: header comment block, `DROP POLICY IF EXISTS` before `CREATE POLICY` (harmless here since these are new tables, but keep the habit for consistency), and the inline `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')` check — not `is_admin()`.

Also read `supabase/migrations/20251213000504_001_initial_lms_schema.sql` lines 355-390 to see the existing `update_updated_at_column()` function and how triggers are wired to it. Reuse this function; do not redefine it.

**Step 2: Write the migration file**

Create `supabase/migrations/20260717090000_create_onboarding_leads_schema.sql` with exactly this content:

```sql
/*
  # Member Onboarding Data Model (Phase 1)

  1. New Tables
    - `sub_committees`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null) — e.g. "Communication", "Fundraising"
      - `description` (text, nullable) — reused later as the source content for the public sub-committee responsibilities page
      - `is_active` (boolean, default true) — lets admins retire a committee without deleting history tied to it
      - `created_at` / `updated_at` (timestamptz)
    - `leads`
      - `id` (uuid, primary key)
      - `full_name` (text, not null)
      - `email` (text, not null)
      - `phone` (text, nullable)
      - `photo_url` (text, nullable) — path into the new `lead-photos` Storage bucket
      - `sub_committee_id` (uuid, nullable, references sub_committees)
      - `source` (text, not null, default 'website', check in ('website','referral'))
      - `referred_by` (text, nullable) — meaningful only when source = 'referral'
      - `status` (text, not null, default 'new', check in ('new','contacted','integrated','full_member'))
      - `admin_notes` (text, nullable)
      - `contacted_at` / `integrated_at` / `full_member_at` (timestamptz, nullable)
      - `created_at` / `updated_at` (timestamptz)

  2. Security
    - `sub_committees`: public (anon + authenticated) can SELECT; only admins can INSERT/UPDATE/DELETE
    - `leads`: only admins can SELECT/UPDATE/DELETE (real personal data: name, email, phone, photo).
      Anonymous INSERT is allowed (the public join form has no logged-in user), but constrained by
      WITH CHECK to status = 'new' and source = 'website' so a crafted request can't self-assign
      full_member status or claim the referral source. Authenticated admins get a separate, unconstrained
      INSERT policy for Phase 5's admin-entered referral leads.
    - `lead-photos` Storage bucket (new, private): anon can INSERT (upload during the public form
      submission); only authenticated admins can SELECT (read back).

  3. Seed Data
    - Seeds the five sub-committees named in the DRAI onboarding process plan.
*/

-- ============================================================================
-- sub_committees
-- ============================================================================

CREATE TABLE IF NOT EXISTS sub_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sub_committees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view sub-committees" ON sub_committees;
CREATE POLICY "Public can view sub-committees"
  ON sub_committees FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert sub-committees" ON sub_committees;
CREATE POLICY "Admins can insert sub-committees"
  ON sub_committees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update sub-committees" ON sub_committees;
CREATE POLICY "Admins can update sub-committees"
  ON sub_committees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete sub-committees" ON sub_committees;
CREATE POLICY "Admins can delete sub-committees"
  ON sub_committees FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP TRIGGER IF EXISTS update_sub_committees_updated_at ON sub_committees;
CREATE TRIGGER update_sub_committees_updated_at
  BEFORE UPDATE ON sub_committees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- leads
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    photo_url TEXT,
    sub_committee_id UUID REFERENCES sub_committees(id),
    source TEXT NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'referral')),
    referred_by TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'integrated', 'full_member')),
    admin_notes TEXT,
    contacted_at TIMESTAMPTZ,
    integrated_at TIMESTAMPTZ,
    full_member_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view leads" ON leads;
CREATE POLICY "Admins can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public can submit a website lead" ON leads;
CREATE POLICY "Public can submit a website lead"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (
    status = 'new'
    AND source = 'website'
  );

DROP POLICY IF EXISTS "Admins can insert leads" ON leads;
CREATE POLICY "Admins can insert leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update leads" ON leads;
CREATE POLICY "Admins can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete leads" ON leads;
CREATE POLICY "Admins can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- lead-photos Storage bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-photos', 'lead-photos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can upload lead photos" ON storage.objects;
CREATE POLICY "Public can upload lead photos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'lead-photos');

DROP POLICY IF EXISTS "Admins can view lead photos" ON storage.objects;
CREATE POLICY "Admins can view lead photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'lead-photos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- Seed data
-- ============================================================================

INSERT INTO sub_committees (name, description) VALUES
  ('Communication', 'Handles public messaging, campaigns, and content for the DRAI movement.'),
  ('Community Engagement', 'Runs grassroots outreach and local community-facing initiatives.'),
  ('Fundraising', 'Coordinates donation drives and financial partnerships.'),
  ('Strategy', 'Shapes the long-term direction and policy advocacy priorities.'),
  ('Secretariat', 'Manages administrative operations and record-keeping for the initiative.')
ON CONFLICT (name) DO NOTHING;
```

**Step 3: Review the migration against the spec (no automated test exists for this)**

Read the file back and check each of these against `docs/superpowers/specs/2026-07-17-member-onboarding-pipeline-design.md`:

- [ ] `sub_committees` has exactly the columns the spec lists, with `name` unique
- [ ] `leads` has exactly the columns the spec lists, with the two `CHECK` constraints matching the spec's enum values verbatim (`source`, `status`)
- [ ] The anonymous INSERT policy on `leads` has a `WITH CHECK` — not just a permissive `INSERT` — so a crafted request can't set `status = 'full_member'` or `source = 'referral'` on first submission
- [ ] Every RLS policy uses the `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')` form (matching `blog_posts`/`gallery_items`), not `is_admin()`
- [ ] Both tables have an `updated_at` trigger wired to the existing `update_updated_at_column()` function, not a redefinition of it
- [ ] The Storage bucket is created with `public = false`
- [ ] The seed data matches the five committee names from the source document exactly (Communication, Community Engagement, Fundraising, Strategy, Secretariat)

Fix anything that doesn't match before committing.

**Step 4: Verify SQL syntax is well-formed**

There's no local Supabase instance to run this against (per the approved plan). Do a careful manual syntax pass instead: confirm every `CREATE POLICY`/`CREATE TABLE`/`CREATE TRIGGER` statement is terminated with a semicolon, parentheses are balanced, and the file has no unclosed comment blocks. Read the whole file start to finish once, slowly.

**Step 5: Commit**

```bash
git add supabase/migrations/20260717090000_create_onboarding_leads_schema.sql
git commit -m "feat: add sub_committees and leads tables for member onboarding pipeline"
```

---

## Applying this migration for real

This plan does not apply the migration to any live database. When ready:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste the file's contents into the Supabase Studio SQL editor for the linked project. Either way, afterward, manually verify in Studio: `sub_committees` has 5 rows, `leads` is empty with RLS enabled, and the `lead-photos` bucket exists and is marked private.
