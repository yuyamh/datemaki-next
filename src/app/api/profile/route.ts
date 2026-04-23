import type {
    ProfileFieldErrors,
    ProfileFormValues,
} from "@/app/lib/interfaces/profile-form";
import { NextResponse } from "next/server";
import { ProfileUpdateInputSchema } from "@/app/lib/validations/profile.schema";
import { auth } from "@/auth";
import {
    buildAvatarObjectPath,
    getAvatarBucketName,
    getAvatarExtensionFromMimeType,
    isManagedAvatarPath,
} from "@/lib/avatar";
import { prisma } from "@/server/db/prisma/prisma";
import { createSupabaseServerClient } from "@/server/supabase/client";

// ファイルサイズは2MBまでに制限
const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;

// ユーザーIDからプロフィールを取得する
export async function getProfileByUserId(
    userId: string,
): Promise<null | ProfileFormValues> {
    const user = await prisma.user.findUnique({
        select: {
            avatar: true,
            bio: true,
            email: true,
            id: true,
            name: true,
        },
        where: {
            id: userId,
        },
    });

    if (!user) {
        return null;
    }

    return user;
}

// プロフィールの更新処理
export async function PATCH(request: Request) {
    let uploadedAvatarPath: null | string = null;

    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // 更新前のユーザーデータを取得しておく（後で画像の差し替えや削除をするため）
        const currentUser = await getProfileByUserId(session.user.id);

        if (!currentUser) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません。" },
                { status: 404 },
            );
        }

        // フォームデータを取得
        const formData = await request.formData();
        const nameValue = formData.get("name");
        const bioValue = formData.get("bio");
        const avatarFileValue = formData.get("avatarFile");

        if (typeof bioValue !== "string" || typeof nameValue !== "string") {
            return NextResponse.json(
                { error: "不正なリクエストです。" },
                { status: 400 },
            );
        }

        // バリデーションを実行
        const result = ProfileUpdateInputSchema.safeParse({
            bio: bioValue,
            name: nameValue,
        });

        // バリデーションエラーがあれば、フィールドごとのエラーメッセージを返す
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;

            return NextResponse.json({ errors }, { status: 400 });
        }

        // 送信ファイルのバリデーション
        // ファイルが送られてきていて、かつそれがFileオブジェクトでない場合はエラー
        if (avatarFileValue !== null && !(avatarFileValue instanceof File)) {
            return NextResponse.json(
                { error: "不正なファイルです。" },
                { status: 400 },
            );
        }

        // ファイルが送られてきていて、かつサイズが0より大きい場合はそのファイルを使う
        // それ以外はnullとして扱う
        const avatarFile =
            avatarFileValue instanceof File && avatarFileValue.size > 0
                ? avatarFileValue
                : null;

        // ファイルサイズが上限を超えている場合はエラー
        if (avatarFile && avatarFile.size > MAX_AVATAR_FILE_SIZE) {
            const errors: ProfileFieldErrors = {
                avatarFile: ["画像サイズは2MB以下にしてください。"],
            };

            return NextResponse.json({ errors }, { status: 413 });
        }

        // ファイルが送られてきている場合は、そのファイルの拡張子をMIMEタイプから推測する
        const avatarExtension = avatarFile
            ? getAvatarExtensionFromMimeType(avatarFile.type)
            : null;

        // ファイルが送られてきているのに、拡張子が推測できない場合はエラー
        if (avatarFile && !avatarExtension) {
            const errors: ProfileFieldErrors = {
                avatarFile: ["JPGまたはPNG形式の画像を選択してください。"],
            };

            return NextResponse.json({ errors }, { status: 415 });
        }

        // プロフィールの更新処理を開始
        const supabase = avatarFile ? createSupabaseServerClient() : null;
        let nextAvatarPath = currentUser.avatar; // 旧画像となる画像のパスを取得（あとで削除するため）

        if (avatarFile && avatarExtension && supabase) {
            // 新しい画像をアップロードするパスを構築
            uploadedAvatarPath = buildAvatarObjectPath({
                extension: avatarExtension,
                timestamp: Date.now(),
                userId: currentUser.id,
            });

            // 新しい画像をSupabase Storageにアップロード
            const { error: uploadError } = await supabase.storage
                .from(getAvatarBucketName())
                .upload(uploadedAvatarPath, avatarFile, {
                    cacheControl: "3600",
                    contentType: avatarFile.type,
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            // 新しい画像のパスを次のパスとしてセット
            nextAvatarPath = uploadedAvatarPath;
        }

        // ユーザ情報を更新する
        const updatedUser = await prisma.user.update({
            data: {
                avatar: nextAvatarPath,
                bio: result.data.bio.trim() || null,
                name: result.data.name.trim(),
            },
            select: {
                avatar: true,
                bio: true,
                email: true,
                id: true,
                name: true,
            },
            where: {
                id: currentUser.id,
            },
        });

        // 新しい画像へ切り替えた後に、旧画像を削除する
        if (
            supabase &&
            uploadedAvatarPath &&
            currentUser.avatar &&
            currentUser.avatar !== uploadedAvatarPath &&
            isManagedAvatarPath(currentUser.avatar)
        ) {
            const { error: removeError } = await supabase.storage
                .from(getAvatarBucketName())
                .remove([currentUser.avatar]);

            if (removeError) {
                console.error("旧プロフィール画像の削除失敗:", removeError);
            }
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        // もし新しい画像をアップロードした後にエラーが発生した場合は、アップロードした画像を削除してロールバック
        if (uploadedAvatarPath) {
            const supabase = createSupabaseServerClient();
            const { error: rollbackError } = await supabase.storage
                .from(getAvatarBucketName())
                .remove([uploadedAvatarPath]);

            if (rollbackError) {
                console.error(
                    "プロフィール画像アップロードのロールバック失敗:",
                    rollbackError,
                );
            }
        }

        console.error("プロフィール更新失敗:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
