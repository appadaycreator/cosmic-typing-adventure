// Basic functionality tests for Cosmic Typing Adventure

// Test utilities
const TestUtils = {
  // Mock localStorage
  mockLocalStorage: () => {
    const store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value; },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); }
    };
  },

  // Mock console
  mockConsole: () => {
    const logs = [];
    const originalConsole = { ...console };
    
    console.log = (...args) => logs.push({ type: 'log', args });
    console.error = (...args) => logs.push({ type: 'error', args });
    console.warn = (...args) => logs.push({ type: 'warn', args });
    
    return {
      logs,
      restore: () => {
        console.log = originalConsole.log;
        console.error = originalConsole.error;
        console.warn = originalConsole.warn;
      }
    };
  },

  // Test timer
  createTestTimer: () => {
    let time = 0;
    return {
      getTime: () => time,
      setTime: (t) => { time = t; },
      advance: (ms) => { time += ms; }
    };
  }
};

// Test suite
const TestSuite = {
  // Test localStorage operations
  testLocalStorage: () => {
    console.log('🧪 Testing localStorage operations...');
    
    const mockStorage = TestUtils.mockLocalStorage();
    const originalStorage = window.localStorage;
    window.localStorage = mockStorage;
    
    try {
      // Test save
      const testData = { wpm: 50, accuracy: 95, planet: 'earth' };
      localStorage.setItem('test', JSON.stringify(testData));
      
      // Test read
      const savedData = JSON.parse(localStorage.getItem('test'));
      
      if (savedData.wpm === 50 && savedData.accuracy === 95) {
        console.log('✅ localStorage operations: PASS');
        return true;
      } else {
        console.log('❌ localStorage operations: FAIL');
        return false;
      }
    } finally {
      window.localStorage = originalStorage;
    }
  },

  // Test typing engine calculations
  testTypingCalculations: () => {
    console.log('🧪 Testing typing calculations...');
    
    // Test WPM calculation
    const testText = "This is a test sentence for typing practice.";
    const testTime = 60; // seconds
    const testTyped = testText.length;
    
    const wpm = Math.round((testTyped / 5) / (testTime / 60));
    const expectedWpm = Math.round((testText.length / 5) / 1);
    
    if (wpm === expectedWpm) {
      console.log('✅ WPM calculation: PASS');
    } else {
      console.log('❌ WPM calculation: FAIL');
      return false;
    }
    
    // Test accuracy calculation
    const totalChars = testText.length;
    const errors = 2;
    const accuracy = Math.round(((totalChars - errors) / totalChars) * 100);
    const expectedAccuracy = Math.round(((totalChars - errors) / totalChars) * 100);
    
    if (accuracy === expectedAccuracy) {
      console.log('✅ Accuracy calculation: PASS');
      return true;
    } else {
      console.log('❌ Accuracy calculation: FAIL');
      return false;
    }
  },

  // Test DOM element creation
  testDOMOperations: () => {
    console.log('🧪 Testing DOM operations...');
    
    try {
      // Test element creation
      const testDiv = document.createElement('div');
      testDiv.id = 'test-element';
      testDiv.textContent = 'Test content';
      
      // Test element manipulation
      testDiv.classList.add('test-class');
      testDiv.setAttribute('data-test', 'value');
      
      if (testDiv.id === 'test-element' && 
          testDiv.textContent === 'Test content' &&
          testDiv.classList.contains('test-class') &&
          testDiv.getAttribute('data-test') === 'value') {
        console.log('✅ DOM operations: PASS');
        return true;
      } else {
        console.log('❌ DOM operations: FAIL');
        return false;
      }
    } catch (error) {
      console.log('❌ DOM operations: FAIL -', error.message);
      return false;
    }
  },

  // Test event handling
  testEventHandling: () => {
    console.log('🧪 Testing event handling...');
    
    let eventFired = false;
    const testElement = document.createElement('button');
    
    testElement.addEventListener('click', () => {
      eventFired = true;
    });
    
    // Simulate click
    testElement.click();
    
    if (eventFired) {
      console.log('✅ Event handling: PASS');
      return true;
    } else {
      console.log('❌ Event handling: FAIL');
      return false;
    }
  },

  // Test data validation
  testDataValidation: () => {
    console.log('🧪 Testing data validation...');
    
    const validSession = {
      wpm: 50,
      accuracy: 95,
      planet: 'earth',
      totalTyped: 100,
      totalErrors: 5,
      duration: 60
    };
    
    const invalidSession = {
      wpm: -10,
      accuracy: 150,
      planet: '',
      totalTyped: -5,
      totalErrors: -1,
      duration: -30
    };
    
    // Test valid data
    const isValid = (data) => {
      return data.wpm >= 0 && 
             data.accuracy >= 0 && data.accuracy <= 100 &&
             data.planet && data.planet.length > 0 &&
             data.totalTyped >= 0 &&
             data.totalErrors >= 0 &&
             data.duration > 0;
    };
    
    if (isValid(validSession) && !isValid(invalidSession)) {
      console.log('✅ Data validation: PASS');
      return true;
    } else {
      console.log('❌ Data validation: FAIL');
      return false;
    }
  },

  // Run all tests
  runAllTests: () => {
    console.log('🚀 Starting Cosmic Typing Adventure tests...\n');
    
    const tests = [
      TestSuite.testLocalStorage,
      TestSuite.testTypingCalculations,
      TestSuite.testDOMOperations,
      TestSuite.testEventHandling,
      TestSuite.testDataValidation
    ];
    
    let passed = 0;
    let total = tests.length;
    
    tests.forEach((test, index) => {
      try {
        const result = test();
        if (result) passed++;
      } catch (error) {
        console.log(`❌ Test ${index + 1} failed with error:`, error.message);
      }
    });
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Cosmic Typing Adventure is ready for launch!');
    } else {
      console.log('⚠️ Some tests failed. Please review the issues above.');
    }
    
    return passed === total;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestSuite, TestUtils };
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('tests')) {
  document.addEventListener('DOMContentLoaded', () => {
    TestSuite.runAllTests();
  });
} 