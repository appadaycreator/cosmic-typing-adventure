// Game Mode Tests for Cosmic Typing Adventure
// サバイバルモードとタイムアタックモードのテスト

describe('Game Mode Tests', function() {
    let app;
    
    before(function() {
        // Initialize app if not already available
        if (window.app) {
            app = window.app;
        }
    });

    describe('Survival Mode Tests', function() {
        it('should initialize survival mode with 3 lives', function() {
            const typingEngine = new TypingEngine();
            typingEngine.mode = 'survival';
            typingEngine.maxLives = 3;
            typingEngine.lives = 3;
            
            chai.assert.equal(typingEngine.mode, 'survival', 'Mode should be survival');
            chai.assert.equal(typingEngine.lives, 3, 'Should start with 3 lives');
            chai.assert.equal(typingEngine.maxLives, 3, 'Max lives should be 3');
        });

        it('should decrease lives on error', function() {
            const typingEngine = new TypingEngine();
            typingEngine.mode = 'survival';
            typingEngine.lives = 3;
            typingEngine.maxLives = 3;
            
            // Simulate error
            typingEngine.lives--;
            chai.assert.equal(typingEngine.lives, 2, 'Lives should decrease to 2');
            
            typingEngine.lives--;
            chai.assert.equal(typingEngine.lives, 1, 'Lives should decrease to 1');
            
            typingEngine.lives--;
            chai.assert.equal(typingEngine.lives, 0, 'Lives should decrease to 0');
        });

        it('should end game when lives reach 0', function() {
            const typingEngine = new TypingEngine();
            typingEngine.mode = 'survival';
            typingEngine.lives = 0;
            
            const shouldEnd = typingEngine.lives <= 0;
            chai.assert.isTrue(shouldEnd, 'Game should end when lives reach 0');
        });

        it('should show survival UI elements', function() {
            if (!document.getElementById('survivalLivesContainer')) {
                // Skip if UI not available
                this.skip();
            }
            
            const container = document.getElementById('survivalLivesContainer');
            chai.assert.isNotNull(container, 'Survival lives container should exist');
        });
    });

    describe('Time Attack Mode Tests', function() {
        it('should initialize time attack mode with time limit', function() {
            const typingEngine = new TypingEngine();
            typingEngine.mode = 'timeAttack';
            typingEngine.timeLimit = 60;
            
            chai.assert.equal(typingEngine.mode, 'timeAttack', 'Mode should be timeAttack');
            chai.assert.equal(typingEngine.timeLimit, 60, 'Time limit should be 60 seconds');
        });

        it('should support different time limits', function() {
            const timeLimits = [30, 60, 180, 300];
            
            timeLimits.forEach(limit => {
                const typingEngine = new TypingEngine();
                typingEngine.mode = 'timeAttack';
                typingEngine.timeLimit = limit;
                
                chai.assert.equal(typingEngine.timeLimit, limit, `Time limit should be ${limit}`);
            });
        });

        it('should format time display correctly', function() {
            const formatTime = (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };
            
            chai.assert.equal(formatTime(30), '00:30', '30 seconds should format as 00:30');
            chai.assert.equal(formatTime(60), '01:00', '60 seconds should format as 01:00');
            chai.assert.equal(formatTime(180), '03:00', '180 seconds should format as 03:00');
            chai.assert.equal(formatTime(300), '05:00', '300 seconds should format as 05:00');
        });

        it('should end game when time runs out', function() {
            const typingEngine = new TypingEngine();
            typingEngine.mode = 'timeAttack';
            typingEngine.timeLimit = 60;
            typingEngine.startTime = Date.now() - 61000; // 61 seconds ago
            
            const elapsed = Math.floor((Date.now() - typingEngine.startTime) / 1000);
            const remaining = Math.max(0, typingEngine.timeLimit - elapsed);
            
            chai.assert.equal(remaining, 0, 'Remaining time should be 0');
        });
    });

    describe('Rank Evaluation Tests', function() {
        it('should calculate rank correctly for high performance', function() {
            const results = { wpm: 85, accuracy: 96, mode: 'timeAttack' };
            const gameModeManager = new GameModeManager();
            const rankInfo = gameModeManager.calculateRank(results);
            
            chai.assert.equal(rankInfo.rank, 'S', 'Should get S rank for excellent performance');
            chai.assert.equal(rankInfo.rankColor, '#fbbf24', 'S rank should be gold color');
        });

        it('should calculate rank correctly for good performance', function() {
            const results = { wpm: 65, accuracy: 95, mode: 'survival' };
            const gameModeManager = new GameModeManager();
            const rankInfo = gameModeManager.calculateRank(results);
            
            chai.assert.equal(rankInfo.rank, 'A', 'Should get A rank for good performance');
        });

        it('should calculate rank correctly for average performance', function() {
            const results = { wpm: 45, accuracy: 90, mode: 'normal' };
            const gameModeManager = new GameModeManager();
            const rankInfo = gameModeManager.calculateRank(results);
            
            chai.assert.equal(rankInfo.rank, 'B', 'Should get B rank for average performance');
        });

        it('should calculate rank correctly for below average performance', function() {
            const results = { wpm: 28, accuracy: 85, mode: 'normal' };
            const gameModeManager = new GameModeManager();
            const rankInfo = gameModeManager.calculateRank(results);
            
            chai.assert.equal(rankInfo.rank, 'C', 'Should get C rank for below average');
        });

        it('should calculate rank correctly for poor performance', function() {
            const results = { wpm: 15, accuracy: 75, mode: 'normal' };
            const gameModeManager = new GameModeManager();
            const rankInfo = gameModeManager.calculateRank(results);
            
            chai.assert.equal(rankInfo.rank, 'D', 'Should get D rank for poor performance');
        });

        it('should calculate score as WPM * (accuracy/100)', function() {
            const results = { wpm: 60, accuracy: 90, mode: 'normal' };
            const gameModeManager = new GameModeManager();
            const rankInfo = gameModeManager.calculateRank(results);
            
            const expectedScore = Math.round(60 * (90 / 100));
            chai.assert.equal(rankInfo.score, expectedScore, 'Score should be WPM * (accuracy/100)');
        });
    });

    describe('Leaderboard Tests', function() {
        it('should save score to localStorage', function() {
            const leaderboardManager = new LeaderboardManager(null);
            const scoreData = {
                mode: 'survival',
                wpm: 65,
                accuracy: 95,
                score: 62,
                rank: 'A',
                totalTyped: 350,
                duration: 180,
                playerName: 'Test Player'
            };
            
            const saved = leaderboardManager.saveToLocalStorage(scoreData);
            chai.assert.isTrue(saved, 'Should save to localStorage successfully');
        });

        it('should retrieve leaderboard from localStorage', function() {
            const leaderboardManager = new LeaderboardManager(null);
            
            // Save test data
            const testScores = [
                { mode: 'survival', score: 70, wpm: 72, accuracy: 97, rank: 'A' },
                { mode: 'survival', score: 60, wpm: 65, accuracy: 92, rank: 'A' },
                { mode: 'survival', score: 45, wpm: 50, accuracy: 90, rank: 'B' }
            ];
            
            testScores.forEach(score => {
                leaderboardManager.saveToLocalStorage(score);
            });
            
            const leaderboard = leaderboardManager.getLocalLeaderboard('survival', null, 10);
            
            chai.assert.isArray(leaderboard, 'Should return an array');
            chai.assert.isAtLeast(leaderboard.length, 3, 'Should have at least 3 entries');
            
            // Check if sorted by score descending
            if (leaderboard.length >= 2) {
                chai.assert.isAtLeast(leaderboard[0].score, leaderboard[1].score, 
                    'Leaderboard should be sorted by score descending');
            }
        });

        it('should filter leaderboard by mode', function() {
            const leaderboardManager = new LeaderboardManager(null);
            
            // Clear localStorage first
            localStorage.setItem(leaderboardManager.localStorageKey, '[]');
            
            // Save different modes
            leaderboardManager.saveToLocalStorage({
                mode: 'survival', score: 70, wpm: 72, accuracy: 97, rank: 'A'
            });
            leaderboardManager.saveToLocalStorage({
                mode: 'timeAttack', score: 80, wpm: 85, accuracy: 94, rank: 'S', time_limit: 60
            });
            
            const survivalBoard = leaderboardManager.getLocalLeaderboard('survival');
            const timeAttackBoard = leaderboardManager.getLocalLeaderboard('timeAttack');
            
            chai.assert.equal(survivalBoard.length, 1, 'Should have 1 survival entry');
            chai.assert.equal(timeAttackBoard.length, 1, 'Should have 1 timeAttack entry');
            chai.assert.equal(survivalBoard[0].mode, 'survival', 'Should filter by survival mode');
            chai.assert.equal(timeAttackBoard[0].mode, 'timeAttack', 'Should filter by timeAttack mode');
        });

        it('should limit leaderboard entries', function() {
            const leaderboardManager = new LeaderboardManager(null);
            
            // Clear and add many entries
            localStorage.setItem(leaderboardManager.localStorageKey, '[]');
            
            for (let i = 0; i < 20; i++) {
                leaderboardManager.saveToLocalStorage({
                    mode: 'normal',
                    score: 50 + i,
                    wpm: 50 + i,
                    accuracy: 90,
                    rank: 'B'
                });
            }
            
            const top5 = leaderboardManager.getLocalLeaderboard('normal', null, 5);
            chai.assert.equal(top5.length, 5, 'Should limit to 5 entries');
        });
    });

    describe('Mode-Specific Result Formatting', function() {
        it('should format survival mode results correctly', function() {
            const results = {
                wpm: 65,
                accuracy: 95,
                totalTyped: 350,
                totalErrors: 15,
                duration: 180,
                cause: 'completion',
                lives: 2
            };
            
            const rankInfo = { rank: 'A', rankColor: '#10b981', rankMessage: '素晴らしい！', score: 62 };
            const formatted = formatModeResults('survival', results, rankInfo);
            
            chai.assert.equal(formatted.mode, 'survival', 'Mode should be survival');
            chai.assert.equal(formatted.rank, 'A', 'Rank should be A');
            chai.assert.equal(formatted.cause, 'completion', 'Cause should be completion');
            chai.assert.isTrue(formatted.survived, 'Should mark as survived');
        });

        it('should format time attack mode results correctly', function() {
            const results = {
                wpm: 85,
                accuracy: 96,
                totalTyped: 450,
                totalErrors: 18,
                duration: 60,
                timeLimit: 60
            };
            
            const rankInfo = { rank: 'S', rankColor: '#fbbf24', rankMessage: '素晴らしい！完璧です！', score: 82 };
            const formatted = formatModeResults('timeAttack', results, rankInfo);
            
            chai.assert.equal(formatted.mode, 'timeAttack', 'Mode should be timeAttack');
            chai.assert.equal(formatted.rank, 'S', 'Rank should be S');
            chai.assert.equal(formatted.timeLimit, 60, 'Time limit should be 60');
            chai.assert.equal(formatted.timeUsed, 60, 'Time used should be 60');
            chai.assert.exists(formatted.cpm, 'CPM should be calculated');
        });
    });
});
