import type {
    PostSortOption,
    PostsResponse,
} from "@/app/lib/interfaces/post-list";
import type { CEFR, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
    DEFAULT_POST_SORT,
    parsePostListRequestSearchParams,
} from "@/app/lib/post-search";
import { PostCreateInputSchema } from "@/app/lib/validations/post.schema";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";

export const DEFAULT_POSTS_PAGE_SIZE = 15;
const MAX_POSTS_PAGE_SIZE = 30;

export async function GET(request: Request) {
    try {
        // ログインチェック
        const session = await auth();

        if (!session?.user?.id) {
            // 未ログインなら 401 を返す
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const parsedSearchParams =
            parsePostListRequestSearchParams(searchParams);
        const data = await getPaginatedPosts({
            level: parsedSearchParams.level,
            page: parsedSearchParams.page,
            pageSize: parsedSearchParams.pageSize,
            q: parsedSearchParams.q,
            sessionUserId: session.user.id,
            sort: parsedSearchParams.sort,
            textbookId: parsedSearchParams.textbookId,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("教案取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

// ページネーションに合わせた教案の取得
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
    const safePageSize = Math.min(pageSize, MAX_POSTS_PAGE_SIZE);
    const where = buildPostSearchWhere({
        level,
        q,
        textbookId,
    });
    const orderBy = buildPostOrderBy(sort);

    // まず総件数を数えて、ページネーション情報を確定する
    const totalCount = await prisma.post.count({ where });
    const pagination = buildPagination({
        page,
        pageSize: safePageSize,
        totalCount,
    });

    const posts = await getPostListRows({
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

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await request.json();

        const result = PostCreateInputSchema.safeParse(body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return NextResponse.json({ errors }, { status: 422 });
        }

        const { description, level, textbookId, title } = result.data;

        // TODO:ファイル添付を実装したらここを修正
        const fileName1 = null;
        const fileName2 = null;
        const fileName3 = null;

        const post = await prisma.post.create({
            data: {
                title: title,
                description: description,
                fileName1: fileName1,
                fileName2: fileName2,
                fileName3: fileName3,
                level: level ?? null,
                textbookId: textbookId ?? null,
                userId,
            },
        });
        return NextResponse.json({ post });
    } catch (error) {
        console.error("教案登録失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
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

function buildPostOrderBy(sort: PostSortOption) {
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

function buildPostSearchWhere({
    level,
    q,
    textbookId,
}: {
    level?: CEFR;
    q?: string;
    textbookId?: string;
}) {
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

function formatPostListItems(
    posts: Awaited<ReturnType<typeof getPostListRows>>,
) {
    return posts.map(({ _count, bookmarks, ...post }) => ({
        ...post,
        bookmarkCount: _count.bookmarks,
        isBookmarked: bookmarks.length > 0,
    }));
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

function getSkipCount(currentPage: number, pageSize: number) {
    return (currentPage - 1) * pageSize;
}
