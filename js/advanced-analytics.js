// Advanced Analytics for Cosmic Typing Adventure

class AdvancedAnalytics {
    constructor() {
        this.dailyStats = {};
        this.weeklyStats = {};
        this.monthlyStats = {};
        this.keyAnalysis = {};
        this.progressTrends = [];
        
        this.loadAnalytics();
        this.setupEventListeners();
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
            
            console.log('All analytics data cleared');
        }
    }
} 