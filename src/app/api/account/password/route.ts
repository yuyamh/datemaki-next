import { NextResponse } from "next/server";
import { AccountPasswordChangeInputSchema } from "@/app/lib/validations/account.schema";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";
import bcrypt from "bcryptjs";

// パスワード変更
export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // 一般ユーザー以外はパスワード変更不可
        if (session.user.role !== "user") {
            return NextResponse.json(
                { error: "このアカウントではパスワードを変更できません。" },
                { status: 403 },
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await request.json().catch(() => null);
        const result = AccountPasswordChangeInputSchema.safeParse(body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return NextResponse.json({ errors }, { status: 422 });
        }

        const currentUser = await prisma.user.findUnique({
            select: {
                hashedPassword: true,
                id: true,
                role: true,
            },
            where: {
                id: session.user.id,
            },
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません。" },
                { status: 404 },
            );
        }

        if (currentUser.role !== "user") {
            return NextResponse.json(
                { error: "このアカウントではパスワードを変更できません。" },
                { status: 403 },
            );
        }

        // 現在のパスワードが今のユーザーのパスワードと一致するか確認
        const isValidPassword = await bcrypt.compare(
            result.data.currentPassword,
            currentUser.hashedPassword,
        );

        // パスワードが一致しない場合はエラー
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "現在のパスワードが正しくありません。" },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(result.data.newPassword, 10);

        // パスワードを更新
        await prisma.user.update({
            data: {
                hashedPassword,
            },
            where: {
                id: currentUser.id,
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("パスワード変更失敗:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
