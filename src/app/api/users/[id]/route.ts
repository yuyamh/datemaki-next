import type { PublicUserProfileData } from "@/app/lib/interfaces/user-list";
import type { CEFR, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
    DEFAULT_USER_PROFILE_POST_SORT,
    parseUserProfileRequestSearchParams,
} from "@/app/lib/user-search";
import { prisma } from "@/server/db/prisma/prisma";

const MAX_PROFILE_POSTS_PAGE_SIZE = 30;
const PROFILE_POSTS_PAGE_SIZE = 15;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const parsedSearchParams =
            parseUserProfileRequestSearchParams(searchParams);
        const profile = await getPublicUserProfile({
            level: parsedSearchParams.level,
            page: parsedSearchParams.page,
            pageSize: parsedSearchParams.pageSize,
            q: parsedSearchParams.q,
            sort: parsedSearchParams.sort,
            userId,
        });

        if (!profile) {
            return NextResponse.json(
                { error: "指定されたユーザーが見つかりませんでした。" },
                { status: 404 },
            );
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("公開プロフィール取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

// 一般ユーザの情報と、その人の教案一覧を取得する
export async function getPublicUserProfile({
    level,
    page = 1,
    pageSize = PROFILE_POSTS_PAGE_SIZE,
    q,
    sort = DEFAULT_USER_PROFILE_POST_SORT,
    userId,
}: {
    level?: CEFR | null;
    page?: number;
    pageSize?: number;
    q?: string;
    sort?: "updated_asc" | "updated_desc";
    userId: string;
}): Promise<null | PublicUserProfileData> {
    const user = await prisma.user.findFirst({
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
        where: {
            id: userId,
            role: "user",
        },
    });

    if (!user) {
        return null;
    }

    const safePageSize = Math.min(pageSize, MAX_PROFILE_POSTS_PAGE_SIZE);
    const postWhere = buildUserPostWhere({
        level,
        q,
        userId,
    });
    const totalFilteredPostCount = await prisma.post.count({
        where: postWhere,
    });
    const pagination = buildPagination({
        page,
        pageSize: safePageSize,
        totalCount: totalFilteredPostCount,
    });
    const [posts, totalBookmarkCount, downloadAggregate] = await Promise.all([
        prisma.post.findMany({
            orderBy: buildUserPostOrderBy(sort),
            select: {
                _count: {
                    select: {
                        bookmarks: true,
                    },
                },
                description: true,
                downloadCount: true,
                id: true,
                level: true,
                title: true,
                updatedAt: true,
            },
            skip: getSkipCount(pagination.currentPage, safePageSize),
            take: safePageSize,
            where: postWhere,
        }),
        prisma.bookmark.count({
            where: {
                post: {
                    userId,
                },
            },
        }),
        prisma.post.aggregate({
            // aggregate = 集計
            _sum: {
                downloadCount: true,
            },
            where: {
                userId,
            },
        }),
    ]);

    return {
        pagination,
        posts: posts.map(({ _count, ...post }) => ({
            ...post,
            authorName: user.name,
            bookmarkCount: _count.bookmarks,
        })),
        stats: {
            // 集計結果
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

function buildUserPostOrderBy(sort: "updated_asc" | "updated_desc") {
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

// ユーザの教案一覧を取得する際のwhere句を組み立てる
// 検索条件
// - CEFRレベル
// - キーワード（タイトル or 概要）
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
        // Prisma.PostWhereInput: DB検索するときの条件オブジェクト
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

function getSkipCount(currentPage: number, pageSize: number) {
    return (currentPage - 1) * pageSize;
}
