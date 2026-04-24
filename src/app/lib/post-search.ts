import type { PostSortOption } from "@/app/lib/interfaces/post-list";
import type {
    PostIndexSearchParamsResult,
    PostListRequestSearchParams,
    ResolvedPostIndexSearchParams,
} from "@/app/lib/interfaces/post-search";
import type { CEFR } from "@prisma/client";
import { POST_LEVEL_OPTIONS } from "@/app/lib/post-level";

export const DEFAULT_POST_SORT: PostSortOption = "updated_desc";
const POST_SORT_OPTIONS = [
    "bookmarks_desc",
    "downloads_desc",
    "updated_asc",
    "updated_desc",
] as const;

// クエリパラメータが配列で渡される可能性があるため、最初の値を取り出す
export function getSingleSearchParamValue(value?: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
}

// 空文字や空白だけの値は、検索条件なしとして扱う
export function normalizeSearchText(value: null | string) {
    if (!value) {
        return;
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
        return;
    }

    return normalizedValue;
}

// 整数の文字列を、1以上の数値へ変換する
export function parsePositiveInteger(value: null | string) {
    if (!value) {
        return;
    }

    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        return;
    }

    return parsedValue;
}

// URLのクエリパラメータを安全で扱いやすい形に正規化・変換する
export function parsePostIndexSearchParams(
    searchParams: ResolvedPostIndexSearchParams,
): PostIndexSearchParamsResult {
    const page =
        parsePositiveInteger(
            getSingleSearchParamValue(searchParams.page) ?? null,
        ) ?? 1;
    const q =
        normalizeSearchText(
            getSingleSearchParamValue(searchParams.q) ?? null,
        ) ?? "";
    const level =
        parsePostLevel(getSingleSearchParamValue(searchParams.level) ?? null) ??
        null;
    const textbookId =
        normalizeSearchText(
            getSingleSearchParamValue(searchParams.textbookId) ?? null,
        ) ?? null;
    const sort =
        parsePostSort(getSingleSearchParamValue(searchParams.sort) ?? null) ??
        DEFAULT_POST_SORT;

    return {
        filters: {
            level,
            q,
            sort,
            textbookId,
        },
        page,
    };
}

export function parsePostLevel(value: null | string) {
    if (!value) {
        return;
    }

    if (
        POST_LEVEL_OPTIONS.includes(
            value as (typeof POST_LEVEL_OPTIONS)[number],
        )
    ) {
        return value as CEFR;
    }
}

export function parsePostListRequestSearchParams(
    searchParams: URLSearchParams,
): PostListRequestSearchParams {
    return {
        level: parsePostLevel(searchParams.get("level")),
        page: parsePositiveInteger(searchParams.get("page")) ?? 1,
        pageSize: parsePositiveInteger(searchParams.get("pageSize")) ?? 15,
        q: normalizeSearchText(searchParams.get("q")),
        sort: parsePostSort(searchParams.get("sort")),
        textbookId: normalizeSearchText(searchParams.get("textbookId")),
    };
}

export function parsePostSort(value: null | string) {
    if (!value) {
        return DEFAULT_POST_SORT;
    }

    if (
        POST_SORT_OPTIONS.includes(value as (typeof POST_SORT_OPTIONS)[number])
    ) {
        return value as PostSortOption;
    }

    return DEFAULT_POST_SORT;
}
