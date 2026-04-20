import type { User } from "./user";

// 教案（posts）の型指定
export interface Post {
    createdAt: Date;
    description: null | string;
    downloadCount: number;
    fileName1: null | string;
    fileName2: null | string;
    fileName3: null | string;
    id: string;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
    textbookId: null | string;
    title: string;
    updatedAt: Date;
    user?: User;
    userId: string;
    viewCount: number;
}
