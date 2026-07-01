-- Milestone 10 — Lookup workflow extension
-- Additional lookup tables: lead_sources, followup_statuses

-- ---------------------------------------------------------------------------
-- lead_sources
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_lead_sources_code UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- followup_statuses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.followup_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_followup_statuses_code UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lead_sources_display_order ON public.lead_sources (display_order);
CREATE INDEX IF NOT EXISTS idx_followup_statuses_display_order ON public.followup_statuses (display_order);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_lead_sources_set_updated_at ON public.lead_sources;
CREATE TRIGGER trg_lead_sources_set_updated_at
  BEFORE UPDATE ON public.lead_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_followup_statuses_set_updated_at ON public.followup_statuses;
CREATE TRIGGER trg_followup_statuses_set_updated_at
  BEFORE UPDATE ON public.followup_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (minimum — read-only reference data)
-- ---------------------------------------------------------------------------
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_statuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lead_sources_select_authenticated ON public.lead_sources;
CREATE POLICY lead_sources_select_authenticated
  ON public.lead_sources FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS followup_statuses_select_authenticated ON public.followup_statuses;
CREATE POLICY followup_statuses_select_authenticated
  ON public.followup_statuses FOR SELECT TO authenticated USING (true);
