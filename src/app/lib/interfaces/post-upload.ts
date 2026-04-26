export interface PostTextFormValues {
    description: string;
    level: string;
    textbookId: string;
    title: string;
}

export interface PostUploadFiles {
    file1: File | null;
    file2: File | null;
    file3: File | null;
}

export interface PostUploadPaths {
    fileName1: null | string;
    fileName2: null | string;
    fileName3: null | string;
    uploadedPaths: string[];
}
