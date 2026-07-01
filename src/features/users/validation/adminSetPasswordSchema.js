import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/constants/validation";

const passwordField = z
  .string()
  .min(1, "Password is required.")
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  );

export const adminSetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm the password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const adminSetPasswordDefaultValues = {
  password: "",
  confirmPassword: "",
};
