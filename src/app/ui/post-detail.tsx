"use client";

import type { Post } from "@/app/lib/interface/post";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function PostDetail({ post }: { post: Post }) {
    // const createdDate = new Date(post.createdAt);
    // const updatedDate = new Date(post.updatedAt);

    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">{post.title ?? "-"}</CardTitle>
                <CardDescription>教案の詳細</CardDescription>
            </CardHeader>
            <CardContent>a</CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={() => router.back()} variant="outline">
                    一覧に戻る
                </Button>
                {/* <Button type="submit">編集する</Button> */}
            </CardFooter>
        </Card>
    );
}
