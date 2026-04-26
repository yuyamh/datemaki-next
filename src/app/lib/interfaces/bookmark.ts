export interface BookmarkResponse {
    isBookmarked: boolean;
}

export interface BookmarkToggleButtonProps {
    className?: string;
    initialIsBookmarked: boolean;
    label?: string;
    postId: string;
    size?: number;
}
