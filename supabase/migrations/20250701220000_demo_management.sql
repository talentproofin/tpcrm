-- Milestone 18 — Demo Management
-- demos table, demo outcomes, audit logs, RLS, lifecycle RPCs with follow-up integration

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_mode') THEN
    CREATE TYPE public.demo_mode AS ENUM ('online', 'offline');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
    CREATE TYPE public.audit_action AS ENUM (
      'created',
      'updated',
      'soft_deleted',
      'restored',
      'permanent_deleted',
      'archived',
      'role_changed',
      'login',
      'logout'
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- demo_outcomes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.demo_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_demo_outcomes_code UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS idx_demo_outcomes_display_order ON public.demo_outcomes (display_order);

DROP TRIGGER IF EXISTS trg_demo_outcomes_set_updated_at ON public.demo_outcomes;
CREATE TRIGGER trg_demo_outcomes_set_updated_at
  BEFORE UPDATE ON public.demo_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.demo_outcomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS demo_outcomes_select_authenticated ON public.demo_outcomes;
CREATE POLICY demo_outcomes_select_authenticated
  ON public.demo_outcomes FOR SELECT TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- audit_logs (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  action public.audit_action NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created_at ON public.audit_logs (actor_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_select_authenticated ON public.audit_logs;
CREATE POLICY audit_logs_select_authenticated
  ON public.audit_logs FOR SELECT TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- demos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.demos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads (id) ON DELETE RESTRICT,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  demo_mode public.demo_mode NOT NULL,
  meeting_link text,
  venue text,
  presenter_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  attendees text,
  demo_status_id uuid NOT NULL REFERENCES public.demo_statuses (id) ON DELETE RESTRICT,
  demo_outcome_id uuid REFERENCES public.demo_outcomes (id) ON DELETE RESTRICT,
  summary text,
  internal_notes text,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  updated_by_profile_id uuid REFERENCES public.profiles (profile_id) ON DELETE SET NULL,
  CONSTRAINT chk_demos_duration_positive CHECK (duration_minutes > 0)
);

CREATE INDEX IF NOT EXISTS idx_demos_lead_id ON public.demos (lead_id);
CREATE INDEX IF NOT EXISTS idx_demos_scheduled_at ON public.demos (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_demos_presenter_profile_id ON public.demos (presenter_profile_id);
CREATE INDEX IF NOT EXISTS idx_demos_demo_status_id ON public.demos (demo_status_id);
CREATE INDEX IF NOT EXISTS idx_demos_demo_outcome_id ON public.demos (demo_outcome_id)
  WHERE demo_outcome_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_demos_set_updated_at ON public.demos;
CREATE TRIGGER trg_demos_set_updated_at
  BEFORE UPDATE ON public.demos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS demos_select_lead_access ON public.demos;
CREATE POLICY demos_select_lead_access
  ON public.demos
  FOR SELECT
  TO authenticated
  USING (public.can_access_lead(lead_id));

DROP POLICY IF EXISTS demos_insert_lead_access ON public.demos;
CREATE POLICY demos_insert_lead_access
  ON public.demos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_lead(lead_id)
    AND created_by_profile_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS demos_update_lead_access ON public.demos;
CREATE POLICY demos_update_lead_access
  ON public.demos
  FOR UPDATE
  TO authenticated
  USING (public.can_access_lead(lead_id))
  WITH CHECK (public.can_access_lead(lead_id));

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_demo_status_id(p_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.demo_statuses
  WHERE code = p_code AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_demo_outcome_id(p_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.demo_outcomes
  WHERE code = p_code AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_actor_profile_id uuid,
  p_action public.audit_action,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_profile_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_actor_profile_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_demo_followup(
  p_lead_id uuid,
  p_activity_type_id uuid,
  p_activity_outcome_id uuid,
  p_presenter_profile_id uuid,
  p_scheduled_at timestamptz,
  p_created_by_profile_id uuid,
  p_followup_notes text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id uuid;
  v_pending_status_id uuid;
BEGIN
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
    'Demo scheduled for ' || to_char(p_scheduled_at, 'YYYY-MM-DD HH24:MI'),
    p_presenter_profile_id,
    now(),
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
    p_presenter_profile_id,
    p_scheduled_at,
    COALESCE(NULLIF(trim(p_followup_notes), ''), 'Follow up on demo date'),
    v_pending_status_id,
    p_created_by_profile_id,
    p_created_by_profile_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_demo_pending_followup_due_at(
  p_lead_id uuid,
  p_presenter_profile_id uuid,
  p_new_due_at timestamptz,
  p_updated_by_profile_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pending_status_id uuid;
  v_followup_id uuid;
BEGIN
  SELECT id
  INTO v_pending_status_id
  FROM public.followup_statuses
  WHERE code = 'pending' AND is_active = true
  LIMIT 1;

  IF v_pending_status_id IS NULL THEN
    RETURN;
  END IF;

  SELECT fu.id
  INTO v_followup_id
  FROM public.follow_ups fu
  WHERE fu.lead_id = p_lead_id
    AND fu.assigned_to_profile_id = p_presenter_profile_id
    AND fu.followup_status_id = v_pending_status_id
  ORDER BY fu.created_at DESC
  LIMIT 1;

  IF v_followup_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.follow_ups
  SET
    due_at = p_new_due_at,
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = v_followup_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Schedule demo
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.schedule_demo(
  p_lead_id uuid,
  p_scheduled_at timestamptz,
  p_duration_minutes integer,
  p_demo_mode public.demo_mode,
  p_meeting_link text,
  p_venue text,
  p_presenter_profile_id uuid,
  p_attendees text,
  p_internal_notes text,
  p_created_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_demo_id uuid;
  v_scheduled_status_id uuid;
  v_demo_type_id uuid;
  v_scheduled_outcome_id uuid;
BEGIN
  IF NOT public.can_access_lead(p_lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF p_created_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid creator profile';
  END IF;

  IF p_scheduled_at < now() THEN
    RAISE EXCEPTION 'Demo date cannot be in the past';
  END IF;

  IF p_duration_minutes IS NULL OR p_duration_minutes <= 0 THEN
    RAISE EXCEPTION 'Duration must be greater than zero';
  END IF;

  v_scheduled_status_id := public.get_demo_status_id('scheduled');
  IF v_scheduled_status_id IS NULL THEN
    RAISE EXCEPTION 'Scheduled demo status not found';
  END IF;

  SELECT id INTO v_demo_type_id
  FROM public.activity_types
  WHERE code = 'demo' AND is_active = true
  LIMIT 1;

  SELECT id INTO v_scheduled_outcome_id
  FROM public.activity_outcomes
  WHERE code = 'scheduled'
    AND activity_type_id = v_demo_type_id
    AND is_active = true
  LIMIT 1;

  IF v_demo_type_id IS NULL OR v_scheduled_outcome_id IS NULL THEN
    RAISE EXCEPTION 'Demo activity lookup missing';
  END IF;

  INSERT INTO public.demos (
    lead_id,
    scheduled_at,
    duration_minutes,
    demo_mode,
    meeting_link,
    venue,
    presenter_profile_id,
    attendees,
    demo_status_id,
    internal_notes,
    created_by_profile_id,
    updated_by_profile_id
  ) VALUES (
    p_lead_id,
    p_scheduled_at,
    p_duration_minutes,
    p_demo_mode,
    NULLIF(trim(p_meeting_link), ''),
    NULLIF(trim(p_venue), ''),
    p_presenter_profile_id,
    NULLIF(trim(p_attendees), ''),
    v_scheduled_status_id,
    NULLIF(trim(p_internal_notes), ''),
    p_created_by_profile_id,
    p_created_by_profile_id
  )
  RETURNING id INTO v_demo_id;

  PERFORM public.create_demo_followup(
    p_lead_id,
    v_demo_type_id,
    v_scheduled_outcome_id,
    p_presenter_profile_id,
    p_scheduled_at,
    p_created_by_profile_id,
    p_internal_notes
  );

  PERFORM public.write_audit_log(
    p_created_by_profile_id,
    'created',
    'demo',
    v_demo_id,
    jsonb_build_object('scheduled_at', p_scheduled_at)
  );

  RETURN v_demo_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Update demo (scheduled editable; completed summary + internal notes only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_demo(
  p_demo_id uuid,
  p_scheduled_at timestamptz,
  p_duration_minutes integer,
  p_demo_mode public.demo_mode,
  p_meeting_link text,
  p_venue text,
  p_presenter_profile_id uuid,
  p_attendees text,
  p_internal_notes text,
  p_summary text,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_demo public.demos%ROWTYPE;
  v_status_code text;
BEGIN
  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  SELECT * INTO v_demo FROM public.demos WHERE id = p_demo_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demo not found';
  END IF;

  SELECT code INTO v_status_code
  FROM public.demo_statuses
  WHERE id = v_demo.demo_status_id;

  IF NOT public.can_access_lead(v_demo.lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF v_status_code = 'completed' THEN
    UPDATE public.demos
    SET
      summary = NULLIF(trim(p_summary), ''),
      internal_notes = NULLIF(trim(p_internal_notes), ''),
      updated_by_profile_id = p_updated_by_profile_id,
      updated_at = now()
    WHERE id = p_demo_id;

    RETURN p_demo_id;
  END IF;

  IF v_status_code <> 'scheduled' THEN
    RAISE EXCEPTION 'Only scheduled demos can be edited';
  END IF;

  IF p_scheduled_at < now() THEN
    RAISE EXCEPTION 'Demo date cannot be in the past';
  END IF;

  IF p_duration_minutes IS NULL OR p_duration_minutes <= 0 THEN
    RAISE EXCEPTION 'Duration must be greater than zero';
  END IF;

  UPDATE public.demos
  SET
    scheduled_at = p_scheduled_at,
    duration_minutes = p_duration_minutes,
    demo_mode = p_demo_mode,
    meeting_link = NULLIF(trim(p_meeting_link), ''),
    venue = NULLIF(trim(p_venue), ''),
    presenter_profile_id = p_presenter_profile_id,
    attendees = NULLIF(trim(p_attendees), ''),
    internal_notes = NULLIF(trim(p_internal_notes), ''),
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_demo_id;

  RETURN p_demo_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Complete demo
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_demo(
  p_demo_id uuid,
  p_demo_outcome_id uuid,
  p_summary text,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_demo public.demos%ROWTYPE;
  v_completed_status_id uuid;
  v_outcome_code text;
  v_demo_type_id uuid;
  v_completed_outcome_id uuid;
  v_pending_status_id uuid;
  v_activity_id uuid;
  v_followup_due_at timestamptz;
BEGIN
  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  SELECT * INTO v_demo FROM public.demos WHERE id = p_demo_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demo not found';
  END IF;

  IF NOT public.can_access_lead(v_demo.lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  v_completed_status_id := public.get_demo_status_id('completed');
  IF v_completed_status_id IS NULL THEN
    RAISE EXCEPTION 'Completed demo status not found';
  END IF;

  IF (SELECT code FROM public.demo_statuses WHERE id = v_demo.demo_status_id) <> 'scheduled' THEN
    RAISE EXCEPTION 'Only scheduled demos can be completed';
  END IF;

  IF p_demo_outcome_id IS NULL THEN
    RAISE EXCEPTION 'Demo outcome is required';
  END IF;

  SELECT code
  INTO v_outcome_code
  FROM public.demo_outcomes
  WHERE id = p_demo_outcome_id AND is_active = true;

  IF v_outcome_code IS NULL THEN
    RAISE EXCEPTION 'Invalid demo outcome';
  END IF;

  UPDATE public.demos
  SET
    demo_status_id = v_completed_status_id,
    demo_outcome_id = p_demo_outcome_id,
    summary = NULLIF(trim(p_summary), ''),
    completed_at = now(),
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_demo_id;

  SELECT id INTO v_demo_type_id
  FROM public.activity_types
  WHERE code = 'demo' AND is_active = true
  LIMIT 1;

  SELECT id INTO v_completed_outcome_id
  FROM public.activity_outcomes
  WHERE code = 'completed'
    AND activity_type_id = v_demo_type_id
    AND is_active = true
  LIMIT 1;

  IF v_demo_type_id IS NOT NULL AND v_completed_outcome_id IS NOT NULL THEN
    INSERT INTO public.activities (
      lead_id,
      activity_type_id,
      activity_outcome_id,
      remark,
      performed_by_profile_id,
      occurred_at,
      created_by_profile_id
    ) VALUES (
      v_demo.lead_id,
      v_demo_type_id,
      v_completed_outcome_id,
      'Demo completed: ' || COALESCE(NULLIF(trim(p_summary), ''), v_outcome_code),
      v_demo.presenter_profile_id,
      now(),
      p_updated_by_profile_id
    )
    RETURNING id INTO v_activity_id;
  END IF;

  IF v_outcome_code IN ('positive', 'follow_up_required', 'decision_pending') THEN
    SELECT id
    INTO v_pending_status_id
    FROM public.followup_statuses
    WHERE code = 'pending' AND is_active = true
    LIMIT 1;

    IF v_pending_status_id IS NOT NULL AND v_activity_id IS NOT NULL THEN
      v_followup_due_at := now() + interval '1 day';

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
        v_demo.lead_id,
        v_demo.presenter_profile_id,
        v_followup_due_at,
        'Follow up after demo (' || v_outcome_code || ')',
        v_pending_status_id,
        p_updated_by_profile_id,
        p_updated_by_profile_id
      );
    END IF;
  END IF;

  RETURN p_demo_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Cancel demo
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_demo(
  p_demo_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_demo public.demos%ROWTYPE;
  v_cancelled_status_id uuid;
BEGIN
  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  SELECT * INTO v_demo FROM public.demos WHERE id = p_demo_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demo not found';
  END IF;

  IF NOT public.can_access_lead(v_demo.lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF (SELECT code FROM public.demo_statuses WHERE id = v_demo.demo_status_id) <> 'scheduled' THEN
    RAISE EXCEPTION 'Only scheduled demos can be cancelled';
  END IF;

  v_cancelled_status_id := public.get_demo_status_id('cancelled');
  IF v_cancelled_status_id IS NULL THEN
    RAISE EXCEPTION 'Cancelled demo status not found';
  END IF;

  UPDATE public.demos
  SET
    demo_status_id = v_cancelled_status_id,
    cancelled_at = now(),
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_demo_id;

  RETURN p_demo_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Reschedule demo (update in place + audit log)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reschedule_demo(
  p_demo_id uuid,
  p_scheduled_at timestamptz,
  p_duration_minutes integer,
  p_demo_mode public.demo_mode,
  p_meeting_link text,
  p_venue text,
  p_presenter_profile_id uuid,
  p_attendees text,
  p_internal_notes text,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_demo public.demos%ROWTYPE;
  v_previous_scheduled_at timestamptz;
BEGIN
  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  SELECT * INTO v_demo FROM public.demos WHERE id = p_demo_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demo not found';
  END IF;

  IF NOT public.can_access_lead(v_demo.lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF (SELECT code FROM public.demo_statuses WHERE id = v_demo.demo_status_id) <> 'scheduled' THEN
    RAISE EXCEPTION 'Only scheduled demos can be rescheduled';
  END IF;

  IF p_scheduled_at < now() THEN
    RAISE EXCEPTION 'Demo date cannot be in the past';
  END IF;

  IF p_duration_minutes IS NULL OR p_duration_minutes <= 0 THEN
    RAISE EXCEPTION 'Duration must be greater than zero';
  END IF;

  v_previous_scheduled_at := v_demo.scheduled_at;

  UPDATE public.demos
  SET
    scheduled_at = p_scheduled_at,
    duration_minutes = p_duration_minutes,
    demo_mode = p_demo_mode,
    meeting_link = NULLIF(trim(p_meeting_link), ''),
    venue = NULLIF(trim(p_venue), ''),
    presenter_profile_id = p_presenter_profile_id,
    attendees = NULLIF(trim(p_attendees), ''),
    internal_notes = NULLIF(trim(p_internal_notes), ''),
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_demo_id;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'updated',
    'demo',
    p_demo_id,
    jsonb_build_object(
      'change', 'rescheduled',
      'previous_scheduled_at', v_previous_scheduled_at,
      'scheduled_at', p_scheduled_at
    )
  );

  PERFORM public.update_demo_pending_followup_due_at(
    v_demo.lead_id,
    p_presenter_profile_id,
    p_scheduled_at,
    p_updated_by_profile_id
  );

  RETURN p_demo_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_demo_status_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_demo_outcome_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.write_audit_log(uuid, public.audit_action, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_demo_followup(uuid, uuid, uuid, uuid, timestamptz, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_demo_pending_followup_due_at(uuid, uuid, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_demo(uuid, timestamptz, integer, public.demo_mode, text, text, uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_demo(uuid, timestamptz, integer, public.demo_mode, text, text, uuid, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_demo(uuid, uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_demo(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_demo(uuid, timestamptz, integer, public.demo_mode, text, text, uuid, text, text, uuid) TO authenticated;
