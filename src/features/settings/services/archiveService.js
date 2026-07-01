import { createService } from "@/services/infrastructure/createService";
import { DEFAULT_PAGE_SIZE } from "@/features/leads/constants/list";

/**
 * @typedef {import('../types/settings').ArchivedLeadItem} ArchivedLeadItem
 * @typedef {import('../types/settings').ArchivedContactItem} ArchivedContactItem
 * @typedef {import('../types/settings').ArchivedDemoItem} ArchivedDemoItem
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ page?: number, pageSize?: number }} [options]
 */
async function fetchArchivedLeads(supabase, options = {}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("leads")
    .select(
      "id, organization_name, deleted_at, owner_profile_id, stage_id",
      { count: "exact" }
    )
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  /** @type {ArchivedLeadItem[]} */
  const items = (data ?? []).map((row) => ({
    id: String(row.id),
    organizationName: String(row.organization_name ?? ""),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
    ownerProfileId: row.owner_profile_id ? String(row.owner_profile_id) : null,
    stageId: row.stage_id ? String(row.stage_id) : null,
  }));

  return {
    items,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ page?: number, pageSize?: number }} [options]
 */
async function fetchArchivedContacts(supabase, options = {}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("contacts")
    .select(
      "id, full_name, email, mobile_number, archived_at, lead_id, is_primary",
      { count: "exact" }
    )
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  /** @type {ArchivedContactItem[]} */
  const items = (data ?? []).map((row) => ({
    id: String(row.id),
    fullName: String(row.full_name ?? ""),
    email: row.email ? String(row.email) : null,
    mobileNumber: row.mobile_number ? String(row.mobile_number) : null,
    archivedAt: row.archived_at ? String(row.archived_at) : null,
    leadId: row.lead_id ? String(row.lead_id) : null,
    isPrimary: Boolean(row.is_primary),
  }));

  return {
    items,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} cancelledStatusId
 * @param {{ page?: number, pageSize?: number }} [options]
 */
async function fetchArchivedDemos(supabase, cancelledStatusId, options = {}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("demos")
    .select(
      "id, lead_id, scheduled_at, cancelled_at, demo_status_id",
      { count: "exact" }
    )
    .eq("demo_status_id", cancelledStatusId)
    .order("cancelled_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  /** @type {ArchivedDemoItem[]} */
  const items = (data ?? []).map((row) => ({
    id: String(row.id),
    leadId: row.lead_id ? String(row.lead_id) : null,
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    cancelledAt: row.cancelled_at ? String(row.cancelled_at) : null,
  }));

  return {
    items,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {'lead' | 'contact' | 'demo'} entityType
 * @param {string} entityId
 * @param {string} profileId
 */
async function restoreArchivedRecord(supabase, entityType, entityId, profileId) {
  const rpcName =
    entityType === "lead"
      ? "admin_restore_lead"
      : entityType === "contact"
        ? "admin_restore_contact"
        : "admin_restore_demo";

  const paramName =
    entityType === "lead"
      ? "p_lead_id"
      : entityType === "contact"
        ? "p_contact_id"
        : "p_demo_id";

  const { error } = await supabase.rpc(rpcName, {
    [paramName]: entityId,
    p_updated_by_profile_id: profileId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {'lead' | 'contact' | 'demo'} entityType
 * @param {string} entityId
 * @param {string} profileId
 */
async function permanentDeleteRecord(supabase, entityType, entityId, profileId) {
  const rpcName =
    entityType === "lead"
      ? "admin_permanent_delete_lead"
      : entityType === "contact"
        ? "admin_permanent_delete_contact"
        : "admin_permanent_delete_demo";

  const paramName =
    entityType === "lead"
      ? "p_lead_id"
      : entityType === "contact"
        ? "p_contact_id"
        : "p_demo_id";

  const { error } = await supabase.rpc(rpcName, {
    [paramName]: entityId,
    p_updated_by_profile_id: profileId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export const getArchivedLeads = createService({
  name: "getArchivedLeads",
  execute: fetchArchivedLeads,
});

export const getArchivedContacts = createService({
  name: "getArchivedContacts",
  execute: fetchArchivedContacts,
});

export const getArchivedDemos = createService({
  name: "getArchivedDemos",
  execute: fetchArchivedDemos,
});

export const restoreArchivedEntity = createService({
  name: "restoreArchivedEntity",
  execute: restoreArchivedRecord,
});

export const permanentDeleteArchivedEntity = createService({
  name: "permanentDeleteArchivedEntity",
  execute: permanentDeleteRecord,
});
