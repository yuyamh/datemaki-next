import type {
    ContactMailInput,
    PasswordResetMailInput,
    SendMailInput,
} from "@/app/lib/interfaces/mail";
import { getBaseUrl } from "@/app/actions/get-base-url";
import { env } from "@/env";
import { Resend } from "resend";

let resendClient: null | Resend = null;

// お問い合わせメールを送信
export async function sendContactMail({
    email,
    message,
    name,
    role,
    subject,
}: ContactMailInput) {
    if (!env.CONTACT_TO_EMAIL) {
        throw new Error("CONTACT_TO_EMAIL is not configured.");
    }

    const displaySubject = subject.trim();

    await sendMail({
        html: [
            "<p>だてまきにお問い合わせが届きました。</p>",
            "<dl>",
            `<dt>送信者</dt><dd>${escapeHtml(name)} (${escapeHtml(email)})</dd>`,
            `<dt>ロール</dt><dd>${escapeHtml(role)}</dd>`,
            `<dt>件名</dt><dd>${escapeHtml(displaySubject)}</dd>`,
            "</dl>",
            "<hr />",
            `<p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>`,
        ].join(""),
        replyTo: email,
        subject: `【だてまき】お問い合わせ: ${displaySubject}`,
        text: [
            "だてまきにお問い合わせが届きました。",
            "",
            `送信者: ${name} (${email})`,
            `ロール: ${role}`,
            `件名: ${displaySubject}`,
            "",
            message,
        ].join("\n"),
        to: env.CONTACT_TO_EMAIL,
    });
}

// パスワードリセットメールを送信
export async function sendPasswordResetMail({
    email,
    name,
    token,
}: PasswordResetMailInput) {
    const resetUrl = `${getBaseUrl()}/password-reset?token=${encodeURIComponent(token)}`;
    const escapedName = escapeHtml(name);
    const escapedResetUrl = escapeHtml(resetUrl);

    await sendMail({
        html: [
            `<p>${escapedName}さん</p>`,
            "<p>だてまきのパスワード再設定を受け付けました。</p>",
            `<p><a href="${escapedResetUrl}">パスワードを再設定する</a></p>`,
            "<p>このリンクの有効期限は30分です。心当たりがない場合は、このメールを破棄してください。</p>",
        ].join(""),
        subject: "【だてまき】パスワード再設定のご案内",
        text: [
            `${name}さん`,
            "",
            "だてまきのパスワード再設定を受け付けました。",
            "以下のURLからパスワードを再設定してください。",
            resetUrl,
            "",
            "このリンクの有効期限は30分です。心当たりがない場合は、このメールを破棄してください。",
        ].join("\n"),
        to: email,
    });
}

// HTMLエスケープ
function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// メール送信
async function sendMail({ html, replyTo, subject, text, to }: SendMailInput) {
    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
        throw new Error("Resend settings are not configured.");
    }

    resendClient ??= new Resend(env.RESEND_API_KEY);

    const { data, error } = await resendClient.emails.send({
        from: env.RESEND_FROM_EMAIL,
        html,
        replyTo,
        subject,
        text,
        to,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
