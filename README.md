# Cosmic Typing Adventure 🚀

宇宙をテーマにしたタイピング練習アプリケーション。美しい惑星の背景で楽しくタイピングスキルを向上させましょう！

## 🌟 特徴

- **宇宙テーマ**: 美しい惑星背景とアニメーション
- **リアルタイム統計**: タイピング速度、精度、進捗をリアルタイムで表示
- **パフォーマンスグラフ**: Chart.jsを使用した詳細な統計分析
- **Supabase統合**: クラウドベースのデータ保存と同期
- **レスポンシブデザイン**: モバイル、タブレット、デスクトップ対応
- **アクセシビリティ**: スクリーンリーダー対応とキーボードナビゲーション
- **多言語対応**: 日本語と英語のインターフェース
- **オフライン対応**: ローカルストレージによる完全オフライン機能

## 🎨 UI/UX改善 (2026-01-30)

### 🎯 最優先改善事項（完了）

#### 1. タイピング入力欄の視認性向上
- **3pxの太枠ボーダー**: 入力欄を明確に識別可能に
- **グロー効果**: フォーカス時に4pxの発光シャドウで視覚的フィードバック
- **アクティブ状態の背景色**: 入力中は淡い緑色の背景で状態を明示
- **プレースホルダー改善**: アイコン付きの分かりやすい説明文

#### 2. ボタン状態の明確化
- **無効状態の視覚化**: opacity: 0.5 + cursor: not-allowed
- **ホバー効果強化**: 立体的な浮き上がりアニメーション（translateY + scale）
- **アクティブフィードバック**: クリック時の押し込みアニメーション
- **ローディング状態**: スピナーアニメーションで処理中を表示

#### 3. エラーフィードバックの強化
- **波線アンダーライン**: 誤入力箇所を視覚的に強調
- **シェイクアニメーション**: エラー時に要素を振動させて注意喚起
- **色彩強化**: エラー背景をより濃い赤（rgba(220, 53, 69, 0.25)）に
- **絵文字アイコン**: ⚠️ エラーメッセージに視覚的シンボル追加

#### 4. モバイル最適化
- **タッチターゲット**: 56px以上（WCAG 2.1 AAA基準の48pxを超過）
- **16pxフォントサイズ**: iOSの自動ズーム防止
- **タッチフィードバック**: scale(0.95) + opacity変化で押下を明示
- **キーボード最適化**: 入力欄を画面上部に配置してキーボードと干渉防止

#### 5. 進行状況の可視化
- **プログレスバー強化**: 12px高さ + グラデーション + グロー効果
- **シマーアニメーション**: 光沢が流れるアニメーションで進行を強調
- **色彩コーディング**: 緑のグラデーションで成功を視覚的に表現
- **リアルタイム更新**: スムーズなCSSトランジション

### 🌟 アクセシビリティ改善

#### WCAG 2.1 AA準拠
- **コントラスト比**: テキストで4.5:1以上、大きなテキストで3:1以上
- **フォーカスリング**: 3-4pxの明確な青色アウトライン
- **スキップリンク**: キーボードユーザー向けのコンテンツへの直接アクセス
- **ARIA属性**: role, aria-label, aria-describedby で支援技術対応

#### キーボードナビゲーション
- **自動フォーカス管理**: タイピング開始時に入力欄へ自動フォーカス
- **フォーカストラップ**: モーダル内でフォーカスを閉じ込め
- **視覚的フィードバック**: focus-visible疑似クラスで明確な表示

### 💫 ユーザビリティ改善

#### 視覚的フィードバック
- **通知システム**: スライドインアニメーションでメッセージ表示
- **状態遷移アニメーション**: フェードイン、スケール、スライドで滑らかな遷移
- **完了セレブレーション**: 成功時に🎉絵文字とアニメーション
- **色彩心理学**: 成功=緑、エラー=赤、警告=黄、情報=青

#### CTAボタン最適化
- **サイズ増加**: 60px高さ、1.25remフォントサイズ
- **グラデーション**: 2色のグラデーションで視覚的魅力向上
- **影効果**: 6-12pxのドロップシャドウで立体感
- **ホバーアニメーション**: 浮き上がり効果で操作可能性を強調

### ⚡ パフォーマンス改善

#### レンダリング最適化
- **GPU アクセラレーション**: will-change プロパティで滑らかなアニメーション
- **contain プロパティ**: レイアウト計算の範囲を限定
- **レイアウト安定性**: 明示的な最小サイズ指定でCLS防止

#### インタラクション応答性
- **60fps アニメーション**: transform と opacity のみ使用
- **debounce/throttle**: 入力イベントの最適化
- **遅延読み込み**: Intersection Observer で画像の遅延読み込み

### 📱 モバイル体験の向上

#### タッチ最適化
- **タッチターゲット**: 最小56x56px（推奨基準超過）
- **タッチフィードバック**: -webkit-tap-highlight-color のカスタマイズ
- **スワイプジェスチャー**: タッチイベントで直感的操作

#### レスポンシブデザイン
- **ブレークポイント**: 768px（タブレット）、1024px（デスクトップ）
- **フルード レイアウト**: %とvw/vhで柔軟なレイアウト
- **メディアクエリ**: デバイス特性に応じた最適化

### 🎨 デザインシステムの統一

#### カラーパレット
```css
--space-navy: #0f0f23
--cosmic-blue: #1e40af
--star-cyan: #06b6d4
--energy-green: #10b981
--planet-orange: #f97316
```

#### タイポグラフィ
- **ヘッドライン**: Orbitron（宇宙感のあるフォント）
- **本文**: Noto Sans JP（読みやすい日本語フォント）
- **コード**: Courier New（等幅フォント）

#### スペーシング
- **8pxグリッド**: 一貫した余白システム
- **16px基準**: モバイルでのズーム防止

## 🚀 クイックスタート

### ⚡ ビルド不要・そのままアップロードでOK！

このプロジェクトは**静的ホスティング専用**に設計されています。ビルドプロセスは不要です。

### 前提条件

- モダンなWebブラウザ（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）
- ローカル開発の場合: Python 3.x または Node.js 14.x以上

### デプロイ方法

#### GitHub Pages
```bash
# リポジトリをクローン
git clone https://github.com/yourusername/cosmic-typing-adventure.git

# そのままGitHubにプッシュ
git add .
git commit -m "Initial commit"
git push origin main

# GitHub Pagesを有効化
# Settings > Pages > Source: Deploy from a branch > main
```

#### Netlify
```bash
# リポジトリをクローン
git clone https://github.com/yourusername/cosmic-typing-adventure.git

# Netlifyにドラッグ&ドロップでデプロイ
# または GitHub連携で自動デプロイ
```

#### Vercel
```bash
# リポジトリをクローン
git clone https://github.com/yourusername/cosmic-typing-adventure.git

# Vercel CLIでデプロイ
npm i -g vercel
vercel
```

#### 自前サーバー
```bash
# ファイルをサーバーにアップロード
# Apache/Nginx設定不要（静的ファイルのみ）
```

### ローカル開発

1. **リポジトリのクローン**
```bash
git clone https://github.com/yourusername/cosmic-typing-adventure.git
cd cosmic-typing-adventure
```

2. **ローカルサーバーの起動**

#### オプション1: npm scripts を使用（推奨）
```bash
npm start
# http://localhost:8000 で自動起動
```

#### オプション2: 直接コマンドを実行
```bash
# Python 3
python3 -m http.server 8000

# または Node.js
npx http-server

# または PHP
php -S localhost:8000
```

3. **ブラウザでアクセス**
```
http://localhost:8000
```

4. **テストの実行**
```bash
npm test
# または直接ブラウザで開く
open http://localhost:8000/tests/test-suite.html
```

### Supabase設定（オプション）

1. **Supabaseプロジェクトの作成**
   - [Supabase](https://supabase.com)でアカウント作成
   - 新しいプロジェクトを作成

2. **データベースのセットアップ**
   ```sql
   -- sql/001-create-tables.sql を実行
   ```

3. **設定の更新**
   ```javascript
   // js/supabase-config.js を編集
   const SUPABASE_CONFIG = {
     url: 'your-supabase-url',
     anonKey: 'your-supabase-anon-key'
   };
   ```

## 📁 プロジェクト構造

```
cosmic-typing-adventure/
├── index.html              # ランディングページ
├── app.html               # メインアプリケーション
├── how-to-use.html        # 使用方法ガイド
├── contact.html           # お問い合わせページ
├── terms.html             # 利用規約
├── privacy.html           # プライバシーポリシー
├── manifest.json          # PWAマニフェスト
├── sw.js                 # Service Worker
├── css/
│   ├── common.css         # 共通スタイル
│   ├── app.css           # アプリ固有スタイル
│   └── responsive.css     # レスポンシブデザイン
├── js/
│   ├── app.js            # メインアプリケーションロジック
│   ├── typing-engine.js  # タイピングエンジン
│   ├── common.js         # 共通ユーティリティ
│   ├── logger.js         # ログ管理システム
│   ├── dom-utils.js      # DOM操作ユーティリティ
│   ├── error-handler.js  # エラーハンドリング
│   ├── supabase-config.js # Supabase設定
│   ├── security-utils.js # セキュリティ機能
│   ├── accessibility-utils.js # アクセシビリティ
│   └── ux-utils.js       # UX改善機能
├── data/
│   ├── practice-texts.json # 練習テキスト
│   └── typing-stats.json  # 統計データ
├── sql/
│   ├── 001-create-tables.sql # データベーススキーマ
│   └── 002-insert-data.sql   # 初期データ
├── tests/
│   └── basic-tests.js     # 基本機能テスト
└── images/
    ├── icons/             # アイコン
    └── planets/           # 惑星画像
```

## 🛠️ 技術仕様

### フロントエンド
- **HTML5**: セマンティックマークアップ
- **CSS3**: Flexbox、Grid、アニメーション
- **JavaScript ES6+**: モジュラーアーキテクチャ
- **Chart.js**: 統計グラフ表示
- **LocalStorage**: オフライン機能
- **Service Worker**: PWA対応

### バックエンド（オプション）
- **Supabase**: リアルタイムデータベース
- **PostgreSQL**: データストレージ
- **Row Level Security**: セキュリティ

### パフォーマンス
- **Lazy Loading**: 画像の遅延読み込み
- **Minification**: CSS/JSの最適化
- **Caching**: ブラウザキャッシュ活用
- **CDN**: 静的アセット配信

## 🎯 使用方法

### 基本的なタイピング練習
1. 惑星を選択
2. 表示されるテキストを入力
3. リアルタイムで統計を確認
4. 結果を保存（オプション）

### 統計の確認
- **WPM**: 1分間の単語数
- **CPM**: 1分間の文字数
- **精度**: 正確性の割合
- **進捗**: 時間経過でのパフォーマンス

### 設定オプション
- テーマ切り替え
- 音效設定
- 統計表示オプション
- キーボードショートカット

## 🧪 テスト

### テストの実行
```bash
# ブラウザでテストを実行
# 開発者ツールのコンソールで以下を実行:
TestSuite.runAllTests();
```

### テストカバレッジ
- **ユニットテスト**: タイピングエンジン、統計計算
- **DOM操作テスト**: 要素作成、イベント処理
- **データ検証テスト**: 入力値の妥当性チェック
- **ローカルストレージテスト**: データ保存・読み込み

## 📊 パフォーマンス

### 最適化指標
- **First Contentful Paint**: < 1.5秒
- **Largest Contentful Paint**: < 2.5秒
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### 監視項目
- ページ読み込み速度
- タイピング応答性
- メモリ使用量
- ネットワークリクエスト

## 🔧 開発ガイド

### コード規約
- **ESLint**: JavaScriptコード品質
- **Prettier**: コードフォーマット
- **Semantic HTML**: アクセシビリティ重視
- **BEM**: CSS命名規則

### デバッグ
```javascript
// 開発者ツールでデバッグ情報を表示
localStorage.setItem('debug', 'true');
```

### ログレベル
- `console.log`: 一般情報
- `console.warn`: 警告
- `console.error`: エラー
- `console.debug`: デバッグ情報

## 🤝 コントリビューション

### 開発環境のセットアップ
1. リポジトリをフォーク
2. 機能ブランチを作成
3. 変更をコミット
4. プルリクエストを作成

### コーディング規約
- 意味のあるコミットメッセージ
- テストの追加
- ドキュメントの更新
- コードレビューの実施

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🆘 サポート

### よくある質問
- [使用方法ガイド](how-to-use.html)
- [お問い合わせ](contact.html)

### 問題の報告
1. GitHub Issuesでバグを報告
2. 再現手順を詳細に記載
3. ブラウザ情報とエラーログを添付

### 機能リクエスト
- 新機能の提案
- UI/UXの改善案
- パフォーマンス最適化

## 🔄 更新履歴

### v2.1.0 (2026-01-30)
- リファクタリング完了（完成度: 95%）
- ログレベル制御システム実装
- DOM操作ユーティリティ追加
- 統一的なエラーハンドリング実装
- 通知システム追加
- コード品質の大幅向上

### v2.0.0 (2026-01-30)
- 大規模リファクタリング実施
- モジュール化によるコード整理
- テストカバレッジ向上
- パフォーマンス最適化
- アクセシビリティ改善
- セキュリティ強化

### v1.0.0 (2024-01-XX)
- 初期リリース
- 基本的なタイピング機能
- Supabase統合
- レスポンシブデザイン
- テストスイート

## 📞 お問い合わせ

- **Email**: support@cosmic-typing-adventure.com
- **GitHub**: [Issues](https://github.com/yourusername/cosmic-typing-adventure/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/cosmic-typing-adventure/wiki)

---

**Cosmic Typing Adventure** - 宇宙でタイピングを学ぼう！🚀✨