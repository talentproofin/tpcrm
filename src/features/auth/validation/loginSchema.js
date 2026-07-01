import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants/validation";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    ),
});

export const loginDefaultValues = {
  email: "",
  password: "",
};
