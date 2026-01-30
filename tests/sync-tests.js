// Sync System Tests for Cosmic Typing Adventure
// 同期システムの包括的なテスト

/**
 * テストスイート: 同期マネージャー
 */
export const syncTests = {
  name: '同期システムテスト',
  tests: []
};

// ============================================
// 1. 同期マネージャー基本機能テスト
// ============================================

syncTests.tests.push({
  name: '同期マネージャーが正しく初期化される',
  run: async () => {
    // 動的インポートを使用
    const { syncManager } = await import('../js/sync-manager.js');
    
    if (!syncManager) {
      throw new Error('同期マネージャーが初期化されていません');
    }
    
    const state = syncManager.getSyncState();
    if (!state) {
      throw new Error('同期状態を取得できません');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: '同期キューに操作を追加できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const initialLength = syncManager.syncQueue.length;
    
    const operation = {
      type: 'save_session',
      data: {
        planet: 'earth',
        wpm: 50,
        accuracy: 95,
        totalTyped: 100,
        totalErrors: 5,
        duration: 60,
        timestamp: new Date().toISOString()
      }
    };
    
    const itemId = syncManager.addToQueue(operation);
    
    if (!itemId) {
      throw new Error('操作IDが返されませんでした');
    }
    
    if (syncManager.syncQueue.length !== initialLength + 1) {
      throw new Error('キューに操作が追加されませんでした');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: 'キューから操作を削除できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const operation = {
      type: 'save_session',
      data: { planet: 'mars', wpm: 60 }
    };
    
    const itemId = syncManager.addToQueue(operation);
    const beforeLength = syncManager.syncQueue.length;
    
    syncManager.removeFromQueue(itemId);
    
    if (syncManager.syncQueue.length !== beforeLength - 1) {
      throw new Error('キューから操作が削除されませんでした');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: 'キューをローカルストレージに保存できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const operation = {
      type: 'save_session',
      data: { planet: 'jupiter', wpm: 70 }
    };
    
    syncManager.addToQueue(operation);
    syncManager.saveQueue();
    
    const saved = localStorage.getItem('sync_queue');
    if (!saved) {
      throw new Error('キューがローカルストレージに保存されませんでした');
    }
    
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error('保存されたキューが配列ではありません');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: 'キューをローカルストレージから復元できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const mockQueue = [
      {
        id: 'test-1',
        operation: 'save_session',
        data: { planet: 'saturn', wpm: 80 },
        timestamp: Date.now()
      }
    ];
    
    localStorage.setItem('sync_queue', JSON.stringify(mockQueue));
    
    syncManager.restoreQueue();
    
    if (syncManager.syncQueue.length === 0) {
      throw new Error('キューが復元されませんでした');
    }
    
    const restored = syncManager.syncQueue.find(item => item.id === 'test-1');
    if (!restored) {
      throw new Error('特定の操作が復元されませんでした');
    }
    
    return true;
  }
});

// ============================================
// 2. 同期状態管理テスト
// ============================================

syncTests.tests.push({
  name: '同期状態を取得できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const state = syncManager.getSyncState();
    
    if (typeof state.status === 'undefined') {
      throw new Error('同期状態が取得できません');
    }
    
    if (typeof state.isOnline === 'undefined') {
      throw new Error('オンライン状態が取得できません');
    }
    
    if (typeof state.queueLength === 'undefined') {
      throw new Error('キュー長が取得できません');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: '同期状態を更新できる',
  run: async () => {
    const { syncManager, SyncStatus } = await import('../js/sync-manager.js');
    
    syncManager.updateSyncStatus(SyncStatus.SYNCING);
    
    if (syncManager.syncStatus !== SyncStatus.SYNCING) {
      throw new Error('同期状態が更新されませんでした');
    }
    
    syncManager.updateSyncStatus(SyncStatus.SUCCESS);
    
    if (syncManager.syncStatus !== SyncStatus.SUCCESS) {
      throw new Error('同期状態が2回目の更新で変更されませんでした');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: '同期リスナーを登録できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    let eventReceived = false;
    
    const unsubscribe = syncManager.addSyncListener((event) => {
      eventReceived = true;
    });
    
    syncManager.notifySyncListeners({ type: 'test' });
    
    if (!eventReceived) {
      throw new Error('リスナーがイベントを受信しませんでした');
    }
    
    unsubscribe();
    
    return true;
  }
});

syncTests.tests.push({
  name: '同期リスナーの登録を解除できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    let eventCount = 0;
    
    const unsubscribe = syncManager.addSyncListener(() => {
      eventCount++;
    });
    
    syncManager.notifySyncListeners({ type: 'test1' });
    unsubscribe();
    syncManager.notifySyncListeners({ type: 'test2' });
    
    if (eventCount !== 1) {
      throw new Error('リスナーの登録解除が機能していません');
    }
    
    return true;
  }
});

// ============================================
// 3. リトライメカニズムテスト
// ============================================

syncTests.tests.push({
  name: 'リトライカウントが正しく増加する',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const item = {
      id: 'retry-test-1',
      operation: 'save_session',
      data: {},
      retryCount: 0
    };
    
    await syncManager.handleSyncFailure(item, new Error('Test error'));
    
    if (item.retryCount !== 1) {
      throw new Error('リトライカウントが増加しませんでした');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: '最大リトライ回数に達すると失敗状態になる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const item = {
      id: 'retry-test-2',
      operation: 'save_session',
      data: {},
      retryCount: syncManager.maxRetries - 1
    };
    
    await syncManager.handleSyncFailure(item, new Error('Test error'));
    
    if (item.status !== 'failed') {
      throw new Error('最大リトライ回数に達しても失敗状態になりませんでした');
    }
    
    return true;
  }
});

// ============================================
// 4. データ競合解決テスト
// ============================================

syncTests.tests.push({
  name: '競合をローカルストレージに保存できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const conflict = {
      id: 'conflict-1',
      timestamp: Date.now(),
      item: { operation: 'save_session' },
      conflictData: { resolution: 'local_newer' }
    };
    
    syncManager.saveConflict(conflict);
    
    const conflicts = syncManager.getConflicts();
    const found = conflicts.find(c => c.id === 'conflict-1');
    
    if (!found) {
      throw new Error('競合が保存されませんでした');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: '競合をクリアできる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    syncManager.saveConflict({
      id: 'conflict-2',
      timestamp: Date.now()
    });
    
    syncManager.clearConflicts();
    
    const conflicts = syncManager.getConflicts();
    
    if (conflicts.length !== 0) {
      throw new Error('競合がクリアされませんでした');
    }
    
    return true;
  }
});

// ============================================
// 5. 操作タイプ別テスト
// ============================================

syncTests.tests.push({
  name: '操作タイプからテーブル名を取得できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const mapping = {
      'save_session': 'typing_sessions',
      'save_preferences': 'user_preferences',
      'save_achievement': 'achievements',
      'save_leaderboard': 'leaderboard',
      'save_custom_text': 'custom_texts'
    };
    
    for (const [operation, expectedTable] of Object.entries(mapping)) {
      const tableName = syncManager.getTableNameForOperation(operation);
      if (tableName !== expectedTable) {
        throw new Error(`操作 ${operation} のテーブル名が正しくありません: ${tableName}`);
      }
    }
    
    return true;
  }
});

// ============================================
// 6. ユーティリティ関数テスト
// ============================================

syncTests.tests.push({
  name: 'ユニークIDを生成できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const id1 = syncManager.generateId();
    const id2 = syncManager.generateId();
    
    if (!id1 || !id2) {
      throw new Error('IDが生成されませんでした');
    }
    
    if (id1 === id2) {
      throw new Error('生成されたIDが重複しています');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: 'キューをクリアできる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    syncManager.addToQueue({
      type: 'save_session',
      data: {}
    });
    
    syncManager.clearQueue();
    
    if (syncManager.syncQueue.length !== 0) {
      throw new Error('キューがクリアされませんでした');
    }
    
    return true;
  }
});

// ============================================
// 7. 同期UIテスト
// ============================================

syncTests.tests.push({
  name: '同期UIが初期化される',
  run: async () => {
    const { syncUI } = await import('../js/sync-ui.js');
    
    syncUI.initialize();
    
    if (!syncUI.isInitialized) {
      throw new Error('同期UIが初期化されませんでした');
    }
    
    const indicator = document.getElementById('sync-indicator');
    if (!indicator) {
      throw new Error('同期インジケーターが作成されませんでした');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: '同期インジケーターのアイコンが状態に応じて変わる',
  run: async () => {
    const { syncUI } = await import('../js/sync-ui.js');
    const { SyncStatus } = await import('../js/sync-manager.js');
    
    syncUI.initialize();
    
    // テスト用の状態を設定
    syncUI.updateIndicator({
      status: SyncStatus.SYNCING,
      isOnline: true,
      queueLength: 0
    });
    
    const icon = document.getElementById('sync-icon');
    if (!icon) {
      throw new Error('同期アイコンが見つかりません');
    }
    
    if (icon.textContent !== '🔄') {
      throw new Error('同期中アイコンが正しくありません');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: '同期詳細パネルを表示/非表示できる',
  run: async () => {
    const { syncUI } = await import('../js/sync-ui.js');
    
    syncUI.initialize();
    
    syncUI.showDetailPanel();
    
    const panel = document.getElementById('sync-detail-panel');
    if (!panel || panel.style.display === 'none') {
      throw new Error('詳細パネルが表示されませんでした');
    }
    
    syncUI.hideDetailPanel();
    
    if (panel.style.display !== 'none') {
      throw new Error('詳細パネルが非表示になりませんでした');
    }
    
    return true;
  }
});

// ============================================
// 8. Supabase統合テスト
// ============================================

syncTests.tests.push({
  name: 'セッションデータがローカルストレージに保存される',
  run: async () => {
    const { TypingStats } = await import('../js/supabase-config.js');
    
    const sessionData = {
      planet: 'earth',
      wpm: 50,
      accuracy: 95,
      totalTyped: 100,
      totalErrors: 5,
      duration: 60
    };
    
    const result = TypingStats.saveToLocalStorage(sessionData);
    
    if (!result) {
      throw new Error('セッションデータがローカルストレージに保存されませんでした');
    }
    
    const saved = localStorage.getItem('typing_sessions');
    if (!saved) {
      throw new Error('ローカルストレージにデータが見つかりません');
    }
    
    const sessions = JSON.parse(saved);
    const latest = sessions[sessions.length - 1];
    
    if (latest.planet !== 'earth' || latest.wpm !== 50) {
      throw new Error('保存されたデータが正しくありません');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: 'ローカル履歴を取得できる',
  run: async () => {
    const { TypingStats } = await import('../js/supabase-config.js');
    
    const history = TypingStats.getLocalHistory(10);
    
    if (!Array.isArray(history)) {
      throw new Error('履歴が配列ではありません');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: 'ローカル統計を計算できる',
  run: async () => {
    const { TypingStats } = await import('../js/supabase-config.js');
    
    const stats = TypingStats.getLocalOverallStats();
    
    if (typeof stats.totalSessions === 'undefined') {
      throw new Error('統計が正しく計算されていません');
    }
    
    if (typeof stats.avgWpm === 'undefined') {
      throw new Error('平均WPMが計算されていません');
    }
    
    return true;
  }
});

// ============================================
// 9. ネットワーク状態テスト
// ============================================

syncTests.tests.push({
  name: 'オンライン状態を検出できる',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    const state = syncManager.getSyncState();
    
    // navigator.onLineの状態を確認
    if (typeof state.isOnline !== 'boolean') {
      throw new Error('オンライン状態が正しく検出されていません');
    }
    
    return true;
  }
});

// ============================================
// 10. エッジケーステスト
// ============================================

syncTests.tests.push({
  name: 'ローカルストレージが満杯の場合に古いデータを削除する',
  run: async () => {
    const { TypingStats } = await import('../js/supabase-config.js');
    
    // 100個以上のセッションを追加
    for (let i = 0; i < 105; i++) {
      TypingStats.saveToLocalStorage({
        planet: 'earth',
        wpm: 50 + i,
        accuracy: 95,
        totalTyped: 100,
        totalErrors: 5,
        duration: 60
      });
    }
    
    const sessions = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
    
    if (sessions.length > 100) {
      throw new Error('古いデータが削除されませんでした');
    }
    
    return true;
  }
});

syncTests.tests.push({
  name: '空のキューを同期しても エラーにならない',
  run: async () => {
    const { syncManager } = await import('../js/sync-manager.js');
    
    syncManager.clearQueue();
    
    // 空のキューを同期（エラーが発生しないことを確認）
    await syncManager.syncAllQueued();
    
    return true;
  }
});

// テスト実行関数
export async function runSyncTests() {
  console.log('🧪 同期システムテスト開始...\n');
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const test of syncTests.tests) {
    try {
      await test.run();
      console.log(`✅ ${test.name}`);
      passed++;
      results.push({ name: test.name, passed: true });
    } catch (error) {
      console.error(`❌ ${test.name}`);
      console.error(`   エラー: ${error.message}`);
      failed++;
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }
  
  console.log(`\n📊 テスト結果: ${passed}/${syncTests.tests.length} 成功`);
  
  if (failed > 0) {
    console.log(`⚠️ ${failed} 件のテストが失敗しました`);
  } else {
    console.log('🎉 すべてのテストが成功しました！');
  }
  
  return {
    total: syncTests.tests.length,
    passed,
    failed,
    results
  };
}
