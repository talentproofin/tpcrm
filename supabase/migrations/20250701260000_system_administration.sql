-- Milestone 20 — System Administration & Settings
-- app_settings, lookup admin RPCs, archive management RPCs

-- ---------------------------------------------------------------------------
-- app_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_profile_id uuid REFERENCES public.profiles (profile_id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS trg_app_settings_set_updated_at ON public.app_settings;
CREATE TRIGGER trg_app_settings_set_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_settings_select_settings_access ON public.app_settings;
CREATE POLICY app_settings_select_settings_access
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR public.is_ceo());

DROP POLICY IF EXISTS app_settings_update_admin ON public.app_settings;
CREATE POLICY app_settings_update_admin
  ON public.app_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS app_settings_insert_admin ON public.app_settings;
CREATE POLICY app_settings_insert_admin
  ON public.app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

INSERT INTO public.app_settings (key, value, description) VALUES
  ('organization_name', '"TalentProof"'::jsonb, 'Organization display name'),
  ('organization_timezone', '"Asia/Kolkata"'::jsonb, 'Organization timezone'),
  ('business_hours_start', '"09:00"'::jsonb, 'Business hours start (HH:mm)'),
  ('business_hours_end', '"18:00"'::jsonb, 'Business hours end (HH:mm)'),
  ('default_followup_time', '"10:00"'::jsonb, 'Default follow-up time (HH:mm)'),
  ('date_format', '"DD/MM/YYYY"'::jsonb, 'Date display format'),
  ('time_format', '"HH:mm"'::jsonb, 'Time display format'),
  ('schema_version', '"20250701260000"'::jsonb, 'Latest applied migration version')
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Settings access helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_access_settings()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_ceo();
$$;

CREATE OR REPLACE FUNCTION public.can_manage_settings()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin();
$$;

CREATE OR REPLACE FUNCTION public.is_allowed_lookup_table(p_table_name text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_table_name IN (
    'lead_types',
    'lead_sources',
    'lead_stages',
    'activity_types',
    'activity_outcomes',
    'demo_outcomes',
    'demo_statuses',
    'followup_statuses'
  );
$$;

-- ---------------------------------------------------------------------------
-- Organization settings
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_organization_settings(
  p_organization_name text,
  p_timezone text,
  p_business_hours_start text,
  p_business_hours_end text,
  p_default_followup_time text,
  p_date_format text,
  p_time_format text,
  p_updated_by_profile_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can update organization settings';
  END IF;

  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  IF trim(p_organization_name) = '' THEN
    RAISE EXCEPTION 'Organization name is required';
  END IF;

  IF trim(p_timezone) = '' THEN
    RAISE EXCEPTION 'Timezone is required';
  END IF;

  IF p_business_hours_start !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    OR p_business_hours_end !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    OR p_default_followup_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN
    RAISE EXCEPTION 'Invalid time format';
  END IF;

  IF p_business_hours_start >= p_business_hours_end THEN
    RAISE EXCEPTION 'Business hours end must be after start';
  END IF;

  INSERT INTO public.app_settings (key, value, updated_by_profile_id) VALUES
    ('organization_name', to_jsonb(trim(p_organization_name)), p_updated_by_profile_id),
    ('organization_timezone', to_jsonb(trim(p_timezone)), p_updated_by_profile_id),
    ('business_hours_start', to_jsonb(trim(p_business_hours_start)), p_updated_by_profile_id),
    ('business_hours_end', to_jsonb(trim(p_business_hours_end)), p_updated_by_profile_id),
    ('default_followup_time', to_jsonb(trim(p_default_followup_time)), p_updated_by_profile_id),
    ('date_format', to_jsonb(trim(p_date_format)), p_updated_by_profile_id),
    ('time_format', to_jsonb(trim(p_time_format)), p_updated_by_profile_id)
  ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_by_profile_id = EXCLUDED.updated_by_profile_id,
    updated_at = now();

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'updated',
    'app_settings',
    public.current_profile_id(),
    jsonb_build_object('event', 'organization_updated')
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Lookup usage check
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
-- Lookup admin save / activate
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_save_lookup(
  p_table_name text,
  p_record_id uuid,
  p_code text,
  p_name text,
  p_display_order integer,
  p_activity_type_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id uuid;
  v_code_exists boolean;
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can manage lookups';
  END IF;

  IF NOT public.is_allowed_lookup_table(p_table_name) THEN
    RAISE EXCEPTION 'Invalid lookup table';
  END IF;

  IF trim(p_code) = '' OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Code and name are required';
  END IF;

  IF p_display_order IS NULL OR p_display_order <= 0 THEN
    RAISE EXCEPTION 'Display order must be greater than zero';
  END IF;

  IF public.lookup_display_order_exists(
    p_table_name, p_display_order, p_record_id, p_activity_type_id
  ) THEN
    RAISE EXCEPTION 'Display order is already in use';
  END IF;

  IF p_table_name = 'activity_outcomes' THEN
    IF p_activity_type_id IS NULL THEN
      RAISE EXCEPTION 'Activity type is required for activity outcomes';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.activity_outcomes
      WHERE activity_type_id = p_activity_type_id
        AND lower(code) = lower(trim(p_code))
        AND (p_record_id IS NULL OR id <> p_record_id)
    ) THEN
      RAISE EXCEPTION 'A lookup with this code already exists';
    END IF;

    IF p_record_id IS NULL THEN
      INSERT INTO public.activity_outcomes (
        activity_type_id, code, name, display_order, is_active
      ) VALUES (
        p_activity_type_id, lower(trim(p_code)), trim(p_name), p_display_order, true
      )
      RETURNING id INTO v_record_id;
    ELSE
      UPDATE public.activity_outcomes
      SET
        code = lower(trim(p_code)),
        name = trim(p_name),
        display_order = p_display_order,
        activity_type_id = p_activity_type_id,
        updated_at = now()
      WHERE id = p_record_id
      RETURNING id INTO v_record_id;
    END IF;
  ELSE
    EXECUTE format(
      'SELECT EXISTS (
         SELECT 1 FROM public.%I
         WHERE lower(code) = lower($1) AND ($2::uuid IS NULL OR id <> $2)
       )',
      p_table_name
    )
    INTO v_code_exists
    USING trim(p_code), p_record_id;

    IF v_code_exists THEN
      RAISE EXCEPTION 'A lookup with this code already exists';
    END IF;

    IF p_record_id IS NULL THEN
      EXECUTE format(
        'INSERT INTO public.%I (code, name, display_order, is_active)
         VALUES ($1, $2, $3, true) RETURNING id',
        p_table_name
      )
      INTO v_record_id
      USING lower(trim(p_code)), trim(p_name), p_display_order;
    ELSE
      EXECUTE format(
        'UPDATE public.%I
         SET code = $1, name = $2, display_order = $3, updated_at = now()
         WHERE id = $4 RETURNING id',
        p_table_name
      )
      INTO v_record_id
      USING lower(trim(p_code)), trim(p_name), p_display_order, p_record_id;
    END IF;
  END IF;

  IF v_record_id IS NULL THEN
    RAISE EXCEPTION 'Lookup record not found';
  END IF;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    CASE WHEN p_record_id IS NULL THEN 'created' ELSE 'updated' END::public.audit_action,
    p_table_name,
    v_record_id,
    jsonb_build_object(
      'event', CASE WHEN p_record_id IS NULL THEN 'lookup_added' ELSE 'lookup_updated' END,
      'code', lower(trim(p_code))
    )
  );

  RETURN v_record_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_lookup_active(
  p_table_name text,
  p_record_id uuid,
  p_is_active boolean,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id uuid;
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Only admins can manage lookups';
  END IF;

  IF NOT public.is_allowed_lookup_table(p_table_name) THEN
    RAISE EXCEPTION 'Invalid lookup table';
  END IF;

  IF NOT p_is_active AND public.lookup_record_in_use(p_table_name, p_record_id) THEN
    RAISE EXCEPTION 'Cannot archive lookup while it is in use';
  END IF;

  IF p_table_name = 'activity_outcomes' THEN
    UPDATE public.activity_outcomes
    SET is_active = p_is_active, updated_at = now()
    WHERE id = p_record_id
    RETURNING id INTO v_record_id;
  ELSE
    EXECUTE format(
      'UPDATE public.%I SET is_active = $1, updated_at = now() WHERE id = $2 RETURNING id',
      p_table_name
    )
    INTO v_record_id
    USING p_is_active, p_record_id;
  END IF;

  IF v_record_id IS NULL THEN
    RAISE EXCEPTION 'Lookup record not found';
  END IF;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'updated',
    p_table_name,
    v_record_id,
    jsonb_build_object(
      'event', CASE WHEN p_is_active THEN 'lookup_restored' ELSE 'lookup_archived' END
    )
  );

  RETURN v_record_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Archive management — leads
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

-- ---------------------------------------------------------------------------
-- Archive management — contacts
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Archive management — demos (cancelled)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Admin archive visibility policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS leads_select_settings_admin ON public.leads;
CREATE POLICY leads_select_settings_admin
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (public.can_access_settings());

DROP POLICY IF EXISTS contacts_select_settings_admin ON public.contacts;
CREATE POLICY contacts_select_settings_admin
  ON public.contacts
  FOR SELECT
  TO authenticated
  USING (public.can_access_settings());

DROP POLICY IF EXISTS demos_select_settings_admin ON public.demos;
CREATE POLICY demos_select_settings_admin
  ON public.demos
  FOR SELECT
  TO authenticated
  USING (public.can_access_settings());

GRANT EXECUTE ON FUNCTION public.can_access_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_allowed_lookup_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_organization_settings(text, text, text, text, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_record_in_use(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_display_order_exists(text, integer, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_lookup(text, uuid, text, text, integer, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_lookup_active(text, uuid, boolean, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_restore_lead(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_permanent_delete_lead(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_restore_contact(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_permanent_delete_contact(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_restore_demo(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_permanent_delete_demo(uuid, uuid) TO authenticated;
