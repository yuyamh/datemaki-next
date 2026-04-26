export interface PostFormProps {
    initialValues?: PostFormValues;
    mode?: "create" | "edit";
    postId?: string;
}

export interface PostFormValues {
    description: null | string;
    level: null | string;
    textbookId: null | string;
    title: string;
}
