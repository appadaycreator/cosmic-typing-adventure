// Main App Logic for Cosmic Typing Adventure

import { TypingEngine } from './typing-engine.js';
import { LanguageManager } from './language-manager.js';
import { SoundManager } from './sound-manager.js';
import { initUtils } from './common.js';
import { initializeSupabase, TypingStats, PracticeTexts } from './supabase-config.js';
import { AchievementSystem } from './achievement-system.js';
import { ShipUpgradeSystem } from './ship-upgrade-system.js';
import { SecurityUtils } from './security-utils.js';

export class CosmicTypingApp {
  constructor() {
    this.soundManager = new SoundManager();
    this.languageManager = new LanguageManager();
    this.currentPlanet = null;
    this.typingEngine = null;
    this.currentText = "";
    this.isPracticeActive = false;
    this.userInput = '';

    // User stats initialization
    this.userStats = {
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      totalWPM: 0
    };

    // Initialize systems
    this.achievementSystem = new AchievementSystem(this.userStats);
    this.shipUpgradeSystem = new ShipUpgradeSystem(this.soundManager, this.userStats);

    // Make app available globally
    window.app = this;

    // DOM elements
    this.elements = {
      planetSelection: null,
      typingPractice: null,
      results: null,
      planetCards: null,
      currentPlanetImage: null,
      currentPlanetName: null,
      textDisplay: null,
      typingInput: null,
      wpmDisplay: null,
      accuracyDisplay: null,
      elapsedTimeDisplay: null,
      progressFill: null,
      startBtn: null,
      pauseBtn: null,
      resetBtn: null,
      backToPlanetsBtn: null,
      finalWpmDisplay: null,
      finalAccuracyDisplay: null,
      totalTypedDisplay: null,
      totalErrorsDisplay: null,
      saveResultBtn: null,
      retryPracticeBtn: null,
      backToPlanetsFromResultsBtn: null,
    };

    // Practice texts for each planet
    // ローカルpracticeTextsの定義は削除

    // Initialize app
    this.init();

    // Run common utils initialization
    initUtils();
  }

  async init() {
    try {
      // Initialize Supabase first
      await this.initSupabase();

      // Initialize DOM and other components
      this.getDOMElements();
      this.setupEventListeners();
      this.initializeTypingEngine();
      this.showPlanetSelection();

      console.log("CosmicTypingApp initialized successfully");
    } catch (error) {
      console.error("Failed to initialize CosmicTypingApp:", error);
      // Continue with offline functionality
      this.getDOMElements();
      this.setupEventListeners();
      this.initializeTypingEngine();
      this.showPlanetSelection();
    }
  }

  async initSupabase() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize Supabase
      const success = await initializeSupabase();
      if (success) {
        console.log("Supabase initialized successfully");

        // Test connection with fallback
        await this.testSupabaseConnection();
      } else {
        console.warn("Supabase initialization failed, continuing with offline mode");
      }
    } catch (error) {
      console.error("Supabase initialization error:", error);
      // Continue with offline functionality
    }
  }

  async testSupabaseConnection() {
    try {
      if (TypingStats) {
        const history = await TypingStats.getHistory(1);
        console.log("[Supabaseテスト] 接続成功, 履歴サンプル:", history);
      }
    } catch (error) {
      console.warn("[Supabaseテスト] 接続テスト失敗:", error);
      // Continue with offline functionality
    }
  }

  getDOMElements() {
    // Fallback対応: 新旧どちらのIDでも取得できるようにする
    this.elements.planetSelection =
      document.getElementById("planet-selection") ||
      document.getElementById("missionSelection");
    this.elements.typingPractice =
      document.getElementById("typing-practice") ||
      document.getElementById("typingInterface");
    this.elements.results =
      document.getElementById("results") ||
      document.getElementById("resultsPanel");
    this.elements.planetCards = document.querySelectorAll(".planet-card");
    this.elements.currentPlanetImage = document.getElementById(
      "current-planet-image",
    );
    this.elements.currentPlanetName = document.getElementById(
      "current-planet-name",
    );
    this.elements.textDisplay =
      document.getElementById("text-display") ||
      document.getElementById("textDisplay");
    this.elements.typingInput =
      document.getElementById("typing-input") ||
      document.getElementById("typingInput");
    this.elements.wpmDisplay =
      document.getElementById("wpm") ||
      document.getElementById("liveWPM") ||
      document.getElementById("currentWPM");
    this.elements.accuracyDisplay =
      document.getElementById("accuracy") ||
      document.getElementById("liveAccuracy") ||
      document.getElementById("currentAccuracy");
    this.elements.elapsedTimeDisplay =
      document.getElementById("elapsed-time") ||
      document.getElementById("gameTimer");
    this.elements.progressFill =
      document.getElementById("progress-fill") ||
      document.getElementById("speedBar");
    this.elements.startBtn =
      document.getElementById("start-btn") ||
      document.getElementById("startBtn");
    this.elements.pauseBtn =
      document.getElementById("pause-btn") ||
      document.getElementById("pauseBtn");
    this.elements.resetBtn =
      document.getElementById("reset-btn") ||
      document.getElementById("resetBtn");
    this.elements.backToPlanetsBtn =
      document.getElementById("back-to-planets") ||
      document.getElementById("backToMissionSelection");
    this.elements.finalWpmDisplay =
      document.getElementById("final-wpm") ||
      document.getElementById("finalWPM");
    this.elements.finalAccuracyDisplay =
      document.getElementById("final-accuracy") ||
      document.getElementById("finalAccuracy");
    this.elements.totalTypedDisplay =
      document.getElementById("total-typed") ||
      document.getElementById("totalTyped");
    this.elements.totalErrorsDisplay = document.getElementById("total-errors");
    this.elements.saveResultBtn = document.getElementById("save-result");
    this.elements.retryPracticeBtn = document.getElementById("retry-practice");
    this.elements.backToPlanetsFromResultsBtn = document.getElementById(
      "back-to-planets-from-results",
    );
    // New HUD elements
    this.elements.survivalLivesDisplay = document.getElementById("survivalLives");
    this.elements.survivalLivesContainer = document.getElementById("survivalLivesContainer");
  }

  setupEventListeners() {
    // Planet selection
    if (this.elements.planetCards) {
      this.elements.planetCards.forEach((card) => {
        card.addEventListener("click", () => {
          const planet = card.dataset.planet;
          this.selectPlanet(planet);
        });
      });
    }

    // Practice controls
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener("click", () =>
        this.startPractice(),
      );
    }
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener("click", () =>
        this.pausePractice(),
      );
    }
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener("click", () =>
        this.resetPractice(),
      );
    }
    if (this.elements.backToPlanetsBtn) {
      this.elements.backToPlanetsBtn.addEventListener("click", () =>
        this.showPlanetSelection(),
      );
    }

    // Results controls
    if (this.elements.saveResultBtn) {
      this.elements.saveResultBtn.addEventListener("click", () =>
        this.saveResult(),
      );
    }
    if (this.elements.retryPracticeBtn) {
      this.elements.retryPracticeBtn.addEventListener("click", () =>
        this.retryPractice(),
      );
    }
    if (this.elements.backToPlanetsFromResultsBtn) {
      this.elements.backToPlanetsFromResultsBtn.addEventListener("click", () =>
        this.showPlanetSelection(),
      );
    }

    // Time Attack Buttons
    const timeAttackBtns = document.querySelectorAll('.time-attack-btn');
    timeAttackBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const time = parseInt(btn.dataset.timeAttack);
        this.startTimeAttack(time);
      });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            if (this.isPracticeActive) {
              this.startPractice();
            }
            break;
          case "r":
            e.preventDefault();
            this.resetPractice();
            break;
          case "Escape":
            e.preventDefault();
            this.showPlanetSelection();
            break;
        }
      }
    });
  }

  initializeTypingEngine() {
    this.typingEngine = new TypingEngine(this.soundManager);
    this.typingEngine.init({
      textDisplay: this.elements.textDisplay,
      typingInput: this.elements.typingInput,
      wpmDisplay: this.elements.wpmDisplay,
      accuracyDisplay: this.elements.accuracyDisplay,
      timerDisplay: this.elements.elapsedTimeDisplay,
      progressBar: this.elements.progressFill,
      survivalLivesDisplay: this.elements.survivalLivesDisplay,
    });

    this.typingEngine.setCallbacks({
      onProgress: (stats) => this.onTypingProgress(stats),
      onComplete: (results) => this.onTypingComplete(results),
      onError: (error) => this.onTypingError(error),
    });
  }

  startTimeAttack(seconds) {
    this.currentPlanet = 'timeAttack'; // Pseudo planet name

    this.typingEngine.mode = 'timeAttack';
    this.typingEngine.timeLimit = seconds;

    // Hide Survival UI
    if (this.elements.survivalLivesContainer) this.elements.survivalLivesContainer.classList.add('hidden');

    this.loadPracticeText('jupiter'); // Use Jupiter text for speed/time attack for now
    this.updatePlanetInfo('jupiter');

    // Update Timer Display immediately if needed
    if (this.elements.elapsedTimeDisplay) {
      const minutes = Math.floor(seconds / 60);
      const secondsRem = seconds % 60;
      this.elements.elapsedTimeDisplay.textContent =
        `${minutes.toString().padStart(2, '0')}:${secondsRem.toString().padStart(2, '0')}`;
    }

    this.showTypingPractice();
  }

  selectPlanet(planet) {
    this.currentPlanet = planet;

    // Set Mode
    if (planet === 'survival') {
      this.typingEngine.mode = 'survival';
      this.typingEngine.lives = 3;
      this.typingEngine.maxLives = 3;

      // Show Survival UI, Hide others if specific
      if (this.elements.survivalLivesContainer) this.elements.survivalLivesContainer.classList.remove('hidden');
    } else if (planet === 'timeAttack') {
      this.typingEngine.mode = 'timeAttack';
      // Hide Survival UI
      if (this.elements.survivalLivesContainer) this.elements.survivalLivesContainer.classList.add('hidden');
    } else {
      this.typingEngine.mode = 'normal';
      // Hide Survival UI
      if (this.elements.survivalLivesContainer) this.elements.survivalLivesContainer.classList.add('hidden');
    }

    this.loadPracticeText(planet === 'survival' ? 'earth' : planet); // Reuse Earth text for now or add specific
    this.updatePlanetInfo(planet === 'survival' ? 'earth' : planet); // Reuse Earth info
    this.showTypingPractice();
  }

  loadPracticeText(planet) {
    // LanguageManagerからテキスト取得
    const textObj = this.languageManager.getPracticeText(planet);
    if (textObj) {
      this.currentText = textObj.content || textObj.text || textObj;
      this.elements.textDisplay.textContent = this.currentText;
      // ローマ字表記を下に追加
      let romanized = this.currentText;
      let romanElem = document.getElementById('romanized-text');
      if (!romanElem) {
        romanElem = document.createElement('div');
        romanElem.id = 'romanized-text';
        romanElem.style.fontSize = '0.9em';
        romanElem.style.color = '#888';
        romanElem.style.marginTop = '0.3em';
        this.elements.textDisplay.parentNode.insertBefore(romanElem, this.elements.textDisplay.nextSibling);
      }
      romanElem.textContent = romanized;
    } else {
      this.currentText = "この惑星のテキストが見つかりませんでした。";
      this.elements.textDisplay.textContent = this.currentText;
      let romanElem = document.getElementById('romanized-text');
      if (romanElem) romanElem.textContent = '';
    }
  }

  updatePlanetInfo(planet) {
    const planetInfo = {
      earth: { name: "地球", image: "images/planets/earth.jpg" },
      mars: { name: "火星", image: "images/planets/mars.jpg" },
      jupiter: { name: "木星", image: "images/planets/jupiter.jpg" },
      saturn: { name: "土星", image: "images/planets/saturn.jpg" },
    };

    const info = planetInfo[planet];
    if (info) {
      this.elements.currentPlanetName.textContent = info.name;
      if (this.elements.currentPlanetImage) {
        this.elements.currentPlanetImage.src = info.image;
        this.elements.currentPlanetImage.alt = info.name;
      }
    }
  }

  showPlanetSelection() {
    this.hideAllSections();
    if (this.elements.planetSelection) {
      this.elements.planetSelection.style.display = "block";
    }
    this.isPracticeActive = false;
    this.updateButtonStates();
  }

  showTypingPractice() {
    this.hideAllSections();
    if (this.elements.typingPractice) {
      this.elements.typingPractice.style.display = "block";
    }
    this.typingEngine.reset();
    // ローマ字表記もリセット・再表示
    this.updateRomanizedText();
    this.updateButtonStates();
  }

  showResults(results) {
    this.hideAllSections();
    if (this.elements.results) {
      this.elements.results.style.display = "block";

      const titleElem = this.elements.results.querySelector('h3');
      if (titleElem) {
        if (results.cause === 'death') {
          titleElem.textContent = "MISSION FAILED";
          titleElem.style.color = "#ef4444"; // Red
        } else if (results.cause === 'timeout') {
          titleElem.textContent = "TIME UP!";
          titleElem.style.color = "#fbbf24"; // Amber
        } else {
          titleElem.textContent = "ミッション完了!";
          titleElem.style.color = "var(--cosmic-cyan)";
        }
      }
    }

    if (this.elements.finalWpmDisplay) {
      this.elements.finalWpmDisplay.textContent = results.wpm.toFixed(1);
    }
    if (this.elements.finalAccuracyDisplay) {
      this.elements.finalAccuracyDisplay.textContent = results.accuracy.toFixed(1);
    }
    if (this.elements.totalTypedDisplay) {
      this.elements.totalTypedDisplay.textContent = results.totalTyped;
    }
    if (this.elements.totalErrorsDisplay) {
      this.elements.totalErrorsDisplay.textContent = results.totalErrors;
    }

    this.updateButtonStates();
  }

  hideAllSections() {
    if (this.elements.planetSelection) {
      this.elements.planetSelection.style.display = "none";
    }
    if (this.elements.typingPractice) {
      this.elements.typingPractice.style.display = "none";
    }
    if (this.elements.results) {
      this.elements.results.style.display = "none";
    }
  }

  startPractice() {
    if (!this.isPracticeActive) {
      this.isPracticeActive = true;
      this.typingEngine.start();
      // ローマ字表記も再表示
      this.updateRomanizedText();
      this.updateButtonStates();
    }
  }

  pausePractice() {
    if (this.isPracticeActive) {
      this.isPracticeActive = false;
      this.typingEngine.pause();
      this.updateButtonStates();
    }
  }

  resetPractice() {
    this.isPracticeActive = false;
    this.typingEngine.reset();
    // ローマ字表記もリセット・再表示
    this.updateRomanizedText();
    this.updateButtonStates();
  }

  retryPractice() {
    this.loadPracticeText(this.currentPlanet);
    this.showTypingPractice();
  }

  updateButtonStates() {
    const startBtn = this.elements.startBtn;
    const pauseBtn = this.elements.pauseBtn;
    const resetBtn = this.elements.resetBtn;

    if (this.isPracticeActive) {
      startBtn.style.display = "none";
      pauseBtn.style.display = "inline-block";
      resetBtn.style.display = "inline-block";
    } else {
      startBtn.style.display = "inline-block";
      pauseBtn.style.display = "none";
      resetBtn.style.display = "inline-block";
    }
  }

  onTypingProgress(stats) {
    // Update real-time statistics
    if (this.elements.wpmDisplay) {
      this.elements.wpmDisplay.textContent = stats.wpm.toFixed(1);
    }
    if (this.elements.accuracyDisplay) {
      this.elements.accuracyDisplay.textContent = stats.accuracy.toFixed(1);
    }
    if (this.elements.elapsedTimeDisplay) {
      this.elements.elapsedTimeDisplay.textContent = stats.elapsedTime;
    }
  }

  onTypingComplete(results) {
    this.isPracticeActive = false;
    this.updateButtonStates();
    this.showResults(results);

    // Auto-save results
    this.saveResult();
  }

  onTypingError(error) {
    console.error("Typing engine error:", error);
    this.showMessage("タイピングエンジンでエラーが発生しました。", "error");
  }

  async saveResult() {
    if (!this.typingEngine || !this.currentPlanet) {
      console.warn("No typing session to save");
      return;
    }

    const results = this.typingEngine.getResults();
    if (!results) {
      console.warn("No results to save");
      return;
    }

    const sessionData = {
      planet: this.currentPlanet,
      wpm: results.wpm,
      accuracy: results.accuracy,
      totalTyped: results.totalTyped,
      totalErrors: results.totalErrors,
      duration: results.duration,
    };

    try {
      let saved = false;

      // Try to save to Supabase first
      if (TypingStats) {
        saved = await TypingStats.saveSession(sessionData);
      }

      // Always save to localStorage as backup
      this.saveResultsToStorage(sessionData);

      if (saved) {
        this.showMessage("結果が保存されました！", "success");
      } else {
        this.showMessage("結果をローカルに保存しました。", "info");
      }
    } catch (error) {
      console.error("Error saving results:", error);
      this.saveResultsToStorage(sessionData);
      this.showMessage("結果をローカルに保存しました。", "info");
    }
  }

  saveResultsToStorage(results) {
    try {
      const existingData = JSON.parse(
        localStorage.getItem("typing_sessions") || "[]"
      );
      existingData.push({
        ...results,
        id: Date.now(),
        saved_at: new Date().toISOString(),
      });

      // Keep only last 100 sessions
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }

      localStorage.setItem("typing_sessions", JSON.stringify(existingData));
      console.log("Results saved to localStorage");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  showMessage(message, type = "info") {
    // Simple message display
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 5px;
      color: white;
      z-index: 1000;
      background-color: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  }

  async loadPracticeTextsFromAPI() {
    try {
      if (PracticeTexts) {
        const planets = ["earth", "mars", "jupiter", "saturn"];
        for (const planet of planets) {
          const texts = await PracticeTexts.getTextsByPlanet(planet);
          if (texts && texts.length > 0) {
            // ローカルpracticeTextsの定義は削除
          }
        }
        console.log("Practice texts loaded from API");
      }
    } catch (error) {
      console.warn("Failed to load practice texts from API:", error);
    }
  }

  async getUserStats() {
    try {
      if (TypingStats) {
        const stats = await TypingStats.getOverallStats();
        return stats;
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
    return this.getLocalStats();
  }

  getLocalStats() {
    try {
      const sessions = JSON.parse(
        localStorage.getItem("typing_sessions") || "[]"
      );

      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          bestWpm: 0,
          bestAccuracy: 0,
        };
      }

      const stats = {
        totalSessions: sessions.length,
        totalWpm: 0,
        totalAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
      };

      sessions.forEach((session) => {
        stats.totalWpm += session.wpm;
        stats.totalAccuracy += session.accuracy;

        if (session.wpm > stats.bestWpm) {
          stats.bestWpm = session.wpm;
        }

        if (session.accuracy > stats.bestAccuracy) {
          stats.bestAccuracy = session.accuracy;
        }
      });

      stats.avgWpm = stats.totalWpm / stats.totalSessions;
      stats.avgAccuracy = stats.totalAccuracy / stats.totalSessions;

      return stats;
    } catch (error) {
      console.error("Error calculating local stats:", error);
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
      };
    }
  }

  // キーボード入力監視
  handleGlobalKeydown(e) {
    if (!this.isPracticeActive) return;
    if (e.key.length === 1) {
      this.userInput += e.key;
    } else if (e.key === 'Backspace') {
      this.userInput = this.userInput.slice(0, -1);
    }
    this.updateRomanizedText();
  }

  // ローマ字表記をtextDisplayの下に必ず表示＋色付け
  updateRomanizedText() {
    if (!this.elements.textDisplay) return;
    const text = this.elements.textDisplay.textContent;
    let romanized = text;
    let romanElem = document.getElementById('romanized-text');
    if (!romanElem) {
      romanElem = document.createElement('div');
      romanElem.id = 'romanized-text';
      romanElem.style.fontSize = '0.9em';
      romanElem.style.marginTop = '0.3em';
      this.elements.textDisplay.parentNode.insertBefore(romanElem, this.elements.textDisplay.nextSibling);
    }
    // 色付け
    let color = '#888';
    if (this.userInput.length > 0) {
      if (romanized.startsWith(this.userInput)) {
        color = '#10b981'; // 緑
      } else {
        color = '#ef4444'; // 赤
      }
    }
    romanElem.style.color = color;
    romanElem.textContent = romanized;
  }
}

// Initialize app when DOM is ready
// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new CosmicTypingApp();
});

// Export startMission to window for HTML onclick handlers
window.startMission = function (missionType) {
  if (!window.app) {
    console.error('CosmicTypingAppインスタンスが初期化されていません');
    return;
  }
  const missionMap = {
    basic: 'earth',
    exploration: 'mars',
    speed: 'jupiter',
    accuracy: 'saturn',
    survival: 'survival'
  };

  // Check if it is time attack
  if (typeof missionType === 'string' && missionType.startsWith('timeAttack')) {
    console.warn("Time Attack is not fully integrated in startMission yet without refactoring.");
    return;
  }

  const planetKey = missionMap[missionType] || missionType;
  window.app.selectPlanet(planetKey);
  window.app.showTypingPractice();
};
