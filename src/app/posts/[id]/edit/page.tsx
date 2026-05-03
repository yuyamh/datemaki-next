import type { EditPostPageProps } from "@/app/lib/interfaces/post-page";
import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/app/ui/post-form";
import { auth } from "@/auth";
import { isUuid } from "@/lib/uuid";
import { getEditablePostById } from "@/server/posts";

export default async function EditPostPage({ params }: EditPostPageProps) {
    const { id } = await params;
    if (!isUuid(id)) notFound();

    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const post = await getEditablePostById(id);

    if (!post) {
        notFound();
    }

    // 所有者チェック
    if (post.userId !== session.user.id) {
        notFound();
    }

    return (
        <div className="mx-auto w-10/12">
            <div className="my-6">
                <h1 className="text-3xl font-bold text-gray-700">教案を編集</h1>
                <h2 className="my-3 text-gray-500">
                    内容を更新して、よりよい教案にしましょう！
                </h2>
            </div>

            {/* key={post.id}を持たせて、idが変わったらPostFormを作り直す */}
            <PostForm
                initialValues={{
                    title: post.title,
                    description: post.description,
                    fileName1: post.fileName1,
                    fileName2: post.fileName2,
                    fileName3: post.fileName3,
                    fileOriginalName1: post.fileOriginalName1,
                    fileOriginalName2: post.fileOriginalName2,
                    fileOriginalName3: post.fileOriginalName3,
                    fileSize1: post.fileSize1,
                    fileSize2: post.fileSize2,
                    fileSize3: post.fileSize3,
                    level: post.level,
                    textbookId: post.textbookId,
                }}
                key={post.id}
                mode="edit"
                postId={post.id}
            />
        </div>
    );
}
