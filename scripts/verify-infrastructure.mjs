/**
 * Infrastructure verification script.
 * Run: npm run verify:infra
 *
 * Tests env validation helpers without requiring a live Supabase project.
 */

import {
  isValidLogLevel,
  optionalEnv,
  requireEnv,
} from "../src/config/validateEnv.js";

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

console.log("\n--- Infrastructure Verification ---\n");

// requireEnv: missing value throws
console.log("Test: requireEnv throws on missing value");
try {
  requireEnv("TEST_MISSING_KEY", undefined);
  assert(false, "Should have thrown");
} catch (err) {
  assert(err.message.includes("TEST_MISSING_KEY"), "Error names the missing key");
}

// requireEnv: valid value returns
console.log("\nTest: requireEnv returns valid value");
assert(requireEnv("TEST_KEY", "value") === "value", "Returns the value");

// optionalEnv: fallback
console.log("\nTest: optionalEnv uses fallback");
assert(optionalEnv(undefined, "fallback") === "fallback", "Uses fallback");
assert(optionalEnv("actual", "fallback") === "actual", "Uses actual value");

// isValidLogLevel
console.log("\nTest: isValidLogLevel");
assert(isValidLogLevel("info"), "info is valid");
assert(isValidLogLevel("invalid") === false, "invalid is rejected");

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
