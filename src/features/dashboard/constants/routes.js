import { FOLLOWUP_VIEWS } from "@/features/followups/constants/routes";

/**
 * @param {string} [view]
 * @returns {string}
 */
export function followUpWorkspaceHref(view) {
  if (!view) {
    return "/follow-ups";
  }

  return `/follow-ups?view=${encodeURIComponent(view)}`;
}

/**
 * @param {{ stageId?: string, ownerProfileId?: string }} [filters]
 * @returns {string}
 */
export function leadListHref(filters = {}) {
  const params = new URLSearchParams();

  if (filters.stageId) {
    params.set("stageId", filters.stageId);
  }

  if (filters.ownerProfileId) {
    params.set("ownerProfileId", filters.ownerProfileId);
  }

  const query = params.toString();
  return query ? `/leads?${query}` : "/leads";
}

export const DASHBOARD_LINKS = {
  followUpsToday: followUpWorkspaceHref(FOLLOWUP_VIEWS.TODAY),
  followUpsOverdue: followUpWorkspaceHref(FOLLOWUP_VIEWS.OVERDUE),
  followUpsUpcoming: followUpWorkspaceHref(FOLLOWUP_VIEWS.UPCOMING),
  followUpsCompletedToday: followUpWorkspaceHref(FOLLOWUP_VIEWS.COMPLETED_TODAY),
  followUpsAll: followUpWorkspaceHref(FOLLOWUP_VIEWS.ALL),
  leads: leadListHref(),
};
