import z from "zod";

export const UserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(["user", "admin"]).default("user"),
    image: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    resetOtp: z.string().optional().nullable(),
    resetOtpExpiry: z.date().optional().nullable(),
});

export type UserType = z.infer<typeof UserSchema>;