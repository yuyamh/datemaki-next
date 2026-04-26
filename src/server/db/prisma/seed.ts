import type { Role } from "@prisma/client";
import { prisma } from "@/server/db/prisma/prisma";
import bcrypt from "bcryptjs";

const DEFAULT_SEED_PASSWORD = "password";
const POST_REPEAT_COUNT = 10;

const textbookSeeds = [
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
] as const;

const userSeeds = [
    {
        bio: "初級クラスの会話活動を中心に教案を作成しています。",
        email: "seed.yamada@datemaki.local",
        name: "山田 花子",
        role: "user",
    },
    {
        bio: "JLPT対策と読解授業の教材づくりが得意です。",
        email: "seed.suzuki@datemaki.local",
        name: "鈴木 一郎",
        role: "user",
    },
    {
        bio: "ビジネス日本語と中上級の授業設計を担当しています。",
        email: "seed.admin@datemaki.local",
        name: "だてまき管理者",
        role: "admin",
    },
] as const satisfies ReadonlyArray<{
    bio: string;
    email: string;
    name: string;
    role: Role;
}>;

const postSeedTemplates = [
    {
        description:
            "「〜は〜です」の導入から、教室内インタビューまでを1コマで実施できる教案です。板書例とペアワークの流れを含みます。",
        downloadCount: 18,
        level: "A1",
        textbookName: "みんなの日本語 初級Ⅰ",
        title: "自己紹介と「〜は〜です」の導入",
        userEmail: "seed.yamada@datemaki.local",
        viewCount: 126,
    },
    {
        description:
            "買い物場面を想定したロールプレイ中心の活動案です。値段の聞き方、数の言い方、ペア練習までまとめています。",
        downloadCount: 24,
        level: "A1",
        textbookName: "いろどり 入門（A1）",
        title: "買い物ロールプレイで学ぶ数え方",
        userEmail: "seed.yamada@datemaki.local",
        viewCount: 143,
    },
    {
        description:
            "「〜てもいいです」「〜てはいけません」を学校ルールの共有活動で練習する教案です。導入からまとめまで使えます。",
        downloadCount: 31,
        level: "A2",
        textbookName: "初級日本語 げんき 1",
        title: "教室ルールで学ぶ許可と禁止",
        userEmail: "seed.yamada@datemaki.local",
        viewCount: 208,
    },
    {
        description:
            "趣味の紹介を通して普通形を使う会話練習を行う構成です。学習者同士の質問活動が中心です。",
        downloadCount: 12,
        level: "A2",
        textbookName: "まるごと 初級1（A2）",
        title: "趣味トークで練習する普通形",
        userEmail: "seed.yamada@datemaki.local",
        viewCount: 97,
    },
    {
        description:
            "旅行計画を立てながら「〜つもりです」「〜予定です」を使うタスク型の教案です。ワークシート付き想定です。",
        downloadCount: 27,
        level: "A2",
        textbookName: "みんなの日本語 初級Ⅱ",
        title: "旅行計画で学ぶ予定表現",
        userEmail: "seed.yamada@datemaki.local",
        viewCount: 188,
    },
    {
        description:
            "新聞記事を使って要点把握と意見交換を行う読解授業案です。語彙導入と要約活動を含みます。",
        downloadCount: 44,
        level: "B1",
        textbookName: "まるごと 中級1（B1）",
        title: "時事記事で行う要約読解",
        userEmail: "seed.suzuki@datemaki.local",
        viewCount: 256,
    },
    {
        description:
            "比較表現を使って商品レビューを書く作文授業です。モデル文、構成メモ、相互フィードバックを用意しています。",
        downloadCount: 22,
        level: "B1",
        textbookName: "できる日本語 初中級",
        title: "商品レビュー作文で学ぶ比較表現",
        userEmail: "seed.suzuki@datemaki.local",
        viewCount: 134,
    },
    {
        description:
            "就職活動をテーマに、敬語を使ったメール作成と言い換え練習を行う中級後半向け教案です。",
        downloadCount: 39,
        level: "B2",
        textbookName: "Japanese for busy people Ⅲ",
        title: "就活メールで学ぶビジネス敬語",
        userEmail: "seed.suzuki@datemaki.local",
        viewCount: 274,
    },
    {
        description:
            "JLPT N2 相当の長文読解を、設問の根拠確認まで丁寧に扱う授業案です。時間配分の練習にも使えます。",
        downloadCount: 51,
        level: "B2",
        textbookName: "できる日本語 中級",
        title: "N2長文読解の設問分析トレーニング",
        userEmail: "seed.suzuki@datemaki.local",
        viewCount: 341,
    },
    {
        description:
            "プレゼンテーションの構成を学びながら、接続表現と話し言葉の調整を練習する授業用スライド案です。",
        downloadCount: 16,
        level: "B1",
        textbookName: "つなぐにほんご 初級2",
        title: "ミニ発表で練習する接続表現",
        userEmail: "seed.suzuki@datemaki.local",
        viewCount: 112,
    },
    {
        description:
            "会議での発言を想定し、根拠を添えて意見を述べる練習を行うビジネス日本語の教案です。",
        downloadCount: 33,
        level: "C1",
        textbookName: "その他",
        title: "会議での意見表明トレーニング",
        userEmail: "seed.admin@datemaki.local",
        viewCount: 221,
    },
    {
        description:
            "討論活動を通して反論・譲歩の表現を使い分ける上級向け教案です。評価観点メモも含めています。",
        downloadCount: 29,
        level: "C1",
        textbookName: "みんなの日本語 中級Ⅱ",
        title: "ディベートで学ぶ反論と譲歩",
        userEmail: "seed.admin@datemaki.local",
        viewCount: 198,
    },
] as const;

const postSeeds = buildPostSeeds();

function buildPostSeeds() {
    const generatedPosts = [];

    for (let batchIndex = 0; batchIndex < POST_REPEAT_COUNT; batchIndex += 1) {
        for (const [
            templateIndex,
            postTemplate,
        ] of postSeedTemplates.entries()) {
            const postNumber =
                batchIndex * postSeedTemplates.length + templateIndex + 1;
            const paddedPostNumber = postNumber.toString().padStart(3, "0");

            generatedPosts.push({
                description: `${postTemplate.description}\n\nダミーデータ ${paddedPostNumber} として投入する投稿です。`,
                downloadCount: postTemplate.downloadCount + batchIndex * 2,
                level: postTemplate.level,
                textbookName: postTemplate.textbookName,
                title: `${postTemplate.title} サンプル${paddedPostNumber}`,
                userEmail: postTemplate.userEmail,
                viewCount: postTemplate.viewCount + batchIndex * 15,
            });
        }
    }

    return generatedPosts;
}

async function getTextbookIdByName() {
    const textbookNames = textbookSeeds.map((textbook) => textbook.name);
    const textbooks = await prisma.textbook.findMany({
        where: {
            name: {
                in: textbookNames,
            },
        },
    });
    const textbookIdByName = new Map<string, string>();

    for (const textbook of textbooks) {
        textbookIdByName.set(textbook.name, textbook.id);
    }

    return textbookIdByName;
}

async function main() {
    const hashedPassword = await bcrypt.hash(DEFAULT_SEED_PASSWORD, 10);

    await seedTextbooks();

    const textbookIdByName = await getTextbookIdByName();
    const userIdByEmail = await seedUsers(hashedPassword);

    await seedPosts(textbookIdByName, userIdByEmail);

    console.log("シードユーザーを作成しました。");

    for (const user of userSeeds) {
        console.log(
            `- ${user.name} (${user.role}): ${user.email} / ${DEFAULT_SEED_PASSWORD}`,
        );
    }
}

async function seedPosts(
    textbookIdByName: Map<string, string>,
    userIdByEmail: Map<string, string>,
) {
    const seededUserIds = [...userIdByEmail.values()];

    await prisma.post.deleteMany({
        where: {
            userId: {
                in: seededUserIds,
            },
        },
    });

    const postsToCreate = postSeeds.map((post) => {
        const textbookId = textbookIdByName.get(post.textbookName);
        const userId = userIdByEmail.get(post.userEmail);

        if (!textbookId) {
            throw new Error(
                `使用テキストが見つかりません: ${post.textbookName}`,
            );
        }

        if (!userId) {
            throw new Error(`ユーザーが見つかりません: ${post.userEmail}`);
        }

        return {
            description: post.description,
            downloadCount: post.downloadCount,
            level: post.level,
            textbookId,
            title: post.title,
            userId,
            viewCount: post.viewCount,
        };
    });

    const createdPosts = await prisma.post.createMany({
        data: postsToCreate,
    });

    console.log(`教案のシード件数: ${createdPosts.count}`);
}

async function seedTextbooks() {
    const textbooks = await prisma.textbook.createMany({
        data: [...textbookSeeds],
        skipDuplicates: true,
    });

    console.log(`使用テキストのシード件数: ${textbooks.count}`);
}

async function seedUsers(hashedPassword: string) {
    const userIdByEmail = new Map<string, string>();

    for (const user of userSeeds) {
        const seededUser = await prisma.user.upsert({
            create: {
                bio: user.bio,
                email: user.email,
                hashedPassword,
                name: user.name,
                role: user.role,
            },
            update: {
                bio: user.bio,
                hashedPassword,
                name: user.name,
                role: user.role,
            },
            where: {
                email: user.email,
            },
        });

        userIdByEmail.set(user.email, seededUser.id);
    }

    console.log(`ユーザーのシード件数: ${userIdByEmail.size}`);

    return userIdByEmail;
}

try {
    await main();
} catch (error) {
    console.error("シード処理中にエラー:", error);
    throw error;
} finally {
    await prisma.$disconnect();
}
