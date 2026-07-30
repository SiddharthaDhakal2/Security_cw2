import { z } from "zod";
import { UserSchema } from "../types/user.type";
import { passwordPolicyMessage } from "../utils/password-policy";

const StrongPasswordSchema = z
  .string()
  .min(8, passwordPolicyMessage)
  .max(25, passwordPolicyMessage)
  .regex(/[a-z]/, passwordPolicyMessage)
  .regex(/[A-Z]/, passwordPolicyMessage)
  .regex(/[0-9]/, passwordPolicyMessage)
  .regex(/[^A-Za-z0-9]/, passwordPolicyMessage);

export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  name: true,
  password: true,
})
  .extend({
    password: StrongPasswordSchema,
    confirmPassword: StrongPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const MfaVerifyDTO = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export type MfaVerifyDTO = z.infer<typeof MfaVerifyDTO>;

export const MfaPreferenceDTO = z.object({
  enabled: z.boolean(),
  currentPassword: z.string().min(1, "Current password is required"),
});

export type MfaPreferenceDTO = z.infer<typeof MfaPreferenceDTO>;
