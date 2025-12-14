import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { loginSchema } from "@/app/lib/validations/login";
import { prisma } from "@/server/db/prisma/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        return NextResponse.json({ errors }, { status: 422 });
    }

    const { name, email, password } = result.data;

    // 既存ユーザー確認
    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        return NextResponse.json(
            { error: "このメールアドレスはすでに登録されています" },
            { status: 400 },
        );
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword,
            role: "user",
        },
    });

    return NextResponse.json(
        { id: user.id, email: user.email },
        { status: 201 },
    );
}
