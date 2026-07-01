import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants/validation";

const passwordField = z
  .string()
  .min(1, "Password is required.")
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
  });

export const changePasswordDefaultValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
