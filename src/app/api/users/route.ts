import type { UsersResponse } from "@/app/lib/interfaces/user-list";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { parseUserListRequestSearchParams } from "@/app/lib/user-search";
import { prisma } from "@/server/db/prisma/prisma";

export const DEFAULT_USERS_PAGE_SIZE = 15;
const MAX_USERS_PAGE_SIZE = 30;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const parsedSearchParams =
            parseUserListRequestSearchParams(searchParams);
        const data = await getPaginatedUsers({
            page: parsedSearchParams.page,
            pageSize: parsedSearchParams.pageSize,
            q: parsedSearchParams.q,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("ユーザー一覧取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

// 一般ユーザ一覧を、ページネーションに合わせて取得する
export async function getPaginatedUsers({
    page = 1,
    pageSize = DEFAULT_USERS_PAGE_SIZE,
    q,
}: {
    page?: number;
    pageSize?: number;
    q?: string;
}): Promise<UsersResponse> {
    const safePageSize = Math.min(pageSize, MAX_USERS_PAGE_SIZE);
    // 検索条件を作成
    const where = buildPublicUserWhere(q);
    const totalCount = await prisma.user.count({ where });
    const pagination = buildPagination({
        page,
        pageSize: safePageSize,
        totalCount,
    });
    const users = await prisma.user.findMany({
        orderBy: [{ updatedAt: "desc" }],
        select: {
            _count: {
                select: {
                    Posts: true,
                },
            },
            avatar: true,
            bio: true,
            id: true,
            name: true,
        },
        skip: getSkipCount(pagination.currentPage, safePageSize),
        take: safePageSize,
        where,
    });

    return {
        pagination,
        users: users.map(({ _count, ...user }) => ({
            ...user,
            postCount: _count.Posts,
        })),
    };
}

// ページネーションを構築する
function buildPagination({
    page,
    pageSize,
    totalCount,
}: {
    page: number;
    pageSize: number;
    totalCount: number;
}) {
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
    const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    return {
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        pageSize,
        totalCount,
        totalPages,
    };
}

// ユーザーを検索する条件を作成する（where句）

function buildPublicUserWhere(q?: string): Prisma.UserWhereInput {
    // Prisma.UserWhereInput: DB検索するときの条件オブジェクト
    return {
        name: q
            ? {
                  contains: q,
                  mode: "insensitive", // 大文字小文字無視
              }
            : undefined, // Prismaは undefined を無視するので、名前条件なし（全件対象）
        role: "user",
    };
}

// ページネーションのためのスキップ数を計算する
function getSkipCount(currentPage: number, pageSize: number) {
    return (currentPage - 1) * pageSize;
}
