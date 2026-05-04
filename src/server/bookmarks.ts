import type {
    PostSortOption,
    PostsResponse,
} from "@/app/lib/interfaces/post-list";
import type { CEFR, Prisma } from "@prisma/client";
import {
    buildPagination,
    buildPostOrderBy,
    buildPostSearchWhere,
    DEFAULT_POSTS_PAGE_SIZE,
    formatPostListItems,
    getSafePostsPageSize,
    getSkipCount,
} from "@/app/lib/post-list-query";
import { DEFAULT_POST_SORT } from "@/app/lib/post-search";
import { prisma } from "@/server/db/prisma/prisma";

export async function getPaginatedBookmarkedPosts({
    level,
    page = 1,
    pageSize = DEFAULT_POSTS_PAGE_SIZE,
    q,
    sessionUserId,
    sort = DEFAULT_POST_SORT,
    textbookId,
}: {
    level?: CEFR;
    page?: number;
    pageSize?: number;
    q?: string;
    sessionUserId: string;
    sort?: PostSortOption;
    textbookId?: string;
}): Promise<PostsResponse> {
    const safePageSize = getSafePostsPageSize(pageSize);
    const where = buildBookmarkedPostWhere({
        level,
        q,
        sessionUserId,
        textbookId,
    });
    const orderBy = buildPostOrderBy(sort);

    const [totalCount, requestedPagePosts] = await Promise.all([
        prisma.post.count({ where }),
        getBookmarkedPostListRows({
            orderBy,
            sessionUserId,
            skip: getSkipCount(page, safePageSize),
            take: safePageSize,
            where,
        }),
    ]);
    const pagination = buildPagination({
        page,
        pageSize: safePageSize,
        totalCount,
    });
    const posts =
        pagination.currentPage === page
            ? requestedPagePosts
            : await getBookmarkedPostListRows({
                  orderBy,
                  sessionUserId,
                  skip: getSkipCount(pagination.currentPage, safePageSize),
                  take: safePageSize,
                  where,
              });

    return {
        pagination,
        posts: formatPostListItems(posts),
    };
}

function buildBookmarkedPostWhere({
    level,
    q,
    sessionUserId,
    textbookId,
}: {
    level?: CEFR;
    q?: string;
    sessionUserId: string;
    textbookId?: string;
}) {
    const baseWhere = buildPostSearchWhere({
        level,
        q,
        textbookId,
    });

    return {
        ...baseWhere,
        bookmarks: {
            some: {
                userId: sessionUserId,
            },
        },
    } satisfies Prisma.PostWhereInput;
}

async function getBookmarkedPostListRows({
    orderBy,
    sessionUserId,
    skip,
    take,
    where,
}: {
    orderBy: Prisma.PostOrderByWithRelationInput[];
    sessionUserId: string;
    skip: number;
    take: number;
    where: Prisma.PostWhereInput;
}) {
    return prisma.post.findMany({
        orderBy,
        select: {
            _count: {
                select: {
                    bookmarks: true,
                },
            },
            bookmarks: {
                select: {
                    id: true,
                },
                where: {
                    userId: sessionUserId,
                },
            },
            description: true,
            downloadCount: true,
            id: true,
            title: true,
            updatedAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        skip,
        take,
        where,
    });
}
