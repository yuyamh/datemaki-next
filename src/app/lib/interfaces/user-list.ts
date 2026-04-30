import type { CEFR } from "@prisma/client";

import type { Pagination } from "./post-list";

export interface PublicUserListItem {
    avatar: null | string;
    bio: null | string;
    id: string;
    name: string;
    postCount: number;
}

export interface PublicUserPostListItem {
    authorName: string;
    bookmarkCount: number;
    commentCount: number;
    description: null | string;
    downloadCount: number;
    id: string;
    level: CEFR | null;
    title: string;
    updatedAt: Date | string;
}

export interface PublicUserProfileData {
    pagination: Pagination;
    posts: PublicUserPostListItem[];
    stats: PublicUserProfileStats;
    user: PublicUserProfileSummary;
}

export interface PublicUserProfileStats {
    totalBookmarkCount: number;
    totalDownloadCount: number;
}

export interface PublicUserProfileSummary {
    avatar: null | string;
    bio: null | string;
    createdAt: Date | string;
    id: string;
    name: string;
    postCount: number;
}

export interface UserListFilters {
    q: string;
}

export interface UserListProps {
    filters: UserListFilters;
    pagination: Pagination;
    users: PublicUserListItem[];
}

export interface UserProfileDetailProps {
    activeTab: UserProfileTab;
    canEditProfile: boolean;
    canShowProfileEditAction: boolean;
    filters: UserProfilePostFilters;
    profile: PublicUserProfileData;
}

export interface UserProfilePostFilters {
    level: CEFR | null;
    q: string;
    sort: UserProfilePostSortOption;
}

export type UserProfilePostSortOption = "updated_asc" | "updated_desc";

export interface UserProfilePostsToolbarProps {
    filters: UserProfilePostFilters;
}

// ユーザ詳細のタブの種類
export type UserProfileTab = "details" | "posts";

export interface UserSearchToolbarProps {
    filters: UserListFilters;
}

export interface UsersResponse {
    pagination: Pagination;
    users: PublicUserListItem[];
}
