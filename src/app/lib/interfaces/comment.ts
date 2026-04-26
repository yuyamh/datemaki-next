export interface CommentAuthorSummary {
    avatar: null | string;
    id: string;
    name: string;
}

export interface CommentListItem {
    content: string;
    createdAt: Date | string;
    id: string;
    updatedAt: Date | string;
    user: CommentAuthorSummary;
}

export interface CommentResponse {
    comment: CommentListItem;
}
