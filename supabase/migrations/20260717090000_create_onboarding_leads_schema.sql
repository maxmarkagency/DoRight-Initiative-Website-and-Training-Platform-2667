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
