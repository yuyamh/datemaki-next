"use client";

import type { Prisma } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

type PostWithUser = Prisma.PostGetPayload<{
    include: {
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

export function PostDetail({
    post,
    sessionUserId,
}: {
    post: PostWithUser;
    sessionUserId: string;
}) {
    // const createdDate = new Date(post.createdAt);
    // const updatedDate = new Date(post.updatedAt);

    const router = useRouter();

    const isOwner = sessionUserId === post.user.id;

    return (
        <div className="space-y-8">
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
                        <CalendarDays />
                        <div className="text-sm leading-none font-normal">
                            {post.createdAt
                                ? new Date(post.createdAt)
                                      .toISOString()
                                      .slice(0, 10)
                                : "-"}
                        </div>
                    </div>
                </div>
            </div>
            <Card>
                <CardContent>{post.description ?? null}</CardContent>
                <CardFooter className="flex justify-between"></CardFooter>
            </Card>
            <div className="space-x-5 text-center">
                {isOwner && <Button type="button">編集する</Button>}
                <Button onClick={() => router.back()} variant="outline">
                    一覧に戻る
                </Button>
            </div>
        </div>
    );
}
