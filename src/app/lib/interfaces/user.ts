import type { Role } from "@prisma/client";

import type { Post } from "./post";

// ユーザー（users）の型指定
export interface User {
    avatar: null | string;
    bio: null | string;
    createdAt: Date;
    email: string;
    hashedPassword: string;
    id: string;
    name: string;
    posts?: Post[];
    role: Role;
    updatedAt: Date;
}
