import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .optional()
  .or(z.literal(""));

const optionalPhone = z.string().trim().optional().or(z.literal(""));

const optionalWebsite = z
  .string()
  .trim()
  .max(500, "Website must be 500 characters or fewer.")
  .optional()
  .or(z.literal(""));

const optionalDescription = z
  .string()
  .trim()
  .max(5000, "Description must be 5000 characters or fewer.")
  .optional()
  .or(z.literal(""));

const optionalContactName = z
  .string()
  .trim()
  .max(200, "Contact name must be 200 characters or fewer.")
  .optional()
  .or(z.literal(""));

export const createLeadSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(1, "Organization name is required.")
    .max(200, "Organization name must be 200 characters or fewer."),
  website: optionalWebsite,
  phone: optionalPhone,
  leadTypeId: z.string().uuid("Select a valid lead type."),
  primaryContactName: optionalContactName,
  primaryContactPhone: optionalPhone,
  primaryContactEmail: optionalEmail,
  stageId: z.string().uuid("Select a valid stage."),
  leadSourceId: z
    .string()
    .uuid("Select a valid source.")
    .optional()
    .nullable()
    .or(z.literal("")),
  description: optionalDescription,
  ownerProfileId: z.string().uuid("Select a valid owner."),
  assignedToProfileId: z
    .string()
    .uuid("Select a valid assignee.")
    .optional()
    .nullable()
    .or(z.literal("")),
  allowDuplicate: z.boolean().optional().default(false),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  allowDuplicate: z.boolean().optional().default(false),
});

/** @type {import('zod').infer<typeof createLeadSchema>} */
export const createLeadDefaultValues = {
  organizationName: "",
  website: "",
  phone: "",
  leadTypeId: "",
  primaryContactName: "",
  primaryContactPhone: "",
  primaryContactEmail: "",
  stageId: "",
  leadSourceId: "",
  description: "",
  ownerProfileId: "",
  assignedToProfileId: "",
  allowDuplicate: false,
};
