-- Milestone 12 — Activity Engine
-- activities (append-only) + follow_ups (next follow-up per activity)

-- ---------------------------------------------------------------------------
-- Helper: check lead access for current user
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_access_lead(p_lead_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.leads l
    WHERE l.id = p_lead_id
      AND (
        l.owner_profile_id = public.current_profile_id()
        OR l.assigned_to_profile_id = public.current_profile_id()
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads (id) ON DELETE RESTRICT,
  activity_type_id uuid NOT NULL REFERENCES public.activity_types (id) ON DELETE RESTRICT,
  activity_outcome_id uuid NOT NULL REFERENCES public.activity_outcomes (id) ON DELETE RESTRICT,
  remark text NOT NULL,
  performed_by_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- follow_ups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities (id) ON DELETE RESTRICT,
  lead_id uuid NOT NULL REFERENCES public.leads (id) ON DELETE RESTRICT,
  assigned_to_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  due_at timestamptz NOT NULL,
  notes text,
  followup_status_id uuid NOT NULL REFERENCES public.followup_statuses (id) ON DELETE RESTRICT,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  updated_by_profile_id uuid REFERENCES public.profiles (profile_id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_activities_lead_id_occurred_at ON public.activities (lead_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_performed_by_profile_id ON public.activities (performed_by_profile_id);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type_id ON public.activities (activity_type_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_activity_id ON public.follow_ups (activity_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups (lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned_to_profile_id_status ON public.follow_ups (assigned_to_profile_id, followup_status_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_at ON public.follow_ups (due_at);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_follow_ups_set_updated_at ON public.follow_ups;
CREATE TRIGGER trg_follow_ups_set_updated_at
  BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activities_select_lead_access ON public.activities;
CREATE POLICY activities_select_lead_access
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (public.can_access_lead(lead_id));

DROP POLICY IF EXISTS activities_insert_lead_access ON public.activities;
CREATE POLICY activities_insert_lead_access
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_lead(lead_id)
    AND created_by_profile_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS follow_ups_select_lead_access ON public.follow_ups;
CREATE POLICY follow_ups_select_lead_access
  ON public.follow_ups
  FOR SELECT
  TO authenticated
  USING (public.can_access_lead(lead_id));

DROP POLICY IF EXISTS follow_ups_insert_lead_access ON public.follow_ups;
CREATE POLICY follow_ups_insert_lead_access
  ON public.follow_ups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_lead(lead_id)
    AND created_by_profile_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS follow_ups_update_lead_access ON public.follow_ups;
CREATE POLICY follow_ups_update_lead_access
  ON public.follow_ups
  FOR UPDATE
  TO authenticated
  USING (public.can_access_lead(lead_id))
  WITH CHECK (public.can_access_lead(lead_id));

-- ---------------------------------------------------------------------------
-- Atomic activity + follow-up creation (BR-ACT-02)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_activity_with_followup(
  p_lead_id uuid,
  p_activity_type_id uuid,
  p_activity_outcome_id uuid,
  p_remark text,
  p_performed_by_profile_id uuid,
  p_occurred_at timestamptz,
  p_followup_assigned_to uuid,
  p_followup_due_at timestamptz,
  p_followup_notes text,
  p_created_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id uuid;
  v_pending_status_id uuid;
BEGIN
  IF NOT public.can_access_lead(p_lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF p_created_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid creator profile';
  END IF;

  SELECT id
  INTO v_pending_status_id
  FROM public.followup_statuses
  WHERE code = 'pending' AND is_active = true
  LIMIT 1;

  IF v_pending_status_id IS NULL THEN
    RAISE EXCEPTION 'Pending follow-up status not found';
  END IF;

  INSERT INTO public.activities (
    lead_id,
    activity_type_id,
    activity_outcome_id,
    remark,
    performed_by_profile_id,
    occurred_at,
    created_by_profile_id
  ) VALUES (
    p_lead_id,
    p_activity_type_id,
    p_activity_outcome_id,
    p_remark,
    p_performed_by_profile_id,
    p_occurred_at,
    p_created_by_profile_id
  )
  RETURNING id INTO v_activity_id;

  INSERT INTO public.follow_ups (
    activity_id,
    lead_id,
    assigned_to_profile_id,
    due_at,
    notes,
    followup_status_id,
    created_by_profile_id,
    updated_by_profile_id
  ) VALUES (
    v_activity_id,
    p_lead_id,
    p_followup_assigned_to,
    p_followup_due_at,
    NULLIF(trim(p_followup_notes), ''),
    v_pending_status_id,
    p_created_by_profile_id,
    p_created_by_profile_id
  );

  RETURN v_activity_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_activity_with_followup(
  uuid,
  uuid,
  uuid,
  text,
  uuid,
  timestamptz,
  uuid,
  timestamptz,
  text,
  uuid
) TO authenticated;
