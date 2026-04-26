export interface BookmarkResponse {
    isBookmarked: boolean;
}

export interface BookmarkToggleButtonProps {
    className?: string;
    initialIsBookmarked: boolean;
    postId: string;
    size?: number;
}
