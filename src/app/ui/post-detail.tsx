"use client";

import type { Prisma } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

type PostWithUser = Prisma.PostGetPayload<{
    include: {
        textbook: {
            select: {
                name: true;
            };
        };
        user: {
            select: {
                avatar: true;
                bio: true;
                id: true;
                name: true;
            };
        };
    };
}>;

const formatYmd = (d: Date | null | string | undefined) =>
    d ? new Date(d).toLocaleDateString().slice(0, 10) : "-";

export function PostDetail({
    post,
    sessionUserId,
}: {
    post: PostWithUser;
    sessionUserId: string;
}) {
    const router = useRouter();
    const isOwner = sessionUserId === post.user.id;

    return (
        <div className="space-y-6">
            {/* タイトルは全幅 */}
            <h1 className="text-3xl font-bold">{post.title ?? "-"}</h1>
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
                        <CardContent className="pt-6 break-all whitespace-pre-wrap">
                            {post.description ?? null}
                        </CardContent>
                        <CardFooter className="flex justify-between" />
                    </Card>

                    <div className="space-x-5 text-center">
                        {isOwner && <Button type="button">編集する</Button>}
                        <Button onClick={() => router.back()} variant="outline">
                            一覧に戻る
                        </Button>
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
