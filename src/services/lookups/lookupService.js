import { LOOKUP_TABLES } from "./constants";
import { mapActivityOutcomeRow, mapLookupRow } from "./mappers";

/**
 * @typedef {import('@/types/lookups').LookupItem} LookupItem
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} tableName
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<LookupItem[]>}
 */
export async function getLookups(supabase, tableName, options = {}) {
  const { activeOnly = true } = options;

  let query = supabase
    .from(tableName)
    .select("id, code, name, display_order, is_active, created_at, updated_at")
    .order("display_order", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load ${tableName}: ${error.message}`);
  }

  return (data ?? []).map((row) => mapLookupRow(row));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<LookupItem[]>}
 */
export function getLeadStages(supabase, options) {
  return getLookups(supabase, LOOKUP_TABLES.LEAD_STAGES, options);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<LookupItem[]>}
 */
export function getLeadTypes(supabase, options) {
  return getLookups(supabase, LOOKUP_TABLES.LEAD_TYPES, options);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<LookupItem[]>}
 */
export function getLeadSources(supabase, options) {
  return getLookups(supabase, LOOKUP_TABLES.LEAD_SOURCES, options);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<LookupItem[]>}
 */
export function getActivityTypes(supabase, options) {
  return getLookups(supabase, LOOKUP_TABLES.ACTIVITY_TYPES, options);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean, activityTypeId?: string }} [options]
 * @returns {Promise<import('@/types/lookups').ActivityOutcomeItem[]>}
 */
export async function getActivityOutcomes(supabase, options = {}) {
  const { activeOnly = true, activityTypeId } = options;

  let query = supabase
    .from(LOOKUP_TABLES.ACTIVITY_OUTCOMES)
    .select(
      "id, code, name, display_order, is_active, activity_type_id, created_at, updated_at"
    )
    .order("display_order", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  if (activityTypeId) {
    query = query.eq("activity_type_id", activityTypeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Failed to load ${LOOKUP_TABLES.ACTIVITY_OUTCOMES}: ${error.message}`
    );
  }

  return (data ?? []).map((row) => mapActivityOutcomeRow(row));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<LookupItem[]>}
 */
export function getDemoStatuses(supabase, options) {
  return getLookups(supabase, LOOKUP_TABLES.DEMO_STATUSES, options);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<LookupItem[]>}
 */
export function getTaskStatuses(supabase, options) {
  return getLookups(supabase, LOOKUP_TABLES.TASK_STATUSES, options);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<LookupItem[]>}
 */
export function getFollowupStatuses(supabase, options) {
  return getLookups(supabase, LOOKUP_TABLES.FOLLOWUP_STATUSES, options);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {Promise<Record<string, LookupItem[]>>}
 */
export async function getAllLookups(supabase, options = {}) {
  const [
    leadStages,
    leadTypes,
    leadSources,
    activityTypes,
    activityOutcomes,
    demoStatuses,
    taskStatuses,
    followupStatuses,
  ] = await Promise.all([
    getLeadStages(supabase, options),
    getLeadTypes(supabase, options),
    getLeadSources(supabase, options),
    getActivityTypes(supabase, options),
    getActivityOutcomes(supabase, options),
    getDemoStatuses(supabase, options),
    getTaskStatuses(supabase, options),
    getFollowupStatuses(supabase, options),
  ]);

  return {
    leadStages,
    leadTypes,
    leadSources,
    activityTypes,
    activityOutcomes,
    demoStatuses,
    taskStatuses,
    followupStatuses,
  };
}
