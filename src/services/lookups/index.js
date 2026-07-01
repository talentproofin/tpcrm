import { createService } from "@/services/infrastructure";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import { createServerSupabaseClient } from "@/services/supabase/server";
import {
  getActivityOutcomes,
  getActivityTypes,
  getAllLookups,
  getDemoStatuses,
  getFollowupStatuses,
  getLeadSources,
  getLeadStages,
  getLeadTypes,
  getLookups,
  getTaskStatuses,
} from "./lookupService";

/**
 * @param {string} name
 * @param {Function} fetcher
 * @returns {ReturnType<typeof createService>}
 */
function createBrowserLookupRunner(name, fetcher) {
  return createService({
    name,
    execute: async (...args) => {
      const supabase = createBrowserSupabaseClient();
      return fetcher(supabase, ...args);
    },
  });
}

/**
 * @param {string} name
 * @param {Function} fetcher
 * @returns {ReturnType<typeof createService>}
 */
function createServerLookupRunner(name, fetcher) {
  return createService({
    name,
    execute: async (...args) => {
      const supabase = await createServerSupabaseClient();
      return fetcher(supabase, ...args);
    },
  });
}

export const lookupService = {
  getLookups: createBrowserLookupRunner("lookups.getLookups", getLookups),
  getLeadStages: createBrowserLookupRunner("lookups.getLeadStages", getLeadStages),
  getLeadTypes: createBrowserLookupRunner("lookups.getLeadTypes", getLeadTypes),
  getLeadSources: createBrowserLookupRunner("lookups.getLeadSources", getLeadSources),
  getActivityTypes: createBrowserLookupRunner(
    "lookups.getActivityTypes",
    getActivityTypes
  ),
  getActivityOutcomes: createBrowserLookupRunner(
    "lookups.getActivityOutcomes",
    getActivityOutcomes
  ),
  getDemoStatuses: createBrowserLookupRunner(
    "lookups.getDemoStatuses",
    getDemoStatuses
  ),
  getTaskStatuses: createBrowserLookupRunner(
    "lookups.getTaskStatuses",
    getTaskStatuses
  ),
  getFollowupStatuses: createBrowserLookupRunner(
    "lookups.getFollowupStatuses",
    getFollowupStatuses
  ),
  getAllLookups: createBrowserLookupRunner("lookups.getAllLookups", getAllLookups),
};

export const serverLookupService = {
  getLeadStages: createServerLookupRunner(
    "lookups.server.getLeadStages",
    getLeadStages
  ),
  getLeadTypes: createServerLookupRunner(
    "lookups.server.getLeadTypes",
    getLeadTypes
  ),
  getLeadSources: createServerLookupRunner(
    "lookups.server.getLeadSources",
    getLeadSources
  ),
  getActivityTypes: createServerLookupRunner(
    "lookups.server.getActivityTypes",
    getActivityTypes
  ),
  getActivityOutcomes: createServerLookupRunner(
    "lookups.server.getActivityOutcomes",
    getActivityOutcomes
  ),
  getDemoStatuses: createServerLookupRunner(
    "lookups.server.getDemoStatuses",
    getDemoStatuses
  ),
  getTaskStatuses: createServerLookupRunner(
    "lookups.server.getTaskStatuses",
    getTaskStatuses
  ),
  getFollowupStatuses: createServerLookupRunner(
    "lookups.server.getFollowupStatuses",
    getFollowupStatuses
  ),
  getAllLookups: createServerLookupRunner(
    "lookups.server.getAllLookups",
    getAllLookups
  ),
};

export { LOOKUP_TABLES } from "./constants";
export {
  getLookups,
  getLeadStages,
  getLeadTypes,
  getLeadSources,
  getActivityTypes,
  getActivityOutcomes,
  getDemoStatuses,
  getTaskStatuses,
  getFollowupStatuses,
  getAllLookups,
} from "./lookupService";
export { mapActivityOutcomeRow, mapLookupRow } from "./mappers";
