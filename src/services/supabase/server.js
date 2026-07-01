import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/config/env";
import { logger } from "@/services/logging";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Must be called per request — never cached as a module-level singleton.
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
export async function createServerSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  logger.debug("Creating server Supabase client");

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a Server Component — safe to ignore.
          // Middleware will refresh the session in M5.
        }
      },
    },
  });
}
