// アバター用のバケット名
const AVATAR_BUCKET_NAME = "avatars";

// アバター画像のオブジェクトパスを構築する
export function buildAvatarObjectPath({
    extension,
    timestamp,
    userId,
}: {
    extension: string;
    timestamp: number;
    userId: string;
}) {
    return `users/${userId}/avatar-${timestamp}.${extension}`;
}

export function buildAvatarPublicUrl(avatarPath: null | string) {
    if (!avatarPath) {
        return null;
    }

    if (
        avatarPath.startsWith("blob:") ||
        avatarPath.startsWith("data:") ||
        avatarPath.startsWith("http://") ||
        avatarPath.startsWith("https://")
    ) {
        return avatarPath;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
        return avatarPath;
    }

    const encodedPath = avatarPath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

    return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${AVATAR_BUCKET_NAME}/${encodedPath}`;
}

// バケット名を返却する
export function getAvatarBucketName() {
    return AVATAR_BUCKET_NAME;
}

// MIMEタイプからアバター画像の拡張子を取得する
export function getAvatarExtensionFromMimeType(mimeType: string) {
    switch (mimeType) {
        case "image/jpeg": {
            return "jpg";
        }
        case "image/png": {
            return "png";
        }
        default: {
            return null;
        }
    }
}

// 管理対象のアバター画像パスかどうかを判定する
export function isManagedAvatarPath(avatarPath: string) {
    return avatarPath.startsWith("users/");
}
