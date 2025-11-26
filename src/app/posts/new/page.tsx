import type { Textbook } from "@/app/lib/interface/textbook";
import { getBaseUrl } from "@/app/actions/get-base-url";
import { PostForm } from "@/app/ui/post-form";

export default async function NewPost() {
    const textbooks = await getTextbooks();

    return (
        <div className="mx-auto w-10/12">
            <div className="my-6">
                <h1 className="text-3xl font-bold text-gray-700">
                    新しい教案を投稿
                </h1>
                <h2 className="my-3 text-gray-500">
                    作成した教案を共有して、フィードバックをもらいましょう！
                </h2>
            </div>

            <PostForm textbooks={textbooks} />
        </div>
    );
}

async function getTextbooks(): Promise<Textbook[]> {
    const res = await fetch(`${getBaseUrl()}/api/textbooks`, {
        cache: "no-store",
        method: "GET",
    });

    if (!res.ok) {
        throw new Error("使用テキストの取得に失敗しました。");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: { textbooks: Textbook[] } = await res.json();
    return data.textbooks;
}
