import type { PostListItem } from "@/app/lib/interfaces/post";
import type { PostSortOption } from "@/app/lib/interfaces/post-list";
import type { CEFR, Prisma } from "@prisma/client";

export const DEFAULT_POSTS_PAGE_SIZE = 15;
const MAX_POSTS_PAGE_SIZE = 30;

export interface PostListPaginationInput {
    page: number;
    pageSize: number;
    totalCount: number;
}

export interface PostListQueryFilters {
    level?: CEFR;
    q?: string;
    textbookId?: string;
}

export interface PostListRow {
    _count: {
        bookmarks: number;
    };
    bookmarks: Array<{
        id: string;
    }>;
    description: null | string;
    downloadCount: number;
    id: string;
    title: string;
    updatedAt: Date;
    user: {
        id: string;
        name: string;
    };
}

export function buildPagination({
    page,
    pageSize,
    totalCount,
}: PostListPaginationInput) {
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
    const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    return {
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        pageSize,
        totalCount,
        totalPages,
    };
}

export function buildPostOrderBy(sort: PostSortOption) {
    switch (sort) {
        case "bookmarks_desc": {
            return [
                { bookmarks: { _count: "desc" } },
                { updatedAt: "desc" },
                { id: "desc" },
            ] satisfies Prisma.PostOrderByWithRelationInput[];
        }

        case "downloads_desc": {
            return [
                { downloadCount: "desc" },
                { updatedAt: "desc" },
                { id: "desc" },
            ] satisfies Prisma.PostOrderByWithRelationInput[];
        }

        case "updated_asc": {
            return [
                { updatedAt: "asc" },
                { id: "desc" },
            ] satisfies Prisma.PostOrderByWithRelationInput[];
        }

        default: {
            return [
                { updatedAt: "desc" },
                { id: "desc" },
            ] satisfies Prisma.PostOrderByWithRelationInput[];
        }
    }
}

export function buildPostSearchWhere({
    level,
    q,
    textbookId,
}: PostListQueryFilters) {
    const where: Prisma.PostWhereInput = {};

    if (q) {
        where.OR = [
            {
                title: {
                    contains: q,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: q,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (level) {
        where.level = level;
    }

    if (textbookId) {
        where.textbookId = textbookId;
    }

    return where;
}

export function formatPostListItems(posts: PostListRow[]): PostListItem[] {
    return posts.map(({ _count, bookmarks, ...post }) => ({
        ...post,
        bookmarkCount: _count.bookmarks,
        isBookmarked: bookmarks.length > 0,
    }));
}

export function getSafePostsPageSize(pageSize: number) {
    return Math.min(pageSize, MAX_POSTS_PAGE_SIZE);
}

export function getSkipCount(currentPage: number, pageSize: number) {
    return (currentPage - 1) * pageSize;
}
