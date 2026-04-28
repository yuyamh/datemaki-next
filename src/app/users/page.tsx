import type { UserIndexPageProps } from "@/app/lib/interfaces/user-page";
import { getPaginatedUsers } from "@/app/api/users/route";
import { parseUserIndexSearchParams } from "@/app/lib/user-search";
import UserList from "@/app/ui/user-list";

export default async function UserIndex({ searchParams }: UserIndexPageProps) {
    const resolvedSearchParams = await searchParams;
    const parsedSearchParams = parseUserIndexSearchParams(resolvedSearchParams);
    const { pagination, users } = await getPaginatedUsers({
        page: parsedSearchParams.page,
        q: parsedSearchParams.filters.q || undefined,
    });

    return (
        <UserList
            filters={parsedSearchParams.filters}
            pagination={pagination}
            users={users}
        />
    );
}
