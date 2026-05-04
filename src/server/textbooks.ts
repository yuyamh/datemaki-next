import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db/prisma/prisma";

export const getAllTextbooks = unstable_cache(
    async () =>
        prisma.textbook.findMany({
            orderBy: {
                name: "asc",
            },
        }),
    ["textbooks", "all"],
    {
        revalidate: 60 * 60,
    },
);
