import type { ShowUserPageProps } from "@/app/lib/interfaces/user-page";
import { notFound } from "next/navigation";
import { parseUserProfileSearchParams } from "@/app/lib/user-search";
import { UserProfileDetail } from "@/app/ui/user-profile-detail";
import { auth } from "@/auth";
import { isUuid } from "@/lib/uuid";
import { getPublicUserProfile } from "@/server/users";

export const dynamic = "force-dynamic";

export default async function ShowUser({
    params,
    searchParams,
}: ShowUserPageProps) {
    const { id } = await params;
    if (!isUuid(id)) {
        notFound();
    }
    const resolvedSearchParams = await searchParams;
    const parsedSearchParams =
        parseUserProfileSearchParams(resolvedSearchParams);
    const session = await auth();
    const profile = await getPublicUserProfile({
        level: parsedSearchParams.filters.level,
        page: parsedSearchParams.page,
        q: parsedSearchParams.filters.q || undefined,
        sort: parsedSearchParams.filters.sort,
        userId: id,
        viewerUserId: session?.user?.id,
        includePosts: parsedSearchParams.tab === "posts",
    });

    if (!profile) {
        notFound();
    }

    const isOwnProfile = session?.user?.id === id;

    return (
        <UserProfileDetail
            activeTab={parsedSearchParams.tab}
            canEditProfile={isOwnProfile && session?.user?.role !== "guest"} // ゲストユーザーはプロフィール編集不可
            canShowProfileEditAction={isOwnProfile}
            filters={parsedSearchParams.filters}
            profile={profile}
        />
    );
}
