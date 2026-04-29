# ⭐️ アプリ概要
### タイトル名：だてまき
Github：
**[https://github.com/yuyamh/datemaki-next](https://github.com/yuyamh/datemaki-next)**

<img width="1913" height="988" alt="スクリーンショット 2026-04-29 20 44 45" src="https://github.com/user-attachments/assets/9e8f66e7-8e02-46ab-9be7-3335dc90d26a" />

## コンセプト
 - 日本語教師に向けた、教案（教育現場で使用される授業計画や指導案）を自由に共有・検索できるWebアプリケーションです。
 - 投稿することで、作成した教案・教材をユーザーに簡単にシェアできます。
 - 他のユーザーが投稿した教案や教材の検索・ダウンロードが可能です。

## 教案とは
- 日本語教師が各授業のコマごとに作成する、授業の計画案を指します。
- 教える単語や項目、時間配分、使用教材を中心に、どのように学習者に日本語を教えるかをあらかじめ授業前に決めておくものです。

## 特徴
 - 教案や教材の画像・ファイルアップロード機能（1件につき3ファイル添付可能）
 - 学習者の日本語レベル、使用テキスト、キーワード、ユーザー名からの投稿検索機能
 - 気に入った投稿のブックマーク機能
 - 気になる投稿へのコメント機能<img width="1913" height="988" alt="スクリーンショット 2026-04-29 20 55 34" src="https://github.com/user-attachments/assets/508c0e6d-c24e-40f5-b975-538250f76de7" />


<br>

## 使用画面のイメージ
### ホーム画面
<img width="1913" height="988" alt="スクリーンショット 2026-04-29 20 44 45" src="https://github.com/user-attachments/assets/aa699484-97af-475d-8fc1-337a4dbe90af" />


### 投稿一覧画面
ユーザーが投稿した教案、教材、授業のアイディアを見ることができます。
<img width="1070" height="913" alt="スクリーンショット 2026-04-29 21 20 53" src="https://github.com/user-attachments/assets/797a4aec-7e2f-429b-a887-cda4ee2ec004" />


教案・教材は、検索フォームからキーワード、学習者レベル、使用テキストに絞り込み検索することができます。
<img width="400" height="341" alt="画面収録 2026-04-29 21 36 49" src="https://github.com/user-attachments/assets/68b69f6a-6e75-477d-823d-ba214d36a798" />


### 投稿詳細画面
気になる投稿の内容が詳しく見られます。<br>
ここでファイルのダウンロード・教案のブックマーク・コメントが可能です。
<img width="1070" height="913" alt="スクリーンショット 2026-04-29 21 20 01" src="https://github.com/user-attachments/assets/c564584c-2158-4a56-8e55-0f5dd710d2b9" />



### 投稿作成・編集画面
投稿の作成・編集ができます（教案ファイルの添付は任意）。<br>
概要はマークダウン記法にも対応しています。<br>
教案一件につき、3件までファイルアップロード可能です（PDF、PNG、JPEG、ZIP、PowerPoint、Excel）。
<img width="1070" height="913" alt="スクリーンショット 2026-04-29 21 43 38" src="https://github.com/user-attachments/assets/e8c66ab6-57c4-4dbd-8fc4-88096463b9af" />



### マイページ
アカウント情報の確認ができます。<br>
ここでプロフィールの変更が可能です。
また、退会も可能となっています。
<img width="1070" height="913" alt="スクリーンショット 2026-04-29 21 17 59" src="https://github.com/user-attachments/assets/873b03ad-9ab0-4964-a58c-862567f20d31" />


<br>

# ⭐️ アプリの機能一覧
## メイン機能
 - 教案投稿機能（CRUD）
 - Supabase Storageを用いたファイルアップロード機能（ファイル形式 : PDF、PNG、JPEG、ZIP、PowerPoint、Excel）
 - ページネーション機能
 - ブックマーク機能
 - コメント機能
 - 教案検索機能（キーワード、学習者レベル、使用テキスト、並べ替え）
 - ユーザー検索機能（キーワード）
 - レスポンシブデザイン（スマホ版対応）

## 認証機能
 - 会員登録 / ログイン / ログアウト
 - ゲストログイン
 - パスワード変更（ログイン中）
 - パスワードリセット（Resend）
 - プロフィール情報編集（アイコン、名前）
 - 退会

 <br>

# ⭐️ 使用技術

### フロントエンド
- TypeScript
- Next.js 16.0.10
- React 19.0.0
- Tailwind CSS 4
- Radix UI / shadcn/ui 系コンポーネント
- Lucide React
- React Hook Form
- React Markdown / remark-gfm

### バックエンド
- Node.js 22.x
- Next.js Route Handlers
- NextAuth 5.0.0-beta.30 / Auth.js
- Prisma 6.5.0
- PostgreSQL
- Supabase Storage
- bcryptjs
- Zod
- Resend

### 開発・ビルドツール
- pnpm
- TypeScript 5
- ESLint 9
- Prettier 3
- Prisma CLI
- Turbopack

### インフラ / 外部サービス
- Vercel
- Supabase
- PostgreSQL
- Resend

### その他
- Git / GitHub
- Visual Studio Code
- Codex5.5
- Notion
- FigJam

<br>

# ⭐️ インフラ構成図

<br>

# ⭐️ ER図

<br>

# ⭐️ テーブル定義書

postsテーブル

textsテーブル

bookmarksテーブル

usersテーブル

<br>

# ⭐️ URL設計書


<br>

## 開発者
Yuya.Mansur.H<br>
