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

## 🚀 クイックスタート

### 前提条件
- モダンブラウザ（Chrome、Firefox、Safari、Edge）
- Supabaseアカウント（オプション）

### ローカル開発

1. **リポジトリのクローン**
```bash
git clone https://github.com/yourusername/cosmic-typing-adventure.git
cd cosmic-typing-adventure
```

2. **ローカルサーバーの起動**
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

### Supabase設定（オプション）

1. **Supabaseプロジェクトの作成**
   - [Supabase](https://supabase.com)でアカウント作成
   - 新しいプロジェクトを作成

2. **データベースのセットアップ**
   ```sql
   -- sql/001-create-tables.sql を実行
   ```

3. **環境変数の設定**
   ```javascript
   // js/supabase-config.js を編集
   const SUPABASE_URL = 'your-supabase-url';
   const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
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
├── css/
│   ├── common.css         # 共通スタイル
│   ├── app.css           # アプリ固有スタイル
│   └── responsive.css     # レスポンシブデザイン
├── js/
│   ├── app.js            # メインアプリケーションロジック
│   ├── typing-engine.js  # タイピングエンジン
│   ├── common.js         # 共通ユーティリティ
│   └── supabase-config.js # Supabase設定
├── data/
│   ├── practice-texts.json # 練習テキスト
│   └── typing-stats.json  # 統計データ
├── sql/
│   ├── 001-create-tables.sql # データベーススキーマ
│   └── 002-insert-data.sql   # 初期データ
├── tests/
│   ├── test-runner.html   # テストランナー
│   ├── unit-tests.js      # ユニットテスト
│   └── e2e-tests.js       # E2Eテスト
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
# ブラウザでテストランナーを開く
http://localhost:8000/tests/test-runner.html
```

### テストカバレッジ
- **ユニットテスト**: タイピングエンジン、統計計算
- **E2Eテスト**: ユーザーフロー、レスポンシブデザイン
- **統合テスト**: Supabase接続、データ保存

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