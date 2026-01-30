# Cosmic Typing Adventure - 仕様書

**バージョン**: 3.2.0  
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
├── text-manager.html      # テキスト管理ページ（NEW v2.2.0）
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
│   ├── text-manager.css # テキスト管理UIスタイル（NEW v2.2.0）
│   ├── responsive.css   # レスポンシブデザイン
│   └── mobile-optimization.css # モバイル最適化
├── js/                   # JavaScriptファイル
│   ├── app.js           # メインアプリケーションロジック
│   ├── typing-engine.js # タイピングエンジン
│   ├── common.js        # 共通ユーティリティ
│   ├── logger.js        # ログ管理システム（開発/本番環境対応）
│   ├── dom-utils.js     # DOM操作ユーティリティ（重複削減）
│   ├── error-handler.js # 統一的なエラーハンドリング
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
│   ├── core-debugger.js # デバッグツール
│   ├── text-manager.js  # テキスト管理システム（NEW v2.2.0）
│   └── text-manager-ui.js # テキスト管理UI（NEW v2.2.0）
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
│   ├── text-manager-tests.js # テキスト管理システムテスト（NEW v2.2.0）
│   ├── test-runner.html # テストランナー
│   └── test-suite.html  # テストスイート
├── sql/                 # SQLファイル
│   ├── 001-create-tables.sql # テーブル作成
│   ├── 002-insert-data.sql # 初期データ
│   ├── 003-update-practice-texts.sql # テキスト管理システム（NEW v2.2.0）
│   └── cosmic_typing_adventure_supabase.sql # Supabase用スキーマ
└── docs/                # ドキュメント
    ├── API_SPECIFICATION.md # API仕様書
    ├── USER_GUIDE.md   # ユーザーガイド
    ├── SETUP_GUIDE.md  # セットアップガイド
    └── FAQ.md          # よくある質問
```

## 💡 主要機能

### 1. タイピング練習機能

#### 日本語タイピングエンジン（v3.0.0新機能）
- **完全なかなマッピング**
  - 全ひらがな（あ〜ん）- 46文字
  - 全カタカナ（ア〜ン）- 46文字
  - 濁音（が、ざ、だ、ば）- 20文字
  - 半濁音（ぱ、ぴ、ぷ、ぺ、ぽ）- 5文字
  - 拗音（きゃ、しゅ、ちょ等）- 33組
  - 促音（っ）- 特殊処理
  - 「ん」- 文脈依存処理
- **柔軟なローマ字入力**
  - 複数パターン対応（例: "し" → "shi" / "si" / "ci"）
  - "じ"、"ず" などの濁音も複数パターン対応
  - 外来語音（ファ、ティ等）も完全サポート
- **リアルタイム入力候補表示**
  - 現在の入力を画面下部に表示
  - 可能な入力パターンを最大5つ表示
  - 残りの文字を太字でハイライト
- **高精度なトークナイザー**
  - 最長一致アルゴリズム
  - 拗音（2文字）を優先的にマッチング
  - 促音の次の文字を考慮した処理
- **視覚的フィードバック**
  - 入力済み文字 = 緑色（#10b981）
  - 現在入力中 = 青色（#3b82f6）+ 背景ハイライト
  - 未入力文字 = 灰色（#9ca3af）
  - エラー文字 = 赤色（#ef4444）+ 波線 + シェイクアニメーション

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
5. **サバイバルモード** ✅ (v3.1.0 実装完了)
   - **ライフシステム**: 最大3ライフ、ミス1回で-1ライフ
   - **ゲームオーバー条件**: ライフ0で即終了
   - **UI表示**: ❤️アイコンでライフ状態を可視化
   - **ライフ減少アニメーション**: シェイク効果で視覚的フィードバック
   - **ランク評価**: 結果に応じてS/A/B/C/Dランク付与
   - **リーダーボード**: 上位10位のハイスコア記録

#### タイムアタックモード ✅ (v3.1.0 実装完了)
- **30秒スプリント**: 瞬発力を試す超短期戦
- **1分クイック**: 集中力を試すクイック戦
- **3分マラソン**: 持久力を試すミドル戦
- **5分エンドレス**: 安定性を試すロング戦

**実装詳細**:
- **カウントダウンタイマー**: 残り時間をリアルタイム表示（MM:SS形式）
- **リアルタイムWPM**: 入力速度を秒単位で更新
- **タイムアップ処理**: 制限時間終了時に自動で結果表示
- **結果表示内容**:
  - WPM（Words Per Minute）
  - 正確率（Accuracy %）
  - 入力文字数（Total Typed）
  - 使用時間（Time Used）
  - CPM（Characters Per Minute）
  - ランク評価（S/A/B/C/D）
- **ランク評価基準**:
  - **Sランク**: スコア80以上（素晴らしい！完璧です！）
  - **Aランク**: スコア60-79（素晴らしい！）
  - **Bランク**: スコア40-59（良い調子です！）
  - **Cランク**: スコア20-39（もう少しです！）
  - **Dランク**: スコア20未満（練習を続けましょう）
  - スコア計算式: `WPM × (正確率 / 100)`

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

#### 詳細分析（v3.2.0実装）
- **パフォーマンス推移グラフ**
  - WPM推移（折れ線グラフ）
  - 正確率推移（折れ線グラフ）
  - 直近30セッションのデータ表示
  - 2軸グラフで同時表示
- **苦手キー分析グラフ**
  - エラー回数の棒グラフ
  - トップ15の苦手キー表示
  - 平均エラー数のツールチップ表示
- **練習時間の円グラフ**
  - 日別/週別/月別の時間配分
  - 最新7件のデータ表示
- **詳細統計タブ**
  - 日別統計（最新30日間）
  - 週別統計（最新12週間）
  - 月別統計（最新12ヶ月）
  - キー別分析（エラー頻度）
  - 進歩トレンド（最新30セッション）
- **データエクスポート**
  - CSV形式（日別統計データ）
  - JSON形式（全分析データ）
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

# ローカルサーバーを起動してテスト
python3 -m http.server 8080
# http://localhost:8080/tests/test-suite.html にアクセス
```

### テストカバレッジ
- 総テスト数: 30+ (v2.2.0時点)
- カバレッジ: 25%以上維持
- テキスト管理システム: 15テストケース追加

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

### v3.1.0 (2026-01-30) 🎮
- **ゲームモード完全実装**
  - **サバイバルモード**:
    - ライフシステム（最大3ライフ）実装
    - ライフ表示UI（❤️アイコン）追加
    - ミス時のライフ減少アニメーション
    - ゲームオーバー処理（ライフ0で即終了）
    - ハイスコア記録機能
  - **タイムアタックモード**:
    - 4つの制限時間（30秒/1分/3分/5分）実装
    - カウントダウンタイマー表示
    - リアルタイムWPM更新
    - タイムアップ時の結果表示
    - CPM（Characters Per Minute）計算
  - **ランク評価システム**:
    - S/A/B/C/Dランク自動判定
    - スコア計算（WPM × 正確率/100）
    - ランク別メッセージ表示
    - ランク別カラーコーディング
  - **リーダーボード機能**:
    - Supabase leaderboardテーブル作成（sql/004-create-leaderboard.sql）
    - モード別ランキング（survival, timeAttack）
    - 制限時間別フィルタリング（timeAttackのみ）
    - 上位10位の自動表示
    - 自動保存（Supabase + ローカルストレージ）
    - オフライン対応
- **新規ファイル追加**:
  - `js/game-mode-manager.js`: ゲームモード管理とランク評価
  - `tests/game-mode-tests.js`: ゲームモード専用テスト（40以上のテストケース）
  - `sql/004-create-leaderboard.sql`: リーダーボードテーブル定義
- **既存ファイル更新**:
  - `js/typing-engine.js`: サバイバル/タイムアタックロジック追加
  - `js/app.js`: ゲームモードマネージャー統合
  - `app.html`: ライフ表示UI追加

### v3.0.0 (2026-01-30) 🎉
- **日本語タイピングエンジン完全実装**
  - kana-mapping.js: 全300以上の文字・組み合わせをマッピング
  - typing-engine.js: トークナイザー改善、柔軟な入力パターンマッチング
  - 促音（っ）・「ん」の特殊処理実装
  - リアルタイム入力候補表示UI実装
- **視覚的フィードバック強化**
  - 4色の色分け（緑・青・灰・赤）
  - シェイクアニメーション追加
  - オートスクロール機能
- **包括的なテストスイート**
  - japanese-typing-tests.js: 100以上のテストケース
  - 全文字の入力パターンを検証
  - カバレッジ: ひらがな、カタカナ、濁音、半濁音、拗音、促音、特殊文字
- **UI/UX改善**
  - 入力候補表示エリア追加（app.html）
  - 現在の入力を常時表示
  - 可能なパターンを視覚的に提示

### v2.2.0 (2026-01-30)
- 練習テキストシステムの大幅拡充（200+テキスト）
- テキスト管理システム実装
  - カテゴリ別フィルタリング（日常会話・ビジネス・プログラミング・文学）
  - 難易度別フィルタリング（初級・中級・上級）
  - お気に入り機能
  - カスタムテキスト機能（手動入力・ファイルアップロード・URL読み込み）
- 習熟度に応じた自動出題機能
- Supabaseテーブル拡張（custom_texts、practice_textsのカテゴリシステム）
- テキスト統計機能（文字数・単語数・使用頻度）
- テストカバレッジ向上（25%以上維持）

### v2.1.0 (2026-01-30)
- リファクタリング完了（完成度: 95%）
- ログレベル制御システム実装（開発/本番環境の自動切り替え）
- DOM操作ユーティリティ追加（重複コード削減）
- 統一的なエラーハンドリングシステム実装
- 通知システム追加（視覚的フィードバック強化）
- コード品質の大幅向上（252箇所のconsole.log最適化）
- テストカバレッジ維持（25%以上）

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
