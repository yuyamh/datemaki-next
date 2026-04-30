import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function PostDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-2/3 max-w-full" />

            <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="min-w-0 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-36" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex rounded-[10px] bg-slate-100 p-2 shadow-xs">
                            <Skeleton className="h-11 w-28 rounded-[10px] bg-white" />
                            <Skeleton className="ml-2 h-11 w-36 rounded-[10px]" />
                        </div>

                        <Skeleton className="h-9 w-20 rounded-md" />
                    </div>

                    <Card>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-11/12" />
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4" />
                        </CardContent>
                    </Card>

                    <section className="space-y-4">
                        <Skeleton className="h-8 w-36" />
                        <div className="grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <Card key={index}>
                                    <CardContent className="flex items-center justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-4">
                                            <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
                                            <div className="min-w-0 space-y-2">
                                                <Skeleton className="h-5 w-40 max-w-full" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-center gap-5">
                        <Skeleton className="h-9 w-24 rounded-md" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                </div>

                <div className="h-fit md:pt-0 lg:sticky lg:top-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">教案情報</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <dl className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-4 text-sm">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <Skeleton
                                        className={
                                            index % 2 === 0
                                                ? "h-4 w-20"
                                                : "h-4 w-28"
                                        }
                                        key={index}
                                    />
                                ))}
                            </dl>

                            <Separator />

                            <div className="space-y-5">
                                <Skeleton className="h-6 w-24" />
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-4/5" />
                                    </div>
                                </div>
                                <Skeleton className="h-9 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
