import type { Post } from "./post";

// ユーザー（users）の型指定
export interface User {
    avatar?: string;
    bio?: string;
    createdAt: string;
    email: string;
    hashedPassword: string;
    id: string;
    name: string;
    posts?: Post[];
    role: "admin" | "guest" | "user";
    updatedAt: string;
    user?: User;
}
