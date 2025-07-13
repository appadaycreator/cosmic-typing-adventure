# Cosmic Typing Adventure - デプロイガイド

## デプロイ方法

### 1. 静的ホスティング（推奨）
- Netlify, Vercel, GitHub Pages などの静的ホスティングサービスを使用
- このディレクトリの内容をアップロード

### 2. 手動デプロイ
1. サーバーにファイルをアップロード
2. Web サーバー（nginx, Apache）を設定
3. HTTPS を有効化

### 3. 環境変数の設定
以下の環境変数を設定してください：
- SUPABASE_URL: Supabase プロジェクトの URL
- SUPABASE_ANON_KEY: Supabase の匿名キー

## 注意事項
- 本番環境では必ず HTTPS を使用してください
- 環境変数は適切に設定してください
- 定期的にバックアップを取得してください
