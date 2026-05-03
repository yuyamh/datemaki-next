import { notFound, redirect } from "next/navigation";
import { AccountDeleteCard } from "@/app/ui/account-delete-card";
import { PasswordChangeCard } from "@/app/ui/password-change-card";
import { ProfileForm } from "@/app/ui/profile-form";
import { auth } from "@/auth";
import { getProfileByUserId } from "@/server/users";

export default async function EditProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // ゲストユーザーはプロフィール編集不可なので、プロフィール詳細ページにリダイレクト
    if (session.user.role === "guest") {
        redirect(`/users/${session.user.id}?tab=details`);
    }

    const profile = await getProfileByUserId(session.user.id);

    if (!profile) {
        notFound();
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-slate-900">
                    プロフィール編集
                </h1>
                <p className="text-base text-slate-500">
                    プロフィール情報を更新できます。
                </p>
            </div>

            <ProfileForm initialValues={profile} />
            {/* 一般ユーザーのみパスワード変更・退会可能 */}
            {session.user.role === "user" ? (
                <>
                    <PasswordChangeCard />
                    <AccountDeleteCard />
                </>
            ) : null}
        </div>
    );
}
