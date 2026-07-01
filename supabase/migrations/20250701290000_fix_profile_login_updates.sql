-- Fix profile updates during login (last_login_at + invited activation)

-- ---------------------------------------------------------------------------
-- Trigger: allow first-login activation; still block privilege escalation
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

  -- First login: invited -> active (activate_invited_profile RPC)
  IF OLD.status = 'invited'
    AND NEW.status = 'active'
    AND NEW.role_id IS NOT DISTINCT FROM OLD.role_id
    AND NEW.manager_profile_id IS NOT DISTINCT FROM OLD.manager_profile_id
    AND NEW.email IS NOT DISTINCT FROM OLD.email
    AND NEW.auth_user_id IS NOT DISTINCT FROM OLD.auth_user_id
    AND NEW.archived_at IS NOT DISTINCT FROM OLD.archived_at
    AND NEW.invited_at IS NOT DISTINCT FROM OLD.invited_at
  THEN
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

-- ---------------------------------------------------------------------------
-- Login timestamp via RPC (bypasses RLS; trigger allows last_login_at only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_last_login_at(p_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_profile_id IS DISTINCT FROM public.current_profile_id() THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  UPDATE public.profiles
  SET last_login_at = now()
  WHERE profile_id = p_profile_id
    AND auth_user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_last_login_at(uuid) TO authenticated;

UPDATE public.app_settings
SET value = '"20250701290000"'::jsonb, updated_at = now()
WHERE key = 'schema_version';
