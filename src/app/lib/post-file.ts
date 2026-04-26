const POST_FILE_BUCKET_NAME = "post-files";
export const MAX_POST_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_POST_FILE_EXTENSIONS = [
    "jpeg",
    "jpg",
    "pdf",
    "png",
    "ppt",
    "pptx",
    "xls",
    "xlsx",
    "zip",
] as const;

// 添付ファイルのオブジェクトパスを構築する
export function buildPostFileObjectPath({
    extension,
    originalFileName,
    postId,
    slot,
    timestamp,
}: {
    extension: string;
    originalFileName: string;
    postId: string;
    slot: 1 | 2 | 3;
    timestamp: number;
}) {
    const safeBaseName = sanitizePostFileName(originalFileName);
    return `posts/${postId}/slot_${slot}_${timestamp}_${safeBaseName}.${extension}`;
}

// 添付ファイル用のバケット名を返却する
export function getPostFileBucketName() {
    return POST_FILE_BUCKET_NAME;
}

// ファイル名から添付ファイルの拡張子を取得する
export function getPostFileExtensionFromFileName(fileName: string) {
    // ファイル名から拡張子を抽出し、小文字に変換して返す
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

    return ALLOWED_POST_FILE_EXTENSIONS.includes(
        extension as (typeof ALLOWED_POST_FILE_EXTENSIONS)[number],
    )
        ? extension
        : null;
}

// MIME タイプから添付ファイルの拡張子を推測する
export function getPostFileExtensionFromMimeType(mimeType: string) {
    switch (mimeType) {
        case "application/pdf": {
            return "pdf";
        }
        case "application/vnd.ms-excel": {
            return "xls";
        }
        case "application/vnd.ms-powerpoint": {
            return "ppt";
        }
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
            return "pptx";
        }
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
            return "xlsx";
        }
        case "application/x-zip-compressed":
        case "application/zip": {
            return "zip";
        }
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

// 添付ファイルに利用できる形式かどうかを判定する
export function isAllowedPostFileType(file: File) {
    // ファイル名から拡張子を取得
    const extension = getPostFileExtensionFromFileName(file.name);

    if (!extension) {
        return false;
    }

    if (!file.type) {
        return true;
    }

    // MIMEタイプから推測される拡張子を取得
    const mimeExtension = getPostFileExtensionFromMimeType(file.type);

    if (!mimeExtension) {
        return true;
    }

    return (
        normalizePostFileExtension(mimeExtension) ===
        normalizePostFileExtension(extension)
    );
}

// 管理対象の添付ファイルパスかどうかを判定する
export function isManagedPostFilePath(filePath: string) {
    return filePath.startsWith("posts/");
}

// "jpeg" を "jpg" に正規化する（S3に保存する際などに拡張子を統一する）
function normalizePostFileExtension(extension: string) {
    return extension === "jpeg" ? "jpg" : extension;
}

// ファイル名を安全な形式に変換する
function sanitizePostFileName(fileName: string) {
    const withoutExtension = fileName.replace(/\.[^.]+$/, "");

    return (
        withoutExtension
            .trim()
            .replaceAll(/[^a-zA-Z0-9_-]+/g, "-")
            .replaceAll(/-+/g, "-")
            .replaceAll(/^-|-$/g, "") || "attachment"
    );
}
