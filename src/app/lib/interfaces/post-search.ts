import type { CEFR } from "@prisma/client";

import type { PostListFilters, PostSortOption } from "./post-list";
import type { PostIndexProps } from "./post-page";

// 教案一覧画面のクエリパラメータの型定義
export interface PostIndexSearchParamsResult {
    filters: PostListFilters;
    page: number;
}

export interface PostListRequestSearchParams {
    level?: CEFR;
    page: number;
    pageSize: number;
    q?: string;
    sort: PostSortOption;
    textbookId?: string;
}

// PostIndexProps の中にある searchParams を取り出して、さらに await した後の型にする
export type ResolvedPostIndexSearchParams = Awaited<
    PostIndexProps["searchParams"]
>;
