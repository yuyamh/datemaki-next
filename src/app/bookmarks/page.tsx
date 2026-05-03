import type { PostIndexProps } from "@/app/lib/interfaces/post-page";
import { redirect } from "next/navigation";
import { parsePostIndexSearchParams } from "@/app/lib/post-search";
import PostList from "@/app/ui/post-list";
import { auth } from "@/auth";
import { getPaginatedBookmarkedPosts } from "@/server/bookmarks";
import { getAllTextbooks } from "@/server/textbooks";

export default async function BookmarkIndex({ searchParams }: PostIndexProps) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const resolvedSearchParams = await searchParams;
    const parsedSearchParams = parsePostIndexSearchParams(resolvedSearchParams);
    const [textbooks, { pagination, posts }] = await Promise.all([
        getAllTextbooks(),
        getPaginatedBookmarkedPosts({
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
            basePath="/bookmarks"
            description="ブックマークした教案を検索・閲覧できます"
            emptyUnfilteredMessage="まだブックマークした教案はありません。"
            filters={parsedSearchParams.filters}
            pagination={pagination}
            posts={posts}
            textbooks={textbooks}
            title="ブックマーク一覧"
        />
    );
}
