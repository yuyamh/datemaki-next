export interface FileSlotState {
    existingPath: null | string;
    removeExisting: boolean;
    selectedFile: File | null;
}

export interface PostFileUploadSlotProps {
    error?: string;
    existingPath: null | string;
    file: File | null;
    inputId: string;
    isMarkedForRemoval: boolean;
    onClear: () => void;
    onFileChange: (file: File | null) => void;
    onRestore: () => void;
    slotLabel: string;
}

export type PostFormFieldErrors = Partial<Record<PostFormFieldName, string[]>>;

export type PostFormFieldName =
    | "description"
    | "file1"
    | "file2"
    | "file3"
    | "level"
    | "textbookId"
    | "title";

export interface PostFormProps {
    initialValues?: PostFormValues;
    mode?: "create" | "edit";
    postId?: string;
}

export interface PostFormValues {
    description: null | string;
    fileName1: null | string;
    fileName2: null | string;
    fileName3: null | string;
    level: null | string;
    textbookId: null | string;
    title: string;
}
