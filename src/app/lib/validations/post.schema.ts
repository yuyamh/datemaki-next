// 教案保存時・更新時のスキーマ
import { PostSchema } from "@/server/db/prisma/generated/zod/modelSchema/PostSchema";
import { type z } from "zod";

// 教案保存・更新専用スキーマを作る（pickで派生）
export const PostCreateInputSchema = PostSchema.pick({
    title: true,
    description: true,
    level: true,
    textbookId: true,
});

// 添付ファイルは multipart/form-data で送られるため、route.ts 側で個別に検証する

export type PostCreateInput = z.infer<typeof PostCreateInputSchema>;
