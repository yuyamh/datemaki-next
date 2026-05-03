import { NextResponse } from "next/server";
import { getAllTextbooks } from "@/server/textbooks";

// 使用テキストの全件取得
export async function GET() {
    try {
        const textbooks = await getAllTextbooks();
        return NextResponse.json({ textbooks });
    } catch (error) {
        console.error("使用テキスト全件取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
