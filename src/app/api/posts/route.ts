import { NextResponse } from "next/server";
import { parsePostListRequestSearchParams } from "@/app/lib/post-search";
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
import { getPaginatedPosts } from "@/server/posts";

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
