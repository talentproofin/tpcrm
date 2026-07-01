import { z } from "zod";
import { DEMO_MODES } from "../constants";

const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid meeting link URL.")
  .optional()
  .or(z.literal(""));

/**
 * @param {string} date
 * @param {string} time
 * @returns {string}
 */
export function combineDemoDateAndTime(date, time) {
  return new Date(`${date}T${time}`).toISOString();
}

/**
 * @returns {string}
 */
export function defaultDemoDateInput() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pad = (value) => String(value).padStart(2, "0");
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
}

export const demoScheduleSchema = z
  .object({
    demoDate: z.string().min(1, "Demo date is required."),
    demoTime: z.string().min(1, "Demo time is required."),
    durationMinutes: z.coerce
      .number()
      .int("Duration must be a whole number.")
      .positive("Duration must be greater than zero."),
    demoMode: z.enum([DEMO_MODES.ONLINE, DEMO_MODES.OFFLINE], {
      required_error: "Select a demo mode.",
    }),
    meetingLink: optionalUrl,
    venue: optionalText(500, "Venue"),
    presenterProfileId: z.string().uuid("Select a presenter."),
    attendees: optionalText(2000, "Attendees"),
    internalNotes: optionalText(5000, "Internal notes"),
  })
  .superRefine((values, context) => {
    const scheduledAt = combineDemoDateAndTime(values.demoDate, values.demoTime);

    if (new Date(scheduledAt).getTime() < Date.now()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Demo date and time cannot be in the past.",
        path: ["demoDate"],
      });
    }
  });

export const demoCompleteSchema = z.object({
  demoOutcomeId: z.string().uuid("Select an outcome."),
  summary: z
    .string()
    .trim()
    .min(1, "Summary is required.")
    .max(5000, "Summary must be 5000 characters or fewer."),
});

export const demoCompletedEditSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(1, "Summary is required.")
    .max(5000, "Summary must be 5000 characters or fewer."),
  internalNotes: optionalText(5000, "Internal notes"),
});

/** @type {import('zod').infer<typeof demoScheduleSchema>} */
export const demoScheduleDefaultValues = {
  demoDate: defaultDemoDateInput(),
  demoTime: "10:00",
  durationMinutes: 60,
  demoMode: DEMO_MODES.ONLINE,
  meetingLink: "",
  venue: "",
  presenterProfileId: "",
  attendees: "",
  internalNotes: "",
};

/** @type {import('zod').infer<typeof demoCompleteSchema>} */
export const demoCompleteDefaultValues = {
  demoOutcomeId: "",
  summary: "",
};

/** @type {import('zod').infer<typeof demoCompletedEditSchema>} */
export const demoCompletedEditDefaultValues = {
  summary: "",
  internalNotes: "",
};
