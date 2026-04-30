"use client";

import type {
    PostSearchToolbarProps,
    PostSortOption,
} from "@/app/lib/interfaces/post-list";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { POST_LEVEL_OPTIONS } from "@/app/lib/post-level";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

// 全件（未フィルタ）を表すためのダミー値
const ALL_OPTION_VALUE = "all";
// 並び順の選択肢とラベル
const SORT_OPTIONS: { label: string; value: PostSortOption }[] = [
    {
        label: "新着順",
        value: "updated_desc",
    },
    {
        label: "古い順",
        value: "updated_asc",
    },
    {
        label: "ブックマーク順",
        value: "bookmarks_desc",
    },
    {
        label: "ダウンロード順",
        value: "downloads_desc",
    },
];

export function PostSearchToolbar({
    filters,
    textbooks,
}: PostSearchToolbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [keyword, setKeyword] = useState(filters.q);
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition(); // 重い更新を後回しにするためのフック

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setKeyword(filters.q);
    }, [filters.q]);

    // URLのクエリパラメータを更新して、画面遷移せずにURLだけ書き換える
    const replaceSearchParams = (updates: Record<string, null | string>) => {
        // パラメータの更新内容をもとに、新しいURLSearchParamsを作成する
        const nextSearchParams = createNextSearchParams({
            currentSearchParams: searchParams,
            updates,
        });

        // 新しいURLSearchParamsからURLを生成する
        const nextUrl = buildPostSearchUrl({
            pathname,
            searchParams: nextSearchParams,
        });

        // データ再取得とURL変更がそこそこ重い処理のため、優先順位を下げる（ユーザの入力が優先）
        startTransition(() => {
            router.replace(nextUrl, { scroll: false }); // スクロール位置を維持したままURLを置き換える
        });
    };

    // 検索条件が変わるたびに、URLのクエリパラメータを更新する
    const handleKeywordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        replaceSearchParams({ q: keyword.trim() || null });
    };

    // キーワード入力のたびに、URLのクエリパラメータを更新する
    // ただし、空文字はURLから消すようにする
    const handleKeywordChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const nextKeyword = event.target.value;

        setKeyword(nextKeyword);

        if (nextKeyword.trim().length === 0 && searchParams.has("q")) {
            replaceSearchParams({ q: null });
        }
    };

    // フィルターや並び順の選択肢が変わるたびに、URLのクエリパラメータを更新する
    const handleLevelChange = (value: string) => {
        replaceSearchParams({
            level: toNullableSelectValue(value),
        });
    };

    // 並び順の選択肢が変わるたびに、URLのクエリパラメータを更新する
    const handleSortChange = (value: string) => {
        replaceSearchParams({
            sort: value,
        });
    };

    // 使用テキストの選択肢が変わるたびに、URLのクエリパラメータを更新する
    const handleTextbookChange = (value: string) => {
        replaceSearchParams({
            textbookId: toNullableSelectValue(value),
        });
    };

    // スタイルの共通化
    const searchControlClasses =
        "h-full w-full rounded-xl border-slate-200 px-3 py-1 text-base";
    const searchSelectTriggerClasses =
        "!h-12 w-full rounded-xl border-slate-200 px-3 py-1 text-base";

    if (!isMounted) {
        return <PostSearchToolbarSkeleton />;
    }

    return (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(280px,1fr)_160px_200px_160px] xl:grid-cols-[minmax(320px,1fr)_220px_220px_220px] 2xl:grid-cols-[minmax(0,1fr)_260px_260px_260px]">
            <form
                className="relative h-12 w-full min-w-0"
                onSubmit={handleKeywordSubmit}
            >
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                    className={`${searchControlClasses} pl-12`}
                    disabled={isPending}
                    onChange={handleKeywordChange}
                    placeholder="キーワードで検索..."
                    type="search"
                    value={keyword}
                />
            </form>

            <div className="h-12 w-full">
                <Select
                    disabled={isPending}
                    onValueChange={handleLevelChange}
                    value={filters.level ?? ALL_OPTION_VALUE}
                >
                    <SelectTrigger className={searchSelectTriggerClasses}>
                        <SelectValue placeholder="レベルで絞り込み" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_OPTION_VALUE}>
                            レベルで絞り込み
                        </SelectItem>
                        {POST_LEVEL_OPTIONS.map((level) => (
                            <SelectItem key={level} value={level}>
                                {level}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="h-12 w-full">
                <Select
                    disabled={isPending}
                    onValueChange={handleTextbookChange}
                    value={filters.textbookId ?? ALL_OPTION_VALUE}
                >
                    <SelectTrigger className={searchSelectTriggerClasses}>
                        <SelectValue placeholder="使用テキスト" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_OPTION_VALUE}>
                            使用テキスト
                        </SelectItem>
                        {textbooks.map((textbook) => (
                            <SelectItem key={textbook.id} value={textbook.id}>
                                {textbook.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="h-12 w-full">
                <Select
                    disabled={isPending}
                    onValueChange={handleSortChange}
                    value={filters.sort}
                >
                    <SelectTrigger className={searchSelectTriggerClasses}>
                        <SelectValue placeholder="並び替え" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

// フィルター条件とページ番号から、教案一覧ページのURLを生成する
function buildPostSearchUrl({
    pathname,
    searchParams,
}: {
    pathname: string;
    searchParams: URLSearchParams;
}) {
    const queryString = searchParams.toString();

    return queryString ? `${pathname}?${queryString}` : pathname;
}

// 今のURLSearchParamsをコピーして、一部だけ上書き・削除する
function createNextSearchParams({
    currentSearchParams,
    updates,
}: {
    currentSearchParams: ReturnType<typeof useSearchParams>;
    updates: Record<string, null | string>;
}) {
    // 現在のURLSearchParamsをコピー
    const nextSearchParams = new URLSearchParams(
        currentSearchParams.toString(),
    );

    // updatesの内容を順番に適用
    // updatesには、変更したい項目だけ入っている
    for (const [key, value] of Object.entries(updates)) {
        setOrDeleteSearchParam({
            key,
            searchParams: nextSearchParams,
            value,
        });
    }

    // 検索条件が変わったら、一覧は1ページ目に戻す
    nextSearchParams.delete("page");

    return nextSearchParams;
}

function PostSearchToolbarSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(280px,1fr)_160px_200px_160px] xl:grid-cols-[minmax(320px,1fr)_220px_220px_220px] 2xl:grid-cols-[minmax(0,1fr)_260px_260px_260px]"
        >
            <Skeleton className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
            <Skeleton className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
            <Skeleton className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
            <Skeleton className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
        </div>
    );
}

// クエリパラメータの値が null か空文字列なら、そのクエリパラメータをURLSearchParamsから削除する
// そうでなければ、URLSearchParamsにセットする
function setOrDeleteSearchParam({
    key,
    searchParams,
    value,
}: {
    key: string;
    searchParams: URLSearchParams;
    value: null | string;
}) {
    // 値が null か空文字列なら、そのクエリパラメータを削除する
    if (!value || value.trim().length === 0) {
        searchParams.delete(key);
        return;
    }

    searchParams.set(key, value.trim());
}

// 未選択（空文字）をnullにして、URLから消せるようにする
function toNullableSelectValue(value: string) {
    return value === ALL_OPTION_VALUE ? null : value;
}
