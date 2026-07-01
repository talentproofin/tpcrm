import { z } from "zod";

export const lookupFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .max(100, "Code must be 100 characters or fewer.")
    .regex(/^[a-z0-9_]+$/, "Code must use lowercase letters, numbers, or underscores."),
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(200, "Name must be 200 characters or fewer."),
  displayOrder: z.coerce
    .number()
    .int("Display order must be a whole number.")
    .positive("Display order must be greater than zero."),
  activityTypeId: z.string().uuid().optional().or(z.literal("")),
});

/** @type {import('zod').infer<typeof lookupFormSchema>} */
export const lookupFormDefaultValues = {
  code: "",
  name: "",
  displayOrder: 1,
  activityTypeId: "",
};
