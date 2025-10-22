"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewPost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ここで投稿を保存する処理を実装します（現在は仮の実装）
        console.log("New post:", { content, title });
        // 投稿一覧ページにリダイレクト
        router.push("/posts");
    };

    return (
        <div className="mx-auto w-10/12">
            <div className="my-6">
                <h1 className="text-3xl font-bold text-gray-700">
                    新しい教案を投稿
                </h1>
                <h2 className="my-3 text-gray-500">
                    作成した教案を共有して、フィードバックをもらいましょう！
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">基本情報</CardTitle>
                        <CardDescription>
                            教案の基本的な情報を入力してください
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="title">タイトル</Label>
                                <Input
                                    className="w-full rounded-lg border px-3 py-2"
                                    id="title"
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    type="text"
                                    value={title}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label className="mb-2 block" htmlFor="content">
                                    内容
                                </Label>
                                <textarea
                                    className="w-full rounded-lg border px-3 py-2"
                                    id="content"
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    rows={5}
                                    value={content}
                                ></textarea>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button onClick={() => router.back()} variant="outline">
                            キャンセル
                        </Button>
                        <Button type="submit">投稿する</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
