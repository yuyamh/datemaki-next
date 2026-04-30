import { NextResponse } from "next/server";
import { PasswordResetConfirmInputSchema } from "@/app/lib/validations/password-reset.schema";
import { prisma } from "@/server/db/prisma/prisma";
import { hashPasswordResetToken } from "@/server/password-reset-token";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await request.json().catch(() => null);
        const result = PasswordResetConfirmInputSchema.safeParse(body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return NextResponse.json({ errors }, { status: 422 });
        }

        // トークンをハッシュ化してDBから検索
        const tokenHash = hashPasswordResetToken(result.data.token);
        // トークンの有効性とユーザーの存在を確認
        const resetToken = await prisma.passwordResetToken.findUnique({
            select: {
                expiresAt: true,
                user: {
                    select: {
                        role: true,
                    },
                },
                userId: true,
            },
            where: {
                tokenHash,
            },
        });

        // 以下の条件の場合はエラー
        // - トークンが見つからない
        // - トークンが期限切れ
        // - トークンに紐づくユーザーが一般ユーザーでない
        if (
            !resetToken ||
            resetToken.expiresAt <= new Date() ||
            resetToken.user.role !== "user"
        ) {
            return NextResponse.json(
                { error: "リンクが無効、または期限切れです。" },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(result.data.password, 10);

        // パスワードを更新し、使用済みのトークンを削除（トランザクションでまとめて実行）
        await prisma.$transaction([
            prisma.user.update({
                data: {
                    hashedPassword,
                },
                where: {
                    id: resetToken.userId,
                },
            }),
            prisma.passwordResetToken.deleteMany({
                where: {
                    userId: resetToken.userId,
                },
            }),
        ]);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("パスワードリセット確定失敗:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
