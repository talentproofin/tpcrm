/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/contact').Contact}
 */
export function mapContactRow(row) {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    fullName: String(row.full_name),
    designation: row.designation ? String(row.designation) : null,
    department: row.department ? String(row.department) : null,
    mobileNumber: row.mobile_number ? String(row.mobile_number) : null,
    alternateNumber: row.alternate_number ? String(row.alternate_number) : null,
    email: row.email ? String(row.email) : null,
    linkedinProfileUrl: row.linkedin_profile_url
      ? String(row.linkedin_profile_url)
      : null,
    notes: row.notes ? String(row.notes) : null,
    isPrimary: Boolean(row.is_primary),
    isActive: Boolean(row.is_active),
    archivedAt: row.archived_at ? String(row.archived_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdByProfileId: String(row.created_by_profile_id),
    updatedByProfileId: row.updated_by_profile_id
      ? String(row.updated_by_profile_id)
      : null,
  };
}

export const CONTACT_SELECT =
  "id, lead_id, full_name, designation, department, mobile_number, alternate_number, email, linkedin_profile_url, notes, is_primary, is_active, archived_at, created_at, updated_at, created_by_profile_id, updated_by_profile_id";
