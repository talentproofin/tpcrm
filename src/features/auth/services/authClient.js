import { createBrowserSupabaseClient } from "@/services/supabase/browser";

/**
 * Returns a Supabase client for auth operations in Client Components.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getAuthBrowserClient() {
  return createBrowserSupabaseClient();
}

/**
 * Verifies Supabase environment configuration is present.
 * @returns {{ configured: boolean, missing: string[] }}
 */
export function verifySupabaseEnvironment() {
  const missing = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    configured: missing.length === 0,
    missing,
  };
}
