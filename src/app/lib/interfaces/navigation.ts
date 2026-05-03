import type { Role } from "@prisma/client";

export interface NavigationProps {
    currentUser?: NavigationUser | null;
}

export interface NavigationUser {
    avatar: null | string;
    id: string;
    name: string;
    role: Role;
}
