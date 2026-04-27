import type {
    PostSortOption,
    PostsResponse,
} from "@/app/lib/interfaces/post-list";
import type { CEFR, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
    buildPagination,
    buildPostOrderBy,
    buildPostSearchWhere,
    DEFAULT_POSTS_PAGE_SIZE,
    formatPostListItems,
    getSafePostsPageSize,
    getSkipCount,
} from "@/app/lib/post-list-query";
import {
    DEFAULT_POST_SORT,
    parsePostListRequestSearchParams,
} from "@/app/lib/post-search";
import {
    getPostFileValidationErrors,
    getPostTextFormValues,
    getPostUploadFiles,
    removeManagedPostFiles,
    uploadPostFiles,
} from "@/app/lib/post-upload";
import { PostCreateInputSchema } from "@/app/lib/validations/post.schema";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";

export async function GET(request: Request) {
    try {
        // ログインチェック
        const session = await auth();

        if (!session?.user?.id) {
            // 未ログインなら 401 を返す
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const parsedSearchParams =
            parsePostListRequestSearchParams(searchParams);
        const data = await getPaginatedPosts({
            level: parsedSearchParams.level,
            page: parsedSearchParams.page,
            pageSize: parsedSearchParams.pageSize,
            q: parsedSearchParams.q,
            sessionUserId: session.user.id,
            sort: parsedSearchParams.sort,
            textbookId: parsedSearchParams.textbookId,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("教案取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

// ページネーションに合わせた教案の取得
export async function getPaginatedPosts({
    level,
    page = 1,
    pageSize = DEFAULT_POSTS_PAGE_SIZE,
    q,
    sessionUserId,
    sort = DEFAULT_POST_SORT,
    textbookId,
}: {
    level?: CEFR;
    page?: number;
    pageSize?: number;
    q?: string;
    sessionUserId: string;
    sort?: PostSortOption;
    textbookId?: string;
}): Promise<PostsResponse> {
    const safePageSize = getSafePostsPageSize(pageSize);
    const where = buildPostSearchWhere({
        level,
        q,
        textbookId,
    });
    const orderBy = buildPostOrderBy(sort);

    // まず総件数を数えて、ページネーション情報を確定する
    const totalCount = await prisma.post.count({ where });
    const pagination = buildPagination({
        page,
        pageSize: safePageSize,
        totalCount,
    });

    const posts = await getPostListRows({
        orderBy,
        sessionUserId,
        skip: getSkipCount(pagination.currentPage, safePageSize),
        take: safePageSize,
        where,
    });

    return {
        pagination,
        posts: formatPostListItems(posts),
    };
}

export async function POST(request: Request) {
    let uploadedPaths: string[] = [];

    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const userId = session.user.id;
        const formData = await request.formData();
        const textValues = getPostTextFormValues(formData);
        const files = getPostUploadFiles(formData);

        if (!textValues || !files) {
            return NextResponse.json(
                { error: "不正なリクエストです。" },
                { status: 400 },
            );
        }

        const result = PostCreateInputSchema.safeParse({
            description: textValues.description,
            level: textValues.level || null,
            textbookId: textValues.textbookId || null,
            title: textValues.title,
        });

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return NextResponse.json({ errors }, { status: 422 });
        }

        const fileErrors = getPostFileValidationErrors(files);

        if (Object.keys(fileErrors).length > 0) {
            return NextResponse.json({ errors: fileErrors }, { status: 422 });
        }

        const { description, level, textbookId, title } = result.data;
        const postId = crypto.randomUUID();

        // ファイルをアップロードしてパスを取得する
        const uploadedFilePaths = await uploadPostFiles({
            files,
            postId,
        });
        uploadedPaths = uploadedFilePaths.uploadedPaths;

        const post = await prisma.post.create({
            data: {
                description,
                fileName1: uploadedFilePaths.fileName1,
                fileName2: uploadedFilePaths.fileName2,
                fileName3: uploadedFilePaths.fileName3,
                fileOriginalName1: uploadedFilePaths.fileOriginalName1,
                fileOriginalName2: uploadedFilePaths.fileOriginalName2,
                fileOriginalName3: uploadedFilePaths.fileOriginalName3,
                fileSize1: uploadedFilePaths.fileSize1,
                fileSize2: uploadedFilePaths.fileSize2,
                fileSize3: uploadedFilePaths.fileSize3,
                id: postId,
                level: level ?? null,
                textbookId: textbookId ?? null,
                title,
                userId,
            },
        });
        return NextResponse.json({ post });
    } catch (error) {
        // アップロードに失敗した場合は、すでにアップロードしたファイルを削除してからエラーを返す
        await removeManagedPostFiles(uploadedPaths);
        console.error("教案登録失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

async function getPostListRows({
    orderBy,
    sessionUserId,
    skip,
    take,
    where,
}: {
    orderBy: Prisma.PostOrderByWithRelationInput[];
    sessionUserId: string;
    skip: number;
    take: number;
    where: Prisma.PostWhereInput;
}) {
    return prisma.post.findMany({
        orderBy,
        select: {
            _count: {
                select: {
                    bookmarks: true,
                },
            },
            bookmarks: {
                select: {
                    id: true,
                },
                where: {
                    userId: sessionUserId,
                },
            },
            description: true,
            downloadCount: true,
            id: true,
            title: true,
            updatedAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        skip,
        take,
        where,
    });
}
