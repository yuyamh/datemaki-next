import { NextResponse } from "next/server";
import { ContactInputSchema } from "@/app/lib/validations/contact.schema";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma/prisma";
import { sendContactMail } from "@/server/mail";

// お問い合わせ送信
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await request.json().catch(() => null);
        const result = ContactInputSchema.safeParse(body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return NextResponse.json({ errors }, { status: 422 });
        }

        const currentUser = await prisma.user.findUnique({
            select: {
                email: true,
                name: true,
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

        // お問い合わせメールを送信
        await sendContactMail({
            email: currentUser.email,
            message: result.data.message,
            name: currentUser.name,
            role: currentUser.role,
            subject: result.data.subject,
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("お問い合わせ送信失敗:", error);

        return NextResponse.json(
            { error: "お問い合わせの送信に失敗しました。" },
            { status: 500 },
        );
    }
}
