import { createService } from "@/services/infrastructure/createService";
import { DASHBOARD_LINKS } from "../constants/routes";
import {
  buildTeamPerformance,
  countActivitiesByOutcome,
  countActivitiesByType,
  fetchFollowUps,
  fetchPipelineByStage,
  fetchTodayActivities,
  getTeamProfileIds,
  mapRecentActivities,
  summarizeFollowUpBuckets,
} from "./dashboardQueries";

/**
 * @param {Record<string, unknown>[]} activities
 * @returns {number}
 */
function countDemoScheduledToday(activities) {
  return activities.filter((row) => {
    const type = row.activity_types;
    const outcome = row.activity_outcomes;

    return (
      type &&
      !Array.isArray(type) &&
      type.code === "demo" &&
      outcome &&
      !Array.isArray(outcome) &&
      outcome.code === "scheduled"
    );
  }).length;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('./dashboardQueries').DashboardScope} scope
 */
async function loadScopedDashboardData(supabase, scope) {
  const [activities, followUps] = await Promise.all([
    fetchTodayActivities(supabase, scope),
    fetchFollowUps(supabase, scope),
  ]);

  return {
    activities,
    followUps,
    followUpSummary: summarizeFollowUpBuckets(followUps),
  };
}

export const getCeoDashboard = createService({
  name: "getCeoDashboard",
  execute: async (supabase) => {
    const scope = { type: "all" };
    const { activities, followUps, followUpSummary } =
      await loadScopedDashboardData(supabase, scope);

    const metrics = [
      {
        id: "calls_attempted",
        label: "Calls Attempted Today",
        value: countActivitiesByType(activities, "phone_call"),
        href: DASHBOARD_LINKS.leads,
      },
      {
        id: "activities_logged",
        label: "Activities Logged Today",
        value: activities.length,
        href: DASHBOARD_LINKS.leads,
      },
      {
        id: "interested",
        label: "Interested",
        value: countActivitiesByOutcome(activities, "interested"),
        href: DASHBOARD_LINKS.leads,
      },
      {
        id: "not_interested",
        label: "Not Interested",
        value: countActivitiesByOutcome(activities, "not_interested"),
        href: DASHBOARD_LINKS.leads,
      },
      {
        id: "demo_scheduled",
        label: "Demo Scheduled",
        value: countDemoScheduledToday(activities),
        href: DASHBOARD_LINKS.leads,
      },
      {
        id: "followups_today",
        label: "Today's Follow-ups",
        value: followUpSummary.today,
        href: DASHBOARD_LINKS.followUpsToday,
      },
      {
        id: "completed_today",
        label: "Completed Today",
        value: followUpSummary.completedToday,
        href: DASHBOARD_LINKS.followUpsCompletedToday,
      },
      {
        id: "overdue_followups",
        label: "Overdue Follow-ups",
        value: followUpSummary.overdue,
        href: DASHBOARD_LINKS.followUpsOverdue,
      },
    ];

    const [pipeline, teamPerformance] = await Promise.all([
      fetchPipelineByStage(supabase, scope),
      buildTeamPerformance(supabase, activities, followUps),
    ]);

    return {
      metrics,
      pipeline,
      recentActivities: mapRecentActivities(activities),
      teamPerformance,
    };
  },
});

export const getManagerDashboard = createService({
  name: "getManagerDashboard",
  execute: async (supabase, managerProfileId) => {
    const teamProfileIds = await getTeamProfileIds(supabase, managerProfileId);
    const scope = { type: "team", profileIds: teamProfileIds };
    const { activities, followUps, followUpSummary } =
      await loadScopedDashboardData(supabase, scope);

    return {
      metrics: [
        {
          id: "team_activities",
          label: "Team Activities",
          value: activities.length,
          href: DASHBOARD_LINKS.leads,
        },
        {
          id: "team_followups_due",
          label: "Team Follow-ups Due",
          value: followUpSummary.today,
          href: DASHBOARD_LINKS.followUpsToday,
        },
        {
          id: "team_completed_today",
          label: "Team Completed Today",
          value: followUpSummary.completedToday,
          href: DASHBOARD_LINKS.followUpsCompletedToday,
        },
        {
          id: "team_overdue",
          label: "Team Overdue",
          value: followUpSummary.overdue,
          href: DASHBOARD_LINKS.followUpsOverdue,
        },
        {
          id: "team_interested",
          label: "Team Interested",
          value: countActivitiesByOutcome(activities, "interested"),
          href: DASHBOARD_LINKS.leads,
        },
        {
          id: "team_demos",
          label: "Team Demos",
          value: countDemoScheduledToday(activities),
          href: DASHBOARD_LINKS.leads,
        },
      ],
    };
  },
});

export const getExecutiveDashboard = createService({
  name: "getExecutiveDashboard",
  execute: async (supabase, profileId) => {
    const scope = { type: "self", profileId };
    const { activities, followUpSummary } = await loadScopedDashboardData(
      supabase,
      scope
    );

    return {
      metrics: [
        {
          id: "my_followups_today",
          label: "My Follow-ups Today",
          value: followUpSummary.today,
          href: DASHBOARD_LINKS.followUpsToday,
        },
        {
          id: "my_completed_today",
          label: "My Completed Today",
          value: followUpSummary.completedToday,
          href: DASHBOARD_LINKS.followUpsCompletedToday,
        },
        {
          id: "my_overdue",
          label: "My Overdue",
          value: followUpSummary.overdue,
          href: DASHBOARD_LINKS.followUpsOverdue,
        },
        {
          id: "my_activities_today",
          label: "My Activities Today",
          value: activities.length,
          href: DASHBOARD_LINKS.leads,
        },
        {
          id: "my_interested",
          label: "My Interested",
          value: countActivitiesByOutcome(activities, "interested"),
          href: DASHBOARD_LINKS.leads,
        },
        {
          id: "my_upcoming_followups",
          label: "My Upcoming Follow-ups",
          value: followUpSummary.upcoming,
          href: DASHBOARD_LINKS.followUpsUpcoming,
        },
      ],
    };
  },
});
