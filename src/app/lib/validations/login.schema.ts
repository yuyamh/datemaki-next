import { z } from "@/app/lib/zod";

export const loginSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
});
