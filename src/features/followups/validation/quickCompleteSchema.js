import { z } from "zod";

export const quickCompleteSchema = z.object({
  activityTypeId: z.string().uuid("Select an activity type."),
  activityOutcomeId: z.string().uuid("Select an outcome."),
  summary: z
    .string()
    .trim()
    .min(1, "Summary is required.")
    .max(5000, "Summary must be 5000 characters or fewer."),
  nextFollowUpDate: z
    .string()
    .min(1, "Next follow-up date is required."),
  nextFollowUpTime: z
    .string()
    .min(1, "Next follow-up time is required."),
});

/** @type {import('zod').infer<typeof quickCompleteSchema>} */
export const quickCompleteDefaultValues = {
  activityTypeId: "",
  activityOutcomeId: "",
  summary: "",
  nextFollowUpDate: "",
  nextFollowUpTime: "",
};

/**
 * @param {string} date
 * @param {string} time
 * @returns {string}
 */
export function combineDateAndTime(date, time) {
  return new Date(`${date}T${time}`).toISOString();
}

/**
 * @returns {string}
 */
export function todayDateInputValue() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * @returns {string}
 */
export function currentTimeInputValue() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/**
 * @param {Date} [from]
 * @returns {string}
 */
export function defaultNextFollowUpDateInput(from = new Date()) {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  const pad = (value) => String(value).padStart(2, "0");
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}
