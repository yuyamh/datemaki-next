import { NextResponse } from "next/server";
import { parseUserListRequestSearchParams } from "@/app/lib/user-search";
import { getPaginatedUsers } from "@/server/users";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const parsedSearchParams =
            parseUserListRequestSearchParams(searchParams);
        const data = await getPaginatedUsers({
            page: parsedSearchParams.page,
            pageSize: parsedSearchParams.pageSize,
            q: parsedSearchParams.q,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("ユーザー一覧取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
