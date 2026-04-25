import type { PublicUserListItem } from "@/app/lib/interfaces/user-list";
import Link from "next/link";
import { AvatarImage } from "@/app/ui/avatar-image";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

const DEFAULT_USER_BIO = "自己紹介はまだ登録されていません。";

export function UserCard({ user }: { user: PublicUserListItem }) {
    return (
        <Card className="col-span-1">
            <CardHeader className="space-y-4 pb-4">
                <div className="flex items-center gap-4">
                    <AvatarImage
                        alt={`${user.name}のプロフィール画像`}
                        className="h-12 w-12"
                        fallbackText={user.name}
                        src={user.avatar}
                    />
                    <div className="min-w-0">
                        <h2 className="text-2xl font-semibold text-slate-950">
                            {user.name}
                        </h2>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="h-[84px] pt-0">
                <p className="line-clamp-3 overflow-hidden text-sm leading-7 break-words text-ellipsis whitespace-pre-wrap text-slate-700">
                    {user.bio ?? DEFAULT_USER_BIO}
                </p>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>教案 {user.postCount} 件</span>
                </div>

                <Button asChild className="w-full">
                    <Link href={`/users/${user.id}`}>プロフィールを見る</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
