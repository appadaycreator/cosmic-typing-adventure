// Supabase Configuration for Cosmic Typing Adventure

// Supabase configuration（静的ホスティング用: 直書き）
const SUPABASE_CONFIG = {
  url: "https://heosgwasjtspuczbllrp.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlb3Nnd2FzanRzcHVjemJsbHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjQ3NjMsImV4cCI6MjA2Nzk0MDc2M30.zNaIL1IXFQgcoWgk5EX5t5mOkewLB1-9rrqqS_jR0Zc",
};

// Global Supabase client
let supabase = null;
let isInitializing = false;
let initializationPromise = null;

// Initialize Supabase with improved error handling
async function initializeSupabase() {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    return initializationPromise;
  }

  if (supabase) {
    return true; // Already initialized
  }

  isInitializing = true;
  initializationPromise = performInitialization();
  
  try {
    const result = await initializationPromise;
    isInitializing = false;
    return result;
  } catch (error) {
    isInitializing = false;
    console.error("Supabase initialization failed:", error);
    return false;
  }
}

// Perform the actual initialization
async function performInitialization() {
  try {
    // Check if Supabase is already loaded
    if (typeof window !== "undefined" && window.supabase) {
      console.log("Supabase already loaded from CDN");
      supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
      return true;
    }

    // Load Supabase from CDN
    await loadSupabaseFromCDN();
    
    // Create client
    supabase = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );

    // Test connection
    const { data, error } = await supabase.from('typing_sessions').select('count').limit(1);
    if (error) {
      console.warn("Supabase connection test failed:", error);
      // Continue anyway for offline functionality
    } else {
      console.log("Supabase initialized and connected successfully");
    }

    return true;
  } catch (error) {
    console.error("Supabase initialization error:", error);
    return false;
  }
}

// Load Supabase from CDN with timeout
async function loadSupabaseFromCDN() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Supabase CDN load timeout"));
    }, 10000); // 10 second timeout

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = () => {
      clearTimeout(timeout);
      if (window.supabase) {
        resolve();
      } else {
        reject(new Error("Supabase not available after script load"));
      }
    };
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Failed to load Supabase from CDN"));
    };
    document.head.appendChild(script);
  });
}

// Database operations for typing statistics
const TypingStats = {
  // Save typing session results with improved error handling
  async saveSession(sessionData) {
    if (!supabase) {
      console.warn("Supabase not initialized, saving to localStorage only");
      return this.saveToLocalStorage(sessionData);
    }

    try {
      const { data, error } = await supabase.from("typing_sessions").insert([
        {
          planet: sessionData.planet,
          wpm: sessionData.wpm,
          accuracy: sessionData.accuracy,
          total_typed: sessionData.totalTyped,
          total_errors: sessionData.totalErrors,
          duration: sessionData.duration,
          session_date: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase save error:", error);
        // Fallback to localStorage
        return this.saveToLocalStorage(sessionData);
      }

      console.log("Session saved to Supabase successfully:", data);
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      // Fallback to localStorage
      return this.saveToLocalStorage(sessionData);
    }
  },

  // Save to localStorage as fallback
  saveToLocalStorage(sessionData) {
    try {
      const existingData = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
      existingData.push({
        ...sessionData,
        id: Date.now(),
        saved_at: new Date().toISOString(),
        source: 'localStorage'
      });
      localStorage.setItem('typing_sessions', JSON.stringify(existingData));
      console.log("Session saved to localStorage");
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  },

  // Get user's typing history with fallback
  async getHistory(limit = 50) {
    if (!supabase) {
      console.warn("Supabase not initialized, using localStorage data");
      return this.getLocalHistory(limit);
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Supabase history fetch error:", error);
        return this.getLocalHistory(limit);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching history:", error);
      return this.getLocalHistory(limit);
    }
  },

  // Get history from localStorage
  getLocalHistory(limit = 50) {
    try {
      const data = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
      return data.slice(0, limit);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  // Get statistics by planet with improved error handling
  async getStatsByPlanet() {
    if (!supabase) {
      console.warn("Supabase not initialized, using localStorage data");
      return this.getLocalStatsByPlanet();
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("planet, wpm, accuracy, total_typed, total_errors")
        .order("session_date", { ascending: false });

      if (error) {
        console.error("Supabase stats fetch error:", error);
        return this.getLocalStatsByPlanet();
      }

      return this.calculatePlanetStats(data || []);
    } catch (error) {
      console.error("Error fetching planet stats:", error);
      return this.getLocalStatsByPlanet();
    }
  },

  // Calculate planet statistics from data
  calculatePlanetStats(data) {
    const stats = {};
    
    data.forEach((session) => {
      if (!stats[session.planet]) {
        stats[session.planet] = {
          sessions: 0,
          totalWpm: 0,
          totalAccuracy: 0,
          totalTyped: 0,
          totalErrors: 0,
          bestWpm: 0,
          bestAccuracy: 0,
        };
      }

      const planetStats = stats[session.planet];
      planetStats.sessions++;
      planetStats.totalWpm += session.wpm;
      planetStats.totalAccuracy += session.accuracy;
      planetStats.totalTyped += session.total_typed;
      planetStats.totalErrors += session.total_errors;

      if (session.wpm > planetStats.bestWpm) {
        planetStats.bestWpm = session.wpm;
      }

      if (session.accuracy > planetStats.bestAccuracy) {
        planetStats.bestAccuracy = session.accuracy;
      }
    });

    // Calculate averages
    Object.keys(stats).forEach((planet) => {
      const planetStats = stats[planet];
      planetStats.avgWpm = planetStats.totalWpm / planetStats.sessions;
      planetStats.avgAccuracy = planetStats.totalAccuracy / planetStats.sessions;
    });

    return stats;
  },

  // Get local stats by planet
  getLocalStatsByPlanet() {
    try {
      const data = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
      return this.calculatePlanetStats(data);
    } catch (error) {
      console.error("Error reading local stats:", error);
      return {};
    }
  },

  // Get overall statistics with fallback
  async getOverallStats() {
    if (!supabase) {
      console.warn("Supabase not initialized, using localStorage data");
      return this.getLocalOverallStats();
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("wpm, accuracy, total_typed, total_errors, session_date")
        .order("session_date", { ascending: false });

      if (error) {
        console.error("Supabase overall stats fetch error:", error);
        return this.getLocalOverallStats();
      }

      return this.calculateOverallStats(data || []);
    } catch (error) {
      console.error("Error fetching overall stats:", error);
      return this.getLocalOverallStats();
    }
  },

  // Calculate overall statistics
  calculateOverallStats(data) {
    if (!data || data.length === 0) {
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalTyped: 0,
        totalErrors: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalTime: 0,
      };
    }

    const stats = {
      totalSessions: data.length,
      totalWpm: 0,
      totalAccuracy: 0,
      totalTyped: 0,
      totalErrors: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      totalTime: 0,
    };

    data.forEach((session) => {
      stats.totalWpm += session.wpm;
      stats.totalAccuracy += session.accuracy;
      stats.totalTyped += session.total_typed;
      stats.totalErrors += session.total_errors;

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
  },

  // Get local overall stats
  getLocalOverallStats() {
    try {
      const data = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
      return this.calculateOverallStats(data);
    } catch (error) {
      console.error("Error reading local overall stats:", error);
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalTyped: 0,
        totalErrors: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalTime: 0,
      };
    }
  },
};

// Practice texts management with fallback
const PracticeTexts = {
  // Get practice texts for a specific planet
  async getTextsByPlanet(planet) {
    if (!supabase) {
      console.warn("Supabase not initialized, using local texts");
      return this.getLocalTextsByPlanet(planet);
    }

    try {
      const { data, error } = await supabase
        .from("practice_texts")
        .select("*")
        .eq("planet_id", planet)
        .eq("is_active", true);

      if (error) {
        console.error("Supabase texts fetch error:", error);
        return this.getLocalTextsByPlanet(planet);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching practice texts:", error);
      return this.getLocalTextsByPlanet(planet);
    }
  },

  // Get local practice texts
  getLocalTextsByPlanet(planet) {
    const localTexts = {
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

    return localTexts[planet] || [];
  },

  // Get random text for a planet
  async getRandomText(planet) {
    const texts = await this.getTextsByPlanet(planet);
    if (texts.length === 0) {
      return "テキストが見つかりませんでした。";
    }
    return texts[Math.floor(Math.random() * texts.length)];
  },

  // Save user preferences
  async savePreferences(preferences) {
    if (!supabase) {
      console.warn("Supabase not initialized, saving to localStorage");
      return this.savePreferencesToLocal(preferences);
    }

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .upsert([preferences], { onConflict: "user_id" });

      if (error) {
        console.error("Supabase preferences save error:", error);
        return this.savePreferencesToLocal(preferences);
      }

      console.log("Preferences saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      return this.savePreferencesToLocal(preferences);
    }
  },

  // Save preferences to localStorage
  savePreferencesToLocal(preferences) {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      console.log("Preferences saved to localStorage");
      return true;
    } catch (error) {
      console.error("Error saving preferences to localStorage:", error);
      return false;
    }
  },

  // Get user preferences
  async getPreferences() {
    if (!supabase) {
      console.warn("Supabase not initialized, using localStorage");
      return this.getPreferencesFromLocal();
    }

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .limit(1);

      if (error) {
        console.error("Supabase preferences fetch error:", error);
        return this.getPreferencesFromLocal();
      }

      return data && data.length > 0 ? data[0] : this.getDefaultPreferences();
    } catch (error) {
      console.error("Error fetching preferences:", error);
      return this.getPreferencesFromLocal();
    }
  },

  // Get preferences from localStorage
  getPreferencesFromLocal() {
    try {
      const prefs = localStorage.getItem('user_preferences');
      return prefs ? JSON.parse(prefs) : this.getDefaultPreferences();
    } catch (error) {
      console.error("Error reading preferences from localStorage:", error);
      return this.getDefaultPreferences();
    }
  },

  // Get default preferences
  getDefaultPreferences() {
    return {
      theme: 'dark',
      sound_enabled: true,
      show_wpm: true,
      show_accuracy: true,
      auto_save: true,
    };
  },
};

// Enhanced error handling function
function handleSupabaseError(error, fallbackData = null) {
  console.error("Supabase operation failed:", error);
  
  // Log additional context for debugging
  if (error.code) {
    console.error("Error code:", error.code);
  }
  if (error.message) {
    console.error("Error message:", error.message);
  }
  
  return fallbackData;
}

// Export for global access
window.CosmicSupabase = {
  initializeSupabase,
  TypingStats,
  PracticeTexts,
  handleSupabaseError,
  isConnected: () => !!supabase,
};
