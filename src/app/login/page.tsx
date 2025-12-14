"use client";

import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    }

    return (
        <form className="m-auto md:w-1/2" onSubmit={handleSubmit}>
            <Card className="gap-10">
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
                        <input
                            autoComplete="current-password"
                            className="rounded border px-3 py-2"
                            name="password"
                            required
                            type="password"
                        />
                    </label>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button className="w-full" type="submit">
                        ログイン
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
