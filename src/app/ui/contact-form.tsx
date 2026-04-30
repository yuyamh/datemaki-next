"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ContactForm() {
    const [error, setError] = useState<null | string>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/contact", {
                body: JSON.stringify({
                    message,
                    subject,
                }),
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
                        message?: string[];
                        subject?: string[];
                    };
                };

                setError(
                    data?.errors?.subject?.[0] ??
                        data?.errors?.message?.[0] ??
                        data?.error ??
                        "お問い合わせの送信に失敗しました。",
                );
                return;
            }

            setSubject("");
            setMessage("");
            toast.success("お問い合わせを送信しました");
        } catch (error_) {
            console.error("Contact submit failed:", error_);
            setError("お問い合わせの送信に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="m-auto w-full md:w-2/3" onSubmit={handleSubmit}>
            <Card className="gap-8">
                <CardHeader>
                    <CardTitle className="text-xl">お問い合わせ</CardTitle>
                    <CardDescription>
                        サービスに関するご質問や不具合のご連絡はこちらから送信してください。
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="contact-subject">件名</Label>
                        <Input
                            disabled={isSubmitting}
                            id="contact-subject"
                            maxLength={120}
                            onChange={(event) => setSubject(event.target.value)}
                            required
                            value={subject}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact-message">
                            お問い合わせ内容
                        </Label>
                        <Textarea
                            className="min-h-48"
                            disabled={isSubmitting}
                            id="contact-message"
                            maxLength={5000}
                            onChange={(event) => setMessage(event.target.value)}
                            required
                            value={message}
                        />
                    </div>

                    {error ? (
                        <p className="text-sm text-red-600">{error}</p>
                    ) : null}

                    <Button
                        disabled={
                            isSubmitting ||
                            subject.trim().length === 0 ||
                            message.trim().length === 0
                        }
                        type="submit"
                    >
                        {isSubmitting ? "送信中..." : "送信する"}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
