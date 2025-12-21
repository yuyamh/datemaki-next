"use client";

import type { Textbook } from "@/app/lib/interface/textbook";
import { useEffect, useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type FieldErrors = Partial<
    Record<"description" | "level" | "textbookId" | "title", string[]>
>;

export function PostForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState("");
    const [textbookId, setTextbookId] = useState("");
    const [textbookList, setTextbookList] = useState<Textbook[]>([]);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({}); // 前回のエラーを消す

        const response = await fetch("/api/posts", {
            body: JSON.stringify({
                title,
                description,
                level: level || null,
                textbookId: textbookId || null,
            }),
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });

        if (response.ok) {
            // 教案一覧画面にリダイレクト
            router.push("/posts");
            router.refresh();
            toast.success("教案が作成されました");
            return;
        }

        if (response.status === 422) {
            const data = (await response.json()) as { errors?: FieldErrors };
            setFieldErrors(data.errors ?? {});
            return;
        }

        toast.error("教案登録に失敗しました。再度登録してください。");
    };

    const getTextbooks = async () => {
        const res = await fetch(`/api/textbooks`, {
            cache: "no-store",
            method: "GET",
        });

        if (!res.ok) {
            throw new Error("使用テキストの取得に失敗しました。");
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: { textbooks: Textbook[] } = await res.json();
        setTextbookList(data.textbooks);
    };

    useEffect(() => {
        void getTextbooks();
    }, []);

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">基本情報</CardTitle>
                    <CardDescription>
                        教案の基本的な情報を入力してください
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4 space-y-2">
                        <div className="flex flex-col space-y-3">
                            <Label htmlFor="title">タイトル</Label>
                            <Input
                                className="w-full rounded-lg border px-3 py-2"
                                id="title"
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        title: undefined,
                                    })); // 入力されたらエラーだけ消す
                                }}
                                placeholder="例：「〜てもいいです」の導入"
                                required
                                type="text"
                                value={title}
                            />
                            {fieldErrors.title?.[0] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldErrors.title[0]}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label className="mb-2 block" htmlFor="description">
                                概要
                            </Label>
                            <Textarea
                                className="min-h-[400px] w-full rounded-lg border px-3 py-2"
                                id="description"
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        description: undefined,
                                    }));
                                }}
                                placeholder="教案の説明を記入しましょう"
                                required
                                rows={20}
                                value={description}
                            ></Textarea>
                            {fieldErrors.description?.[0] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldErrors.description[0]}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label className="mb-2 block" htmlFor="level">
                                レベル
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    setLevel(value);
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        level: undefined,
                                    }));
                                }}
                                value={level}
                            >
                                <SelectTrigger className="w-2/6">
                                    <SelectValue placeholder="CEFR 基準" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>レベル</SelectLabel>
                                        <SelectItem value="A1">A1</SelectItem>
                                        <SelectItem value="A2">A2</SelectItem>
                                        <SelectItem value="B1">B1</SelectItem>
                                        <SelectItem value="B2">B2</SelectItem>
                                        <SelectItem value="C1">C1</SelectItem>
                                        <SelectItem value="C2">C2</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {fieldErrors.level?.[0] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldErrors.level[0]}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label className="mb-2 block" htmlFor="level">
                                使用テキスト
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    setTextbookId(value);
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        textbookId: undefined,
                                    }));
                                }}
                                value={textbookId}
                            >
                                <SelectTrigger className="w-2/6">
                                    <SelectValue placeholder="使用テキストを選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>テキスト名</SelectLabel>
                                        {textbookList.map((t: Textbook) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {fieldErrors.textbookId?.[0] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldErrors.textbookId[0]}
                                </p>
                            )}
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
    );
}
