"use client";

import { useState } from "react";
import { PasswordInput } from "@/app/ui/password-input";
import {
    AlertDialog,
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
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { signOut } from "next-auth/react";

export function AccountDeleteCard() {
    const [error, setError] = useState<null | string>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState("");

    async function handleDeleteAccount(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (isDeleting) {
            return;
        }

        setError(null);
        setIsDeleting(true);

        try {
            // 退会処理
            const response = await fetch("/api/account", {
                body: JSON.stringify({ password }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "DELETE",
            });

            if (response.ok) {
                await signOut({ callbackUrl: "/" });
                return;
            }

            const data = (await response.json().catch(() => null)) as null | {
                error?: string;
                errors?: {
                    password?: string[];
                };
            };

            setError(
                data?.errors?.password?.[0] ??
                    data?.error ??
                    "退会処理に失敗しました。",
            );
        } catch (error_) {
            console.error("Account delete failed:", error_);
            setError("退会処理に失敗しました。");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Card className="border-red-200">
            <CardHeader>
                <CardTitle className="text-2xl text-red-700">退会</CardTitle>
                <CardDescription>
                    アカウントと投稿した教案を完全に削除します。
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                    退会すると、プロフィール、投稿した教案、コメント、ブックマークが削除されます。この操作は取り消せません。
                </p>

                <AlertDialog
                    onOpenChange={(open) => {
                        if (!open && !isDeleting) {
                            setError(null);
                            setPassword("");
                        }

                        setIsOpen(open);
                    }}
                    open={isOpen}
                >
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">
                            退会する
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <form
                            className="space-y-4"
                            onSubmit={handleDeleteAccount}
                        >
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    本当に退会しますか？
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    退会するには、現在のパスワードを入力してください。削除されたデータは復元できません。
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="space-y-2">
                                <Label htmlFor="delete-account-password">
                                    パスワード
                                </Label>
                                <PasswordInput
                                    autoComplete="current-password"
                                    disabled={isDeleting}
                                    id="delete-account-password"
                                    minLength={8}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                    value={password}
                                />
                                {error ? (
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                ) : null}
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    disabled={isDeleting}
                                    type="button"
                                >
                                    キャンセル
                                </AlertDialogCancel>
                                <Button
                                    disabled={isDeleting || password.length < 8}
                                    type="submit"
                                    variant="destructive"
                                >
                                    {isDeleting ? "退会中..." : "退会する"}
                                </Button>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
