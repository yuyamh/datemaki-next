export interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export interface PostIndexProps {
    searchParams: Promise<{
        page?: string | string[];
    }>;
}

export interface ShowPostPageProps {
    params: Promise<{ id: string }>;
}
