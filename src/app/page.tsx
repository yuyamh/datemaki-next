// src/app/page.tsx
import Link from "next/link";
import {
    Bookmark,
    BookOpen,
    Clock,
    Download,
    FileText,
    ListFilter,
    Search,
    Share2,
    UserPlus,
} from "lucide-react";

const lessonSearchLinks = [
    {
        description: "文型や活動名など、授業で扱いたい内容から探せます。",
        href: "/posts",
        icon: <Search className="h-5 w-5 text-orange-600" />,
        title: "キーワードで探す",
    },
    {
        description: "A1からC2まで、学習者のレベルに合わせて絞り込めます。",
        href: "/posts",
        icon: <ListFilter className="h-5 w-5 text-orange-600" />,
        title: "レベルで絞り込む",
    },
    {
        description: "使用しているテキストに合う教案を見つけやすくなります。",
        href: "/posts",
        icon: <BookOpen className="h-5 w-5 text-orange-600" />,
        title: "使用テキストで探す",
    },
    {
        description: "多くの先生に保存されている教案を優先して確認できます。",
        href: "/posts?sort=bookmarks_desc",
        icon: <Bookmark className="h-5 w-5 text-orange-600" />,
        title: "ブックマーク順で見る",
    },
];

export default function Page() {
    return (
        <div className="relative right-1/2 left-1/2 -mt-8 -mr-[50vw] -mb-8 -ml-[50vw] w-screen">
            <main>
                {/* Hero */}
                <section className="bg-[#F7F1E6]">
                    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                                日本語教師のための 教案共有プラットフォーム
                            </h1>

                            <p className="text-md mt-3 text-slate-600 sm:text-base">
                                <span className="italic">
                                    <span className="text-orange-500">Da</span>
                                    tabase for{" "}
                                    <span className="text-orange-500">Te</span>
                                    achers{" "}
                                    <span className="text-orange-500">
                                        Maki
                                    </span>
                                    ng Japanese Lessons
                                </span>
                            </p>

                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
                                教案作成の負担を減らし、より質の高い授業のために。
                                <br className="hidden sm:block" />
                                教案を共有し、アイデアを交換しましょう。
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    className="inline-flex h-11 w-full items-center justify-center rounded-md bg-orange-500 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 sm:w-auto"
                                    href="/posts"
                                >
                                    始めてみる
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                だてまきの特徴
                            </h2>
                            <p className="mt-3 text-sm text-slate-600 sm:text-base">
                                日本語教師の皆さんの授業準備をサポートする機能が充実
                            </p>
                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
                            <FeatureCard
                                description="作成した教案をアップロードして他の教師と共有できます。PDFなどのファイル形式に対応。"
                                icon={
                                    <FileText className="h-5 w-5 text-orange-600" />
                                }
                                title="教案の共有"
                            />
                            <FeatureCard
                                description="キーワード、レベル、使用テキストで必要な教案をすぐに見つけられます。"
                                icon={
                                    <Search className="h-5 w-5 text-orange-600" />
                                }
                                title="簡単検索"
                            />
                            <FeatureCard
                                description="他の教師が作成した教案を活用することで、授業準備の時間を大幅に短縮できます。"
                                icon={
                                    <Clock className="h-5 w-5 text-orange-600" />
                                }
                                title="時間の節約"
                            />
                        </div>
                    </div>
                </section>

                <section className="bg-white">
                    <div className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                条件に合わせて教案を探す
                            </h2>
                            <p className="mt-3 text-sm text-slate-600 sm:text-base">
                                授業内容や学習者に合わせて、必要な教案へすばやくアクセスできます
                            </p>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {lessonSearchLinks.map((item) => (
                                <Link
                                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/40"
                                    href={item.href}
                                    key={item.title}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                                        {item.icon}
                                    </div>
                                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {item.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                だてまきの使い方
                            </h2>
                            <p className="mt-3 text-sm text-slate-600 sm:text-base">
                                簡単3ステップで始められます
                            </p>
                        </div>

                        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
                            <StepCard
                                description="メールアドレスで簡単に登録できます。日本語教師としての情報を入力してプロフィールを作成しましょう。"
                                icon={<UserPlus className="h-7 w-7" />}
                                step={1}
                                title="アカウント登録"
                            />
                            <StepCard
                                description="作成した教案をアップロードし、レベルや使用テキストを設定して他の教師と共有しましょう。"
                                icon={<Share2 className="h-7 w-7" />}
                                step={2}
                                title="教案を共有"
                            />
                            <StepCard
                                description="他の教師が共有した教案を検索し、ダウンロードして授業に活用しましょう。"
                                icon={<Download className="h-7 w-7" />}
                                step={3}
                                title="教案を活用"
                            />
                        </div>

                        <div className="mt-10 flex justify-center">
                            <Link
                                className="inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600"
                                href="/signup"
                            >
                                今すぐ始める
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="bg-orange-500">
                    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
                        <div className="text-center text-white">
                            <h2 className="text-2xl font-bold sm:text-3xl">
                                日本語教育の輪を広げましょう
                            </h2>
                            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base">
                                あなたの教案が、他の教師の授業を助け、学習者の日本語学習をサポートします。
                                今すぐ登録して、だてまきコミュニティに参加しましょう。
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-orange-600 shadow-sm transition hover:bg-white/90 sm:w-auto"
                                    href="/signup"
                                >
                                    無料アカウント作成
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function FeatureCard(props: {
    description: string;
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                {props.icon}
            </div>
            <h3 className="mt-4 text-center text-base font-semibold text-slate-900">
                {props.title}
            </h3>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
                {props.description}
            </p>
        </div>
    );
}

function StepCard(props: {
    description: string;
    icon: React.ReactNode;
    step: number;
    title: string;
}) {
    return (
        <div className="text-center">
            <div className="relative mx-auto inline-flex">
                {/* 丸いアイコン背景 */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    {props.icon}
                </div>

                {/* 右上の数字バッジ */}
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-semibold text-white ring-4 ring-white">
                    {props.step}
                </span>
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
                {props.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {props.description}
            </p>
        </div>
    );
}
