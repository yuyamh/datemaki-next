"use client";

import { useState } from "react";
import { PasswordInput } from "@/app/ui/password-input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// パスワード変更用UI
export function PasswordChangeCard() {
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [error, setError] = useState<null | string>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("確認用パスワードが一致しません。");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/account/password", {
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "PATCH",
            });

            if (!response.ok) {
                const data = (await response
                    .json()
                    .catch(() => null)) as null | {
                    error?: string;
                    errors?: {
                        currentPassword?: string[];
                        newPassword?: string[];
                    };
                };

                setError(
                    data?.errors?.currentPassword?.[0] ??
                        data?.errors?.newPassword?.[0] ??
                        data?.error ??
                        "パスワードの変更に失敗しました。",
                );
                return;
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("パスワードを変更しました");
        } catch (error_) {
            console.error("Password change failed:", error_);
            setError("パスワードの変更に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">パスワード変更</CardTitle>
                <CardDescription>
                    現在のパスワードを確認して、新しいパスワードに変更します。
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="current-password">
                            現在のパスワード
                        </Label>
                        <PasswordInput
                            autoComplete="current-password"
                            disabled={isSubmitting}
                            id="current-password"
                            minLength={8}
                            onChange={(event) =>
                                setCurrentPassword(event.target.value)
                            }
                            required
                            value={currentPassword}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile-new-password">
                            新しいパスワード
                        </Label>
                        <PasswordInput
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            id="profile-new-password"
                            minLength={8}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            required
                            value={newPassword}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile-new-password-confirm">
                            新しいパスワード（確認）
                        </Label>
                        <PasswordInput
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            id="profile-new-password-confirm"
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

                    <Button
                        disabled={
                            isSubmitting ||
                            currentPassword.length < 8 ||
                            newPassword.length < 8 ||
                            confirmPassword.length < 8
                        }
                        type="submit"
                    >
                        {isSubmitting ? "変更中..." : "パスワードを変更"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
