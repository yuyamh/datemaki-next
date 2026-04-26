import type { CEFR } from "@prisma/client";

import type {
    UserListFilters,
    UserProfilePostFilters,
    UserProfilePostSortOption,
    UserProfileTab,
} from "./user-list";
import type { ShowUserPageProps, UserIndexPageProps } from "./user-page";

export type ResolvedShowUserSearchParams = Awaited<
    ShowUserPageProps["searchParams"]
>;

export type ResolvedUserIndexSearchParams = Awaited<
    UserIndexPageProps["searchParams"]
>;

export interface UserIndexSearchParamsResult {
    filters: UserListFilters;
    page: number;
}

export interface UserListRequestSearchParams {
    page: number;
    pageSize: number;
    q?: string;
}

export interface UserProfileRequestSearchParams {
    level: CEFR | null;
    page: number;
    pageSize: number;
    q?: string;
    sort: UserProfilePostSortOption;
    tab: UserProfileTab;
}

export interface UserProfileSearchParamsResult {
    filters: UserProfilePostFilters;
    page: number;
    tab: UserProfileTab;
}
