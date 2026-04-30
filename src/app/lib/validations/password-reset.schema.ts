import { z } from "@/app/lib/zod";

export const PasswordResetRequestInputSchema = z.object({
    email: z.email(),
});

export const PasswordResetConfirmInputSchema = z.object({
    password: z.string().min(8),
    token: z.string().min(1),
});
