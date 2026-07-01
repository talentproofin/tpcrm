import { APP_ENV_KEYS } from "@/constants/app";
import { SUPABASE_ENV_KEYS } from "@/constants/supabase";
import {
  DEFAULT_LOG_LEVEL,
  LOG_LEVELS,
} from "@/constants/logging";
import { isValidLogLevel, isValidUrl, optionalEnv, requireEnv } from "./validateEnv";

/**
 * Application environment configuration.
 * Supabase vars are validated only when getSupabaseConfig() is called.
 */
export const env = {
  appUrl: (() => {
    const value = optionalEnv(
      process.env[APP_ENV_KEYS.APP_URL],
      "http://localhost:3000"
    );
    if (!isValidUrl(value)) {
      throw new Error(
        `Invalid ${APP_ENV_KEYS.APP_URL}: must be a valid http or https URL.`
      );
    }
    return value;
  })(),
  nodeEnv: optionalEnv(process.env[APP_ENV_KEYS.NODE_ENV], "development"),
  logLevel: (() => {
    const level = optionalEnv(
      process.env[APP_ENV_KEYS.LOG_LEVEL],
      DEFAULT_LOG_LEVEL
    );
    return isValidLogLevel(level) ? level : DEFAULT_LOG_LEVEL;
  })(),
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

/**
 * Returns validated Supabase configuration.
 * Call this when creating a Supabase client — not at module import time.
 * @returns {{ url: string, anonKey: string }}
 */
export function getSupabaseConfig() {
  return {
    url: requireEnv(
      SUPABASE_ENV_KEYS.URL,
      process.env[SUPABASE_ENV_KEYS.URL]
    ),
    anonKey: requireEnv(
      SUPABASE_ENV_KEYS.ANON_KEY,
      process.env[SUPABASE_ENV_KEYS.ANON_KEY]
    ),
  };
}

/**
 * Returns the Supabase service role key for server-only admin operations.
 * @returns {string}
 */
export function getSupabaseServiceRoleKey() {
  return requireEnv(
    SUPABASE_ENV_KEYS.SERVICE_ROLE_KEY,
    process.env[SUPABASE_ENV_KEYS.SERVICE_ROLE_KEY]
  );
}

