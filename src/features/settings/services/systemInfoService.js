import { createService } from "@/services/infrastructure/createService";
import { APP_VERSION } from "../constants";
import { env } from "@/config/env";

/**
 * @param {unknown} value
 * @returns {string}
 */
function parseSettingValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ nodeVersion?: string, nextVersion?: string }} [runtime]
 * @returns {Promise<import('../types/settings').SystemInformation>}
 */
async function fetchSystemInformation(supabase, runtime = {}) {
  const [
    settingsResult,
    activeUsersResult,
    leadsResult,
    activitiesResult,
    followupsResult,
  ] = await Promise.all([
    supabase
      .from("app_settings")
      .select("key, value, updated_at")
      .in("key", ["organization_timezone", "schema_version"]),
    supabase
      .from("profiles")
      .select("profile_id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("leads").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("activities").select("id", { count: "exact", head: true }),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }),
  ]);

  if (settingsResult.error) {
    throw new Error(settingsResult.error.message);
  }

  if (activeUsersResult.error) {
    throw new Error(activeUsersResult.error.message);
  }

  if (leadsResult.error) {
    throw new Error(leadsResult.error.message);
  }

  if (activitiesResult.error) {
    throw new Error(activitiesResult.error.message);
  }

  if (followupsResult.error) {
    throw new Error(followupsResult.error.message);
  }

  /** @type {Record<string, { value: string, updatedAt: string | null }>} */
  const settings = {};

  for (const row of settingsResult.data ?? []) {
    settings[String(row.key)] = {
      value: parseSettingValue(row.value),
      updatedAt: row.updated_at ? String(row.updated_at) : null,
    };
  }

  return {
    applicationVersion: APP_VERSION,
    environment: env.nodeEnv,
    buildDate: settings.schema_version?.updatedAt ?? null,
    nodeVersion: runtime.nodeVersion ?? "—",
    nextVersion: runtime.nextVersion ?? "—",
    currentTimezone: settings.organization_timezone?.value ?? "",
    databaseMigrationVersion: settings.schema_version?.value ?? "",
    totalActiveUsers: activeUsersResult.count ?? 0,
    totalLeads: leadsResult.count ?? 0,
    totalActivities: activitiesResult.count ?? 0,
    totalFollowups: followupsResult.count ?? 0,
  };
}

export const getSystemInformation = createService({
  name: "getSystemInformation",
  execute: fetchSystemInformation,
});
