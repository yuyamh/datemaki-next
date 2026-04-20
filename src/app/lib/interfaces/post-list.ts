import type { Post } from "./post";

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
    posts: Post[];
}

export interface PostsResponse {
    pagination: Pagination;
    posts: Post[];
}

export interface SearchParamsLike {
    toString(): string;
}
