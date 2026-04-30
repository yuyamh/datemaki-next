import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostFormSkeleton() {
    return (
        <form className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">基本情報</CardTitle>
                    <CardDescription>
                        教案の基本的な情報を読み込んでいます。
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid w-full items-center gap-4 space-y-2">
                        <div className="flex flex-col space-y-3">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <div className="mb-0 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-14" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                                <Skeleton className="h-10 w-40 rounded-lg" />
                            </div>
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="min-h-[400px] w-full rounded-lg" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Skeleton className="mb-2 h-5 w-16" />
                            <Skeleton className="h-10 w-2/6 rounded-md" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Skeleton className="mb-2 h-5 w-28" />
                            <Skeleton className="h-10 w-2/6 rounded-md" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        ファイルのアップロード
                    </CardTitle>
                    <CardDescription>
                        添付ファイル欄を読み込んでいます。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div className="space-y-3" key={index}>
                            <div className="flex items-center justify-between gap-3">
                                <Skeleton className="h-5 w-28" />
                            </div>
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6">
                                <div className="flex flex-col items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-5 w-52 max-w-full" />
                                    <Skeleton className="h-4 w-72 max-w-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>
        </form>
    );
}
