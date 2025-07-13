// Typing Engine for Cosmic Typing Adventure - Optimized Version

class TypingEngine {
    constructor() {
        this.currentText = '';
        this.typedText = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isActive = false;
        this.errors = new Map(); // Use Map for better performance
        this.totalTyped = 0;
        this.totalErrors = 0;
        this.wpm = 0;
        this.accuracy = 100;
        
        // DOM elements cache
        this.elements = {
            textDisplay: null,
            typingInput: null,
            wpmDisplay: null,
            accuracyDisplay: null,
            timerDisplay: null,
            progressBar: null
        };
        
        // Callbacks
        this.callbacks = {
            onProgress: null,
            onComplete: null,
            onError: null
        };
        
        // Performance optimization
        this.wpmTimer = null;
        this.lastWpmUpdate = 0;
        this.updateThrottle = 100; // ms
        this.lastUpdate = 0;
        
        // Debounced update function
        this.debouncedUpdate = this.debounce(this.updateDisplays.bind(this), 50);
    }
    
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Initialize the typing engine
    init(elements) {
        this.elements = { ...this.elements, ...elements };
        this.setupEventListeners();
    }
    
    // Setup event listeners with performance optimization
    setupEventListeners() {
        if (!this.elements.typingInput) return;
        
        // Use passive listeners where possible
        this.elements.typingInput.addEventListener('input', this.handleInput.bind(this), { passive: true });
        this.elements.typingInput.addEventListener('keydown', this.handleKeydown.bind(this));
        this.elements.typingInput.addEventListener('focus', this.handleFocus.bind(this));
        this.elements.typingInput.addEventListener('blur', this.handleBlur.bind(this));
    }
    
    // Start typing session
    start() {
        if (!this.elements.textDisplay || !this.elements.textDisplay.textContent) {
            console.warn('No text to type');
            return;
        }
        
        this.currentText = this.elements.textDisplay.textContent;
        this.typedText = '';
        this.currentIndex = 0;
        this.errors.clear(); // Clear Map instead of array
        this.totalTyped = 0;
        this.totalErrors = 0;
        this.wpm = 0;
        this.accuracy = 100;
        this.isActive = true;
        this.startTime = Date.now();
        this.lastWpmUpdate = this.startTime;
        
        this.displayText();
        this.updateProgress();
        this.startWpmTimer();
        
        if (this.elements.typingInput) {
            this.elements.typingInput.disabled = false;
            this.elements.typingInput.focus();
        }
    }
    
    // Stop typing session
    stop() {
        this.isActive = false;
        this.endTime = Date.now();
        
        if (this.wpmTimer) {
            clearInterval(this.wpmTimer);
            this.wpmTimer = null;
        }
        
        if (this.elements.typingInput) {
            this.elements.typingInput.disabled = true;
        }
        
        this.calculateFinalStats();
    }
    
    // Reset typing session
    reset() {
        this.stop();
        this.currentText = '';
        this.typedText = '';
        this.currentIndex = 0;
        this.errors.clear();
        this.totalTyped = 0;
        this.totalErrors = 0;
        this.wpm = 0;
        this.accuracy = 100;
        
        this.displayText();
        this.updateProgress();
        this.updateDisplays();
        
        if (this.elements.typingInput) {
            this.elements.typingInput.value = '';
        }
    }
    
    // Handle input events with performance optimization
    handleInput(event) {
        if (!this.isActive) return;
        
        const input = event.target.value;
        const expectedChar = this.currentText[this.currentIndex];
        
        if (input.length > this.typedText.length) {
            // New character typed
            const newChar = input[input.length - 1];
            
            if (newChar === expectedChar) {
                // Correct character
                this.typedText += newChar;
                this.currentIndex++;
                this.totalTyped++;
                
                // Remove error if it was previously marked
                this.removeError(this.currentIndex - 1);
            } else {
                // Incorrect character
                this.addError(this.currentIndex, expectedChar, newChar);
                this.totalErrors++;
                
                // Still advance to prevent getting stuck
                this.currentIndex++;
                this.typedText += newChar;
                this.totalTyped++;
            }
            
            this.updateProgress();
            this.debouncedUpdate(); // Use debounced update
            
            // Check if typing is complete
            if (this.currentIndex >= this.currentText.length) {
                this.complete();
            }
        } else if (input.length < this.typedText.length) {
            // Character deleted (backspace)
            this.handleBackspace(input.length);
        }
    }
    
    // Handle keydown events
    handleKeydown(event) {
        if (!this.isActive) return;
        
        // Prevent default behavior for certain keys
        if (event.key === 'Tab') {
            event.preventDefault();
        }
        
        // Handle special keys
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.reset();
                break;
            case 'F5':
                event.preventDefault();
                break;
        }
    }
    
    // Handle focus events
    handleFocus() {
        if (this.isActive && !this.startTime) {
            this.startTime = Date.now();
            this.lastWpmUpdate = this.startTime;
            this.startWpmTimer();
        }
    }
    
    // Handle blur events
    handleBlur() {
        // Optional: pause timer when input loses focus
    }
    
    // Handle backspace with optimization
    handleBackspace(newLength) {
        const deletedChars = this.typedText.length - newLength;
        this.typedText = this.typedText.slice(0, newLength);
        this.currentIndex = Math.max(0, this.currentIndex - deletedChars);
        
        // Recalculate errors after backspace
        this.recalculateErrors();
        this.updateProgress();
        this.debouncedUpdate();
    }
    
    // Add error with Map optimization
    addError(index, expected, actual) {
        this.errors.set(index, { expected, actual });
    }
    
    // Remove error with Map optimization
    removeError(index) {
        this.errors.delete(index);
    }
    
    // Recalculate errors after backspace
    recalculateErrors() {
        this.errors.clear();
        this.totalErrors = 0;
        
        for (let i = 0; i < this.typedText.length; i++) {
            if (this.typedText[i] !== this.currentText[i]) {
                this.addError(i, this.currentText[i], this.typedText[i]);
                this.totalErrors++;
            }
        }
    }
    
    // Display text with performance optimization
    displayText() {
        if (!this.elements.textDisplay) return;
        
        const text = this.currentText;
        let html = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const isTyped = i < this.typedText.length;
            const isCorrect = isTyped && this.typedText[i] === char;
            const hasError = this.errors.has(i);
            
            let className = '';
            if (isTyped) {
                className = isCorrect ? 'correct' : 'incorrect';
            } else if (i === this.currentIndex) {
                className = 'current';
            }
            
            if (className) {
                html += `<span class="${className}">${this.escapeHtml(char)}</span>`;
            } else {
                html += this.escapeHtml(char);
            }
        }
        
        this.elements.textDisplay.innerHTML = html;
    }
    
    // Escape HTML for security
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Update progress with throttling
    updateProgress() {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateThrottle) return;
        
        this.lastUpdate = now;
        this.displayText();
        
        if (this.elements.progressBar) {
            const progress = (this.currentIndex / this.currentText.length) * 100;
            this.elements.progressBar.style.width = `${progress}%`;
        }
    }
    
    // Update displays with throttling
    updateDisplays() {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateThrottle) return;
        
        this.lastUpdate = now;
        this.updateWpmDisplay();
        this.updateAccuracyDisplay();
        this.updateTimerDisplay();
        
        // Call progress callback
        if (this.callbacks.onProgress) {
            this.callbacks.onProgress(this.getStats());
        }
    }
    
    // Update WPM display
    updateWpmDisplay() {
        if (this.elements.wpmDisplay) {
            this.elements.wpmDisplay.textContent = this.wpm.toFixed(1);
        }
    }
    
    // Update accuracy display
    updateAccuracyDisplay() {
        if (this.elements.accuracyDisplay) {
            this.elements.accuracyDisplay.textContent = this.accuracy.toFixed(1);
        }
    }
    
    // Update timer display
    updateTimerDisplay() {
        if (this.elements.timerDisplay && this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.elements.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Start WPM timer with optimization
    startWpmTimer() {
        if (this.wpmTimer) {
            clearInterval(this.wpmTimer);
        }
        
        this.wpmTimer = setInterval(() => {
            this.calculateWpm();
            this.calculateAccuracy();
        }, 1000); // Update every second instead of more frequently
    }
    
    // Calculate WPM with optimization
    calculateWpm() {
        if (!this.startTime) return;
        
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        if (elapsedMinutes > 0) {
            // Calculate words (5 characters = 1 word)
            const words = this.totalTyped / 5;
            this.wpm = words / elapsedMinutes;
        }
    }
    
    // Calculate accuracy with optimization
    calculateAccuracy() {
        if (this.totalTyped > 0) {
            this.accuracy = ((this.totalTyped - this.totalErrors) / this.totalTyped) * 100;
        }
    }
    
    // Calculate final stats
    calculateFinalStats() {
        this.calculateWpm();
        this.calculateAccuracy();
    }
    
    // Complete typing session
    complete() {
        this.stop();
        
        if (this.callbacks.onComplete) {
            this.callbacks.onComplete(this.getResults());
        }
    }
    
    // Get current stats
    getStats() {
        return {
            wpm: this.wpm,
            accuracy: this.accuracy,
            totalTyped: this.totalTyped,
            totalErrors: this.totalErrors,
            elapsedTime: this.elements.timerDisplay ? this.elements.timerDisplay.textContent : '00:00',
            progress: (this.currentIndex / this.currentText.length) * 100
        };
    }
    
    // Get final results
    getResults() {
        return {
            wpm: this.wpm,
            accuracy: this.accuracy,
            totalTyped: this.totalTyped,
            totalErrors: this.totalErrors,
            duration: this.endTime ? (this.endTime - this.startTime) / 1000 : 0,
            cpm: this.getCpm(),
            errorRate: this.getErrorRate()
        };
    }
    
    // Set callbacks
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
    
    // Pause typing session
    pause() {
        if (this.isActive) {
            this.isActive = false;
            if (this.wpmTimer) {
                clearInterval(this.wpmTimer);
                this.wpmTimer = null;
            }
        }
    }
    
    // Resume typing session
    resume() {
        if (!this.isActive && this.startTime) {
            this.isActive = true;
            this.startWpmTimer();
        }
    }
    
    // Check if typing is complete
    isComplete() {
        return this.currentIndex >= this.currentText.length;
    }
    
    // Get CPM (Characters Per Minute)
    getCpm() {
        if (!this.startTime) return 0;
        
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        return elapsedMinutes > 0 ? this.totalTyped / elapsedMinutes : 0;
    }
    
    // Get error rate
    getErrorRate() {
        return this.totalTyped > 0 ? (this.totalErrors / this.totalTyped) * 100 : 0;
    }
    
    // Get detailed error analysis
    getErrorAnalysis() {
        const errorTypes = new Map();
        
        this.errors.forEach((error, index) => {
            const key = `${error.expected}->${error.actual}`;
            errorTypes.set(key, (errorTypes.get(key) || 0) + 1);
        });
        
        return {
            totalErrors: this.totalErrors,
            errorRate: this.getErrorRate(),
            commonErrors: Array.from(errorTypes.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    }
}

// Utility class for text processing
class TypingTextUtils {
    // Calculate text difficulty
    static calculateDifficulty(text) {
        const words = text.split(/\s+/).length;
        const characters = text.length;
        const uniqueChars = new Set(text).size;
        
        // Simple difficulty calculation
        const avgWordLength = characters / words;
        const complexity = uniqueChars / characters;
        
        if (avgWordLength > 8 || complexity > 0.8) return 'hard';
        if (avgWordLength > 5 || complexity > 0.6) return 'medium';
        return 'easy';
    }
    
    // Get text statistics
    static getTextStats(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const characters = text.length;
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        
        return {
            wordCount: words.length,
            characterCount: characters,
            sentenceCount: sentences.length,
            avgWordLength: words.length > 0 ? characters / words.length : 0,
            difficulty: this.calculateDifficulty(text)
        };
    }
    
    // Clean text for typing
    static cleanText(text) {
        return text.trim().replace(/\s+/g, ' ');
    }
    
    // Split text into words
    static splitIntoWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0);
    }
    
    // Get word at position
    static getWordAtPosition(text, position) {
        const words = this.splitIntoWords(text);
        let charCount = 0;
        
        for (let i = 0; i < words.length; i++) {
            charCount += words[i].length + 1; // +1 for space
            if (charCount > position) {
                return words[i];
            }
        }
        
        return '';
    }
}

// Export for global access
window.TypingEngine = TypingEngine;
window.TypingTextUtils = TypingTextUtils; 