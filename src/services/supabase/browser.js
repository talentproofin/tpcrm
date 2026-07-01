import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/config/env";
import { logger } from "@/services/logging";

/**
 * Creates a Supabase client for Client Components (browser).
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  logger.debug("Creating browser Supabase client");
  return createBrowserClient(url, anonKey);
}
