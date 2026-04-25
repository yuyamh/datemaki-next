import { DEFAULT_USERS_PAGE_SIZE } from "@/app/api/users/route";
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

export default function Loading() {
    return (
        <div className="space-y-8 px-4 pb-10 md:px-8">
            <div className="space-y-3">
                <Skeleton className="h-11 w-44" />
                <Skeleton className="h-6 w-96 max-w-full" />
            </div>

            <Skeleton className="h-12 w-full rounded-xl md:max-w-md" />

            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: DEFAULT_USERS_PAGE_SIZE }).map(
                        (_, index) => (
                            <UserCardSkeleton key={index} />
                        ),
                    )}
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
        </div>
    );
}

function UserCardSkeleton() {
    return (
        <Card className="col-span-1">
            <CardHeader className="space-y-4 pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </CardHeader>

            <CardContent className="h-[84px] pt-0">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-3 h-4 w-11/12" />
                <Skeleton className="mt-3 h-4 w-3/4" />
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-4 text-sm text-slate-500">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
        </Card>
    );
}
