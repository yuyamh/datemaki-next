import { redirect } from "next/navigation";
import PostList from "@/app/ui/post-list";
import { auth } from "@/auth";

export default async function PostIndex() {
    // セッション取得
    const session = await auth();

    console.log(session);

    // 未ログインならログインページへ
    if (session?.user) {
        console.log("ユーザあり");
    } else {
        console.log("ユーザなし");
        redirect("/login");
    }

    return <PostList />;
}
