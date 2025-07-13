# Cosmic Typing Adventure セットアップガイド

## 目次

1. [前提条件](#前提条件)
2. [開発環境のセットアップ](#開発環境のセットアップ)
3. [Supabase設定](#supabase設定)
4. [ローカル開発](#ローカル開発)
5. [本番環境デプロイ](#本番環境デプロイ)
6. [トラブルシューティング](#トラブルシューティング)
7. [パフォーマンス最適化](#パフォーマンス最適化)

## 前提条件

### 必要なソフトウェア
- **Node.js**: v16.0.0以上
- **npm**: v8.0.0以上
- **Git**: v2.30.0以上
- **モダンブラウザ**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 推奨開発環境
- **VS Code**: 推奨エディタ
- **Live Server**: ローカル開発用
- **Postman**: APIテスト用
- **Chrome DevTools**: デバッグ用

## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
# HTTPS経由でクローン
git clone https://github.com/yourusername/cosmic-typing-adventure.git

# またはSSH経由でクローン
git clone git@github.com:yourusername/cosmic-typing-adventure.git

# プロジェクトディレクトリに移動
cd cosmic-typing-adventure
```

### 2. 依存関係のインストール

```bash
# 開発用依存関係のインストール
npm install

# または、手動で必要なライブラリをインストール
npm install chart.js
npm install @supabase/supabase-js
```

### 3. 環境変数の設定

```bash
# .envファイルを作成
touch .env

# 環境変数を設定
echo "SUPABASE_URL=your_supabase_url" >> .env
echo "SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env
echo "NODE_ENV=development" >> .env
```

### 4. ローカルサーバーの起動

```bash
# Python 3を使用
python3 -m http.server 8000

# または Node.js を使用
npx http-server -p 8000

# または PHP を使用
php -S localhost:8000

# または Live Server (VS Code拡張) を使用
# VS Codeで右クリック → "Open with Live Server"
```

### 5. ブラウザでアクセス

```
http://localhost:8000
```

## Supabase設定

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. アカウントを作成またはログイン
3. 「New Project」をクリック
4. プロジェクト名を入力（例: `cosmic-typing-adventure`）
5. データベースパスワードを設定
6. リージョンを選択（推奨: `ap-northeast-1`）
7. 「Create new project」をクリック

### 2. プロジェクト設定の取得

1. プロジェクトダッシュボードに移動
2. 「Settings」→「API」をクリック
3. 以下の情報をコピー：
   - **Project URL**
   - **anon public key**

### 3. 環境変数の更新

```javascript
// js/supabase-config.js を編集
const SUPABASE_URL = 'your_project_url'
const SUPABASE_ANON_KEY = 'your_anon_key'
```

### 4. データベーススキーマの適用

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `sql/001-create-tables.sql`の内容をコピー
3. SQLエディタに貼り付けて実行

```sql
-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- テーブルの作成
-- (sql/001-create-tables.sqlの内容)
```

### 5. 初期データの挿入

```sql
-- 初期データの挿入
-- (sql/002-insert-data.sqlの内容)
```

### 6. Row Level Security (RLS) の設定

```sql
-- セキュリティポリシーの設定
ALTER TABLE typing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own sessions" ON typing_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON typing_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON typing_sessions
  FOR UPDATE USING (auth.uid() = user_id);
```

### 7. 認証設定

1. Supabaseダッシュボードで「Authentication」→「Settings」をクリック
2. 「Site URL」を設定：
   - 開発環境: `http://localhost:8000`
   - 本番環境: `https://yourdomain.com`
3. 「Redirect URLs」を設定：
   - `http://localhost:8000/app.html`
   - `https://yourdomain.com/app.html`

## ローカル開発

### 1. 開発サーバーの起動

```bash
# 開発用スクリプトを実行
npm run dev

# または直接サーバーを起動
python3 -m http.server 8000
```

### 2. ファイル監視の設定

```bash
# nodemonを使用したファイル監視
npm install -g nodemon
nodemon --watch . --ext html,css,js --exec "python3 -m http.server 8000"
```

### 3. ブラウザでの開発

1. Chrome DevToolsを開く（F12）
2. 「Console」タブでエラーを確認
3. 「Network」タブでAPIリクエストを監視
4. 「Application」タブでLocalStorageを確認

### 4. デバッグ設定

```javascript
// デバッグモードを有効化
localStorage.setItem('debug', 'true');

// コンソールログの確認
console.log('Debug mode enabled');
```

## 本番環境デプロイ

### 1. 静的ホスティング（推奨）

#### Netlify
```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# プロジェクトの初期化
netlify init

# デプロイ
netlify deploy --prod
```

#### Vercel
```bash
# Vercel CLIのインストール
npm install -g vercel

# デプロイ
vercel --prod
```

#### GitHub Pages
```bash
# GitHub Pages用のブランチを作成
git checkout -b gh-pages

# ファイルをコミット
git add .
git commit -m "Deploy to GitHub Pages"

# プッシュ
git push origin gh-pages
```

### 2. カスタムドメインの設定

1. DNSレコードの設定
   - Aレコード: `@` → `your-server-ip`
   - CNAMEレコード: `www` → `yourdomain.com`

2. SSL証明書の設定
   - Let's Encryptを使用
   - またはホスティングプロバイダーのSSL機能を使用

### 3. 環境変数の設定

```bash
# 本番環境用の環境変数
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
NODE_ENV=production
```

### 4. パフォーマンス最適化

```bash
# 画像の最適化
npm install -g imagemin-cli
imagemin images/* --out-dir=images/optimized

# CSS/JSの圧縮
npm install -g uglify-js
uglifyjs js/*.js -o js/bundle.min.js

# HTMLの圧縮
npm install -g html-minifier
html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true -o dist/
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. Supabase接続エラー

**症状**: `Failed to fetch` エラー
**解決方法**:
```javascript
// 接続テスト
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connected successfully');
    }
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}
```

#### 2. CORSエラー

**症状**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
**解決方法**:
```javascript
// Supabase設定でCORSを有効化
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

#### 3. 認証エラー

**症状**: `Invalid JWT` エラー
**解決方法**:
```javascript
// セッションの確認
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // 匿名認証を試行
  await supabase.auth.signInAnonymously();
}
```

#### 4. データベースエラー

**症状**: `relation "users" does not exist`
**解決方法**:
```sql
-- テーブルの存在確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- テーブルの再作成
DROP TABLE IF EXISTS users CASCADE;
-- (sql/001-create-tables.sqlを実行)
```

#### 5. パフォーマンス問題

**症状**: ページ読み込みが遅い
**解決方法**:
```javascript
// 画像の遅延読み込み
<img src="image.jpg" loading="lazy" alt="description">

// クリティカルCSSの最適化
<link rel="preload" href="critical.css" as="style">
<link rel="stylesheet" href="critical.css">
```

### デバッグツール

#### 1. ブラウザ開発者ツール
```javascript
// デバッグ情報の表示
console.log('App state:', appState);
console.log('User session:', userSession);
console.log('Typing stats:', typingStats);
```

#### 2. ネットワーク監視
```javascript
// APIリクエストの監視
fetch('/api/endpoint')
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.json();
  })
  .then(data => console.log('Response data:', data))
  .catch(error => console.error('Request failed:', error));
```

#### 3. パフォーマンス監視
```javascript
// パフォーマンス測定
const startTime = performance.now();
// 処理実行
const endTime = performance.now();
console.log(`Execution time: ${endTime - startTime}ms`);
```

## パフォーマンス最適化

### 1. 画像最適化

```bash
# WebP形式への変換
npm install -g imagemin-webp
imagemin images/* --plugin=imagemin-webp --out-dir=images/webp

# レスポンシブ画像の生成
npm install -g sharp
node scripts/generate-responsive-images.js
```

### 2. CSS最適化

```css
/* クリティカルCSSの分離 */
/* critical.css */
body, html { margin: 0; padding: 0; }
.container { max-width: 1200px; margin: 0 auto; }

/* 非クリティカルCSSの遅延読み込み */
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 3. JavaScript最適化

```javascript
// モジュールの遅延読み込み
const TypingEngine = await import('./js/typing-engine.js');

// 不要なコードの削除
if (process.env.NODE_ENV === 'production') {
  // 本番環境のみのコード
}
```

### 4. キャッシュ戦略

```html
<!-- 静的アセットのキャッシュ -->
<meta http-equiv="Cache-Control" content="max-age=31536000">

<!-- Service Worker の実装 -->
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
</script>
```

### 5. CDN設定

```html
<!-- CDNからのライブラリ読み込み -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.21.0/dist/umd/supabase.min.js"></script>
```

---

**セットアップ完了後は、[使用方法ガイド](how-to-use.html)を参照してください。**

**問題が発生した場合は、[トラブルシューティング](#トラブルシューティング)セクションを確認するか、[お問い合わせ](contact.html)ページからサポートを受けてください。** 