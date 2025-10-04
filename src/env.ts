import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// env に書いた変数を「型付き」で安全に扱う
//「どの変数がサーバー用？」「どれがブラウザで見えていい？」を明示する
export const env = createEnv({
    // 1. client: ブラウザで使っていい変数(ブラウザで見えてもOK)
    client: {
        // NEXT_PUBLIC_CLIENTVAR: z.string(),
    },
    // .env に空文字 ("") が書いてあっても、それを「空文字」ではなく「未定義（undefined）」として扱う
    emptyStringAsUndefined: true,
    // 2. runtimeEnv: 実際に環境変数を読み込む場所
    // createEnv() がこれを使って、「ちゃんと型に合ってる？」をチェック
    runtimeEnv: {
        DEBUG_MESSAGE: process.env.DEBUG_MESSAGE,
        NODE_ENV: process.env.NODE_ENV,
        // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
    },
    // 3. server: サーバーだけで使う変数
    server: {
        /**
         * テスト用のメッセージ
         */
        DEBUG_MESSAGE: z.string(),
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
