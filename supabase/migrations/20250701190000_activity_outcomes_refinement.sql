-- Activity Engine refinement
-- Type-scoped activity outcomes + optional direction on activities

-- ---------------------------------------------------------------------------
-- activity_outcomes: scope outcomes to activity type
-- ---------------------------------------------------------------------------
ALTER TABLE public.activity_outcomes
  ADD COLUMN IF NOT EXISTS activity_type_id uuid REFERENCES public.activity_types (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_activity_outcomes_activity_type_id
  ON public.activity_outcomes (activity_type_id);

ALTER TABLE public.activity_outcomes
  DROP CONSTRAINT IF EXISTS uq_activity_outcomes_code;

DROP INDEX IF EXISTS public.uq_activity_outcomes_type_code;
CREATE UNIQUE INDEX uq_activity_outcomes_type_code
  ON public.activity_outcomes (activity_type_id, code);

-- ---------------------------------------------------------------------------
-- activities: optional direction
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_direction') THEN
    CREATE TYPE public.activity_direction AS ENUM ('outbound', 'inbound');
  END IF;
END $$;

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS direction public.activity_direction;

-- ---------------------------------------------------------------------------
-- RPC: add direction parameter
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_activity_with_followup(
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
);

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
  p_created_by_profile_id uuid,
  p_direction public.activity_direction DEFAULT NULL
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

  IF NOT EXISTS (
    SELECT 1
    FROM public.activity_outcomes ao
    WHERE ao.id = p_activity_outcome_id
      AND ao.activity_type_id = p_activity_type_id
      AND ao.is_active = true
  ) THEN
    RAISE EXCEPTION 'Outcome does not belong to the selected activity type';
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
    direction,
    created_by_profile_id
  ) VALUES (
    p_lead_id,
    p_activity_type_id,
    p_activity_outcome_id,
    p_remark,
    p_performed_by_profile_id,
    p_occurred_at,
    p_direction,
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
  uuid,
  public.activity_direction
) TO authenticated;
