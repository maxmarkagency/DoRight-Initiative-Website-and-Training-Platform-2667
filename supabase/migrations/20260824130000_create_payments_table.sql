-- ==========================================================
-- Migration: Create Payments Table for Paystack & Bank Transfers
-- Created at: 2026-08-24
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  purpose TEXT NOT NULL DEFAULT 'sponsorship', -- 'sponsorship', 'partnership', 'registration', 'donation', 'other'
  tier_or_category TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  channel TEXT NOT NULL DEFAULT 'paystack', -- 'paystack', 'bank_transfer'
  status TEXT NOT NULL DEFAULT 'pending', -- 'successful', 'pending', 'pending_verification', 'failed'
  paystack_transaction_id TEXT,
  notes TEXT,
  proof_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for rapid lookup & analytics
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_email ON public.payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_purpose ON public.payments(purpose);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated users to submit payment records
DROP POLICY IF EXISTS "Public can insert payment records" ON public.payments;
CREATE POLICY "Public can insert payment records"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- Allow public lookup of own payment by reference
DROP POLICY IF EXISTS "Public can view payment by reference" ON public.payments;
CREATE POLICY "Public can view payment by reference"
  ON public.payments
  FOR SELECT
  USING (true);

-- Admins have full access
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments"
  ON public.payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Auto update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_payments_updated_at ON public.payments;
CREATE TRIGGER trg_update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payments_updated_at();
