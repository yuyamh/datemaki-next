// app/signup/page.tsx
"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/app/ui/password-input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState<null | string>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const form = e.currentTarget;
        const name = (form.elements.namedItem("name") as HTMLInputElement)
            .value;
        const email = (form.elements.namedItem("email") as HTMLInputElement)
            .value;
        const password = (
            form.elements.namedItem("password") as HTMLInputElement
        ).value;

        try {
            // 1. サインアップ API にユーザー作成リクエスト
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const data = await res.json().catch(() => null);

                setError(
                    (data as null | { error?: string })?.error ??
                        "ユーザー登録に失敗しました",
                );
                setLoading(false);
                return;
            }

            // 2. 作成したユーザーでそのままログイン
            const signInRes = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (signInRes?.error) {
                // 一応エラーハンドリング
                setError(
                    "ユーザー登録は成功しましたが、ログインに失敗しました",
                );
                setLoading(false);
                return;
            }

            // 3. 教案一覧に遷移
            router.push("/posts");
            router.refresh();
        } catch (error_) {
            console.error(error_);
            setError("ネットワークエラーが発生しました");
            setLoading(false);
        }
    }

    return (
        <form className="m-auto w-full md:w-1/2" onSubmit={handleSubmit}>
            <Card className="gap-12">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl">
                        <h1>新規登録</h1>
                    </CardTitle>
                    <CardDescription></CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    <label className="flex flex-col gap-1">
                        <span>名前</span>
                        <input
                            autoComplete="username"
                            className="rounded border px-3 py-2"
                            name="name"
                            required
                            type="text"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span>メールアドレス</span>
                        <input
                            autoComplete="email"
                            className="rounded border px-3 py-2"
                            name="email"
                            required
                            type="email"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span>パスワード</span>
                        <PasswordInput
                            autoComplete="new-password"
                            className="rounded border px-3 py-2"
                            minLength={8}
                            name="password"
                            required
                        />
                    </label>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </CardContent>

                <CardFooter className="flex flex-col">
                    <Button
                        className="w-full md:w-3/4"
                        disabled={loading}
                        type="submit"
                    >
                        {loading ? "登録中..." : "登録する"}
                    </Button>

                    <p className="my-6 flex flex-col items-center text-sm">
                        すでにアカウントをお持ちの場合{" "}
                        <a
                            className="my-2 text-blue-600 underline"
                            href="/login"
                        >
                            ログインはこちら
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </form>
    );
}
