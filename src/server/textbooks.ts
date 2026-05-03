import { prisma } from "@/server/db/prisma/prisma";

export async function getAllTextbooks() {
    return prisma.textbook.findMany({
        orderBy: {
            name: "asc",
        },
    });
}
