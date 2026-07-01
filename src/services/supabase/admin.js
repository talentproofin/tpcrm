import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, getSupabaseServiceRoleKey } from "@/config/env";
import { logger } from "@/services/logging";

/**
 * Creates a Supabase admin client with the service role key.
 * Server-only — never import from Client Components.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createAdminSupabaseClient() {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  logger.debug("Creating admin Supabase client");

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
