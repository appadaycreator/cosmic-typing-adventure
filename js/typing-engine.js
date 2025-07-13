// Typing Engine for Cosmic Typing Adventure

class TypingEngine {
    constructor() {
        this.currentText = '';
        this.typedText = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isActive = false;
        this.errors = [];
        this.totalTyped = 0;
        this.totalErrors = 0;
        this.wpm = 0;
        this.accuracy = 100;
        
        // DOM elements
        this.textDisplay = null;
        this.typingInput = null;
        this.wpmDisplay = null;
        this.accuracyDisplay = null;
        this.timerDisplay = null;
        this.progressBar = null;
        
        // Event listeners
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
        
        // Timer for WPM calculation
        this.wpmTimer = null;
        this.lastWpmUpdate = 0;
    }
    
    // Initialize the typing engine
    init(elements) {
        this.textDisplay = elements.textDisplay;
        this.typingInput = elements.typingInput;
        this.wpmDisplay = elements.wpmDisplay;
        this.accuracyDisplay = elements.accuracyDisplay;
        this.timerDisplay = elements.timerDisplay;
        this.progressBar = elements.progressBar;
        
        this.setupEventListeners();
    }
    
    // Setup event listeners
    setupEventListeners() {
        if (this.typingInput) {
            this.typingInput.addEventListener('input', this.handleInput.bind(this));
            this.typingInput.addEventListener('keydown', this.handleKeydown.bind(this));
            this.typingInput.addEventListener('focus', this.handleFocus.bind(this));
            this.typingInput.addEventListener('blur', this.handleBlur.bind(this));
        }
    }
    
    // Start typing session
    start(text) {
        this.currentText = text;
        this.typedText = '';
        this.currentIndex = 0;
        this.errors = [];
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
        
        if (this.typingInput) {
            this.typingInput.disabled = false;
            this.typingInput.focus();
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
        
        if (this.typingInput) {
            this.typingInput.disabled = true;
        }
        
        this.calculateFinalStats();
    }
    
    // Reset typing session
    reset() {
        this.stop();
        this.currentText = '';
        this.typedText = '';
        this.currentIndex = 0;
        this.errors = [];
        this.totalTyped = 0;
        this.totalErrors = 0;
        this.wpm = 0;
        this.accuracy = 100;
        
        this.displayText();
        this.updateProgress();
        this.updateDisplays();
        
        if (this.typingInput) {
            this.typingInput.value = '';
        }
    }
    
    // Handle input events
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
            this.updateDisplays();
            
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
    
    // Handle backspace
    handleBackspace(newLength) {
        const deletedChars = this.typedText.length - newLength;
        this.typedText = this.typedText.slice(0, newLength);
        this.currentIndex = Math.max(0, this.currentIndex - deletedChars);
        
        // Recalculate errors
        this.recalculateErrors();
        this.updateProgress();
        this.updateDisplays();
    }
    
    // Add error
    addError(index, expected, actual) {
        this.errors.push({
            index: index,
            expected: expected,
            actual: actual
        });
    }
    
    // Remove error
    removeError(index) {
        this.errors = this.errors.filter(error => error.index !== index);
    }
    
    // Recalculate errors after backspace
    recalculateErrors() {
        this.errors = [];
        this.totalErrors = 0;
        
        for (let i = 0; i < this.typedText.length; i++) {
            if (this.typedText[i] !== this.currentText[i]) {
                this.addError(i, this.currentText[i], this.typedText[i]);
                this.totalErrors++;
            }
        }
    }
    
    // Display text with highlighting
    displayText() {
        if (!this.textDisplay) return;
        
        let html = '';
        
        for (let i = 0; i < this.currentText.length; i++) {
            let charClass = '';
            
            if (i < this.typedText.length) {
                // Already typed
                const isError = this.errors.some(error => error.index === i);
                charClass = isError ? 'incorrect' : 'correct';
            } else if (i === this.typedText.length) {
                // Current position
                charClass = 'current';
            }
            
            const char = this.currentText[i];
            const escapedChar = this.escapeHtml(char);
            
            if (charClass) {
                html += `<span class="${charClass}">${escapedChar}</span>`;
            } else {
                html += escapedChar;
            }
        }
        
        this.textDisplay.innerHTML = html;
    }
    
    // Escape HTML characters
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Update progress bar
    updateProgress() {
        if (!this.progressBar) return;
        
        const progress = (this.currentIndex / this.currentText.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }
    
    // Update all displays
    updateDisplays() {
        this.updateWpmDisplay();
        this.updateAccuracyDisplay();
        this.updateTimerDisplay();
        this.displayText();
        
        if (this.onProgress) {
            this.onProgress({
                wpm: this.wpm,
                accuracy: this.accuracy,
                progress: (this.currentIndex / this.currentText.length) * 100,
                totalTyped: this.totalTyped,
                totalErrors: this.totalErrors
            });
        }
    }
    
    // Update WPM display
    updateWpmDisplay() {
        if (!this.wpmDisplay) return;
        
        this.wpmDisplay.textContent = `${Math.round(this.wpm)} WPM`;
    }
    
    // Update accuracy display
    updateAccuracyDisplay() {
        if (!this.accuracyDisplay) return;
        
        this.accuracyDisplay.textContent = `${Math.round(this.accuracy)}%`;
    }
    
    // Update timer display
    updateTimerDisplay() {
        if (!this.timerDisplay || !this.startTime) return;
        
        const elapsed = this.isActive ? Date.now() - this.startTime : this.endTime - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Start WPM timer
    startWpmTimer() {
        this.wpmTimer = setInterval(() => {
            this.calculateWpm();
        }, 1000); // Update every second
    }
    
    // Calculate WPM
    calculateWpm() {
        if (!this.startTime || this.currentIndex === 0) return;
        
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        const wordsTyped = this.currentIndex / 5; // Standard: 5 characters = 1 word
        
        this.wpm = wordsTyped / elapsedMinutes;
        this.updateWpmDisplay();
    }
    
    // Calculate accuracy
    calculateAccuracy() {
        if (this.totalTyped === 0) {
            this.accuracy = 100;
        } else {
            this.accuracy = ((this.totalTyped - this.totalErrors) / this.totalTyped) * 100;
        }
    }
    
    // Calculate final statistics
    calculateFinalStats() {
        this.calculateWpm();
        this.calculateAccuracy();
        this.updateDisplays();
    }
    
    // Complete typing session
    complete() {
        this.stop();
        
        if (this.onComplete) {
            this.onComplete({
                wpm: this.wpm,
                accuracy: this.accuracy,
                totalTyped: this.totalTyped,
                totalErrors: this.totalErrors,
                duration: this.endTime - this.startTime,
                errors: this.errors
            });
        }
    }
    
    // Get current statistics
    getStats() {
        return {
            wpm: this.wpm,
            accuracy: this.accuracy,
            totalTyped: this.totalTyped,
            totalErrors: this.totalErrors,
            progress: (this.currentIndex / this.currentText.length) * 100,
            duration: this.isActive ? Date.now() - this.startTime : this.endTime - this.startTime
        };
    }
    
    // Set callbacks
    setCallbacks(callbacks) {
        this.onProgress = callbacks.onProgress;
        this.onComplete = callbacks.onComplete;
        this.onError = callbacks.onError;
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
    
    // Get typing speed in characters per minute
    getCpm() {
        if (!this.startTime || this.currentIndex === 0) return 0;
        
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        return this.currentIndex / elapsedMinutes;
    }
    
    // Get error rate
    getErrorRate() {
        if (this.totalTyped === 0) return 0;
        return (this.totalErrors / this.totalTyped) * 100;
    }
    
    // Get detailed error analysis
    getErrorAnalysis() {
        const analysis = {
            totalErrors: this.totalErrors,
            errorRate: this.getErrorRate(),
            commonErrors: {},
            errorPositions: []
        };
        
        // Analyze common errors
        this.errors.forEach(error => {
            const key = `${error.expected}->${error.actual}`;
            analysis.commonErrors[key] = (analysis.commonErrors[key] || 0) + 1;
            analysis.errorPositions.push(error.index);
        });
        
        return analysis;
    }
}

// Typing text utilities
class TypingTextUtils {
    // Calculate text difficulty
    static calculateDifficulty(text) {
        const words = text.split(/\s+/).length;
        const characters = text.length;
        const avgWordLength = characters / words;
        
        // Simple difficulty calculation
        let difficulty = 1; // Easy
        
        if (avgWordLength > 6 || words > 50) {
            difficulty = 3; // Hard
        } else if (avgWordLength > 4 || words > 25) {
            difficulty = 2; // Medium
        }
        
        return difficulty;
    }
    
    // Get text statistics
    static getTextStats(text) {
        const words = text.split(/\s+/).length;
        const characters = text.length;
        const sentences = text.split(/[.!?]+/).length;
        const paragraphs = text.split(/\n\s*\n/).length;
        
        return {
            words,
            characters,
            sentences,
            paragraphs,
            avgWordLength: characters / words,
            avgSentenceLength: words / sentences
        };
    }
    
    // Clean text for typing
    static cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .trim();
    }
    
    // Split text into words
    static splitIntoWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0);
    }
    
    // Get word at position
    static getWordAtPosition(text, position) {
        const words = this.splitIntoWords(text);
        let currentPos = 0;
        
        for (let i = 0; i < words.length; i++) {
            const wordLength = words[i].length;
            if (position >= currentPos && position < currentPos + wordLength) {
                return {
                    word: words[i],
                    index: i,
                    start: currentPos,
                    end: currentPos + wordLength
                };
            }
            currentPos += wordLength + 1; // +1 for space
        }
        
        return null;
    }
}

// Export for use in other modules
window.TypingEngine = TypingEngine;
window.TypingTextUtils = TypingTextUtils; 