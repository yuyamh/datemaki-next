import type { PostDetailData } from "./post";

export interface PostDetailProps {
    activeTab: "comments" | "content";
    post: PostDetailData;
    sessionUserId: string;
}
