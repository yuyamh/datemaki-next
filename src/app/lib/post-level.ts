import type { Post } from "@/app/lib/interfaces/post";

// 教案のレベル選択肢はここを正本として使う
export const POST_LEVEL_OPTIONS = [
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
] as const satisfies readonly Exclude<Post["level"], null>[];

export type PostLevelOption = (typeof POST_LEVEL_OPTIONS)[number];
