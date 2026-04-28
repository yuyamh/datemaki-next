"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                {...props}
                className={cn("pr-12", className)}
                type={isPasswordVisible ? "text" : "password"}
            />

            <button
                aria-label={
                    isPasswordVisible
                        ? "パスワードを非表示にする"
                        : "パスワードを表示する"
                }
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition-colors hover:text-slate-700"
                onClick={() => setIsPasswordVisible((current) => !current)} // 今のstateの状態をひっくり返す
                type="button"
            >
                {isPasswordVisible ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
