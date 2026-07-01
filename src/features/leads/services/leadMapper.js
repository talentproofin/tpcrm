/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/lead').LeadProfileSummary}
 */
export function mapProfileSummaryRow(row) {
  return {
    profileId: String(row.profile_id),
    fullName: String(row.full_name),
    email: String(row.email),
  };
}

/**
 * @param {Record<string, unknown> | null | undefined} row
 * @returns {import('../types/lead').LeadStageSummary | null}
 */
export function mapStageSummaryRow(row) {
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
 * @returns {import('../types/lead').LeadSourceSummary | null}
 */
export function mapSourceSummaryRow(row) {
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
 * @returns {import('../types/lead').LeadTypeSummary | null}
 */
export function mapLeadTypeSummaryRow(row) {
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
 * @param {Record<string, unknown>} row
 * @returns {import('../types/lead').Lead}
 */
export function mapLeadRow(row) {
  const owner = row.owner_profile;
  const assignedTo = row.assigned_to_profile;
  const stage = row.lead_stages;
  const leadSource = row.lead_sources;
  const leadType = row.lead_types;

  return {
    id: String(row.id),
    organizationName: String(row.organization_name),
    website: row.website ? String(row.website) : null,
    phone: row.phone ? String(row.phone) : null,
    leadTypeId: String(row.lead_type_id),
    primaryContactName: row.primary_contact_name
      ? String(row.primary_contact_name)
      : null,
    primaryContactPhone: row.primary_contact_phone
      ? String(row.primary_contact_phone)
      : null,
    primaryContactEmail: row.primary_contact_email
      ? String(row.primary_contact_email)
      : null,
    ownerProfileId: String(row.owner_profile_id),
    assignedToProfileId: row.assigned_to_profile_id
      ? String(row.assigned_to_profile_id)
      : null,
    stageId: String(row.stage_id),
    leadSourceId: row.lead_source_id ? String(row.lead_source_id) : null,
    outcome: row.outcome
      ? /** @type {import('../types/lead').LeadOutcome} */ (row.outcome)
      : null,
    description: row.description ? String(row.description) : null,
    archivedAt: row.archived_at ? String(row.archived_at) : null,
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
    deletedByProfileId: row.deleted_by_profile_id
      ? String(row.deleted_by_profile_id)
      : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdByProfileId: String(row.created_by_profile_id),
    updatedByProfileId: row.updated_by_profile_id
      ? String(row.updated_by_profile_id)
      : null,
    owner:
      owner && !Array.isArray(owner)
        ? mapProfileSummaryRow(/** @type {Record<string, unknown>} */ (owner))
        : null,
    assignedTo:
      assignedTo && !Array.isArray(assignedTo)
        ? mapProfileSummaryRow(
            /** @type {Record<string, unknown>} */ (assignedTo)
          )
        : null,
    stage: mapStageSummaryRow(
      stage && !Array.isArray(stage)
        ? /** @type {Record<string, unknown>} */ (stage)
        : null
    ),
    leadSource: mapSourceSummaryRow(
      leadSource && !Array.isArray(leadSource)
        ? /** @type {Record<string, unknown>} */ (leadSource)
        : null
    ),
    leadType: mapLeadTypeSummaryRow(
      leadType && !Array.isArray(leadType)
        ? /** @type {Record<string, unknown>} */ (leadType)
        : null
    ),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @param {Map<string, import('../types/lead').LeadProfileSummary>} owners
 * @param {Map<string, import('../types/lead').LeadStageSummary>} stages
 * @param {Map<string, import('../types/lead').LeadTypeSummary>} leadTypes
 * @returns {import('../types/lead').LeadListItem}
 */
export function mapLeadListItemRow(row, owners, stages, leadTypes) {
  return {
    id: String(row.id),
    organizationName: String(row.organization_name),
    primaryContactEmail: row.primary_contact_email
      ? String(row.primary_contact_email)
      : null,
    outcome: row.outcome
      ? /** @type {import('../types/lead').LeadOutcome} */ (row.outcome)
      : null,
    createdAt: String(row.created_at),
    owner: owners.get(String(row.owner_profile_id)) ?? null,
    stage: stages.get(String(row.stage_id)) ?? null,
    leadType: leadTypes.get(String(row.lead_type_id)) ?? null,
  };
}
