import type { PostsResponse } from "@/app/lib/interfaces/post-list";
import { NextResponse } from "next/server";
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
        const requestedPage =
            parsePositiveInteger(searchParams.get("page")) ?? 1;
        const requestedPageSize =
            parsePositiveInteger(searchParams.get("pageSize")) ??
            DEFAULT_POSTS_PAGE_SIZE;
        const data = await getPaginatedPosts({
            page: requestedPage,
            pageSize: requestedPageSize,
            sessionUserId: session.user.id,
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
    page = 1,
    pageSize = DEFAULT_POSTS_PAGE_SIZE,
    sessionUserId,
}: {
    page?: number;
    pageSize?: number;
    sessionUserId: string;
}): Promise<PostsResponse> {
    const safePageSize = Math.min(pageSize, MAX_POSTS_PAGE_SIZE);
    // 教案の総数
    const totalCount = await prisma.post.count();
    // 教案の総ページ数
    const totalPages =
        totalCount === 0 ? 0 : Math.ceil(totalCount / safePageSize);
    // 現在のページ（ページ指定が大きすぎたら最終ページまでに丸める）
    const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    // スキップ数
    const skip = (currentPage - 1) * safePageSize;

    const posts = await prisma.post.findMany({
        orderBy: {
            updatedAt: "desc",
        },
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
        take: safePageSize,
    });

    const postsWithBookmarkState = posts.map(
        ({ _count, bookmarks, ...post }) => ({
            ...post,
            bookmarkCount: _count.bookmarks,
            isBookmarked: bookmarks.length > 0,
        }),
    );

    return {
        pagination: {
            currentPage,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
            pageSize: safePageSize,
            totalCount,
            totalPages,
        },
        posts: postsWithBookmarkState,
    };
}

// 整数に直す
export function parsePositiveInteger(value: null | string) {
    if (!value) {
        return;
    }

    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        return;
    }

    return parsedValue;
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
