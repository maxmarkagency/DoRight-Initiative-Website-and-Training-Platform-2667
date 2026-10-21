/*
  # Require Admin Approval for New Website Registrations

  Problem: Join page registrations are inserted as status='new' and immediately
  treated as active members (membership card issued, welcome email sent),
  with no admin gate. This is being abused by spam submissions.

  Solution:
  - Add 'pending_review' and 'rejected' to leads_status_check.
  - Restrict anon INSERT RLS to 'pending_review' only (tier_4 foundation
    leaders are created via service-role edge function, which bypasses RLS,
    so they are unaffected).
*/

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('pending_review', 'new', 'contacted', 'integrated', 'full_member', 'active', 'rejected', 'archived'));

DROP POLICY IF EXISTS "Public can submit a website lead" ON leads;
CREATE POLICY "Public can submit a website lead"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (
    status IN ('pending_review')
    AND source IN ('website', 'referral', 'contact_page', 'contact_form', 'sub_committee_page', 'partner_portal', 'other')
  );
