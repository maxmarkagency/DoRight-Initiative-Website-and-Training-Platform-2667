/*
  # Add Tier 4 (Foundational Leader) to Leads & Members

  1. Updates on `leads` table:
    - Update `check_lead_tier` constraint to include 'tier_4'
    - Add `tier_4_at` timestamp column for Tier 4 appointment / induction date
*/

DO $$
BEGIN
  -- Drop existing constraint if present and recreate to include tier_4
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS check_lead_tier;
  ALTER TABLE leads ADD CONSTRAINT check_lead_tier CHECK (tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4'));

  -- Add timestamp tracking for Tier 4
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'tier_4_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN tier_4_at TIMESTAMPTZ;
  END IF;
END $$;
