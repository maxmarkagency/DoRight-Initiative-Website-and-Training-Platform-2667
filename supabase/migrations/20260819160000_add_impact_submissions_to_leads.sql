/*
  # Add impact_submissions JSONB column to leads
  
  Allows admins to manually track whether a member has submitted their monthly impact story
  on the WhatsApp community group (e.g. { "2026-01": true, "2026-02": false, "2026-08": true }).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'impact_submissions'
  ) THEN
    ALTER TABLE leads ADD COLUMN impact_submissions JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;
