"use client";

import type {
    BookmarkResponse,
    BookmarkToggleButtonProps,
} from "@/app/lib/interfaces/bookmark";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

export function BookmarkToggleButton({
    className,
    initialIsBookmarked,
    postId,
    size = 18,
}: BookmarkToggleButtonProps) {
    const router = useRouter();
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [isPending, setIsPending] = useState(false);

    async function handleToggleBookmark() {
        if (isPending) {
            return;
        }

        setIsPending(true);

        try {
            const response = await fetch(`/api/bookmarks/${postId}`, {
                method: isBookmarked ? "DELETE" : "POST",
            });

            if (!response.ok) {
                let errorMessage = "ブックマークに失敗しました。";

                try {
                    const data = (await response.json()) as {
                        error?: string;
                    };
                    errorMessage = data.error ?? errorMessage;
                } catch {
                    // JSON を返さない失敗時は既定メッセージを使う
                }

                throw new Error(errorMessage);
            }

            const data = (await response.json()) as BookmarkResponse;
            setIsBookmarked(data.isBookmarked);
            router.refresh();

            toast.success(
                data.isBookmarked
                    ? "ブックマークに追加しました"
                    : "ブックマークを解除しました",
            );
        } catch (error) {
            console.error("Bookmark toggle failed:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "ブックマーク操作に失敗しました。",
            );
        } finally {
            setIsPending(false);
        }
    }

    return (
        <button
            aria-label={
                isBookmarked
                    ? "ブックマークを解除する"
                    : "ブックマークに追加する"
            }
            aria-pressed={isBookmarked}
            className={cn(
                "inline-flex items-center justify-center rounded-sm text-slate-400 transition-colors hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                className,
            )}
            disabled={isPending}
            onClick={handleToggleBookmark}
            type="button"
        >
            <Bookmark
                className={cn(
                    isBookmarked && "fill-orange-500 text-orange-500",
                )}
                size={size}
            />
        </button>
    );
}
