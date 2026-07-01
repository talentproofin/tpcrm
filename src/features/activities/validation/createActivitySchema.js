import { z } from "zod";
import { ACTIVITY_DIRECTIONS, DEFAULT_ACTIVITY_DIRECTION } from "../constants/direction";
import { ACTIVITY_TYPE_OUTCOME_CODES } from "../constants/outcomes";

const directionSchema = z.enum(ACTIVITY_DIRECTIONS).default(DEFAULT_ACTIVITY_DIRECTION);

export const createActivitySchema = z.object({
  activityTypeId: z.string().uuid("Select an activity type."),
  activityOutcomeId: z.string().uuid("Select an outcome."),
  direction: directionSchema,
  remark: z
    .string()
    .trim()
    .min(1, "Remark is required.")
    .max(5000, "Remark must be 5000 characters or fewer."),
  performedByProfileId: z.string().uuid("Select who performed this activity."),
  occurredAt: z.string().datetime({ message: "Enter a valid date and time." }),
  nextFollowUp: z.object({
    dueAt: z.string().datetime({ message: "Enter a valid follow-up date." }),
    assignedToProfileId: z
      .string()
      .uuid("Select who the follow-up is assigned to."),
    notes: z
      .string()
      .trim()
      .max(2000, "Follow-up notes must be 2000 characters or fewer.")
      .optional()
      .or(z.literal("")),
  }),
});

/**
 * Validates that the selected outcome belongs to the selected activity type.
 *
 * @param {import('@/types/lookups').LookupItem[]} activityTypes
 * @param {import('@/types/lookups').ActivityOutcomeItem[]} activityOutcomes
 * @param {import('zod').infer<typeof createActivitySchema>} data
 * @returns {{ valid: true } | { valid: false, message: string, path: 'activityOutcomeId' | 'activityTypeId' }}
 */
export function validateActivityTypeOutcomePair(
  activityTypes,
  activityOutcomes,
  data
) {
  const type = activityTypes.find((item) => item.id === data.activityTypeId);

  if (!type) {
    return {
      valid: false,
      message: "Select a valid activity type.",
      path: "activityTypeId",
    };
  }

  const outcome = activityOutcomes.find(
    (item) => item.id === data.activityOutcomeId
  );

  if (!outcome) {
    return {
      valid: false,
      message: "Select a valid outcome.",
      path: "activityOutcomeId",
    };
  }

  if (outcome.activityTypeId !== data.activityTypeId) {
    return {
      valid: false,
      message: `${outcome.name} is not a valid outcome for ${type.name}.`,
      path: "activityOutcomeId",
    };
  }

  const allowedCodes = ACTIVITY_TYPE_OUTCOME_CODES[type.code];

  if (!allowedCodes?.includes(outcome.code)) {
    return {
      valid: false,
      message: `Invalid outcome for ${type.name}.`,
      path: "activityOutcomeId",
    };
  }

  return { valid: true };
}

/**
 * @param {import('@/types/lookups').LookupItem[]} activityTypes
 * @param {import('@/types/lookups').ActivityOutcomeItem[]} activityOutcomes
 */
export function createActivityValidationSchema(activityTypes, activityOutcomes) {
  return createActivitySchema.superRefine((data, ctx) => {
    const result = validateActivityTypeOutcomePair(
      activityTypes,
      activityOutcomes,
      data
    );

    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.message,
        path: [result.path],
      });
    }
  });
}

/** @type {import('zod').infer<typeof createActivitySchema>} */
export const createActivityDefaultValues = {
  activityTypeId: "",
  activityOutcomeId: "",
  direction: DEFAULT_ACTIVITY_DIRECTION,
  remark: "",
  performedByProfileId: "",
  occurredAt: new Date().toISOString(),
  nextFollowUp: {
    dueAt: "",
    assignedToProfileId: "",
    notes: "",
  },
};
