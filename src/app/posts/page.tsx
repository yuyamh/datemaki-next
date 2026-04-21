import type { PostIndexProps } from "@/app/lib/interfaces/post-page";
import { redirect } from "next/navigation";
import { getPaginatedPosts, parsePositiveInteger } from "@/app/api/posts/route";
import PostList from "@/app/ui/post-list";
import { auth } from "@/auth";

export default async function PostIndex({ searchParams }: PostIndexProps) {
    // セッション取得
    const session = await auth();

    // 未ログインならログインページへ
    if (!session?.user?.id) {
        redirect("/login");
    }

    const resolvedSearchParams = await searchParams;
    // 文字列のこともあれば、配列のこともあるので、安全に1つ取り出す
    const pageParam = Array.isArray(resolvedSearchParams.page)
        ? resolvedSearchParams.page[0]
        : resolvedSearchParams.page;
    const page = parsePositiveInteger(pageParam ?? null) ?? 1;
    const { pagination, posts } = await getPaginatedPosts({
        page,
        sessionUserId: session.user.id,
    });

    return <PostList pagination={pagination} posts={posts} />;
}
