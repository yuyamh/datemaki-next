"use client";

import type { MarkdownContentProps } from "@/app/lib/interfaces/markdown-content";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({
    className,
    content,
    emptyMessage = "まだ内容がありません。",
}: MarkdownContentProps) {
    if (!content?.trim()) {
        return <p className="text-sm text-slate-500">{emptyMessage}</p>;
    }

    return (
        <div
            className={cn(
                "space-y-4 text-sm leading-7 break-words text-slate-900",
                className,
            )}
        >
            <ReactMarkdown
                components={{
                    a: ({ ...props }) => (
                        <a
                            className="font-medium text-orange-600 underline underline-offset-4 hover:text-orange-700"
                            rel="noreferrer"
                            target="_blank"
                            {...props}
                        />
                    ),
                    blockquote: ({ ...props }) => (
                        <blockquote
                            className="border-l-4 border-slate-300 pl-4 text-slate-600 italic"
                            {...props}
                        />
                    ),
                    code: ({
                        children,
                        className: codeClassName,
                        ...props
                    }) => {
                        const isInlineCode = !codeClassName;

                        if (isInlineCode) {
                            return (
                                <code
                                    className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.875em]"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code
                                className={cn(
                                    "block overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100",
                                    codeClassName,
                                )}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    h1: ({ ...props }) => (
                        <h1
                            className="text-3xl leading-tight font-bold text-slate-950"
                            {...props}
                        />
                    ),
                    h2: ({ ...props }) => (
                        <h2
                            className="text-2xl leading-tight font-semibold text-slate-950"
                            {...props}
                        />
                    ),
                    h3: ({ ...props }) => (
                        <h3
                            className="text-xl leading-tight font-semibold text-slate-950"
                            {...props}
                        />
                    ),
                    hr: ({ ...props }) => (
                        <hr className="border-slate-200" {...props} />
                    ),
                    img: ({ alt, src, ...props }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            alt={alt ?? ""}
                            className="h-auto max-w-full rounded-lg border border-slate-200"
                            src={src}
                            {...props}
                        />
                    ),
                    li: ({ ...props }) => (
                        <li className="leading-7" {...props} />
                    ),
                    ol: ({ ...props }) => (
                        <ol
                            className="list-decimal space-y-2 pl-6"
                            {...props}
                        />
                    ),
                    p: ({ ...props }) => (
                        <p className="leading-7 text-slate-800" {...props} />
                    ),
                    pre: ({ ...props }) => (
                        <pre className="overflow-x-auto" {...props} />
                    ),
                    table: ({ ...props }) => (
                        <div className="overflow-x-auto">
                            <table
                                className="w-full border-collapse text-left text-sm"
                                {...props}
                            />
                        </div>
                    ),
                    td: ({ ...props }) => (
                        <td
                            className="border border-slate-200 px-3 py-2"
                            {...props}
                        />
                    ),
                    th: ({ ...props }) => (
                        <th
                            className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold"
                            {...props}
                        />
                    ),
                    ul: ({ ...props }) => (
                        <ul className="list-disc space-y-2 pl-6" {...props} />
                    ),
                }}
                remarkPlugins={[remarkGfm]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
