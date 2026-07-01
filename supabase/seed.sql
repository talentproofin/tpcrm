-- Milestone 8 — Database Foundation seed
-- Roles only. No permissions. Profiles are admin-provisioned.

INSERT INTO public.roles (code, name, description) VALUES
  (
    'ceo',
    'CEO',
    'Executive visibility; dashboard and reports'
  ),
  (
    'admin',
    'Admin',
    'User administration; trash management; system configuration'
  ),
  (
    'manager',
    'Manager',
    'Team oversight; create and manage team leads'
  ),
  (
    'bde',
    'Business Development Executive',
    'Create and manage own leads and activities'
  ),
  (
    'marketing',
    'Marketing Executive',
    'Create and manage own leads; marketing activities'
  ),
  (
    'recruiter',
    'Recruiter',
    'Create and manage own leads; recruitment activities'
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Milestone 10 — Lookup Foundation seed
-- TPCRM approved business workflow values
-- ---------------------------------------------------------------------------

INSERT INTO public.lead_stages (code, name, display_order) VALUES
  ('new', 'New', 1),
  ('contacted', 'Contacted', 2),
  ('interested', 'Interested', 3),
  ('demo_scheduled', 'Demo Scheduled', 4),
  ('demo_completed', 'Demo Completed', 5),
  ('onboarding_in_progress', 'Onboarding In Progress', 6),
  ('onboarded', 'Onboarded', 7),
  ('lost', 'Lost', 8),
  ('archived', 'Archived', 9)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- Milestone 12A — Activity Engine refinement
-- Type-scoped outcomes: each activity type has its own allowed outcomes.
-- TPCRM records interactions performed outside the system; it does not send messages.
-- Deprecated global codes (email_sent, whatsapp_sent, etc.) are deactivated below.

INSERT INTO public.activity_types (code, name, display_order) VALUES
  ('phone_call', 'Phone Call', 1),
  ('whatsapp', 'WhatsApp', 2),
  ('email', 'Email', 3),
  ('linkedin', 'LinkedIn', 4),
  ('demo', 'Demo', 5),
  ('meeting', 'Meeting', 6),
  ('note', 'Note', 7)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- Phone Call outcomes
INSERT INTO public.activity_outcomes (activity_type_id, code, name, display_order)
SELECT t.id, v.code, v.name, v.display_order
FROM public.activity_types t
CROSS JOIN (
  VALUES
    ('connected', 'Connected', 1),
    ('not_answered', 'Not Answered', 2),
    ('busy', 'Busy', 3),
    ('switch_off', 'Switch Off', 4),
    ('wrong_number', 'Wrong Number', 5),
    ('interested', 'Interested', 6),
    ('not_interested', 'Not Interested', 7),
    ('callback_requested', 'Callback Requested', 8)
) AS v(code, name, display_order)
WHERE t.code = 'phone_call'
ON CONFLICT (activity_type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- WhatsApp outcomes
INSERT INTO public.activity_outcomes (activity_type_id, code, name, display_order)
SELECT t.id, v.code, v.name, v.display_order
FROM public.activity_types t
CROSS JOIN (VALUES ('sent', 'Sent', 1)) AS v(code, name, display_order)
WHERE t.code = 'whatsapp'
ON CONFLICT (activity_type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- Email outcomes
INSERT INTO public.activity_outcomes (activity_type_id, code, name, display_order)
SELECT t.id, v.code, v.name, v.display_order
FROM public.activity_types t
CROSS JOIN (VALUES ('sent', 'Sent', 1)) AS v(code, name, display_order)
WHERE t.code = 'email'
ON CONFLICT (activity_type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- LinkedIn outcomes
INSERT INTO public.activity_outcomes (activity_type_id, code, name, display_order)
SELECT t.id, v.code, v.name, v.display_order
FROM public.activity_types t
CROSS JOIN (
  VALUES ('connection_request_sent', 'Connection Request Sent', 1)
) AS v(code, name, display_order)
WHERE t.code = 'linkedin'
ON CONFLICT (activity_type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- Demo outcomes
INSERT INTO public.activity_outcomes (activity_type_id, code, name, display_order)
SELECT t.id, v.code, v.name, v.display_order
FROM public.activity_types t
CROSS JOIN (
  VALUES
    ('scheduled', 'Scheduled', 1),
    ('completed', 'Completed', 2),
    ('cancelled', 'Cancelled', 3),
    ('rescheduled', 'Rescheduled', 4)
) AS v(code, name, display_order)
WHERE t.code = 'demo'
ON CONFLICT (activity_type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- Meeting outcomes
INSERT INTO public.activity_outcomes (activity_type_id, code, name, display_order)
SELECT t.id, v.code, v.name, v.display_order
FROM public.activity_types t
CROSS JOIN (VALUES ('completed', 'Completed', 1)) AS v(code, name, display_order)
WHERE t.code = 'meeting'
ON CONFLICT (activity_type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- Note outcomes
INSERT INTO public.activity_outcomes (activity_type_id, code, name, display_order)
SELECT t.id, v.code, v.name, v.display_order
FROM public.activity_types t
CROSS JOIN (VALUES ('recorded', 'Recorded', 1)) AS v(code, name, display_order)
WHERE t.code = 'note'
ON CONFLICT (activity_type_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

INSERT INTO public.demo_statuses (code, name, display_order) VALUES
  ('scheduled', 'Scheduled', 1),
  ('completed', 'Completed', 2),
  ('cancelled', 'Cancelled', 3),
  ('rescheduled', 'Rescheduled', 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

INSERT INTO public.demo_outcomes (code, name, display_order) VALUES
  ('positive', 'Positive', 1),
  ('follow_up_required', 'Follow-up Required', 2),
  ('not_interested', 'Not Interested', 3),
  ('decision_pending', 'Decision Pending', 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

INSERT INTO public.task_statuses (code, name, display_order) VALUES
  ('pending', 'Pending', 1),
  ('in_progress', 'In Progress', 2),
  ('completed', 'Completed', 3),
  ('cancelled', 'Cancelled', 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.lead_types (code, name, display_order) VALUES
  ('institute', 'Institute', 1),
  ('company', 'Company', 2)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

INSERT INTO public.lead_sources (code, name, display_order) VALUES
  ('website', 'Website', 1),
  ('referral', 'Referral', 2),
  ('linkedin', 'LinkedIn', 3),
  ('cold_call', 'Cold Call', 4),
  ('event', 'Event', 5),
  ('partner', 'Partner', 6),
  ('inbound', 'Inbound', 7),
  ('other', 'Other', 8)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

INSERT INTO public.followup_statuses (code, name, display_order) VALUES
  ('pending', 'Pending', 1),
  ('completed', 'Completed', 2),
  ('overdue', 'Overdue', 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- Deactivate deprecated lookup codes superseded by TPCRM workflow
UPDATE public.lead_stages
SET is_active = false, updated_at = now()
WHERE code IN ('active', 'in_progress');

UPDATE public.activity_types
SET is_active = false, updated_at = now()
WHERE code IN ('call', 'other');

UPDATE public.activity_outcomes
SET is_active = false, updated_at = now()
WHERE activity_type_id IS NULL
  OR code IN (
    'no_answer',
    'voicemail',
    'meeting_scheduled',
    'follow_up_required',
    'email_sent',
    'whatsapp_sent',
    'linkedin_request_sent',
    'demo_scheduled',
    'demo_completed'
  );

UPDATE public.demo_statuses
SET is_active = false, updated_at = now()
WHERE code = 'no_show';
