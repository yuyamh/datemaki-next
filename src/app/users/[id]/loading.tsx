import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const PROFILE_LOADING_CARD_COUNT = 6;

export default function Loading() {
    return (
        <div className="px-4 pb-10 md:px-8">
            <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
                <Card className="h-fit border-slate-200 shadow-sm">
                    <CardHeader className="space-y-6 pb-4">
                        <div className="flex flex-col items-center gap-5 text-center">
                            <Skeleton className="h-28 w-28 rounded-full" />
                            <Skeleton className="h-10 w-40" />
                            <div className="w-full space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-11/12" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-4">
                            <Skeleton className="h-4 w-14" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <Skeleton className="h-4 w-14" />
                            <Skeleton className="h-4 w-16" />
                        </div>

                        <Skeleton className="mt-6 h-10 w-full rounded-md" />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="inline-flex rounded-[10px] bg-slate-100 p-2 shadow-xs">
                        <Skeleton className="h-12 w-52 rounded-[10px] bg-white" />
                        <Skeleton className="ml-2 h-12 w-32 rounded-[10px]" />
                    </div>

                    <section className="space-y-6">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1fr)_220px_220px]">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                                {Array.from({
                                    length: PROFILE_LOADING_CARD_COUNT,
                                }).map((_, index) => (
                                    <ProfilePostCardSkeleton key={index} />
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <Skeleton className="h-4 w-40" />

                                <Pagination className="mx-0 w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                className="pointer-events-none opacity-50"
                                                href="#"
                                                tabIndex={-1}
                                                text="前へ"
                                            />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <Skeleton className="h-4 w-16" />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext
                                                className="pointer-events-none opacity-50"
                                                href="#"
                                                tabIndex={-1}
                                                text="次へ"
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function ProfilePostCardSkeleton() {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <Skeleton className="h-6 w-3/5" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <Skeleton className="h-4 w-2/5" />
            </CardHeader>

            <CardContent className="h-18">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-11/12" />
                <Skeleton className="mt-2 h-4 w-4/5" />
            </CardContent>

            <CardFooter className="flex flex-col text-sm text-gray-400">
                <div className="mb-2 flex w-full items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>

                <div className="flex w-full items-center justify-between">
                    <div className="flex flex-row">
                        <div className="flex items-center justify-center pr-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="ml-2 h-4 w-6" />
                        </div>
                        <div className="flex items-center justify-center pr-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="ml-2 h-4 w-6" />
                        </div>
                        <div className="flex items-center justify-center">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="ml-2 h-4 w-6" />
                        </div>
                    </div>

                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </CardFooter>
        </Card>
    );
}
