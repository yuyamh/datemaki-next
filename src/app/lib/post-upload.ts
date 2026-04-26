import type { PostFormFieldErrors } from "@/app/lib/interfaces/post-form";
import type {
    PostTextFormValues,
    PostUploadFiles,
    PostUploadPaths,
} from "@/app/lib/interfaces/post-upload";
import {
    buildPostFileObjectPath,
    getPostFileBucketName,
    getPostFileExtensionFromFileName,
    getPostFileExtensionFromMimeType,
    isAllowedPostFileType,
    isManagedPostFilePath,
    MAX_POST_FILE_SIZE,
} from "@/app/lib/post-file";
import { createSupabaseServerClient } from "@/server/supabase/client";

type RemoveFileFieldName = "removeFile1" | "removeFile2" | "removeFile3";

// 3枠の添付ファイルをまとめてバリデーションする
export function getPostFileValidationErrors(
    files: PostUploadFiles,
): PostFormFieldErrors {
    const errors: PostFormFieldErrors = {};

    if (files.file1) {
        const error = getPostFileValidationError(files.file1);
        if (error) {
            errors.file1 = [error];
        }
    }

    if (files.file2) {
        const error = getPostFileValidationError(files.file2);
        if (error) {
            errors.file2 = [error];
        }
    }

    if (files.file3) {
        const error = getPostFileValidationError(files.file3);
        if (error) {
            errors.file3 = [error];
        }
    }

    return errors;
}

// multipart/form-data から基本項目だけを取り出す
export function getPostTextFormValues(
    formData: FormData,
): null | PostTextFormValues {
    const title = formData.get("title");
    const description = formData.get("description");
    const level = formData.get("level");
    const textbookId = formData.get("textbookId");

    if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof level !== "string" ||
        typeof textbookId !== "string"
    ) {
        return null;
    }

    return {
        description,
        level,
        textbookId,
        title,
    };
}

// multipart/form-data から3枠分のファイルを取り出す
export function getPostUploadFiles(formData: FormData): null | PostUploadFiles {
    const file1 = parsePostFormFileEntry(formData.get("file1"));
    const file2 = parsePostFormFileEntry(formData.get("file2"));
    const file3 = parsePostFormFileEntry(formData.get("file3"));

    if (file1 === undefined || file2 === undefined || file3 === undefined) {
        return null;
    }

    return {
        file1,
        file2,
        file3,
    };
}

// 編集画面のファイルを「削除する」状態を取り出す
export function getRemoveFileFlag(
    formData: FormData,
    fieldName: RemoveFileFieldName,
) {
    return formData.get(fieldName) === "true";
}

// 管理対象の添付ファイルだけを削除する
export async function removeManagedPostFiles(filePaths: string[]) {
    const removablePaths = filePaths.filter((filePath) =>
        isManagedPostFilePath(filePath),
    );

    if (removablePaths.length === 0) {
        return;
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.storage
        .from(getPostFileBucketName())
        .remove(removablePaths);

    if (error) {
        console.error("添付ファイル削除失敗:", error);
    }
}

// 新規アップロードが必要なファイルだけを保存する
// 保存したファイルのパスを返す
export async function uploadPostFiles({
    files,
    postId,
}: {
    files: PostUploadFiles;
    postId: string;
}): Promise<PostUploadPaths> {
    const uploadedPaths: string[] = [];
    try {
        const fileName1 = files.file1
            ? await uploadPostFileSlot({
                  file: files.file1,
                  postId,
                  slot: 1,
              })
            : null;

        if (fileName1) {
            uploadedPaths.push(fileName1);
        }

        const fileName2 = files.file2
            ? await uploadPostFileSlot({
                  file: files.file2,
                  postId,
                  slot: 2,
              })
            : null;

        if (fileName2) {
            uploadedPaths.push(fileName2);
        }

        const fileName3 = files.file3
            ? await uploadPostFileSlot({
                  file: files.file3,
                  postId,
                  slot: 3,
              })
            : null;

        if (fileName3) {
            uploadedPaths.push(fileName3);
        }

        return {
            fileName1,
            fileName2,
            fileName3,
            fileOriginalName1: files.file1?.name ?? null,
            fileOriginalName2: files.file2?.name ?? null,
            fileOriginalName3: files.file3?.name ?? null,
            fileSize1: files.file1?.size ?? null,
            fileSize2: files.file2?.size ?? null,
            fileSize3: files.file3?.size ?? null,
            uploadedPaths,
        };
    } catch (error) {
        // アップロードに失敗した場合は、すでにアップロードしたファイルを削除してからエラーを投げる
        await removeManagedPostFiles(uploadedPaths);
        throw error;
    }
}

function getPostFileValidationError(file: File) {
    if (!isAllowedPostFileType(file)) {
        return "PDF、PNG、JPEG、ZIP、PowerPoint、Excel形式のファイルを選択してください。";
    }

    if (file.size > MAX_POST_FILE_SIZE) {
        return "ファイルサイズは10MB以下にしてください。";
    }

    return null;
}

function getPostStorageExtension(file: File) {
    return (
        getPostFileExtensionFromMimeType(file.type) ??
        getPostFileExtensionFromFileName(file.name)
    );
}

function parsePostFormFileEntry(value: FormDataEntryValue | null) {
    if (value === null) {
        return null;
    }

    if (!(value instanceof File)) {
        return;
    }

    return value.size > 0 ? value : null;
}

// ファイルを1つアップロードする
async function uploadPostFileSlot({
    file,
    postId,
    slot,
}: {
    file: File;
    postId: string;
    slot: 1 | 2 | 3;
}) {
    const extension = getPostStorageExtension(file);

    if (!extension) {
        throw new Error("添付ファイルの拡張子を判定できません。");
    }

    const objectPath = buildPostFileObjectPath({
        extension,
        originalFileName: file.name,
        postId,
        slot,
        timestamp: Date.now(),
    });
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.storage
        .from(getPostFileBucketName())
        .upload(objectPath, file, {
            contentType: file.type || undefined,
            upsert: false,
        });

    if (error) {
        throw error;
    }

    return objectPath;
}
