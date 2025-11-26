import type { Post } from "@/app/lib/interface/post";

export default function PostDetail({ post }: { post: Post }) {
    const createdDate = new Date(post.createdAt);
    const updatedDate = new Date(post.updatedAt);

    return (
        <article className="mx-auto max-w-2xl">
            <header>
                <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>
                <div className="mb-4 text-gray-600">
                    <span>By {post.user?.name}</span> •
                    <time dateTime={post.createdAt}>
                        {createdDate.toLocaleDateString()}
                    </time>
                    {post.updatedAt && updatedDate > createdDate && (
                        <span>
                            {" "}
                            • Updated:
                            <time dateTime={post.updatedAt}>
                                {updatedDate.toLocaleDateString()}
                            </time>
                        </span>
                    )}
                </div>
            </header>
            <div className="prose lg:prose-xl">
                {post.description?.split("\n").map(
                    (paragraph, index) =>
                        paragraph.trim() && (
                            <p className="mb-4" key={index}>
                                {paragraph}
                            </p>
                        ),
                )}
            </div>
        </article>
    );
}
