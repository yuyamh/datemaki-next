import type { User } from "@/app/lib/interfaces/user";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/server/db/prisma/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authConfig: NextAuthConfig = {
    session: {
        strategy: "jwt", // セッションの仕組みとしてJWTを使うという宣言（トークン（JWT）に情報を詰めてクライアントに持たせる方式）
        maxAge: 60 * 60 * 2, // 有効期限：2時間（7200秒）
        updateAge: 60 * 30, // その間隔でアクセスがあった場合に有効期限を30分伸ばす
    },

    // カスタムログインページのパス
    pages: {
        signIn: "/login",
    },

    providers: [
        // Credentials：「ID・パスワードでログインしたい」時に使うプロバイダ
        Credentials({
            name: "Email & Password",
            credentials: {
                email: { label: "メールアドレス", type: "email" },
                password: { label: "パスワード", type: "password" },
            },
            async authorize(credentials) {
                // 型を絞る
                if (
                    !credentials ||
                    typeof credentials.email !== "string" ||
                    typeof credentials.password !== "string"
                ) {
                    return null;
                }
                const email = credentials?.email;
                const password = credentials?.password;

                if (!email || !password) {
                    return null;
                }

                // 1. メールアドレスからユーザーを検索
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user?.hashedPassword) {
                    // ユーザーがいない or パスワード未設定
                    return null;
                }

                // 2. 入力されたパスワードと、DB に保存されているハッシュを比較
                const isValid = await bcrypt.compare(
                    password,
                    user.hashedPassword,
                );

                // 一致しなければ null → 認証失敗
                if (!isValid) {
                    return null;
                }

                // 3. ここで返したオブジェクトが JWT / session.user に入り、「認証済みユーザー」として扱われる
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],

    // JWT が作られるとき or 更新されるときに呼ばれる関数
    callbacks: {
        // JWT の中身を調整
        async jwt({ token, user }) {
            // 初回ログイン時だけuserが入ってくるので、そのとき token に格納
            // JWT（暗号化されたトークン）の中にユーザーID•ロール（権限）が保存されて、以降のリクエストで使用可能になる
            // 2回目以降のリクエストはuser は渡ってこず、tokenをそのまま返すだけ
            if (user) {
                const u = user as Pick<User, "id" | "role">;
                token.id = u.id;
                token.role = u.role;
            }
            return token;
        },

        // クライアントや auth() に返す session の形を調整
        // クライアント側の useSession() や、auth() を呼び出したときに、「どんな形のsessionを返すか」をここで決めている
        async session({ session, token }) {
            if (session.user) {
                const u = session.user as {
                    id?: string;
                    role?: User["role"];
                };

                u.id = token.id as string;
                u.role = token.role as User["role"];
            }
            return session;
        },
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
