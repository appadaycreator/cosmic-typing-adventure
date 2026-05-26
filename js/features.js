// P1-P4 新機能モジュール

// ==========================================
// P1: 残り文字数カウンター
// ==========================================
(function initRemainingChars() {
    function attachCounter(inputId, counterId, wrapperId) {
        document.addEventListener('DOMContentLoaded', function () {
            const inp = document.getElementById(inputId);
            if (!inp) return;
            inp.addEventListener('input', function () {
                const text = window.app && window.app.currentText ? window.app.currentText : '';
                if (!text) return;
                const remaining = Math.max(0, text.length - inp.value.length);
                const counter = document.getElementById(counterId);
                const wrap = document.getElementById(wrapperId);
                if (counter) counter.textContent = remaining;
                if (wrap) {
                    wrap.classList.remove('hidden');
                    const pct = text.length > 0 ? remaining / text.length : 1;
                    wrap.querySelector('span').style.color = pct < 0.1 ? '#10b981' : pct < 0.3 ? '#f97316' : '#9ca3af';
                }
            });
        });
    }
    attachCounter('typingInput', 'remainingCount', 'remainingChars');
})();

// ==========================================
// P2: デイリーチャレンジ
// ==========================================
window.DailyChallengeManager = (function () {
    function getToday() {
        return new Date().toISOString().split('T')[0];
    }
    function getDoneKey() {
        return 'cosmicTyping_daily_' + getToday();
    }
    function isDone() {
        return !!localStorage.getItem(getDoneKey());
    }
    function markDone() {
        localStorage.setItem(getDoneKey(), '1');
        updateBadge();
        if (window.StreakManager) window.StreakManager.recordSession();
    }
    function getDailyPlanet() {
        var d = new Date();
        var seed = d.getDate() + d.getMonth() * 31;
        var planets = ['earth', 'mars', 'jupiter', 'saturn', 'code'];
        return planets[seed % planets.length];
    }
    function start() {
        if (isDone()) {
            showToast('✅ 今日のチャレンジはクリア済み！明日また挑戦してね');
            return;
        }
        var planet = getDailyPlanet();
        localStorage.setItem('cosmicTyping_dailyActive', '1');
        localStorage.setItem('cosmicTyping_lastTimeAttack', '60');
        if (window.app) window.app.selectPlanet(planet);
        showToast('🌟 デイリーチャレンジ開始！今日の惑星: ' + planet);
        updateBadge();
    }
    function updateBadge() {
        var badge = document.getElementById('dailyChallengeBadge');
        var btn = document.getElementById('dailyChallengeBtn');
        if (!badge) return;
        if (isDone()) {
            badge.textContent = '✅ クリア済み';
            badge.style.background = '#065f46';
            if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
        } else {
            badge.textContent = '🌟 未挑戦';
            badge.style.background = '#92400e';
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        }
    }
    function onSessionComplete() {
        if (localStorage.getItem('cosmicTyping_dailyActive')) {
            localStorage.removeItem('cosmicTyping_dailyActive');
            markDone();
            showToast('🎉 デイリーチャレンジ完了！連続記録を更新しました');
        }
    }
    document.addEventListener('DOMContentLoaded', function () {
        updateBadge();
        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        onSessionComplete();
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
    return { start: start, isDone: isDone, updateBadge: updateBadge };
})();

// ==========================================
// P3: 初回チュートリアルモーダル
// ==========================================
window.TutorialManager = (function () {
    var DONE_KEY = 'cosmicTyping_tutorialDone';
    var step = 0;
    var steps = [
        {
            icon: '🚀',
            title: 'Cosmic Typing へようこそ！',
            text: '宇宙をテーマにしたタイピング練習ゲームです。\nミッションを選んで宇宙を探索しましょう！'
        },
        {
            icon: '🎮',
            title: 'ミッションを選ぼう',
            text: '「基礎訓練」〜「サバイバル」まで5種類のモード + タイムアタック4種類があります。\n「💻 コードモード」でプログラミング文も練習できます！'
        },
        {
            icon: '⌨️',
            title: '入力してスタート！',
            text: '「開始」ボタンを押してタイピングを始めましょう。\n結果はWPM（1分間の文字数）と正確率で評価されます。\n毎日練習してストリークを伸ばそう！'
        }
    ];

    function show() {
        step = 0;
        renderStep();
        var modal = document.getElementById('tutorialModal');
        if (modal) modal.classList.remove('hidden');
    }

    function renderStep() {
        var s = steps[step];
        var iconEl = document.getElementById('tutorialIcon');
        var titleEl = document.getElementById('tutorialTitle');
        var textEl = document.getElementById('tutorialText');
        var nextBtn = document.getElementById('tutorialNextBtn');
        if (iconEl) iconEl.textContent = s.icon;
        if (titleEl) titleEl.textContent = s.title;
        if (textEl) textEl.innerHTML = s.text.replace(/\n/g, '<br>');
        if (nextBtn) nextBtn.textContent = step < steps.length - 1 ? '次へ →' : 'はじめる！';
        for (var i = 0; i < steps.length; i++) {
            var dot = document.getElementById('dot' + i);
            if (dot) dot.style.background = i === step ? '#06b6d4' : '#4b5563';
        }
    }

    function next() {
        step++;
        if (step >= steps.length) {
            skip();
        } else {
            renderStep();
        }
    }

    function skip() {
        localStorage.setItem(DONE_KEY, '1');
        var modal = document.getElementById('tutorialModal');
        if (modal) modal.classList.add('hidden');
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!localStorage.getItem(DONE_KEY)) {
            setTimeout(show, 600); // ページ読み込み後に少し待って表示
        }
    });

    return { show: show, next: next, skip: skip };
})();

// ==========================================
// P4: リアルタイムWPMグラフ
// ==========================================
(function initWPMChart() {
    var chartInstance = null;
    var wpmHistory = [];
    var timeLabels = [];
    var pollInterval = null;
    var startTime = null;

    function startTracking() {
        wpmHistory = [];
        timeLabels = [];
        startTime = Date.now();
        if (pollInterval) clearInterval(pollInterval);
        // チャートリセット
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        var container = document.getElementById('wpmChartContainer');
        if (container) container.classList.add('hidden');

        pollInterval = setInterval(function () {
            var wpmEl = document.getElementById('liveWPM');
            if (!wpmEl) return;
            var wpm = parseFloat(wpmEl.textContent) || 0;
            if (wpm > 0 || wpmHistory.length > 0) {
                wpmHistory.push(wpm);
                var elapsed = Math.round((Date.now() - startTime) / 1000);
                timeLabels.push(elapsed + '秒');
                renderChart();
            }
        }, 3000);
    }

    function stopTracking() {
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    }

    function renderChart() {
        if (wpmHistory.length < 2) return;
        var canvas = document.getElementById('liveWPMChart');
        var container = document.getElementById('wpmChartContainer');
        if (!canvas || !window.Chart) return;
        container.classList.remove('hidden');

        if (chartInstance) {
            chartInstance.data.labels = timeLabels;
            chartInstance.data.datasets[0].data = wpmHistory;
            chartInstance.update('none');
            return;
        }

        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'WPM',
                    data: wpmHistory,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6,182,212,0.15)',
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#06b6d4',
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                animation: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: '#9ca3af', font: { size: 9 }, maxTicksLimit: 6 },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    y: {
                        ticks: { color: '#9ca3af', font: { size: 9 } },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        beginAtZero: true,
                        suggestedMax: 80
                    }
                }
            }
        });
    }

    // 開始ボタン押下を監視してトラッキング開始
    document.addEventListener('DOMContentLoaded', function () {
        var startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', function () {
                setTimeout(startTracking, 200); // app.jsのstartPracticeが先に動くよう少し待つ
            });
        }

        // タイムアタックボタンも監視
        document.querySelectorAll('.time-attack-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var sec = parseInt(btn.dataset.timeAttack || '60');
                localStorage.setItem('cosmicTyping_lastTimeAttack', String(sec));
                setTimeout(startTracking, 200);
            });
        });

        // 結果画面表示時にトラッキング停止
        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        stopTracking();
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();

// ==========================================
// P1追加: ベストスコア記録・表示
// ==========================================
(function BestScoreManager() {
    var KEY_WPM = 'cosmicTyping_bestWPM';
    var KEY_ACC = 'cosmicTyping_bestAccuracy';
    var KEY_SESSIONS = 'cosmicTyping_totalSessions';
    var KEY_AVG_WPM = 'cosmicTyping_avgWPM';

    function getBest(key) { return parseFloat(localStorage.getItem(key) || 0); }

    function checkAndUpdate(wpm, accuracy) {
        var isNewBest = false;
        if (wpm > getBest(KEY_WPM)) {
            localStorage.setItem(KEY_WPM, wpm);
            isNewBest = true;
        }
        if (accuracy > getBest(KEY_ACC)) {
            localStorage.setItem(KEY_ACC, accuracy);
        }
        // 平均WPM更新
        var sessions = parseInt(localStorage.getItem(KEY_SESSIONS) || 0) + 1;
        var prevAvg = parseFloat(localStorage.getItem(KEY_AVG_WPM) || 0);
        var newAvg = ((prevAvg * (sessions - 1)) + wpm) / sessions;
        localStorage.setItem(KEY_SESSIONS, sessions);
        localStorage.setItem(KEY_AVG_WPM, newAvg.toFixed(1));
        return isNewBest;
    }

    function updateStatsDisplay() {
        var el = document.getElementById('bestWPM');
        if (el) el.textContent = getBest(KEY_WPM).toFixed(1);
        var accEl = document.getElementById('bestAccuracy');
        if (accEl) accEl.textContent = getBest(KEY_ACC).toFixed(1) + '%';
        var avgEl = document.getElementById('avgWPM');
        if (avgEl) avgEl.textContent = parseFloat(localStorage.getItem(KEY_AVG_WPM) || 0).toFixed(1);
        var sessEl = document.getElementById('totalSessions');
        if (sessEl) sessEl.textContent = localStorage.getItem(KEY_SESSIONS) || 0;
    }

    function onResultsVisible(panel, bannerId) {
        var wpmEl = panel.querySelector('[id="finalWPM"],[id="ta-finalWPM"]') || panel.querySelector('.text-energy-green');
        var accEl = panel.querySelector('[id="finalAccuracy"],[id="ta-finalAccuracy"]');
        if (!wpmEl) return;
        var wpm = parseFloat(wpmEl.textContent || 0);
        var acc = parseFloat((accEl || {}).textContent || 0);
        if (wpm <= 0) return;
        var isNew = checkAndUpdate(wpm, acc);
        var banner = document.getElementById(bannerId);
        if (banner) banner.classList.toggle('hidden', !isNew);
        if (isNew) showToast('🏆 自己ベスト更新！ WPM: ' + wpm.toFixed(1));
        updateStatsDisplay();
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateStatsDisplay();
        var pairs = [
            { id: 'resultsPanel', bannerId: 'bestScoreBanner' },
            { id: 'timeAttackResults', bannerId: 'ta-bestScoreBanner' }
        ];
        pairs.forEach(function (pair) {
            var el = document.getElementById(pair.id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        setTimeout(function () { onResultsVisible(t, pair.bannerId); }, 50);
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();

// ==========================================
// P3: XP・レベルアップ管理
// ==========================================
(function XPManager() {
    var KEY_XP = 'cosmicTyping_xp';
    var KEY_LV = 'cosmicTyping_level';
    var XP_PER_LEVEL = [0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000];

    function getXP() { return parseInt(localStorage.getItem(KEY_XP) || 0); }
    function getLevel() { return parseInt(localStorage.getItem(KEY_LV) || 1); }

    function calcLevel(xp) {
        for (var i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
            if (xp >= XP_PER_LEVEL[i]) return i + 1;
        }
        return 1;
    }

    function calcXPGain(wpm, accuracy) {
        var base = Math.round(wpm * 2);
        var accBonus = accuracy >= 95 ? 1.5 : accuracy >= 85 ? 1.2 : 1.0;
        return Math.round(base * accBonus);
    }

    function addXP(gain) {
        var prevXP = getXP();
        var prevLevel = calcLevel(prevXP);
        var newXP = prevXP + gain;
        var newLevel = calcLevel(newXP);
        localStorage.setItem(KEY_XP, newXP);
        localStorage.setItem(KEY_LV, newLevel);
        updateDisplay();
        showToast('✨ +' + gain + ' XP 獲得！');
        if (newLevel > prevLevel) {
            setTimeout(function () {
                showToast('🎉 レベルアップ！ Lv.' + prevLevel + ' → Lv.' + newLevel);
            }, 800);
        }
    }

    function updateDisplay() {
        var xp = getXP();
        var lv = calcLevel(xp);
        var lvEl = document.getElementById('userLevel');
        var xpEl = document.getElementById('userXP');
        if (lvEl) lvEl.textContent = 'Lv.' + lv;
        if (xpEl) {
            var nextLvXP = XP_PER_LEVEL[Math.min(lv, XP_PER_LEVEL.length - 1)] || xp + 1000;
            xpEl.textContent = xp + ' XP';
        }
        // 統計タブ
        var totalXP = document.getElementById('totalXP');
        if (totalXP) totalXP.textContent = xp;
        var currentLevel = document.getElementById('currentLevel');
        if (currentLevel) currentLevel.textContent = lv;
    }

    function onResultsVisible(panel) {
        var wpmEl = panel.querySelector('[id="finalWPM"],[id="ta-finalWPM"]') || panel.querySelector('.text-energy-green');
        var accEl = panel.querySelector('[id="finalAccuracy"],[id="ta-finalAccuracy"]');
        if (!wpmEl) return;
        var wpm = parseFloat(wpmEl.textContent || 0);
        var acc = parseFloat((accEl || {}).textContent || 0);
        if (wpm <= 0) return;
        var gain = calcXPGain(wpm, acc);
        addXP(gain);
        // earnedXP表示更新
        var earnedEl = document.getElementById('earnedXP');
        if (earnedEl) earnedEl.textContent = gain;
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateDisplay();
        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        setTimeout(function () { onResultsVisible(t); }, 100);
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();
