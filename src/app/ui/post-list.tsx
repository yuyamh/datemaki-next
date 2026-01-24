"use client";

import type { Post } from "@/app/lib/interface/post";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Download } from "lucide-react";

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getPosts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/posts`, {
                cache: "no-store",
                method: "GET",
            });

            if (!res.ok) {
                throw new Error("教案の一覧取得に失敗しました。");
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const data: { posts: Post[] } = await res.json();

            setPosts(data.posts);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void getPosts();
    }, []);

    return (
        <>
            {isLoading ? (
                <div className="grid grid-cols-1 items-start justify-center gap-8 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <PostCardSkeleton key={i} />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div>まだ投稿されていません。教案を投稿してみましょう！</div>
            ) : (
                <div className="grid grid-cols-1 items-start justify-center gap-8 md:grid-cols-3">
                    {posts.map((post) => (
                        <Card className="col-span-1" key={post.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <h1>{post.title ?? "--"}</h1>
                                    <Bookmark />
                                </CardTitle>
                                <CardDescription></CardDescription>
                            </CardHeader>
                            <CardContent className="h-18">
                                <p className="line-clamp-4 overflow-hidden text-sm break-words text-ellipsis whitespace-pre-wrap">
                                    {post.description ?? "--"}
                                </p>
                            </CardContent>
                            <CardFooter className="flex flex-col text-sm text-gray-400">
                                <div className="mb-2 flex w-full items-center justify-between">
                                    <p>{post.user?.name ?? "--"}</p>
                                    <p>
                                        {new Date(
                                            post.updatedAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex flex-row">
                                        <div className="flex items-center justify-center pr-2">
                                            <Download size={16} />
                                            <p className="pl-1">
                                                {post.downloadCount}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {/* TODO: ブックマーク実装時にここも編集 */}
                                            <Bookmark size={16} />
                                            {/* <p className="pl-1">{post.bookmarkCount}</p> */}
                                        </div>
                                    </div>
                                    <Button asChild>
                                        <Link href={`/posts/${post.id}`}>
                                            詳細
                                        </Link>
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}

function PostCardSkeleton() {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                </CardTitle>
                <CardDescription>
                    <Skeleton className="mt-2 h-4 w-2/5" />
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-11/12" />
                <Skeleton className="mt-2 h-4 w-4/5" />
            </CardContent>
            <CardFooter className="flex flex-col text-sm text-gray-400">
                <div className="mb-2 flex w-full items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex w-full items-center justify-between">
                    <div className="flex flex-row">
                        <div className="flex items-center justify-center pr-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="ml-2 h-4 w-6" />
                        </div>
                        <div className="flex items-center justify-center">
                            <Skeleton className="h-4 w-4 rounded" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-20 rounded-md" />
                </div>
            </CardFooter>
        </Card>
    );
}
