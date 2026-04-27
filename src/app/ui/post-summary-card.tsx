import type { PublicUserPostListItem } from "@/app/lib/interfaces/user-list";
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
import { Bookmark, Download, MessageSquareText } from "lucide-react";

export function PostSummaryCard({ post }: { post: PublicUserPostListItem }) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="min-w-0 flex-1">
                        {post.title ?? "--"}
                    </CardTitle>
                    <Bookmark className="shrink-0 text-gray-400" size={24} />
                </div>
                <CardDescription></CardDescription>
            </CardHeader>

            <CardContent className="h-18">
                <p className="line-clamp-4 overflow-hidden text-sm break-words text-ellipsis whitespace-pre-wrap">
                    {post.description ?? "--"}
                </p>
            </CardContent>

            <CardFooter className="flex flex-col text-sm text-gray-400">
                <div className="mb-2 flex w-full items-center justify-between">
                    <p>{post.authorName}</p>
                    <p>
                        {new Date(post.updatedAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                        })}
                    </p>
                </div>

                <div className="flex w-full items-end justify-between gap-3">
                    <div className="flex min-w-0 flex-row flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center justify-center">
                            <Download size={16} />
                            <p className="pl-1">{post.downloadCount}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <Bookmark className="text-gray-400" size={16} />
                            <p className="pl-1">{post.bookmarkCount}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <MessageSquareText size={16} />
                            <p className="pl-1">{post.commentCount}</p>
                        </div>
                    </div>

                    <Button asChild className="shrink-0" size="sm">
                        <Link href={`/posts/${post.id}`}>詳細を見る</Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
