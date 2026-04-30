export interface PasswordResetFormProps {
    token?: string;
}

export interface PasswordResetPageProps {
    searchParams: Promise<{
        token?: string | string[];
    }>;
}
