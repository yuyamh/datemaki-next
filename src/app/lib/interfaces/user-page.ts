export interface ShowUserPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        level?: string | string[];
        page?: string | string[];
        q?: string | string[];
        sort?: string | string[];
        tab?: string | string[];
    }>;
}

export interface UserIndexPageProps {
    searchParams: Promise<{
        page?: string | string[];
        q?: string | string[];
    }>;
}
