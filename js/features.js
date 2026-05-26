// P1-P4 新機能モジュール

// ==========================================
// P1: 残り文字数カウンター + タイピング進行バー（通常・TA両対応）
// ==========================================
(function initRemainingChars() {
    function updateProgressBar(typed, textLen) {
        var bar = document.getElementById('typingProgressBar');
        if (bar && textLen > 0) {
            bar.style.width = Math.min(100, (typed / textLen) * 100).toFixed(1) + '%';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        // 通常モード
        var inp = document.getElementById('typingInput');
        if (inp) {
            inp.addEventListener('input', function () {
                var text = window.app && window.app.currentText ? window.app.currentText : '';
                if (!text) return;
                var typed = inp.value.length;
                var remaining = Math.max(0, text.length - typed);
                var counter = document.getElementById('remainingCount');
                var wrap = document.getElementById('remainingChars');
                if (counter) counter.textContent = remaining;
                if (wrap) {
                    wrap.classList.remove('hidden');
                    var pct = remaining / text.length;
                    wrap.querySelector('span').style.color = pct < 0.1 ? '#10b981' : pct < 0.3 ? '#f97316' : '#9ca3af';
                }
                updateProgressBar(typed, text.length);
            });
        }
        // タイムアタックモード（進行バーのみ）
        var taInp = document.getElementById('timeAttackInput');
        if (taInp) {
            taInp.addEventListener('input', function () {
                var text = window.app && window.app.currentText ? window.app.currentText : '';
                if (!text) return;
                updateProgressBar(taInp.value.length, text.length);
            });
        }
    });
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
// P4: リアルタイムWPMグラフ（通常 + タイムアタック対応）
// ==========================================
(function initWPMChart() {
    var chartInstance = null;
    var taChartInstance = null;
    var wpmHistory = [];
    var timeLabels = [];
    var pollInterval = null;
    var startTime = null;
    var isTimeAttackMode = false;

    function makeChartConfig(canvas) {
        return new Chart(canvas, {
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
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#9ca3af', font: { size: 9 }, maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, suggestedMax: 80 }
                }
            }
        });
    }

    function startTracking(timeAttack) {
        isTimeAttackMode = !!timeAttack;
        wpmHistory = [];
        timeLabels = [];
        startTime = Date.now();
        if (pollInterval) clearInterval(pollInterval);
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        if (taChartInstance) { taChartInstance.destroy(); taChartInstance = null; }
        var c1 = document.getElementById('wpmChartContainer');
        var c2 = document.getElementById('taWpmChartContainer');
        if (c1) c1.classList.add('hidden');
        if (c2) c2.classList.add('hidden');

        // WPM表示元素ID（通常=liveWPM, タイムアタック=timeAttackWPM）
        var wpmDisplayId = isTimeAttackMode ? 'timeAttackWPM' : 'liveWPM';

        pollInterval = setInterval(function () {
            var wpmEl = document.getElementById(wpmDisplayId);
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
        if (!window.Chart) return;
        if (isTimeAttackMode) {
            var canvas = document.getElementById('taLiveWPMChart');
            var container = document.getElementById('taWpmChartContainer');
            if (!canvas || !container) return;
            container.classList.remove('hidden');
            if (taChartInstance) {
                taChartInstance.data.labels = timeLabels;
                taChartInstance.data.datasets[0].data = wpmHistory;
                taChartInstance.update('none');
                return;
            }
            taChartInstance = makeChartConfig(canvas);
        } else {
            var canvas = document.getElementById('liveWPMChart');
            var container = document.getElementById('wpmChartContainer');
            if (!canvas || !container) return;
            container.classList.remove('hidden');
            if (chartInstance) {
                chartInstance.data.labels = timeLabels;
                chartInstance.data.datasets[0].data = wpmHistory;
                chartInstance.update('none');
                return;
            }
            chartInstance = makeChartConfig(canvas);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', function () {
                setTimeout(function () { startTracking(false); }, 200);
            });
        }

        document.querySelectorAll('.time-attack-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var sec = parseInt(btn.dataset.timeAttack || '60');
                localStorage.setItem('cosmicTyping_lastTimeAttack', String(sec));
                setTimeout(function () { startTracking(true); }, 200);
            });
        });

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
    var KEY_TOTAL_SEC = 'cosmicTyping_totalSeconds';

    function getBest(key) { return parseFloat(localStorage.getItem(key) || 0); }

    function checkAndUpdate(wpm, accuracy, durationSec) {
        var isNewBest = false;
        if (wpm > getBest(KEY_WPM)) {
            localStorage.setItem(KEY_WPM, wpm);
            isNewBest = true;
        }
        if (accuracy > getBest(KEY_ACC)) {
            localStorage.setItem(KEY_ACC, accuracy);
        }
        var sessions = parseInt(localStorage.getItem(KEY_SESSIONS) || 0) + 1;
        var prevAvg = parseFloat(localStorage.getItem(KEY_AVG_WPM) || 0);
        var newAvg = ((prevAvg * (sessions - 1)) + wpm) / sessions;
        localStorage.setItem(KEY_SESSIONS, sessions);
        localStorage.setItem(KEY_AVG_WPM, newAvg.toFixed(1));
        // P1-1: 総練習時間累積
        if (durationSec > 0) {
            var prevSec = parseInt(localStorage.getItem(KEY_TOTAL_SEC) || 0);
            localStorage.setItem(KEY_TOTAL_SEC, prevSec + Math.round(durationSec));
        }
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
        // P1-1: 総練習時間
        var timeEl = document.getElementById('totalTime');
        if (timeEl) {
            var totalSec = parseInt(localStorage.getItem(KEY_TOTAL_SEC) || 0);
            timeEl.textContent = totalSec < 60 ? totalSec + '秒' : Math.floor(totalSec / 60) + '分';
        }
    }

    function onResultsVisible(panel, bannerId) {
        var wpmEl = panel.querySelector('[id="finalWPM"],[id="ta-finalWPM"]') || panel.querySelector('.text-energy-green');
        var accEl = panel.querySelector('[id="finalAccuracy"],[id="ta-finalAccuracy"]');
        if (!wpmEl) return;
        var wpm = parseFloat(wpmEl.textContent || 0);
        var acc = parseFloat((accEl || {}).textContent || 0);
        if (wpm <= 0) return;
        // セッション経過時間をapp.jsのtypingEngineから取得（可能なら）
        var dur = 0;
        try { dur = window.app && window.app.typingEngine ? (window.app.typingEngine.getResults() || {}).duration || 0 : 0; } catch(e) {}
        var isNew = checkAndUpdate(wpm, acc, dur);
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

// ==========================================
// P2-1: 実績（Achievement）自動解放システム
// ==========================================
(function AchievementUnlocker() {
    var KEY = 'cosmicTyping_achievements';
    var DEFS = [
        { id: 'first_flight',    icon: 'fas fa-medal',      iconColor: 'text-yellow-400',  title: '初回航行',         desc: '最初のタイピングを完了',       check: function(s) { return s.sessions >= 1; } },
        { id: 'speed_pilot',     icon: 'fas fa-rocket',     iconColor: 'text-cosmic-cyan', title: 'スピードパイロット', desc: '50 WPMを達成',                check: function(s) { return s.bestWPM >= 50; } },
        { id: 'planet_finder',   icon: 'fas fa-globe',      iconColor: 'text-energy-green', title: '惑星発見者',       desc: '最初の惑星を発見',             check: function(s) { return s.sessions >= 1; } },
        { id: 'accuracy_master', icon: 'fas fa-crosshairs', iconColor: 'text-red-400',     title: '精密操縦士',       desc: '正確率100%を達成',             check: function(s) { return s.bestAccuracy >= 100; } },
        { id: 'speed_demon',     icon: 'fas fa-bolt',       iconColor: 'text-planet-orange', title: 'ハイパードライブ', desc: '80 WPMを達成',                check: function(s) { return s.bestWPM >= 80; } },
        { id: 'marathon_pilot',  icon: 'fas fa-flag',       iconColor: 'text-purple-400',  title: 'マラソンパイロット', desc: '10セッション完了',             check: function(s) { return s.sessions >= 10; } },
        { id: 'streak_3',        icon: 'fas fa-fire',       iconColor: 'text-orange-400',  title: '3日連続',          desc: '3日連続で練習',                check: function(s) { return s.streak >= 3; } },
        { id: 'daily_hero',      icon: 'fas fa-star',       iconColor: 'text-yellow-300',  title: 'デイリーヒーロー', desc: 'デイリーチャレンジを完了',      check: function(s) { return s.dailyDone; } },
        { id: 'code_master',     icon: 'fas fa-code',       iconColor: 'text-cosmic-cyan', title: 'コードパイロット',  desc: 'コードモードで1回完了',         check: function(s) { return s.codeDone; } }
    ];

    function getUnlocked() {
        try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
    }

    function getCurrentStats() {
        var streakData = {};
        try { streakData = JSON.parse(localStorage.getItem('cosmicTyping_streak') || '{}'); } catch(e) {}
        var today = new Date().toISOString().split('T')[0];
        return {
            sessions:     parseInt(localStorage.getItem('cosmicTyping_totalSessions') || 0),
            bestWPM:      parseFloat(localStorage.getItem('cosmicTyping_bestWPM') || 0),
            bestAccuracy: parseFloat(localStorage.getItem('cosmicTyping_bestAccuracy') || 0),
            streak:       parseInt(streakData.count || 0),
            dailyDone:    !!localStorage.getItem('cosmicTyping_daily_' + today),
            codeDone:     !!localStorage.getItem('cosmicTyping_codeDone')
        };
    }

    function renderAchievements(unlocked) {
        // ゲーム画面サイドバーの実績リスト
        var list = document.getElementById('achievementList');
        if (list) {
            list.innerHTML = '';
            DEFS.forEach(function (def) {
                var isUnlocked = unlocked.indexOf(def.id) !== -1;
                var item = document.createElement('div');
                item.className = 'achievement-item p-2 bg-gray-800 rounded flex items-center space-x-3' + (isUnlocked ? '' : ' opacity-50');
                item.innerHTML = '<i class="' + def.icon + ' ' + (isUnlocked ? def.iconColor : 'text-gray-500') + '"></i>' +
                    '<div class="text-sm"><div class="font-bold ' + (isUnlocked ? 'text-white' : 'text-gray-500') + '">' + def.title + '</div>' +
                    '<div class="text-xs ' + (isUnlocked ? 'text-gray-300' : 'text-gray-600') + '">' + def.desc + '</div></div>' +
                    (isUnlocked ? '<span class="ml-auto text-xs text-yellow-400">✓</span>' : '');
                list.appendChild(item);
            });
        }
        // 統計タブの実績リスト
        var statsList = document.getElementById('achievementListStats');
        if (statsList) {
            statsList.innerHTML = list ? list.innerHTML : '';
            var progress = document.getElementById('achievementProgress');
            if (progress) progress.textContent = unlocked.length + '/' + DEFS.length;
        }
    }

    function checkAndUnlock() {
        var stats = getCurrentStats();
        var unlocked = getUnlocked();
        var newUnlocks = [];
        DEFS.forEach(function (def) {
            if (unlocked.indexOf(def.id) === -1 && def.check(stats)) {
                unlocked.push(def.id);
                newUnlocks.push(def.title);
            }
        });
        if (newUnlocks.length > 0) {
            localStorage.setItem(KEY, JSON.stringify(unlocked));
            newUnlocks.forEach(function (title) {
                setTimeout(function () { showToast('🏅 実績解放: ' + title); }, 300);
            });
        }
        renderAchievements(unlocked);
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderAchievements(getUnlocked());
        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        setTimeout(checkAndUnlock, 200);
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });

    window.AchievementUnlocker = { check: checkAndUnlock };
})();

// ==========================================
// P1-2: 最近の発見リスト（DiscoveryManager）
// ==========================================
(function DiscoveryManager() {
    var KEY = 'cosmicTyping_discoveries';
    var MAX = 5;
    var PLANET_NAMES = {
        earth: '🌍 地球', mars: '🔴 火星', jupiter: '🪐 木星',
        saturn: '🪐 土星', code: '💻 コード', basic: '📚 基礎',
        exploration: '🚀 探索', speed: '⚡ 高速', accuracy: '🎯 精密', survival: '💀 サバイバル'
    };

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
    }

    function addDiscovery(planet, wpm) {
        var list = load();
        var now = new Date();
        var time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        list.unshift({ planet: planet, wpm: wpm, time: time });
        if (list.length > MAX) list = list.slice(0, MAX);
        localStorage.setItem(KEY, JSON.stringify(list));
        render(list);
    }

    function render(list) {
        var el = document.getElementById('discoveryList');
        if (!el) return;
        if (list.length === 0) {
            el.innerHTML = '<div class="text-sm text-gray-400 text-center py-4">まだ発見はありません<br>タイピングで宇宙を探索しよう！</div>';
            return;
        }
        el.innerHTML = list.map(function(d) {
            var name = PLANET_NAMES[d.planet] || ('🪐 ' + d.planet);
            return '<div class="flex justify-between items-center text-sm py-1 border-b border-gray-700">' +
                '<span>' + name + '</span>' +
                '<span class="text-energy-green font-bold">' + (d.wpm || 0) + ' WPM</span>' +
                '<span class="text-gray-500 text-xs">' + d.time + '</span>' +
                '</div>';
        }).join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
        render(load());
        ['resultsPanel', 'timeAttackResults'].forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function(muts) {
                muts.forEach(function(m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        setTimeout(function() {
                            var planet = (window.app && window.app.currentPlanet) || 'unknown';
                            var wpmEl = t.querySelector('[id="finalWPM"],[id="ta-finalWPM"]');
                            var wpm = wpmEl ? parseFloat(wpmEl.textContent || 0) : 0;
                            if (wpm > 0) addDiscovery(planet, wpm.toFixed(1));
                            // コードモード完了フラグ
                            if (planet === 'code') localStorage.setItem('cosmicTyping_codeDone', '1');
                        }, 150);
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();
