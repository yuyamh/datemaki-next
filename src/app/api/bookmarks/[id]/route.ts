import type { BookmarkResponse } from "@/app/lib/interfaces/bookmark";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";

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
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const post = await prisma.post.findUnique({
            select: {
                id: true,
            },
            where: {
                id: postId,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "指定された教案が見つかりませんでした。" },
                { status: 404 },
            );
        }

        await prisma.bookmark.deleteMany({
            where: {
                postId,
                userId: session.user.id,
            },
        });

        const response: BookmarkResponse = {
            isBookmarked: false,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("ブックマーク削除失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function POST(
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
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const post = await prisma.post.findUnique({
            select: {
                id: true,
            },
            where: {
                id: postId,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "指定された教案が見つかりませんでした。" },
                { status: 404 },
            );
        }

        await prisma.bookmark.upsert({
            create: {
                postId,
                userId: session.user.id,
            },
            update: {},
            where: {
                userId_postId: {
                    postId,
                    userId: session.user.id,
                },
            },
        });

        const response: BookmarkResponse = {
            isBookmarked: true,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("ブックマーク追加失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
