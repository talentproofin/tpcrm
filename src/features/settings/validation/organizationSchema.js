import { z } from "zod";
import {
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  TIMEZONE_OPTIONS,
} from "../constants";

const timePattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));

export const organizationSettingsSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(2, "Organization name is required.")
      .max(200, "Organization name must be 200 characters or fewer."),
    address: optionalText(500, "Address"),
    city: optionalText(100, "City"),
    state: optionalText(100, "State"),
    country: optionalText(100, "Country"),
    pincode: optionalText(20, "Pincode"),
    contactEmail: z
      .string()
      .trim()
      .email("Enter a valid contact email.")
      .optional()
      .or(z.literal("")),
    contactPhone: optionalText(30, "Contact phone"),
    website: optionalText(500, "Website"),
    timezone: z.enum(TIMEZONE_OPTIONS, {
      required_error: "Select a timezone.",
    }),
    businessHoursStart: z
      .string()
      .regex(timePattern, "Enter a valid start time (HH:mm)."),
    businessHoursEnd: z
      .string()
      .regex(timePattern, "Enter a valid end time (HH:mm)."),
    defaultFollowupTime: z
      .string()
      .regex(timePattern, "Enter a valid follow-up time (HH:mm)."),
    dateFormat: z.enum(DATE_FORMAT_OPTIONS, {
      required_error: "Select a valid date format.",
    }),
    timeFormat: z.enum(TIME_FORMAT_OPTIONS, {
      required_error: "Select a valid time format.",
    }),
  })
  .superRefine((values, context) => {
    if (values.businessHoursStart >= values.businessHoursEnd) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business hours end must be after start.",
        path: ["businessHoursEnd"],
      });
    }
  });

/** @type {import('zod').infer<typeof organizationSettingsSchema>} */
export const organizationSettingsDefaultValues = {
  organizationName: "TalentProof",
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  timezone: "Asia/Kolkata",
  businessHoursStart: "09:00",
  businessHoursEnd: "18:00",
  defaultFollowupTime: "10:00",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "HH:mm",
};
