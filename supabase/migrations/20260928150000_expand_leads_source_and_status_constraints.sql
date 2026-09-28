/*
  # Expand Leads Table Constraints & RLS for Modern Lead Sources and Tier 4

  1. Problem:
     - The `leads` table had check constraints created in 20260717090000_create_onboarding_leads_schema.sql:
       - `leads_source_check` CHECK (source IN ('website', 'referral'))
       - `leads_status_check` CHECK (status IN ('new', 'contacted', 'integrated', 'full_member'))
     - Tier 4 registrations send `source = 'foundation_portal'` and `status = 'active'`,
       which triggers PostgreSQL error 23514 (check_violation: "new row for relation 'leads' violates check constraint 'leads_source_check'").
     - Contact page sends `source = 'contact_page'`.
     - Sub-committee joining sends `source = 'sub_committee_page'`.

  2. Solution:
     - Update `leads_source_check` to allow all valid sources:
       'website', 'referral', 'foundation_portal', 'contact_page', 'contact_form', 'sub_committee_page', 'partner_portal', 'other'
     - Update `leads_status_check` to include 'active' and 'archived'.
     - Update anon RLS INSERT policy to allow these valid sources and statuses.
*/

DO $$
BEGIN
  -- 1. Source constraint update
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS check_leads_source;
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS check_lead_source;

  ALTER TABLE leads ADD CONSTRAINT leads_source_check 
    CHECK (source IN ('website', 'referral', 'foundation_portal', 'contact_page', 'contact_form', 'sub_committee_page', 'partner_portal', 'other'));

  -- 2. Status constraint update
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS check_leads_status;
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS check_lead_status;

  ALTER TABLE leads ADD CONSTRAINT leads_status_check 
    CHECK (status IN ('new', 'contacted', 'integrated', 'full_member', 'active', 'archived'));
END $$;

-- 3. Update public RLS policy for anon submissions
DROP POLICY IF EXISTS "Public can submit a website lead" ON leads;
CREATE POLICY "Public can submit a website lead"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (
    status IN ('new', 'active')
    AND source IN ('website', 'referral', 'foundation_portal', 'contact_page', 'contact_form', 'sub_committee_page', 'partner_portal', 'other')
  );
