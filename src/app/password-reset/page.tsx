import type { PasswordResetPageProps } from "@/app/lib/interfaces/password-reset";
import { PasswordResetForm } from "@/app/ui/password-reset-form";

export default async function PasswordResetPage({
    searchParams, // 新しいパスワード設定画面で受け取る（メール送信後）
}: PasswordResetPageProps) {
    const resolvedSearchParams = await searchParams;
    const token = Array.isArray(resolvedSearchParams.token)
        ? resolvedSearchParams.token[0]
        : resolvedSearchParams.token;

    return <PasswordResetForm token={token} />;
}
