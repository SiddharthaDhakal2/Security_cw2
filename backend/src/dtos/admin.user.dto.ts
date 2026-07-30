import { z } from "zod";
import { passwordPolicyMessage } from "../utils/password-policy";

const StrongPasswordSchema = z
  .string()
  .min(8, passwordPolicyMessage)
  .max(25, passwordPolicyMessage)
  .regex(/[a-z]/, passwordPolicyMessage)
  .regex(/[A-Z]/, passwordPolicyMessage)
  .regex(/[0-9]/, passwordPolicyMessage)
  .regex(/[^A-Za-z0-9]/, passwordPolicyMessage);

export const AdminCreateUserDTO = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  name: z.string().min(3, "Username must be at least 3 characters"),
  password: StrongPasswordSchema,
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  image: z.string().optional(),
});

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

export const AdminUpdateUserDTO = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  name: z.string().min(3).optional(),
  password: StrongPasswordSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  image: z.string().optional(),
});

export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;
