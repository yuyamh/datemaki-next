import type { PostListProps } from "@/app/lib/interfaces/post-list";
import Link from "next/link";
import { BookmarkToggleButton } from "@/app/ui/bookmark-toggle-button";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Bookmark, Download } from "lucide-react";

export default function PostList({ pagination, posts }: PostListProps) {
    return (
        <>
            {posts.length === 0 ? (
                <div>まだ投稿されていません。教案を投稿してみましょう！</div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 items-start justify-center gap-8 md:grid-cols-3">
                        {posts.map((post) => (
                            <Card className="col-span-1" key={post.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <CardTitle className="min-w-0 flex-1">
                                            {post.title ?? "--"}
                                        </CardTitle>
                                        <BookmarkToggleButton
                                            className="shrink-0"
                                            initialIsBookmarked={
                                                post.isBookmarked
                                            }
                                            postId={post.id}
                                            size={24}
                                        />
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
                                        <p>{post.user?.name ?? "--"}</p>
                                        <p>
                                            {new Date(
                                                post.updatedAt,
                                            ).toLocaleDateString("ja-JP", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })}
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
                                                <Bookmark
                                                    className="text-gray-400"
                                                    size={16}
                                                />
                                                <p className="pl-1">
                                                    {post.bookmarkCount}
                                                </p>
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

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-gray-500">
                            {pagination.totalCount}件中{" "}
                            {(pagination.currentPage - 1) *
                                pagination.pageSize +
                                1}
                            {" - "}
                            {Math.min(
                                pagination.currentPage * pagination.pageSize,
                                pagination.totalCount,
                            )}
                            件を表示
                        </p>

                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        aria-disabled={
                                            !pagination.hasPreviousPage
                                        }
                                        className={
                                            pagination.hasPreviousPage
                                                ? undefined
                                                : "pointer-events-none opacity-50"
                                        }
                                        href={getPostsPageUrl(
                                            pagination.hasPreviousPage
                                                ? pagination.currentPage - 1
                                                : pagination.currentPage,
                                        )}
                                        tabIndex={
                                            pagination.hasPreviousPage
                                                ? undefined
                                                : -1
                                        }
                                        text="前へ"
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <span className="px-3 text-sm text-gray-500">
                                        {pagination.currentPage} /{" "}
                                        {Math.max(pagination.totalPages, 1)}
                                    </span>
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationNext
                                        aria-disabled={!pagination.hasNextPage}
                                        className={
                                            pagination.hasNextPage
                                                ? undefined
                                                : "pointer-events-none opacity-50"
                                        }
                                        href={getPostsPageUrl(
                                            pagination.hasNextPage
                                                ? pagination.currentPage + 1
                                                : pagination.currentPage,
                                        )}
                                        tabIndex={
                                            pagination.hasNextPage
                                                ? undefined
                                                : -1
                                        }
                                        text="次へ"
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}
        </>
    );
}

function getPostsPageUrl(page: number) {
    return page <= 1 ? "/posts" : `/posts?page=${page}`;
}
