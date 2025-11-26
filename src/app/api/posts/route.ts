import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const postSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    level: z.string().nullable().optional(),
    textbookId: z.string().nullable().optional(),
    // TODO: fileName1〜3 を後でここに追加
});

const prisma = new PrismaClient();

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                user: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        return NextResponse.json({ posts });
    } catch (error) {
        console.error("教案取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const { description, level, textbookId, title } = postSchema.parse(
            await request.json(),
        );

        // TODO:ファイル添付を実装したらここを修正
        const fileName1 = null;
        const fileName2 = null;
        const fileName3 = null;
        // TODO: ログイン認証を実装したらここを修正
        // const userId = session.user.id;
        const userId = "0d4c9cc2-6725-41d4-af11-fba4dbec2d1b";
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
