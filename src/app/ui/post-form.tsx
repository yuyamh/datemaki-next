"use client";

import type {
    FileSlotState,
    PostFileUploadSlotProps,
    PostFormFieldErrors,
    PostFormProps,
} from "@/app/lib/interfaces/post-form";
import type { Textbook } from "@/app/lib/interfaces/textbook";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAllowedPostFileType, MAX_POST_FILE_SIZE } from "@/app/lib/post-file";
import { POST_LEVEL_OPTIONS } from "@/app/lib/post-level";
import { MarkdownContent } from "@/app/ui/markdown-content";
import { MarkdownHelpDialog } from "@/app/ui/markdown-help-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { File, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

// 許可するファイルタイプを指定
// PDF, PNG, JPEG, ZIP, PowerPoint, Excel
const POST_FILE_ACCEPT =
    ".pdf,.png,.jpg,.jpeg,.zip,.ppt,.pptx,.xls,.xlsx,application/pdf,image/png,image/jpeg,application/zip,application/x-zip-compressed,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function PostForm({
    mode = "create",
    postId,
    initialValues,
}: PostFormProps) {
    const router = useRouter();
    const isEdit = mode === "edit";

    // stateの初期値に props を使う（key={post.id} があるのでkey が変わると React は「別のコンポーネント」として扱う。）
    const [title, setTitle] = useState(initialValues?.title ?? "");
    const [description, setDescription] = useState(
        initialValues?.description ?? "",
    );
    const [descriptionViewMode, setDescriptionViewMode] = useState<
        "edit" | "preview"
    >("edit");
    const [level, setLevel] = useState(initialValues?.level ?? "");
    const [textbookId, setTextbookId] = useState(
        initialValues?.textbookId ?? "",
    );
    const [file1State, setFile1State] = useState<FileSlotState>(
        createInitialFileSlotState({
            existingOriginalName: initialValues?.fileOriginalName1 ?? null,
            existingPath: initialValues?.fileName1 ?? null,
            existingSize: initialValues?.fileSize1 ?? null,
        }),
    );
    const [file2State, setFile2State] = useState<FileSlotState>(
        createInitialFileSlotState({
            existingOriginalName: initialValues?.fileOriginalName2 ?? null,
            existingPath: initialValues?.fileName2 ?? null,
            existingSize: initialValues?.fileSize2 ?? null,
        }),
    );
    const [file3State, setFile3State] = useState<FileSlotState>(
        createInitialFileSlotState({
            existingOriginalName: initialValues?.fileOriginalName3 ?? null,
            existingPath: initialValues?.fileName3 ?? null,
            existingSize: initialValues?.fileSize3 ?? null,
        }),
    );

    const [textbookList, setTextbookList] = useState<Textbook[]>([]);
    const [fieldErrors, setFieldErrors] = useState<PostFormFieldErrors>({});

    const setFileFieldError = (
        fieldName: "file1" | "file2" | "file3",
        errorMessage?: string,
    ) => {
        setFieldErrors((prev) => ({
            ...prev,
            [fieldName]: errorMessage ? [errorMessage] : undefined,
        }));
    };

    // どのファイル欄に、どのファイルを入れるかを処理する
    const handleFileSelection = (
        fieldName: "file1" | "file2" | "file3",
        nextFile: File | null,
        // setFileState には setFile1State / setFile2State / setFile3State のどれかを渡してください、という型指定
        setFileState: Dispatch<SetStateAction<FileSlotState>>,
    ) => {
        if (!nextFile) {
            return;
        }

        // ファイルのバリデーションを行う
        const errorMessage = validateSelectedPostFile(nextFile);

        if (errorMessage) {
            setFileFieldError(fieldName, errorMessage);
            return;
        }

        setFileFieldError(fieldName);
        setFileState((prev) => ({
            ...prev,
            removeExisting: false,
            selectedFile: nextFile,
        }));
    };

    // ファイル1の変更を処理する
    const handleFile1Change = (nextFile: File | null) =>
        handleFileSelection("file1", nextFile, setFile1State);
    // ファイル2の変更を処理する
    const handleFile2Change = (nextFile: File | null) =>
        handleFileSelection("file2", nextFile, setFile2State);
    // ファイル3の変更を処理する
    const handleFile3Change = (nextFile: File | null) =>
        handleFileSelection("file3", nextFile, setFile3State);

    // ファイルスロットをクリアする（既存ファイルの削除 or 選択した新しいファイルの取り消し）
    const clearFileSlot = (
        fieldName: "file1" | "file2" | "file3",
        setFileState: Dispatch<SetStateAction<FileSlotState>>,
    ) => {
        setFileFieldError(fieldName);
        setFileState((prev) => {
            if (prev.selectedFile) {
                return {
                    ...prev,
                    removeExisting: false,
                    selectedFile: null,
                };
            }

            if (prev.existingPath) {
                return {
                    ...prev,
                    removeExisting: true,
                };
            }

            return prev;
        });
    };

    // ファイルスロットを復元する（既存ファイルの削除の取り消し）
    const restoreFileSlot = (
        fieldName: "file1" | "file2" | "file3",
        setFileState: Dispatch<SetStateAction<FileSlotState>>,
    ) => {
        setFileFieldError(fieldName);
        setFileState((prev) => ({
            ...prev,
            removeExisting: false,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        if (isEdit && !postId) {
            toast.error("更新対象のIDが見つかりません。");
            return;
        }

        const url = isEdit ? `/api/posts/${postId}` : "/api/posts";
        const method = isEdit ? "PATCH" : "POST";
        const formData = new FormData();

        formData.set("title", title);
        formData.set("description", description);
        formData.set("level", level);
        formData.set("textbookId", textbookId);
        formData.set("removeFile1", String(file1State.removeExisting));
        formData.set("removeFile2", String(file2State.removeExisting));
        formData.set("removeFile3", String(file3State.removeExisting));

        if (file1State.selectedFile) {
            formData.set("file1", file1State.selectedFile);
        }

        if (file2State.selectedFile) {
            formData.set("file2", file2State.selectedFile);
        }

        if (file3State.selectedFile) {
            formData.set("file3", file3State.selectedFile);
        }

        const response = await fetch(url, {
            method,
            body: formData,
        });

        const responseData = (await response
            .json()
            .catch(() => null)) as null | {
            error?: string;
            errors?: PostFormFieldErrors;
        };

        if (response.ok) {
            router.push("/posts");
            router.refresh();
            toast.success(
                isEdit ? "教案が更新されました" : "教案が作成されました",
            );
            return;
        }

        if (responseData?.errors) {
            setFieldErrors(responseData.errors);
            return;
        }

        toast.error(
            responseData?.error ??
                (isEdit
                    ? "教案更新に失敗しました。再度更新してください。"
                    : "教案登録に失敗しました。再度登録してください。"),
        );
    };

    const getTextbooks = async () => {
        const res = await fetch(`/api/textbooks`, {
            cache: "no-store",
            method: "GET",
        });

        if (!res.ok) {
            throw new Error("使用テキストの取得に失敗しました。");
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: { textbooks: Textbook[] } = await res.json();
        setTextbookList(data.textbooks);
    };

    useEffect(() => {
        void getTextbooks();
    }, []);

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">基本情報</CardTitle>
                    <CardDescription>
                        {isEdit
                            ? "教案の内容を編集してください"
                            : "教案の基本的な情報を入力してください"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid w-full items-center gap-4 space-y-2">
                        <div className="flex flex-col space-y-3">
                            <Label htmlFor="title">タイトル</Label>
                            <Input
                                className="w-full rounded-lg border px-3 py-2"
                                id="title"
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        title: undefined,
                                    }));
                                }}
                                placeholder="例：「〜てもいいです」の導入"
                                required
                                type="text"
                                value={title}
                            />
                            {fieldErrors.title?.[0] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldErrors.title[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2">
                            <div className="mb-0 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Label
                                        className="mb-0"
                                        htmlFor="description"
                                    >
                                        概要
                                    </Label>
                                    <MarkdownHelpDialog />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                                        <Button
                                            className="h-8 px-3"
                                            onClick={() =>
                                                setDescriptionViewMode("edit")
                                            }
                                            type="button"
                                            variant={
                                                descriptionViewMode === "edit"
                                                    ? "default"
                                                    : "ghost"
                                            }
                                        >
                                            編集
                                        </Button>
                                        <Button
                                            className="h-8 px-3"
                                            onClick={() =>
                                                setDescriptionViewMode(
                                                    "preview",
                                                )
                                            }
                                            type="button"
                                            variant={
                                                descriptionViewMode ===
                                                "preview"
                                                    ? "default"
                                                    : "ghost"
                                            }
                                        >
                                            プレビュー
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">
                                マークダウン記法でも入力できます。
                            </p>
                            {descriptionViewMode === "edit" ? (
                                <Textarea
                                    className="min-h-[400px] w-full rounded-lg border px-3 py-2"
                                    id="description"
                                    onChange={(e) => {
                                        setDescription(e.target.value);
                                        setFieldErrors((prev) => ({
                                            ...prev,
                                            description: undefined,
                                        }));
                                    }}
                                    placeholder="教案の説明を記入しましょう"
                                    required
                                    rows={20}
                                    value={description}
                                />
                            ) : (
                                <div className="min-h-[400px] rounded-lg border bg-white px-4 py-4">
                                    <MarkdownContent
                                        content={description}
                                        emptyMessage="プレビューする内容がまだありません。"
                                    />
                                </div>
                            )}
                            {fieldErrors.description?.[0] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldErrors.description[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Label className="mb-2 block" htmlFor="level">
                                レベル
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    setLevel(value);
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        level: undefined,
                                    }));
                                }}
                                value={level}
                            >
                                <SelectTrigger className="w-2/6">
                                    <SelectValue placeholder="CEFR 基準" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>レベル</SelectLabel>
                                        {POST_LEVEL_OPTIONS.map(
                                            (optionLevel) => (
                                                <SelectItem
                                                    key={optionLevel}
                                                    value={optionLevel}
                                                >
                                                    {optionLevel}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {fieldErrors.level?.[0] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldErrors.level[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Label className="mb-2 block" htmlFor="textbookId">
                                使用テキスト
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    setTextbookId(value);
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        textbookId: undefined,
                                    }));
                                }}
                                value={textbookId}
                            >
                                <SelectTrigger className="w-2/6">
                                    <SelectValue placeholder="使用テキストを選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>テキスト名</SelectLabel>
                                        {textbookList.map((t: Textbook) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {fieldErrors.textbookId?.[0] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldErrors.textbookId[0]}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        ファイルのアップロード
                    </CardTitle>
                    <CardDescription>
                        教案に関連するファイルをアップロードしてください。
                        1ファイル10MBまで、最大3ファイル添付できます。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <PostFileUploadSlot
                        error={fieldErrors.file1?.[0]}
                        existingOriginalName={file1State.existingOriginalName}
                        existingPath={file1State.existingPath}
                        existingSize={file1State.existingSize}
                        file={file1State.selectedFile}
                        inputId="file1"
                        isMarkedForRemoval={file1State.removeExisting}
                        onClear={() => clearFileSlot("file1", setFile1State)} // クリアボタンを押したときに実行してほしい処理
                        onFileChange={handleFile1Change} // 新しいファイルが選ばれたときに実行する処理
                        onRestore={() =>
                            // 削除予定にした既存ファイルを元に戻す処理
                            restoreFileSlot("file1", setFile1State)
                        }
                        slotLabel="添付ファイル1"
                    />
                    <PostFileUploadSlot
                        error={fieldErrors.file2?.[0]}
                        existingOriginalName={file2State.existingOriginalName}
                        existingPath={file2State.existingPath}
                        existingSize={file2State.existingSize}
                        file={file2State.selectedFile}
                        inputId="file2"
                        isMarkedForRemoval={file2State.removeExisting}
                        onClear={() => clearFileSlot("file2", setFile2State)}
                        onFileChange={handleFile2Change}
                        onRestore={() =>
                            restoreFileSlot("file2", setFile2State)
                        }
                        slotLabel="添付ファイル2"
                    />
                    <PostFileUploadSlot
                        error={fieldErrors.file3?.[0]}
                        existingOriginalName={file3State.existingOriginalName}
                        existingPath={file3State.existingPath}
                        existingSize={file3State.existingSize}
                        file={file3State.selectedFile}
                        inputId="file3"
                        isMarkedForRemoval={file3State.removeExisting}
                        onClear={() => clearFileSlot("file3", setFile3State)}
                        onFileChange={handleFile3Change}
                        onRestore={() =>
                            restoreFileSlot("file3", setFile3State)
                        }
                        slotLabel="添付ファイル3"
                    />
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button
                    onClick={() => router.back()}
                    type="button"
                    variant="outline"
                >
                    キャンセル
                </Button>
                <Button type="submit">
                    {isEdit ? "更新する" : "投稿する"}
                </Button>
            </div>
        </form>
    );
}

// 既存の添付情報を受け取り、FileSlotStateの初期状態を作成する
function createInitialFileSlotState({
    existingOriginalName,
    existingPath,
    existingSize,
}: {
    existingOriginalName: null | string;
    existingPath: null | string;
    existingSize: null | number;
}): FileSlotState {
    return {
        existingOriginalName,
        existingPath,
        existingSize,
        removeExisting: false, // すでに登録済みのファイルを削除するかどうかのフラグ
        selectedFile: null,
    };
}

// ファイルサイズをフォーマットする
// 例: 10485760 -> "10.0 MB", 1536 -> "1.5 KB"
function formatFileSize(size: number) {
    if (size >= 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
    }

    // 1KB以上10MB未満の場合はKBで表示
    if (size >= 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    // 1KB未満の場合はBで表示
    return `${size} B`;
}

// ファイルパスから表示用のファイル名を取得する（popで列の最後の要素を取り出す）
function getDisplayFileName(filePath: string) {
    return filePath.split("/").pop() ?? filePath;
}

// ファイルアップロードのコンポーネント
function PostFileUploadSlot({
    error,
    existingOriginalName,
    existingPath,
    existingSize,
    file,
    inputId,
    isMarkedForRemoval,
    onClear,
    onFileChange,
    onRestore,
    slotLabel,
}: PostFileUploadSlotProps) {
    const [isDragging, setIsDragging] = useState(false);

    // 既存ファイルがあるかどうか
    const hasExistingFile = Boolean(existingPath) && !isMarkedForRemoval;
    // 表示するファイル名
    const currentFileName =
        file?.name ??
        (hasExistingFile
            ? (existingOriginalName ??
              (existingPath ? getDisplayFileName(existingPath) : null))
            : null);
    // 表示するファイルサイズ
    let currentFileSize: null | string = null;

    if (file) {
        currentFileSize = formatFileSize(file.size);
    } else if (existingSize !== null) {
        currentFileSize = formatFileSize(existingSize);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={inputId}>{slotLabel}</Label>
                {(Boolean(file) || hasExistingFile || isMarkedForRemoval) && (
                    <div className="flex items-center gap-2">
                        {isMarkedForRemoval ? (
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    onRestore();
                                }}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                削除を取り消す
                            </Button>
                        ) : hasExistingFile || file ? (
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    onClear();
                                }}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                <Trash2 className="mr-1 h-4 w-4" />
                                削除する
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>

            <label className="block cursor-pointer" htmlFor={inputId}>
                <input
                    accept={POST_FILE_ACCEPT}
                    className="sr-only"
                    id={inputId}
                    onChange={(event) => {
                        onFileChange(event.target.files?.[0] ?? null);
                        event.target.value = "";
                    }}
                    type="file"
                />
                <div
                    className={cn(
                        "rounded-xl border-2 border-dashed bg-slate-50 px-6 py-8 text-center transition",
                        isDragging
                            ? "border-orange-300 bg-orange-50"
                            : "border-slate-200 hover:border-orange-200 hover:bg-white",
                        error && "border-red-300 bg-red-50",
                    )}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(true);
                    }}
                    onDragLeave={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(false);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(true);
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(false);
                        onFileChange(event.dataTransfer.files?.[0] ?? null);
                    }}
                >
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
                        <div className="rounded-full bg-white p-3 shadow-sm">
                            {currentFileName ? (
                                <File className="h-6 w-6 text-slate-700" />
                            ) : (
                                <Upload className="h-6 w-6 text-slate-700" />
                            )}
                        </div>
                        <div className="space-y-1">
                            {currentFileName ? (
                                <>
                                    <p className="font-medium text-slate-900">
                                        {currentFileName}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {isMarkedForRemoval
                                            ? "次回保存時に削除されます。"
                                            : (currentFileSize ??
                                              "既存ファイル")}
                                    </p>
                                </>
                            ) : isMarkedForRemoval ? (
                                <>
                                    <p className="font-medium text-slate-900">
                                        この枠のファイルは削除予定です
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        クリックして新しいファイルを選択するか、削除を取り消してください。
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-slate-900">
                                        クリックしてファイルをアップロード
                                        またはドラッグ＆ドロップ
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        PDF, PNG, JPEG, ZIP, PowerPoint, Excel
                                        （最大10MB）
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

// アップロードされたファイルのバリデーションを行う
function validateSelectedPostFile(file: File) {
    if (!isAllowedPostFileType(file)) {
        return "PDF、PNG、JPEG、ZIP、PowerPoint、Excel形式のファイルを選択してください。";
    }

    if (file.size > MAX_POST_FILE_SIZE) {
        return "ファイルサイズは10MB以下にしてください。";
    }

    return null;
}
