-- Milestone 11 — Lead Management (MVP, refined)
-- lead_types lookup, leads table, indexes, RLS helpers

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_outcome') THEN
    CREATE TYPE public.lead_outcome AS ENUM ('won', 'lost', 'archived');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Helper: resolve current user's business profile
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile_id
  FROM public.profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- lead_types
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_lead_types_code UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS idx_lead_types_display_order ON public.lead_types (display_order);

DROP TRIGGER IF EXISTS trg_lead_types_set_updated_at ON public.lead_types;
CREATE TRIGGER trg_lead_types_set_updated_at
  BEFORE UPDATE ON public.lead_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.lead_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lead_types_select_authenticated ON public.lead_types;
CREATE POLICY lead_types_select_authenticated
  ON public.lead_types FOR SELECT TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  website text,
  phone text,
  lead_type_id uuid NOT NULL REFERENCES public.lead_types (id) ON DELETE RESTRICT,
  primary_contact_name text,
  primary_contact_phone text,
  primary_contact_email text,
  owner_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  assigned_to_profile_id uuid REFERENCES public.profiles (profile_id) ON DELETE SET NULL,
  stage_id uuid NOT NULL REFERENCES public.lead_stages (id) ON DELETE RESTRICT,
  lead_source_id uuid REFERENCES public.lead_sources (id) ON DELETE SET NULL,
  outcome public.lead_outcome,
  description text,
  archived_at timestamptz,
  deleted_at timestamptz,
  deleted_by_profile_id uuid REFERENCES public.profiles (profile_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  updated_by_profile_id uuid REFERENCES public.profiles (profile_id) ON DELETE SET NULL,
  CONSTRAINT chk_leads_outcome_archived CHECK (
    (outcome IS NULL AND archived_at IS NULL)
    OR (outcome IS NOT NULL AND archived_at IS NOT NULL)
  ),
  CONSTRAINT chk_leads_deleted_not_archived CHECK (
    deleted_at IS NULL OR outcome IS NULL
  )
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leads_owner_profile_id ON public.leads (owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to_profile_id ON public.leads (assigned_to_profile_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_type_id ON public.leads (lead_type_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage_id ON public.leads (stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_source_id ON public.leads (lead_source_id);
CREATE INDEX IF NOT EXISTS idx_leads_outcome ON public.leads (outcome) WHERE outcome IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_archived_at ON public.leads (archived_at);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON public.leads (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_organization_name_lower ON public.leads (lower(trim(organization_name)));
CREATE INDEX IF NOT EXISTS idx_leads_website_lower ON public.leads (lower(trim(website))) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_primary_contact_email_lower ON public.leads (lower(trim(primary_contact_email)))
  WHERE primary_contact_email IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_leads_set_updated_at ON public.leads;
CREATE TRIGGER trg_leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS leads_select_own ON public.leads;
CREATE POLICY leads_select_own
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    owner_profile_id = public.current_profile_id()
    OR assigned_to_profile_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS leads_insert_authenticated ON public.leads;
CREATE POLICY leads_insert_authenticated
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by_profile_id = public.current_profile_id());

DROP POLICY IF EXISTS leads_update_own ON public.leads;
CREATE POLICY leads_update_own
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    owner_profile_id = public.current_profile_id()
    OR assigned_to_profile_id = public.current_profile_id()
  )
  WITH CHECK (
    owner_profile_id = public.current_profile_id()
    OR assigned_to_profile_id = public.current_profile_id()
  );

-- Owner assignment dropdown: read active profiles
DROP POLICY IF EXISTS profiles_select_active ON public.profiles;
CREATE POLICY profiles_select_active
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (status = 'active' AND archived_at IS NULL);
