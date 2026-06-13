import { z } from "zod";

/**
 * Client-side validation schemas for the auth + account forms, used with
 * react-hook-form's zodResolver. These mirror the server-side checks in the
 * actions (which remain the source of truth); having them here gives instant,
 * per-field feedback before a round-trip.
 */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().max(120, "Name is too long"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const resetRequestSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ResetRequestValues = z.infer<typeof resetRequestSchema>;

export const resetPerformSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});
export type ResetPerformValues = z.infer<typeof resetPerformSchema>;

export const twoFaSchema = z.object({
  code: z.string().trim().min(6, "Enter the 6-digit code").max(12),
});
export type TwoFaValues = z.infer<typeof twoFaSchema>;

export const profileSchema = z.object({
  name: z.string().trim().max(120, "Name is too long"),
});
export type ProfileValues = z.infer<typeof profileSchema>;
