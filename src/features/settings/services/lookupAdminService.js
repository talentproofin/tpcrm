import { createService } from "@/services/infrastructure/createService";
import { getActivityOutcomes } from "@/services/lookups/lookupService";
import { getLookups } from "@/services/lookups/lookupService";
import { LOOKUP_DEFINITIONS } from "../constants";

/**
 * @typedef {import('../types/settings').AdminLookupItem} AdminLookupItem
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} tableName
 * @param {{ activityTypeId?: string }} [options]
 * @returns {Promise<AdminLookupItem[]>}
 */
async function fetchAdminLookups(supabase, tableName, options = {}) {
  if (tableName === "activity_outcomes") {
    const items = await getActivityOutcomes(supabase, {
      activeOnly: false,
      activityTypeId: options.activityTypeId,
    });

    return items.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      activityTypeId: item.activityTypeId ?? null,
    }));
  }

  const items = await getLookups(supabase, tableName, { activeOnly: false });

  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    activityTypeId: null,
  }));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{
 *   tableName: string,
 *   recordId?: string | null,
 *   code: string,
 *   name: string,
 *   displayOrder: number,
 *   activityTypeId?: string | null,
 *   profileId: string,
 * }} input
 */
async function saveLookupRecord(supabase, input) {
  const { error } = await supabase.rpc("admin_save_lookup", {
    p_table_name: input.tableName,
    p_record_id: input.recordId ?? null,
    p_code: input.code,
    p_name: input.name,
    p_display_order: input.displayOrder,
    p_activity_type_id: input.activityTypeId ?? null,
    p_updated_by_profile_id: input.profileId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{
 *   tableName: string,
 *   recordId: string,
 *   isActive: boolean,
 *   profileId: string,
 * }} input
 */
async function setLookupActive(supabase, input) {
  const { error } = await supabase.rpc("admin_set_lookup_active", {
    p_table_name: input.tableName,
    p_record_id: input.recordId,
    p_is_active: input.isActive,
    p_updated_by_profile_id: input.profileId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} tableName
 * @param {string} recordId
 * @param {number} displayOrder
 * @param {string} profileId
 * @param {string | null} [activityTypeId]
 */
async function reorderLookup(supabase, tableName, recordId, displayOrder, profileId, activityTypeId) {
  const definition = LOOKUP_DEFINITIONS.find((item) => item.table === tableName);
  if (!definition) {
    throw new Error("Invalid lookup table");
  }

  const lookups = await fetchAdminLookups(supabase, tableName, {
    activityTypeId: activityTypeId ?? undefined,
  });
  const current = lookups.find((item) => item.id === recordId);

  if (!current) {
    throw new Error("Lookup record not found");
  }

  await saveLookupRecord(supabase, {
    tableName,
    recordId,
    code: current.code,
    name: current.name,
    displayOrder,
    activityTypeId: current.activityTypeId,
    profileId,
  });
}

export const getAdminLookups = createService({
  name: "getAdminLookups",
  execute: fetchAdminLookups,
});

export const saveAdminLookup = createService({
  name: "saveAdminLookup",
  execute: saveLookupRecord,
});

export const setAdminLookupActive = createService({
  name: "setAdminLookupActive",
  execute: setLookupActive,
});

export const reorderAdminLookup = createService({
  name: "reorderAdminLookup",
  execute: reorderLookup,
});
