import { NextResponse } from "next/server";
import { PostCreateInputSchema } from "@/app/lib/validations/post.schema";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // ログインチェック
        const session = await auth();

        if (!session?.user) {
            // 未ログインなら 401 を返す
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }
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
