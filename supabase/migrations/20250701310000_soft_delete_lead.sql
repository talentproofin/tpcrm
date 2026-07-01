-- Soft delete lead via RPC with validation and audit logging

CREATE OR REPLACE FUNCTION public.soft_delete_lead(
  p_lead_id uuid,
  p_deleted_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads%ROWTYPE;
BEGIN
  IF p_deleted_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid deleter profile';
  END IF;

  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  IF NOT public.can_access_lead(p_lead_id) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'You do not have permission to delete this lead';
  END IF;

  IF v_lead.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Lead is already in trash';
  END IF;

  IF v_lead.outcome IS NOT NULL THEN
    RAISE EXCEPTION 'Archived leads cannot be moved to trash';
  END IF;

  UPDATE public.leads
  SET
    deleted_at = now(),
    deleted_by_profile_id = p_deleted_by_profile_id,
    updated_by_profile_id = p_deleted_by_profile_id,
    updated_at = now()
  WHERE id = p_lead_id;

  PERFORM public.write_audit_log(
    p_deleted_by_profile_id,
    'soft_deleted',
    'lead',
    p_lead_id,
    jsonb_build_object('event', 'lead_soft_deleted')
  );

  RETURN p_lead_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.soft_delete_lead(uuid, uuid) TO authenticated;

UPDATE public.app_settings
SET value = '"20250701310000"'::jsonb, updated_at = now()
WHERE key = 'schema_version';
