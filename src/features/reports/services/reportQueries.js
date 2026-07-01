import {
  countActivitiesByOutcome,
  countActivitiesByType,
  fetchFollowUps,
  fetchTodayActivities,
  summarizeFollowUpBuckets,
} from "@/features/dashboard/services/dashboardQueries";
import { classifyFollowUpBucket } from "@/features/followups/utils/followUpBuckets";
import { EXECUTIVE_ROLE_CODES } from "../constants/roles";

/**
 * @param {Record<string, unknown>[]} activities
 * @param {string} outcomeCode
 * @returns {number}
 */
function countPhoneCallOutcome(activities, outcomeCode) {
  return activities.filter((row) => {
    const type = row.activity_types;
    const outcome = row.activity_outcomes;

    return (
      type &&
      !Array.isArray(type) &&
      type.code === "phone_call" &&
      outcome &&
      !Array.isArray(outcome) &&
      outcome.code === outcomeCode
    );
  }).length;
}

/**
 * @param {Record<string, unknown>[]} activities
 * @param {string} outcomeCode
 * @returns {number}
 */
function countDemoOutcome(activities, outcomeCode) {
  return activities.filter((row) => {
    const type = row.activity_types;
    const outcome = row.activity_outcomes;

    return (
      type &&
      !Array.isArray(type) &&
      type.code === "demo" &&
      outcome &&
      !Array.isArray(outcome) &&
      outcome.code === outcomeCode
    );
  }).length;
}

/**
 * @param {Record<string, unknown>[]} activities
 * @param {Record<string, unknown>[]} followUps
 * @returns {import('../types/report').OrganizationSummary}
 */
export function buildOrganizationSummary(activities, followUps) {
  const followUpSummary = summarizeFollowUpBuckets(followUps);

  return {
    callsAttempted: countActivitiesByType(activities, "phone_call"),
    callsConnected: countPhoneCallOutcome(activities, "connected"),
    notAnswered: countPhoneCallOutcome(activities, "not_answered"),
    busy: countPhoneCallOutcome(activities, "busy"),
    interested: countActivitiesByOutcome(activities, "interested"),
    notInterested: countActivitiesByOutcome(activities, "not_interested"),
    emailActivities: countActivitiesByType(activities, "email"),
    whatsappActivities: countActivitiesByType(activities, "whatsapp"),
    linkedinActivities: countActivitiesByType(activities, "linkedin"),
    demoScheduled: countDemoOutcome(activities, "scheduled"),
    demoCompleted: countDemoOutcome(activities, "completed"),
    activitiesLogged: activities.length,
    completedFollowUps: followUpSummary.completedToday,
    overdueFollowUps: followUpSummary.overdue,
  };
}

/**
 * @param {Record<string, unknown>[]} activities
 * @param {Record<string, unknown>[]} followUps
 * @param {string} profileId
 */
export function buildTeamSummaryRow(activities, followUps, profileId) {
  const performerActivities = activities.filter(
    (row) => String(row.performed_by_profile_id) === profileId
  );

  let followUpsCompleted = 0;

  for (const row of followUps) {
    if (String(row.assigned_to_profile_id) !== profileId) {
      continue;
    }

    const status = row.followup_statuses;
    const statusCode =
      status && !Array.isArray(status) ? String(status.code) : "pending";

    const bucket = classifyFollowUpBucket(
      String(row.due_at),
      statusCode,
      row.completed_at ? String(row.completed_at) : null
    );

    if (bucket === "completed_today") {
      followUpsCompleted += 1;
    }
  }

  return {
    calls: countActivitiesByType(performerActivities, "phone_call"),
    activities: performerActivities.length,
    interested: countActivitiesByOutcome(performerActivities, "interested"),
    followUpsCompleted,
    demosScheduled: countDemoOutcome(performerActivities, "scheduled"),
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ profileId: string, fullName: string }[]>}
 */
export async function fetchExecutiveProfiles(supabase) {
  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id, full_name, roles(code)")
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Unable to load executive profiles.");
  }

  return (data ?? [])
    .filter((row) => {
      const role = row.roles;
      return (
        role &&
        !Array.isArray(role) &&
        EXECUTIVE_ROLE_CODES.includes(String(role.code))
      );
    })
    .map((row) => ({
      profileId: String(row.profile_id),
      fullName: String(row.full_name),
    }));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<import('../types/report').DailyReport>}
 */
export async function loadDailyReportData(supabase) {
  const scope = { type: "all" };
  const [activities, followUps, executives] = await Promise.all([
    fetchTodayActivities(supabase, scope),
    fetchFollowUps(supabase, scope),
    fetchExecutiveProfiles(supabase),
  ]);

  const organizationSummary = buildOrganizationSummary(activities, followUps);
  const teamSummary = executives.map((executive) => ({
    profileId: executive.profileId,
    fullName: executive.fullName,
    ...buildTeamSummaryRow(activities, followUps, executive.profileId),
  }));

  return {
    reportDate: new Date().toISOString(),
    organizationSummary,
    teamSummary,
  };
}
