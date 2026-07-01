-- Milestone 20A — Organization Settings & System Information refinement

INSERT INTO public.app_settings (key, value, description) VALUES
  ('organization_address', '""'::jsonb, 'Organization street address'),
  ('organization_city', '""'::jsonb, 'Organization city'),
  ('organization_state', '""'::jsonb, 'Organization state or region'),
  ('organization_country', '""'::jsonb, 'Organization country'),
  ('organization_pincode', '""'::jsonb, 'Organization postal code'),
  ('organization_contact_email', '""'::jsonb, 'Organization contact email'),
  ('organization_contact_phone', '""'::jsonb, 'Organization contact phone'),
  ('organization_website', '""'::jsonb, 'Organization website')
ON CONFLICT (key) DO NOTHING;

UPDATE public.app_settings
SET value = '"20250701270000"'::jsonb, updated_at = now()
WHERE key = 'schema_version';

DROP FUNCTION IF EXISTS public.update_organization_settings(
  text, text, text, text, text, text, text, uuid
);

CREATE OR REPLACE FUNCTION public.update_organization_settings(
  p_organization_name text,
  p_address text,
  p_city text,
  p_state text,
  p_country text,
  p_pincode text,
  p_contact_email text,
  p_contact_phone text,
  p_website text,
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
DECLARE
  v_old_timezone text;
  v_old_hours_start text;
  v_old_hours_end text;
  v_old_name text;
  v_old_address text;
  v_old_city text;
  v_old_state text;
  v_old_country text;
  v_old_pincode text;
  v_old_contact_email text;
  v_old_contact_phone text;
  v_old_website text;
  v_old_followup_time text;
  v_old_date_format text;
  v_old_time_format text;
  v_organization_changed boolean := false;
  v_timezone_changed boolean := false;
  v_business_hours_changed boolean := false;
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

  IF p_date_format NOT IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD') THEN
    RAISE EXCEPTION 'Invalid date format';
  END IF;

  IF p_time_format NOT IN ('HH:mm', 'hh:mm A') THEN
    RAISE EXCEPTION 'Invalid time format';
  END IF;

  IF trim(coalesce(p_contact_email, '')) <> ''
    AND trim(p_contact_email) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid contact email';
  END IF;

  SELECT value #>> '{}'
  INTO v_old_name
  FROM public.app_settings
  WHERE key = 'organization_name';

  SELECT value #>> '{}'
  INTO v_old_address
  FROM public.app_settings
  WHERE key = 'organization_address';

  SELECT value #>> '{}'
  INTO v_old_city
  FROM public.app_settings
  WHERE key = 'organization_city';

  SELECT value #>> '{}'
  INTO v_old_state
  FROM public.app_settings
  WHERE key = 'organization_state';

  SELECT value #>> '{}'
  INTO v_old_country
  FROM public.app_settings
  WHERE key = 'organization_country';

  SELECT value #>> '{}'
  INTO v_old_pincode
  FROM public.app_settings
  WHERE key = 'organization_pincode';

  SELECT value #>> '{}'
  INTO v_old_contact_email
  FROM public.app_settings
  WHERE key = 'organization_contact_email';

  SELECT value #>> '{}'
  INTO v_old_contact_phone
  FROM public.app_settings
  WHERE key = 'organization_contact_phone';

  SELECT value #>> '{}'
  INTO v_old_website
  FROM public.app_settings
  WHERE key = 'organization_website';

  SELECT value #>> '{}'
  INTO v_old_timezone
  FROM public.app_settings
  WHERE key = 'organization_timezone';

  SELECT value #>> '{}'
  INTO v_old_hours_start
  FROM public.app_settings
  WHERE key = 'business_hours_start';

  SELECT value #>> '{}'
  INTO v_old_hours_end
  FROM public.app_settings
  WHERE key = 'business_hours_end';

  SELECT value #>> '{}'
  INTO v_old_followup_time
  FROM public.app_settings
  WHERE key = 'default_followup_time';

  SELECT value #>> '{}'
  INTO v_old_date_format
  FROM public.app_settings
  WHERE key = 'date_format';

  SELECT value #>> '{}'
  INTO v_old_time_format
  FROM public.app_settings
  WHERE key = 'time_format';

  INSERT INTO public.app_settings (key, value, updated_by_profile_id) VALUES
    ('organization_name', to_jsonb(trim(p_organization_name)), p_updated_by_profile_id),
    ('organization_address', to_jsonb(trim(coalesce(p_address, ''))), p_updated_by_profile_id),
    ('organization_city', to_jsonb(trim(coalesce(p_city, ''))), p_updated_by_profile_id),
    ('organization_state', to_jsonb(trim(coalesce(p_state, ''))), p_updated_by_profile_id),
    ('organization_country', to_jsonb(trim(coalesce(p_country, ''))), p_updated_by_profile_id),
    ('organization_pincode', to_jsonb(trim(coalesce(p_pincode, ''))), p_updated_by_profile_id),
    ('organization_contact_email', to_jsonb(trim(coalesce(p_contact_email, ''))), p_updated_by_profile_id),
    ('organization_contact_phone', to_jsonb(trim(coalesce(p_contact_phone, ''))), p_updated_by_profile_id),
    ('organization_website', to_jsonb(trim(coalesce(p_website, ''))), p_updated_by_profile_id),
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

  v_organization_changed :=
    coalesce(v_old_name, '') <> trim(p_organization_name)
    OR coalesce(v_old_address, '') <> trim(coalesce(p_address, ''))
    OR coalesce(v_old_city, '') <> trim(coalesce(p_city, ''))
    OR coalesce(v_old_state, '') <> trim(coalesce(p_state, ''))
    OR coalesce(v_old_country, '') <> trim(coalesce(p_country, ''))
    OR coalesce(v_old_pincode, '') <> trim(coalesce(p_pincode, ''))
    OR coalesce(v_old_contact_email, '') <> trim(coalesce(p_contact_email, ''))
    OR coalesce(v_old_contact_phone, '') <> trim(coalesce(p_contact_phone, ''))
    OR coalesce(v_old_website, '') <> trim(coalesce(p_website, ''))
    OR coalesce(v_old_followup_time, '') <> trim(p_default_followup_time)
    OR coalesce(v_old_date_format, '') <> trim(p_date_format)
    OR coalesce(v_old_time_format, '') <> trim(p_time_format);

  v_timezone_changed := coalesce(v_old_timezone, '') <> trim(p_timezone);

  v_business_hours_changed :=
    coalesce(v_old_hours_start, '') <> trim(p_business_hours_start)
    OR coalesce(v_old_hours_end, '') <> trim(p_business_hours_end);

  IF v_organization_changed THEN
    PERFORM public.write_audit_log(
      p_updated_by_profile_id,
      'updated',
      'app_settings',
      public.current_profile_id(),
      jsonb_build_object('event', 'organization_updated')
    );
  END IF;

  IF v_timezone_changed THEN
    PERFORM public.write_audit_log(
      p_updated_by_profile_id,
      'updated',
      'app_settings',
      public.current_profile_id(),
      jsonb_build_object(
        'event', 'timezone_changed',
        'from', v_old_timezone,
        'to', trim(p_timezone)
      )
    );
  END IF;

  IF v_business_hours_changed THEN
    PERFORM public.write_audit_log(
      p_updated_by_profile_id,
      'updated',
      'app_settings',
      public.current_profile_id(),
      jsonb_build_object(
        'event', 'business_hours_updated',
        'from', jsonb_build_object(
          'start', v_old_hours_start,
          'end', v_old_hours_end
        ),
        'to', jsonb_build_object(
          'start', trim(p_business_hours_start),
          'end', trim(p_business_hours_end)
        )
      )
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_organization_settings(
  text, text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, uuid
) TO authenticated;
