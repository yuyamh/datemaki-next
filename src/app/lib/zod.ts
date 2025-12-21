import { z } from "zod/v4";
import ja from "zod/v4/locales/ja.js";

// zodのバリデーションエラーメッセージを日本語化
z.config(ja());

export { z } from "zod/v4";
