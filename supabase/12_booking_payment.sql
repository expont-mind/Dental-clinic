-- ============================================================================
-- Migration: Add booking fee to clinic_profile + pending_bookings table
-- for pay-first booking flow with QPay integration.
-- ============================================================================

-- 1. Add booking fee to clinic profile (single fixed amount in MNT)
ALTER TABLE public.clinic_profile
  ADD COLUMN IF NOT EXISTS booking_fee_cents bigint NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.clinic_profile.booking_fee_cents IS 'Fixed booking fee in MNT cents (e.g. 1000000 = 10,000₮). 0 = no fee.';

-- 2. Pending bookings table — holds booking data while awaiting payment
CREATE TABLE IF NOT EXISTS public.pending_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- QPay invoice
  invoice_id text NOT NULL,
  amount_cents bigint NOT NULL,
  -- Booking data (stored until payment confirmed, then sent to IT Doctor)
  branch_id integer NOT NULL DEFAULT 1,
  service_id integer NOT NULL,
  dentist_id integer,
  slot_datetime text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  service_name text,
  dept_slug text,
  note text,
  lang text NOT NULL DEFAULT 'mn',
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'expired', 'failed')),
  booking_reference text,
  booking_result jsonb,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  paid_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pending_bookings_invoice_id ON public.pending_bookings(invoice_id);
CREATE INDEX IF NOT EXISTS idx_pending_bookings_status ON public.pending_bookings(status) WHERE status = 'pending';

-- Auto-update updated_at
CREATE TRIGGER set_pending_bookings_updated_at
  BEFORE UPDATE ON public.pending_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
