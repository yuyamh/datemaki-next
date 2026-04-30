import Link from "next/link";

const FOOTER_LINKS = [
    {
        href: "/contact",
        label: "お問い合わせ",
    },
    {
        href: "/privacy-policy",
        label: "プライバシーポリシー",
    },
    {
        href: "/terms",
        label: "利用規約",
    },
] as const;

export function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-orange-100">
            <div className="container mx-auto flex flex-col gap-6 px-4 py-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <p className="text-2xl font-bold tracking-tight text-orange-500">
                        だてまき
                    </p>
                    <p className="text-sm text-slate-500">
                        日本語教師のための教案共有プラットフォーム
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 md:justify-end md:text-base">
                    {FOOTER_LINKS.map((link) => (
                        <Link
                            className="transition-colors hover:text-slate-700 hover:underline"
                            href={link.href}
                            key={link.label}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <span className="whitespace-nowrap md:ml-12">
                        &copy; 2026 だてまき
                    </span>
                </div>
            </div>
        </footer>
    );
}
