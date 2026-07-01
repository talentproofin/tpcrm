/**
 * @param {string} code
 * @param {string} message
 * @returns {Error}
 */
export function createActivityError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * @param {Record<string, unknown> | null | undefined} row
 * @returns {import('../types/activity').ActivityLookupSummary | null}
 */
export function mapLookupSummaryRow(row) {
  if (!row) {
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
 * @returns {import('../types/activity').ActivityProfileSummary | null}
 */
export function mapProfileSummaryRow(row) {
  if (!row) {
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
 * @returns {import('../types/activity').ActivityFollowUp}
 */
export function mapFollowUpRow(row) {
  const assignedTo = row.assigned_to_profile;
  const status = row.followup_statuses;

  return {
    id: String(row.id),
    dueAt: String(row.due_at),
    notes: row.notes ? String(row.notes) : null,
    status: mapLookupSummaryRow(
      status && !Array.isArray(status)
        ? /** @type {Record<string, unknown>} */ (status)
        : null
    ) ?? { id: "", code: "pending", name: "Pending" },
    assignedTo: mapProfileSummaryRow(
      assignedTo && !Array.isArray(assignedTo)
        ? /** @type {Record<string, unknown>} */ (assignedTo)
        : null
    ) ?? { profileId: "", fullName: "Unknown", email: "" },
  };
}

const ACTIVITY_SELECT =
  "id, lead_id, activity_type_id, activity_outcome_id, remark, direction, performed_by_profile_id, occurred_at, created_by_profile_id, created_at";

/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/activity').Activity}
 */
export function mapActivityRow(row) {
  const activityType = row.activity_types;
  const activityOutcome = row.activity_outcomes;
  const performedBy = row.performed_by_profile;
  const followUps = row.follow_ups;

  const followUpList = Array.isArray(followUps)
    ? followUps
    : followUps
      ? [followUps]
      : [];

  const nextFollowUp = followUpList.length
    ? mapFollowUpRow(/** @type {Record<string, unknown>} */ (followUpList[0]))
    : null;

  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    activityTypeId: String(row.activity_type_id),
    activityOutcomeId: String(row.activity_outcome_id),
    remark: String(row.remark),
    direction: row.direction
      ? /** @type {import('../types/activity').ActivityDirection} */ (row.direction)
      : null,
    performedByProfileId: String(row.performed_by_profile_id),
    occurredAt: String(row.occurred_at),
    createdByProfileId: String(row.created_by_profile_id),
    createdAt: String(row.created_at),
    activityType: mapLookupSummaryRow(
      activityType && !Array.isArray(activityType)
        ? /** @type {Record<string, unknown>} */ (activityType)
        : null
    ),
    activityOutcome: mapLookupSummaryRow(
      activityOutcome && !Array.isArray(activityOutcome)
        ? /** @type {Record<string, unknown>} */ (activityOutcome)
        : null
    ),
    performedBy: mapProfileSummaryRow(
      performedBy && !Array.isArray(performedBy)
        ? /** @type {Record<string, unknown>} */ (performedBy)
        : null
    ),
    nextFollowUp,
  };
}

export { ACTIVITY_SELECT };
