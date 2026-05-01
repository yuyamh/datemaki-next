"use client";

import type { PasswordResetFormProps } from "@/app/lib/interfaces/password-reset";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PasswordResetForm({ token }: PasswordResetFormProps) {
    // tokenがあればパスワード再設定フォーム、なければ再設定メール送信フォーム（設定するのに）を表示
    return token ? (
        // api/password-reset/confirmにPOSTするフォームを表示
        <PasswordResetConfirmForm token={token} />
    ) : (
        // api/password-reset/requestにPOSTするフォームを表示
        <PasswordResetRequestForm />
    );
}

// パスワード再設定の確認用フォーム
function PasswordResetConfirmForm({ token }: Required<PasswordResetFormProps>) {
    const router = useRouter();
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<null | string>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [password, setPassword] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        // eslint-disable-next-line security/detect-possible-timing-attacks
        if (password !== confirmPassword) {
            setError("確認用パスワードが一致しません。");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/password-reset/confirm", {
                body: JSON.stringify({ password, token }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            });

            if (!response.ok) {
                const data = (await response
                    .json()
                    .catch(() => null)) as null | {
                    error?: string;
                    errors?: {
                        password?: string[];
                        token?: string[];
                    };
                };

                setError(
                    data?.errors?.password?.[0] ??
                        data?.errors?.token?.[0] ??
                        data?.error ??
                        "パスワードの再設定に失敗しました。",
                );
                return;
            }

            toast.success("パスワードを再設定しました");
            router.push("/login");
            router.refresh();
        } catch (error_) {
            console.error("Password reset confirm failed:", error_);
            setError("パスワードの再設定に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="m-auto w-full md:w-1/2" onSubmit={handleSubmit}>
            <Card className="gap-8">
                <CardHeader>
                    <CardTitle className="text-xl">
                        新しいパスワードを設定
                    </CardTitle>
                    <CardDescription>
                        8文字以上の新しいパスワードを入力してください。
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">新しいパスワード</Label>
                        <PasswordInput
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            id="new-password"
                            minLength={8}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                            value={password}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-password-confirm">
                            新しいパスワード（確認）
                        </Label>
                        <PasswordInput
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            id="new-password-confirm"
                            minLength={8}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            required
                            value={confirmPassword}
                        />
                    </div>

                    {error ? (
                        <p className="text-sm text-red-600">{error}</p>
                    ) : null}
                </CardContent>

                <CardFooter>
                    <Button
                        className="w-full"
                        disabled={
                            isSubmitting ||
                            password.length < 8 ||
                            confirmPassword.length < 8
                        }
                        type="submit"
                    >
                        {isSubmitting ? "再設定中..." : "パスワードを再設定"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

// パスワード再設定のメール送信用フォーム
function PasswordResetRequestForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<null | string>(null);
    const [isSent, setIsSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/password-reset/request", {
                body: JSON.stringify({ email }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            });

            if (!response.ok) {
                const data = (await response
                    .json()
                    .catch(() => null)) as null | {
                    error?: string;
                    errors?: {
                        email?: string[];
                    };
                };

                setError(
                    data?.errors?.email?.[0] ??
                        data?.error ??
                        "送信に失敗しました。",
                );
                return;
            }

            setIsSent(true);
        } catch (error_) {
            console.error("Password reset request failed:", error_);
            setError("送信に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="m-auto w-full md:w-1/2" onSubmit={handleSubmit}>
            <Card className="gap-8">
                <CardHeader>
                    <CardTitle className="text-xl">パスワード再設定</CardTitle>
                    <CardDescription>
                        登録済みのメールアドレス宛に再設定リンクを送信します。
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="password-reset-email">
                            メールアドレス
                        </Label>
                        <Input
                            autoComplete="email"
                            disabled={isSubmitting || isSent}
                            id="password-reset-email"
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            type="email"
                            value={email}
                        />
                    </div>

                    {isSent ? (
                        <p className="text-sm leading-6 text-slate-600">
                            入力されたメールアドレスが登録済みの場合、再設定リンクを送信しました。
                        </p>
                    ) : null}
                    {error ? (
                        <p className="text-sm text-red-600">{error}</p>
                    ) : null}
                </CardContent>

                <CardFooter className="mt-6">
                    <Button
                        className="mx-auto w-full md:w-3/4"
                        disabled={isSubmitting || isSent}
                        type="submit"
                    >
                        {isSubmitting ? "送信中..." : "再設定リンクを送信"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
