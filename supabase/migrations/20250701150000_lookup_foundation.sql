-- Milestone 10 — Lookup Foundation
-- Reference lookup tables for leads, activities, demos, and tasks

-- ---------------------------------------------------------------------------
-- lead_stages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_lead_stages_code UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- activity_types
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_activity_types_code UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- activity_outcomes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_activity_outcomes_code UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- demo_statuses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.demo_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_demo_statuses_code UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- task_statuses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_task_statuses_code UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lead_stages_display_order ON public.lead_stages (display_order);
CREATE INDEX IF NOT EXISTS idx_activity_types_display_order ON public.activity_types (display_order);
CREATE INDEX IF NOT EXISTS idx_activity_outcomes_display_order ON public.activity_outcomes (display_order);
CREATE INDEX IF NOT EXISTS idx_demo_statuses_display_order ON public.demo_statuses (display_order);
CREATE INDEX IF NOT EXISTS idx_task_statuses_display_order ON public.task_statuses (display_order);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_lead_stages_set_updated_at ON public.lead_stages;
CREATE TRIGGER trg_lead_stages_set_updated_at
  BEFORE UPDATE ON public.lead_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_activity_types_set_updated_at ON public.activity_types;
CREATE TRIGGER trg_activity_types_set_updated_at
  BEFORE UPDATE ON public.activity_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_activity_outcomes_set_updated_at ON public.activity_outcomes;
CREATE TRIGGER trg_activity_outcomes_set_updated_at
  BEFORE UPDATE ON public.activity_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_demo_statuses_set_updated_at ON public.demo_statuses;
CREATE TRIGGER trg_demo_statuses_set_updated_at
  BEFORE UPDATE ON public.demo_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_task_statuses_set_updated_at ON public.task_statuses;
CREATE TRIGGER trg_task_statuses_set_updated_at
  BEFORE UPDATE ON public.task_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (minimum — read-only reference data)
-- ---------------------------------------------------------------------------
ALTER TABLE public.lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_statuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lead_stages_select_authenticated ON public.lead_stages;
CREATE POLICY lead_stages_select_authenticated
  ON public.lead_stages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS activity_types_select_authenticated ON public.activity_types;
CREATE POLICY activity_types_select_authenticated
  ON public.activity_types FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS activity_outcomes_select_authenticated ON public.activity_outcomes;
CREATE POLICY activity_outcomes_select_authenticated
  ON public.activity_outcomes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS demo_statuses_select_authenticated ON public.demo_statuses;
CREATE POLICY demo_statuses_select_authenticated
  ON public.demo_statuses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS task_statuses_select_authenticated ON public.task_statuses;
CREATE POLICY task_statuses_select_authenticated
  ON public.task_statuses FOR SELECT TO authenticated USING (true);
