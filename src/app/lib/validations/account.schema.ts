import { z } from "@/app/lib/zod";

// アカウント削除APIの入力バリデーション
export const AccountDeleteInputSchema = z.object({
    password: z.string().min(8),
});

export const AccountPasswordChangeInputSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
});
