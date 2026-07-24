import z from "zod";

export const UserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z
        .string()
        .min(8)
        .regex(/[a-z]/)
        .regex(/[A-Z]/)
        .regex(/[0-9]/)
        .regex(/[^A-Za-z0-9]/),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(["user", "admin"]).default("user"),
    image: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    resetOtp: z.string().optional().nullable(),
    resetOtpExpiry: z.date().optional().nullable(),
    mfaEnabled: z.boolean().default(false),
    mfaOtp: z.string().optional().nullable(),
    mfaOtpExpiry: z.date().optional().nullable(),
    failedLoginAttempts: z.number().default(0),
    lockedUntil: z.date().optional().nullable(),
    lastFailedLoginAt: z.date().optional().nullable(),
});

export type UserType = z.infer<typeof UserSchema>;
