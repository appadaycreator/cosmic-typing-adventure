// Supabase Configuration for Cosmic Typing Adventure

// Supabase configuration（静的ホスティング用: 直書き）
const SUPABASE_CONFIG = {
  url: "https://heosgwasjtspuczbllrp.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlb3Nnd2FzanRzcHVjemJsbHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjQ3NjMsImV4cCI6MjA2Nzk0MDc2M30.zNaIL1IXFQgcoWgk5EX5t5mOkewLB1-9rrqqS_jR0Zc",
};

// Initialize Supabase client
let supabase = null;

// Initialize Supabase
async function initializeSupabase() {
  try {
    if (typeof window !== "undefined" && window.supabase) {
      supabase = window.supabase;
    } else {
      await loadSupabase();
    }
    // 必ずクライアントを生成
    if (!supabase || !supabase.from) {
      supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey,
      );
    }
    console.log("Supabase initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    return false;
  }
}

// Load Supabase from CDN
async function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      supabase = window.supabase;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@supabase/supabase-js@2";
    script.onload = () => {
      try {
        supabase = window.supabase.createClient(
          SUPABASE_CONFIG.url,
          SUPABASE_CONFIG.anonKey,
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Database operations for typing statistics
const TypingStats = {
  // Save typing session results
  async saveSession(sessionData) {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return false;
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

      if (error) throw error;

      console.log("Session saved successfully:", data);
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  },

  // Get user's typing history
  async getHistory(limit = 50) {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching history:", error);
      return [];
    }
  },

  // Get statistics by planet
  async getStatsByPlanet() {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return {};
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("planet, wpm, accuracy, total_typed, total_errors")
        .order("session_date", { ascending: false });

      if (error) throw error;

      // Group by planet and calculate averages
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
        planetStats.avgAccuracy =
          planetStats.totalAccuracy / planetStats.sessions;
      });

      return stats;
    } catch (error) {
      console.error("Error fetching planet stats:", error);
      return {};
    }
  },

  // Get overall statistics
  async getOverallStats() {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("wpm, accuracy, total_typed, total_errors, session_date")
        .order("session_date", { ascending: false });

      if (error) throw error;

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
    } catch (error) {
      console.error("Error fetching overall stats:", error);
      return null;
    }
  },
};

// Practice texts management
const PracticeTexts = {
  // Get practice texts for a specific planet
  async getTextsByPlanet(planet) {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("practice_texts")
        .select("*")
        .eq("planet", planet)
        .order("difficulty", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching practice texts:", error);
      return [];
    }
  },

  // Get random practice text for a planet
  async getRandomText(planet) {
    const texts = await this.getTextsByPlanet(planet);

    if (texts.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * texts.length);
    return texts[randomIndex];
  },
};

// User preferences management
const UserPreferences = {
  // Save user preferences
  async savePreferences(preferences) {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return false;
    }

    try {
      const { data, error } = await supabase.from("user_preferences").upsert(
        [
          {
            user_id: "anonymous", // For now, using anonymous user
            preferences: preferences,
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "user_id",
        },
      );

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      return false;
    }
  },

  // Get user preferences
  async getPreferences() {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return {};
    }

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", "anonymous")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      return data?.preferences || {};
    } catch (error) {
      console.error("Error fetching preferences:", error);
      return {};
    }
  },
};

// Error handling and fallback
function handleSupabaseError(error, fallbackData = null) {
  console.error("Supabase error:", error);

  // Show user-friendly error message
  if (window.CosmicUtils && window.CosmicUtils.showMessage) {
    window.CosmicUtils.showMessage(
      "データの保存に失敗しました。オフラインで練習を続けます。",
      "error",
    );
  } else {
    // Fallback to alert if CosmicUtils is not available
    alert("データの保存に失敗しました。オフラインで練習を続けます。");
  }

  return fallbackData;
}

// Offline fallback using localStorage
const OfflineStorage = {
  saveSession: function (sessionData) {
    try {
      const sessions = JSON.parse(
        localStorage.getItem("typing_sessions") || "[]",
      );
      sessions.push({
        ...sessionData,
        id: Date.now(),
        session_date: new Date().toISOString(),
      });

      // Keep only last 100 sessions
      if (sessions.length > 100) {
        sessions.splice(0, sessions.length - 100);
      }

      localStorage.setItem("typing_sessions", JSON.stringify(sessions));
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  },

  getHistory: function () {
    try {
      return JSON.parse(localStorage.getItem("typing_sessions") || "[]");
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  getStatsByPlanet: function () {
    const sessions = this.getHistory();
    const stats = {};

    sessions.forEach((session) => {
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
      planetStats.totalTyped += session.totalTyped;
      planetStats.totalErrors += session.totalErrors;

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
      planetStats.avgAccuracy =
        planetStats.totalAccuracy / planetStats.sessions;
    });

    return stats;
  },
};

// Export for use in other modules
window.CosmicSupabase = {
  initializeSupabase,
  TypingStats,
  PracticeTexts,
  UserPreferences,
  OfflineStorage,
  handleSupabaseError,
};

// Note: Supabase initialization is now handled by individual applications
// (e.g., CosmicTypingApp.initSupabaseAndTest())
