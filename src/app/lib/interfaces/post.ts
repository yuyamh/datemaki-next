import type { Role } from "@prisma/client";

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
    userId: string;
    viewCount: number;
}

export interface PostAuthorSummary {
    avatar: null | string;
    bio: null | string;
    id: string;
    name: string;
    role: Role;
}

export interface PostDetailData {
    bookmarkCount: number;
    createdAt: Date | string;
    description: null | string;
    downloadCount: number;
    id: string;
    isBookmarked: boolean;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
    textbook: null | PostTextbookSummary;
    title: string;
    updatedAt: Date | string;
    user: PostAuthorSummary;
    viewCount: number;
}

export interface PostListItem {
    bookmarkCount: number;
    description: null | string;
    downloadCount: number;
    id: string;
    isBookmarked: boolean;
    title: string;
    updatedAt: Date | string;
    user: PostListUser;
}

export interface PostListUser {
    id: string;
    name: string;
}

export interface PostTextbookSummary {
    name: string;
}
