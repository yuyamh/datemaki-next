import type { Post } from "./post";

// テキスト（textbooks）の型指定
export interface Textbook {
    id: string;
    name: string;
    posts?: Post[];
}
