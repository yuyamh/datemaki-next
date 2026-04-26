import { z } from "@/app/lib/zod";

export const CommentInputSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "コメントを入力してください。")
        .max(1000, "コメントは1000文字以内で入力してください。"),
});
