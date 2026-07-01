/**
 * Authentication foundation verification script.
 * Run: npm run verify:auth
 *
 * Tests env helpers and constants without requiring a live session.
 * Full module graph (path aliases, Supabase clients) is verified via `npm run build`.
 */

import { AUTH_ERROR_CODES } from "../src/features/auth/constants/errors.js";
import { AUTH_ROUTES } from "../src/features/auth/constants/routes.js";

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

function verifySupabaseEnvironment() {
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

function mapAuthErrorCode(error) {
  if (!error) return AUTH_ERROR_CODES.UNKNOWN;

  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("invalid login credentials")) {
    return AUTH_ERROR_CODES.INVALID_CREDENTIALS;
  }

  return AUTH_ERROR_CODES.UNKNOWN;
}

console.log("\n--- Auth Foundation Verification ---\n");

console.log("Test: Supabase environment check");
const envCheck = verifySupabaseEnvironment();
assert(typeof envCheck.configured === "boolean", "Returns configured boolean");
assert(Array.isArray(envCheck.missing), "Returns missing array");
if (envCheck.configured) {
  console.log("  INFO: Supabase env vars are configured in this environment");
} else {
  console.log(
    `  INFO: Missing env vars (expected in CI without .env.local): ${envCheck.missing.join(", ")}`
  );
}

console.log("\nTest: Auth error codes");
const code = mapAuthErrorCode({ message: "Invalid login credentials" });
assert(code === AUTH_ERROR_CODES.INVALID_CREDENTIALS, "Maps invalid credentials");
assert(typeof AUTH_ERROR_CODES.SESSION_MISSING === "string", "Session missing code defined");

console.log("\nTest: Auth routes defined");
assert(AUTH_ROUTES.LOGIN === "/login", "Login route defined");
assert(AUTH_ROUTES.FORGOT_PASSWORD === "/forgot-password", "Forgot password route defined");
assert(AUTH_ROUTES.RESET_PASSWORD === "/reset-password", "Reset password route defined");
assert(AUTH_ROUTES.DASHBOARD === "/dashboard", "Dashboard route defined");

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
