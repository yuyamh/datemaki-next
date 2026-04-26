import type {
    UserProfilePostSortOption,
    UserProfileTab,
} from "@/app/lib/interfaces/user-list";
import type {
    ResolvedShowUserSearchParams,
    ResolvedUserIndexSearchParams,
    UserIndexSearchParamsResult,
    UserListRequestSearchParams,
    UserProfileRequestSearchParams,
    UserProfileSearchParamsResult,
} from "@/app/lib/interfaces/user-search";
import type { CEFR } from "@prisma/client";
import { POST_LEVEL_OPTIONS } from "@/app/lib/post-level";
import {
    getSingleSearchParamValue,
    normalizeSearchText,
    parsePositiveInteger,
} from "@/app/lib/search-params";

const DEFAULT_USERS_PAGE_SIZE = 15;
export const DEFAULT_USER_PROFILE_POST_SORT: UserProfilePostSortOption =
    "updated_desc";
export const DEFAULT_USER_PROFILE_TAB: UserProfileTab = "posts";

// URLのクエリパラメータを安全で扱いやすい形に正規化・変換する
export function parseUserIndexSearchParams(
    searchParams: ResolvedUserIndexSearchParams,
): UserIndexSearchParamsResult {
    const page =
        parsePositiveInteger(
            getSingleSearchParamValue(searchParams.page) ?? null,
        ) ?? 1;
    const q =
        normalizeSearchText(
            getSingleSearchParamValue(searchParams.q) ?? null,
        ) ?? "";

    return {
        filters: {
            q,
        },
        page,
    };
}

export function parseUserListRequestSearchParams(
    searchParams: URLSearchParams,
): UserListRequestSearchParams {
    return {
        page: parsePositiveInteger(searchParams.get("page")) ?? 1,
        pageSize:
            parsePositiveInteger(searchParams.get("pageSize")) ??
            DEFAULT_USERS_PAGE_SIZE,
        q: normalizeSearchText(searchParams.get("q")),
    };
}

export function parseUserProfileRequestSearchParams(
    searchParams: URLSearchParams,
): UserProfileRequestSearchParams {
    return {
        level: parseUserProfilePostLevel(searchParams.get("level")),
        page: parsePositiveInteger(searchParams.get("page")) ?? 1,
        pageSize:
            parsePositiveInteger(searchParams.get("pageSize")) ??
            DEFAULT_USERS_PAGE_SIZE,
        q: normalizeSearchText(searchParams.get("q")),
        sort: parseUserProfilePostSort(searchParams.get("sort")),
        tab: parseUserProfileTab(searchParams.get("tab")),
    };
}

// ユーザ詳細のURLのクエリパラメータを安全で扱いやすい形に正規化・変換する
export function parseUserProfileSearchParams(
    searchParams: ResolvedShowUserSearchParams,
): UserProfileSearchParamsResult {
    const page =
        parsePositiveInteger(
            getSingleSearchParamValue(searchParams.page) ?? null,
        ) ?? 1;
    const q =
        normalizeSearchText(
            getSingleSearchParamValue(searchParams.q) ?? null,
        ) ?? "";
    const level =
        parseUserProfilePostLevel(
            getSingleSearchParamValue(searchParams.level) ?? null,
        ) ?? null;
    const sort = parseUserProfilePostSort(
        getSingleSearchParamValue(searchParams.sort) ?? null,
    );
    const tab = parseUserProfileTab(
        getSingleSearchParamValue(searchParams.tab) ?? null,
    );

    return {
        filters: {
            level,
            q,
            sort,
        },
        page,
        tab,
    };
}

// クエリパラメータの値をCEFRレベルに変換する
// 正しい値でない場合はnullを返す
function parseUserProfilePostLevel(value: null | string) {
    if (!value) {
        return null;
    }

    if (
        POST_LEVEL_OPTIONS.includes(
            value as (typeof POST_LEVEL_OPTIONS)[number],
        )
    ) {
        return value as CEFR;
    }

    return null;
}

function parseUserProfilePostSort(value: null | string) {
    if (value === "updated_asc") {
        return value;
    }

    return DEFAULT_USER_PROFILE_POST_SORT;
}

function parseUserProfileTab(value: null | string) {
    if (value === "details") {
        return value;
    }

    return DEFAULT_USER_PROFILE_TAB;
}
