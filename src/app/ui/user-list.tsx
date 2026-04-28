import type { UserListProps } from "@/app/lib/interfaces/user-list";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { UserCard } from "./user-card";
import { UserSearchToolbar } from "./user-search-toolbar";

export default function UserList({
    filters,
    pagination,
    users,
}: UserListProps) {
    const hasActiveFilters = Boolean(filters.q);

    return (
        <div className="flex flex-1 flex-col space-y-8">
            <div className="space-y-3">
                <h1 className="text-4xl font-bold text-slate-950">先生一覧</h1>
                <p className="text-md text-slate-500">
                    だてまきに登録している日本語教師（ユーザー）を検索できます
                </p>
            </div>

            <UserSearchToolbar filters={filters} />

            {users.length === 0 ? (
                <div className="px-6 py-16 text-center text-slate-500">
                    {hasActiveFilters
                        ? "条件に一致するユーザーが見つかりませんでした。"
                        : "まだ登録ユーザーがいません。"}
                </div>
            ) : (
                <div className="flex flex-1 flex-col justify-between gap-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {users.map((user) => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-4">
                        <p className="text-sm text-gray-500">
                            {pagination.totalCount}件中{" "}
                            {(pagination.currentPage - 1) *
                                pagination.pageSize +
                                1}
                            {" - "}
                            {Math.min(
                                pagination.currentPage * pagination.pageSize,
                                pagination.totalCount,
                            )}
                            件を表示
                        </p>

                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        aria-disabled={
                                            !pagination.hasPreviousPage
                                        }
                                        className={
                                            pagination.hasPreviousPage
                                                ? undefined
                                                : "pointer-events-none opacity-50"
                                        }
                                        href={getUsersPageUrl({
                                            filters,
                                            page: pagination.hasPreviousPage
                                                ? pagination.currentPage - 1
                                                : pagination.currentPage,
                                        })}
                                        tabIndex={
                                            pagination.hasPreviousPage
                                                ? undefined
                                                : -1
                                        }
                                        text="前へ"
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <span className="px-3 text-sm text-gray-500">
                                        {pagination.currentPage} /{" "}
                                        {Math.max(pagination.totalPages, 1)}
                                    </span>
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationNext
                                        aria-disabled={!pagination.hasNextPage}
                                        className={
                                            pagination.hasNextPage
                                                ? undefined
                                                : "pointer-events-none opacity-50"
                                        }
                                        href={getUsersPageUrl({
                                            filters,
                                            page: pagination.hasNextPage
                                                ? pagination.currentPage + 1
                                                : pagination.currentPage,
                                        })}
                                        tabIndex={
                                            pagination.hasNextPage
                                                ? undefined
                                                : -1
                                        }
                                        text="次へ"
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}
        </div>
    );
}

// ユーザ一覧ページのURLを生成する
function getUsersPageUrl({
    filters,
    page,
}: {
    filters: UserListProps["filters"];
    page: number;
}) {
    const searchParams = new URLSearchParams();

    if (page > 1) {
        searchParams.set("page", page.toString());
    }

    if (filters.q) {
        searchParams.set("q", filters.q);
    }

    const queryString = searchParams.toString();

    return queryString ? `/users?${queryString}` : "/users";
}
