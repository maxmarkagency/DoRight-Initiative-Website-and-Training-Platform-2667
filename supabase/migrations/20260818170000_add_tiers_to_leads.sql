/*
  # Add Tiers (Tier 1, Tier 2, Tier 3) to Leads & Members

  1. New Columns on `leads`:
    - `tier` (text, default 'tier_1', check in ('tier_1', 'tier_2', 'tier_3'))
    - `tier_1_at` (timestamptz, default now())
    - `tier_2_at` (timestamptz, nullable)
    - `tier_3_at` (timestamptz, nullable)

  2. Backfill:
    - Existing records receive `tier = 'tier_1'` and `tier_1_at = created_at`.

  3. Indexes:
    - Index on `tier` for rapid filtering in Admin dashboard.
*/

DO $$
BEGIN
  -- Add tier column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'tier'
  ) THEN
    ALTER TABLE leads ADD COLUMN tier TEXT NOT NULL DEFAULT 'tier_1';
    ALTER TABLE leads ADD CONSTRAINT check_lead_tier CHECK (tier IN ('tier_1', 'tier_2', 'tier_3'));
  END IF;

  -- Add timestamp tracking for each tier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'tier_1_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN tier_1_at TIMESTAMPTZ DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'tier_2_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN tier_2_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'tier_3_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN tier_3_at TIMESTAMPTZ;
  END IF;
END $$;

-- Backfill existing records
UPDATE leads 
SET 
  tier = COALESCE(tier, 'tier_1'),
  tier_1_at = COALESCE(tier_1_at, created_at)
WHERE tier IS NULL OR tier_1_at IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads(tier);
