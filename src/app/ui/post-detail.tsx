"use client";

import type { PostDetailProps } from "@/app/lib/interfaces/post-detail";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, UserRound } from "lucide-react";
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

export function PostDetail({ post, sessionUserId }: PostDetailProps) {
    const router = useRouter();
    const isOwner = sessionUserId === post.user.id;

    const [isDeleting, setIsDeleting] = useState(false);

    // 削除処理
    const handleDelete = async () => {
        if (isDeleting) return; // 二重送信防止
        setIsDeleting(true);

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
            setIsDeleting(false);
        }
    };

    return (
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
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    {post.user?.avatar ? (
                        <Image
                            alt={post.user?.name ?? "user"}
                            className="object-cover"
                            fill
                            src={post.user.avatar}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">
                            <span className="font-semibold">
                                {(post.user?.name ?? "").slice(0, 1)}
                            </span>
                        </div>
                    )}
                </div>

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
                {/* 本文エリア */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <MarkdownContent content={post.description} />
                        </CardContent>
                        <CardFooter className="flex justify-between" />
                    </Card>

                    <div className="space-x-5 text-center">
                        <Button onClick={() => router.back()} variant="outline">
                            一覧に戻る
                        </Button>
                        {isOwner && (
                            <>
                                <Button
                                    onClick={() =>
                                        router.push(`/posts/${post.id}/edit`)
                                    }
                                    type="button"
                                >
                                    編集する
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            className="bg-red-600"
                                            disabled={isDeleting}
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
                                                disabled={isDeleting}
                                            >
                                                いいえ
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                disabled={isDeleting}
                                                onClick={handleDelete}
                                            >
                                                {isDeleting
                                                    ? "削除中..."
                                                    : "はい"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </div>
                </div>

                <div className="h-fit md:pt-0 lg:sticky lg:top-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">教案情報</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <dl className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-4 text-sm">
                                <dt className="text-slate-500">レベル</dt>
                                <dd className="font-medium text-slate-900">
                                    {String(post.level ?? "-")}
                                </dd>

                                <dt className="text-slate-500">使用テキスト</dt>
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
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-200">
                                        {post.user?.avatar ? (
                                            <Image
                                                alt={post.user?.name ?? "user"}
                                                className="object-cover"
                                                fill
                                                src={post.user.avatar}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-500">
                                                <span className="font-semibold">
                                                    {(
                                                        post.user?.name ?? ""
                                                    ).slice(0, 1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="font-semibold text-slate-900">
                                            {post.user?.name ?? "-"}
                                        </div>
                                        <div className="mt-1 text-sm text-slate-500">
                                            {post.user?.bio ?? ""}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() =>
                                        router.push(`/users/${post.user.id}`)
                                    }
                                    variant="outline"
                                >
                                    <UserRound className="mr-2 h-4 w-4" />
                                    プロフィールを見る
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
