import type { PostListItem } from "./post";

export interface Pagination {
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PostListProps {
    pagination: Pagination;
    posts: PostListItem[];
}

export interface PostsResponse {
    pagination: Pagination;
    posts: PostListItem[];
}
