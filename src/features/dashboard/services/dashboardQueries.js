import { classifyFollowUpBucket } from "@/features/followups/utils/followUpBuckets";
import { startOfDay, endOfDay, isToday } from "@/features/followups/utils/followUpBuckets";
import { DEMO_STATUS_CODES, DEMO_OUTCOME_CODES } from "@/features/demos/constants";

/**
 * @returns {{ start: string, end: string }}
 */
export function getTodayRange() {
  return {
    start: startOfDay().toISOString(),
    end: endOfDay().toISOString(),
  };
}

/**
 * @typedef {{ type: 'all' } | { type: 'team', profileIds: string[] } | { type: 'self', profileId: string }} DashboardScope
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} managerProfileId
 * @returns {Promise<string[]>}
 */
export async function getTeamProfileIds(supabase, managerProfileId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id")
    .eq("manager_profile_id", managerProfileId)
    .eq("status", "active");

  if (error) {
    throw new Error("Unable to load team profiles.");
  }

  return (data ?? []).map((row) => String(row.profile_id));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {DashboardScope} scope
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function fetchTodayActivities(supabase, scope) {
  const { start, end } = getTodayRange();

  let query = supabase
    .from("activities")
    .select(
      `id, lead_id, occurred_at, remark, performed_by_profile_id,
      activity_types(code, name),
      activity_outcomes(code, name),
      performed_by_profile:profiles!activities_performed_by_profile_id_fkey(full_name),
      leads!inner(organization_name, deleted_at)`
    )
    .gte("occurred_at", start)
    .lte("occurred_at", end)
    .is("leads.deleted_at", null)
    .order("occurred_at", { ascending: false });

  if (scope.type === "self") {
    query = query.eq("performed_by_profile_id", scope.profileId);
  } else if (scope.type === "team") {
    if (scope.profileIds.length === 0) {
      return [];
    }

    query = query.in("performed_by_profile_id", scope.profileIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Unable to load activities.");
  }

  return data ?? [];
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {DashboardScope} scope
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function fetchFollowUps(supabase, scope) {
  let query = supabase
    .from("follow_ups")
    .select(
      `id, due_at, completed_at, assigned_to_profile_id,
      followup_statuses(code, name),
      leads!inner(deleted_at)`
    )
    .is("leads.deleted_at", null);

  if (scope.type === "self") {
    query = query.eq("assigned_to_profile_id", scope.profileId);
  } else if (scope.type === "team") {
    if (scope.profileIds.length === 0) {
      return [];
    }

    query = query.in("assigned_to_profile_id", scope.profileIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Unable to load follow-ups.");
  }

  return data ?? [];
}

/**
 * @param {Record<string, unknown>[]} followUps
 */
export function summarizeFollowUpBuckets(followUps) {
  const summary = {
    today: 0,
    overdue: 0,
    upcoming: 0,
    completedToday: 0,
  };

  for (const row of followUps) {
    const status = row.followup_statuses;
    const statusCode =
      status && !Array.isArray(status) ? String(status.code) : "pending";

    const bucket = classifyFollowUpBucket(
      String(row.due_at),
      statusCode,
      row.completed_at ? String(row.completed_at) : null
    );

    if (bucket === "today") {
      summary.today += 1;
    } else if (bucket === "overdue") {
      summary.overdue += 1;
    } else if (bucket === "upcoming") {
      summary.upcoming += 1;
    } else if (bucket === "completed_today") {
      summary.completedToday += 1;
    }
  }

  return summary;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {DashboardScope} scope
 * @returns {Promise<import('../types/dashboard').PipelineStageMetric[]>}
 */
export async function fetchPipelineByStage(supabase, scope) {
  let query = supabase
    .from("leads")
    .select("stage_id, lead_stages(id, code, name, display_order)")
    .is("deleted_at", null);

  if (scope.type === "self") {
    query = query.or(
      `owner_profile_id.eq.${scope.profileId},assigned_to_profile_id.eq.${scope.profileId}`
    );
  } else if (scope.type === "team") {
    if (scope.profileIds.length === 0) {
      return [];
    }

    const filters = scope.profileIds
      .flatMap((id) => [
        `owner_profile_id.eq.${id}`,
        `assigned_to_profile_id.eq.${id}`,
      ])
      .join(",");

    query = query.or(filters);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Unable to load pipeline data.");
  }

  const counts = new Map();

  for (const row of data ?? []) {
    const stage = row.lead_stages;
    if (!stage || Array.isArray(stage)) {
      continue;
    }

    const stageId = String(stage.id);
    const existing = counts.get(stageId);

    if (existing) {
      existing.count += 1;
    } else {
      counts.set(stageId, {
        stageId,
        stageName: String(stage.name),
        stageCode: String(stage.code),
        displayOrder: Number(stage.display_order),
        count: 1,
      });
    }
  }

  return [...counts.values()].sort(
    (left, right) => left.displayOrder - right.displayOrder
  );
}

/**
 * @param {Record<string, unknown>[]} activities
 * @param {number} [limit]
 * @returns {import('../types/dashboard').RecentActivityRow[]}
 */
export function mapRecentActivities(activities, limit = 10) {
  return activities.slice(0, limit).map((row) => {
    const activityType = row.activity_types;
    const activityOutcome = row.activity_outcomes;
    const performer = row.performed_by_profile;
    const lead = row.leads;

    return {
      id: String(row.id),
      leadId: String(row.lead_id),
      organizationName:
        lead && !Array.isArray(lead) ? String(lead.organization_name) : "—",
      activityTypeName:
        activityType && !Array.isArray(activityType)
          ? String(activityType.name)
          : "Activity",
      outcomeName:
        activityOutcome && !Array.isArray(activityOutcome)
          ? String(activityOutcome.name)
          : "—",
      performerName:
        performer && !Array.isArray(performer)
          ? String(performer.full_name)
          : "—",
      occurredAt: String(row.occurred_at),
      remark: String(row.remark),
    };
  });
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Record<string, unknown>[]} activities
 * @param {Record<string, unknown>[]} followUps
 * @returns {Promise<import('../types/dashboard').TeamPerformanceRow[]>}
 */
export async function buildTeamPerformance(
  supabase,
  activities,
  followUps
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id, full_name")
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Unable to load team performance.");
  }

  const performanceMap = new Map(
    (data ?? []).map((row) => [
      String(row.profile_id),
      {
        profileId: String(row.profile_id),
        fullName: String(row.full_name),
        activitiesToday: 0,
        completedToday: 0,
        interestedToday: 0,
        overdueFollowUps: 0,
      },
    ])
  );

  for (const row of activities) {
    const profileId = String(row.performed_by_profile_id);
    const entry = performanceMap.get(profileId);

    if (!entry) {
      continue;
    }

    entry.activitiesToday += 1;

    const outcome = row.activity_outcomes;
    if (outcome && !Array.isArray(outcome) && outcome.code === "interested") {
      entry.interestedToday += 1;
    }
  }

  for (const row of followUps) {
    const profileId = String(row.assigned_to_profile_id);
    const entry = performanceMap.get(profileId);

    if (!entry) {
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
      entry.completedToday += 1;
    } else if (bucket === "overdue") {
      entry.overdueFollowUps += 1;
    }
  }

  return [...performanceMap.values()].filter(
    (row) =>
      row.activitiesToday > 0 ||
      row.completedToday > 0 ||
      row.interestedToday > 0 ||
      row.overdueFollowUps > 0
  );
}

/**
 * @param {Record<string, unknown>[]} activities
 * @param {string} typeCode
 * @returns {number}
 */
export function countActivitiesByType(activities, typeCode) {
  return activities.filter((row) => {
    const type = row.activity_types;
    return type && !Array.isArray(type) && type.code === typeCode;
  }).length;
}

/**
 * @param {Record<string, unknown>[]} activities
 * @param {string} outcomeCode
 * @returns {number}
 */
export function countActivitiesByOutcome(activities, outcomeCode) {
  return activities.filter((row) => {
    const outcome = row.activity_outcomes;
    return outcome && !Array.isArray(outcome) && outcome.code === outcomeCode;
  }).length;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {DashboardScope} scope
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function fetchDemos(supabase, scope) {
  let query = supabase
    .from("demos")
    .select(
      `id, scheduled_at, completed_at, presenter_profile_id,
      demo_statuses(code, name),
      demo_outcomes(code, name),
      leads!inner(deleted_at)`
    )
    .is("leads.deleted_at", null);

  if (scope.type === "self") {
    query = query.eq("presenter_profile_id", scope.profileId);
  } else if (scope.type === "team") {
    if (scope.profileIds.length === 0) {
      return [];
    }

    query = query.in("presenter_profile_id", scope.profileIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Unable to load demos.");
  }

  return data ?? [];
}

/**
 * @param {Record<string, unknown>[]} demos
 * @returns {number}
 */
export function countDemosScheduledToday(demos) {
  return demos.filter((row) => {
    const status = row.demo_statuses;
    const statusCode =
      status && !Array.isArray(status) ? String(status.code) : "";

    return (
      statusCode === DEMO_STATUS_CODES.SCHEDULED &&
      isToday(String(row.scheduled_at))
    );
  }).length;
}

/**
 * @param {Record<string, unknown>[]} demos
 * @returns {number}
 */
export function countDemosCompletedToday(demos) {
  return demos.filter((row) => {
    const status = row.demo_statuses;
    const statusCode =
      status && !Array.isArray(status) ? String(status.code) : "";

    return (
      statusCode === DEMO_STATUS_CODES.COMPLETED &&
      row.completed_at &&
      isToday(String(row.completed_at))
    );
  }).length;
}

/**
 * @param {Record<string, unknown>[]} demos
 * @returns {number}
 */
export function countPositiveDemoOutcomes(demos) {
  return demos.filter((row) => {
    const status = row.demo_statuses;
    const outcome = row.demo_outcomes;
    const statusCode =
      status && !Array.isArray(status) ? String(status.code) : "";
    const outcomeCode =
      outcome && !Array.isArray(outcome) ? String(outcome.code) : "";

    return (
      statusCode === DEMO_STATUS_CODES.COMPLETED &&
      outcomeCode === DEMO_OUTCOME_CODES.POSITIVE &&
      row.completed_at &&
      isToday(String(row.completed_at))
    );
  }).length;
}
