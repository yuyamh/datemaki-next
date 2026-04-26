"use client";

import type { CommentListItem } from "@/app/lib/interfaces/comment";
import type { PostDetailProps } from "@/app/lib/interfaces/post-detail";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvatarImage } from "@/app/ui/avatar-image";
import { BookmarkToggleButton } from "@/app/ui/bookmark-toggle-button";
import { MarkdownContent } from "@/app/ui/markdown-content";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    CalendarDays,
    Download,
    FileArchive,
    FileChartPie,
    FileText,
    Image as ImageIcon,
    MoreHorizontal,
    UserRound,
} from "lucide-react";
import { toast } from "sonner";

// 日付のフォーマッタ
const formatYmd = (d: Date | null | string | undefined) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

export function PostDetail({
    activeTab,
    post,
    sessionUserId,
}: PostDetailProps) {
    const router = useRouter();
    const isOwner = sessionUserId === post.user.id;
    // 投稿者のロールが一般ユーザーの場合のみ、プロフィールへのリンクを表示する
    const canShowPublicProfile = post.user.role === "user";

    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<null | string>(
        null,
    );
    const [editingContent, setEditingContent] = useState("");
    const [isSavingComment, setIsSavingComment] = useState(false);
    const [commentToDelete, setCommentToDelete] =
        useState<CommentListItem | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);

    // 削除処理
    const handleDeletePost = async () => {
        if (isDeletingPost) return;
        setIsDeletingPost(true);

        try {
            const res = await fetch(`/api/posts/${post.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("教案を1件削除しました");
                router.push("/posts");
                router.refresh();
                return;
            }

            const text = await res.text();
            console.error("Delete failed:", res.status, text);
            toast.error(`教案削除に失敗しました（${res.status}）`);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("教案削除1件に失敗しました");
        } finally {
            setIsDeletingPost(false);
        }
    };

    // コメント投稿
    const handleNewComment = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (isSubmittingComment) {
            return;
        }

        setIsSubmittingComment(true);

        try {
            // コメントの投稿
            const response = await fetch("/api/comments", {
                body: JSON.stringify({
                    content: newCommentContent,
                    postId: post.id,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            });

            if (!response.ok) {
                throw new Error(
                    await getCommentErrorMessage(
                        response,
                        "コメントの投稿に失敗しました。",
                    ),
                );
            }

            // フォームをリセット
            setNewCommentContent("");
            router.refresh();
            toast.success("コメントを投稿しました");
        } catch (error) {
            console.error("Comment create failed:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "コメントの投稿に失敗しました。",
            );
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // コメント更新
    const handleUpdateComment = async () => {
        if (!editingCommentId || isSavingComment) {
            return;
        }

        setIsSavingComment(true);

        try {
            // コメントの更新
            const response = await fetch(`/api/comments/${editingCommentId}`, {
                body: JSON.stringify({
                    content: editingContent,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "PATCH",
            });

            if (!response.ok) {
                throw new Error(
                    await getCommentErrorMessage(
                        response,
                        "コメントの更新に失敗しました。",
                    ),
                );
            }

            setEditingCommentId(null);
            setEditingContent("");
            router.refresh();
            toast.success("コメントを更新しました");
        } catch (error) {
            console.error("Comment update failed:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "コメントの更新に失敗しました。",
            );
        } finally {
            setIsSavingComment(false);
        }
    };

    // コメント削除
    const handleDeleteComment = async () => {
        if (!commentToDelete || isDeletingComment) {
            return;
        }

        setIsDeletingComment(true);

        try {
            const response = await fetch(
                `/api/comments/${commentToDelete.id}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                throw new Error(
                    await getCommentErrorMessage(
                        response,
                        "コメントの削除に失敗しました。",
                    ),
                );
            }

            setCommentToDelete(null);
            router.refresh();
            toast.success("コメントを削除しました");
        } catch (error) {
            console.error("Comment delete failed:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "コメントの削除に失敗しました。",
            );
        } finally {
            setIsDeletingComment(false);
        }
    };

    return (
        <AlertDialog
            onOpenChange={(open) => {
                // モーダルが閉じられたときに削除対象のコメントをリセットする
                if (!open) {
                    setCommentToDelete(null);
                }
            }}
            open={commentToDelete !== null}
        >
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-bold">{post.title ?? "-"}</h1>
                    <BookmarkToggleButton
                        className="shrink-0"
                        initialIsBookmarked={post.isBookmarked}
                        postId={post.id}
                        size={22}
                    />
                </div>

                <div className="flex items-start gap-4">
                    <AvatarImage
                        alt={post.user?.name ?? "user"}
                        className="h-12 w-12"
                        fallbackText={post.user?.name ?? ""}
                        src={post.user?.avatar ?? null}
                    />

                    <div className="min-w-0">
                        <div className="leading-tight font-normal text-slate-900">
                            {post.user?.name ?? "-"}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-slate-500">
                            <CalendarDays className="h-4 w-4" />
                            <div className="text-sm leading-none font-normal">
                                {formatYmd(post.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <div className="inline-flex rounded-[10px] bg-slate-100 p-2 shadow-xs">
                            <Link
                                className={buildTabClasses({
                                    isActive: activeTab === "content",
                                })}
                                href={buildPostDetailTabUrl({
                                    postId: post.id,
                                    tab: "content",
                                })}
                            >
                                教案内容
                            </Link>
                            <Link
                                className={buildTabClasses({
                                    isActive: activeTab === "comments",
                                })}
                                href={buildPostDetailTabUrl({
                                    postId: post.id,
                                    tab: "comments",
                                })}
                            >
                                コメント（{post.commentsPagination.totalCount}）
                            </Link>
                        </div>

                        {activeTab === "content" ? (
                            <>
                                <Card>
                                    <CardContent>
                                        <MarkdownContent
                                            content={post.description}
                                        />
                                    </CardContent>
                                </Card>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-bold">
                                        添付ファイル
                                    </h2>
                                    {post.attachments.length > 0 ? (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {post.attachments.map(
                                                (attachment) => (
                                                    <Card key={attachment.slot}>
                                                        <CardContent className="flex items-center justify-between gap-4">
                                                            <div className="flex min-w-0 items-center gap-4">
                                                                <div className="shrink-0 rounded-xl bg-amber-50 p-4 text-orange-500">
                                                                    {renderAttachmentIcon(
                                                                        attachment.originalName,
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-lg font-medium text-slate-900">
                                                                        {
                                                                            attachment.originalName
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 text-base text-slate-500">
                                                                        {formatAttachmentSize(
                                                                            attachment.size,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                asChild
                                                                className="shrink-0"
                                                                size="icon-lg"
                                                                variant="outline"
                                                            >
                                                                <a
                                                                    aria-label={`${attachment.originalName} をダウンロード`}
                                                                    href={buildAttachmentDownloadUrl(
                                                                        {
                                                                            postId: post.id,
                                                                            slot: attachment.slot,
                                                                        },
                                                                    )}
                                                                >
                                                                    <Download className="h-6 w-6" />
                                                                </a>
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-base text-slate-500">
                                            添付ファイルはありません。
                                        </p>
                                    )}
                                </section>

                                <div className="space-x-5 text-center">
                                    <Button
                                        onClick={() => router.push("/posts")}
                                        variant="outline"
                                    >
                                        一覧に戻る
                                    </Button>
                                    {isOwner && (
                                        <>
                                            <Button
                                                onClick={() =>
                                                    router.push(
                                                        `/posts/${post.id}/edit`,
                                                    )
                                                }
                                                type="button"
                                            >
                                                編集する
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        className="bg-red-600"
                                                        disabled={
                                                            isDeletingPost
                                                        }
                                                        type="button"
                                                    >
                                                        削除する
                                                    </Button>
                                                </AlertDialogTrigger>

                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            この教案を削除しますか？
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            この操作は取り消せません。削除すると教案は完全に消えます。
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>

                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel
                                                            disabled={
                                                                isDeletingPost
                                                            }
                                                        >
                                                            いいえ
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            disabled={
                                                                isDeletingPost
                                                            }
                                                            onClick={
                                                                handleDeletePost
                                                            }
                                                        >
                                                            {isDeletingPost
                                                                ? "削除中..."
                                                                : "はい"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {post.comments.map((comment) => {
                                        const isCommentOwner =
                                            comment.user.id === sessionUserId;
                                        const isEditing =
                                            editingCommentId === comment.id;

                                        return (
                                            <Card key={comment.id}>
                                                <CardContent>
                                                    <div className="flex items-start gap-4">
                                                        <AvatarImage
                                                            alt={`${comment.user.name}のプロフィール画像`}
                                                            className="h-12 w-12 shrink-0"
                                                            fallbackText={
                                                                comment.user
                                                                    .name
                                                            }
                                                            src={
                                                                comment.user
                                                                    .avatar
                                                            }
                                                        />

                                                        <div className="min-w-0 flex-1 space-y-3">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <div className="font-semibold text-slate-900">
                                                                        {
                                                                            comment
                                                                                .user
                                                                                .name
                                                                        }
                                                                    </div>
                                                                    <div className="mt-1 text-sm text-slate-500">
                                                                        {formatYmd(
                                                                            comment.createdAt,
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {isCommentOwner ? (
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                aria-label="コメントメニューを開く"
                                                                                size="icon-sm"
                                                                                type="button"
                                                                                variant="ghost"
                                                                            >
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem
                                                                                onSelect={() => {
                                                                                    setEditingCommentId(
                                                                                        comment.id,
                                                                                    );
                                                                                    setEditingContent(
                                                                                        comment.content,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                編集
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onSelect={() =>
                                                                                    setCommentToDelete(
                                                                                        comment,
                                                                                    )
                                                                                }
                                                                                variant="destructive"
                                                                            >
                                                                                削除
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                ) : null}
                                                            </div>

                                                            {isEditing ? (
                                                                <div className="space-y-3">
                                                                    <Textarea
                                                                        className="min-h-28"
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setEditingContent(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        value={
                                                                            editingContent
                                                                        }
                                                                    />
                                                                    <div className="flex justify-end gap-3">
                                                                        <Button
                                                                            disabled={
                                                                                isSavingComment
                                                                            }
                                                                            onClick={() => {
                                                                                setEditingCommentId(
                                                                                    null,
                                                                                );
                                                                                setEditingContent(
                                                                                    "",
                                                                                );
                                                                            }}
                                                                            type="button"
                                                                            variant="outline"
                                                                        >
                                                                            キャンセル
                                                                        </Button>
                                                                        <Button
                                                                            disabled={
                                                                                isSavingComment
                                                                            }
                                                                            onClick={
                                                                                handleUpdateComment
                                                                            }
                                                                            type="button"
                                                                        >
                                                                            {isSavingComment
                                                                                ? "保存中..."
                                                                                : "保存"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-lg leading-9 break-words whitespace-pre-wrap text-slate-800">
                                                                    {
                                                                        comment.content
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}

                                    {post.comments.length === 0 ? (
                                        <div className="rounded-lg border border-slate-200 px-6 py-12 text-center text-slate-500">
                                            まだコメントはありません。
                                        </div>
                                    ) : null}
                                </div>

                                {post.commentsPagination.totalCount > 0 ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-sm text-gray-500">
                                            {post.commentsPagination.totalCount}
                                            件中{" "}
                                            {(post.commentsPagination
                                                .currentPage -
                                                1) *
                                                post.commentsPagination
                                                    .pageSize +
                                                1}
                                            {" - "}
                                            {Math.min(
                                                post.commentsPagination
                                                    .currentPage *
                                                    post.commentsPagination
                                                        .pageSize,
                                                post.commentsPagination
                                                    .totalCount,
                                            )}
                                            件を表示
                                        </p>

                                        <Pagination className="mx-0 w-auto">
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        aria-disabled={
                                                            !post
                                                                .commentsPagination
                                                                .hasPreviousPage
                                                        }
                                                        className={
                                                            post
                                                                .commentsPagination
                                                                .hasPreviousPage
                                                                ? undefined
                                                                : "pointer-events-none opacity-50"
                                                        }
                                                        href={buildPostDetailTabUrl(
                                                            {
                                                                page: post
                                                                    .commentsPagination
                                                                    .hasPreviousPage
                                                                    ? post
                                                                          .commentsPagination
                                                                          .currentPage -
                                                                      1
                                                                    : post
                                                                          .commentsPagination
                                                                          .currentPage,
                                                                postId: post.id,
                                                                tab: "comments",
                                                            },
                                                        )}
                                                        tabIndex={
                                                            post
                                                                .commentsPagination
                                                                .hasPreviousPage
                                                                ? undefined
                                                                : -1
                                                        }
                                                    />
                                                </PaginationItem>

                                                <PaginationItem>
                                                    <span className="px-3 text-sm text-slate-500">
                                                        {
                                                            post
                                                                .commentsPagination
                                                                .currentPage
                                                        }{" "}
                                                        /{" "}
                                                        {
                                                            post
                                                                .commentsPagination
                                                                .totalPages
                                                        }
                                                    </span>
                                                </PaginationItem>

                                                <PaginationItem>
                                                    <PaginationNext
                                                        aria-disabled={
                                                            !post
                                                                .commentsPagination
                                                                .hasNextPage
                                                        }
                                                        className={
                                                            post
                                                                .commentsPagination
                                                                .hasNextPage
                                                                ? undefined
                                                                : "pointer-events-none opacity-50"
                                                        }
                                                        href={buildPostDetailTabUrl(
                                                            {
                                                                page: post
                                                                    .commentsPagination
                                                                    .hasNextPage
                                                                    ? post
                                                                          .commentsPagination
                                                                          .currentPage +
                                                                      1
                                                                    : post
                                                                          .commentsPagination
                                                                          .currentPage,
                                                                postId: post.id,
                                                                tab: "comments",
                                                            },
                                                        )}
                                                        tabIndex={
                                                            post
                                                                .commentsPagination
                                                                .hasNextPage
                                                                ? undefined
                                                                : -1
                                                        }
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                ) : null}

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-2xl">
                                            コメントを追加
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form
                                            className="space-y-4"
                                            onSubmit={handleNewComment}
                                        >
                                            <Textarea
                                                className="min-h-48"
                                                onChange={(event) =>
                                                    setNewCommentContent(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="コメントを入力してください"
                                                value={newCommentContent}
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    disabled={
                                                        isSubmittingComment
                                                    }
                                                    type="submit"
                                                >
                                                    {isSubmittingComment
                                                        ? "投稿中..."
                                                        : "コメントを投稿"}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="text-center">
                                    <Button
                                        onClick={() => router.push("/posts")}
                                        variant="outline"
                                    >
                                        一覧に戻る
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-fit md:pt-0 lg:sticky lg:top-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    教案情報
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <dl className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-4 text-sm">
                                    <dt className="text-slate-500">レベル</dt>
                                    <dd className="font-medium text-slate-900">
                                        {String(post.level ?? "-")}
                                    </dd>

                                    <dt className="text-slate-500">
                                        使用テキスト
                                    </dt>
                                    <dd className="font-medium text-slate-900">
                                        {post.textbook?.name ?? "-"}
                                    </dd>

                                    <dt className="text-slate-500">作成日</dt>
                                    <dd className="font-medium text-slate-900">
                                        {formatYmd(post.createdAt)}
                                    </dd>

                                    <dt className="text-slate-500">更新日</dt>
                                    <dd className="font-medium text-slate-900">
                                        {formatYmd(post.updatedAt)}
                                    </dd>

                                    <dt className="text-slate-500">閲覧数</dt>
                                    <dd className="font-medium text-slate-900">
                                        {post.viewCount ?? "-"}
                                    </dd>

                                    <dt className="text-slate-500">
                                        ブックマーク数
                                    </dt>
                                    <dd className="font-medium text-slate-900">
                                        {post.bookmarkCount ?? "-"}
                                    </dd>

                                    <dt className="text-slate-500">
                                        ダウンロード数
                                    </dt>
                                    <dd className="font-medium text-slate-900">
                                        {post.downloadCount ?? "-"}
                                    </dd>
                                </dl>

                                <Separator />

                                <div className="space-y-5">
                                    <div className="text-lg font-semibold">
                                        作成者情報
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <AvatarImage
                                            alt={post.user?.name ?? "user"}
                                            className="h-12 w-12"
                                            fallbackText={post.user?.name ?? ""}
                                            src={post.user?.avatar ?? null}
                                        />

                                        <div className="min-w-0">
                                            <div className="font-semibold text-slate-900">
                                                {post.user?.name ?? "-"}
                                            </div>
                                            <div className="mt-1 text-sm leading-7 whitespace-pre-wrap text-slate-500">
                                                {post.user?.bio ?? ""}
                                            </div>
                                        </div>
                                    </div>

                                    {canShowPublicProfile && (
                                        <Button
                                            className="w-full"
                                            onClick={() =>
                                                router.push(
                                                    `/users/${post.user.id}`,
                                                )
                                            }
                                            variant="outline"
                                        >
                                            <UserRound className="mr-2 h-4 w-4" />
                                            プロフィールを見る
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        このコメントを削除しますか？
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        この操作は取り消せません。削除するとコメントは完全に消えます。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeletingComment}>
                        いいえ
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isDeletingComment}
                        onClick={handleDeleteComment}
                    >
                        {isDeletingComment ? "削除中..." : "はい"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// 教案の添付ファイルをダウンロードするURLを生成する
function buildAttachmentDownloadUrl({
    postId,
    slot,
}: {
    postId: string;
    slot: 1 | 2 | 3;
}) {
    return `/api/posts/${postId}/files/${slot}`;
}

// 教案詳細のタブ切り替え用URLを生成する
function buildPostDetailTabUrl({
    page,
    postId,
    tab,
}: {
    page?: number;
    postId: string;
    tab: PostDetailProps["activeTab"];
}) {
    const pathname = `/posts/${postId}`;

    // タブが「内容」の場合はクエリパラメータを付与しない
    if (tab === "content") {
        return pathname;
    }

    // タブが「コメント」の場合はクエリパラメータを付与する
    const searchParams = new URLSearchParams({
        tab: "comments",
    });

    if (page && page > 1) {
        searchParams.set("page", String(page));
    }

    return `${pathname}?${searchParams.toString()}`;
}

function buildTabClasses({ isActive }: { isActive: boolean }) {
    return isActive
        ? "rounded-[10px] bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm"
        : "rounded-[10px] px-5 py-3 text-slate-400 hover:text-slate-500";
}

function formatAttachmentSize(size: null | number) {
    if (!size) {
        return "- MB";
    }

    if (size >= 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
    }

    if (size >= 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${size} B`;
}

// ファイル名から拡張子を取得する
function getAttachmentExtension(fileName: string) {
    return fileName.split(".").pop()?.toLowerCase() ?? "";
}

// コメント関連の処理に失敗した場合に表示するエラーメッセージを取得する
async function getCommentErrorMessage(
    response: Response,
    fallbackMessage: string,
) {
    try {
        const data = (await response.json()) as {
            error?: string;
            errors?: {
                content?: string[];
            };
        };

        return data.errors?.content?.[0] ?? data.error ?? fallbackMessage;
    } catch {
        return fallbackMessage;
    }
}

// 添付ファイルのアイコンを表示する
function renderAttachmentIcon(fileName: string) {
    // ファイル名から拡張子を取得する
    const extension = getAttachmentExtension(fileName);

    if (extension === "pdf") {
        return <FileText className="h-8 w-8" />;
    }

    if (extension === "jpeg" || extension === "jpg" || extension === "png") {
        return <ImageIcon className="h-8 w-8" />;
    }

    if (extension === "zip") {
        return <FileArchive className="h-8 w-8" />;
    }

    if (
        extension === "ppt" ||
        extension === "pptx" ||
        extension === "xls" ||
        extension === "xlsx"
    ) {
        return <FileChartPie className="h-8 w-8" />;
    }

    return <FileText className="h-8 w-8" />;
}
