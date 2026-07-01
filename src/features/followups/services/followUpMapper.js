import { summarizeText } from "../utils/followUpBuckets";
import { classifyFollowUpBucket } from "../utils/followUpBuckets";

/**
 * @param {Record<string, unknown> | null | undefined} row
 * @returns {import('../types/followUp').FollowUpLookupSummary | null}
 */
export function mapLookupSummary(row) {
  if (!row || Array.isArray(row)) {
    return null;
  }

  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
  };
}

/**
 * @param {Record<string, unknown> | null | undefined} row
 * @returns {import('../types/followUp').FollowUpProfileSummary | null}
 */
export function mapProfileSummary(row) {
  if (!row || Array.isArray(row)) {
    return null;
  }

  return {
    profileId: String(row.profile_id),
    fullName: String(row.full_name),
    email: String(row.email),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/followUp').FollowUpPreviousActivity | null}
 */
export function mapPreviousActivity(row) {
  if (!row || Array.isArray(row)) {
    return null;
  }

  const activityType = row.activity_types;
  const activityOutcome = row.activity_outcomes;

  return {
    id: String(row.id),
    remark: String(row.remark),
    occurredAt: String(row.occurred_at),
    activityType: mapLookupSummary(
      activityType && !Array.isArray(activityType)
        ? /** @type {Record<string, unknown>} */ (activityType)
        : null
    ),
    activityOutcome: mapLookupSummary(
      activityOutcome && !Array.isArray(activityOutcome)
        ? /** @type {Record<string, unknown>} */ (activityOutcome)
        : null
    ),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/followUp').FollowUpLeadSummary}
 */
export function mapLeadSummary(row) {
  const leadType = row.lead_types;
  const stage = row.lead_stages;

  return {
    id: String(row.id),
    organizationName: String(row.organization_name),
    phone: row.phone ? String(row.phone) : null,
    primaryContactName: row.primary_contact_name
      ? String(row.primary_contact_name)
      : null,
    primaryContactPhone: row.primary_contact_phone
      ? String(row.primary_contact_phone)
      : null,
    leadType: mapLookupSummary(
      leadType && !Array.isArray(leadType)
        ? /** @type {Record<string, unknown>} */ (leadType)
        : null
    ),
    stage: mapLookupSummary(
      stage && !Array.isArray(stage) ? /** @type {Record<string, unknown>} */ (stage) : null
    ),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/followUp').FollowUpWorkspaceItem}
 */
export function mapFollowUpWorkspaceRow(row) {
  const status = row.followup_statuses;
  const assignedTo = row.assigned_to_profile;
  const lead = row.leads;
  const activity = row.activities;

  const statusSummary = mapLookupSummary(
    status && !Array.isArray(status) ? /** @type {Record<string, unknown>} */ (status) : null
  ) ?? { id: "", code: "pending", name: "Pending" };

  const bucket = classifyFollowUpBucket(
    String(row.due_at),
    statusSummary.code,
    row.completed_at ? String(row.completed_at) : null
  );

  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    activityId: String(row.activity_id),
    assignedToProfileId: String(row.assigned_to_profile_id),
    dueAt: String(row.due_at),
    notes: row.notes ? String(row.notes) : null,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    createdAt: String(row.created_at),
    status: statusSummary,
    assignedTo: mapProfileSummary(
      assignedTo && !Array.isArray(assignedTo)
        ? /** @type {Record<string, unknown>} */ (assignedTo)
        : null
    ),
    lead: mapLeadSummary(
      lead && !Array.isArray(lead) ? /** @type {Record<string, unknown>} */ (lead) : null
    ),
    previousActivity: mapPreviousActivity(
      activity && !Array.isArray(activity)
        ? /** @type {Record<string, unknown>} */ (activity)
        : null
    ),
    bucket: bucket ?? "upcoming",
  };
}

/**
 * @param {import('../types/followUp').FollowUpPreviousActivity | null} activity
 * @returns {string}
 */
export function formatPreviousActivitySummary(activity) {
  if (!activity) {
    return "No previous activity recorded.";
  }

  const typeName = activity.activityType?.name ?? "Activity";
  const outcomeName = activity.activityOutcome?.name ?? "Outcome";
  return `${typeName} · ${outcomeName} — ${summarizeText(activity.remark)}`;
}

const FOLLOWUP_WORKSPACE_SELECT = `
  id,
  activity_id,
  lead_id,
  assigned_to_profile_id,
  due_at,
  notes,
  completed_at,
  created_at,
  followup_statuses(id, code, name),
  assigned_to_profile:profiles!follow_ups_assigned_to_profile_id_fkey(profile_id, full_name, email),
  leads!inner(
    id,
    organization_name,
    phone,
    primary_contact_name,
    primary_contact_phone,
    deleted_at,
    lead_type_id,
    stage_id,
    lead_types(id, code, name),
    lead_stages(id, code, name)
  ),
  activities!follow_ups_activity_id_fkey(
    id,
    remark,
    occurred_at,
    activity_types(id, code, name),
    activity_outcomes(id, code, name)
  )
`;

export { FOLLOWUP_WORKSPACE_SELECT };
