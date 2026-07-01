import { createService } from "@/services/infrastructure/createService";
import { DEFAULT_ACTIVITY_DIRECTION } from "@/features/activities/constants/direction";
import { validateActivityTypeOutcomePair } from "@/features/activities/validation";
import { FOLLOWUP_ERROR_CODES } from "../constants/errors";
import { FOLLOWUP_VIEWS } from "../constants/routes";
import {
  FOLLOWUP_WORKSPACE_SELECT,
  mapFollowUpWorkspaceRow,
} from "./followUpMapper";
import {
  groupFollowUpItems,
  sortFollowUpItems,
} from "../utils/followUpBuckets";

/**
 * @param {string} code
 * @param {string} message
 * @returns {Error}
 */
export function createFollowUpError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * @typedef {Object} FollowUpWorkspaceFilters
 * @property {string} [search]
 * @property {string} [view]
 * @property {boolean} [assignedToMe]
 * @property {string} [assignedToProfileId]
 * @property {string} [leadTypeId]
 * @property {string} [stageId]
 */

/**
 * @param {import('../types/followUp').FollowUpWorkspaceItem} item
 * @param {FollowUpWorkspaceFilters} filters
 * @returns {boolean}
 */
function matchesFilters(item, filters) {
  if (filters.assignedToMe && filters.assignedToProfileId) {
    if (item.assignedToProfileId !== filters.assignedToProfileId) {
      return false;
    }
  } else if (filters.assignedToProfileId) {
    if (item.assignedToProfileId !== filters.assignedToProfileId) {
      return false;
    }
  }

  if (filters.leadTypeId && item.lead.leadType?.id !== filters.leadTypeId) {
    return false;
  }

  if (filters.stageId && item.lead.stage?.id !== filters.stageId) {
    return false;
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    const organization = item.lead.organizationName.toLowerCase();
    const contact = (item.lead.primaryContactName ?? "").toLowerCase();
    if (!organization.includes(query) && !contact.includes(query)) {
      return false;
    }
  }

  if (filters.view && filters.view !== FOLLOWUP_VIEWS.ALL) {
    if (item.bucket !== filters.view) {
      return false;
    }
  }

  return true;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {FollowUpWorkspaceFilters} [filters]
 * @returns {Promise<import('../types/followUp').FollowUpWorkspaceResult>}
 */
async function executeGetFollowUpWorkspace(supabase, filters = {}) {
  const { data, error } = await supabase
    .from("follow_ups")
    .select(FOLLOWUP_WORKSPACE_SELECT)
    .is("leads.deleted_at", null)
    .order("due_at", { ascending: true });

  if (error) {
    throw createFollowUpError(
      FOLLOWUP_ERROR_CODES.UNKNOWN,
      "Unable to load follow-ups. Please try again."
    );
  }

  const mapped = (data ?? [])
    .map((row) => mapFollowUpWorkspaceRow(row))
    .filter((item) => item.bucket !== null || item.status.code === "completed")
    .filter((item) => {
      if (item.status.code === "completed" && item.bucket !== "completed_today") {
        return false;
      }
      return item.bucket !== null;
    })
    .filter((item) => matchesFilters(item, filters));

  const sorted = sortFollowUpItems(mapped);

  return {
    items: sorted,
    grouped: groupFollowUpItems(sorted),
  };
}

/**
 * @typedef {Object} CompleteFollowUpInput
 * @property {string} followUpId
 * @property {string} activityTypeId
 * @property {string} activityOutcomeId
 * @property {string} summary
 * @property {string} nextFollowUpDueAt
 * @property {string} assignedToProfileId
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} profileId
 * @param {import('@/types/lookups').LookupItem[]} activityTypes
 * @param {import('@/types/lookups').ActivityOutcomeItem[]} activityOutcomes
 * @param {CompleteFollowUpInput} input
 * @returns {Promise<string>}
 */
async function executeCompleteFollowUp(
  supabase,
  profileId,
  activityTypes,
  activityOutcomes,
  input
) {
  const validation = validateActivityTypeOutcomePair(activityTypes, activityOutcomes, {
    activityTypeId: input.activityTypeId,
    activityOutcomeId: input.activityOutcomeId,
    direction: DEFAULT_ACTIVITY_DIRECTION,
    remark: input.summary,
    performedByProfileId: profileId,
    occurredAt: new Date().toISOString(),
    nextFollowUp: {
      dueAt: input.nextFollowUpDueAt,
      assignedToProfileId: input.assignedToProfileId,
      notes: "",
    },
  });

  if (!validation.valid) {
    throw createFollowUpError(
      FOLLOWUP_ERROR_CODES.VALIDATION,
      validation.message
    );
  }

  const { data: activityId, error } = await supabase.rpc(
    "complete_followup_with_activity",
    {
      p_followup_id: input.followUpId,
      p_activity_type_id: input.activityTypeId,
      p_activity_outcome_id: input.activityOutcomeId,
      p_remark: input.summary.trim(),
      p_performed_by_profile_id: profileId,
      p_occurred_at: new Date().toISOString(),
      p_followup_assigned_to: input.assignedToProfileId,
      p_followup_due_at: input.nextFollowUpDueAt,
      p_followup_notes: "",
      p_created_by_profile_id: profileId,
      p_direction: DEFAULT_ACTIVITY_DIRECTION,
    }
  );

  if (error) {
    const message = error.message.includes("already completed")
      ? "This follow-up has already been completed."
      : "Unable to complete follow-up. Please try again.";

    throw createFollowUpError(
      error.message.includes("already completed")
        ? FOLLOWUP_ERROR_CODES.ALREADY_COMPLETED
        : FOLLOWUP_ERROR_CODES.UNKNOWN,
      message
    );
  }

  if (!activityId) {
    throw createFollowUpError(
      FOLLOWUP_ERROR_CODES.UNKNOWN,
      "Unable to complete follow-up. Please try again."
    );
  }

  return String(activityId);
}

export const getFollowUpWorkspace = createService({
  name: "getFollowUpWorkspace",
  execute: executeGetFollowUpWorkspace,
});

export const completeFollowUp = createService({
  name: "completeFollowUp",
  execute: executeCompleteFollowUp,
});
