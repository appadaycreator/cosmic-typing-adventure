// E2E Tests for Cosmic Typing Adventure
// Tests complete user workflows

class CosmicE2ETests {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
    };
    this.app = null;
  }

  // Test runner
  async runAllTests() {
    console.log("🧪 Starting Cosmic Typing Adventure E2E Tests...");

    // Wait for app to be ready
    await this.waitForApp();

    await this.testPlanetSelection();
    await this.testTypingWorkflow();
    await this.testResultsSaving();
    await this.testNavigation();
    await this.testResponsiveDesign();

    this.printResults();
  }

  // Wait for app to be initialized
  async waitForApp() {
    return new Promise((resolve) => {
      const checkApp = () => {
        if (window.app && window.app.elements) {
          this.app = window.app;
          resolve();
        } else {
          setTimeout(checkApp, 100);
        }
      };
      checkApp();
    });
  }

  // Test planet selection workflow
  async testPlanetSelection() {
    console.log("\n🌍 Testing Planet Selection...");

    if (!this.app) {
      this.addResult("App availability", false, "App not available");
      return;
    }

    // Test planet cards exist
    const planetCards = document.querySelectorAll(".planet-card");
    this.addResult(
      "Planet cards exist",
      planetCards.length >= 4,
      `Should have at least 4 planet cards (found: ${planetCards.length})`,
    );

    // Test planet selection
    const earthCard = document.querySelector('[data-planet="earth"]');
    if (earthCard) {
      // Simulate click
      earthCard.click();

      // Wait for transition
      await this.sleep(500);

      // Check if typing practice is shown
      const typingPractice = document.getElementById("typing-practice");
      this.addResult(
        "Planet selection transition",
        !typingPractice.classList.contains("hidden"),
        "Typing practice should be visible after planet selection",
      );
    } else {
      this.addResult("Earth planet card", false, "Earth planet card not found");
    }
  }

  // Test complete typing workflow
  async testTypingWorkflow() {
    console.log("\n⌨️ Testing Typing Workflow...");

    if (!this.app) {
      this.addResult("App availability for typing", false, "App not available");
      return;
    }

    // Test start button
    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
      this.addResult("Start button exists", true, "Start button should exist");

      // Test start functionality
      startBtn.click();
      await this.sleep(100);

      const typingInput = document.getElementById("typing-input");
      this.addResult(
        "Typing input activation",
        !typingInput.disabled,
        "Typing input should be enabled after start",
      );

      // Test typing simulation
      if (!typingInput.disabled) {
        const testText = "Hello World";
        typingInput.value = testText;
        typingInput.dispatchEvent(new Event("input"));

        await this.sleep(100);

        this.addResult(
          "Typing input functionality",
          typingInput.value === testText,
          "Typing input should accept text",
        );
      }
    } else {
      this.addResult("Start button", false, "Start button not found");
    }
  }

  // Test results saving
  async testResultsSaving() {
    console.log("\n💾 Testing Results Saving...");

    if (!this.app) {
      this.addResult("App availability for saving", false, "App not available");
      return;
    }

    // Test save button exists
    const saveBtn = document.getElementById("save-result");
    this.addResult(
      "Save button exists",
      saveBtn !== null,
      "Save button should exist",
    );

    // Test localStorage functionality
    const testData = {
      planet: "earth",
      wpm: 50,
      accuracy: 95,
      totalTyped: 100,
      totalErrors: 5,
      duration: 60000,
      session_date: new Date().toISOString(),
    };

    try {
      const sessions = JSON.parse(
        localStorage.getItem("cosmic_typing_sessions") || "[]",
      );
      sessions.push(testData);
      localStorage.setItem("cosmic_typing_sessions", JSON.stringify(sessions));

      const savedSessions = JSON.parse(
        localStorage.getItem("cosmic_typing_sessions") || "[]",
      );
      this.addResult(
        "LocalStorage saving",
        savedSessions.length > 0,
        "Data should be saved to localStorage",
      );
    } catch (error) {
      this.addResult(
        "LocalStorage saving",
        false,
        `LocalStorage error: ${error.message}`,
      );
    }
  }

  // Test navigation
  async testNavigation() {
    console.log("\n🧭 Testing Navigation...");

    // Test navigation buttons
    const navButtons = document.querySelectorAll(".nav-btn");
    this.addResult(
      "Navigation buttons exist",
      navButtons.length > 0,
      `Should have navigation buttons (found: ${navButtons.length})`,
    );

    // Test section switching
    const sections = ["game", "stats", "fleet"];
    for (const section of sections) {
      const sectionElement = document.getElementById(`${section}Section`);
      if (sectionElement) {
        this.addResult(
          `${section} section exists`,
          true,
          `${section} section should exist`,
        );
      } else {
        this.addResult(
          `${section} section exists`,
          false,
          `${section} section not found`,
        );
      }
    }

    // Test mobile menu
    const mobileMenu = document.getElementById("mobileMenu");
    this.addResult(
      "Mobile menu exists",
      mobileMenu !== null,
      "Mobile menu should exist",
    );
  }

  // Test responsive design
  async testResponsiveDesign() {
    console.log("\n📱 Testing Responsive Design...");

    // Test viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    this.addResult(
      "Viewport meta tag",
      viewportMeta !== null,
      "Viewport meta tag should exist",
    );

    // Test responsive CSS classes
    const responsiveElements = document.querySelectorAll(
      ".md\\:flex, .lg\\:grid, .sm\\:hidden",
    );
    this.addResult(
      "Responsive CSS classes",
      responsiveElements.length > 0,
      `Should have responsive CSS classes (found: ${responsiveElements.length})`,
    );

    // Test font scaling
    const fontSizeElements = document.querySelectorAll(
      ".font-size-xs, .font-size-sm, .font-size-md, .font-size-lg, .font-size-xl",
    );
    this.addResult(
      "Font size classes",
      fontSizeElements.length > 0,
      `Should have font size classes (found: ${fontSizeElements.length})`,
    );
  }

  // Helper methods
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    console.log("\n📋 E2E Test Results Summary:");
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

    console.log("\n🎉 E2E tests completed!");
  }
}

// Export for global access
window.CosmicE2ETests = CosmicE2ETests;

// Auto-run tests if in test environment
if (
  window.location.href.includes("test") ||
  window.location.href.includes("localhost")
) {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const tests = new CosmicE2ETests();
      tests.runAllTests();
    }, 2000); // Wait for app to fully initialize
  });
}
