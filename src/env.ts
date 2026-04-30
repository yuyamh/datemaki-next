import { z } from "@/app/lib/zod";
import { createEnv } from "@t3-oss/env-nextjs";

// env に書いた変数を「型付き」で安全に扱う
//「どの変数がサーバー用？」「どれがブラウザで見えていい？」を明示する
export const env = createEnv({
    // 1. client: ブラウザで使っていい変数(ブラウザで見えてもOK)
    client: {
        /**
         * Supabase の匿名キー
         */
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
        /**
         * Supabase の URL
         */
        NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    },
    // .env に空文字 ("") が書いてあっても、それを「空文字」ではなく「未定義（undefined）」として扱う
    emptyStringAsUndefined: true,
    // 2. runtimeEnv: 実際に環境変数を読み込む場所
    // createEnv() がこれを使って、「ちゃんと型に合ってる？」をチェック
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        APP_BASE_URL: process.env.APP_BASE_URL,
        CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
        DEBUG_MESSAGE: process.env.DEBUG_MESSAGE,
        DIRECT_URL: process.env.DIRECT_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        VERCEL_URL: process.env.VERCEL_URL,
    },
    // 3. server: サーバーだけで使う変数
    server: {
        /**
         * メール内リンク生成に使うアプリケーションURL
         */
        APP_BASE_URL: z.string().url().optional(),
        /**
         * お問い合わせ通知の宛先メールアドレス
         */
        CONTACT_TO_EMAIL: z.email().optional(),
        /**
         * Prisma Client がデータベースへ接続するためのデータベース接続先
         */
        DATABASE_URL: z.string().url(),
        /**
         * テスト用のメッセージ
         */
        DEBUG_MESSAGE: z.string(),
        /**
         * Prisma CLI がデータベースの操作をするためのデータベース接続先
         */
        DIRECT_URL: z.string().url(),
        /**
         * 環境
         */
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),
        /**
         * Resend APIキー
         */
        RESEND_API_KEY: z.string().optional(),
        /**
         * Resendの送信元メールアドレス
         */
        RESEND_FROM_EMAIL: z.string().optional(),
        /**
         * サーバー経由でSupabase Storageを操作するための秘密鍵
         */
        SUPABASE_SERVICE_ROLE_KEY: z.string(),
        /**
         * VERCEL_URL はVercelが自動でセットしてくれる「システム環境変数」なので、自分で「設定」する必要はなし
         */
        VERCEL_URL: z.string().optional(),
    },
    // CI や特殊な環境で「今はチェックいらない！」というときに使う
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
