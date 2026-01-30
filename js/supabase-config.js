// Supabase Configuration for Cosmic Typing Adventure
// 同期マネージャーと統合された完全なオフライン/オンライン対応システム

import { logger } from './logger.js';

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
let isOnline = navigator.onLine;

// Initialize Supabase with improved error handling
export async function initializeSupabase() {
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
      logger.info("Supabase already loaded from CDN");
      supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
      window.supabaseClient = supabase; // グローバルアクセス用
      return true;
    }

    // Load Supabase from CDN
    await loadSupabaseFromCDN();

    // Create client
    supabase = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
    
    window.supabaseClient = supabase; // グローバルアクセス用

    // Test connection only if online
    if (isOnline) {
      const { data, error } = await supabase.from('typing_sessions').select('count').limit(1);
      if (error) {
        logger.warn("Supabase connection test failed:", error);
        // Continue anyway for offline functionality
      } else {
        logger.info("Supabase initialized and connected successfully");
      }
    } else {
      logger.info("Supabase initialized in offline mode");
    }

    return true;
  } catch (error) {
    logger.error("Supabase initialization error:", error);
    return false;
  }
}

// Load Supabase from CDN with timeout and retry
async function loadSupabaseFromCDN() {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await attemptLoadSupabase(attempt);
    } catch (error) {
      lastError = error;
      console.warn(`Supabase CDN load attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
}

async function attemptLoadSupabase(attempt) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Supabase CDN load timeout (attempt ${attempt})`));
    }, 8000); // 8 second timeout

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
export const TypingStats = {
  // Save typing session results with sync manager integration
  async saveSession(sessionData) {
    // Always save to localStorage first for reliability
    const localSaved = this.saveToLocalStorage(sessionData);

    // Add to sync queue for online synchronization
    const operation = {
      type: 'save_session',
      data: {
        planet: sessionData.planet,
        wpm: sessionData.wpm,
        accuracy: sessionData.accuracy,
        totalTyped: sessionData.totalTyped,
        totalErrors: sessionData.totalErrors,
        duration: sessionData.duration,
        timestamp: new Date().toISOString()
      }
    };

    // 動的にsyncManagerにアクセス（循環参照を避けるため）
    const syncMgr = window.syncManager;
    if (syncMgr && typeof syncMgr.addToQueue === 'function') {
      syncMgr.addToQueue(operation);
      logger.info("Session added to sync queue");
    } else if (supabase && isOnline) {
      // Fallback: direct save if sync manager not available
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
          logger.error("Supabase save error:", error);
          return localSaved;
        }

        logger.info("Session saved to Supabase successfully");
        return true;
      } catch (error) {
        logger.error("Error saving session:", error);
        return localSaved;
      }
    }

    return localSaved;
  },

  // Save to localStorage as fallback
  saveToLocalStorage(sessionData) {
    try {
      const existingData = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
      const newSession = {
        ...sessionData,
        id: Date.now(),
        saved_at: new Date().toISOString(),
        synced: false, // 同期状態を追跡
        source: 'localStorage'
      };

      // Limit localStorage size (keep last 100 sessions)
      existingData.push(newSession);
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }

      localStorage.setItem('typing_sessions', JSON.stringify(existingData));
      logger.info("Session saved to localStorage");
      return true;
    } catch (error) {
      logger.error("Error saving to localStorage:", error);
      return false;
    }
  },

  // Get user's typing history with fallback
  async getHistory(limit = 50) {
    if (!supabase || !isOnline) {
      logger.warn("Supabase not available or offline, using localStorage data");
      return this.getLocalHistory(limit);
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Supabase history fetch error:", error);
        return this.getLocalHistory(limit);
      }

      // ローカルデータとマージ（未同期のデータを含める）
      const localData = this.getLocalHistory(limit);
      const unsyncedLocal = localData.filter(item => !item.synced);
      
      return [...unsyncedLocal, ...(data || [])].slice(0, limit);
    } catch (error) {
      logger.error("Error fetching history:", error);
      return this.getLocalHistory(limit);
    }
  },

  // Get history from localStorage
  getLocalHistory(limit = 50) {
    try {
      const data = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
      return data.slice(-limit).reverse(); // 最新のデータを優先
    } catch (error) {
      logger.error("Error reading from localStorage:", error);
      return [];
    }
  },

  // Get statistics by planet with improved error handling
  async getStatsByPlanet() {
    if (!supabase || !isOnline) {
      logger.warn("Supabase not available or offline, using localStorage data");
      return this.getLocalStatsByPlanet();
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("planet, wpm, accuracy, total_typed, total_errors")
        .order("session_date", { ascending: false });

      if (error) {
        logger.error("Supabase stats fetch error:", error);
        return this.getLocalStatsByPlanet();
      }

      return this.calculatePlanetStats(data || []);
    } catch (error) {
      logger.error("Error fetching planet stats:", error);
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
      logger.error("Error reading local stats:", error);
      return {};
    }
  },

  // Get overall statistics with fallback
  async getOverallStats() {
    if (!supabase) {
      logger.warn("Supabase not initialized, using localStorage data");
      return this.getLocalOverallStats();
    }

    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("wpm, accuracy, total_typed, total_errors, session_date")
        .order("session_date", { ascending: false });

      if (error) {
        logger.error("Supabase overall stats fetch error:", error);
        return this.getLocalOverallStats();
      }

      return this.calculateOverallStats(data || []);
    } catch (error) {
      logger.error("Error fetching overall stats:", error);
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
      logger.error("Error reading local overall stats:", error);
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

  // Mark local session as synced
  markAsSynced(sessionId) {
    try {
      const data = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
      const session = data.find(s => s.id === sessionId);
      if (session) {
        session.synced = true;
        localStorage.setItem('typing_sessions', JSON.stringify(data));
        logger.info(`Session ${sessionId} marked as synced`);
      }
    } catch (error) {
      logger.error("Error marking session as synced:", error);
    }
  },
};

// Practice texts management with fallback
export const PracticeTexts = {
  // Get practice texts for a specific planet
  async getTextsByPlanet(planet) {
    if (!supabase) {
      logger.warn("Supabase not initialized, using local texts");
      return this.getLocalTextsByPlanet(planet);
    }

    try {
      const { data, error } = await supabase
        .from("practice_texts")
        .select("*")
        .eq("planet_id", planet)
        .eq("is_active", true);

      if (error) {
        logger.error("Supabase texts fetch error:", error);
        return this.getLocalTextsByPlanet(planet);
      }

      return data || [];
    } catch (error) {
      logger.error("Error fetching practice texts:", error);
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
    // Save to localStorage first
    this.savePreferencesToLocal(preferences);

    // Add to sync queue（動的アクセス）
    const syncMgr = window.syncManager;
    if (syncMgr && typeof syncMgr.addToQueue === 'function') {
      syncMgr.addToQueue({
        type: 'save_preferences',
        data: preferences
      });
      logger.info("Preferences added to sync queue");
    } else if (supabase && isOnline) {
      // Fallback: direct save
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .upsert([preferences], { onConflict: "user_id" });

        if (error) {
          logger.error("Supabase preferences save error:", error);
        } else {
          logger.info("Preferences saved successfully");
        }
      } catch (error) {
        logger.error("Error saving preferences:", error);
      }
    }

    return true;
  },

  // Save preferences to localStorage
  savePreferencesToLocal(preferences) {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      logger.info("Preferences saved to localStorage");
      return true;
    } catch (error) {
      logger.error("Error saving preferences to localStorage:", error);
      return false;
    }
  },

  // Get user preferences
  async getPreferences() {
    if (!supabase || !isOnline) {
      logger.warn("Supabase not available, using localStorage");
      return this.getPreferencesFromLocal();
    }

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .limit(1);

      if (error) {
        logger.error("Supabase preferences fetch error:", error);
        return this.getPreferencesFromLocal();
      }

      return data && data.length > 0 ? data[0] : this.getDefaultPreferences();
    } catch (error) {
      logger.error("Error fetching preferences:", error);
      return this.getPreferencesFromLocal();
    }
  },

  // Get preferences from localStorage
  getPreferencesFromLocal() {
    try {
      const prefs = localStorage.getItem('user_preferences');
      return prefs ? JSON.parse(prefs) : this.getDefaultPreferences();
    } catch (error) {
      logger.error("Error reading preferences from localStorage:", error);
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
export function handleSupabaseError(error, fallbackData = null) {
  logger.error("Supabase operation failed:", error);

  // Log additional context for debugging
  if (error.code) {
    logger.error("Error code:", error.code);
  }
  if (error.message) {
    logger.error("Error message:", error.message);
  }

  return fallbackData;
}

// Get Supabase client instance
export function getSupabaseClient() {
  return supabase;
}

// Check if online
export function isSupabaseOnline() {
  return isOnline;
}
