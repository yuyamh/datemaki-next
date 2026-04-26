import type { CommentResponse } from "@/app/lib/interfaces/comment";
import { NextResponse } from "next/server";
import { CommentInputSchema } from "@/app/lib/validations/comment.schema";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";

// コメント投稿処理
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = (await request.json()) as {
            content?: string;
            postId?: string;
        };

        if (!body.postId) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

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

        const post = await prisma.post.findUnique({
            select: {
                id: true,
            },
            where: {
                id: body.postId,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "指定された教案が見つかりませんでした。" },
                { status: 404 },
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content: validationResult.data.content,
                postId: body.postId,
                userId: session.user.id,
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
        });

        const response: CommentResponse = {
            comment,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("コメント投稿失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
