"use client";

import { MarkdownContent } from "@/app/ui/markdown-content";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CircleHelp } from "lucide-react";

const MARKDOWN_HELP_ROWS = [
    {
        label: "見出し",
        preview: "# 見出し\n## 見出し\n### 見出し\n#### 見出し\n##### 見出し",
        syntax: "# 見出し\n## 見出し\n### 見出し\n#### 見出し\n##### 見出し",
    },
    {
        label: "リスト",
        preview: "- テキスト\n- テキスト\n- テキスト",
        syntax: "- テキスト\n- テキスト\n- テキスト",
    },
    {
        label: "引用",
        preview: "下記が引用です。\n> テキスト",
        syntax: "下記が引用です。\n> テキスト",
    },
    {
        label: "太字",
        preview: "**テキスト**",
        syntax: "**テキスト**\n__テキスト__",
    },
    {
        label: "斜体",
        preview: "*テキスト*",
        syntax: "*テキスト*\n_テキスト_",
    },
    {
        label: "取り消し線",
        preview: "~~テキスト~~",
        syntax: "~~テキスト~~",
    },
    {
        label: "水平線",
        preview: "***\n___\n---",
        syntax: "***\n___\n---",
    },
    {
        label: "リンク",
        preview: "[Google](https://google.com)",
        syntax: "[表示する文字](URL)\n例:\n[Google](https://google.com)",
    },
    {
        label: "表",
        preview:
            "|名前|学年|部活|\n|---|---|---|\n|健|2年|空手|\n|修宏|3年|サッカー|\n|きみ子|1年|ボランティア|",
        syntax: "|名前|学年|部活|\n|---|---|---|\n|健|2年|空手|\n|修宏|3年|サッカー|\n|きみ子|1年|ボランティア|\n\n|---|---|---| ← ヘッダと区切りを付けるための線",
    },
] as const;

export function MarkdownHelpDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    aria-label="マークダウンの書き方を見る"
                    className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-500 shadow-none hover:bg-slate-50 hover:text-slate-700"
                    size="icon-sm"
                    type="button"
                    variant="outline"
                >
                    <CircleHelp className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[85vh] overflow-hidden p-0">
                <div className="max-h-[85vh] overflow-y-auto px-4 py-4 pr-12 md:px-6 md:py-6 md:pr-14">
                    <DialogHeader className="gap-0">
                        <DialogTitle className="border-l-8 border-orange-400 pl-2 text-xl font-bold">
                            マークダウンとは？
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            マークダウンの基本的な書き方を確認できます。
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-6 text-sm md:text-base">
                        <div className="space-y-4">
                            <p className="px-1 leading-7 text-slate-700">
                                記号を入力するだけで、誰でも簡単に文章を修飾できる書き方です。
                                <br />
                                特定の記号を使用することで、太字や段落、リスト、リンク付きテキストなどを文章に簡単に盛り込むことができます。
                            </p>
                            <p className="leading-7 text-slate-700">
                                下記は、マークダウンでよく利用される記号の一例です。
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] table-fixed border-collapse border border-slate-200 text-left text-sm md:text-base">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="w-1/5 border border-slate-200 px-3 py-3 font-semibold">
                                            項目
                                        </th>
                                        <th className="w-2/5 border border-slate-200 px-3 py-3 font-semibold">
                                            書き方
                                        </th>
                                        <th className="w-2/5 border border-slate-200 px-3 py-3 font-semibold">
                                            表示
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {MARKDOWN_HELP_ROWS.map((row) => (
                                        <tr
                                            className="align-top"
                                            key={row.label}
                                        >
                                            <td className="border border-slate-200 px-3 py-3 font-medium whitespace-pre-wrap text-slate-800">
                                                {row.label}
                                            </td>
                                            <td className="border border-slate-200 px-3 py-3">
                                                <pre className="font-sans text-sm leading-7 whitespace-pre-wrap text-slate-700">
                                                    {row.syntax}
                                                </pre>
                                            </td>
                                            <td className="border border-slate-200 px-3 py-3">
                                                <MarkdownContent
                                                    className="space-y-2 text-sm [&_blockquote]:my-0 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_li]:leading-6 [&_ol]:space-y-1 [&_p]:leading-6 [&_table]:text-xs [&_td]:px-2 [&_td]:py-1 [&_th]:px-2 [&_th]:py-1 [&_ul]:space-y-1"
                                                    content={row.preview}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
