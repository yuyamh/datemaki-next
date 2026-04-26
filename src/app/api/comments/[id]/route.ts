import type { CommentResponse } from "@/app/lib/interfaces/comment";
import { NextResponse } from "next/server";
import { CommentInputSchema } from "@/app/lib/validations/comment.schema";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: commentId } = await params;

        if (!commentId) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const existingComment = await prisma.comment.findUnique({
            select: {
                id: true,
                userId: true,
            },
            where: {
                id: commentId,
            },
        });

        if (!existingComment) {
            return NextResponse.json(
                { error: "指定されたコメントが見つかりませんでした。" },
                { status: 404 },
            );
        }

        if (existingComment.userId !== session.user.id) {
            return NextResponse.json(
                { error: "コメントの削除権限がありません。" },
                { status: 403 },
            );
        }

        await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("コメント削除失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: commentId } = await params;

        if (!commentId) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = (await request.json()) as {
            content?: string;
        };
        const validationResult = CommentInputSchema.safeParse({
            content: body.content ?? "",
        });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 422 },
            );
        }

        const existingComment = await prisma.comment.findUnique({
            select: {
                id: true,
                userId: true,
            },
            where: {
                id: commentId,
            },
        });

        if (!existingComment) {
            return NextResponse.json(
                { error: "指定されたコメントが見つかりませんでした。" },
                { status: 404 },
            );
        }

        if (existingComment.userId !== session.user.id) {
            return NextResponse.json(
                { error: "コメントの更新権限がありません。" },
                { status: 403 },
            );
        }

        const comment = await prisma.comment.update({
            data: {
                content: validationResult.data.content,
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
            where: {
                id: commentId,
            },
        });

        const response: CommentResponse = {
            comment,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("コメント更新失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
