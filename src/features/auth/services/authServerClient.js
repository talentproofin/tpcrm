import { createServerSupabaseClient } from "@/services/supabase/server";

/**
 * Returns a Supabase client for auth operations on the server.
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
export async function getAuthServerClient() {
  return createServerSupabaseClient();
}
