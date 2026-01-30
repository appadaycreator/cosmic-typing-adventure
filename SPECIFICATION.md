# Cosmic Typing Adventure - 仕様書

**バージョン**: 2.0.0  
**最終更新**: 2026-01-30

## 📋 概要

Cosmic Typing Adventureは、宇宙探索をテーマにした革新的なタイピング練習アプリケーションです。楽しくタイピングスキルを向上させながら、宇宙船を操縦し、惑星を発見・探索できます。

## 🎯 プロジェクトの目的

1. **タイピングスキル向上**: WPM、正確性、キー認識の改善
2. **ゲーミフィケーション**: 楽しみながら継続的に練習できる仕組み
3. **アクセシビリティ**: すべてのユーザーが使いやすいインターフェース
4. **パフォーマンス**: 高速で快適な操作体験

## 🏗️ アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────┐
│         フロントエンド (静的)            │
│  HTML + CSS + Vanilla JavaScript        │
├─────────────────────────────────────────┤
│         ローカルストレージ              │
│  - ユーザーデータ                       │
│  - 統計情報                             │
│  - 設定                                 │
├─────────────────────────────────────────┤
│    オプション: Supabase連携             │
│  - クラウド同期                         │
│  - リアルタイムデータ                   │
└─────────────────────────────────────────┘
```

### ディレクトリ構造

```
cosmic-typing-adventure/
├── index.html              # ランディングページ
├── app.html               # メインアプリケーション
├── how-to-use.html        # 使用方法ガイド
├── contact.html           # お問い合わせ
├── terms.html             # 利用規約
├── privacy.html           # プライバシーポリシー
├── function.html          # 機能説明
├── manifest.json          # PWAマニフェスト
├── sw.js                 # Service Worker
├── .gitignore            # Git除外設定
├── README.md             # プロジェクト説明
├── SPECIFICATION.md      # 本ファイル
├── css/                  # スタイルシート
│   ├── common.css        # 共通スタイル
│   ├── app.css          # アプリケーションスタイル
│   ├── responsive.css   # レスポンシブデザイン
│   └── mobile-optimization.css # モバイル最適化
├── js/                   # JavaScriptファイル
│   ├── app.js           # メインアプリケーションロジック
│   ├── typing-engine.js # タイピングエンジン
│   ├── common.js        # 共通ユーティリティ
│   ├── supabase-config.js # Supabase設定
│   ├── security-utils.js # セキュリティ機能
│   ├── accessibility-utils.js # アクセシビリティ
│   ├── ux-utils.js      # UX改善機能
│   ├── language-manager.js # 多言語対応
│   ├── sound-manager.js # サウンド管理
│   ├── achievement-system.js # 実績システム
│   ├── ship-upgrade-system.js # 宇宙船強化
│   ├── time-attack-mode.js # タイムアタックモード
│   ├── kana-mapping.js  # かな入力マッピング
│   ├── audio-manager.js # オーディオ管理
│   ├── animation-manager.js # アニメーション管理
│   ├── performance-optimizer.js # パフォーマンス最適化
│   ├── mobile-optimizer.js # モバイル最適化
│   ├── advanced-analytics.js # 詳細分析
│   ├── pwa-installer.js # PWAインストール
│   └── core-debugger.js # デバッグツール
├── data/                 # データファイル
│   ├── practice-texts.json # 日本語練習テキスト
│   ├── practice-texts-en.json # 英語練習テキスト
│   ├── typing-stats.json # 統計データ
│   └── ui-translations.json # UI翻訳
├── images/               # 画像ファイル
│   ├── icons/           # アイコン
│   └── planets/         # 惑星画像
├── tests/               # テストファイル
│   ├── basic-tests.js   # 基本機能テスト
│   ├── core-tests.js    # コア機能テスト
│   ├── unit-tests.js    # ユニットテスト
│   ├── e2e-tests.js     # E2Eテスト
│   ├── security-tests.js # セキュリティテスト
│   ├── ux-tests.js      # UXテスト
│   ├── test-runner.html # テストランナー
│   └── test-suite.html  # テストスイート
├── sql/                 # SQLファイル
│   ├── 001-create-tables.sql # テーブル作成
│   ├── 002-insert-data.sql # 初期データ
│   └── cosmic_typing_adventure_supabase.sql # Supabase用スキーマ
└── docs/                # ドキュメント
    ├── API_SPECIFICATION.md # API仕様書
    ├── USER_GUIDE.md   # ユーザーガイド
    ├── SETUP_GUIDE.md  # セットアップガイド
    └── FAQ.md          # よくある質問
```

## 💡 主要機能

### 1. タイピング練習機能

#### 基本機能
- リアルタイムWPM計測
- 正確性トラッキング
- キー別統計分析
- ミスタイプ記録

#### ゲームモード
1. **基礎訓練**: 基本的なタイピング練習
2. **惑星探索**: 新しい惑星を発見
3. **高速航行**: スピード重視の訓練
4. **精密制御**: 正確性重視の訓練
5. **サバイバル**: ミス3回で終了

#### タイムアタックモード
- 30秒スプリント
- 1分クイック
- 3分マラソン
- 5分エンドレス

### 2. 宇宙船システム

#### 宇宙船ステータス
- **スピード**: WPMに基づく移動速度
- **燃料効率**: 正確性に基づく持続力
- **シールド**: コンボによる防御力

#### 宇宙船強化
1. **エンジン**: タイピング速度向上
2. **燃料システム**: 正確率ボーナス
3. **シールド**: ミス時ペナルティ軽減

#### 宇宙船種類
- スターターシップ (初期装備)
- スピードクルーザー (WPM 40以上で解放)
- エクスプローラー (惑星5個発見で解放)

### 3. 統計・分析機能

#### 基本統計
- 最高WPM / 平均WPM
- 最高正確率 / 平均正確率
- 総練習時間
- セッション数
- 発見した惑星数

#### 詳細分析
- 日別統計
- 週別統計
- 月別統計
- キー別分析
- 進歩トレンド
- 苦手キー分析

### 4. 実績システム

#### 実績カテゴリ
- 初回達成系
- スピード系
- 正確性系
- 探索系
- 継続系

### 5. UI/UX機能

#### アクセシビリティ
- スクリーンリーダー対応
- キーボードナビゲーション
- 高コントラストモード
- 文字サイズ調整 (極小〜特大)
- フォーカスリング明確化

#### モバイル最適化
- タッチターゲット最小56px (WCAG AAA基準)
- 16pxフォントサイズ (iOS自動ズーム防止)
- タッチフィードバック
- レスポンシブデザイン

#### 視覚的フィードバック
- 入力欄の太枠ボーダー (3px)
- フォーカス時のグロー効果
- エラー時のシェイクアニメーション
- プログレスバーのシマーアニメーション
- ボタンのホバー・アクティブ状態

### 6. PWA機能

- オフライン対応
- インストール可能
- プッシュ通知 (将来実装)
- バックグラウンド同期 (将来実装)

### 7. 多言語対応

- 日本語
- 英語
- UI翻訳データ管理

### 8. サウンド機能

- 効果音
- BGM
- キー入力音
- 実績解放音

## 🔧 技術仕様

### フロントエンド

#### HTML5
- セマンティックマークアップ
- ARIA属性
- メタタグ最適化

#### CSS3
- Flexbox
- Grid
- アニメーション
- トランジション
- カスタムプロパティ (CSS変数)
- メディアクエリ

#### JavaScript (ES6+)
- モジュールパターン
- Promise / Async/Await
- LocalStorage API
- Service Worker API
- Web Audio API

### ライブラリ・フレームワーク

#### CDN経由
- Tailwind CSS 2.2.19
- Font Awesome 6.4.0
- Chart.js (統計グラフ)
- Google Fonts (Orbitron, Noto Sans JP, Exo 2)

### バックエンド (オプション)

#### Supabase
- PostgreSQL データベース
- Row Level Security (RLS)
- リアルタイムサブスクリプション
- 認証 (匿名認証、メール/パスワード)

### パフォーマンス

#### 目標指標
- First Contentful Paint: < 1.5秒
- Largest Contentful Paint: < 2.5秒
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms
- Time to Interactive: < 3秒

#### 最適化手法
- 画像の遅延読み込み
- GPU アクセラレーション (will-change, transform)
- Debounce / Throttle
- レイアウト安定性 (contain プロパティ)

## 🔒 セキュリティ

### 実装事項
- XSS対策 (入力サニタイゼーション)
- CSRF対策
- CSP (Content Security Policy)
- HTTPS必須
- Row Level Security (Supabase)

### データ保護
- ローカルストレージの暗号化 (将来実装)
- 個人情報の最小化
- GDPR準拠

## 🧪 テスト

### テストカバレッジ目標
- 全体: 25%以上
- コア機能: 50%以上

### テストタイプ
1. **ユニットテスト**: 個別関数のテスト
2. **統合テスト**: モジュール間連携のテスト
3. **E2Eテスト**: エンドツーエンドのユーザーフロー
4. **セキュリティテスト**: XSS、CSRF等の検証
5. **UXテスト**: アクセシビリティ、レスポンシブデザイン

### テスト実行
```bash
# ブラウザでテストランナーを開く
open tests/test-suite.html
```

## 📊 データモデル

### LocalStorage

#### ユーザーデータ
```javascript
{
  userId: string,
  username: string,
  level: number,
  xp: number,
  createdAt: timestamp
}
```

#### 統計データ
```javascript
{
  sessions: [
    {
      id: string,
      missionType: string,
      wpm: number,
      accuracy: number,
      duration: number,
      timestamp: timestamp
    }
  ],
  totalSessions: number,
  totalTime: number,
  bestWPM: number,
  avgWPM: number,
  bestAccuracy: number,
  planetsDiscovered: number
}
```

#### 設定データ
```javascript
{
  language: 'ja' | 'en',
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  soundEnabled: boolean,
  musicEnabled: boolean,
  autoSave: boolean
}
```

### Supabase (オプション)

詳細は `docs/API_SPECIFICATION.md` を参照

## 🚀 デプロイ

### 静的ホスティング

#### GitHub Pages
```bash
git add .
git commit -m "Deploy"
git push origin main
# Settings > Pages > Source: main
```

#### Netlify
- リポジトリ連携
- 自動デプロイ

#### Vercel
```bash
vercel
```

### 環境変数 (Supabase使用時)

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📱 ブラウザサポート

### デスクトップ
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### モバイル
- iOS Safari 14+
- Chrome Android 90+
- Samsung Internet 14+

## 🔄 更新履歴

### v2.0.0 (2026-01-30)
- 大規模リファクタリング実施
- モジュール化によるコード整理
- テストカバレッジ向上
- パフォーマンス最適化
- アクセシビリティ改善
- セキュリティ強化

### v1.1.0 (2026-01-30)
- UI/UX大幅改善
- タイピング入力欄の視認性向上
- ボタン状態の明確化
- エラーフィードバック強化
- モバイル最適化
- プログレスバー改善

### v1.0.0 (2024-01-XX)
- 初期リリース

## 📝 今後の予定

### 短期 (1-3ヶ月)
- [ ] ダークモード/ライトモード切り替え
- [ ] カスタムテーマ
- [ ] ソーシャルログイン (Google, GitHub)
- [ ] リーダーボード

### 中期 (3-6ヶ月)
- [ ] マルチプレイヤーモード
- [ ] カスタム練習テキスト作成
- [ ] AI苦手分析の高度化
- [ ] プッシュ通知

### 長期 (6ヶ月以上)
- [ ] モバイルアプリ化 (React Native)
- [ ] 音声認識タイピング
- [ ] VRモード
- [ ] 教育機関向けプラン

## 🤝 貢献

### コントリビューションガイドライン

1. Issueを作成して議論
2. フィーチャーブランチを作成
3. コードを実装
4. テストを追加
5. プルリクエストを作成
6. レビューを受ける

### コーディング規約

- JavaScript: ES6+ 構文を使用
- インデント: スペース2個
- 命名規則: camelCase (関数・変数), PascalCase (クラス)
- コメント: 日本語で記述

## 📞 サポート

- GitHub Issues: [https://github.com/yourusername/cosmic-typing-adventure/issues](https://github.com/yourusername/cosmic-typing-adventure/issues)
- Email: support@cosmic-typing-adventure.com

## 📄 ライセンス

MIT License

---

**Cosmic Typing Adventure** - 宇宙でタイピングを学ぼう！🚀✨
