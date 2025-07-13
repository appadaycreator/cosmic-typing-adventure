// Security Tests for Cosmic Typing Adventure

// Test suite for SecurityUtils
describe('SecurityUtils Tests', () => {
    test('should sanitize HTML content', () => {
        const maliciousInput = '<script>alert("xss")</script>Hello World';
        const sanitized = SecurityUtils.sanitizeHtml(maliciousInput);
        
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).toContain('Hello World');
    });

    test('should sanitize text content', () => {
        const htmlInput = '<p>Hello <strong>World</strong></p>';
        const sanitized = SecurityUtils.sanitizeText(htmlInput);
        
        expect(sanitized).toBe('Hello World');
        expect(sanitized).not.toContain('<p>');
        expect(sanitized).not.toContain('<strong>');
    });

    test('should validate email format', () => {
        expect(SecurityUtils.validateEmail('test@example.com')).toBe(true);
        expect(SecurityUtils.validateEmail('invalid-email')).toBe(false);
        expect(SecurityUtils.validateEmail('test@')).toBe(false);
        expect(SecurityUtils.validateEmail('@example.com')).toBe(false);
    });

    test('should validate URL format', () => {
        expect(SecurityUtils.validateUrl('https://example.com')).toBe(true);
        expect(SecurityUtils.validateUrl('http://example.com')).toBe(true);
        expect(SecurityUtils.validateUrl('invalid-url')).toBe(false);
        expect(SecurityUtils.validateUrl('ftp://example.com')).toBe(true);
    });

    test('should validate typing text content', () => {
        const validText = 'This is a valid typing text for testing purposes.';
        const result = SecurityUtils.validateTypingText(validText);
        expect(result).toBe(validText);
    });

    test('should reject short text', () => {
        expect(() => {
            SecurityUtils.validateTypingText('Short');
        }).toThrow('Text must be at least 10 characters long');
    });

    test('should reject text with XSS patterns', () => {
        const maliciousText = 'Hello <script>alert("xss")</script> World';
        expect(() => {
            SecurityUtils.validateTypingText(maliciousText);
        }).toThrow('Text contains potentially harmful content');
    });

    test('should validate user statistics', () => {
        const validStats = {
            wpm: 50,
            accuracy: 95.5,
            totalTyped: 1000,
            totalErrors: 50
        };
        
        const result = SecurityUtils.validateUserStats(validStats);
        expect(result).toEqual(validStats);
    });

    test('should reject invalid WPM values', () => {
        const invalidStats = {
            wpm: -10,
            accuracy: 95,
            totalTyped: 1000,
            totalErrors: 50
        };
        
        expect(() => {
            SecurityUtils.validateUserStats(invalidStats);
        }).toThrow('Invalid WPM value');
    });

    test('should generate secure tokens', () => {
        const token1 = SecurityUtils.generateSecureToken(16);
        const token2 = SecurityUtils.generateSecureToken(16);
        
        expect(token1).toHaveLength(16);
        expect(token2).toHaveLength(16);
        expect(token1).not.toBe(token2);
    });

    test('should hash data consistently', () => {
        const data = 'test data';
        const hash1 = SecurityUtils.hashData(data);
        const hash2 = SecurityUtils.hashData(data);
        
        expect(hash1).toBe(hash2);
        expect(typeof hash1).toBe('string');
    });

    test('should encrypt and decrypt data', () => {
        const data = 'sensitive information';
        const key = 'secret-key';
        
        const encrypted = SecurityUtils.encryptData(data, key);
        const decrypted = SecurityUtils.decryptData(encrypted, key);
        
        expect(decrypted).toBe(data);
        expect(encrypted).not.toBe(data);
    });
});

// Test suite for XSSProtection
describe('XSSProtection Tests', () => {
    test('should detect XSS patterns', () => {
        const xssPatterns = [
            '<script>alert("xss")</script>',
            'javascript:alert("xss")',
            'onclick="alert(\'xss\')"',
            'data:text/html,<script>alert("xss")</script>',
            '<iframe src="javascript:alert(\'xss\')"></iframe>'
        ];
        
        xssPatterns.forEach(pattern => {
            expect(XSSProtection.detectXSS(pattern)).toBe(true);
        });
    });

    test('should not detect normal text as XSS', () => {
        const normalTexts = [
            'Hello World',
            'This is normal text',
            'Text with < and > symbols',
            'Text with "quotes" and \'apostrophes\''
        ];
        
        normalTexts.forEach(text => {
            expect(XSSProtection.detectXSS(text)).toBe(false);
        });
    });

    test('should sanitize input for display', () => {
        const input = '<script>alert("xss")</script>Hello & World';
        const sanitized = XSSProtection.sanitizeForDisplay(input);
        
        expect(sanitized).toContain('&lt;script&gt;');
        expect(sanitized).toContain('&amp;');
        expect(sanitized).toContain('Hello');
    });

    test('should safely assign innerHTML', () => {
        const element = document.createElement('div');
        const safeContent = '<span>Hello World</span>';
        
        XSSProtection.safeInnerHTML(element, safeContent);
        expect(element.innerHTML).toContain('<span>Hello World</span>');
    });

    test('should reject unsafe innerHTML', () => {
        const element = document.createElement('div');
        const unsafeContent = '<script>alert("xss")</script>';
        
        expect(() => {
            XSSProtection.safeInnerHTML(element, unsafeContent);
        }).toThrow('Content contains potentially harmful code');
    });
});

// Test suite for CSRFProtection
describe('CSRFProtection Tests', () => {
    test('should generate CSRF tokens', () => {
        const token1 = CSRFProtection.generateCSRFToken();
        const token2 = CSRFProtection.generateCSRFToken();
        
        expect(token1).toHaveLength(32);
        expect(token2).toHaveLength(32);
        expect(token1).not.toBe(token2);
    });

    test('should validate CSRF tokens', () => {
        const token = CSRFProtection.generateCSRFToken();
        
        expect(CSRFProtection.validateCSRFToken(token, token)).toBe(true);
        expect(CSRFProtection.validateCSRFToken(token, 'different-token')).toBe(false);
        expect(CSRFProtection.validateCSRFToken(null, token)).toBe(false);
        expect(CSRFProtection.validateCSRFToken(token, null)).toBe(false);
    });

    test('should add CSRF token to requests', () => {
        const requestData = { action: 'save', data: 'test' };
        const result = CSRFProtection.addCSRFTokenToRequest(requestData);
        
        expect(result.action).toBe('save');
        expect(result.data).toBe('test');
        expect(result.csrfToken).toBeDefined();
        expect(result.csrfToken).toHaveLength(32);
    });
});

// Test suite for CSPUtils
describe('CSPUtils Tests', () => {
    test('should generate CSP header', () => {
        const cspHeader = CSPUtils.generateCSPHeader();
        
        expect(cspHeader).toContain('default-src');
        expect(cspHeader).toContain('script-src');
        expect(cspHeader).toContain('style-src');
        expect(cspHeader).toContain('frame-src');
        expect(cspHeader).toContain('object-src');
    });

    test('should validate CSP compliance', () => {
        const safeScript = 'console.log("Hello World");';
        const unsafeScript = 'eval("console.log(\'Hello World\')");';
        
        expect(CSPUtils.validateCSPCompliance(safeScript)).toBe(true);
        expect(CSPUtils.validateCSPCompliance(unsafeScript)).toBe(false);
    });
});

// Test suite for DataValidation
describe('DataValidation Tests', () => {
    test('should validate user profile data', () => {
        const validProfile = {
            username: 'testuser',
            email: 'test@example.com',
            displayName: 'Test User'
        };
        
        const result = DataValidation.validateUserProfile(validProfile);
        expect(result).toEqual(validProfile);
    });

    test('should reject invalid username', () => {
        const invalidProfile = {
            username: 'a', // Too short
            email: 'test@example.com'
        };
        
        expect(() => {
            DataValidation.validateUserProfile(invalidProfile);
        }).toThrow('Username must be 3-20 characters long');
    });

    test('should reject invalid email', () => {
        const invalidProfile = {
            username: 'testuser',
            email: 'invalid-email'
        };
        
        expect(() => {
            DataValidation.validateUserProfile(invalidProfile);
        }).toThrow('Invalid email format');
    });

    test('should validate typing session data', () => {
        const validSession = {
            text: 'This is a valid typing session text.',
            wpm: 50,
            accuracy: 95.5,
            duration: 120
        };
        
        const result = DataValidation.validateTypingSession(validSession);
        expect(result).toEqual(validSession);
    });

    test('should reject invalid session data', () => {
        const invalidSession = {
            text: 'Short',
            wpm: 50,
            accuracy: 95.5,
            duration: 120
        };
        
        expect(() => {
            DataValidation.validateTypingSession(invalidSession);
        }).toThrow('Text must be at least 10 characters long');
    });
});

// Test suite for SecurityMonitoring
describe('SecurityMonitoring Tests', () => {
    beforeEach(() => {
        SecurityMonitoring.securityEvents = [];
    });

    test('should log security events', () => {
        const event = {
            type: 'test_event',
            details: { message: 'Test security event' }
        };
        
        SecurityMonitoring.logSecurityEvent(event);
        
        expect(SecurityMonitoring.securityEvents).toHaveLength(1);
        expect(SecurityMonitoring.securityEvents[0].type).toBe('test_event');
    });

    test('should detect suspicious activity', () => {
        const suspiciousInputs = [
            '<script>alert("xss")</script>',
            'javascript:alert("xss")',
            'onclick="alert(\'xss\')"',
            'eval("console.log(\'test\')")',
            'new Function("alert(\'test\')")'
        ];
        
        suspiciousInputs.forEach(input => {
            expect(SecurityMonitoring.detectSuspiciousActivity(input)).toBe(true);
        });
    });

    test('should not detect normal input as suspicious', () => {
        const normalInputs = [
            'Hello World',
            'This is normal text',
            'Text with < and > symbols',
            'console.log("Hello World")'
        ];
        
        normalInputs.forEach(input => {
            expect(SecurityMonitoring.detectSuspiciousActivity(input)).toBe(false);
        });
    });

    test('should generate security report', () => {
        SecurityMonitoring.logSecurityEvent({
            type: 'test_event',
            details: { message: 'Test event' }
        });
        
        const report = SecurityMonitoring.getSecurityReport();
        
        expect(report.totalEvents).toBe(1);
        expect(report.events).toHaveLength(1);
        expect(report.timestamp).toBeDefined();
    });

    test('should limit security events to 100', () => {
        for (let i = 0; i < 150; i++) {
            SecurityMonitoring.logSecurityEvent({
                type: 'test_event',
                details: { message: `Event ${i}` }
            });
        }
        
        expect(SecurityMonitoring.securityEvents).toHaveLength(100);
    });
});

// Test suite for TypingEngine Security
describe('TypingEngine Security Tests', () => {
    let engine;
    let mockElements;

    beforeEach(() => {
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

    test('should validate text content before starting', () => {
        const maliciousText = '<script>alert("xss")</script>Hello World';
        mockElements.textDisplay.textContent = maliciousText;
        
        engine.start();
        
        // Should not start due to security validation
        expect(engine.isActive).toBe(false);
    });

    test('should handle valid text content', () => {
        const validText = 'This is a valid typing text for testing purposes.';
        mockElements.textDisplay.textContent = validText;
        
        engine.start();
        
        expect(engine.isActive).toBe(true);
        expect(engine.currentText).toBe(validText);
    });

    test('should validate input during typing', () => {
        const validText = 'Hello World';
        mockElements.textDisplay.textContent = validText;
        engine.start();
        
        // Simulate suspicious input
        mockElements.typingInput.value = '<script>alert("xss")</script>';
        engine.handleInput({ target: mockElements.typingInput });
        
        // Should not process suspicious input
        expect(engine.typedText).toBe('');
    });

    test('should safely display text with XSS protection', () => {
        const text = 'Hello <script>alert("xss")</script> World';
        mockElements.textDisplay.textContent = text;
        
        engine.start();
        engine.displayText();
        
        // Should not contain script tags
        expect(mockElements.textDisplay.innerHTML).not.toContain('<script>');
    });

    test('should validate results with security', () => {
        const validText = 'This is a valid typing text for testing purposes.';
        mockElements.textDisplay.textContent = validText;
        engine.start();
        
        // Simulate typing
        mockElements.typingInput.value = validText;
        engine.handleInput({ target: mockElements.typingInput });
        
        const results = engine.getResults();
        
        expect(results.wpm).toBeDefined();
        expect(results.accuracy).toBeDefined();
        expect(results.totalTyped).toBeDefined();
    });

    test('should configure security settings', () => {
        engine.setSecurityConfig({
            securityEnabled: false,
            inputValidation: false
        });
        
        const status = engine.getSecurityStatus();
        
        expect(status.securityEnabled).toBe(false);
        expect(status.inputValidation).toBe(false);
    });

    test('should report security status', () => {
        const status = engine.getSecurityStatus();
        
        expect(status.securityEnabled).toBe(true);
        expect(status.inputValidation).toBe(true);
        expect(status.securityUtilsAvailable).toBe(true);
        expect(status.xssProtectionAvailable).toBe(true);
        expect(status.securityMonitoringAvailable).toBe(true);
    });
});

// Test suite for Security Integration
describe('Security Integration Tests', () => {
    test('should handle security errors gracefully', () => {
        const engine = new TypingEngine();
        const elements = {
            textDisplay: { textContent: '<script>alert("xss")</script>' },
            typingInput: { value: '' },
            wpmDisplay: {},
            accuracyDisplay: {},
            timerDisplay: {},
            progressBar: {}
        };
        
        engine.init(elements);
        
        let errorCaught = false;
        engine.setCallbacks({
            onError: (error) => {
                errorCaught = true;
                expect(error.type).toBe('security');
            }
        });
        
        engine.start();
        
        expect(errorCaught).toBe(true);
    });

    test('should prevent XSS in text display', () => {
        const engine = new TypingEngine();
        const elements = {
            textDisplay: document.createElement('div'),
            typingInput: document.createElement('textarea'),
            wpmDisplay: document.createElement('div'),
            accuracyDisplay: document.createElement('div'),
            timerDisplay: document.createElement('div'),
            progressBar: document.createElement('div')
        };
        
        engine.init(elements);
        
        const maliciousText = 'Hello <script>alert("xss")</script> World';
        elements.textDisplay.textContent = maliciousText;
        
        engine.start();
        engine.displayText();
        
        // Should not execute scripts
        expect(elements.textDisplay.innerHTML).not.toContain('<script>');
    });

    test('should validate all user inputs', () => {
        const testCases = [
            { input: 'Normal text', expected: true },
            { input: '<script>alert("xss")</script>', expected: false },
            { input: 'javascript:alert("xss")', expected: false },
            { input: 'onclick="alert(\'xss\')"', expected: false },
            { input: 'Text with < and > symbols', expected: true }
        ];
        
        testCases.forEach(({ input, expected }) => {
            const isValid = !SecurityMonitoring.detectSuspiciousActivity(input);
            expect(isValid).toBe(expected);
        });
    });
});

// Performance security tests
describe('Security Performance Tests', () => {
    test('should handle large input validation efficiently', () => {
        const largeText = 'Lorem ipsum '.repeat(1000); // 6000 characters
        const startTime = performance.now();
        
        try {
            SecurityUtils.validateTypingText(largeText);
        } catch (error) {
            // Expected for large text
        }
        
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    test('should detect XSS patterns efficiently', () => {
        const patterns = [
            '<script>alert("xss")</script>',
            'javascript:alert("xss")',
            'onclick="alert(\'xss\')"',
            'data:text/html,<script>alert("xss")</script>'
        ];
        
        const startTime = performance.now();
        
        patterns.forEach(pattern => {
            XSSProtection.detectXSS(pattern);
        });
        
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });

    test('should sanitize content efficiently', () => {
        const content = '<script>alert("xss")</script>Hello & World'.repeat(100);
        const startTime = performance.now();
        
        XSSProtection.sanitizeForDisplay(content);
        
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });
});

// Export test results for external use
window.SecurityTestResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    securityMetrics: {}
};

// Update test results
afterEach(() => {
    window.SecurityTestResults.totalTests++;
});

// Security monitoring during tests
beforeEach(() => {
    if (window.SecurityMonitoring) {
        window.SecurityMonitoring.securityEvents = [];
    }
});

afterEach(() => {
    if (window.SecurityMonitoring) {
        const report = window.SecurityMonitoring.getSecurityReport();
        const testName = expect.getState().currentTestName;
        window.SecurityTestResults.securityMetrics[testName] = report;
    }
}); 