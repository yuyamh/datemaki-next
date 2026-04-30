import { createHash, randomBytes } from "node:crypto";

// リセットトークンを生成する
export function createPasswordResetToken() {
    const token = randomBytes(32).toString("base64url");

    return {
        token,
        tokenHash: hashPasswordResetToken(token),
    };
}

// トークンをハッシュ化（DB保存用）
export function hashPasswordResetToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}
