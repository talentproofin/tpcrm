-- Milestone 20B — Production security hardening

-- ---------------------------------------------------------------------------
-- Profile self-update: prevent privilege escalation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_guard_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role_id IS DISTINCT FROM OLD.role_id
    OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.manager_profile_id IS DISTINCT FROM OLD.manager_profile_id
    OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id
    OR NEW.archived_at IS DISTINCT FROM OLD.archived_at
    OR NEW.invited_at IS DISTINCT FROM OLD.invited_at
    OR NEW.activated_at IS DISTINCT FROM OLD.activated_at
  THEN
    RAISE EXCEPTION 'Unauthorized profile field change';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_guard_self_update ON public.profiles;
CREATE TRIGGER trg_profiles_guard_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_guard_self_update();

-- ---------------------------------------------------------------------------
-- Audit log integrity and confidentiality
-- ---------------------------------------------------------------------------
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
  IF p_actor_profile_id IS DISTINCT FROM public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid audit actor';
  END IF;

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

DROP POLICY IF EXISTS audit_logs_select_authenticated ON public.audit_logs;
CREATE POLICY audit_logs_select_admin_ceo
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR public.is_ceo());

-- ---------------------------------------------------------------------------
-- Lead insert: restrict owner assignment
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS leads_insert_authenticated ON public.leads;
CREATE POLICY leads_insert_authenticated
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_profile_id = public.current_profile_id()
    AND (
      owner_profile_id = public.current_profile_id()
      OR public.is_admin()
      OR public.is_manager()
    )
  );

-- ---------------------------------------------------------------------------
-- Lookup probe functions: settings access only
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lookup_record_in_use(
  p_table_name text,
  p_record_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_access_settings() THEN
    RAISE EXCEPTION 'Settings access required';
  END IF;

  IF NOT public.is_allowed_lookup_table(p_table_name) THEN
    RAISE EXCEPTION 'Invalid lookup table';
  END IF;

  CASE p_table_name
    WHEN 'lead_types' THEN
      RETURN EXISTS (SELECT 1 FROM public.leads WHERE lead_type_id = p_record_id);
    WHEN 'lead_sources' THEN
      RETURN EXISTS (SELECT 1 FROM public.leads WHERE lead_source_id = p_record_id);
    WHEN 'lead_stages' THEN
      RETURN EXISTS (SELECT 1 FROM public.leads WHERE stage_id = p_record_id);
    WHEN 'activity_types' THEN
      RETURN EXISTS (SELECT 1 FROM public.activities WHERE activity_type_id = p_record_id);
    WHEN 'activity_outcomes' THEN
      RETURN EXISTS (SELECT 1 FROM public.activities WHERE activity_outcome_id = p_record_id);
    WHEN 'demo_outcomes' THEN
      RETURN EXISTS (SELECT 1 FROM public.demos WHERE demo_outcome_id = p_record_id);
    WHEN 'demo_statuses' THEN
      RETURN EXISTS (SELECT 1 FROM public.demos WHERE demo_status_id = p_record_id);
    WHEN 'followup_statuses' THEN
      RETURN EXISTS (SELECT 1 FROM public.follow_ups WHERE followup_status_id = p_record_id);
    ELSE
      RETURN false;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.lookup_display_order_exists(
  p_table_name text,
  p_display_order integer,
  p_record_id uuid,
  p_activity_type_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  IF NOT public.can_access_settings() THEN
    RAISE EXCEPTION 'Settings access required';
  END IF;

  IF NOT public.is_allowed_lookup_table(p_table_name) THEN
    RAISE EXCEPTION 'Invalid lookup table';
  END IF;

  IF p_table_name = 'activity_outcomes' THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.activity_outcomes
      WHERE activity_type_id = p_activity_type_id
        AND display_order = p_display_order
        AND (p_record_id IS NULL OR id <> p_record_id)
    ) INTO v_exists;
  ELSE
    EXECUTE format(
      'SELECT EXISTS (
         SELECT 1 FROM public.%I
         WHERE display_order = $1 AND ($2::uuid IS NULL OR id <> $2)
       )',
      p_table_name
    )
    INTO v_exists
    USING p_display_order, p_record_id;
  END IF;

  RETURN v_exists;
END;
$$;

-- ---------------------------------------------------------------------------
-- Archive RPCs: validate updater profile
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_restore_lead(
  p_lead_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can restore archived records';
  END IF;

  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  UPDATE public.leads
  SET
    deleted_at = NULL,
    deleted_by_profile_id = NULL,
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_lead_id
    AND deleted_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Archived lead not found';
  END IF;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'restored',
    'lead',
    p_lead_id,
    jsonb_build_object('event', 'record_restored')
  );

  RETURN p_lead_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_permanent_delete_lead(
  p_lead_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can permanently delete records';
  END IF;

  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.leads WHERE id = p_lead_id AND deleted_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Lead must be archived before permanent deletion';
  END IF;

  IF EXISTS (SELECT 1 FROM public.activities WHERE lead_id = p_lead_id)
    OR EXISTS (SELECT 1 FROM public.follow_ups WHERE lead_id = p_lead_id)
    OR EXISTS (SELECT 1 FROM public.contacts WHERE lead_id = p_lead_id)
    OR EXISTS (SELECT 1 FROM public.demos WHERE lead_id = p_lead_id) THEN
    RAISE EXCEPTION 'Cannot permanently delete lead while dependencies exist';
  END IF;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'permanent_deleted',
    'lead',
    p_lead_id,
    jsonb_build_object('event', 'record_permanently_deleted')
  );

  DELETE FROM public.leads WHERE id = p_lead_id;

  RETURN p_lead_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_restore_contact(
  p_contact_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can restore archived records';
  END IF;

  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  UPDATE public.contacts
  SET
    is_active = true,
    archived_at = NULL,
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_contact_id
    AND archived_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Archived contact not found';
  END IF;

  PERFORM public.sync_lead_primary_from_contact(
    (SELECT lead_id FROM public.contacts WHERE id = p_contact_id)
  );

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'restored',
    'contact',
    p_contact_id,
    jsonb_build_object('event', 'record_restored')
  );

  RETURN p_contact_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_permanent_delete_contact(
  p_contact_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id uuid;
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can permanently delete records';
  END IF;

  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  SELECT lead_id INTO v_lead_id
  FROM public.contacts
  WHERE id = p_contact_id AND archived_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contact must be archived before permanent deletion';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.contacts
    WHERE id = p_contact_id AND is_primary = true
  ) THEN
    RAISE EXCEPTION 'Cannot permanently delete the primary contact';
  END IF;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'permanent_deleted',
    'contact',
    p_contact_id,
    jsonb_build_object('event', 'record_permanently_deleted')
  );

  DELETE FROM public.contacts WHERE id = p_contact_id;

  PERFORM public.sync_lead_primary_from_contact(v_lead_id);

  RETURN p_contact_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_restore_demo(
  p_demo_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scheduled_status_id uuid;
  v_cancelled_status_id uuid;
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can restore archived records';
  END IF;

  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  v_scheduled_status_id := public.get_demo_status_id('scheduled');
  v_cancelled_status_id := public.get_demo_status_id('cancelled');
  IF v_scheduled_status_id IS NULL OR v_cancelled_status_id IS NULL THEN
    RAISE EXCEPTION 'Demo status lookup missing';
  END IF;

  UPDATE public.demos
  SET
    demo_status_id = v_scheduled_status_id,
    cancelled_at = NULL,
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_demo_id
    AND demo_status_id = v_cancelled_status_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Archived demo not found';
  END IF;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'restored',
    'demo',
    p_demo_id,
    jsonb_build_object('event', 'record_restored')
  );

  RETURN p_demo_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_permanent_delete_demo(
  p_demo_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cancelled_status_id uuid;
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can permanently delete records';
  END IF;

  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  v_cancelled_status_id := public.get_demo_status_id('cancelled');

  IF NOT EXISTS (
    SELECT 1
    FROM public.demos d
    WHERE d.id = p_demo_id
      AND d.demo_status_id = v_cancelled_status_id
  ) THEN
    RAISE EXCEPTION 'Demo must be cancelled before permanent deletion';
  END IF;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'permanent_deleted',
    'demo',
    p_demo_id,
    jsonb_build_object('event', 'record_permanently_deleted')
  );

  DELETE FROM public.demos WHERE id = p_demo_id;

  RETURN p_demo_id;
END;
$$;

UPDATE public.app_settings
SET value = '"20250701280000"'::jsonb, updated_at = now()
WHERE key = 'schema_version';
