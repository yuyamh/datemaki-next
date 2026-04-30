import { z } from "@/app/lib/zod";

export const ContactInputSchema = z.object({
    message: z.string().min(1).max(5000),
    subject: z.string().min(1).max(120),
});
