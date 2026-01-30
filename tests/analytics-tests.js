// Advanced Analytics Tests for Cosmic Typing Adventure

/**
 * Advanced Analytics Test Suite
 * 
 * このテストスイートは、AdvancedAnalyticsクラスの機能をテストします。
 */

export const AnalyticsTests = {
    name: 'Advanced Analytics Tests',
    
    tests: [
        {
            name: 'AdvancedAnalytics: 初期化',
            fn: () => {
                // Import不要、直接クラス参照
                const analytics = new window.AdvancedAnalytics();
                
                if (!analytics) {
                    throw new Error('AdvancedAnalyticsが初期化されませんでした');
                }
                
                if (!analytics.dailyStats || typeof analytics.dailyStats !== 'object') {
                    throw new Error('dailyStatsが初期化されていません');
                }
                
                if (!analytics.weeklyStats || typeof analytics.weeklyStats !== 'object') {
                    throw new Error('weeklyStatsが初期化されていません');
                }
                
                if (!analytics.monthlyStats || typeof analytics.monthlyStats !== 'object') {
                    throw new Error('monthlyStatsが初期化されていません');
                }
                
                if (!Array.isArray(analytics.progressTrends)) {
                    throw new Error('progressTrendsが配列として初期化されていません');
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: セッション記録',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                
                const sessionData = {
                    wpm: 50,
                    accuracy: 95,
                    duration: 60,
                    totalTyped: 100,
                    totalErrors: 5,
                    maxCombo: 10,
                    weakKeys: {
                        'a': 2,
                        'b': 1,
                        'c': 2
                    }
                };
                
                analytics.recordSession(sessionData);
                
                // 今日の日付のデータが記録されているか確認
                const today = new Date().toISOString().split('T')[0];
                
                if (!analytics.dailyStats[today]) {
                    throw new Error('今日の統計が記録されていません');
                }
                
                if (analytics.dailyStats[today].sessions !== 1) {
                    throw new Error('セッション数が正しくありません');
                }
                
                if (analytics.dailyStats[today].totalWPM !== 50) {
                    throw new Error('WPMが正しく記録されていません');
                }
                
                if (analytics.progressTrends.length !== 1) {
                    throw new Error('進歩トレンドが記録されていません');
                }
                
                if (Object.keys(analytics.keyAnalysis).length !== 3) {
                    throw new Error('キー分析が記録されていません');
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: 週キーの計算',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                const date = new Date('2026-01-30');
                const weekKey = analytics.getWeekKey(date.toISOString().split('T')[0]);
                
                if (!weekKey || typeof weekKey !== 'string') {
                    throw new Error('週キーが生成されませんでした');
                }
                
                if (!weekKey.match(/^\d{4}-W\d{2}$/)) {
                    throw new Error('週キーのフォーマットが正しくありません: ' + weekKey);
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: 月キーの計算',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                const date = new Date('2026-01-30');
                const monthKey = analytics.getMonthKey(date.toISOString().split('T')[0]);
                
                if (!monthKey || typeof monthKey !== 'string') {
                    throw new Error('月キーが生成されませんでした');
                }
                
                if (!monthKey.match(/^\d{4}-\d{2}$/)) {
                    throw new Error('月キーのフォーマットが正しくありません: ' + monthKey);
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: パフォーマンスチャートデータ取得',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                
                // 複数のセッションデータを追加
                for (let i = 0; i < 5; i++) {
                    analytics.recordSession({
                        wpm: 50 + i * 5,
                        accuracy: 90 + i,
                        duration: 60,
                        totalTyped: 100,
                        totalErrors: 5 - i,
                        maxCombo: 10 + i
                    });
                }
                
                const chartData = analytics.getPerformanceChartData();
                
                if (!chartData.labels || !Array.isArray(chartData.labels)) {
                    throw new Error('ラベルが生成されていません');
                }
                
                if (!chartData.wpmData || !Array.isArray(chartData.wpmData)) {
                    throw new Error('WPMデータが生成されていません');
                }
                
                if (!chartData.accuracyData || !Array.isArray(chartData.accuracyData)) {
                    throw new Error('正確率データが生成されていません');
                }
                
                if (chartData.labels.length !== 5) {
                    throw new Error('データ数が正しくありません');
                }
                
                // WPMデータの昇順確認
                if (chartData.wpmData[0] > chartData.wpmData[4]) {
                    throw new Error('WPMデータが正しくソートされていません');
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: キー統計チャートデータ取得',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                
                // セッションデータを追加
                analytics.recordSession({
                    wpm: 50,
                    accuracy: 95,
                    duration: 60,
                    totalTyped: 100,
                    totalErrors: 10,
                    maxCombo: 10,
                    weakKeys: {
                        'a': 5,
                        'b': 3,
                        'c': 2,
                        'd': 1,
                        'e': 4
                    }
                });
                
                const chartData = analytics.getKeyStatsChartData();
                
                if (!chartData.labels || !Array.isArray(chartData.labels)) {
                    throw new Error('ラベルが生成されていません');
                }
                
                if (!chartData.errorData || !Array.isArray(chartData.errorData)) {
                    throw new Error('エラーデータが生成されていません');
                }
                
                if (chartData.labels.length !== 5) {
                    throw new Error('データ数が正しくありません');
                }
                
                // エラー数の降順確認（最初が最多）
                if (chartData.errorData[0] !== 5) {
                    throw new Error('エラーデータが正しくソートされていません');
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: 統計サマリー取得',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                
                // 複数のセッションデータを追加
                analytics.recordSession({
                    wpm: 50,
                    accuracy: 95,
                    duration: 60,
                    totalTyped: 100,
                    totalErrors: 5,
                    maxCombo: 10
                });
                
                analytics.recordSession({
                    wpm: 55,
                    accuracy: 96,
                    duration: 65,
                    totalTyped: 110,
                    totalErrors: 4,
                    maxCombo: 12
                });
                
                const summary = analytics.getAnalyticsSummary();
                
                if (!summary || typeof summary !== 'object') {
                    throw new Error('サマリーが生成されていません');
                }
                
                if (summary.totalSessions !== 2) {
                    throw new Error('総セッション数が正しくありません');
                }
                
                if (summary.avgWPM !== 53) { // (50 + 55) / 2 = 52.5 -> 53
                    throw new Error('平均WPMが正しくありません: ' + summary.avgWPM);
                }
                
                if (summary.avgAccuracy !== 96) { // (95 + 96) / 2 = 95.5 -> 96
                    throw new Error('平均正確率が正しくありません: ' + summary.avgAccuracy);
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: 苦手キー取得',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                
                // セッションデータを追加
                analytics.recordSession({
                    wpm: 50,
                    accuracy: 95,
                    duration: 60,
                    totalTyped: 100,
                    totalErrors: 15,
                    maxCombo: 10,
                    weakKeys: {
                        'a': 5,
                        'b': 4,
                        'c': 3,
                        'd': 2,
                        'e': 1
                    }
                });
                
                const weakKeys = analytics.getWeakKeys();
                
                if (!Array.isArray(weakKeys)) {
                    throw new Error('苦手キーが配列として返されていません');
                }
                
                if (weakKeys.length > 10) {
                    throw new Error('苦手キーの数が10を超えています');
                }
                
                // 最もエラーが多いキーが最初にあることを確認
                if (weakKeys[0] !== 'a') {
                    throw new Error('苦手キーが正しくソートされていません');
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: 進歩トレンド取得',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                
                // 進歩が見られるデータを追加
                for (let i = 0; i < 20; i++) {
                    analytics.recordSession({
                        wpm: 30 + i * 2,
                        accuracy: 85 + i * 0.5,
                        duration: 60,
                        totalTyped: 100,
                        totalErrors: 15 - i,
                        maxCombo: 5 + i
                    });
                }
                
                const trend = analytics.getProgressTrend();
                
                if (!trend || typeof trend !== 'object') {
                    throw new Error('進歩トレンドが生成されていません');
                }
                
                if (typeof trend.wpmImprovement !== 'number') {
                    throw new Error('WPM改善値が数値ではありません');
                }
                
                if (typeof trend.accuracyImprovement !== 'number') {
                    throw new Error('正確率改善値が数値ではありません');
                }
                
                if (trend.trend !== 'improving' && trend.trend !== 'declining') {
                    throw new Error('トレンド判定が正しくありません');
                }
                
                // 進歩しているはず
                if (trend.trend !== 'improving') {
                    throw new Error('進歩トレンドが検出されていません');
                }
                
                return true;
            }
        },
        
        {
            name: 'AdvancedAnalytics: LocalStorageへの保存と読み込み',
            fn: () => {
                const analytics = new window.AdvancedAnalytics();
                
                // データを追加
                analytics.recordSession({
                    wpm: 60,
                    accuracy: 97,
                    duration: 70,
                    totalTyped: 120,
                    totalErrors: 3,
                    maxCombo: 15
                });
                
                // 保存
                analytics.saveAnalytics();
                
                // LocalStorageから直接読み込み
                const savedData = localStorage.getItem('cosmicTyping_analytics');
                
                if (!savedData) {
                    throw new Error('LocalStorageにデータが保存されていません');
                }
                
                const parsed = JSON.parse(savedData);
                
                if (!parsed.dailyStats || !parsed.progressTrends) {
                    throw new Error('保存データの構造が正しくありません');
                }
                
                // 新しいインスタンスで読み込み
                const analytics2 = new window.AdvancedAnalytics();
                
                const today = new Date().toISOString().split('T')[0];
                
                if (!analytics2.dailyStats[today]) {
                    throw new Error('保存されたデータが読み込まれていません');
                }
                
                // クリーンアップ
                localStorage.removeItem('cosmicTyping_analytics');
                
                return true;
            }
        }
    ],
    
    // すべてのテストを実行
    runAll() {
        console.log(`\n========== ${this.name} ==========\n`);
        
        let passed = 0;
        let failed = 0;
        
        this.tests.forEach(test => {
            try {
                const result = test.fn();
                if (result === true) {
                    console.log(`✅ PASS: ${test.name}`);
                    passed++;
                } else {
                    console.log(`❌ FAIL: ${test.name} - 期待される結果: true, 実際: ${result}`);
                    failed++;
                }
            } catch (error) {
                console.log(`❌ FAIL: ${test.name} - ${error.message}`);
                console.error(error);
                failed++;
            }
        });
        
        console.log(`\n========== テスト結果 ==========`);
        console.log(`✅ 成功: ${passed}`);
        console.log(`❌ 失敗: ${failed}`);
        console.log(`合計: ${this.tests.length}`);
        console.log(`成功率: ${((passed / this.tests.length) * 100).toFixed(1)}%\n`);
        
        return { passed, failed, total: this.tests.length };
    }
};

// グローバルスコープに公開
window.AnalyticsTests = AnalyticsTests;
