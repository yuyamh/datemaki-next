"use client";

import type { UserProfilePostsToolbarProps } from "@/app/lib/interfaces/user-list";
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

const ALL_OPTION_VALUE = "all";
const SORT_OPTIONS = [
    {
        label: "新しい順",
        value: "updated_desc",
    },
    {
        label: "古い順",
        value: "updated_asc",
    },
] as const;

export function UserProfilePostsToolbar({
    filters,
}: UserProfilePostsToolbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [keyword, setKeyword] = useState(filters.q);
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setKeyword(filters.q);
    }, [filters.q]);

    const replaceSearchParams = (updates: Record<string, null | string>) => {
        const nextSearchParams = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
            if (!value || value.trim().length === 0) {
                nextSearchParams.delete(key);
                continue;
            }

            nextSearchParams.set(key, value.trim());
        }

        nextSearchParams.delete("page");
        nextSearchParams.set("tab", "posts");

        const queryString = nextSearchParams.toString();
        const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

        startTransition(() => {
            router.replace(nextUrl, { scroll: false });
        });
    };

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

    const handleLevelChange = (value: string) => {
        replaceSearchParams({
            level: value === ALL_OPTION_VALUE ? null : value,
        });
    };

    const handleSortChange = (value: string) => {
        replaceSearchParams({ sort: value });
    };

    if (!isMounted) {
        return <UserProfilePostsToolbarSkeleton />;
    }

    return (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1fr)_220px_220px]">
            <form
                className="relative h-12 w-full min-w-0"
                onSubmit={handleKeywordSubmit}
            >
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                    className="h-full w-full rounded-xl border-slate-200 px-3 py-1 pl-12 text-base"
                    disabled={isPending}
                    onChange={handleKeywordChange}
                    placeholder="教案を検索..."
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
                    <SelectTrigger className="!h-12 w-full rounded-xl border-slate-200 px-3 py-1 text-base">
                        <SelectValue placeholder="すべてのレベル" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_OPTION_VALUE}>
                            すべてのレベル
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
                    onValueChange={handleSortChange}
                    value={filters.sort}
                >
                    <SelectTrigger className="!h-12 w-full rounded-xl border-slate-200 px-3 py-1 text-base">
                        <SelectValue placeholder="新しい順" />
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

function UserProfilePostsToolbarSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1fr)_220px_220px]"
        >
            <Skeleton className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
            <Skeleton className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
            <Skeleton className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
        </div>
    );
}
