import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const data = [
    { name: "みんなの日本語 初級Ⅰ" },
    { name: "みんなの日本語 初級Ⅱ" },
    { name: "みんなの日本語 中級Ⅰ" },
    { name: "みんなの日本語 中級Ⅱ" },
    { name: "まるごと 入門（A1）" },
    { name: "まるごと 初級1（A2）" },
    { name: "まるごと 初級2（A2）" },
    { name: "まるごと 初中級（A2/B1）" },
    { name: "まるごと 中級1（B1）" },
    { name: "まるごと 中級2（B1）" },
    { name: "初級日本語 げんき 1" },
    { name: "初級日本語 げんき 2" },
    { name: "できる日本語 初級" },
    { name: "できる日本語 初中級" },
    { name: "できる日本語 中級" },
    { name: "いろどり 入門（A1）" },
    { name: "いろどり 初級1（A2）" },
    { name: "いろどり 初級2（A2）" },
    { name: "日本語初級1 大地" },
    { name: "日本語初級2 大地" },
    { name: "Japanese for busy people Ⅰ" },
    { name: "Japanese for busy people Ⅱ" },
    { name: "Japanese for busy people Ⅲ" },
    { name: "つなぐにほんご 初級1" },
    { name: "つなぐにほんご 初級2" },
    { name: "その他" },
];

async function main() {
    try {
        const textbooks = await prisma.textbook.createMany({
            data,
            skipDuplicates: true, // テキスト名が重複している箇所はスキップ
        });
        console.log(`登録件数: ${textbooks.count}`);
    } catch (error) {
        console.error("使用テキストのseeder登録中にエラー:", error);
    } finally {
        await prisma.$disconnect();
    }
}

try {
    await main();
} catch (error) {
    console.error("使用テキストのseeder登録中にエラー:", error);
    throw error;
} finally {
    await prisma.$disconnect();
}
