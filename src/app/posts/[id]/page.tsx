import type { ShowPostPageProps } from "@/app/lib/interfaces/post-page";
import { notFound, redirect } from "next/navigation";
import { getPostDetail } from "@/app/api/posts/[id]/route";
import {
    getSingleSearchParamValue,
    parsePositiveInteger,
} from "@/app/lib/search-params";
import { PostDetail } from "@/app/ui/post-detail";
import { auth } from "@/auth";
import { isUuid } from "@/lib/uuid";

export default async function ShowPost({
    params,
    searchParams,
}: ShowPostPageProps) {
    // セッション取得
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { id } = await params;
    if (!isUuid(id)) {
        notFound();
    }
    const resolvedSearchParams = await searchParams;
    // 有効化されているタブを判定（教案 or コメント）
    const activeTab =
        getSingleSearchParamValue(resolvedSearchParams.tab) === "comments"
            ? "comments"
            : "content";
    const commentPage =
        parsePositiveInteger(
            getSingleSearchParamValue(resolvedSearchParams.page) ?? null,
        ) ?? 1;
    const post = await getPostDetail({
        commentPage,
        postId: id,
        sessionUserId: session.user.id,
    });

    if (!post) notFound();

    return (
        <PostDetail
            activeTab={activeTab}
            post={post}
            sessionUserId={session.user.id}
        />
    );
}
