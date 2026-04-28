// URLを取得する関数
export function getBaseUrl() {
    // TODO: ドメイン設定後に設定
    //   if (process.env.NEXT_PUBLIC_BASE_URL) {
    //     return process.env.NEXT_PUBLIC_BASE_URL;
    //   }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return "http://localhost:3000";
}
