import type { PostDetailData } from "@/app/lib/interfaces/post";
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

export async function getEditablePostById(postId: string) {
    return prisma.post.findUnique({
        select: {
            description: true,
            fileName1: true,
            fileName2: true,
            fileName3: true,
            fileOriginalName1: true,
            fileOriginalName2: true,
            fileOriginalName3: true,
            fileSize1: true,
            fileSize2: true,
            fileSize3: true,
            id: true,
            level: true,
            textbookId: true,
            title: true,
            userId: true,
        },
        where: { id: postId },
    });
}

export async function getPaginatedPosts({
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
    const where = buildPostSearchWhere({
        level,
        q,
        textbookId,
    });
    const orderBy = buildPostOrderBy(sort);

    const [totalCount, requestedPagePosts] = await Promise.all([
        prisma.post.count({ where }),
        getPostListRows({
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
            : await getPostListRows({
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

export async function getPostDetail({
    commentPage = 1,
    postId,
    sessionUserId,
}: {
    commentPage?: number;
    postId: string;
    sessionUserId: string;
}): Promise<null | PostDetailData> {
    const commentPageSize = DEFAULT_POSTS_PAGE_SIZE;
    const post = await prisma.post.findUnique({
        select: {
            _count: {
                select: {
                    bookmarks: true,
                    comments: true,
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
            createdAt: true,
            comments: {
                orderBy: {
                    createdAt: "asc",
                },
                skip: getSkipCount(commentPage, commentPageSize),
                select: {
                    content: true,
                    createdAt: true,
                    id: true,
                    updatedAt: true,
                    user: {
                        select: {
                            avatar: true,
                            id: true,
                            name: true,
                        },
                    },
                },
                take: commentPageSize,
            },
            description: true,
            downloadCount: true,
            fileName1: true,
            fileName2: true,
            fileName3: true,
            fileOriginalName1: true,
            fileOriginalName2: true,
            fileOriginalName3: true,
            fileSize1: true,
            fileSize2: true,
            fileSize3: true,
            id: true,
            level: true,
            textbook: {
                select: {
                    name: true,
                },
            },
            title: true,
            updatedAt: true,
            user: {
                select: {
                    avatar: true,
                    bio: true,
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
        where: { id: postId },
    });

    if (!post) {
        return null;
    }

    const { _count, bookmarks, ...postData } = post;

    return {
        ...postData,
        attachments: buildPostAttachments(post),
        bookmarkCount: _count.bookmarks,
        commentsPagination: buildPagination({
            page: commentPage,
            pageSize: commentPageSize,
            totalCount: _count.comments,
        }),
        isBookmarked: bookmarks.length > 0,
    };
}

function buildPostAttachmentItem({
    originalName,
    path,
    size,
    slot,
}: {
    originalName: null | string;
    path: null | string;
    size: null | number;
    slot: 1 | 2 | 3;
}) {
    if (!path) {
        return null;
    }

    return {
        originalName: originalName ?? path.split("/").pop() ?? "添付ファイル",
        path,
        size,
        slot,
    };
}

function buildPostAttachments(post: {
    fileName1: null | string;
    fileName2: null | string;
    fileName3: null | string;
    fileOriginalName1: null | string;
    fileOriginalName2: null | string;
    fileOriginalName3: null | string;
    fileSize1: null | number;
    fileSize2: null | number;
    fileSize3: null | number;
}) {
    return [
        buildPostAttachmentItem({
            originalName: post.fileOriginalName1,
            path: post.fileName1,
            size: post.fileSize1,
            slot: 1,
        }),
        buildPostAttachmentItem({
            originalName: post.fileOriginalName2,
            path: post.fileName2,
            size: post.fileSize2,
            slot: 2,
        }),
        buildPostAttachmentItem({
            originalName: post.fileOriginalName3,
            path: post.fileName3,
            size: post.fileSize3,
            slot: 3,
        }),
    ].filter(
        (attachment): attachment is NonNullable<typeof attachment> =>
            attachment !== null,
    );
}

async function getPostListRows({
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
