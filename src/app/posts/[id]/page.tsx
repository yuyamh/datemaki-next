import { notFound, redirect } from "next/navigation";
import { PostDetail } from "@/app/ui/post-detail";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";

export default async function ShowPost({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // セッション取得
    const session = await auth();
    if (!session?.user) redirect("/login");

    const sessionUserId = session.user.id;
    if (!sessionUserId) redirect("/login");

    // 未ログインならログインページへ
    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    bio: true,
                },
            },
            textbook: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (!post) notFound();

    return <PostDetail post={post} sessionUserId={sessionUserId} />;
}
