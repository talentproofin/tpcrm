import { z } from "zod";
import { USER_STATUS_CODES } from "../constants";

const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));

const userStatusSchema = z.enum([
  USER_STATUS_CODES.ACTIVE,
  USER_STATUS_CODES.INACTIVE,
  USER_STATUS_CODES.SUSPENDED,
  USER_STATUS_CODES.INVITED,
]);

const managerProfileIdSchema = z
  .string()
  .uuid("Select a valid manager.")
  .optional()
  .or(z.literal(""));

export const userCreateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(200, "Full name must be 200 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(320, "Email must be 320 characters or fewer."),
  roleId: z.string().uuid("Select a role."),
  managerProfileId: managerProfileIdSchema,
  phone: optionalText(50, "Phone"),
});

export const userUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(200, "Full name must be 200 characters or fewer."),
  roleId: z.string().uuid("Select a role."),
  managerProfileId: managerProfileIdSchema,
  phone: optionalText(50, "Phone"),
  status: userStatusSchema,
});

/** @type {import('zod').infer<typeof userCreateSchema>} */
export const userCreateDefaultValues = {
  fullName: "",
  email: "",
  roleId: "",
  managerProfileId: "",
  phone: "",
};

/** @type {import('zod').infer<typeof userUpdateSchema>} */
export const userUpdateDefaultValues = {
  fullName: "",
  roleId: "",
  managerProfileId: "",
  phone: "",
  status: USER_STATUS_CODES.ACTIVE,
};

/**
 * @param {import('../types/user').UserStatus} currentStatus
 * @returns {import('../types/user').UserStatus[]}
 */
export function getAllowedStatusTransitions(currentStatus) {
  switch (currentStatus) {
    case USER_STATUS_CODES.INVITED:
      return [
        USER_STATUS_CODES.INVITED,
        USER_STATUS_CODES.ACTIVE,
        USER_STATUS_CODES.INACTIVE,
        USER_STATUS_CODES.SUSPENDED,
      ];
    case USER_STATUS_CODES.ACTIVE:
      return [
        USER_STATUS_CODES.ACTIVE,
        USER_STATUS_CODES.INACTIVE,
        USER_STATUS_CODES.SUSPENDED,
      ];
    case USER_STATUS_CODES.INACTIVE:
    case USER_STATUS_CODES.SUSPENDED:
      return [currentStatus, USER_STATUS_CODES.ACTIVE];
    default:
      return [USER_STATUS_CODES.ACTIVE];
  }
}
