-- Milestone 17 — Contact Management
-- contacts table, primary sync, RLS, RPCs

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads (id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  designation text,
  department text,
  mobile_number text,
  alternate_number text,
  email text,
  linkedin_profile_url text,
  notes text,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles (profile_id) ON DELETE RESTRICT,
  updated_by_profile_id uuid REFERENCES public.profiles (profile_id) ON DELETE SET NULL,
  CONSTRAINT chk_contacts_archived_active CHECK (
    archived_at IS NULL OR is_active = false
  )
);

CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON public.contacts (lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id_active ON public.contacts (lead_id)
  WHERE is_active = true AND archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_full_name_lower ON public.contacts (lower(trim(full_name)));
CREATE INDEX IF NOT EXISTS idx_contacts_designation_lower ON public.contacts (lower(trim(designation)))
  WHERE designation IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_mobile_number ON public.contacts (mobile_number)
  WHERE mobile_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_email_lower ON public.contacts (lower(trim(email)))
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_one_primary_per_lead
  ON public.contacts (lead_id)
  WHERE is_primary = true AND is_active = true AND archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_lead_mobile_active
  ON public.contacts (lead_id, lower(trim(mobile_number)))
  WHERE mobile_number IS NOT NULL AND is_active = true AND archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_lead_email_active
  ON public.contacts (lead_id, lower(trim(email)))
  WHERE email IS NOT NULL AND is_active = true AND archived_at IS NULL;

DROP TRIGGER IF EXISTS trg_contacts_set_updated_at ON public.contacts;
CREATE TRIGGER trg_contacts_set_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contacts_select_lead_access ON public.contacts;
CREATE POLICY contacts_select_lead_access
  ON public.contacts
  FOR SELECT
  TO authenticated
  USING (public.can_access_lead(lead_id));

DROP POLICY IF EXISTS contacts_insert_lead_access ON public.contacts;
CREATE POLICY contacts_insert_lead_access
  ON public.contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_lead(lead_id)
    AND created_by_profile_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS contacts_update_lead_access ON public.contacts;
CREATE POLICY contacts_update_lead_access
  ON public.contacts
  FOR UPDATE
  TO authenticated
  USING (public.can_access_lead(lead_id))
  WITH CHECK (public.can_access_lead(lead_id));

-- ---------------------------------------------------------------------------
-- Sync lead primary contact fields from primary contact row
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_lead_primary_from_contact(p_lead_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact RECORD;
BEGIN
  IF NOT public.can_access_lead(p_lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  SELECT full_name, mobile_number, email
  INTO v_contact
  FROM public.contacts
  WHERE lead_id = p_lead_id
    AND is_primary = true
    AND is_active = true
    AND archived_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.leads
    SET
      primary_contact_name = NULLIF(trim(v_contact.full_name), ''),
      primary_contact_phone = NULLIF(trim(v_contact.mobile_number), ''),
      primary_contact_email = NULLIF(trim(v_contact.email), ''),
      updated_at = now()
    WHERE id = p_lead_id;
  ELSE
    UPDATE public.leads
    SET
      primary_contact_name = NULL,
      primary_contact_phone = NULL,
      primary_contact_email = NULL,
      updated_at = now()
    WHERE id = p_lead_id;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Create contact with primary handling
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_contact(
  p_lead_id uuid,
  p_full_name text,
  p_designation text,
  p_department text,
  p_mobile_number text,
  p_alternate_number text,
  p_email text,
  p_linkedin_profile_url text,
  p_notes text,
  p_is_primary boolean,
  p_created_by_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id uuid;
BEGIN
  IF NOT public.can_access_lead(p_lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF p_created_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid creator profile';
  END IF;

  IF NULLIF(trim(p_full_name), '') IS NULL THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;

  IF p_is_primary THEN
    UPDATE public.contacts
    SET
      is_primary = false,
      updated_by_profile_id = p_created_by_profile_id,
      updated_at = now()
    WHERE lead_id = p_lead_id
      AND is_active = true
      AND archived_at IS NULL
      AND is_primary = true;
  END IF;

  INSERT INTO public.contacts (
    lead_id,
    full_name,
    designation,
    department,
    mobile_number,
    alternate_number,
    email,
    linkedin_profile_url,
    notes,
    is_primary,
    is_active,
    created_by_profile_id,
    updated_by_profile_id
  ) VALUES (
    p_lead_id,
    trim(p_full_name),
    NULLIF(trim(p_designation), ''),
    NULLIF(trim(p_department), ''),
    NULLIF(trim(p_mobile_number), ''),
    NULLIF(trim(p_alternate_number), ''),
    NULLIF(trim(p_email), ''),
    NULLIF(trim(p_linkedin_profile_url), ''),
    NULLIF(trim(p_notes), ''),
    COALESCE(p_is_primary, false),
    true,
    p_created_by_profile_id,
    p_created_by_profile_id
  )
  RETURNING id INTO v_contact_id;

  PERFORM public.sync_lead_primary_from_contact(p_lead_id);

  RETURN v_contact_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Update contact with primary handling
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_contact(
  p_contact_id uuid,
  p_full_name text,
  p_designation text,
  p_department text,
  p_mobile_number text,
  p_alternate_number text,
  p_email text,
  p_linkedin_profile_url text,
  p_notes text,
  p_is_primary boolean,
  p_is_active boolean,
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
  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  SELECT lead_id
  INTO v_lead_id
  FROM public.contacts
  WHERE id = p_contact_id
    AND is_active = true
    AND archived_at IS NULL;

  IF v_lead_id IS NULL THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;

  IF NOT public.can_access_lead(v_lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF NULLIF(trim(p_full_name), '') IS NULL THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;

  IF p_is_primary THEN
    UPDATE public.contacts
    SET
      is_primary = false,
      updated_by_profile_id = p_updated_by_profile_id,
      updated_at = now()
    WHERE lead_id = v_lead_id
      AND id <> p_contact_id
      AND is_active = true
      AND archived_at IS NULL
      AND is_primary = true;
  END IF;

  UPDATE public.contacts
  SET
    full_name = trim(p_full_name),
    designation = NULLIF(trim(p_designation), ''),
    department = NULLIF(trim(p_department), ''),
    mobile_number = NULLIF(trim(p_mobile_number), ''),
    alternate_number = NULLIF(trim(p_alternate_number), ''),
    email = NULLIF(trim(p_email), ''),
    linkedin_profile_url = NULLIF(trim(p_linkedin_profile_url), ''),
    notes = NULLIF(trim(p_notes), ''),
    is_primary = COALESCE(p_is_primary, false),
    is_active = COALESCE(p_is_active, true),
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_contact_id;

  PERFORM public.sync_lead_primary_from_contact(v_lead_id);

  RETURN p_contact_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Archive contact (primary contacts cannot be archived)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.archive_contact(
  p_contact_id uuid,
  p_updated_by_profile_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id uuid;
  v_is_primary boolean;
BEGIN
  IF p_updated_by_profile_id <> public.current_profile_id() THEN
    RAISE EXCEPTION 'Invalid updater profile';
  END IF;

  SELECT lead_id, is_primary
  INTO v_lead_id, v_is_primary
  FROM public.contacts
  WHERE id = p_contact_id
    AND is_active = true
    AND archived_at IS NULL;

  IF v_lead_id IS NULL THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;

  IF NOT public.can_access_lead(v_lead_id) THEN
    RAISE EXCEPTION 'Lead access denied';
  END IF;

  IF v_is_primary THEN
    RAISE EXCEPTION 'Cannot archive the primary contact. Assign another primary contact first.';
  END IF;

  UPDATE public.contacts
  SET
    is_active = false,
    is_primary = false,
    archived_at = now(),
    updated_by_profile_id = p_updated_by_profile_id,
    updated_at = now()
  WHERE id = p_contact_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_lead_primary_from_contact(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_contact(
  uuid, text, text, text, text, text, text, text, text, boolean, uuid
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_contact(
  uuid, text, text, text, text, text, text, text, text, boolean, boolean, uuid
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_contact(uuid, uuid) TO authenticated;
