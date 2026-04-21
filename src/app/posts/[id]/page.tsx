import type { ShowPostPageProps } from "@/app/lib/interfaces/post-page";
import { notFound, redirect } from "next/navigation";
import { getPostDetail } from "@/app/api/posts/[id]/route";
import { PostDetail } from "@/app/ui/post-detail";
import { auth } from "@/auth";

export default async function ShowPost({ params }: ShowPostPageProps) {
    // セッション取得
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { id } = await params;
    const post = await getPostDetail({
        postId: id,
        sessionUserId: session.user.id,
    });

    if (!post) notFound();

    return <PostDetail post={post} sessionUserId={session.user.id} />;
}
