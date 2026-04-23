import { z } from "@/app/lib/zod";

export const ProfileUpdateInputSchema = z.object({
    bio: z.string(),
    name: z.string().trim().min(1, "名前を入力してください。"),
});
