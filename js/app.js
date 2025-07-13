// Main App Logic for Cosmic Typing Adventure

class CosmicTypingApp {
  constructor() {
    this.currentPlanet = null;
    this.typingEngine = null;
    this.currentText = "";
    this.isPracticeActive = false;

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
    this.practiceTexts = {
      earth: [
        "地球は太陽系の第三惑星です。生命が存在する唯一の惑星として知られています。",
        "私たちの故郷である地球は、美しい青い惑星です。海と陸地が調和した姿は、宇宙から見ると特別な存在です。",
        "地球の大気は主に窒素と酸素で構成されており、生命を支える重要な役割を果たしています。",
      ],
      mars: [
        "火星は太陽系の第四惑星で、赤い惑星として知られています。",
        "火星の表面には、かつて水が流れていた痕跡が残されています。",
        "火星探査機は、この惑星の秘密を解き明かすために日夜観測を続けています。",
      ],
      jupiter: [
        "木星は太陽系最大の惑星で、ガス惑星の代表的な存在です。",
        "木星の大赤斑は、数百年にわたって続いている巨大な嵐です。",
        "木星の強い重力は、太陽系の他の天体の軌道に大きな影響を与えています。",
      ],
      saturn: [
        "土星は美しい環を持つ惑星として、天文学者たちを魅了し続けています。",
        "土星の環は、無数の氷の粒子で構成されており、太陽の光を反射して輝きます。",
        "土星の衛星タイタンは、地球以外で唯一、表面に液体の湖が存在することが確認されています。",
      ],
    };

    // Supabase初期化＆テスト
    this.initSupabaseAndTest();
    this.init();
  }

  async initSupabaseAndTest() {
    const ok = await initializeSupabase();
    if (!ok) {
      alert(
        "Supabaseの初期化に失敗しました。ネットワークや設定を確認してください。",
      );
      return;
    }
    // 簡易テスト: 履歴取得
    if (
      window.CosmicSupabase &&
      window.CosmicSupabase.TypingStats &&
      typeof window.CosmicSupabase.TypingStats.getHistory === "function"
    ) {
      window.CosmicSupabase.TypingStats.getHistory(1)
        .then((data) => {
          console.log("[Supabaseテスト] typing_sessionsサンプル:", data);
        })
        .catch((e) => {
          console.error("[Supabaseテスト] 取得失敗:", e);
        });
    }
  }

  init() {
    this.getDOMElements();
    this.setupEventListeners();
    this.initializeTypingEngine();
    this.showPlanetSelection();
  }

  getDOMElements() {
    this.elements.planetSelection = document.getElementById("planet-selection");
    this.elements.typingPractice = document.getElementById("typing-practice");
    this.elements.results = document.getElementById("results");
    this.elements.planetCards = document.querySelectorAll(".planet-card");
    this.elements.currentPlanetImage = document.getElementById(
      "current-planet-image",
    );
    this.elements.currentPlanetName = document.getElementById(
      "current-planet-name",
    );
    this.elements.textDisplay = document.getElementById("text-display");
    this.elements.typingInput = document.getElementById("typing-input");
    this.elements.wpmDisplay = document.getElementById("wpm");
    this.elements.accuracyDisplay = document.getElementById("accuracy");
    this.elements.elapsedTimeDisplay = document.getElementById("elapsed-time");
    this.elements.progressFill = document.getElementById("progress-fill");
    this.elements.startBtn = document.getElementById("start-btn");
    this.elements.pauseBtn = document.getElementById("pause-btn");
    this.elements.resetBtn = document.getElementById("reset-btn");
    this.elements.backToPlanetsBtn = document.getElementById("back-to-planets");
    this.elements.finalWpmDisplay = document.getElementById("final-wpm");
    this.elements.finalAccuracyDisplay =
      document.getElementById("final-accuracy");
    this.elements.totalTypedDisplay = document.getElementById("total-typed");
    this.elements.totalErrorsDisplay = document.getElementById("total-errors");
    this.elements.saveResultBtn = document.getElementById("save-result");
    this.elements.retryPracticeBtn = document.getElementById("retry-practice");
    this.elements.backToPlanetsFromResultsBtn = document.getElementById(
      "back-to-planets-from-results",
    );
  }

  setupEventListeners() {
    // Planet selection
    this.elements.planetCards.forEach((card) => {
      card.addEventListener("click", () => {
        const planet = card.dataset.planet;
        this.selectPlanet(planet);
      });
    });

    // Practice controls
    this.elements.startBtn.addEventListener("click", () =>
      this.startPractice(),
    );
    this.elements.pauseBtn.addEventListener("click", () =>
      this.pausePractice(),
    );
    this.elements.resetBtn.addEventListener("click", () =>
      this.resetPractice(),
    );
    this.elements.backToPlanetsBtn.addEventListener("click", () =>
      this.showPlanetSelection(),
    );

    // Results controls
    this.elements.saveResultBtn.addEventListener("click", () =>
      this.saveResult(),
    );
    this.elements.retryPracticeBtn.addEventListener("click", () =>
      this.retryPractice(),
    );
    this.elements.backToPlanetsFromResultsBtn.addEventListener("click", () =>
      this.showPlanetSelection(),
    );

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
    this.typingEngine = new TypingEngine();
    this.typingEngine.init({
      textDisplay: this.elements.textDisplay,
      typingInput: this.elements.typingInput,
      wpmDisplay: this.elements.wpmDisplay,
      accuracyDisplay: this.elements.accuracyDisplay,
      timerDisplay: this.elements.elapsedTimeDisplay,
      progressBar: this.elements.progressFill,
    });

    this.typingEngine.setCallbacks({
      onProgress: (stats) => this.onTypingProgress(stats),
      onComplete: (results) => this.onTypingComplete(results),
      onError: (error) => this.onTypingError(error),
    });
  }

  selectPlanet(planet) {
    this.currentPlanet = planet;
    this.loadPracticeText(planet);
    this.updatePlanetInfo(planet);
    this.showTypingPractice();
  }

  loadPracticeText(planet) {
    const texts = this.practiceTexts[planet] || [];
    if (texts.length === 0) {
      this.currentText = "この惑星の練習文章を読み込み中です...";
      return;
    }

    // Select random text
    const randomIndex = Math.floor(Math.random() * texts.length);
    this.currentText = texts[randomIndex];

    // Display text
    if (this.elements.textDisplay) {
      this.elements.textDisplay.textContent = this.currentText;
    }
  }

  updatePlanetInfo(planet) {
    const planetNames = {
      earth: "地球",
      mars: "火星",
      jupiter: "木星",
      saturn: "土星",
    };

    const planetImages = {
      earth: "images/planets/earth.png",
      mars: "images/planets/mars.png",
      jupiter: "images/planets/jupiter.png",
      saturn: "images/planets/saturn.png",
    };

    if (this.elements.currentPlanetName) {
      this.elements.currentPlanetName.textContent =
        planetNames[planet] || planet;
    }

    if (this.elements.currentPlanetImage) {
      this.elements.currentPlanetImage.src = planetImages[planet] || "";
      this.elements.currentPlanetImage.alt = planetNames[planet] || planet;
    }
  }

  showPlanetSelection() {
    this.hideAllSections();
    this.elements.planetSelection.classList.remove("hidden");

    // Reset typing engine
    if (this.typingEngine) {
      this.typingEngine.reset();
    }

    this.isPracticeActive = false;
    this.updateButtonStates();
  }

  showTypingPractice() {
    this.hideAllSections();
    this.elements.typingPractice.classList.remove("hidden");

    // Reset for new practice
    this.resetPractice();
  }

  showResults(results) {
    this.hideAllSections();
    this.elements.results.classList.remove("hidden");

    // Update result displays
    this.elements.finalWpmDisplay.textContent = `${Math.round(results.wpm)} WPM`;
    this.elements.finalAccuracyDisplay.textContent = `${Math.round(results.accuracy)}%`;
    this.elements.totalTypedDisplay.textContent = results.totalTyped;
    this.elements.totalErrorsDisplay.textContent = results.totalErrors;

    // Add celebration animation
    this.elements.results.classList.add("completion-celebration");
    setTimeout(() => {
      this.elements.results.classList.remove("completion-celebration");
    }, 500);
  }

  hideAllSections() {
    this.elements.planetSelection.classList.add("hidden");
    this.elements.typingPractice.classList.add("hidden");
    this.elements.results.classList.add("hidden");
  }

  startPractice() {
    if (!this.currentText) {
      this.showMessage("練習文章が読み込まれていません。", "error");
      return;
    }

    this.typingEngine.start(this.currentText);
    this.isPracticeActive = true;
    this.updateButtonStates();

    // Focus on input
    if (this.elements.typingInput) {
      this.elements.typingInput.focus();
    }
  }

  pausePractice() {
    if (this.typingEngine) {
      this.typingEngine.pause();
      this.isPracticeActive = false;
      this.updateButtonStates();
    }
  }

  resetPractice() {
    if (this.typingEngine) {
      this.typingEngine.reset();
    }

    this.isPracticeActive = false;
    this.updateButtonStates();

    // Reload text
    if (this.currentPlanet) {
      this.loadPracticeText(this.currentPlanet);
    }
  }

  retryPractice() {
    this.showTypingPractice();
  }

  updateButtonStates() {
    if (this.elements.startBtn) {
      this.elements.startBtn.disabled = this.isPracticeActive;
    }

    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.disabled = !this.isPracticeActive;
    }
  }

  onTypingProgress(stats) {
    // Update real-time statistics
    if (this.elements.wpmDisplay) {
      this.elements.wpmDisplay.textContent = `${Math.round(stats.wpm)} WPM`;
    }

    if (this.elements.accuracyDisplay) {
      this.elements.accuracyDisplay.textContent = `${Math.round(stats.accuracy)}%`;
    }

    // Update progress bar
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${stats.progress}%`;
    }
  }

  onTypingComplete(results) {
    this.isPracticeActive = false;
    this.updateButtonStates();

    // Show results
    this.showResults(results);

    // Save results
    this.saveResultsToStorage(results);

    // Show success message
    this.showMessage("練習完了！お疲れさまでした。", "success");
  }

  onTypingError(error) {
    console.error("Typing error:", error);
    this.showMessage("タイピング中にエラーが発生しました。", "error");
  }

  saveResult() {
    if (!this.currentPlanet) return;

    // Get current results from typing engine
    const stats = this.typingEngine.getStats();

    const sessionData = {
      planet: this.currentPlanet,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      totalTyped: stats.totalTyped,
      totalErrors: stats.totalErrors,
      duration: stats.duration,
      session_date: new Date().toISOString(),
    };

    // Try to save to Supabase first, fallback to localStorage
    if (window.CosmicSupabase && window.CosmicSupabase.TypingStats) {
      window.CosmicSupabase.TypingStats.saveSession(sessionData)
        .then((success) => {
          if (success) {
            this.showMessage("結果を保存しました。", "success");
          } else {
            // Fallback to localStorage
            this.saveResultsToStorage(sessionData);
            this.showMessage("結果をローカルに保存しました。", "info");
          }
        })
        .catch((error) => {
          console.error("Error saving to Supabase:", error);
          // Fallback to localStorage
          this.saveResultsToStorage(sessionData);
          this.showMessage("結果をローカルに保存しました。", "info");
        });
    } else {
      // Fallback to localStorage
      this.saveResultsToStorage(sessionData);
      this.showMessage("結果をローカルに保存しました。", "info");
    }
  }

  saveResultsToStorage(results) {
    try {
      const sessions = JSON.parse(
        localStorage.getItem("cosmic_typing_sessions") || "[]",
      );
      sessions.push({
        ...results,
        planet: this.currentPlanet,
        session_date: new Date().toISOString(),
      });

      // Keep only last 100 sessions
      if (sessions.length > 100) {
        sessions.splice(0, sessions.length - 100);
      }

      localStorage.setItem("cosmic_typing_sessions", JSON.stringify(sessions));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  showMessage(message, type = "info") {
    if (window.CosmicUtils && window.CosmicUtils.showMessage) {
      window.CosmicUtils.showMessage(message, type);
    } else {
      // Fallback alert
      alert(message);
    }
  }

  // Load practice texts from external source
  async loadPracticeTextsFromAPI() {
    if (window.CosmicSupabase && window.CosmicSupabase.PracticeTexts) {
      try {
        for (const planet of ["earth", "mars", "jupiter", "saturn"]) {
          const texts =
            await window.CosmicSupabase.PracticeTexts.getTextsByPlanet(planet);
          if (texts.length > 0) {
            this.practiceTexts[planet] = texts.map((text) => text.content);
          }
        }
      } catch (error) {
        console.warn("Failed to load practice texts from API:", error);
      }
    }
  }

  // Get user statistics
  async getUserStats() {
    if (window.CosmicSupabase && window.CosmicSupabase.TypingStats) {
      try {
        const stats = await window.CosmicSupabase.TypingStats.getOverallStats();
        return stats;
      } catch (error) {
        console.warn("Failed to load stats from API:", error);
        return this.getLocalStats();
      }
    } else {
      return this.getLocalStats();
    }
  }

  getLocalStats() {
    try {
      const sessions = JSON.parse(
        localStorage.getItem("cosmic_typing_sessions") || "[]",
      );

      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          totalTyped: 0,
          totalErrors: 0,
          bestWpm: 0,
          bestAccuracy: 0,
        };
      }

      // Calculate stats in one pass
      const stats = sessions.reduce(
        (acc, session) => {
          acc.totalWpm += session.wpm;
          acc.totalAccuracy += session.accuracy;
          acc.totalTyped += session.totalTyped;
          acc.totalErrors += session.totalErrors;
          acc.bestWpm = Math.max(acc.bestWpm, session.wpm);
          acc.bestAccuracy = Math.max(acc.bestAccuracy, session.accuracy);
          return acc;
        },
        {
          totalSessions: sessions.length,
          totalWpm: 0,
          totalAccuracy: 0,
          totalTyped: 0,
          totalErrors: 0,
          bestWpm: 0,
          bestAccuracy: 0,
        },
      );

      // Calculate averages
      stats.avgWpm = stats.totalWpm / stats.totalSessions;
      stats.avgAccuracy = stats.totalAccuracy / stats.totalSessions;

      return stats;
    } catch (error) {
      console.error("Error getting local stats:", error);
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalTyped: 0,
        totalErrors: 0,
        bestWpm: 0,
        bestAccuracy: 0,
      };
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Wait for all dependencies to load
  if (typeof TypingEngine !== "undefined") {
    window.cosmicApp = new CosmicTypingApp();
  } else {
    // Wait for typing engine to load
    const checkDependencies = setInterval(() => {
      if (typeof TypingEngine !== "undefined") {
        clearInterval(checkDependencies);
        window.cosmicApp = new CosmicTypingApp();
      }
    }, 100);
  }
});

// Export for global access
window.CosmicTypingApp = CosmicTypingApp;
