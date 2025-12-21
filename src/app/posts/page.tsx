import { redirect } from "next/navigation";
import PostList from "@/app/ui/post-list";
import { auth } from "@/auth";

export default async function PostIndex() {
    // セッション取得
    const session = await auth();

    // 未ログインならログインページへ
    if (!session?.user) {
        redirect("/login");
    }

    return <PostList />;
}
