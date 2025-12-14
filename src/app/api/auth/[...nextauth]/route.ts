// NextAuth用のAPI一式
import { handlers } from "@/auth";

// /api/auth/* に来たリクエストを全部 NextAuth に丸投げする
export const { GET, POST } = handlers;
