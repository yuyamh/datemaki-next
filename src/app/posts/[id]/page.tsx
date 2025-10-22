import { posts } from "@/app/lib/placeholder-data";

// TODO: 後ほどtypeで指定
export default function BlogPost({
    params,
}: {
    params: {
        id: string;
    };
}) {
    const post = posts.find((p) => p.id === params.id);

    if (!post) {
        return <div>投稿が見つかりません</div>;
    }

    return <p>{post.title}</p>;
}
