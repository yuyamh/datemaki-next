export interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export interface PostIndexProps {
    searchParams: Promise<{
        level?: string | string[];
        page?: string | string[];
        q?: string | string[];
        sort?: string | string[];
        textbookId?: string | string[];
    }>;
}

export interface ShowPostPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        tab?: string | string[];
    }>;
}
