# Seed 実行手順

CI/CD の自動デプロイでは seed を実行しません。必要なときだけ、ローカルのターミナルから Vercel に登録済みの環境変数を使って seed を実行します。

## 初回だけ必要な準備

```bash
vercel login
vercel link
```

`vercel link` により、このローカルリポジトリと Vercel プロジェクトを紐づけます。
`vercel link` の途中で `Would you like to pull environment variables now?`
と聞かれた場合は、既存の `.env.local` を上書きしないため `no` を選んでください。

もし誤って `.env.local` を上書きした場合でも、seed 実行には `vercel env run`
で Vercel 側の環境変数を直接使うため、`.env.local`
の復元は必須ではありません。ローカル開発用の値は `.env`
に残っているか確認してください。

## Preview 環境に seed する

```bash
pnpm db:seed:preview
```

`develop` ブランチ用の Preview 環境変数を使って、ローカルPC上で
`pnpm prisma db seed` を実行します。

## Production 環境に seed する

```bash
pnpm db:seed:production
```

Production の Supabase
DB に seed が投入されます。実行前に、Production に投入してよいか必ず確認してください。

## ローカル `.env` で seed する

```bash
pnpm db:seed
```

この場合は Vercel の環境変数ではなく、ローカルの `.env` / `.env.local` の
`DATABASE_URL` を使います。
