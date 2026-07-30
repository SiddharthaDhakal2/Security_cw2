import { z } from "zod";
import { passwordPolicyMessage } from "@/lib/passwordPolicy";

const strongPasswordSchema = z
  .string()
  .min(8, passwordPolicyMessage)
  .max(25, passwordPolicyMessage)
  .regex(/[a-z]/, passwordPolicyMessage)
  .regex(/[A-Z]/, passwordPolicyMessage)
  .regex(/[0-9]/, passwordPolicyMessage)
  .regex(/[^A-Za-z0-9]/, passwordPolicyMessage);

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: strongPasswordSchema,
    confirmPassword: strongPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;
