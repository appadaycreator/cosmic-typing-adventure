// Advanced Analytics for Cosmic Typing Adventure

export class AdvancedAnalytics {
    constructor() {
        this.dailyStats = {};
        this.weeklyStats = {};
        this.monthlyStats = {};
        this.keyAnalysis = {};
        this.progressTrends = [];
        
        // Chart.jsインスタンス
        this.performanceChart = null;
        this.keyStatsChart = null;
        this.wpmTrendChart = null;
        this.accuracyTrendChart = null;
        this.practiceTimeChart = null;
        this.weakKeysChart = null;
        
        this.loadAnalytics();
        this.setupEventListeners();
        this.initializeCharts();
        console.log('📊 Advanced Analytics initialized');
    }

    loadAnalytics() {
        try {
            const savedAnalytics = localStorage.getItem('cosmicTyping_analytics');
            if (savedAnalytics) {
                const analytics = JSON.parse(savedAnalytics);
                this.dailyStats = analytics.dailyStats || {};
                this.weeklyStats = analytics.weeklyStats || {};
                this.monthlyStats = analytics.monthlyStats || {};
                this.keyAnalysis = analytics.keyAnalysis || {};
                this.progressTrends = analytics.progressTrends || [];
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }

    saveAnalytics() {
        try {
            const analytics = {
                dailyStats: this.dailyStats,
                weeklyStats: this.weeklyStats,
                monthlyStats: this.monthlyStats,
                keyAnalysis: this.keyAnalysis,
                progressTrends: this.progressTrends,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('cosmicTyping_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Failed to save analytics:', error);
        }
    }

    setupEventListeners() {
        // Analytics tab buttons
        const analyticsButtons = document.querySelectorAll('[data-analytics]');
        analyticsButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-analytics');
                this.showAnalytics(type);
            });
        });
    }

    recordSession(sessionData) {
        const date = new Date().toISOString().split('T')[0];
        const weekKey = this.getWeekKey(date);
        const monthKey = this.getMonthKey(date);
        
        // Record daily stats
        if (!this.dailyStats[date]) {
            this.dailyStats[date] = {
                sessions: 0,
                totalWPM: 0,
                totalAccuracy: 0,
                totalTime: 0,
                totalTyped: 0,
                totalErrors: 0,
                bestWPM: 0,
                bestAccuracy: 0,
                maxCombo: 0
            };
        }
        
        this.dailyStats[date].sessions++;
        this.dailyStats[date].totalWPM += sessionData.wpm;
        this.dailyStats[date].totalAccuracy += sessionData.accuracy;
        this.dailyStats[date].totalTime += sessionData.duration || 0;
        this.dailyStats[date].totalTyped += sessionData.totalTyped || 0;
        this.dailyStats[date].totalErrors += sessionData.totalErrors || 0;
        
        // Update best stats
        if (sessionData.wpm > this.dailyStats[date].bestWPM) {
            this.dailyStats[date].bestWPM = sessionData.wpm;
        }
        if (sessionData.accuracy > this.dailyStats[date].bestAccuracy) {
            this.dailyStats[date].bestAccuracy = sessionData.accuracy;
        }
        if (sessionData.maxCombo > this.dailyStats[date].maxCombo) {
            this.dailyStats[date].maxCombo = sessionData.maxCombo;
        }
        
        // Record weekly stats
        if (!this.weeklyStats[weekKey]) {
            this.weeklyStats[weekKey] = {
                sessions: 0,
                totalWPM: 0,
                totalAccuracy: 0,
                totalTime: 0,
                bestWPM: 0,
                bestAccuracy: 0
            };
        }
        
        this.weeklyStats[weekKey].sessions++;
        this.weeklyStats[weekKey].totalWPM += sessionData.wpm;
        this.weeklyStats[weekKey].totalAccuracy += sessionData.accuracy;
        this.weeklyStats[weekKey].totalTime += sessionData.duration || 0;
        
        if (sessionData.wpm > this.weeklyStats[weekKey].bestWPM) {
            this.weeklyStats[weekKey].bestWPM = sessionData.wpm;
        }
        if (sessionData.accuracy > this.weeklyStats[weekKey].bestAccuracy) {
            this.weeklyStats[weekKey].bestAccuracy = sessionData.accuracy;
        }
        
        // Record monthly stats
        if (!this.monthlyStats[monthKey]) {
            this.monthlyStats[monthKey] = {
                sessions: 0,
                totalWPM: 0,
                totalAccuracy: 0,
                totalTime: 0,
                bestWPM: 0,
                bestAccuracy: 0
            };
        }
        
        this.monthlyStats[monthKey].sessions++;
        this.monthlyStats[monthKey].totalWPM += sessionData.wpm;
        this.monthlyStats[monthKey].totalAccuracy += sessionData.accuracy;
        this.monthlyStats[monthKey].totalTime += sessionData.duration || 0;
        
        if (sessionData.wpm > this.monthlyStats[monthKey].bestWPM) {
            this.monthlyStats[monthKey].bestWPM = sessionData.wpm;
        }
        if (sessionData.accuracy > this.monthlyStats[monthKey].bestAccuracy) {
            this.monthlyStats[monthKey].bestAccuracy = sessionData.accuracy;
        }
        
        // Record key analysis
        if (sessionData.weakKeys) {
            Object.keys(sessionData.weakKeys).forEach(key => {
                if (!this.keyAnalysis[key]) {
                    this.keyAnalysis[key] = {
                        totalErrors: 0,
                        sessions: 0,
                        lastError: null
                    };
                }
                this.keyAnalysis[key].totalErrors += sessionData.weakKeys[key];
                this.keyAnalysis[key].sessions++;
                this.keyAnalysis[key].lastError = new Date().toISOString();
            });
        }
        
        // Update progress trends
        this.updateProgressTrends(date, sessionData);
        
        // Save analytics
        this.saveAnalytics();
        
        console.log('Session recorded in analytics');
    }

    getWeekKey(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const week = Math.ceil((d.getDate() + d.getDay()) / 7);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    getMonthKey(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        return `${year}-${month.toString().padStart(2, '0')}`;
    }

    updateProgressTrends(date, sessionData) {
        const trend = {
            date: date,
            wpm: sessionData.wpm,
            accuracy: sessionData.accuracy,
            time: sessionData.duration || 0,
            typed: sessionData.totalTyped || 0
        };
        
        this.progressTrends.push(trend);
        
        // Keep only last 100 trends
        if (this.progressTrends.length > 100) {
            this.progressTrends = this.progressTrends.slice(-100);
        }
    }

    showAnalytics(type) {
        switch (type) {
            case 'daily':
                this.showDailyAnalytics();
                break;
            case 'weekly':
                this.showWeeklyAnalytics();
                break;
            case 'monthly':
                this.showMonthlyAnalytics();
                break;
            case 'keys':
                this.showKeyAnalysis();
                break;
            case 'progress':
                this.showProgressTrends();
                break;
            default:
                console.error('Unknown analytics type:', type);
        }
    }

    showDailyAnalytics() {
        const container = document.getElementById('dailyAnalytics');
        if (!container) return;
        
        const dates = Object.keys(this.dailyStats).sort().slice(-30); // Last 30 days
        const data = dates.map(date => {
            const stats = this.dailyStats[date];
            return {
                date: date,
                avgWPM: stats.sessions > 0 ? Math.round(stats.totalWPM / stats.sessions) : 0,
                avgAccuracy: stats.sessions > 0 ? Math.round(stats.totalAccuracy / stats.sessions) : 0,
                sessions: stats.sessions,
                bestWPM: stats.bestWPM,
                bestAccuracy: stats.bestAccuracy
            };
        });
        
        this.renderAnalyticsTable(container, data, '日別統計');
    }

    showWeeklyAnalytics() {
        const container = document.getElementById('weeklyAnalytics');
        if (!container) return;
        
        const weeks = Object.keys(this.weeklyStats).sort().slice(-12); // Last 12 weeks
        const data = weeks.map(week => {
            const stats = this.weeklyStats[week];
            return {
                period: week,
                avgWPM: stats.sessions > 0 ? Math.round(stats.totalWPM / stats.sessions) : 0,
                avgAccuracy: stats.sessions > 0 ? Math.round(stats.totalAccuracy / stats.sessions) : 0,
                sessions: stats.sessions,
                totalTime: Math.round(stats.totalTime / 60), // Convert to minutes
                bestWPM: stats.bestWPM,
                bestAccuracy: stats.bestAccuracy
            };
        });
        
        this.renderAnalyticsTable(container, data, '週別統計');
    }

    showMonthlyAnalytics() {
        const container = document.getElementById('monthlyAnalytics');
        if (!container) return;
        
        const months = Object.keys(this.monthlyStats).sort().slice(-12); // Last 12 months
        const data = months.map(month => {
            const stats = this.monthlyStats[month];
            return {
                period: month,
                avgWPM: stats.sessions > 0 ? Math.round(stats.totalWPM / stats.sessions) : 0,
                avgAccuracy: stats.sessions > 0 ? Math.round(stats.totalAccuracy / stats.sessions) : 0,
                sessions: stats.sessions,
                totalTime: Math.round(stats.totalTime / 60), // Convert to minutes
                bestWPM: stats.bestWPM,
                bestAccuracy: stats.bestAccuracy
            };
        });
        
        this.renderAnalyticsTable(container, data, '月別統計');
    }

    showKeyAnalysis() {
        const container = document.getElementById('keyAnalysis');
        if (!container) return;
        
        const keys = Object.keys(this.keyAnalysis).sort((a, b) => {
            return this.keyAnalysis[b].totalErrors - this.keyAnalysis[a].totalErrors;
        });
        
        const data = keys.slice(0, 20).map(key => { // Top 20 problematic keys
            const analysis = this.keyAnalysis[key];
            return {
                key: key,
                totalErrors: analysis.totalErrors,
                sessions: analysis.sessions,
                avgErrors: Math.round(analysis.totalErrors / analysis.sessions * 10) / 10,
                lastError: analysis.lastError ? new Date(analysis.lastError).toLocaleDateString() : 'Never'
            };
        });
        
        this.renderKeyAnalysisTable(container, data);
    }

    showProgressTrends() {
        const container = document.getElementById('progressTrends');
        if (!container) return;
        
        const trends = this.progressTrends.slice(-30); // Last 30 sessions
        const data = trends.map((trend, index) => {
            return {
                session: index + 1,
                wpm: trend.wpm,
                accuracy: trend.accuracy,
                time: Math.round(trend.time / 60), // Convert to minutes
                typed: trend.typed
            };
        });
        
        this.renderProgressChart(container, data);
    }

    renderAnalyticsTable(container, data, title) {
        container.innerHTML = `
            <h3 class="text-xl font-bold mb-4">${title}</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-800">
                            <th class="px-4 py-2 text-left">期間</th>
                            <th class="px-4 py-2 text-center">平均WPM</th>
                            <th class="px-4 py-2 text-center">平均正確率</th>
                            <th class="px-4 py-2 text-center">セッション数</th>
                            <th class="px-4 py-2 text-center">最高WPM</th>
                            <th class="px-4 py-2 text-center">最高正確率</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr class="border-b border-gray-700">
                                <td class="px-4 py-2">${row.date || row.period}</td>
                                <td class="px-4 py-2 text-center">${row.avgWPM}</td>
                                <td class="px-4 py-2 text-center">${row.avgAccuracy}%</td>
                                <td class="px-4 py-2 text-center">${row.sessions}</td>
                                <td class="px-4 py-2 text-center">${row.bestWPM}</td>
                                <td class="px-4 py-2 text-center">${row.bestAccuracy}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderKeyAnalysisTable(container, data) {
        container.innerHTML = `
            <h3 class="text-xl font-bold mb-4">キー別分析</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-800">
                            <th class="px-4 py-2 text-left">キー</th>
                            <th class="px-4 py-2 text-center">総エラー数</th>
                            <th class="px-4 py-2 text-center">セッション数</th>
                            <th class="px-4 py-2 text-center">平均エラー</th>
                            <th class="px-4 py-2 text-center">最後のエラー</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr class="border-b border-gray-700">
                                <td class="px-4 py-2 font-mono">${row.key}</td>
                                <td class="px-4 py-2 text-center">${row.totalErrors}</td>
                                <td class="px-4 py-2 text-center">${row.sessions}</td>
                                <td class="px-4 py-2 text-center">${row.avgErrors}</td>
                                <td class="px-4 py-2 text-center">${row.lastError}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderProgressChart(container, data) {
        container.innerHTML = `
            <h3 class="text-xl font-bold mb-4">進歩トレンド</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 class="text-lg font-semibold mb-2">WPM推移</h4>
                    <canvas id="wpmChart" width="400" height="200"></canvas>
                </div>
                <div>
                    <h4 class="text-lg font-semibold mb-2">正確率推移</h4>
                    <canvas id="accuracyChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
        
        // Create charts
        this.createProgressChart('wpmChart', data.map(d => d.wpm), 'WPM');
        this.createProgressChart('accuracyChart', data.map(d => d.accuracy), '正確率');
    }

    createProgressChart(canvasId, data, label) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (data.length === 0) return;
        
        // Calculate scale
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;
        
        const scaleX = width / (data.length - 1);
        const scaleY = height / range;
        
        // Draw grid
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= data.length; i++) {
            const x = i * scaleX;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw line
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = index * scaleX;
            const y = height - ((value - minValue) * scaleY);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#06b6d4';
        data.forEach((value, index) => {
            const x = index * scaleX;
            const y = height - ((value - minValue) * scaleY);
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    getAnalyticsSummary() {
        const totalSessions = Object.values(this.dailyStats).reduce((sum, day) => sum + day.sessions, 0);
        const totalTime = Object.values(this.dailyStats).reduce((sum, day) => sum + day.totalTime, 0);
        const avgWPM = totalSessions > 0 ? 
            Math.round(Object.values(this.dailyStats).reduce((sum, day) => sum + day.totalWPM, 0) / totalSessions) : 0;
        const avgAccuracy = totalSessions > 0 ? 
            Math.round(Object.values(this.dailyStats).reduce((sum, day) => sum + day.totalAccuracy, 0) / totalSessions) : 0;
        
        return {
            totalSessions,
            totalTime: Math.round(totalTime / 60), // Convert to minutes
            avgWPM,
            avgAccuracy,
            totalDays: Object.keys(this.dailyStats).length,
            weakKeys: Object.keys(this.keyAnalysis).length
        };
    }

    getWeakKeys() {
        return Object.keys(this.keyAnalysis)
            .sort((a, b) => this.keyAnalysis[b].totalErrors - this.keyAnalysis[a].totalErrors)
            .slice(0, 10); // Top 10 weak keys
    }

    getProgressTrend() {
        if (this.progressTrends.length < 2) return null;
        
        const recent = this.progressTrends.slice(-10);
        const older = this.progressTrends.slice(-20, -10);
        
        const recentAvgWPM = recent.reduce((sum, t) => sum + t.wpm, 0) / recent.length;
        const olderAvgWPM = older.reduce((sum, t) => sum + t.wpm, 0) / older.length;
        
        const recentAvgAccuracy = recent.reduce((sum, t) => sum + t.accuracy, 0) / recent.length;
        const olderAvgAccuracy = older.reduce((sum, t) => sum + t.accuracy, 0) / older.length;
        
        return {
            wpmImprovement: recentAvgWPM - olderAvgWPM,
            accuracyImprovement: recentAvgAccuracy - olderAvgAccuracy,
            trend: recentAvgWPM > olderAvgWPM ? 'improving' : 'declining'
        };
    }

    exportAnalytics() {
        const analytics = {
            dailyStats: this.dailyStats,
            weeklyStats: this.weeklyStats,
            monthlyStats: this.monthlyStats,
            keyAnalysis: this.keyAnalysis,
            progressTrends: this.progressTrends,
            summary: this.getAnalyticsSummary(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(analytics, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cosmic_typing_analytics.json';
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('Analytics exported successfully');
    }

    clearAnalytics() {
        if (confirm('すべての分析データを削除しますか？この操作は取り消せません。')) {
            this.dailyStats = {};
            this.weeklyStats = {};
            this.monthlyStats = {};
            this.keyAnalysis = {};
            this.progressTrends = [];
            
            this.saveAnalytics();
            this.updateAllCharts();
            
            console.log('All analytics data cleared');
        }
    }

    // Chart.jsグラフの初期化
    initializeCharts() {
        // DOMが完全に読み込まれるまで待機
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('Advanced Analytics: DOM loaded, ready to create charts');
            });
        } else {
            console.log('Advanced Analytics: DOM already loaded, ready to create charts');
        }
    }

    // パフォーマンス推移グラフ（WPM・正確率）
    createPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) {
            console.warn('Performance chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // データ準備
        const data = this.getPerformanceChartData();
        const hasData = this.progressTrends.length > 0;
        
        // 既存のチャートを破棄
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'WPM',
                        data: data.wpmData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: '正確率 (%)',
                        data: data.accuracyData,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e5e7eb',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#06b6d4',
                        bodyColor: '#e5e7eb',
                        borderColor: '#06b6d4',
                        borderWidth: 1,
                        enabled: hasData
                    },
                    title: {
                        display: !hasData,
                        text: 'データがありません。タイピング練習を始めましょう！',
                        color: '#9ca3af',
                        font: {
                            size: 14
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#9ca3af',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'WPM',
                            color: '#10b981'
                        },
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '正確率 (%)',
                            color: '#06b6d4'
                        },
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
    }

    // キー別統計グラフ（苦手キー）
    createKeyStatsChart() {
        const canvas = document.getElementById('keyStatsChart');
        if (!canvas) {
            console.warn('Key stats chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // データ準備
        const data = this.getKeyStatsChartData();
        
        // 既存のチャートを破棄
        if (this.keyStatsChart) {
            this.keyStatsChart.destroy();
        }

        if (data.labels.length === 0) {
            // データがない場合のメッセージ
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('データが不足しています', canvas.width / 2, canvas.height / 2 - 10);
            ctx.fillText('もっと練習してデータを収集しましょう！', canvas.width / 2, canvas.height / 2 + 20);
            return;
        }

        this.keyStatsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'エラー回数',
                    data: data.errorData,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#ef4444',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e5e7eb',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ef4444',
                        bodyColor: '#e5e7eb',
                        borderColor: '#ef4444',
                        borderWidth: 1,
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const avgErrors = data.avgErrorData[index];
                                return `平均: ${avgErrors.toFixed(1)}回/セッション`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                family: 'monospace',
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'エラー回数',
                            color: '#ef4444'
                        },
                        ticks: {
                            color: '#9ca3af',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        }
                    }
                }
            }
        });
    }

    // パフォーマンスチャートのデータ取得
    getPerformanceChartData() {
        const trends = this.progressTrends.slice(-30); // 直近30セッション
        
        if (trends.length === 0) {
            // サンプルデータを表示
            return {
                labels: ['練習1', '練習2', '練習3', '練習4', '練習5'],
                wpmData: [0, 0, 0, 0, 0],
                accuracyData: [0, 0, 0, 0, 0]
            };
        }

        const labels = trends.map((t, index) => `練習${index + 1}`);
        const wpmData = trends.map(t => t.wpm || 0);
        const accuracyData = trends.map(t => t.accuracy || 0);

        return { labels, wpmData, accuracyData };
    }

    // キー統計チャートのデータ取得
    getKeyStatsChartData() {
        const keys = Object.keys(this.keyAnalysis).sort((a, b) => {
            return this.keyAnalysis[b].totalErrors - this.keyAnalysis[a].totalErrors;
        });

        const topKeys = keys.slice(0, 15); // トップ15の苦手キー

        if (topKeys.length === 0) {
            return {
                labels: [],
                errorData: [],
                avgErrorData: []
            };
        }

        const labels = topKeys.map(key => key.length > 3 ? key.substring(0, 3) + '...' : key);
        const errorData = topKeys.map(key => this.keyAnalysis[key].totalErrors);
        const avgErrorData = topKeys.map(key => {
            const analysis = this.keyAnalysis[key];
            return analysis.totalErrors / analysis.sessions;
        });

        return { labels, errorData, avgErrorData };
    }

    // すべてのグラフを更新
    updateAllCharts() {
        if (this.performanceChart) {
            const data = this.getPerformanceChartData();
            this.performanceChart.data.labels = data.labels;
            this.performanceChart.data.datasets[0].data = data.wpmData;
            this.performanceChart.data.datasets[1].data = data.accuracyData;
            this.performanceChart.update('none');
        }

        if (this.keyStatsChart) {
            this.createKeyStatsChart(); // 再作成が必要
        }
    }

    // CSVエクスポート機能
    exportToCSV() {
        const csvData = [];
        
        // ヘッダー
        csvData.push(['日付', '平均WPM', '平均正確率', 'セッション数', '総練習時間(秒)', '最高WPM', '最高正確率'].join(','));
        
        // 日別データ
        const dates = Object.keys(this.dailyStats).sort();
        dates.forEach(date => {
            const stats = this.dailyStats[date];
            const avgWPM = stats.sessions > 0 ? Math.round(stats.totalWPM / stats.sessions) : 0;
            const avgAccuracy = stats.sessions > 0 ? Math.round(stats.totalAccuracy / stats.sessions) : 0;
            
            csvData.push([
                date,
                avgWPM,
                avgAccuracy,
                stats.sessions,
                stats.totalTime,
                stats.bestWPM,
                stats.bestAccuracy
            ].join(','));
        });
        
        const csvString = csvData.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `cosmic_typing_stats_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('CSV exported successfully');
    }

    // 練習時間の円グラフ（日別/週別/月別）
    createPracticeTimeChart(containerId, period = 'daily') {
        const canvas = document.getElementById(containerId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.getPracticeTimeData(period);

        if (this.practiceTimeChart) {
            this.practiceTimeChart.destroy();
        }

        this.practiceTimeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '練習時間 (分)',
                    data: data.timeData,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(6, 182, 212, 0.7)',
                        'rgba(249, 115, 22, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(168, 85, 247, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(59, 130, 246, 0.7)'
                    ],
                    borderColor: '#1f2937',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#e5e7eb'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value}分 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // 練習時間データの取得
    getPracticeTimeData(period) {
        let stats = {};
        
        switch(period) {
            case 'daily':
                stats = this.dailyStats;
                break;
            case 'weekly':
                stats = this.weeklyStats;
                break;
            case 'monthly':
                stats = this.monthlyStats;
                break;
        }

        const keys = Object.keys(stats).sort().slice(-7); // 最新7件
        const labels = keys.map(key => {
            if (period === 'daily') {
                const date = new Date(key);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }
            return key;
        });
        const timeData = keys.map(key => Math.round(stats[key].totalTime / 60)); // 分に変換

        return { labels, timeData };
    }
} 