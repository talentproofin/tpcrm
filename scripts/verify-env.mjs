/**
 * Environment verification script.
 * Run: npm run verify:env
 */

import { env, getSupabaseConfig, getSupabaseServiceRoleKey } from "../src/config/env.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

console.log("\n--- Environment Verification ---\n");

try {
  assert(typeof env.appUrl === "string" && env.appUrl.length > 0, "APP_URL configured");
  assert(typeof env.nodeEnv === "string", "NODE_ENV readable");
  assert(["debug", "info", "warn", "error"].includes(env.logLevel), "LOG_LEVEL valid");

  const supabase = getSupabaseConfig();
  assert(Boolean(supabase.url), "Supabase URL present");
  assert(Boolean(supabase.anonKey), "Supabase anon key present");

  const serviceRoleKey = getSupabaseServiceRoleKey();
  assert(Boolean(serviceRoleKey), "Supabase service role key present");

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
  process.exit(failed > 0 ? 1 : 0);
} catch (error) {
  console.error(`\n  FAIL: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
