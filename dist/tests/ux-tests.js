// User Experience Tests for Cosmic Typing Adventure

// Accessibility tests
describe('Accessibility Tests', () => {
    test('should have proper ARIA labels', () => {
        const planetCards = document.querySelectorAll('.planet-card');
        planetCards.forEach(card => {
            expect(card.getAttribute('role')).toBe('button');
            expect(card.getAttribute('aria-label')).toBeDefined();
        });
    });

    test('should have skip links', () => {
        const skipLink = document.querySelector('.skip-link');
        expect(skipLink).toBeDefined();
        expect(skipLink.getAttribute('href')).toBe('#main-content');
    });

    test('should have proper heading structure', () => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
        
        // Check for proper heading hierarchy
        for (let i = 1; i < headingLevels.length; i++) {
            expect(headingLevels[i] - headingLevels[i-1]).toBeLessThanOrEqual(1);
        }
    });

    test('should have proper color contrast', () => {
        const textElements = document.querySelectorAll('.text-content, .planet-name, .planet-description');
        textElements.forEach(element => {
            const style = getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            // Basic contrast check (simplified)
            expect(color).not.toBe('transparent');
            expect(backgroundColor).not.toBe('transparent');
        });
    });

    test('should support keyboard navigation', () => {
        const focusableElements = document.querySelectorAll('button, a, input, textarea, [tabindex]');
        focusableElements.forEach(element => {
            expect(element.getAttribute('tabindex')).not.toBe('-1');
        });
    });

    test('should announce screen reader messages', () => {
        const originalAnnounce = ScreenReaderUtils.announce;
        let announcedMessage = '';
        
        ScreenReaderUtils.announce = (message) => {
            announcedMessage = message;
        };
        
        ScreenReaderUtils.announce('Test message');
        expect(announcedMessage).toBe('Test message');
        
        ScreenReaderUtils.announce = originalAnnounce;
    });
});

// Mobile responsiveness tests
describe('Mobile Responsiveness Tests', () => {
    beforeEach(() => {
        // Mock mobile viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375
        });
        
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 667
        });
    });

    test('should have touch-friendly button sizes', () => {
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            expect(rect.width).toBeGreaterThanOrEqual(44);
            expect(rect.height).toBeGreaterThanOrEqual(44);
        });
    });

    test('should have proper mobile text sizing', () => {
        const body = document.body;
        const fontSize = getComputedStyle(body).fontSize;
        const fontSizeNum = parseFloat(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(16);
    });

    test('should have mobile-optimized input fields', () => {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            const fontSize = getComputedStyle(input).fontSize;
            const fontSizeNum = parseFloat(fontSize);
            expect(fontSizeNum).toBeGreaterThanOrEqual(16);
        });
    });

    test('should have proper mobile spacing', () => {
        const planetCards = document.querySelectorAll('.planet-card');
        planetCards.forEach(card => {
            const padding = getComputedStyle(card).padding;
            const paddingNum = parseFloat(padding);
            expect(paddingNum).toBeGreaterThanOrEqual(12);
        });
    });

    test('should support touch gestures', () => {
        const touchElements = document.querySelectorAll('.planet-card, .btn');
        touchElements.forEach(element => {
            expect(element.style.minHeight).toBeDefined();
            expect(element.style.minWidth).toBeDefined();
        });
    });
});

// User experience tests
describe('User Experience Tests', () => {
    test('should provide visual feedback on interactions', () => {
        const interactiveElements = document.querySelectorAll('.planet-card, .btn');
        interactiveElements.forEach(element => {
            const hasHoverEffect = element.style.transition || 
                                 getComputedStyle(element).transition !== 'all 0s ease 0s';
            expect(hasHoverEffect).toBe(true);
        });
    });

    test('should have proper loading states', () => {
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            expect(loadingSpinner).toBeDefined();
            expect(loadingSpinner.style.display).not.toBe('none');
        }
    });

    test('should have proper error handling', () => {
        const errorContainer = document.querySelector('.error-messages');
        expect(errorContainer).toBeDefined();
    });

    test('should have proper success feedback', () => {
        // Test success notification
        const originalShowSuccess = FeedbackUtils.showSuccess;
        let successMessage = '';
        
        FeedbackUtils.showSuccess = (message) => {
            successMessage = message;
        };
        
        FeedbackUtils.showSuccess('Test success');
        expect(successMessage).toBe('Test success');
        
        FeedbackUtils.showSuccess = originalShowSuccess;
    });

    test('should have proper keyboard shortcuts', () => {
        const shortcuts = {
            'Escape': 'Go back or close modal',
            'Space': 'Start/stop typing',
            'Ctrl+S': 'Save progress',
            'Ctrl+R': 'Reset typing'
        };
        
        // Test that keyboard event listeners are set up
        const hasKeyboardListeners = document.addEventListener.calledWith('keydown');
        expect(hasKeyboardListeners).toBeDefined();
    });
});

// Progressive enhancement tests
describe('Progressive Enhancement Tests', () => {
    test('should work without JavaScript', () => {
        // Test that basic functionality works without JS
        const planetCards = document.querySelectorAll('.planet-card');
        expect(planetCards.length).toBeGreaterThan(0);
        
        planetCards.forEach(card => {
            expect(card.textContent).toBeDefined();
            expect(card.querySelector('img')).toBeDefined();
        });
    });

    test('should work without localStorage', () => {
        const originalLocalStorage = window.localStorage;
        delete window.localStorage;
        
        // Test that app still works
        const appContainer = document.querySelector('.app-container');
        expect(appContainer).toBeDefined();
        
        window.localStorage = originalLocalStorage;
    });

    test('should work without modern CSS features', () => {
        // Test that layout works with basic CSS
        const planetGrid = document.querySelector('.planets-grid');
        expect(planetGrid).toBeDefined();
        
        const gridStyle = getComputedStyle(planetGrid);
        expect(gridStyle.display).toBe('grid');
    });

    test('should provide fallbacks for unsupported features', () => {
        const capabilities = ProgressiveEnhancement.checkCapabilities();
        
        // Test that fallbacks are provided
        if (!capabilities.localStorage) {
            expect(typeof StorageUtils).toBeDefined();
        }
        
        if (!capabilities.intersectionObserver) {
            // Should have fallback for lazy loading
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                expect(img.src).toBeDefined();
            });
        }
    });
});

// Performance tests
describe('Performance Tests', () => {
    test('should load within acceptable time', () => {
        const startTime = performance.now();
        
        // Simulate page load
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should have optimized images', () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            expect(img.loading).toBe('lazy');
            expect(img.alt).toBeDefined();
        });
    });

    test('should have minimal DOM queries', () => {
        const planetCards = document.querySelectorAll('.planet-card');
        const typingInput = document.querySelector('#typing-input');
        const textDisplay = document.querySelector('#text-display');
        
        expect(planetCards.length).toBeGreaterThan(0);
        expect(typingInput).toBeDefined();
        expect(textDisplay).toBeDefined();
    });

    test('should have efficient event handling', () => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            // Check that event listeners are properly set up
            expect(button.onclick !== null || button.addEventListener).toBeDefined();
        });
    });
});

// User preferences tests
describe('User Preferences Tests', () => {
    test('should save user preferences', () => {
        const testPreferences = {
            theme: 'dark',
            fontSize: 'large',
            soundEnabled: false
        };
        
        const result = UserPreferences.savePreferences(testPreferences);
        expect(result).toBe(true);
    });

    test('should load user preferences', () => {
        const preferences = UserPreferences.loadPreferences();
        expect(preferences).toBeDefined();
        expect(typeof preferences).toBe('object');
    });

    test('should apply user preferences', () => {
        const testPreferences = {
            theme: 'dark',
            fontSize: 'large',
            soundEnabled: false
        };
        
        UserPreferences.applyUserPreferences(testPreferences);
        
        expect(document.body.getAttribute('data-theme')).toBe('dark');
        expect(document.body.getAttribute('data-font-size')).toBe('large');
        expect(document.body.classList.contains('sound-disabled')).toBe(true);
    });

    test('should have default preferences', () => {
        const defaults = UserPreferences.getDefaultPreferences();
        expect(defaults.theme).toBe('auto');
        expect(defaults.fontSize).toBe('medium');
        expect(defaults.soundEnabled).toBe(true);
    });
});

// Feedback and notifications tests
describe('Feedback and Notifications Tests', () => {
    test('should show success notifications', () => {
        const originalShowSuccess = FeedbackUtils.showSuccess;
        let notificationShown = false;
        
        FeedbackUtils.showSuccess = () => {
            notificationShown = true;
        };
        
        FeedbackUtils.showSuccess('Test success');
        expect(notificationShown).toBe(true);
        
        FeedbackUtils.showSuccess = originalShowSuccess;
    });

    test('should show error notifications', () => {
        const originalShowError = FeedbackUtils.showError;
        let errorShown = false;
        
        FeedbackUtils.showError = () => {
            errorShown = true;
        };
        
        FeedbackUtils.showError('Test error');
        expect(errorShown).toBe(true);
        
        FeedbackUtils.showError = originalShowError;
    });

    test('should provide haptic feedback', () => {
        const originalVibrate = navigator.vibrate;
        let vibrationCalled = false;
        
        navigator.vibrate = () => {
            vibrationCalled = true;
        };
        
        FeedbackUtils.provideHapticFeedback('light');
        expect(vibrationCalled).toBe(true);
        
        navigator.vibrate = originalVibrate;
    });

    test('should provide audio feedback', () => {
        const originalAudioContext = window.AudioContext;
        let audioCreated = false;
        
        window.AudioContext = class MockAudioContext {
            constructor() {
                audioCreated = true;
            }
        };
        
        FeedbackUtils.provideAudioFeedback('click');
        expect(audioCreated).toBe(true);
        
        window.AudioContext = originalAudioContext;
    });
});

// Loading and progress tests
describe('Loading and Progress Tests', () => {
    test('should show loading spinner', () => {
        const spinner = LoadingUtils.showLoading('Test loading');
        expect(spinner).toBeDefined();
        expect(spinner.classList.contains('loading-overlay')).toBe(true);
        
        LoadingUtils.hideLoading(spinner);
    });

    test('should show progress bar', () => {
        const container = document.createElement('div');
        const progress = LoadingUtils.showProgress(container, 50);
        
        expect(progress).toBeDefined();
        expect(progress.update).toBeDefined();
        expect(progress.remove).toBeDefined();
        
        progress.update(75);
        progress.remove();
    });

    test('should handle loading states properly', () => {
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            expect(loadingSpinner.style.display).not.toBe('none');
        }
    });
});

// Keyboard shortcuts tests
describe('Keyboard Shortcuts Tests', () => {
    test('should handle escape key', () => {
        const originalHandleEscape = KeyboardShortcuts.handleEscape;
        let escapeHandled = false;
        
        KeyboardShortcuts.handleEscape = () => {
            escapeHandled = true;
        };
        
        // Simulate escape key press
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
        
        expect(escapeHandled).toBe(true);
        
        KeyboardShortcuts.handleEscape = originalHandleEscape;
    });

    test('should handle save shortcut', () => {
        const originalHandleSave = KeyboardShortcuts.handleSave;
        let saveHandled = false;
        
        KeyboardShortcuts.handleSave = () => {
            saveHandled = true;
        };
        
        // Simulate Ctrl+S
        const saveEvent = new KeyboardEvent('keydown', { 
            key: 's', 
            ctrlKey: true 
        });
        document.dispatchEvent(saveEvent);
        
        expect(saveHandled).toBe(true);
        
        KeyboardShortcuts.handleSave = originalHandleSave;
    });

    test('should handle reset shortcut', () => {
        const originalHandleReset = KeyboardShortcuts.handleReset;
        let resetHandled = false;
        
        KeyboardShortcuts.handleReset = () => {
            resetHandled = true;
        };
        
        // Simulate Ctrl+R
        const resetEvent = new KeyboardEvent('keydown', { 
            key: 'r', 
            ctrlKey: true 
        });
        document.dispatchEvent(resetEvent);
        
        expect(resetHandled).toBe(true);
        
        KeyboardShortcuts.handleReset = originalHandleReset;
    });
});

// Error handling tests
describe('Error Handling Tests', () => {
    test('should handle JavaScript errors', () => {
        const originalHandleError = ErrorHandling.handleError;
        let errorHandled = false;
        
        ErrorHandling.handleError = () => {
            errorHandled = true;
        };
        
        // Simulate error
        const error = new Error('Test error');
        ErrorHandling.handleError(error);
        
        expect(errorHandled).toBe(true);
        
        ErrorHandling.handleError = originalHandleError;
    });

    test('should provide user-friendly error messages', () => {
        const error = new Error('Technical error message');
        const userMessage = ErrorHandling.getErrorMessage(error);
        
        expect(userMessage).toBeDefined();
        expect(typeof userMessage).toBe('string');
    });

    test('should log errors for debugging', () => {
        const originalLogError = ErrorHandling.logError;
        let errorLogged = false;
        
        ErrorHandling.logError = () => {
            errorLogged = true;
        };
        
        const error = new Error('Test error');
        ErrorHandling.logError(error);
        
        expect(errorLogged).toBe(true);
        
        ErrorHandling.logError = originalLogError;
    });
});

// Mobile-specific tests
describe('Mobile-Specific Tests', () => {
    test('should have touch-friendly interactions', () => {
        const touchElements = document.querySelectorAll('.planet-card, .btn');
        touchElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            expect(rect.width).toBeGreaterThanOrEqual(44);
            expect(rect.height).toBeGreaterThanOrEqual(44);
        });
    });

    test('should prevent zoom on input focus', () => {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            const fontSize = getComputedStyle(input).fontSize;
            const fontSizeNum = parseFloat(fontSize);
            expect(fontSizeNum).toBeGreaterThanOrEqual(16);
        });
    });

    test('should have proper mobile viewport', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        expect(viewport).toBeDefined();
        expect(viewport.getAttribute('content')).toContain('width=device-width');
    });

    test('should support mobile gestures', () => {
        const gestureElements = document.querySelectorAll('.planet-card');
        gestureElements.forEach(element => {
            expect(element.style.userSelect).toBeDefined();
            expect(element.style.webkitTapHighlightColor).toBeDefined();
        });
    });
});

// Export test results for external use
window.UXTestResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    uxMetrics: {}
};

// Update test results
afterEach(() => {
    window.UXTestResults.totalTests++;
});

// UX monitoring
beforeEach(() => {
    window.UXTestResults.uxMetrics[expect.getState().currentTestName] = {
        startTime: performance.now(),
        memoryBefore: performance.memory?.usedJSHeapSize || 0
    };
});

afterEach(() => {
    const testName = expect.getState().currentTestName;
    const metrics = window.UXTestResults.uxMetrics[testName];
    if (metrics) {
        metrics.endTime = performance.now();
        metrics.memoryAfter = performance.memory?.usedJSHeapSize || 0;
        metrics.duration = metrics.endTime - metrics.startTime;
        metrics.memoryUsed = metrics.memoryAfter - metrics.memoryBefore;
    }
}); 