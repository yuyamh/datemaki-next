import { NextResponse } from "next/server";
import { PasswordResetRequestInputSchema } from "@/app/lib/validations/password-reset.schema";
import { prisma } from "@/server/db/prisma/prisma";
import { sendPasswordResetMail } from "@/server/mail";
import { createPasswordResetToken } from "@/server/password-reset-token";

// トークンの有効期限は30分、
const PASSWORD_RESET_EXPIRES_IN_MS = 30 * 60 * 1000;
// 再送信のクールダウンは5分に設定(スパム防止)
const PASSWORD_RESET_RESEND_COOLDOWN_MS = 5 * 60 * 1000;

// パスワードリセット用のメール送信リクエスト
export async function POST(request: Request) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await request.json().catch(() => null);
        const result = PasswordResetRequestInputSchema.safeParse(body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return NextResponse.json({ errors }, { status: 422 });
        }

        // ユーザーを検索
        const user = await prisma.user.findFirst({
            select: {
                email: true,
                id: true,
                name: true,
                role: true,
            },
            where: {
                email: {
                    equals: result.data.email,
                    mode: "insensitive",
                },
            },
        });

        // ユーザーが存在しない場合、または一般ユーザではない場合も、成功レスポンスを返す（存在確認を防ぐため）
        if (!user || user.role !== "user") {
            return NextResponse.json({ ok: true });
        }

        const now = new Date();
        const cooldownStart = new Date(
            now.getTime() - PASSWORD_RESET_RESEND_COOLDOWN_MS,
        );
        // 5分以内に発行されたトークンがあるか確認
        // あれば何もしないで終了(同じ人にメール送りすぎないため)
        const existingRecentToken = await prisma.passwordResetToken.findFirst({
            select: {
                id: true,
            },
            where: {
                createdAt: {
                    // クールダウン期間内に作成されたトークンがあるか
                    gte: cooldownStart,
                },
                expiresAt: {
                    gt: now,
                },
                userId: user.id,
            },
        });

        if (existingRecentToken) {
            return NextResponse.json({ ok: true });
        }

        // 新しいトークンを作成
        const { token, tokenHash } = createPasswordResetToken();
        const expiresAt = new Date(
            now.getTime() + PASSWORD_RESET_EXPIRES_IN_MS,
        );
        const resetToken = await prisma.$transaction(async (tx) => {
            // 古いトークンを削除（使い回し防止）
            await tx.passwordResetToken.deleteMany({
                where: {
                    userId: user.id,
                },
            });

            // 新しいトークンをDBに保存（30分有効）
            return tx.passwordResetToken.create({
                data: {
                    expiresAt,
                    tokenHash,
                    userId: user.id,
                },
                select: {
                    id: true,
                },
            });
        });

        try {
            // パスワードリセットメールを送信
            await sendPasswordResetMail({
                email: user.email,
                name: user.name,
                token,
            });
        } catch (error) {
            console.error("パスワードリセットメール送信失敗:", error);
            // メール送信に失敗した場合、作ったトークンを削除
            await prisma.passwordResetToken
                .delete({
                    where: {
                        id: resetToken.id,
                    },
                })
                .catch((deleteError: unknown) => {
                    console.error(
                        "送信失敗後のパスワードリセットトークン削除失敗:",
                        deleteError,
                    );
                });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("パスワードリセット申請失敗:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
