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
    fileOriginalName1: null | string;
    fileOriginalName2: null | string;
    fileOriginalName3: null | string;
    fileSize1: null | number;
    fileSize2: null | number;
    fileSize3: null | number;
    uploadedPaths: string[];
}
