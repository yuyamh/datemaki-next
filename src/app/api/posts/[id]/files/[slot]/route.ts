import { NextResponse } from "next/server";
import { getPostFileBucketName } from "@/app/lib/post-file";
import { auth } from "@/auth";
import { isUuid } from "@/lib/uuid";
import { prisma } from "@/server/db/prisma/prisma";
import { createSupabaseServerClient } from "@/server/supabase/client";

// 教案に添付されているファイルをダウンロードする
// ファイル本体を返し、ダウンロード時の日本語ファイル名を正しく伝える（日本語のファイル名のエンコード化したURLをそのまま返さないための工夫）
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
            .download(filePath);

        if (error || !data) {
            console.error("添付ファイルの取得失敗:", error);
            return NextResponse.json(
                { error: "添付ファイルのダウンロードに失敗しました。" },
                { status: 500 },
            );
        }

        // 更新日時（updatedAt）に影響ないように、downloadCountのみをインクリメントする
        // prismaの$executeRawを使って、downloadCountのみをインクリメントするクエリを実行する
        await prisma.$executeRaw`
            UPDATE "Post"
            SET "downloadCount" = "downloadCount" + 1
            WHERE "id" = ${postId}::uuid
        `;

        // ファイル名を取得する
        const downloadName =
            originalName ?? filePath.split("/").pop() ?? "attachment";
        // ファイルをバイト列として読み込む
        const fileBuffer = await data.arrayBuffer();

        return new NextResponse(fileBuffer, {
            headers: {
                "Cache-Control": "private, no-store",
                "Content-Disposition":
                    buildAttachmentContentDisposition(downloadName),
                "Content-Length": String(data.size),
                "Content-Type": data.type || "application/octet-stream",
            },
        });
    } catch (error) {
        console.error("添付ファイルのダウンロード失敗:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

// ASCIIだけの安全なファイル名を作る（古いブラウザや一部の環境で日本語ファイル名が正しく扱えない場合のフォールバック用）
// ASCII以外を _ にする
// " と \ を除去
// % ; / を除去
// その他、trimと空白にならないようにする
function buildAsciiFallbackFileName(fileName: string) {
    const fallback = fileName
        .replaceAll(/[^\u0020-\u007E]/g, "_")
        .replaceAll(/["\\]/g, "_")
        .replaceAll(/[%;/]/g, "_")
        .trim();

    return fallback || "attachment";
}

// HTTPレスポンスの Content-Disposition ヘッダー用文字列を作る
// 例：attachment; filename="sample.pdf"; filename*=UTF-8''%E3%83%86%E3%82%B9%E3%83%88.pdf
function buildAttachmentContentDisposition(fileName: string) {
    // ファイル名を安全な形式に変換する
    const sanitizedFileName = sanitizeHeaderFileName(fileName);
    // ASCIIだけの安全なファイル名を作る
    const fallbackFileName = buildAsciiFallbackFileName(sanitizedFileName);
    // UTF-8ファイル名をURLエンコードする
    const encodedFileName = encodeRFC5987ValueChars(sanitizedFileName);

    return `attachment; filename="${fallbackFileName}"; filename*=UTF-8''${encodedFileName}`;
}

// UTF-8ファイル名をURLエンコードする
function encodeRFC5987ValueChars(value: string) {
    return encodeURIComponent(value)
        .replaceAll("'", "%27")
        .replaceAll("(", "%28")
        .replaceAll(")", "%29")
        .replaceAll("*", "%2A");
}

// ファイルスロットの値をパースする
function parseFileSlot(value: string) {
    return value === "1" || value === "2" || value === "3"
        ? Number(value)
        : null;
}

// ファイル名を安全な形式に変換する
// 改行削除
// trim
// 空なら "attachment"
function sanitizeHeaderFileName(fileName: string) {
    const sanitized = fileName.replaceAll(/[\r\n]/g, "").trim();

    return sanitized || "attachment";
}
