export interface FileSlotState {
    existingOriginalName: null | string;
    existingPath: null | string;
    existingSize: null | number;
    removeExisting: boolean;
    selectedFile: File | null;
}

export interface PostFileUploadSlotProps {
    error?: string;
    existingOriginalName: null | string;
    existingPath: null | string;
    existingSize: null | number;
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
    fileOriginalName1: null | string;
    fileOriginalName2: null | string;
    fileOriginalName3: null | string;
    fileSize1: null | number;
    fileSize2: null | number;
    fileSize3: null | number;
    level: null | string;
    textbookId: null | string;
    title: string;
}
