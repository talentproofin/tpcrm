import { z } from "zod";

const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .optional()
  .or(z.literal(""));

const optionalPhone = z.string().trim().optional().or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .optional()
  .or(z.literal(""));

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(200, "Full name must be 200 characters or fewer."),
  designation: optionalText(200, "Designation"),
  department: optionalText(200, "Department"),
  mobileNumber: optionalPhone,
  alternateNumber: optionalPhone,
  email: optionalEmail,
  linkedinProfileUrl: optionalUrl,
  notes: optionalText(5000, "Notes"),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

/** @type {import('zod').infer<typeof contactSchema>} */
export const contactDefaultValues = {
  fullName: "",
  designation: "",
  department: "",
  mobileNumber: "",
  alternateNumber: "",
  email: "",
  linkedinProfileUrl: "",
  notes: "",
  isPrimary: false,
  isActive: true,
};
