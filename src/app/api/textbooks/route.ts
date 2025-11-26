import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 使用テキストの全件取得
export async function GET() {
    try {
        const textbooks = await prisma.textbook.findMany();
        return NextResponse.json({ textbooks });
    } catch (error) {
        console.error("使用テキスト全件取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
