import type { UserSearchToolbarProps } from "@/app/lib/interfaces/user-list";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function UserSearchToolbar({ filters }: UserSearchToolbarProps) {
    return (
        // デフォルトは GET なので、フォームの送信でクエリパラメータを付与して /users?q=... に遷移する
        <form action="/users" className="relative max-w-[360px]">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
            <Input
                className="h-12 rounded-xl border-slate-200 pl-12 text-base"
                defaultValue={filters.q}
                name="q"
                placeholder="名前で検索..."
                type="search"
            />
        </form>
    );
}
