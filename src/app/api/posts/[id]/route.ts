import type { PostDetailData } from "@/app/lib/interfaces/post";
import { NextResponse } from "next/server";
import { PostCreateInputSchema } from "@/app/lib/validations/post.schema";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";

// 教案削除処理
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: postId } = await params;
        if (!postId) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    error: "正しく認証されていません。再度ログインしてもう一度試してください",
                },
                { status: 401 },
            );
        }
        const userId = session.user.id;

        // 存在 + 所有者チェック
        const existing = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true, userId: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "対象の教案が見つかりません。" },
                { status: 404 },
            );
        }
        if (existing.userId !== userId) {
            return NextResponse.json(
                { error: "対象の教案の更新権限がありません。" },
                { status: 403 },
            );
        }

        // 物理削除
        await prisma.post.delete({
            where: { id: postId },
        });

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("教案削除失敗:", error);
        return NextResponse.json({ error: "内部エラー" }, { status: 500 });
    }
}

// 教案詳細取得
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id: postId } = await params;
        if (!postId) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const post = await getPostDetail({
            postId,
            sessionUserId: session.user.id,
        });

        if (!post) {
            return NextResponse.json(
                { error: "指定された教案が見つかりませんでした。" },
                { status: 404 },
            );
        }

        return NextResponse.json({ post });
    } catch (error) {
        console.error("教案詳細取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function getPostDetail({
    postId,
    sessionUserId,
}: {
    postId: string;
    sessionUserId: string;
}): Promise<null | PostDetailData> {
    const post = await prisma.post.findUnique({
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
            createdAt: true,
            comments: {
                orderBy: {
                    createdAt: "asc",
                },
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
            },
            description: true,
            downloadCount: true,
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
            viewCount: true,
        },
        where: { id: postId },
    });

    if (!post) {
        return null;
    }

    const { _count, bookmarks, ...postData } = post;

    return {
        ...postData,
        bookmarkCount: _count.bookmarks,
        isBookmarked: bookmarks.length > 0,
    };
}

// 教案更新処理
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }, // Next15からparamはPromiseになった
) {
    try {
        const { id: postId } = await params;
        if (!postId) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    error: "正しく認証されていません。再度ログインしてもう一度試してください",
                },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        // 対象の教案をDBから取得
        const existing = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true, userId: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "対象の教案が見つかりません。" },
                { status: 404 },
            );
        }

        if (existing.userId !== userId) {
            return NextResponse.json(
                { error: "対象の教案の更新権限がありません。" },
                { status: 403 },
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await request.json();

        // zodで検証
        const result = PostCreateInputSchema.safeParse(body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return NextResponse.json({ errors }, { status: 422 });
        }

        const { description, level, textbookId, title } = result.data;

        // 更新
        const post = await prisma.post.update({
            where: { id: postId },
            data: {
                title,
                description,
                level: level ?? null,
                textbookId: textbookId ?? null,
            },
        });

        return NextResponse.json({ post });
    } catch (error) {
        console.error("教案更新失敗:", error);
        return NextResponse.json({ error: "内部エラー" }, { status: 500 });
    }
}
