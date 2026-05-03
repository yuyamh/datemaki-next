import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getNavigationUserByUserId } from "@/server/users";

export async function GET() {
    try {
        const session = await auth();
        const currentUser = session?.user?.id
            ? await getNavigationUserByUserId(session.user.id)
            : null;

        return buildNavigationUserResponse(currentUser);
    } catch (error) {
        console.error("ナビゲーションユーザー取得失敗:", error);
        return buildNavigationUserResponse(null);
    }
}

function buildNavigationUserResponse(
    currentUser: Awaited<ReturnType<typeof getNavigationUserByUserId>>,
) {
    return NextResponse.json(
        { currentUser },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        },
    );
}
