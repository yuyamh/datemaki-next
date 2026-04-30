import { PostFormSkeleton } from "@/app/ui/post-form-skeleton";

export default function Loading() {
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

            <PostFormSkeleton />
        </div>
    );
}
