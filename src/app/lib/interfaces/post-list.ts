import type { CEFR } from "@prisma/client";

import type { PostListItem } from "./post";
import type { Textbook } from "./textbook";

export interface Pagination {
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// 教案一覧画面のフィルターと並び順の型定義
export interface PostListFilters {
    level: CEFR | null;
    q: string;
    sort: PostSortOption;
    textbookId: null | string;
}

export interface PostListProps {
    basePath: string;
    description: string;
    emptyUnfilteredMessage: string;
    filters: PostListFilters;
    pagination: Pagination;
    posts: PostListItem[];
    textbooks: Textbook[];
    title: string;
}

// 検索ツールバーの型定義
export interface PostSearchToolbarProps {
    filters: PostListFilters;
    textbooks: Textbook[];
}

// 今日案一覧画面の並び順の型
export type PostSortOption =
    | "bookmarks_desc"
    | "downloads_desc"
    | "updated_asc"
    | "updated_desc";

export interface PostsResponse {
    pagination: Pagination;
    posts: PostListItem[];
}
