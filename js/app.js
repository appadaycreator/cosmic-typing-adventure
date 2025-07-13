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

    // Initialize app
    this.init();
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
      if (window.CosmicSupabase && window.CosmicSupabase.TypingStats) {
        const history = await window.CosmicSupabase.TypingStats.getHistory(1);
        console.log("[Supabaseテスト] 接続成功, 履歴サンプル:", history);
      }
    } catch (error) {
      console.warn("[Supabaseテスト] 接続テスト失敗:", error);
      // Continue with offline functionality
    }
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
    // Try to load from API first, fallback to local texts
    this.loadPracticeTextFromAPI(planet).catch(() => {
      console.log("Using local practice texts for", planet);
      const texts = this.practiceTexts[planet] || [];
      if (texts.length > 0) {
        this.currentText = texts[Math.floor(Math.random() * texts.length)];
        this.elements.textDisplay.textContent = this.currentText;
      } else {
        this.currentText = "この惑星のテキストが見つかりませんでした。";
        this.elements.textDisplay.textContent = this.currentText;
      }
    });
  }

  async loadPracticeTextFromAPI(planet) {
    if (window.CosmicSupabase && window.CosmicSupabase.PracticeTexts) {
      const text = await window.CosmicSupabase.PracticeTexts.getRandomText(planet);
      this.currentText = text;
      this.elements.textDisplay.textContent = this.currentText;
    } else {
      throw new Error("PracticeTexts not available");
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
    this.elements.planetSelection.style.display = "block";
    this.isPracticeActive = false;
    this.updateButtonStates();
  }

  showTypingPractice() {
    this.hideAllSections();
    this.elements.typingPractice.style.display = "block";
    this.typingEngine.reset();
    this.updateButtonStates();
  }

  showResults(results) {
    this.hideAllSections();
    this.elements.results.style.display = "block";

    this.elements.finalWpmDisplay.textContent = results.wpm.toFixed(1);
    this.elements.finalAccuracyDisplay.textContent = results.accuracy.toFixed(1);
    this.elements.totalTypedDisplay.textContent = results.totalTyped;
    this.elements.totalErrorsDisplay.textContent = results.totalErrors;

    this.updateButtonStates();
  }

  hideAllSections() {
    this.elements.planetSelection.style.display = "none";
    this.elements.typingPractice.style.display = "none";
    this.elements.results.style.display = "none";
  }

  startPractice() {
    if (!this.isPracticeActive) {
      this.isPracticeActive = true;
      this.typingEngine.start();
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
      if (window.CosmicSupabase && window.CosmicSupabase.TypingStats) {
        saved = await window.CosmicSupabase.TypingStats.saveSession(sessionData);
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
      if (window.CosmicSupabase && window.CosmicSupabase.PracticeTexts) {
        const planets = ["earth", "mars", "jupiter", "saturn"];
        for (const planet of planets) {
          const texts = await window.CosmicSupabase.PracticeTexts.getTextsByPlanet(planet);
          if (texts && texts.length > 0) {
            this.practiceTexts[planet] = texts.map(t => t.content || t);
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
      if (window.CosmicSupabase && window.CosmicSupabase.TypingStats) {
        const stats = await window.CosmicSupabase.TypingStats.getOverallStats();
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
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.cosmicTypingApp = new CosmicTypingApp();
});
