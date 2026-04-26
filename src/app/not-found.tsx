import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-full flex-1 items-center justify-center bg-white px-4 py-16">
            <div className="space-y-6 text-center">
                <div className="space-y-3">
                    <p className="text-6xl font-semibold tracking-[0.2em] text-slate-400 uppercase">
                        404
                    </p>
                    <h1 className="py-4 text-3xl font-bold text-slate-950">
                        ページが見つかりません
                    </h1>
                    <p className="text-slate-500">
                        お探しのページは存在しません。
                    </p>
                </div>

                <Button asChild>
                    <Link href="/posts">一覧へ戻る</Link>
                </Button>
            </div>
        </div>
    );
}
