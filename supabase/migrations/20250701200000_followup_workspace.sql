-- Milestone 13 — Follow-up Workspace
-- Atomic complete follow-up + log activity + create next follow-up

CREATE OR REPLACE FUNCTION public.complete_followup_with_activity(
  p_followup_id uuid,
  p_activity_type_id uuid,
  p_activity_outcome_id uuid,
  p_remark text,
  p_performed_by_profile_id uuid,
  p_occurred_at timestamptz,
  p_followup_assigned_to uuid,
  p_followup_due_at timestamptz,
  p_followup_notes text,
  p_created_by_profile_id uuid,
  p_direction public.activity_direction DEFAULT 'outbound'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_followup public.follow_ups%ROWTYPE;
  v_activity_id uuid;
  v_pending_status_id uuid;
  v_completed_status_id uuid;
BEGIN
  SELECT *
  INTO v_followup
  FROM public.follow_ups
  WHERE id = p_followup_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Follow-up not found';
  END IF;

  IF NOT public.can_access_lead(v_followup.lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF p_created_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid creator profile';
  END IF;

  SELECT id
  INTO v_completed_status_id
  FROM public.followup_statuses
  WHERE code = 'completed' AND is_active = true
  LIMIT 1;

  SELECT id
  INTO v_pending_status_id
  FROM public.followup_statuses
  WHERE code = 'pending' AND is_active = true
  LIMIT 1;

  IF v_completed_status_id IS NULL OR v_pending_status_id IS NULL THEN
    RAISE EXCEPTION 'Follow-up status lookup missing';
  END IF;

  IF v_followup.followup_status_id = v_completed_status_id THEN
    RAISE EXCEPTION 'Follow-up is already completed';
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

  UPDATE public.follow_ups
  SET
    followup_status_id = v_completed_status_id,
    completed_at = now(),
    updated_by_profile_id = p_created_by_profile_id,
    updated_at = now()
  WHERE id = p_followup_id;

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
    v_followup.lead_id,
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
    v_followup.lead_id,
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

GRANT EXECUTE ON FUNCTION public.complete_followup_with_activity(
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
