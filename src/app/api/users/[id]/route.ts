import { NextResponse } from "next/server";
import { parseUserProfileRequestSearchParams } from "@/app/lib/user-search";
import { auth } from "@/auth";
import { isUuid } from "@/lib/uuid";
import { getPublicUserProfile } from "@/server/users";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: userId } = await params;

        if (!isUuid(userId)) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const parsedSearchParams =
            parseUserProfileRequestSearchParams(searchParams);
        const session = await auth();
        const profile = await getPublicUserProfile({
            level: parsedSearchParams.level,
            page: parsedSearchParams.page,
            pageSize: parsedSearchParams.pageSize,
            q: parsedSearchParams.q,
            sort: parsedSearchParams.sort,
            userId,
            viewerUserId: session?.user?.id,
        });

        if (!profile) {
            return NextResponse.json(
                { error: "指定されたユーザーが見つかりませんでした。" },
                { status: 404 },
            );
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("公開プロフィール取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
