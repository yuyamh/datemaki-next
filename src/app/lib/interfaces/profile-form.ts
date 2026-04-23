export interface ProfileFieldErrors {
    avatarFile?: string[];
    name?: string[];
}

export interface ProfileFormProps {
    initialValues: ProfileFormValues;
}

export interface ProfileFormValues {
    avatar: null | string;
    bio: null | string;
    email: string;
    id: string;
    name: string;
}

export interface ProfileUpdateResponse {
    user: ProfileFormValues;
}
