import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

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
        DEBUG_MESSAGE: process.env.DEBUG_MESSAGE,
        DIRECT_URL: process.env.DIRECT_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
    },
    // 3. server: サーバーだけで使う変数
    server: {
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
    },
    // CI や特殊な環境で「今はチェックいらない！」というときに使う
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
