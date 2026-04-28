import type { UserProfileDetailProps } from "@/app/lib/interfaces/user-list";
import Link from "next/link";
import { AvatarImage } from "@/app/ui/avatar-image";
import { PostSummaryCard } from "@/app/ui/post-summary-card";
import { UserProfilePostsToolbar } from "@/app/ui/user-profile-posts-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { CalendarDays, FilePenLine, FileText } from "lucide-react";

const DEFAULT_USER_BIO = "自己紹介はまだ登録されていません。";

export function UserProfileDetail({
    activeTab,
    canEditProfile,
    filters,
    profile,
}: UserProfileDetailProps) {
    return (
        <div className="px-2 pb-10 sm:px-4 md:px-6">
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <Card className="h-fit border-slate-200 shadow-sm">
                    <CardHeader className="space-y-6 pb-4">
                        <div className="flex flex-col items-center gap-5 text-center">
                            <AvatarImage
                                alt={`${profile.user.name}のプロフィール画像`}
                                className="h-28 w-28"
                                fallbackText={profile.user.name}
                                src={profile.user.avatar}
                            />
                            <CardTitle className="text-4xl">
                                {profile.user.name}
                            </CardTitle>
                            <p className="text-base leading-8 break-words whitespace-pre-wrap text-slate-700">
                                {profile.user.bio ?? DEFAULT_USER_BIO}
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                <span>登録日</span>
                            </div>
                            <span>{formatYmd(profile.user.createdAt)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>教案数</span>
                            </div>
                            <span>{profile.user.postCount} 件</span>
                        </div>

                        {canEditProfile ? (
                            <Button asChild className="mt-6 w-full">
                                <Link href="/profile/edit">
                                    <FilePenLine className="mr-2 h-4 w-4" />
                                    プロフィールを編集
                                </Link>
                            </Button>
                        ) : null}
                    </CardContent>
                </Card>

                <div className="space-y-5">
                    <div className="inline-flex rounded-[10px] bg-slate-100 p-2 shadow-xs">
                        <Link
                            className={cn(
                                "rounded-[10px] px-5 py-3 text-lg font-semibold transition-all duration-150",
                                activeTab === "posts"
                                    ? "bg-white text-slate-700 shadow-sm"
                                    : "text-slate-400 hover:text-slate-500",
                            )}
                            href={buildUserProfileTabUrl({
                                filters,
                                page: profile.pagination.currentPage,
                                tab: "posts",
                                userId: profile.user.id,
                            })}
                        >
                            投稿した教案 ({profile.user.postCount})
                        </Link>
                        <Link
                            className={cn(
                                "rounded-[10px] px-5 py-3 text-lg",
                                activeTab === "details"
                                    ? "bg-white font-semibold text-slate-700 shadow-sm"
                                    : "text-slate-400 hover:text-slate-500",
                            )}
                            href={buildUserProfileTabUrl({
                                filters,
                                page: 1,
                                tab: "details",
                                userId: profile.user.id,
                            })}
                        >
                            詳細情報
                        </Link>
                    </div>

                    {activeTab === "details" ? (
                        <Card className="border-slate-200 py-10 shadow-sm">
                            <CardHeader className="space-y-8">
                                <CardTitle className="text-4xl font-bold text-slate-950">
                                    プロフィール詳細
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-12">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        自己紹介
                                    </h2>
                                    <p className="text-lg leading-10 break-words whitespace-pre-wrap text-slate-800">
                                        {profile.user.bio ?? DEFAULT_USER_BIO}
                                    </p>
                                </section>

                                <section className="space-y-5">
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        活動統計
                                    </h2>

                                    <div className="grid gap-5 lg:grid-cols-3">
                                        <StatsCard
                                            label="投稿した教案"
                                            value={profile.user.postCount.toString()}
                                        />
                                        <StatsCard
                                            label="総ダウンロード数"
                                            value={profile.stats.totalDownloadCount.toString()}
                                        />
                                        <StatsCard
                                            label="総ブックマーク数"
                                            value={profile.stats.totalBookmarkCount.toString()}
                                        />
                                    </div>
                                </section>
                            </CardContent>
                        </Card>
                    ) : (
                        <section className="space-y-5">
                            <UserProfilePostsToolbar filters={filters} />

                            {profile.posts.length === 0 ? (
                                <div className="px-6 py-16 text-center text-slate-500">
                                    まだ教案は投稿されていません。
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {profile.posts.map((post) => (
                                            <PostSummaryCard
                                                key={post.id}
                                                post={post}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-sm text-gray-500">
                                            {profile.pagination.totalCount}件中{" "}
                                            {(profile.pagination.currentPage -
                                                1) *
                                                profile.pagination.pageSize +
                                                1}
                                            {" - "}
                                            {Math.min(
                                                profile.pagination.currentPage *
                                                    profile.pagination.pageSize,
                                                profile.pagination.totalCount,
                                            )}
                                            件を表示
                                        </p>

                                        <Pagination className="mx-0 w-auto">
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        aria-disabled={
                                                            !profile.pagination
                                                                .hasPreviousPage
                                                        }
                                                        className={
                                                            profile.pagination
                                                                .hasPreviousPage
                                                                ? undefined
                                                                : "pointer-events-none opacity-50"
                                                        }
                                                        href={buildUserProfilePageUrl(
                                                            {
                                                                filters,
                                                                page: profile
                                                                    .pagination
                                                                    .hasPreviousPage
                                                                    ? profile
                                                                          .pagination
                                                                          .currentPage -
                                                                      1
                                                                    : profile
                                                                          .pagination
                                                                          .currentPage,
                                                                userId: profile
                                                                    .user.id,
                                                            },
                                                        )}
                                                        tabIndex={
                                                            profile.pagination
                                                                .hasPreviousPage
                                                                ? undefined
                                                                : -1
                                                        }
                                                        text="前へ"
                                                    />
                                                </PaginationItem>

                                                <PaginationItem>
                                                    <span className="px-3 text-sm text-gray-500">
                                                        {
                                                            profile.pagination
                                                                .currentPage
                                                        }{" "}
                                                        /{" "}
                                                        {Math.max(
                                                            profile.pagination
                                                                .totalPages,
                                                            1,
                                                        )}
                                                    </span>
                                                </PaginationItem>

                                                <PaginationItem>
                                                    <PaginationNext
                                                        aria-disabled={
                                                            !profile.pagination
                                                                .hasNextPage
                                                        }
                                                        className={
                                                            profile.pagination
                                                                .hasNextPage
                                                                ? undefined
                                                                : "pointer-events-none opacity-50"
                                                        }
                                                        href={buildUserProfilePageUrl(
                                                            {
                                                                filters,
                                                                page: profile
                                                                    .pagination
                                                                    .hasNextPage
                                                                    ? profile
                                                                          .pagination
                                                                          .currentPage +
                                                                      1
                                                                    : profile
                                                                          .pagination
                                                                          .currentPage,
                                                                userId: profile
                                                                    .user.id,
                                                            },
                                                        )}
                                                        tabIndex={
                                                            profile.pagination
                                                                .hasNextPage
                                                                ? undefined
                                                                : -1
                                                        }
                                                        text="次へ"
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

// プロフィールページそのもののURLを作る
function buildUserProfilePageUrl({
    filters,
    page,
    userId,
}: {
    filters: UserProfileDetailProps["filters"];
    page: number;
    userId: string;
}) {
    return buildUserProfileTabUrl({
        filters,
        page,
        tab: "posts",
        userId,
    });
}

// 同じページ内のタブ切り替え用URLを作る
function buildUserProfileTabUrl({
    filters,
    page,
    tab,
    userId,
}: {
    filters: UserProfileDetailProps["filters"];
    page: number;
    tab: UserProfileDetailProps["activeTab"];
    userId: string;
}) {
    const searchParams = new URLSearchParams();

    if (tab === "details") {
        searchParams.set("tab", "details");
    } else {
        searchParams.set("tab", "posts");

        if (page > 1) {
            searchParams.set("page", page.toString());
        }

        if (filters.q) {
            searchParams.set("q", filters.q);
        }

        if (filters.level) {
            searchParams.set("level", filters.level);
        }

        if (filters.sort !== "updated_desc") {
            searchParams.set("sort", filters.sort);
        }
    }

    const queryString = searchParams.toString();
    const pathname = `/users/${userId}`;

    return queryString ? `${pathname}?${queryString}` : pathname;
}

function formatYmd(d: Date | string) {
    return new Date(d).toLocaleDateString("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

// プロフィール詳細の活動統計カードを表示する
function StatsCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-orange-50 px-6 py-8 text-center">
            <div className="text-5xl font-bold text-orange-500">{value}</div>
            <div className="mt-4 text-2xl font-medium text-slate-500">
                {label}
            </div>
        </div>
    );
}
