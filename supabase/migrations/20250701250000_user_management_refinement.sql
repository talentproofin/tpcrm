-- Milestone 19 — User Management refinement
-- Lifecycle, manager rules, self-modification guards, audit logging

-- ---------------------------------------------------------------------------
-- Manager validation — Admin and Manager only (CEO excluded)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_valid_manager_profile(p_manager_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles mp
    JOIN public.roles mr ON mr.id = mp.role_id
    WHERE mp.profile_id = p_manager_profile_id
      AND mp.archived_at IS NULL
      AND mr.code IN ('admin', 'manager')
  );
$$;

-- ---------------------------------------------------------------------------
-- Status transition validation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_valid_profile_status_transition(
  p_from public.user_status,
  p_to public.user_status
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_from = p_to THEN true
    WHEN p_to = 'invited' THEN false
    WHEN p_from = 'invited' AND p_to IN ('active', 'inactive', 'suspended') THEN true
    WHEN p_from = 'active' AND p_to IN ('inactive', 'suspended') THEN true
    WHEN p_from = 'inactive' AND p_to = 'active' THEN true
    WHEN p_from = 'suspended' AND p_to = 'active' THEN true
    ELSE false
  END;
$$;

-- ---------------------------------------------------------------------------
-- Activate invited profile on first successful login
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activate_invited_profile(p_profile_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE profile_id = p_profile_id
    AND auth_user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_profile.status <> 'invited' THEN
    RETURN p_profile_id;
  END IF;

  UPDATE public.profiles
  SET
    status = 'active',
    activated_at = now(),
    updated_at = now()
  WHERE profile_id = p_profile_id;

  PERFORM public.write_audit_log(
    p_profile_id,
    'updated',
    'profile',
    p_profile_id,
    jsonb_build_object(
      'event', 'status_changed',
      'from_status', 'invited',
      'to_status', 'active',
      'source', 'first_login'
    )
  );

  RETURN p_profile_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin create profile — always invited
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_create_profile(
  p_auth_user_id uuid,
  p_full_name text,
  p_email text,
  p_role_id uuid,
  p_manager_profile_id uuid,
  p_phone text,
  p_status public.user_status,
  p_created_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  IF p_created_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid creator profile';
  END IF;

  IF trim(p_full_name) = '' THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;

  IF trim(p_email) = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF p_role_id IS NULL THEN
    RAISE EXCEPTION 'Role is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE id = p_role_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid role assignment';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE lower(trim(email)) = lower(trim(p_email))
  ) THEN
    RAISE EXCEPTION 'A user with this email already exists';
  END IF;

  IF p_manager_profile_id IS NOT NULL THEN
    IF NOT public.is_valid_manager_profile(p_manager_profile_id) THEN
      RAISE EXCEPTION 'Invalid manager assignment';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    auth_user_id,
    role_id,
    manager_profile_id,
    full_name,
    email,
    phone,
    status,
    invited_at,
    created_by_profile_id,
    updated_by_profile_id
  ) VALUES (
    p_auth_user_id,
    p_role_id,
    p_manager_profile_id,
    trim(p_full_name),
    lower(trim(p_email)),
    NULLIF(trim(p_phone), ''),
    'invited',
    now(),
    p_created_by_profile_id,
    p_created_by_profile_id
  )
  RETURNING profile_id INTO v_profile_id;

  PERFORM public.write_audit_log(
    p_created_by_profile_id,
    'created',
    'profile',
    v_profile_id,
    jsonb_build_object(
      'event', 'user_invited',
      'email', lower(trim(p_email)),
      'role_id', p_role_id
    )
  );

  RETURN v_profile_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin update profile — guards + transitions + audit
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  p_profile_id uuid,
  p_full_name text,
  p_phone text,
  p_role_id uuid,
  p_manager_profile_id uuid,
  p_status public.user_status,
  p_updated_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update users';
  END IF;

  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE profile_id = p_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF trim(p_full_name) = '' THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;

  IF p_role_id IS NULL THEN
    RAISE EXCEPTION 'Role is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE id = p_role_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid role assignment';
  END IF;

  IF p_manager_profile_id = p_profile_id THEN
    RAISE EXCEPTION 'A user cannot be assigned as their own manager';
  END IF;

  IF p_manager_profile_id IS NOT NULL THEN
    IF NOT public.is_valid_manager_profile(p_manager_profile_id) THEN
      RAISE EXCEPTION 'Invalid manager assignment';
    END IF;
  END IF;

  IF p_status NOT IN ('active', 'inactive', 'suspended', 'invited') THEN
    RAISE EXCEPTION 'Invalid user status';
  END IF;

  IF p_profile_id = p_updated_by_profile_id THEN
    IF p_role_id <> v_profile.role_id THEN
      RAISE EXCEPTION 'You cannot change your own role';
    END IF;

    IF p_status IN ('inactive', 'suspended') THEN
      RAISE EXCEPTION 'You cannot deactivate or suspend your own account';
    END IF;
  END IF;

  IF NOT public.is_valid_profile_status_transition(v_profile.status, p_status) THEN
    RAISE EXCEPTION 'Invalid status transition';
  END IF;

  UPDATE public.profiles
  SET
    full_name = trim(p_full_name),
    phone = NULLIF(trim(p_phone), ''),
    role_id = p_role_id,
    manager_profile_id = p_manager_profile_id,
    status = p_status,
    activated_at = CASE
      WHEN p_status = 'active' AND activated_at IS NULL THEN now()
      ELSE activated_at
    END,
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE profile_id = p_profile_id;

  PERFORM public.write_audit_log(
    p_updated_by_profile_id,
    'updated',
    'profile',
    p_profile_id,
    jsonb_build_object('event', 'user_updated')
  );

  IF v_profile.role_id <> p_role_id THEN
    PERFORM public.write_audit_log(
      p_updated_by_profile_id,
      'updated',
      'profile',
      p_profile_id,
      jsonb_build_object(
        'event', 'role_changed',
        'from_role_id', v_profile.role_id,
        'to_role_id', p_role_id
      )
    );
  END IF;

  IF v_profile.status <> p_status THEN
    PERFORM public.write_audit_log(
      p_updated_by_profile_id,
      'updated',
      'profile',
      p_profile_id,
      jsonb_build_object(
        'event', 'status_changed',
        'from_status', v_profile.status,
        'to_status', p_status
      )
    );
  END IF;

  RETURN p_profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_valid_profile_status_transition(public.user_status, public.user_status) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_invited_profile(uuid) TO authenticated;
