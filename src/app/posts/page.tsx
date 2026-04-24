import type { PostIndexProps } from "@/app/lib/interfaces/post-page";
import { redirect } from "next/navigation";
import { getPaginatedPosts } from "@/app/api/posts/route";
import { getAllTextbooks } from "@/app/api/textbooks/route";
import { parsePostIndexSearchParams } from "@/app/lib/post-search";
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
    const parsedSearchParams = parsePostIndexSearchParams(resolvedSearchParams);
    const [textbooks, { pagination, posts }] = await Promise.all([
        getAllTextbooks(),
        // URL変更をトリガーにして、サーバーコンポーネントが再実行されることでデータ取得する
        getPaginatedPosts({
            level: parsedSearchParams.filters.level ?? undefined,
            page: parsedSearchParams.page,
            q: parsedSearchParams.filters.q || undefined,
            sessionUserId: session.user.id,
            sort: parsedSearchParams.filters.sort,
            textbookId: parsedSearchParams.filters.textbookId ?? undefined,
        }),
    ]);

    return (
        <PostList
            filters={parsedSearchParams.filters}
            pagination={pagination}
            posts={posts}
            textbooks={textbooks}
        />
    );
}
