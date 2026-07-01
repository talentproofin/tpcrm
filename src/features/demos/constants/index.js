export const DEMO_ERROR_CODES = {
  NOT_FOUND: "DEMO_NOT_FOUND",
  VALIDATION: "DEMO_VALIDATION",
  INVALID_STATE: "DEMO_INVALID_STATE",
  UNKNOWN: "DEMO_UNKNOWN",
};

export const DEMO_MODES = {
  ONLINE: "online",
  OFFLINE: "offline",
};

export const DEMO_MODE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

export const DEMO_STATUS_CODES = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
};

export const DEMO_OUTCOME_CODES = {
  POSITIVE: "positive",
  FOLLOW_UP_REQUIRED: "follow_up_required",
  NOT_INTERESTED: "not_interested",
  DECISION_PENDING: "decision_pending",
};

/** Outcomes that trigger a follow-up when a demo is completed. */
export const DEMO_OUTCOMES_WITH_FOLLOW_UP = [
  DEMO_OUTCOME_CODES.POSITIVE,
  DEMO_OUTCOME_CODES.FOLLOW_UP_REQUIRED,
  DEMO_OUTCOME_CODES.DECISION_PENDING,
];
