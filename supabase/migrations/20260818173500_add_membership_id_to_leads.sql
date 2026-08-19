/*
  # Add membership_id to leads table

  1. New Column:
    - `membership_id` (TEXT, UNIQUE, e.g. 'DRAI-2026-8841')
  
  2. Auto-generation function:
    - Automatically generates 'DRAI-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(FLOOR(random() * 9000 + 1000)::text, 4, '0') if not provided.
  
  3. Backfill:
    - Assigns unique membership IDs to any existing leads.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'membership_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN membership_id TEXT UNIQUE;
  END IF;
END $$;

-- Helper function to generate unique ID
CREATE OR REPLACE FUNCTION generate_drai_membership_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id TEXT;
  done BOOLEAN := FALSE;
  attempts INT := 0;
BEGIN
  IF NEW.membership_id IS NULL OR NEW.membership_id = '' THEN
    WHILE NOT done AND attempts < 50 LOOP
      new_id := 'DRAI-' || TO_CHAR(COALESCE(NEW.created_at, NOW()), 'YYYY') || '-' || LPAD(FLOOR(random() * 9000 + 1000)::text, 4, '0');
      IF NOT EXISTS (SELECT 1 FROM leads WHERE membership_id = new_id) THEN
        NEW.membership_id := new_id;
        done := TRUE;
      END IF;
      attempts := attempts + 1;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate membership_id on insert
DROP TRIGGER IF EXISTS trigger_set_drai_membership_id ON leads;
CREATE TRIGGER trigger_set_drai_membership_id
BEFORE INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION generate_drai_membership_id();

-- Backfill existing leads with unique IDs
DO $$
DECLARE
  r RECORD;
  gen_id TEXT;
BEGIN
  FOR r IN SELECT id, created_at FROM leads WHERE membership_id IS NULL LOOP
    gen_id := 'DRAI-' || TO_CHAR(COALESCE(r.created_at, NOW()), 'YYYY') || '-' || LPAD(FLOOR(random() * 9000 + 1000)::text, 4, '0');
    -- Ensure uniqueness in backfill
    WHILE EXISTS (SELECT 1 FROM leads WHERE membership_id = gen_id) LOOP
      gen_id := 'DRAI-' || TO_CHAR(COALESCE(r.created_at, NOW()), 'YYYY') || '-' || LPAD(FLOOR(random() * 9000 + 1000)::text, 4, '0');
    END LOOP;

    UPDATE leads SET membership_id = gen_id WHERE id = r.id;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_membership_id ON leads(membership_id);
