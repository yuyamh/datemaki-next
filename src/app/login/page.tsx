"use client";

import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";

// useSearchParamsを使用する場合は、Suspenseでラップする必要がある
export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginPageInner />
        </Suspense>
    );
}

function LoginPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<null | string>(null);
    const [isGuestSigningIn, setIsGuestSigningIn] = useState(false);

    // ログイン後に戻すパス（なければ /posts ）
    const redirectTo = searchParams.get("redirectTo") ?? "/posts";

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement)
            .value;
        const password = (
            form.elements.namedItem("password") as HTMLInputElement
        ).value;

        const res = await signIn("credentials", {
            redirect: false, // 自前でリダイレクトするため false
            email,
            password,
        });

        if (res?.error) {
            setError("メールアドレスまたはパスワードが正しくありません。");
            return;
        }

        router.push(redirectTo);
        router.refresh(); // サーバーコンポーネント側の session を更新
        toast.success("ログインしました");
    }

    // ゲストユーザーとしてのログイン処理
    async function handleGuestSignIn() {
        setError(null);
        setIsGuestSigningIn(true);

        const res = await signIn("guest", {
            redirect: false,
        });

        if (res?.error) {
            setIsGuestSigningIn(false);
            setError("ゲストログインに失敗しました。");
            return;
        }

        router.push(redirectTo);
        router.refresh();
        toast.success("ゲストユーザーでログインしました");
    }

    return (
        <form className="m-auto w-full md:w-1/2" onSubmit={handleSubmit}>
            <Card className="gap-12">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl">
                        <h1>ログイン</h1>
                    </CardTitle>
                    <CardDescription></CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
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
                            autoComplete="current-password"
                            className="rounded border px-3 py-2"
                            name="password"
                            required
                        />
                    </label>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button className="w-full md:w-3/4" type="submit">
                        ログイン
                    </Button>
                    <Button
                        className="mt-3 w-full bg-amber-300 text-black hover:bg-amber-200 focus:ring-amber-300 disabled:pointer-events-none disabled:opacity-50 md:w-3/4"
                        disabled={isGuestSigningIn}
                        onClick={handleGuestSignIn}
                        type="button"
                    >
                        {isGuestSigningIn
                            ? "ゲストログイン中..."
                            : "ゲストユーザーでログインする"}
                    </Button>
                    <p className="my-6 flex flex-col items-center text-sm">
                        アカウントをお持ちでない場合{" "}
                        <a
                            className="my-2 text-blue-600 underline"
                            href="/signup"
                        >
                            新規登録はこちら
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </form>
    );
}
