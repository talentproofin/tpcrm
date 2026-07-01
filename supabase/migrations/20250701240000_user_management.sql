-- Milestone 19 — User Management & Administration
-- Profile access helpers, RLS, admin profile RPCs

-- ---------------------------------------------------------------------------
-- Unique email constraint
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_email_lower
  ON public.profiles (lower(trim(email)));

-- ---------------------------------------------------------------------------
-- Role helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role_code()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.code
  FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role_code() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_ceo()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role_code() = 'ceo';
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role_code() = 'manager';
$$;

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
      AND mr.code IN ('ceo', 'admin', 'manager')
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security — profiles (user management)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select_admin_ceo ON public.profiles;
CREATE POLICY profiles_select_admin_ceo
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR public.is_ceo());

DROP POLICY IF EXISTS profiles_select_manager_team ON public.profiles;
CREATE POLICY profiles_select_manager_team
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.is_manager()
    AND (
      manager_profile_id = public.current_profile_id()
      OR profile_id = public.current_profile_id()
    )
  );

DROP POLICY IF EXISTS profiles_insert_admin ON public.profiles;
CREATE POLICY profiles_insert_admin
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin create profile (linked to auth user)
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

  IF p_status NOT IN ('active', 'inactive', 'suspended', 'invited') THEN
    RAISE EXCEPTION 'Invalid user status';
  END IF;

  INSERT INTO public.profiles (
    auth_user_id,
    role_id,
    manager_profile_id,
    full_name,
    email,
    phone,
    status,
    activated_at,
    created_by_profile_id,
    updated_by_profile_id
  ) VALUES (
    p_auth_user_id,
    p_role_id,
    p_manager_profile_id,
    trim(p_full_name),
    lower(trim(p_email)),
    NULLIF(trim(p_phone), ''),
    p_status,
    CASE WHEN p_status = 'active' THEN now() ELSE NULL END,
    p_created_by_profile_id,
    p_created_by_profile_id
  )
  RETURNING profile_id INTO v_profile_id;

  RETURN v_profile_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin update profile
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

  RETURN p_profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_ceo() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_manager_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_profile(uuid, text, text, uuid, uuid, text, public.user_status, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_profile(uuid, text, text, uuid, uuid, public.user_status, uuid) TO authenticated;
