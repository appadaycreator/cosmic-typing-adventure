// Unit Tests for Cosmic Typing Adventure
// Run in browser console or test environment

class CosmicUnitTests {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
    };
  }

  // Test runner
  async runAllTests() {
    console.log("🧪 Starting Cosmic Typing Adventure Unit Tests...");

    await this.testTypingEngine();
    await this.testStatistics();
    await this.testSupabaseIntegration();
    await this.testLocalStorage();
    await this.testUtilityFunctions();

    this.printResults();
  }

  // Typing Engine Tests
  async testTypingEngine() {
    console.log("\n📝 Testing Typing Engine...");

    if (typeof TypingEngine === "undefined") {
      this.addResult(
        "TypingEngine class exists",
        false,
        "TypingEngine not found",
      );
      return;
    }

    const engine = new TypingEngine();

    // Test initialization
    this.addResult(
      "TypingEngine initialization",
      engine.currentText === "" && engine.isActive === false,
      "Engine should start with empty state",
    );

    // Test text setting
    const testText = "Hello World";
    engine.currentText = testText;
    this.addResult(
      "Text setting",
      engine.currentText === testText,
      "Text should be set correctly",
    );

    // Test WPM calculation
    engine.currentText = "Hello World";
    engine.typedText = "Hello World";
    engine.totalTyped = 11;
    engine.startTime = Date.now() - 60000; // 1 minute ago
    const wpm = engine.calculateWpm();
    this.addResult(
      "WPM calculation",
      wpm > 0 && wpm < 1000,
      `WPM should be reasonable (got: ${wpm})`,
    );

    // Test accuracy calculation
    engine.totalTyped = 10;
    engine.totalErrors = 1;
    const accuracy = engine.calculateAccuracy();
    this.addResult(
      "Accuracy calculation",
      accuracy === 90,
      `Accuracy should be 90% (got: ${accuracy}%)`,
    );
  }

  // Statistics Tests
  async testStatistics() {
    console.log("\n📊 Testing Statistics...");

    // Test local stats calculation
    const testSessions = [
      { wpm: 50, accuracy: 95, totalTyped: 100, totalErrors: 5 },
      { wpm: 60, accuracy: 90, totalTyped: 120, totalErrors: 12 },
      { wpm: 40, accuracy: 98, totalTyped: 80, totalErrors: 2 },
    ];

    const stats = this.calculateStats(testSessions);

    this.addResult(
      "Average WPM calculation",
      Math.abs(stats.avgWpm - 50) < 1,
      `Average WPM should be ~50 (got: ${stats.avgWpm})`,
    );

    this.addResult(
      "Best WPM calculation",
      stats.bestWpm === 60,
      `Best WPM should be 60 (got: ${stats.bestWpm})`,
    );

    this.addResult(
      "Average accuracy calculation",
      Math.abs(stats.avgAccuracy - 94.33) < 1,
      `Average accuracy should be ~94.33% (got: ${stats.avgAccuracy}%)`,
    );
  }

  // Supabase Integration Tests
  async testSupabaseIntegration() {
    console.log("\n🔗 Testing Supabase Integration...");

    // Test initialization
    if (typeof initializeSupabase === "function") {
      try {
        const result = await initializeSupabase();
        this.addResult(
          "Supabase initialization",
          result === true,
          "Supabase should initialize successfully",
        );
      } catch (error) {
        this.addResult(
          "Supabase initialization",
          false,
          `Supabase initialization failed: ${error.message}`,
        );
      }
    } else {
      this.addResult(
        "Supabase initialization function",
        false,
        "initializeSupabase function not found",
      );
    }

    // Test TypingStats availability
    if (window.CosmicSupabase && window.CosmicSupabase.TypingStats) {
      this.addResult(
        "TypingStats availability",
        true,
        "TypingStats should be available",
      );

      // Test getHistory method
      if (typeof window.CosmicSupabase.TypingStats.getHistory === "function") {
        try {
          const history = await window.CosmicSupabase.TypingStats.getHistory(1);
          this.addResult(
            "TypingStats.getHistory",
            Array.isArray(history),
            `getHistory should return array (got: ${typeof history})`,
          );
        } catch (error) {
          this.addResult(
            "TypingStats.getHistory",
            false,
            `getHistory failed: ${error.message}`,
          );
        }
      } else {
        this.addResult(
          "TypingStats.getHistory method",
          false,
          "getHistory method not found",
        );
      }
    } else {
      this.addResult(
        "TypingStats availability",
        false,
        "TypingStats not available",
      );
    }
  }

  // Local Storage Tests
  async testLocalStorage() {
    console.log("\n💾 Testing Local Storage...");

    const testKey = "cosmic_test_key";
    const testData = { test: "data", number: 42 };

    try {
      // Test set
      localStorage.setItem(testKey, JSON.stringify(testData));
      this.addResult("LocalStorage set", true, "LocalStorage set should work");

      // Test get
      const retrieved = JSON.parse(localStorage.getItem(testKey));
      this.addResult(
        "LocalStorage get",
        JSON.stringify(retrieved) === JSON.stringify(testData),
        "LocalStorage get should return correct data",
      );

      // Test remove
      localStorage.removeItem(testKey);
      const afterRemove = localStorage.getItem(testKey);
      this.addResult(
        "LocalStorage remove",
        afterRemove === null,
        "LocalStorage remove should work",
      );
    } catch (error) {
      this.addResult(
        "LocalStorage operations",
        false,
        `LocalStorage failed: ${error.message}`,
      );
    }
  }

  // Utility Functions Tests
  async testUtilityFunctions() {
    console.log("\n🛠️ Testing Utility Functions...");

    // Test debounce
    if (typeof debounce === "function") {
      let callCount = 0;
      const debouncedFn = debounce(() => callCount++, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      setTimeout(() => {
        this.addResult(
          "Debounce function",
          callCount === 1,
          `Debounce should call once (called: ${callCount} times)`,
        );
      }, 200);
    } else {
      this.addResult("Debounce function", false, "Debounce function not found");
    }

    // Test showMessage
    if (window.CosmicUtils && window.CosmicUtils.showMessage) {
      try {
        window.CosmicUtils.showMessage("Test message", "info");
        this.addResult(
          "ShowMessage function",
          true,
          "ShowMessage should work without error",
        );
      } catch (error) {
        this.addResult(
          "ShowMessage function",
          false,
          `ShowMessage failed: ${error.message}`,
        );
      }
    } else {
      this.addResult(
        "ShowMessage function",
        false,
        "ShowMessage function not found",
      );
    }
  }

  // Helper methods
  calculateStats(sessions) {
    if (sessions.length === 0) {
      return { avgWpm: 0, bestWpm: 0, avgAccuracy: 0 };
    }

    const stats = sessions.reduce(
      (acc, session) => {
        acc.totalWpm += session.wpm;
        acc.totalAccuracy += session.accuracy;
        acc.bestWpm = Math.max(acc.bestWpm, session.wpm);
        return acc;
      },
      {
        totalWpm: 0,
        totalAccuracy: 0,
        bestWpm: 0,
      },
    );

    return {
      avgWpm: stats.totalWpm / sessions.length,
      bestWpm: stats.bestWpm,
      avgAccuracy: stats.totalAccuracy / sessions.length,
    };
  }

  addResult(testName, passed, message) {
    this.tests.push({ name: testName, passed, message });
    this.results.total++;

    if (passed) {
      this.results.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.results.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  printResults() {
    console.log("\n📋 Test Results Summary:");
    console.log(`Total: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(
      `Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`,
    );

    if (this.results.failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.tests
        .filter((t) => !t.passed)
        .forEach((test) => {
          console.log(`  - ${test.name}: ${test.message}`);
        });
    }

    console.log("\n🎉 Unit tests completed!");
  }
}

// Export for global access
window.CosmicUnitTests = CosmicUnitTests;

// Auto-run tests if in test environment
if (
  window.location.href.includes("test") ||
  window.location.href.includes("localhost")
) {
  document.addEventListener("DOMContentLoaded", () => {
    const tests = new CosmicUnitTests();
    tests.runAllTests();
  });
}
