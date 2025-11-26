import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    try {
        const post = await prisma.post.findUnique({
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
