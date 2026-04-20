import { DEFAULT_POSTS_PAGE_SIZE } from "@/app/api/posts/route";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="grid grid-cols-1 items-start justify-center gap-8 md:grid-cols-3">
            {Array.from({ length: DEFAULT_POSTS_PAGE_SIZE }).map((_, index) => (
                <Card className="col-span-1" key={index}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <Skeleton className="h-5 w-3/5" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardTitle>
                        <Skeleton className="mt-2 h-4 w-2/5" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-11/12" />
                        <Skeleton className="mt-2 h-4 w-4/5" />
                    </CardContent>
                    <CardFooter className="flex flex-col text-sm text-gray-400">
                        <div className="mb-2 flex w-full items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex flex-row">
                                <div className="flex items-center justify-center pr-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="ml-2 h-4 w-6" />
                                </div>
                                <div className="flex items-center justify-center">
                                    <Skeleton className="h-4 w-4 rounded" />
                                </div>
                            </div>
                            <Skeleton className="h-9 w-20 rounded-md" />
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
