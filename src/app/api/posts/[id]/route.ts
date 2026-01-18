import type { Post as PrismaPost } from "@prisma/client";
import { NextResponse } from "next/server";
import { PostCreateInputSchema } from "@/app/lib/validations/post.schema";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";

// 教案詳細取得
export async function GET({ params }: { params: { id: string } }) {
    try {
        const post: null | PrismaPost = await prisma.post.findUnique({
            where: { id: params.id },
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

// 教案更新処理
export async function PATCH(
    request: Request,
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
                    error: "正しく認証されていません。再認証してもう一度試してください",
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
