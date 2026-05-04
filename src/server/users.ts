import type { NavigationUser } from "@/app/lib/interfaces/navigation";
import type { ProfileFormValues } from "@/app/lib/interfaces/profile-form";
import type {
    PublicUserProfileData,
    UserProfilePostSortOption,
    UsersResponse,
} from "@/app/lib/interfaces/user-list";
import type { CEFR, Prisma } from "@prisma/client";
import { DEFAULT_USER_PROFILE_POST_SORT } from "@/app/lib/user-search";
import { prisma } from "@/server/db/prisma/prisma";

export const DEFAULT_USERS_PAGE_SIZE = 15;
const MAX_USERS_PAGE_SIZE = 30;
const MAX_PROFILE_POSTS_PAGE_SIZE = 30;
const PROFILE_POSTS_PAGE_SIZE = 15;

export async function getNavigationUserByUserId(
    userId: string,
): Promise<NavigationUser | null> {
    const user = await prisma.user.findUnique({
        select: {
            avatar: true,
            id: true,
            name: true,
            role: true,
        },
        where: {
            id: userId,
        },
    });

    if (!user) {
        return null;
    }

    return user;
}

export async function getPaginatedUsers({
    page = 1,
    pageSize = DEFAULT_USERS_PAGE_SIZE,
    q,
}: {
    page?: number;
    pageSize?: number;
    q?: string;
}): Promise<UsersResponse> {
    const safePageSize = Math.min(pageSize, MAX_USERS_PAGE_SIZE);
    const where = buildPublicUserWhere(q);
    const [totalCount, requestedPageUsers] = await Promise.all([
        prisma.user.count({ where }),
        getPublicUserListRows({
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
    const users =
        pagination.currentPage === page
            ? requestedPageUsers
            : await getPublicUserListRows({
                  skip: getSkipCount(pagination.currentPage, safePageSize),
                  take: safePageSize,
                  where,
              });

    return {
        pagination,
        users: users.map(({ _count, ...user }) => ({
            ...user,
            postCount: _count.Posts,
        })),
    };
}

export async function getProfileByUserId(
    userId: string,
): Promise<null | ProfileFormValues> {
    const user = await prisma.user.findUnique({
        select: {
            avatar: true,
            bio: true,
            email: true,
            id: true,
            name: true,
        },
        where: {
            id: userId,
        },
    });

    if (!user) {
        return null;
    }

    return user;
}

export async function getPublicUserProfile({
    includePosts = true,
    level,
    page = 1,
    pageSize = PROFILE_POSTS_PAGE_SIZE,
    q,
    sort = DEFAULT_USER_PROFILE_POST_SORT,
    userId,
    viewerUserId,
}: {
    includePosts?: boolean;
    level?: CEFR | null;
    page?: number;
    pageSize?: number;
    q?: string;
    sort?: UserProfilePostSortOption;
    userId: string;
    viewerUserId?: string;
}): Promise<null | PublicUserProfileData> {
    const userWhere: Prisma.UserWhereInput =
        viewerUserId === userId
            ? {
                  id: userId,
              }
            : {
                  id: userId,
                  role: "user",
              };
    const [user, totalBookmarkCount, downloadAggregate] = await Promise.all([
        prisma.user.findFirst({
            select: {
                _count: {
                    select: {
                        Posts: true,
                    },
                },
                avatar: true,
                bio: true,
                createdAt: true,
                id: true,
                name: true,
            },
            where: userWhere,
        }),
        prisma.bookmark.count({
            where: {
                post: {
                    userId,
                },
            },
        }),
        prisma.post.aggregate({
            _sum: {
                downloadCount: true,
            },
            where: {
                userId,
            },
        }),
    ]);

    if (!user) {
        return null;
    }

    const safePageSize = Math.min(pageSize, MAX_PROFILE_POSTS_PAGE_SIZE);
    const { pagination, posts } = includePosts
        ? await getPublicUserProfilePosts({
              level,
              page,
              pageSize: safePageSize,
              q,
              sort,
              userId,
          })
        : {
              pagination: buildPagination({
                  page: 1,
                  pageSize: safePageSize,
                  totalCount: user._count.Posts,
              }),
              posts: [],
          };

    return {
        pagination,
        posts: posts.map(({ _count, ...post }) => ({
            ...post,
            authorName: user.name,
            bookmarkCount: _count.bookmarks,
            commentCount: _count.comments,
        })),
        stats: {
            totalBookmarkCount,
            totalDownloadCount: downloadAggregate._sum.downloadCount ?? 0,
        },
        user: {
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
            id: user.id,
            name: user.name,
            postCount: user._count.Posts,
        },
    };
}

function buildPagination({
    page,
    pageSize,
    totalCount,
}: {
    page: number;
    pageSize: number;
    totalCount: number;
}) {
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

function buildPublicUserWhere(q?: string): Prisma.UserWhereInput {
    return {
        name: q
            ? {
                  contains: q,
                  mode: "insensitive",
              }
            : undefined,
        role: "user",
    };
}

function buildUserPostOrderBy(sort: UserProfilePostSortOption) {
    switch (sort) {
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

function buildUserPostWhere({
    level,
    q,
    userId,
}: {
    level?: CEFR | null;
    q?: string;
    userId: string;
}) {
    const where: Prisma.PostWhereInput = {
        userId,
    };

    if (level) {
        where.level = level;
    }

    if (q) {
        where.OR = [
            {
                description: {
                    contains: q,
                    mode: "insensitive",
                },
            },
            {
                title: {
                    contains: q,
                    mode: "insensitive",
                },
            },
        ];
    }

    return where;
}

function getPublicUserListRows({
    skip,
    take,
    where,
}: {
    skip: number;
    take: number;
    where: Prisma.UserWhereInput;
}) {
    return prisma.user.findMany({
        orderBy: [{ updatedAt: "desc" }],
        select: {
            _count: {
                select: {
                    Posts: true,
                },
            },
            avatar: true,
            bio: true,
            id: true,
            name: true,
        },
        skip,
        take,
        where,
    });
}

function getPublicUserProfilePostRows({
    page,
    pageSize,
    postWhere,
    sort,
}: {
    page: number;
    pageSize: number;
    postWhere: Prisma.PostWhereInput;
    sort: UserProfilePostSortOption;
}) {
    return prisma.post.findMany({
        orderBy: buildUserPostOrderBy(sort),
        select: {
            _count: {
                select: {
                    bookmarks: true,
                    comments: true,
                },
            },
            description: true,
            downloadCount: true,
            id: true,
            level: true,
            title: true,
            updatedAt: true,
        },
        skip: getSkipCount(page, pageSize),
        take: pageSize,
        where: postWhere,
    });
}

async function getPublicUserProfilePosts({
    level,
    page,
    pageSize,
    q,
    sort,
    userId,
}: {
    level?: CEFR | null;
    page: number;
    pageSize: number;
    q?: string;
    sort: UserProfilePostSortOption;
    userId: string;
}) {
    const postWhere = buildUserPostWhere({
        level,
        q,
        userId,
    });
    const [totalFilteredPostCount, requestedPagePosts] = await Promise.all([
        prisma.post.count({
            where: postWhere,
        }),
        getPublicUserProfilePostRows({
            page,
            pageSize,
            postWhere,
            sort,
        }),
    ]);
    const pagination = buildPagination({
        page,
        pageSize,
        totalCount: totalFilteredPostCount,
    });
    const posts =
        pagination.currentPage === page
            ? requestedPagePosts
            : await getPublicUserProfilePostRows({
                  page: pagination.currentPage,
                  pageSize,
                  postWhere,
                  sort,
              });

    return {
        pagination,
        posts,
    };
}

function getSkipCount(currentPage: number, pageSize: number) {
    return (currentPage - 1) * pageSize;
}
