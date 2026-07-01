import { createService } from "@/services/infrastructure/createService";
import { DASHBOARD_LINKS } from "../constants/routes";
import {
  buildTeamPerformance,
  countActivitiesByOutcome,
  countActivitiesByType,
  countDemosCompletedToday,
  countDemosScheduledToday,
  countPositiveDemoOutcomes,
  fetchDemos,
  fetchFollowUps,
  fetchPipelineByStage,
  fetchTodayActivities,
  getTeamProfileIds,
  mapRecentActivities,
  summarizeFollowUpBuckets,
} from "./dashboardQueries";

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('./dashboardQueries').DashboardScope} scope
 */
async function loadScopedDashboardData(supabase, scope) {
  const [activities, followUps, demos] = await Promise.all([
    fetchTodayActivities(supabase, scope),
    fetchFollowUps(supabase, scope),
    fetchDemos(supabase, scope),
  ]);

  return {
    activities,
    followUps,
    demos,
    followUpSummary: summarizeFollowUpBuckets(followUps),
  };
}

export const getCeoDashboard = createService({
  name: "getCeoDashboard",
  execute: async (supabase) => {
    const scope = { type: "all" };
    const { activities, followUps, demos, followUpSummary } =
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
        id: "demo_scheduled_today",
        label: "Demo Scheduled Today",
        value: countDemosScheduledToday(demos),
        href: DASHBOARD_LINKS.leads,
      },
      {
        id: "demo_completed_today",
        label: "Demo Completed Today",
        value: countDemosCompletedToday(demos),
        href: DASHBOARD_LINKS.leads,
      },
      {
        id: "positive_demo_outcomes",
        label: "Positive Demo Outcomes",
        value: countPositiveDemoOutcomes(demos),
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
    const { activities, followUps, demos, followUpSummary } =
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
          id: "team_demos_scheduled_today",
          label: "Demo Scheduled Today",
          value: countDemosScheduledToday(demos),
          href: DASHBOARD_LINKS.leads,
        },
        {
          id: "team_demos_completed_today",
          label: "Demo Completed Today",
          value: countDemosCompletedToday(demos),
          href: DASHBOARD_LINKS.leads,
        },
        {
          id: "team_positive_demo_outcomes",
          label: "Positive Demo Outcomes",
          value: countPositiveDemoOutcomes(demos),
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
    const { activities, followUps, demos, followUpSummary } =
      await loadScopedDashboardData(supabase, scope);

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
          id: "my_demos_scheduled_today",
          label: "Demo Scheduled Today",
          value: countDemosScheduledToday(demos),
          href: DASHBOARD_LINKS.leads,
        },
        {
          id: "my_demos_completed_today",
          label: "Demo Completed Today",
          value: countDemosCompletedToday(demos),
          href: DASHBOARD_LINKS.leads,
        },
        {
          id: "my_positive_demo_outcomes",
          label: "Positive Demo Outcomes",
          value: countPositiveDemoOutcomes(demos),
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
