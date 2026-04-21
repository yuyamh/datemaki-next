import type { PostDetailData } from "./post";

export interface PostDetailProps {
    post: PostDetailData;
    sessionUserId: string;
}
