# 同期システム仕様書

**バージョン**: 1.0.0  
**最終更新**: 2026-01-31

## 📋 概要

Cosmic Typing Adventureの同期システムは、完全なオフライン/オンライン対応を実現し、データの整合性を保ちながらシームレスなユーザー体験を提供します。

## 🎯 主要機能

### 1. オフラインキュー

- **自動キューイング**: オフライン時の操作を自動的にキューに追加
- **永続化**: ローカルストレージにキューを保存
- **自動復元**: ページ再読み込み時にキューを復元
- **優先度管理**: 操作タイプに応じた優先順位付け

### 2. オンライン復帰時の自動同期

- **即座の同期**: ネットワーク復帰を検知して自動同期
- **バッチ処理**: 複数の操作を効率的に一括送信
- **順序保証**: 操作の実行順序を保持

### 3. リトライメカニズム

- **指数バックオフ**: 失敗時に待機時間を段階的に増加（2秒 → 4秒 → 8秒）
- **最大リトライ回数**: デフォルト3回
- **エラー追跡**: 各操作の失敗原因と履歴を記録
- **自動リカバリー**: 一時的なネットワークエラーから自動復旧

### 4. データ競合解決

- **タイムスタンプベース**: 最新データを優先する自動解決
- **競合検出**: ローカルとリモートのデータを比較
- **競合記録**: 発生した競合を保存して後から確認可能
- **手動解決オプション**: 必要に応じてユーザーが解決方法を選択

### 5. 同期状態インジケーター

#### ステータス表示

| アイコン | 状態 | 説明 |
|---------|------|------|
| 🔄 | 同期中 | データを同期しています |
| ✅ | 完了 | 同期が成功しました |
| ❌ | エラー | 同期に失敗しました |
| 📡 | オフライン | ネットワークに接続されていません |

#### 詳細パネル

- ネットワーク状態
- 同期状態
- キュー内の操作数
- 最終同期時刻
- 競合数
- キュー内容の一覧表示

## 🏗️ アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────┐
│         アプリケーション層               │
│  (app.js, typing-engine.js など)        │
├─────────────────────────────────────────┤
│         同期マネージャー                 │
│  - オフラインキュー管理                  │
│  - リトライロジック                      │
│  - 競合解決                              │
├─────────────────────────────────────────┤
│         Supabase設定層                   │
│  - API呼び出し                           │
│  - ローカルストレージフォールバック      │
├─────────────────────────────────────────┤
│         ストレージ層                     │
│  ┌─────────────┬─────────────────────┐  │
│  │ Supabase    │ LocalStorage        │  │
│  │ (オンライン) │ (オフライン)         │  │
│  └─────────────┴─────────────────────┘  │
└─────────────────────────────────────────┘
```

### モジュール構成

#### 1. sync-manager.js

**役割**: 同期システムの中核を担うマネージャー

**主要クラス**:
- `SyncManager`: 同期処理の統括

**主要メソッド**:
- `addToQueue(operation)`: キューに操作を追加
- `syncAllQueued()`: キュー内の全操作を同期
- `syncOperation(item)`: 単一操作の同期
- `handleSyncFailure(item, error)`: 失敗時の処理
- `handleConflict(item, conflictData)`: 競合処理

#### 2. sync-ui.js

**役割**: 同期状態の視覚的フィードバック

**主要クラス**:
- `SyncUI`: UIコンポーネント管理

**主要メソッド**:
- `initialize()`: UI初期化
- `updateIndicator(state)`: インジケーター更新
- `showDetailPanel()`: 詳細パネル表示
- `handleSyncEvent(event)`: 同期イベント処理

#### 3. supabase-config.js (拡張)

**役割**: Supabase APIとの統合、フォールバック処理

**拡張機能**:
- 同期マネージャーとの連携
- ローカルデータの同期状態追跡
- 未同期データのマージ処理

## 💾 データモデル

### 同期キュー（LocalStorage: `sync_queue`）

```javascript
[
  {
    id: "1643724000000-abc123",
    timestamp: 1643724000000,
    operation: "save_session",
    data: {
      planet: "earth",
      wpm: 50,
      accuracy: 95,
      // ... その他のデータ
    },
    retryCount: 0,
    status: "pending",
    lastError: null,
    lastAttempt: null
  }
]
```

### 同期状態（LocalStorage: `sync_state`）

```javascript
{
  lastSyncTime: 1643724000000,
  syncStatus: "success",
  queueLength: 0
}
```

### 競合記録（LocalStorage: `sync_conflicts`）

```javascript
[
  {
    id: "conflict-1",
    timestamp: 1643724000000,
    item: {
      operation: "save_session",
      data: { /* ローカルデータ */ }
    },
    conflictData: {
      local: { /* ローカルバージョン */ },
      remote: { /* リモートバージョン */ },
      resolution: "local_newer"
    }
  }
]
```

## 🔄 同期フロー

### 1. データ保存時

```
1. アプリケーションがデータを保存
   ↓
2. ローカルストレージに即座に保存（成功保証）
   ↓
3. 同期キューに操作を追加
   ↓
4. オンライン状態を確認
   ↓
5a. オンライン → 即座に同期開始
5b. オフライン → キューに保持
```

### 2. オンライン復帰時

```
1. ネットワークイベント検知
   ↓
2. 同期状態を更新（IDLE）
   ↓
3. キュー内の操作数を確認
   ↓
4. 同期開始（syncAllQueued）
   ↓
5. 各操作を順次処理
   ↓
6. 成功 → キューから削除
   失敗 → リトライスケジュール
   競合 → 競合解決処理
   ↓
7. 結果をUIに反映
```

### 3. リトライフロー

```
1. 同期失敗を検知
   ↓
2. リトライカウントを増加
   ↓
3. 最大リトライ回数チェック
   ↓
4a. 未達成 → 指数バックオフで再スケジュール
4b. 達成 → 失敗状態に設定、通知
```

### 4. 競合解決フロー

```
1. データ競合を検知（Unique制約違反など）
   ↓
2. ローカルとリモートのタイムスタンプ比較
   ↓
3a. ローカルが新しい → リモートを上書き
3b. リモートが新しい → ローカルを破棄
3c. 同時刻 → リモートを優先
   ↓
4. 競合を記録
   ↓
5. 解決結果を適用
```

## 🔧 設定とカスタマイズ

### 同期マネージャー設定

```javascript
// js/sync-manager.js 内
class SyncManager {
  constructor() {
    this.maxRetries = 3;              // 最大リトライ回数
    this.retryDelay = 2000;           // 初回リトライ待機時間（ms）
    this.autoSyncInterval = 5 * 60 * 1000;  // 自動同期間隔（5分）
    this.conflictResolution = 'latest';      // 競合解決戦略
  }
}
```

### 競合解決戦略

- `'latest'`: タイムスタンプベースで最新を優先（デフォルト）
- `'manual'`: ユーザーが手動で解決

## 🧪 テスト

### テストカバレッジ

同期システムは30以上のテストケースでカバーされています：

#### 基本機能テスト（8件）
- 同期マネージャー初期化
- キュー追加/削除
- キュー保存/復元

#### 同期状態管理テスト（4件）
- 状態取得/更新
- リスナー登録/解除

#### リトライメカニズムテスト（2件）
- リトライカウント増加
- 最大リトライ到達時の処理

#### データ競合解決テスト（2件）
- 競合保存
- 競合クリア

#### UIテスト（3件）
- UI初期化
- インジケーター更新
- 詳細パネル表示

#### Supabase統合テスト（3件）
- ローカルストレージ保存
- 履歴取得
- 統計計算

#### エッジケーステスト（2件）
- ストレージ満杯時の処理
- 空キュー同期

### テスト実行

```bash
# ローカルサーバーを起動
python3 -m http.server 8000

# ブラウザで開く
open http://localhost:8000/tests/test-suite.html
```

コンソールで同期テストを実行：

```javascript
// ブラウザコンソールで
await runSyncTests();
```

## 📊 パフォーマンス

### 最適化手法

1. **バッチ処理**: 複数の操作を一括処理
2. **遅延評価**: 必要になるまで同期を遅延
3. **サイズ制限**: ローカルストレージは最大100セッションまで
4. **効率的なデータ構造**: マップとセットを活用

### パフォーマンス目標

| 指標 | 目標値 |
|------|--------|
| キュー追加時間 | < 10ms |
| 単一操作同期時間 | < 500ms |
| バッチ同期時間（10件） | < 3秒 |
| UI更新レスポンス | < 100ms |

## 🔒 セキュリティ

### 実装済み対策

1. **データ検証**: 入力データのサニタイゼーション
2. **エラーハンドリング**: 安全なエラー処理とロギング
3. **ローカルストレージ保護**: XSS対策
4. **API認証**: Supabaseの認証機能を使用

### 将来の拡張

- ローカルストレージの暗号化
- エンドツーエンド暗号化
- 署名検証

## 🚀 使用例

### 基本的な使用

```javascript
// アプリケーション初期化時
import { syncManager } from './sync-manager.js';
import { syncUI } from './sync-ui.js';

// 同期UIを初期化
syncUI.initialize();

// データ保存時（自動的にキューに追加される）
await TypingStats.saveSession(sessionData);
```

### 手動同期のトリガー

```javascript
// ユーザーが手動で同期をトリガー
await syncManager.triggerManualSync();
```

### 同期状態の監視

```javascript
// 同期イベントをリッスン
const unsubscribe = syncManager.addSyncListener((event) => {
  console.log('同期イベント:', event.type);
  
  switch (event.type) {
    case 'status_changed':
      console.log('新しい状態:', event.status);
      break;
    case 'sync_completed':
      console.log('同期完了:', event.results);
      break;
    case 'conflict_detected':
      console.log('競合検出:', event.conflict);
      break;
  }
});

// クリーンアップ
unsubscribe();
```

### 現在の同期状態の取得

```javascript
const state = syncManager.getSyncState();
console.log('同期状態:', state);
// {
//   status: 'success',
//   isOnline: true,
//   isSyncing: false,
//   queueLength: 0,
//   lastSyncTime: 1643724000000,
//   conflicts: 0
// }
```

## 🐛 トラブルシューティング

### よくある問題と解決策

#### 1. 同期が開始されない

**症状**: オンラインなのに同期が実行されない

**確認事項**:
- ブラウザのコンソールでエラーを確認
- `syncManager.getSyncState()` で状態を確認
- ローカルストレージの `sync_queue` を確認

**解決策**:
```javascript
// 手動で同期をトリガー
await syncManager.triggerManualSync();
```

#### 2. 競合が繰り返し発生する

**症状**: 同じデータで何度も競合が発生

**確認事項**:
- タイムスタンプが正しく設定されているか確認
- ローカルストレージの `sync_conflicts` を確認

**解決策**:
```javascript
// 競合をクリア
syncManager.clearConflicts();

// キューをクリア（注意: 未同期データが失われます）
syncManager.clearQueue();
```

#### 3. UIが更新されない

**症状**: 同期状態がUIに反映されない

**確認事項**:
- `syncUI.initialize()` が呼ばれているか確認
- ブラウザのコンソールでエラーを確認

**解決策**:
```javascript
// UIを再初期化
syncUI.destroy();
syncUI.initialize();
```

#### 4. ローカルストレージが満杯

**症状**: QuotaExceededError が発生

**解決策**:
```javascript
// 古いセッションデータを削除（自動で100件に制限）
const sessions = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
console.log('セッション数:', sessions.length);

// 手動でクリア
localStorage.removeItem('typing_sessions');
```

## 📝 開発ガイドライン

### 新しい操作タイプの追加

1. **操作タイプを定義**

```javascript
// sync-manager.js の syncOperation メソッドに追加
case 'save_custom_data':
  return await this.syncCustomData(item);
```

2. **同期メソッドを実装**

```javascript
async syncCustomData(item) {
  try {
    const { data, error } = await window.supabaseClient
      .from('custom_table')
      .insert([item.data]);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
```

3. **テーブルマッピングを追加**

```javascript
// getTableNameForOperation メソッドに追加
const mapping = {
  // ...既存のマッピング
  'save_custom_data': 'custom_table'
};
```

### コーディング規約

- **エラーハンドリング**: すべての非同期操作にtry-catchを使用
- **ロギング**: `logger` を使用して適切にログを記録
- **命名規則**: camelCaseを使用
- **コメント**: 日本語で記述
- **型チェック**: 適切な型チェックを実施

## 🔮 今後の予定

### 短期（1-2ヶ月）
- [ ] 同期進捗バーの追加
- [ ] より詳細なエラーメッセージ
- [ ] オフライン時の通知改善

### 中期（3-6ヶ月）
- [ ] 同期優先度システム
- [ ] 部分同期機能
- [ ] バックグラウンド同期（Service Worker）
- [ ] 同期統計ダッシュボード

### 長期（6ヶ月以上）
- [ ] P2P同期
- [ ] デバイス間同期
- [ ] リアルタイム同期
- [ ] オフラインファースト完全対応

## 📚 参考資料

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [LocalStorage API](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)
- [Service Worker API](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [オフラインファーストの設計パターン](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook)

---

**Cosmic Typing Adventure** - 完全なオフライン/オンライン同期で、どこでもタイピング練習！🚀✨
