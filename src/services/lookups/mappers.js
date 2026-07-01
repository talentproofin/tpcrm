/**
 * @param {Record<string, unknown>} row
 * @returns {import('@/types/lookups').LookupItem}
 */
export function mapLookupRow(row) {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    displayOrder: Number(row.display_order),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {import('@/types/lookups').ActivityOutcomeItem}
 */
export function mapActivityOutcomeRow(row) {
  return {
    ...mapLookupRow(row),
    activityTypeId: String(row.activity_type_id),
  };
}
