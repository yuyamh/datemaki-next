import { NextResponse } from "next/server";
import { getPostFileBucketName } from "@/app/lib/post-file";
import { auth } from "@/auth";
import { isUuid } from "@/lib/uuid";
import { prisma } from "@/server/db/prisma/prisma";
import { createSupabaseServerClient } from "@/server/supabase/client";

// 教案に添付されているファイルをダウンロードする
// 署名付きURLを生成して、クライアントをそのURLにリダイレクトさせてダウンロードさせる
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string; slot: string }> },
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id: postId, slot: rawSlot } = await params;

        if (!isUuid(postId)) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const slot = parseFileSlot(rawSlot);

        if (!slot) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }

        const post = await prisma.post.findUnique({
            select: {
                fileName1: true,
                fileName2: true,
                fileName3: true,
                fileOriginalName1: true,
                fileOriginalName2: true,
                fileOriginalName3: true,
                id: true,
            },
            where: {
                id: postId,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "指定された教案が見つかりませんでした。" },
                { status: 404 },
            );
        }

        const filePath =
            slot === 1
                ? post.fileName1
                : slot === 2
                  ? post.fileName2
                  : post.fileName3;
        const originalName =
            slot === 1
                ? post.fileOriginalName1
                : slot === 2
                  ? post.fileOriginalName2
                  : post.fileOriginalName3;

        if (!filePath) {
            return NextResponse.json(
                { error: "対象の添付ファイルが見つかりません。" },
                { status: 404 },
            );
        }

        const supabase = createSupabaseServerClient();
        const { data, error } = await supabase.storage
            .from(getPostFileBucketName())
            .createSignedUrl(filePath, 60, {
                // URLの有効期限を60秒に設定
                download: originalName ?? true, // ダウンロード時のファイル名を指定（オリジナル名があればそれを使用、なければURLを直接開く）
            });

        if (error || !data?.signedUrl) {
            console.error("添付ファイルのダウンロードURL生成失敗:", error);
            return NextResponse.json(
                { error: "添付ファイルのダウンロードに失敗しました。" },
                { status: 500 },
            );
        }

        await prisma.post.update({
            data: {
                downloadCount: {
                    increment: 1,
                },
            },
            where: {
                id: postId,
            },
        });

        // 生成したURLにリダイレクトして、ファイルをダウンロードさせる
        return NextResponse.redirect(data.signedUrl);
    } catch (error) {
        console.error("添付ファイルのダウンロード失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

// ファイルスロットの値をパースする
function parseFileSlot(value: string) {
    return value === "1" || value === "2" || value === "3"
        ? Number(value)
        : null;
}
