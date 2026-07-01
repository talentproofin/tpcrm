import { createService } from "@/services/infrastructure/createService";
import { ACTIVITY_ERROR_CODES } from "../constants/errors";
import {
  ACTIVITY_SELECT,
  createActivityError,
  mapActivityRow,
} from "./activityMapper";

const ACTIVITY_DETAIL_JOINS =
  "activity_types(id, code, name), activity_outcomes(id, code, name), performed_by_profile:profiles!activities_performed_by_profile_id_fkey(profile_id, full_name, email), follow_ups(id, due_at, notes, followup_statuses(id, code, name), assigned_to_profile:profiles!follow_ups_assigned_to_profile_id_fkey(profile_id, full_name, email))";

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} activityId
 * @returns {Promise<import('../types/activity').Activity>}
 */
async function fetchActivityById(supabase, activityId) {
  const { data, error } = await supabase
    .from("activities")
    .select(`${ACTIVITY_SELECT}, ${ACTIVITY_DETAIL_JOINS}`)
    .eq("id", activityId)
    .maybeSingle();

  if (error) {
    throw createActivityError(
      ACTIVITY_ERROR_CODES.UNKNOWN,
      "Unable to load activity. Please try again."
    );
  }

  if (!data) {
    throw createActivityError(
      ACTIVITY_ERROR_CODES.NOT_FOUND,
      "Activity not found."
    );
  }

  return mapActivityRow(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} profileId
 * @param {string} leadId
 * @param {import('zod').infer<typeof import('../validation/createActivitySchema').createActivitySchema>} input
 * @returns {Promise<import('../types/activity').Activity>}
 */
async function executeCreateActivity(supabase, profileId, leadId, input) {
  const { data: activityId, error } = await supabase.rpc(
    "create_activity_with_followup",
    {
      p_lead_id: leadId,
      p_activity_type_id: input.activityTypeId,
      p_activity_outcome_id: input.activityOutcomeId,
      p_remark: input.remark.trim(),
      p_performed_by_profile_id: input.performedByProfileId,
      p_occurred_at: input.occurredAt,
      p_followup_assigned_to: input.nextFollowUp.assignedToProfileId,
      p_followup_due_at: input.nextFollowUp.dueAt,
      p_followup_notes: input.nextFollowUp.notes ?? "",
      p_created_by_profile_id: profileId,
      p_direction: input.direction ?? null,
    }
  );

  if (error || !activityId) {
    throw createActivityError(
      ACTIVITY_ERROR_CODES.UNKNOWN,
      "Unable to create activity. Please try again."
    );
  }

  return fetchActivityById(supabase, String(activityId));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} leadId
 * @returns {Promise<import('../types/activity').Activity[]>}
 */
async function executeGetActivitiesByLead(supabase, leadId) {
  const { data, error } = await supabase
    .from("activities")
    .select(`${ACTIVITY_SELECT}, ${ACTIVITY_DETAIL_JOINS}`)
    .eq("lead_id", leadId)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw createActivityError(
      ACTIVITY_ERROR_CODES.UNKNOWN,
      "Unable to load activities. Please try again."
    );
  }

  return (data ?? []).map((row) => mapActivityRow(row));
}

export const createActivity = createService({
  name: "createActivity",
  execute: executeCreateActivity,
});

export const getActivitiesByLead = createService({
  name: "getActivitiesByLead",
  execute: executeGetActivitiesByLead,
});
