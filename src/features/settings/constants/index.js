export const SETTINGS_ERROR_CODES = {
  VALIDATION: "SETTINGS_VALIDATION",
  FORBIDDEN: "SETTINGS_FORBIDDEN",
  UNKNOWN: "SETTINGS_UNKNOWN",
};

export const SETTINGS_ACCESS_ROLE_CODES = ["admin", "ceo"];

export const SETTINGS_WRITE_ROLE_CODES = ["admin"];

export const APP_VERSION = "0.1.0";

export const LOOKUP_DEFINITIONS = [
  { id: "lead_types", label: "Lead Types", table: "lead_types" },
  { id: "lead_sources", label: "Lead Sources", table: "lead_sources" },
  { id: "lead_stages", label: "Lead Stages", table: "lead_stages" },
  { id: "activity_types", label: "Activity Types", table: "activity_types" },
  {
    id: "activity_outcomes",
    label: "Activity Outcomes",
    table: "activity_outcomes",
    requiresActivityType: true,
  },
  { id: "demo_outcomes", label: "Demo Outcomes", table: "demo_outcomes" },
  { id: "demo_statuses", label: "Demo Statuses", table: "demo_statuses" },
  {
    id: "followup_statuses",
    label: "Follow-up Statuses",
    table: "followup_statuses",
  },
];

export const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

export const DATE_FORMAT_OPTIONS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

export const TIME_FORMAT_OPTIONS = ["HH:mm", "hh:mm A"];
