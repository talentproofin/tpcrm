import { createService } from "@/services/infrastructure/createService";
import { DEFAULT_PAGE_SIZE, LEAD_LIST_SORT } from "../constants/list";
import { LEAD_ERROR_CODES } from "../constants/errors";
import { mapLeadListItemRow, mapLeadRow } from "./leadMapper";
import {
  createLeadError,
  findDuplicateLeads,
  LEAD_LIST_SELECT,
  LEAD_SELECT,
} from "../utils/duplicateDetection";

/**
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
function emptyToNull(value) {
  const trimmed = (value ?? "").trim();
  return trimmed || null;
}

const LEAD_DETAIL_JOINS =
  "owner_profile:profiles!leads_owner_profile_id_fkey(profile_id, full_name, email), assigned_to_profile:profiles!leads_assigned_to_profile_id_fkey(profile_id, full_name, email), lead_stages(id, code, name), lead_sources(id, code, name), lead_types(id, code, name)";

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} leadId
 * @returns {Promise<import('../types/lead').Lead>}
 */
async function fetchLeadById(supabase, leadId) {
  const { data, error } = await supabase
    .from("leads")
    .select(`${LEAD_SELECT}, ${LEAD_DETAIL_JOINS}`)
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    throw createLeadError(
      LEAD_ERROR_CODES.UNKNOWN,
      "Unable to load lead. Please try again."
    );
  }

  if (!data) {
    throw createLeadError(LEAD_ERROR_CODES.NOT_FOUND, "Lead not found.");
  }

  return mapLeadRow(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} profileId
 * @param {import('zod').infer<typeof import('../validation/createLeadSchema').createLeadSchema>} input
 * @returns {Promise<import('../types/lead').Lead>}
 */
async function executeCreateLead(supabase, profileId, input) {
  if (!input.allowDuplicate) {
    const duplicates = await findDuplicateLeads(supabase, {
      organizationName: input.organizationName,
      website: input.website,
      phone: input.phone,
      primaryContactEmail: input.primaryContactEmail,
    });

    if (duplicates.length > 0) {
      throw createLeadError(
        LEAD_ERROR_CODES.DUPLICATE,
        "A lead with matching organization name, website, phone, or contact email already exists.",
        { duplicates }
      );
    }
  }

  const payload = {
    organization_name: input.organizationName.trim(),
    website: emptyToNull(input.website),
    phone: emptyToNull(input.phone),
    lead_type_id: input.leadTypeId,
    primary_contact_name: emptyToNull(input.primaryContactName),
    primary_contact_phone: emptyToNull(input.primaryContactPhone),
    primary_contact_email: emptyToNull(input.primaryContactEmail),
    stage_id: input.stageId,
    lead_source_id: emptyToNull(input.leadSourceId),
    description: emptyToNull(input.description),
    owner_profile_id: input.ownerProfileId,
    assigned_to_profile_id: emptyToNull(input.assignedToProfileId),
    created_by_profile_id: profileId,
    updated_by_profile_id: profileId,
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw createLeadError(
      LEAD_ERROR_CODES.UNKNOWN,
      "Unable to create lead. Please try again."
    );
  }

  return fetchLeadById(supabase, String(data.id));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} profileId
 * @param {string} leadId
 * @param {import('zod').infer<typeof import('../validation/createLeadSchema').updateLeadSchema>} input
 * @returns {Promise<import('../types/lead').Lead>}
 */
async function executeUpdateLead(supabase, profileId, leadId, input) {
  const existing = await fetchLeadById(supabase, leadId);

  if (existing.deletedAt) {
    throw createLeadError(
      LEAD_ERROR_CODES.NOT_FOUND,
      "This lead has been deleted."
    );
  }

  const nextOrganizationName =
    input.organizationName?.trim() ?? existing.organizationName;
  const nextWebsite =
    input.website !== undefined ? emptyToNull(input.website) : existing.website;
  const nextPhone =
    input.phone !== undefined ? emptyToNull(input.phone) : existing.phone;
  const nextPrimaryContactEmail =
    input.primaryContactEmail !== undefined
      ? emptyToNull(input.primaryContactEmail)
      : existing.primaryContactEmail;

  if (
    !input.allowDuplicate &&
    (input.organizationName ||
      input.website !== undefined ||
      input.phone !== undefined ||
      input.primaryContactEmail !== undefined)
  ) {
    const duplicates = await findDuplicateLeads(supabase, {
      organizationName: nextOrganizationName,
      website: nextWebsite ?? undefined,
      phone: nextPhone ?? undefined,
      primaryContactEmail: nextPrimaryContactEmail ?? undefined,
      excludeLeadId: leadId,
    });

    if (duplicates.length > 0) {
      throw createLeadError(
        LEAD_ERROR_CODES.DUPLICATE,
        "A lead with matching organization name, website, phone, or contact email already exists.",
        { duplicates }
      );
    }
  }

  /** @type {Record<string, unknown>} */
  const payload = {
    updated_by_profile_id: profileId,
  };

  if (input.organizationName !== undefined) {
    payload.organization_name = input.organizationName.trim();
  }

  if (input.website !== undefined) {
    payload.website = emptyToNull(input.website);
  }

  if (input.phone !== undefined) {
    payload.phone = emptyToNull(input.phone);
  }

  if (input.leadTypeId !== undefined) {
    payload.lead_type_id = input.leadTypeId;
  }

  if (input.primaryContactName !== undefined) {
    payload.primary_contact_name = emptyToNull(input.primaryContactName);
  }

  if (input.primaryContactPhone !== undefined) {
    payload.primary_contact_phone = emptyToNull(input.primaryContactPhone);
  }

  if (input.primaryContactEmail !== undefined) {
    payload.primary_contact_email = emptyToNull(input.primaryContactEmail);
  }

  if (input.stageId !== undefined) {
    payload.stage_id = input.stageId;
  }

  if (input.leadSourceId !== undefined) {
    payload.lead_source_id = emptyToNull(input.leadSourceId);
  }

  if (input.description !== undefined) {
    payload.description = emptyToNull(input.description);
  }

  if (input.ownerProfileId !== undefined) {
    payload.owner_profile_id = input.ownerProfileId;
  }

  if (input.assignedToProfileId !== undefined) {
    payload.assigned_to_profile_id = emptyToNull(input.assignedToProfileId);
  }

  const { error } = await supabase.from("leads").update(payload).eq("id", leadId);

  if (error) {
    throw createLeadError(
      LEAD_ERROR_CODES.UNKNOWN,
      "Unable to update lead. Please try again."
    );
  }

  return fetchLeadById(supabase, leadId);
}

/**
 * @param {import('@supabase/supabase-js').PostgrestError | null | undefined} error
 * @param {string} fallback
 * @returns {never}
 */
function throwLeadMutationError(error, fallback) {
  const message = error?.message ?? "";

  if (message.includes("Lead not found")) {
    throw createLeadError(LEAD_ERROR_CODES.NOT_FOUND, "Lead not found.");
  }

  if (
    message.includes("Archived leads cannot be moved to trash") ||
    message.includes("chk_leads_deleted_not_archived")
  ) {
    throw createLeadError(
      LEAD_ERROR_CODES.ARCHIVED,
      "Archived leads cannot be moved to trash."
    );
  }

  if (message.includes("permission to delete")) {
    throw createLeadError(
      LEAD_ERROR_CODES.FORBIDDEN,
      "You do not have permission to delete this lead."
    );
  }

  if (message.includes("already in trash")) {
    throw createLeadError(
      LEAD_ERROR_CODES.VALIDATION,
      "This lead is already in trash."
    );
  }

  throw createLeadError(LEAD_ERROR_CODES.UNKNOWN, fallback);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} profileId
 * @param {string} leadId
 * @returns {Promise<import('../types/lead').Lead>}
 */
async function executeDeleteLead(supabase, profileId, leadId) {
  const { error } = await supabase.rpc("soft_delete_lead", {
    p_lead_id: leadId,
    p_deleted_by_profile_id: profileId,
  });

  if (error) {
    throwLeadMutationError(error, "Unable to delete lead. Please try again.");
  }

  return fetchLeadById(supabase, leadId);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} leadId
 * @returns {Promise<import('../types/lead').Lead>}
 */
async function executeGetLead(supabase, leadId) {
  return fetchLeadById(supabase, leadId);
}

/**
 * @typedef {Object} LeadListFilters
 * @property {number} [page]
 * @property {number} [pageSize]
 * @property {string} [search]
 * @property {string} [stageId]
 * @property {string} [leadTypeId]
 * @property {string} [ownerProfileId]
 * @property {boolean} [includeTrashed]
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {LeadListFilters} [filters]
 * @returns {Promise<import('../types/lead').LeadListResult>}
 */
async function executeGetLeadList(supabase, filters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leads")
    .select(LEAD_LIST_SELECT, { count: "exact" })
    .order(LEAD_LIST_SORT.column, { ascending: LEAD_LIST_SORT.ascending });

  if (filters.includeTrashed) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (filters.search?.trim()) {
    query = query.ilike("organization_name", `%${filters.search.trim()}%`);
  }

  if (filters.stageId) {
    query = query.eq("stage_id", filters.stageId);
  }

  if (filters.leadTypeId) {
    query = query.eq("lead_type_id", filters.leadTypeId);
  }

  if (filters.ownerProfileId) {
    query = query.eq("owner_profile_id", filters.ownerProfileId);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw createLeadError(
      LEAD_ERROR_CODES.UNKNOWN,
      "Unable to load leads. Please try again."
    );
  }

  const rows = data ?? [];
  const ownerIds = [...new Set(rows.map((row) => String(row.owner_profile_id)))];
  const stageIds = [...new Set(rows.map((row) => String(row.stage_id)))];
  const leadTypeIds = [...new Set(rows.map((row) => String(row.lead_type_id)))];

  const [ownersResult, stagesResult, leadTypesResult] = await Promise.all([
    ownerIds.length
      ? supabase
          .from("profiles")
          .select("profile_id, full_name, email")
          .in("profile_id", ownerIds)
      : Promise.resolve({ data: [], error: null }),
    stageIds.length
      ? supabase
          .from("lead_stages")
          .select("id, code, name")
          .in("id", stageIds)
      : Promise.resolve({ data: [], error: null }),
    leadTypeIds.length
      ? supabase
          .from("lead_types")
          .select("id, code, name")
          .in("id", leadTypeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (ownersResult.error || stagesResult.error || leadTypesResult.error) {
    throw createLeadError(
      LEAD_ERROR_CODES.UNKNOWN,
      "Unable to load lead details. Please try again."
    );
  }

  const owners = new Map(
    (ownersResult.data ?? []).map((row) => [
      String(row.profile_id),
      {
        profileId: String(row.profile_id),
        fullName: String(row.full_name),
        email: String(row.email),
      },
    ])
  );

  const stages = new Map(
    (stagesResult.data ?? []).map((row) => [
      String(row.id),
      {
        id: String(row.id),
        code: String(row.code),
        name: String(row.name),
      },
    ])
  );

  const leadTypes = new Map(
    (leadTypesResult.data ?? []).map((row) => [
      String(row.id),
      {
        id: String(row.id),
        code: String(row.code),
        name: String(row.name),
      },
    ])
  );

  const total = count ?? 0;

  return {
    items: rows.map((row) =>
      mapLeadListItemRow(row, owners, stages, leadTypes)
    ),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<import('../types/lead').LeadProfileSummary[]>}
 */
async function executeGetAssignableProfiles(supabase) {
  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id, full_name, email")
    .eq("status", "active")
    .is("archived_at", null)
    .order("full_name", { ascending: true });

  if (error) {
    throw createLeadError(
      LEAD_ERROR_CODES.UNKNOWN,
      "Unable to load team members. Please try again."
    );
  }

  return (data ?? []).map((row) => ({
    profileId: String(row.profile_id),
    fullName: String(row.full_name),
    email: String(row.email),
  }));
}

export const createLead = createService({
  name: "createLead",
  execute: executeCreateLead,
});

export const updateLead = createService({
  name: "updateLead",
  execute: executeUpdateLead,
});

export const deleteLead = createService({
  name: "deleteLead",
  execute: executeDeleteLead,
});

export const getLead = createService({
  name: "getLead",
  execute: executeGetLead,
});

export const getLeadList = createService({
  name: "getLeadList",
  execute: executeGetLeadList,
});

export const getAssignableProfiles = createService({
  name: "getAssignableProfiles",
  execute: executeGetAssignableProfiles,
});
