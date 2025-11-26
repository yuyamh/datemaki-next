import type { User } from "./user";

// 教案（posts）の型指定
export interface Post {
    createdAt: string;
    description?: string;
    downloadCount: number;
    fileName1?: string;
    fileName2?: string;
    fileName3?: string;
    id: string;
    level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    textbookId?: number;
    title: string;
    updatedAt: string;
    user?: User;
    userId: string;
    viewCount: number;
}
