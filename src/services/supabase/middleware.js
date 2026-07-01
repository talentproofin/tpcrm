import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/config/env";
import { logger } from "@/services/logging";

/**
 * Creates a Supabase client for Next.js middleware.
 * Wired into route protection in Milestone 5 (Authentication).
 *
 * @param {import('next/server').NextRequest} request
 * @param {import('next/server').NextResponse} response
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createMiddlewareSupabaseClient(request, response) {
  const { url, anonKey } = getSupabaseConfig();

  logger.debug("Creating middleware Supabase client");

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
