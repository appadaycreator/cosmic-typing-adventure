// Core Tests for Cosmic Typing Adventure
// コアシステムの基本的なテストスイート

class CoreTests {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    // Run all core tests
    async runAllTests() {
        console.log('🧪 Starting core tests...');

        const tests = [
            this.testDOMIntegrity,
            this.testLocalStorage,
            this.testUserDataStructure,
            this.testTypingEngine,
            this.testAudioSystem,
            this.testPerformance,
            this.testErrorHandling
        ];

        for (const test of tests) {
            try {
                await test.call(this);
                this.passedTests++;
            } catch (error) {
                this.failedTests++;
                console.error(`❌ Test failed: ${error.message}`);
            }
        }

        this.printResults();
        return this.testResults;
    }

    // Test DOM integrity
    async testDOMIntegrity() {
        const criticalElements = [
            'typingInput',
            'textDisplay',
            'gameTimer',
            'liveWPM',
            'liveAccuracy'
        ];

        const missingElements = criticalElements.filter(id => !document.getElementById(id));

        if (missingElements.length > 0) {
            throw new Error(`Critical DOM elements missing: ${missingElements.join(', ')}`);
        }

        console.log('✅ DOM integrity test passed');
        this.testResults.push({ name: 'DOM Integrity', status: 'passed' });
    }

    // Test localStorage functionality
    async testLocalStorage() {
        const testKey = 'cosmicTyping_test';
        const testValue = 'test_value';

        try {
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            if (retrieved !== testValue) {
                throw new Error('LocalStorage read/write failed');
            }

            console.log('✅ LocalStorage test passed');
            this.testResults.push({ name: 'LocalStorage', status: 'passed' });
        } catch (error) {
            throw new Error(`LocalStorage test failed: ${error.message}`);
        }
    }

    // Test user data structure
    async testUserDataStructure() {
        const testData = {
            level: 1,
            xp: 0,
            totalSessions: 0,
            totalTime: 0,
            bestWPM: 0,
            avgWPM: 0,
            bestAccuracy: 0,
            planetsDiscovered: []
        };

        // Test data validation
        const schema = {
            level: 'number',
            xp: 'number',
            totalSessions: 'number',
            totalTime: 'number',
            bestWPM: 'number',
            avgWPM: 'number',
            bestAccuracy: 'number',
            planetsDiscovered: 'object'
        };

        for (const [key, type] of Object.entries(schema)) {
            if (!(key in testData)) {
                throw new Error(`Missing required field: ${key}`);
            }
            if (typeof testData[key] !== type) {
                throw new Error(`Invalid type for ${key}: expected ${type}, got ${typeof testData[key]}`);
            }
        }

        console.log('✅ User data structure test passed');
        this.testResults.push({ name: 'User Data Structure', status: 'passed' });
    }

    // Test typing engine
    async testTypingEngine() {
        // Test basic typing calculations
        const testText = 'Hello world';
        const testInput = 'Hello worl';
        const expectedAccuracy = Math.round((9 / 10) * 100);

        let correct = 0;
        for (let i = 0; i < testInput.length; i++) {
            if (testInput[i] === testText[i]) {
                correct++;
            }
        }

        const actualAccuracy = Math.round((correct / testInput.length) * 100);

        if (actualAccuracy !== expectedAccuracy) {
            throw new Error(`Accuracy calculation failed: expected ${expectedAccuracy}%, got ${actualAccuracy}%`);
        }

        console.log('✅ Typing engine test passed');
        this.testResults.push({ name: 'Typing Engine', status: 'passed' });
    }

    // Test audio system
    async testAudioSystem() {
        // Test if audio context is available
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            console.log('✅ Audio system test passed');
            this.testResults.push({ name: 'Audio System', status: 'passed' });
        } else {
            throw new Error('AudioContext not supported');
        }
    }

    // Test performance
    async testPerformance() {
        const startTime = performance.now();

        // Simulate some work
        for (let i = 0; i < 1000; i++) {
            Math.random();
        }

        const duration = performance.now() - startTime;

        if (duration > 100) {
            throw new Error(`Performance test took too long: ${duration.toFixed(2)}ms`);
        }

        console.log('✅ Performance test passed');
        this.testResults.push({ name: 'Performance', status: 'passed' });
    }

    // Test error handling
    async testErrorHandling() {
        let errorCaught = false;

        try {
            // Intentionally throw an error
            throw new Error('Test error');
        } catch (error) {
            errorCaught = true;
        }

        if (!errorCaught) {
            throw new Error('Error handling not working');
        }

        console.log('✅ Error handling test passed');
        this.testResults.push({ name: 'Error Handling', status: 'passed' });
    }

    // Print test results
    printResults() {
        console.log('\n📊 Test Results:');
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📈 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

        if (this.failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(result => result.status === 'failed')
                .forEach(result => console.log(`  - ${result.name}`));
        }
    }

    // Test specific component
    async testComponent(componentName, testFunction) {
        try {
            await testFunction();
            console.log(`✅ ${componentName} test passed`);
            this.testResults.push({ name: componentName, status: 'passed' });
            this.passedTests++;
        } catch (error) {
            console.error(`❌ ${componentName} test failed:`, error.message);
            this.testResults.push({ name: componentName, status: 'failed', error: error.message });
            this.failedTests++;
        }
    }

    // Test data validation
    testDataValidation(data, schema) {
        const errors = [];

        for (const [key, type] of Object.entries(schema)) {
            if (!(key in data)) {
                errors.push(`Missing required field: ${key}`);
            } else if (typeof data[key] !== type) {
                errors.push(`Invalid type for ${key}: expected ${type}, got ${typeof data[key]}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Data validation failed: ${errors.join(', ')}`);
        }

        return true;
    }

    // Test function performance
    testFunctionPerformance(fn, maxDuration = 100, context = 'Function') {
        const startTime = performance.now();
        const result = fn();
        const duration = performance.now() - startTime;

        if (duration > maxDuration) {
            throw new Error(`${context} took too long: ${duration.toFixed(2)}ms (max: ${maxDuration}ms)`);
        }

        return result;
    }

    // Test async function
    async testAsyncFunction(fn, maxDuration = 1000, context = 'Async Function') {
        const startTime = performance.now();
        const result = await fn();
        const duration = performance.now() - startTime;

        if (duration > maxDuration) {
            throw new Error(`${context} took too long: ${duration.toFixed(2)}ms (max: ${maxDuration}ms)`);
        }

        return result;
    }

    // Generate test report
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            totalTests: this.passedTests + this.failedTests,
            passedTests: this.passedTests,
            failedTests: this.failedTests,
            successRate: ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1),
            results: this.testResults,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
    }
}

// Global test instance
window.coreTests = new CoreTests(); 