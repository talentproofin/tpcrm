/**
 * Allowed outcome codes per activity type.
 * Source of truth for M12A validation — outcomes are scoped to interaction type.
 *
 * @type {Record<string, readonly string[]>}
 */
export const ACTIVITY_TYPE_OUTCOME_CODES = {
  phone_call: [
    "connected",
    "not_answered",
    "busy",
    "switch_off",
    "wrong_number",
    "interested",
    "not_interested",
    "callback_requested",
  ],
  whatsapp: ["sent"],
  email: ["sent"],
  linkedin: ["connection_request_sent"],
  demo: ["scheduled", "completed", "cancelled", "rescheduled"],
  meeting: ["completed"],
  note: ["recorded"],
};

/**
 * Deprecated outcome codes — must not be used (represented by activity type).
 * @type {readonly string[]}
 */
export const DEPRECATED_ACTIVITY_OUTCOME_CODES = [
  "email_sent",
  "whatsapp_sent",
  "linkedin_request_sent",
  "demo_scheduled",
  "demo_completed",
];
