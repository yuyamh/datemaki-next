export interface ContactMailInput {
    email: string;
    message: string;
    name: string;
    role: string;
    subject: string;
}

export interface PasswordResetMailInput {
    email: string;
    name: string;
    token: string;
}

export interface SendMailInput {
    html: string;
    replyTo?: string;
    subject: string;
    text: string;
    to: string | string[];
}
