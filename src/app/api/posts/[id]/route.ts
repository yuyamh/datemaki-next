import type { PostDetailData } from "@/app/lib/interfaces/post";
import { NextResponse } from "next/server";
import {
    buildPagination,
    DEFAULT_POSTS_PAGE_SIZE,
    getSkipCount,
} from "@/app/lib/post-list-query";
import {
    getPostFileValidationErrors,
    getPostTextFormValues,
    getPostUploadFiles,
    getRemoveFileFlag,
    removeManagedPostFiles,
    uploadPostFiles,
} from "@/app/lib/post-upload";
import { PostCreateInputSchema } from "@/app/lib/validations/post.schema";
import { auth } from "@/auth";
import { isUuid } from "@/lib/uuid";
import { prisma } from "@/server/db/prisma/prisma";

// 教案削除処理
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: postId } = await params;
        if (!isUuid(postId)) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    error: "正しく認証されていません。再度ログインしてもう一度試してください",
                },
                { status: 401 },
            );
        }
        const userId = session.user.id;

        // 存在 + 所有者チェック
        const existing = await prisma.post.findUnique({
            where: { id: postId },
            select: {
                fileName1: true,
                fileName2: true,
                fileName3: true,
                fileOriginalName1: true,
                fileOriginalName2: true,
                fileOriginalName3: true,
                fileSize1: true,
                fileSize2: true,
                fileSize3: true,
                id: true,
                userId: true,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "対象の教案が見つかりません。" },
                { status: 404 },
            );
        }
        if (existing.userId !== userId) {
            return NextResponse.json(
                { error: "対象の教案の更新権限がありません。" },
                { status: 403 },
            );
        }

        // 物理削除
        await prisma.post.delete({
            where: { id: postId },
        });
        await removeManagedPostFiles([
            existing.fileName1 ?? "",
            existing.fileName2 ?? "",
            existing.fileName3 ?? "",
        ]);

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("教案削除失敗:", error);
        return NextResponse.json({ error: "内部エラー" }, { status: 500 });
    }
}

// 教案詳細取得
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id: postId } = await params;
        if (!isUuid(postId)) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }
        const { searchParams } = new URL(request.url);
        const requestedCommentPage = Number.parseInt(
            searchParams.get("page") ?? "1",
            10,
        );
        const commentPage =
            Number.isNaN(requestedCommentPage) || requestedCommentPage < 1
                ? 1
                : requestedCommentPage;

        const post = await getPostDetail({
            commentPage,
            postId,
            sessionUserId: session.user.id,
        });

        if (!post) {
            return NextResponse.json(
                { error: "指定された教案が見つかりませんでした。" },
                { status: 404 },
            );
        }

        return NextResponse.json({ post });
    } catch (error) {
        console.error("教案詳細取得失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

// 編集画面に必要な最小限の教案データを取得する
export async function getEditablePostById(postId: string) {
    return prisma.post.findUnique({
        select: {
            description: true,
            fileName1: true,
            fileName2: true,
            fileName3: true,
            fileOriginalName1: true,
            fileOriginalName2: true,
            fileOriginalName3: true,
            fileSize1: true,
            fileSize2: true,
            fileSize3: true,
            id: true,
            level: true,
            textbookId: true,
            title: true,
            userId: true,
        },
        where: { id: postId },
    });
}

// 教案の詳細を取得する
export async function getPostDetail({
    commentPage = 1,
    postId,
    sessionUserId,
}: {
    commentPage?: number;
    postId: string;
    sessionUserId: string;
}): Promise<null | PostDetailData> {
    const commentPageSize = DEFAULT_POSTS_PAGE_SIZE;
    const post = await prisma.post.findUnique({
        select: {
            _count: {
                select: {
                    bookmarks: true,
                    comments: true,
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
            createdAt: true,
            comments: {
                orderBy: {
                    createdAt: "asc",
                },
                skip: getSkipCount(commentPage, commentPageSize),
                select: {
                    content: true,
                    createdAt: true,
                    id: true,
                    updatedAt: true,
                    user: {
                        select: {
                            avatar: true,
                            id: true,
                            name: true,
                        },
                    },
                },
                take: commentPageSize,
            },
            description: true,
            downloadCount: true,
            fileName1: true,
            fileName2: true,
            fileName3: true,
            fileOriginalName1: true,
            fileOriginalName2: true,
            fileOriginalName3: true,
            fileSize1: true,
            fileSize2: true,
            fileSize3: true,
            id: true,
            level: true,
            textbook: {
                select: {
                    name: true,
                },
            },
            title: true,
            updatedAt: true,
            user: {
                select: {
                    avatar: true,
                    bio: true,
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
        where: { id: postId },
    });

    if (!post) {
        return null;
    }

    const { _count, bookmarks, ...postData } = post;

    return {
        ...postData,
        attachments: buildPostAttachments(post),
        bookmarkCount: _count.bookmarks,
        commentsPagination: buildPagination({
            page: commentPage,
            pageSize: commentPageSize,
            totalCount: _count.comments,
        }),
        isBookmarked: bookmarks.length > 0,
    };
}

// 教案更新処理
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }, // Next15からparamはPromiseになった
) {
    let uploadedPaths: string[] = [];

    try {
        const { id: postId } = await params;
        if (!isUuid(postId)) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    error: "正しく認証されていません。再度ログインしてもう一度試してください",
                },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        // 対象の教案をDBから取得
        const existing = await prisma.post.findUnique({
            where: { id: postId },
            select: {
                fileName1: true,
                fileName2: true,
                fileName3: true,
                fileOriginalName1: true,
                fileOriginalName2: true,
                fileOriginalName3: true,
                fileSize1: true,
                fileSize2: true,
                fileSize3: true,
                id: true,
                userId: true,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "対象の教案が見つかりません。" },
                { status: 404 },
            );
        }

        if (existing.userId !== userId) {
            return NextResponse.json(
                { error: "対象の教案の更新権限がありません。" },
                { status: 403 },
            );
        }

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
        // 既存ファイルの削除フラグを取得する
        const removeFile1 = getRemoveFileFlag(formData, "removeFile1");
        const removeFile2 = getRemoveFileFlag(formData, "removeFile2");
        const removeFile3 = getRemoveFileFlag(formData, "removeFile3");
        const uploadedFilePaths = await uploadPostFiles({
            files,
            postId,
        });
        uploadedPaths = uploadedFilePaths.uploadedPaths;

        // アップロードされたファイルのパスと削除フラグをもとに、更新後のファイルパスを決定する
        // アップロードされていなければ、削除指定があるか見る。
        // 削除するなら null にする
        // 削除しないなら、既存のファイル名をそのまま使う
        const nextFileName1 =
            uploadedFilePaths.fileName1 ??
            (removeFile1 ? null : existing.fileName1);
        const nextFileName2 =
            uploadedFilePaths.fileName2 ??
            (removeFile2 ? null : existing.fileName2);
        const nextFileName3 =
            uploadedFilePaths.fileName3 ??
            (removeFile3 ? null : existing.fileName3);
        const nextFileOriginalName1 =
            uploadedFilePaths.fileOriginalName1 ??
            (removeFile1 ? null : existing.fileOriginalName1);
        const nextFileOriginalName2 =
            uploadedFilePaths.fileOriginalName2 ??
            (removeFile2 ? null : existing.fileOriginalName2);
        const nextFileOriginalName3 =
            uploadedFilePaths.fileOriginalName3 ??
            (removeFile3 ? null : existing.fileOriginalName3);
        const nextFileSize1 =
            uploadedFilePaths.fileSize1 ??
            (removeFile1 ? null : existing.fileSize1);
        const nextFileSize2 =
            uploadedFilePaths.fileSize2 ??
            (removeFile2 ? null : existing.fileSize2);
        const nextFileSize3 =
            uploadedFilePaths.fileSize3 ??
            (removeFile3 ? null : existing.fileSize3);

        // あとで本当に削除する古いファイル名リストを作る
        const oldPathsToRemove: string[] = [
            // file1 に新しいファイルがアップロードされた
            // かつ、もともと古い file1 が存在していた
            // なら、古い file1 を削除対象にする
            uploadedFilePaths.fileName1 && existing.fileName1
                ? existing.fileName1
                : null,
            uploadedFilePaths.fileName2 && existing.fileName2
                ? existing.fileName2
                : null,
            uploadedFilePaths.fileName3 && existing.fileName3
                ? existing.fileName3
                : null,

            // file1 を削除する指定がある
            // かつ、新しい file1 はアップロードされていない
            // なら、既存の file1 を削除対象にする
            removeFile1 && !uploadedFilePaths.fileName1
                ? existing.fileName1
                : null,
            removeFile2 && !uploadedFilePaths.fileName2
                ? existing.fileName2
                : null,
            removeFile3 && !uploadedFilePaths.fileName3
                ? existing.fileName3
                : null,
        ].filter((path): path is string => typeof path === "string");

        // 更新
        const post = await prisma.post.update({
            where: { id: postId },
            data: {
                title,
                description,
                fileName1: nextFileName1,
                fileName2: nextFileName2,
                fileName3: nextFileName3,
                fileOriginalName1: nextFileOriginalName1,
                fileOriginalName2: nextFileOriginalName2,
                fileOriginalName3: nextFileOriginalName3,
                fileSize1: nextFileSize1,
                fileSize2: nextFileSize2,
                fileSize3: nextFileSize3,
                level: level ?? null,
                textbookId: textbookId ?? null,
            },
        });

        // 古いファイルの削除
        await removeManagedPostFiles(oldPathsToRemove);

        return NextResponse.json({ post });
    } catch (error) {
        // アップロードに失敗した場合は、すでにアップロードしたファイル（今回更新したファイル）を削除してからエラーを返す
        await removeManagedPostFiles(uploadedPaths);
        console.error("教案更新失敗:", error);
        return NextResponse.json({ error: "内部エラー" }, { status: 500 });
    }
}

// 教案の添付ファイルを扱いやすい形に構築する
function buildPostAttachmentItem({
    originalName,
    path,
    size,
    slot,
}: {
    originalName: null | string;
    path: null | string;
    size: null | number;
    slot: 1 | 2 | 3;
}) {
    if (!path) {
        return null;
    }

    return {
        originalName: originalName ?? path.split("/").pop() ?? "添付ファイル",
        path,
        size,
        slot,
    };
}

// 教案に添付されているファイルを、配列に構築して返却する
function buildPostAttachments(post: {
    fileName1: null | string;
    fileName2: null | string;
    fileName3: null | string;
    fileOriginalName1: null | string;
    fileOriginalName2: null | string;
    fileOriginalName3: null | string;
    fileSize1: null | number;
    fileSize2: null | number;
    fileSize3: null | number;
}) {
    return [
        buildPostAttachmentItem({
            originalName: post.fileOriginalName1,
            path: post.fileName1,
            size: post.fileSize1,
            slot: 1,
        }),
        buildPostAttachmentItem({
            originalName: post.fileOriginalName2,
            path: post.fileName2,
            size: post.fileSize2,
            slot: 2,
        }),
        buildPostAttachmentItem({
            originalName: post.fileOriginalName3,
            path: post.fileName3,
            size: post.fileSize3,
            slot: 3,
        }),
    ].filter(
        (attachment): attachment is NonNullable<typeof attachment> =>
            attachment !== null,
    );
}
