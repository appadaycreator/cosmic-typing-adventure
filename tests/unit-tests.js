import { TypingEngine } from '../js/typing-engine.js';
import {
    PerformanceUtils,
    StorageUtils,
    DOMUtils,
    NetworkUtils,
    AnimationUtils,
    ErrorUtils,
    AccessibilityUtils
} from '../js/common.js';

export class CosmicUnitTests {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            failures: []
        };
    }

    async runAllTests() {
        console.log('🧪 Starting Unit Tests...');
        this.resetResults();

        await this.runTypingEngineTests();
        await this.runCommonUtilsTests();

        this.printResults();
        return this.results;
    }

    resetResults() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            failures: []
        };
    }

    // Helper: Simple assertion
    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) throw new Error(`Expected ${expected}, but got ${actual}`);
            },
            toEqual: (expected) => {
                const sActual = JSON.stringify(actual);
                const sExpected = JSON.stringify(expected);
                if (sActual !== sExpected) throw new Error(`Expected ${sExpected}, but got ${sActual}`);
            },
            toBeLessThan: (limit) => {
                if (actual >= limit) throw new Error(`Expected < ${limit}, but got ${actual}`);
            },
            toBeGreaterThan: (limit) => {
                if (actual <= limit) throw new Error(`Expected > ${limit}, but got ${actual}`);
            },
            toBeDefined: () => {
                if (actual === undefined) throw new Error(`Expected defined, but got undefined`);
            },
            toBeNull: () => {
                if (actual !== null) throw new Error(`Expected null, but got ${actual}`);
            },
            not: {
                toBeNull: () => {
                    if (actual === null) throw new Error(`Expected not null, but got null`);
                }
            }
        };
    }

    // Helper: Run individual test case
    async test(name, fn) {
        this.results.total++;
        try {
            await fn();
            this.results.passed++;
            console.log(`✅ ${name}`);
        } catch (error) {
            this.results.failed++;
            this.results.failures.push({ name, error: error.message });
            console.error(`❌ ${name}: ${error.message}`);
        }
    }

    // --- TypingEngine Tests ---
    async runTypingEngineTests() {
        console.log('\n--- TypingEngine Tests ---');

        await this.test('TypingEngine handles correct input', async () => {
            const engine = new TypingEngine();
            const elements = this.createMockElements();
            engine.init(elements);
            engine.start();

            elements.textDisplay.textContent = 'a';
            elements.typingInput.value = 'a';
            engine.handleInput({ target: elements.typingInput });

            // Assume engine tracks correct/incorrect internally if not exposed?
            // TypingEngine updates typedText.
            this.expect(engine.typedText).toBe('a');
        });

        await this.test('TypingEngine handles backspace', async () => {
            const engine = new TypingEngine();
            const elements = this.createMockElements();
            engine.init(elements);
            engine.start();

            elements.textDisplay.textContent = 'ab';
            elements.typingInput.value = 'a';
            engine.handleInput({ target: elements.typingInput });
            this.expect(engine.typedText).toBe('a');

            // Backspace simulation (TypingEngine handles input event which provides current value)
            elements.typingInput.value = '';
            engine.handleInput({ target: elements.typingInput });
            this.expect(engine.typedText).toBe('');
        });
    }

    // --- Common Utils Tests ---
    async runCommonUtilsTests() {
        console.log('\n--- Common Utils Tests ---');

        await this.test('PerformanceUtils measures time', async () => {
            const result = PerformanceUtils.measureTime(() => 1 + 1, 'Quick Math');
            this.expect(result).toBe(2);
        });

        await this.test('StorageUtils set/get item', async () => {
            StorageUtils.setItem('test_key', { val: 123 });
            const item = StorageUtils.getItem('test_key');
            this.expect(item).toEqual({ val: 123 });
        });

        await this.test('DOMUtils create element', async () => {
            const el = DOMUtils.createElement('div', { id: 'test' }, ['content']);
            this.expect(el.tagName).toBe('DIV');
            this.expect(el.id).toBe('test');
            this.expect(el.textContent).toBe('content');
        });
    }

    createMockElements() {
        return {
            textDisplay: document.createElement('div'),
            typingInput: document.createElement('input'),
            wpmDisplay: document.createElement('div'),
            accuracyDisplay: document.createElement('div'),
            timerDisplay: document.createElement('div'),
            progressBar: document.createElement('div')
        };
    }

    printResults() {
        console.log('\n📊 Unit Test Results:');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
    }
}

// Global exposure for Test Runner
window.CosmicUnitTests = CosmicUnitTests;
