# タイピング練習【無料】宇宙テーマで楽しく速度アップ！ - 技術仕様書

## 概要

**サービス名**: Cosmic Typing Adventure
**バージョン**: 1.1.2
**更新日**: 2026-05-28
**URL**: https://appadaycreator.com/cosmic-typing-adventure/

タイピング速度（WPM）を測定しながら宇宙探索ゲームで楽しく練習。プログラミング学習・在宅ワーク・事務職に必須のタイピング力を無料でスキルアップ。苦手キー克服機能付き。

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 使い方

1. 時間をプリセットまたは手入力で設定する
2. 必要に応じてオプション設定を行う
3. スタートボタンをクリックして開始する
4. 残り時間を確認しながら作業・発表を進める
5. 一時停止・リセットボタンで時間を管理する

## 変更履歴

### v1.1.5 (2026-05-29) - アクセシビリティ・パフォーマンス改善
- **P1**: app.html の currentWPM/currentAccuracy/currentCombo/liveWPM/liveAccuracy/timeAttackWPM/timeAttackAccuracy/timeAttackCombo に aria-live="polite" aria-atomic="true" 追加（スクリーンリーダー対応）
- **P2**: index.html の console.log (初期化・言語切替・フォントサイズ・SW登録・ページ時間計測・パフォーマンス計測) を削除
- **P3**: css/app.css progress-fill の transition を width→transform(scaleX) に変更しレイアウトリフロー排除
- **P3**: css/mobile-optimization.css の progress-fill transition も同様に更新
- **P3**: js/ux-utils.js の progress bar 更新ロジックを style.width→style.transform(scaleX) に変更

### v1.1.2 (2026-05-28) - 全ページFont Awesome完全廃止・PWA統一
- **P1**: how-to-use.html の Font Awesome CDN削除 + 91アイコンを絵文字に置換
- **P1**: contact.html / privacy.html / terms.html の Font Awesome CDN削除・絵文字統一
- **P2**: how-to-use.html に theme-color/manifest/apple-touch-icon 追加・favicon/og:url修正
- **P2**: text-manager.html に theme-color/manifest/apple-touch-icon/OGPタグ追加
- **P2**: app.html に manifest/apple-touch-icon 追加
- **P3**: how-to-use.html の console.log 削除

### v1.1.1 (2026-05-28) - アクセシビリティ・PWA品質改善
- **P1**: index.html の未ロード Font Awesome アイコン（ソーシャルシェアボタン・フッター）を絵文字に置換
- **P1**: text-manager.html の Font Awesome CDN リンクを削除し、絵文字に統一
- **P2**: manifest.json の theme_color を index.html と統一（#6366F1）
- **P2**: sw.js の不要な console.log を削除してログ出力を抑制
- **P3**: index.html の role 属性重複（role="group" + role="main"）を role="region" に修正

### v1.1.0 (2026-05-28) - コード品質改善
- **P1**: Font Awesome CDN依存を廃止し、絵文字アイコンに統一（index.html / app.html）
- **P1**: console.log をloggerインスタンス経由に統一（14ファイル・131箇所）
- **P2**: ライトモード対応CSS追加（data-theme="light" / prefers-color-scheme）
- **P2**: テーマ切り替えボタンを設定パネルに追加
- **P2**: エラーメッセージの日本語化・ユーザーフレンドリー化拡充
- **P3**: Service Workerキャッシュバージョンを日付ベースに更新（v20260528）
- **P4**: LINEシェアボタンを結果パネルに追加

## よくある質問（FAQ）

**Q: タイピング練習は無料で使えますか？**

はい、完全無料・登録不要でご利用いただけます。

**Q: スマートフォンで使えますか？**

はい、スマートフォン・タブレット・PCすべてでご利用いただけます。

**Q: 途中で一時停止できますか？**

はい、一時停止ボタンで止めて、再開することができます。

**Q: カスタムの時間を設定できますか？**

はい、プリセット以外に任意の時間を直接入力して設定できます。

**Q: 時間終了時に通知はありますか？**

画面上でアラート表示します。ブラウザの設定によって音声が出る場合があります。


## 関連サービス

- [睡眠の質チェッカー](https://appadaycreator.com/sleep-quality-checker/)
- [BMI・体重管理](https://appadaycreator.com/bmi-body-tracker/)
- [家計簿診断](https://appadaycreator.com/household-budget-analyzer/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License

## 変更履歴

- v1.1.4 (2026-05-29): Font Awesome完全廃止(絵文字置換)・ブランドカラー統一(app.html #7c3aed)・core-debugger console.log debugMode化・OGP自己ホスト化・モーダルARIA追加
- v1.1.3 (2026-05-29): app.html OGP追加・aria-label拡充・app.js console.log削除
