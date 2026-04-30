import { NextResponse } from "next/server";
import { removeManagedPostFiles } from "@/app/lib/post-upload";
import { AccountDeleteInputSchema } from "@/app/lib/validations/account.schema";
import { auth } from "@/auth";
import { getAvatarBucketName, isManagedAvatarPath } from "@/lib/avatar";
import { prisma } from "@/server/db/prisma/prisma";
import { createSupabaseServerClient } from "@/server/supabase/client";
import bcrypt from "bcryptjs";

// アカウント削除API
// パスワードを検証してからアカウントを削除する
export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await request.json().catch(() => null);
        const result = AccountDeleteInputSchema.safeParse(body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return NextResponse.json({ errors }, { status: 422 });
        }

        const currentUser = await prisma.user.findUnique({
            select: {
                Posts: {
                    select: {
                        fileName1: true,
                        fileName2: true,
                        fileName3: true,
                    },
                },
                avatar: true,
                hashedPassword: true,
                id: true,
                role: true,
            },
            where: {
                id: session.user.id,
            },
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません。" },
                { status: 404 },
            );
        }

        // Roleが一般ユーザ以外のアカウントは退会不可
        if (currentUser.role !== "user") {
            return NextResponse.json(
                { error: "このアカウントは退会できません。" },
                { status: 403 },
            );
        }

        // パスワード検証
        const isValidPassword = await bcrypt.compare(
            result.data.password,
            currentUser.hashedPassword,
        );

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "パスワードが正しくありません。" },
                { status: 400 },
            );
        }

        const postFilePaths = currentUser.Posts.flatMap((post) => [
            post.fileName1,
            post.fileName2,
            post.fileName3,
        ]).filter(
            (filePath): filePath is string => typeof filePath === "string",
        );
        const avatarPath = currentUser.avatar;

        // トランザクションでユーザと投稿を削除
        await prisma.$transaction(async (tx) => {
            await tx.post.deleteMany({
                where: {
                    userId: currentUser.id,
                },
            });

            await tx.user.delete({
                where: {
                    id: currentUser.id,
                },
            });
        });

        // ストレージのファイルも削除（非同期で実行して、失敗しても止まらない）
        const storageCleanupResults = await Promise.allSettled([
            removeManagedPostFiles(postFilePaths), // 投稿ファイル削除
            removeManagedAvatarFile(avatarPath), // プロフィール画像削除
        ]);

        // 失敗したらログにエラーを出力（ユーザーにはエラーを返さない）
        for (const cleanupResult of storageCleanupResults) {
            if (cleanupResult.status === "rejected") {
                console.error(
                    "退会後のストレージ削除失敗:",
                    cleanupResult.reason,
                );
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("退会処理失敗:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

// プロフィール画像を削除する
async function removeManagedAvatarFile(avatarPath: null | string) {
    if (!avatarPath || !isManagedAvatarPath(avatarPath)) {
        return;
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.storage
        .from(getAvatarBucketName())
        .remove([avatarPath]);

    if (error) {
        console.error("退会後のプロフィール画像削除失敗:", error);
    }
}
