import Link from "next/link";
import { posts } from "@/app/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Bookmark, Download } from "lucide-react";

export default function PostList() {
    return (
        <div className="grid grid-cols-1 items-start justify-center gap-8 md:grid-cols-3">
            {posts.map((post) => (
                <Card className="col-span-1" key={post.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <h1>{post.title}</h1>
                            <Bookmark />
                        </CardTitle>
                        <CardDescription></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{post.description}</p>
                    </CardContent>
                    <CardFooter className="flex flex-col text-sm text-gray-400">
                        <div className="mb-2 flex w-full items-center justify-between">
                            <p>{post.user}</p>
                            <p>{post.updatedAt.toLocaleDateString()}</p>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex flex-row">
                                <div className="flex items-center justify-center pr-2">
                                    <Download size={16} />
                                    <p className="pl-1">{post.downloadCount}</p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <Bookmark size={16} />
                                    <p className="pl-1">{post.bookmarkCount}</p>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href={`/posts/${post.id}`}>詳細</Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
