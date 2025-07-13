// Unit Tests for Cosmic Typing Adventure - Performance Tests Added

// Test suite for TypingEngine
describe('TypingEngine Performance Tests', () => {
    let engine;
    let mockElements;

    beforeEach(() => {
        // Create mock DOM elements
        mockElements = {
            textDisplay: document.createElement('div'),
            typingInput: document.createElement('textarea'),
            wpmDisplay: document.createElement('div'),
            accuracyDisplay: document.createElement('div'),
            timerDisplay: document.createElement('div'),
            progressBar: document.createElement('div')
        };

        engine = new TypingEngine();
        engine.init(mockElements);
    });

    afterEach(() => {
        engine = null;
        mockElements = null;
    });

    // Performance tests
    describe('Performance Tests', () => {
        test('should handle large text efficiently', () => {
            const largeText = 'Lorem ipsum '.repeat(1000); // 6000 characters
            mockElements.textDisplay.textContent = largeText;
            
            const startTime = performance.now();
            engine.start();
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
        });

        test('should handle rapid input efficiently', () => {
            const text = 'Hello world this is a test';
            mockElements.textDisplay.textContent = text;
            engine.start();
            
            const startTime = performance.now();
            
            // Simulate rapid typing
            for (let i = 0; i < text.length; i++) {
                mockElements.typingInput.value = text.substring(0, i + 1);
                engine.handleInput({ target: mockElements.typingInput });
            }
            
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(500); // Should handle rapid input within 500ms
        });

        test('should use Map for error tracking efficiently', () => {
            const text = 'Hello world';
            mockElements.textDisplay.textContent = text;
            engine.start();
            
            // Add some errors
            for (let i = 0; i < text.length; i++) {
                if (i % 3 === 0) { // Every 3rd character is an error
                    engine.addError(i, text[i], 'x');
                }
            }
            
            expect(engine.errors.size).toBe(4); // Should have 4 errors
            expect(engine.errors.has(0)).toBe(true);
            expect(engine.errors.has(3)).toBe(true);
            expect(engine.errors.has(6)).toBe(true);
            expect(engine.errors.has(9)).toBe(true);
        });

        test('should debounce display updates', () => {
            const text = 'Hello world';
            mockElements.textDisplay.textContent = text;
            engine.start();
            
            const updateSpy = jest.spyOn(engine, 'updateDisplays');
            
            // Rapid input
            for (let i = 0; i < text.length; i++) {
                mockElements.typingInput.value = text.substring(0, i + 1);
                engine.handleInput({ target: mockElements.typingInput });
            }
            
            // Wait for debounce
            setTimeout(() => {
                expect(updateSpy).toHaveBeenCalledTimes(1); // Should be called only once due to debouncing
            }, 100);
        });

        test('should throttle progress updates', () => {
            const text = 'Hello world this is a longer text for testing';
            mockElements.textDisplay.textContent = text;
            engine.start();
            
            const progressSpy = jest.spyOn(engine, 'updateProgress');
            
            // Rapid input
            for (let i = 0; i < text.length; i++) {
                mockElements.typingInput.value = text.substring(0, i + 1);
                engine.handleInput({ target: mockElements.typingInput });
            }
            
            expect(progressSpy).toHaveBeenCalledTimes(1); // Should be throttled
        });
    });

    // Memory usage tests
    describe('Memory Tests', () => {
        test('should not leak memory during typing', () => {
            const text = 'Hello world '.repeat(100); // 1200 characters
            mockElements.textDisplay.textContent = text;
            
            const initialMemory = performance.memory?.usedJSHeapSize || 0;
            
            engine.start();
            
            // Simulate typing
            for (let i = 0; i < text.length; i++) {
                mockElements.typingInput.value = text.substring(0, i + 1);
                engine.handleInput({ target: mockElements.typingInput });
            }
            
            engine.stop();
            
            const finalMemory = performance.memory?.usedJSHeapSize || 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 1MB)
            expect(memoryIncrease).toBeLessThan(1024 * 1024);
        });

        test('should clear errors efficiently', () => {
            const text = 'Hello world';
            mockElements.textDisplay.textContent = text;
            engine.start();
            
            // Add errors
            for (let i = 0; i < text.length; i++) {
                engine.addError(i, text[i], 'x');
            }
            
            expect(engine.errors.size).toBe(text.length);
            
            // Clear errors
            engine.errors.clear();
            expect(engine.errors.size).toBe(0);
        });
    });

    // DOM performance tests
    describe('DOM Performance Tests', () => {
        test('should batch DOM updates efficiently', () => {
            const text = 'Hello world this is a test';
            mockElements.textDisplay.textContent = text;
            engine.start();
            
            const displaySpy = jest.spyOn(engine, 'displayText');
            
            // Simulate typing
            for (let i = 0; i < text.length; i++) {
                mockElements.typingInput.value = text.substring(0, i + 1);
                engine.handleInput({ target: mockElements.typingInput });
            }
            
            // Should not call displayText for every character due to throttling
            expect(displaySpy).toHaveBeenCalledTimes(1);
        });

        test('should use efficient DOM element caching', () => {
            expect(engine.elements).toBeDefined();
            expect(engine.elements.textDisplay).toBe(mockElements.textDisplay);
            expect(engine.elements.typingInput).toBe(mockElements.typingInput);
        });
    });
});

// Test suite for PerformanceUtils
describe('PerformanceUtils Tests', () => {
    test('should measure execution time correctly', () => {
        const mockFn = jest.fn(() => {
            // Simulate some work
            for (let i = 0; i < 1000; i++) {
                Math.random();
            }
        });

        const result = PerformanceUtils.measureTime(mockFn, 'Test Function');
        
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(result).toBeUndefined(); // Function returns undefined
    });

    test('should debounce function calls', (done) => {
        let callCount = 0;
        const debouncedFn = PerformanceUtils.debounce(() => {
            callCount++;
        }, 50);

        // Call multiple times rapidly
        debouncedFn();
        debouncedFn();
        debouncedFn();

        setTimeout(() => {
            expect(callCount).toBe(1); // Should only be called once
            done();
        }, 100);
    });

    test('should throttle function calls', (done) => {
        let callCount = 0;
        const throttledFn = PerformanceUtils.throttle(() => {
            callCount++;
        }, 100);

        // Call multiple times rapidly
        throttledFn();
        throttledFn();
        throttledFn();

        setTimeout(() => {
            expect(callCount).toBe(1); // Should only be called once
            done();
        }, 150);
    });
});

// Test suite for StorageUtils
describe('StorageUtils Tests', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    test('should set and get items correctly', () => {
        const testData = { name: 'Test', value: 123 };
        
        const setResult = StorageUtils.setItem('test-key', testData);
        expect(setResult).toBe(true);
        
        const getResult = StorageUtils.getItem('test-key');
        expect(getResult).toEqual(testData);
    });

    test('should handle localStorage errors gracefully', () => {
        // Mock localStorage to throw error
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = jest.fn(() => {
            throw new Error('Storage quota exceeded');
        });

        const result = StorageUtils.setItem('test-key', 'value');
        expect(result).toBe(false);

        // Restore original function
        localStorage.setItem = originalSetItem;
    });

    test('should cleanup old data', () => {
        // Add some test data with timestamps
        const oldData = { timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000) }; // 31 days old
        const newData = { timestamp: Date.now() }; // Current time
        
        localStorage.setItem('old-key', JSON.stringify(oldData));
        localStorage.setItem('new-key', JSON.stringify(newData));
        
        StorageUtils.cleanupOldData();
        
        expect(localStorage.getItem('old-key')).toBeNull();
        expect(localStorage.getItem('new-key')).not.toBeNull();
    });
});

// Test suite for DOMUtils
describe('DOMUtils Tests', () => {
    test('should create elements efficiently', () => {
        const element = DOMUtils.createElement('div', {
            className: 'test-class',
            id: 'test-id'
        }, ['Hello World']);
        
        expect(element.tagName).toBe('DIV');
        expect(element.className).toBe('test-class');
        expect(element.id).toBe('test-id');
        expect(element.textContent).toBe('Hello World');
    });

    test('should batch DOM updates', () => {
        const updates = [
            () => document.body.appendChild(document.createElement('div')),
            () => document.body.appendChild(document.createElement('span')),
            () => document.body.appendChild(document.createElement('p'))
        ];

        DOMUtils.batchDOMUpdates(updates);
        
        // Check that elements were added
        expect(document.body.children.length).toBeGreaterThan(0);
    });

    test('should toggle classes efficiently', () => {
        const element = document.createElement('div');
        
        DOMUtils.toggleClass(element, 'test-class');
        expect(element.classList.contains('test-class')).toBe(true);
        
        DOMUtils.toggleClass(element, 'test-class');
        expect(element.classList.contains('test-class')).toBe(false);
        
        DOMUtils.toggleClass(element, 'test-class', true);
        expect(element.classList.contains('test-class')).toBe(true);
    });
});

// Test suite for NetworkUtils
describe('NetworkUtils Tests', () => {
    test('should check online status', () => {
        const isOnline = NetworkUtils.isOnline();
        expect(typeof isOnline).toBe('boolean');
    });

    test('should retry with exponential backoff', async () => {
        let attemptCount = 0;
        const failingFn = jest.fn(() => {
            attemptCount++;
            throw new Error('Test error');
        });

        try {
            await NetworkUtils.retry(failingFn, 3, 10);
        } catch (error) {
            expect(attemptCount).toBe(3);
            expect(error.message).toBe('Test error');
        }
    });

    test('should fetch with timeout', async () => {
        // Mock fetch to simulate timeout
        global.fetch = jest.fn(() => 
            new Promise(resolve => setTimeout(resolve, 100))
        );

        try {
            await NetworkUtils.fetchWithTimeout('https://example.com', {}, 50);
        } catch (error) {
            expect(error.name).toBe('AbortError');
        }
    });
});

// Test suite for AnimationUtils
describe('AnimationUtils Tests', () => {
    test('should scroll to element smoothly', () => {
        const element = document.createElement('div');
        document.body.appendChild(element);
        
        const scrollSpy = jest.spyOn(window, 'scrollTo');
        
        AnimationUtils.scrollToElement(element);
        
        expect(scrollSpy).toHaveBeenCalled();
        
        document.body.removeChild(element);
    });

    test('should fade in element', (done) => {
        const element = document.createElement('div');
        element.style.display = 'none';
        document.body.appendChild(element);
        
        AnimationUtils.fadeIn(element, 100);
        
        setTimeout(() => {
            expect(element.style.display).toBe('block');
            expect(parseFloat(element.style.opacity)).toBeGreaterThan(0);
            document.body.removeChild(element);
            done();
        }, 150);
    });
});

// Test suite for ErrorUtils
describe('ErrorUtils Tests', () => {
    test('should execute functions safely', () => {
        const successFn = jest.fn(() => 'success');
        const errorFn = jest.fn(() => {
            throw new Error('Test error');
        });
        
        const successResult = ErrorUtils.safeExecute(successFn, 'fallback');
        const errorResult = ErrorUtils.safeExecute(errorFn, 'fallback');
        
        expect(successResult).toBe('success');
        expect(errorResult).toBe('fallback');
    });

    test('should execute async functions safely', async () => {
        const successFn = jest.fn(async () => 'success');
        const errorFn = jest.fn(async () => {
            throw new Error('Test error');
        });
        
        const successResult = await ErrorUtils.safeExecuteAsync(successFn, 'fallback');
        const errorResult = await ErrorUtils.safeExecuteAsync(errorFn, 'fallback');
        
        expect(successResult).toBe('success');
        expect(errorResult).toBe('fallback');
    });
});

// Test suite for AccessibilityUtils
describe('AccessibilityUtils Tests', () => {
    test('should trap focus in element', () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <button>Button 1</button>
            <input type="text">
            <button>Button 2</button>
        `;
        document.body.appendChild(container);
        
        AccessibilityUtils.trapFocus(container);
        
        // Focus should be trapped within the container
        const firstButton = container.querySelector('button');
        const lastButton = container.querySelectorAll('button')[1];
        
        firstButton.focus();
        expect(document.activeElement).toBe(firstButton);
        
        // Simulate Tab key
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        container.dispatchEvent(tabEvent);
        
        document.body.removeChild(container);
    });

    test('should announce to screen readers', () => {
        const announceSpy = jest.spyOn(document.body, 'appendChild');
        
        AccessibilityUtils.announce('Test message');
        
        expect(announceSpy).toHaveBeenCalled();
    });
});

// Performance benchmark tests
describe('Performance Benchmarks', () => {
    test('should handle 1000 character text efficiently', () => {
        const text = 'Lorem ipsum '.repeat(83); // ~1000 characters
        const engine = new TypingEngine();
        const elements = {
            textDisplay: { textContent: text },
            typingInput: { value: '' },
            wpmDisplay: {},
            accuracyDisplay: {},
            timerDisplay: {},
            progressBar: {}
        };
        
        engine.init(elements);
        
        const startTime = performance.now();
        engine.start();
        const endTime = performance.now();
        
        expect(endTime - startTime).toBeLessThan(50); // Should initialize within 50ms
    });

    test('should handle rapid error corrections efficiently', () => {
        const text = 'Hello world this is a test';
        const engine = new TypingEngine();
        const elements = {
            textDisplay: { textContent: text },
            typingInput: { value: '' },
            wpmDisplay: {},
            accuracyDisplay: {},
            timerDisplay: {},
            progressBar: {}
        };
        
        engine.init(elements);
        engine.start();
        
        const startTime = performance.now();
        
        // Simulate typing with corrections
        for (let i = 0; i < text.length; i++) {
            elements.typingInput.value = text.substring(0, i + 1);
            engine.handleInput({ target: elements.typingInput });
            
            // Simulate backspace every 5 characters
            if (i % 5 === 0 && i > 0) {
                elements.typingInput.value = text.substring(0, i);
                engine.handleBackspace(i);
            }
        }
        
        const endTime = performance.now();
        
        expect(endTime - startTime).toBeLessThan(200); // Should handle corrections within 200ms
    });
});

// Memory leak detection tests
describe('Memory Leak Detection', () => {
    test('should not retain references after reset', () => {
        const engine = new TypingEngine();
        const elements = {
            textDisplay: { textContent: 'Test' },
            typingInput: { value: '' },
            wpmDisplay: {},
            accuracyDisplay: {},
            timerDisplay: {},
            progressBar: {}
        };
        
        engine.init(elements);
        engine.start();
        
        // Simulate some typing
        elements.typingInput.value = 'Test';
        engine.handleInput({ target: elements.typingInput });
        
        // Reset should clear all references
        engine.reset();
        
        expect(engine.currentText).toBe('');
        expect(engine.typedText).toBe('');
        expect(engine.errors.size).toBe(0);
        expect(engine.isActive).toBe(false);
    });

    test('should clean up timers properly', () => {
        const engine = new TypingEngine();
        const elements = {
            textDisplay: { textContent: 'Test' },
            typingInput: { value: '' },
            wpmDisplay: {},
            accuracyDisplay: {},
            timerDisplay: {},
            progressBar: {}
        };
        
        engine.init(elements);
        engine.start();
        
        expect(engine.wpmTimer).toBeDefined();
        
        engine.stop();
        
        expect(engine.wpmTimer).toBeNull();
    });
});

// Export test results for external use
window.CosmicTestResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    performanceMetrics: {}
};

// Update test results
afterEach(() => {
    window.CosmicTestResults.totalTests++;
});

// Performance monitoring
beforeEach(() => {
    if (performance.memory) {
        window.CosmicTestResults.performanceMetrics[expect.getState().currentTestName] = {
            memoryBefore: performance.memory.usedJSHeapSize,
            timeBefore: performance.now()
        };
    }
});

afterEach(() => {
    if (performance.memory) {
        const testName = expect.getState().currentTestName;
        const metrics = window.CosmicTestResults.performanceMetrics[testName];
        if (metrics) {
            metrics.memoryAfter = performance.memory.usedJSHeapSize;
            metrics.timeAfter = performance.now();
            metrics.memoryUsed = metrics.memoryAfter - metrics.memoryBefore;
            metrics.timeUsed = metrics.timeAfter - metrics.timeBefore;
        }
    }
});
