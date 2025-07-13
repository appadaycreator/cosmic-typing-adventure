// Language Manager for Cosmic Typing Adventure

class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('cosmicTyping_language') || 'ja';
        this.translations = {};
        this.practiceTexts = {};
        
        this.init();
    }

    async init() {
        await this.loadTranslations();
        await this.loadPracticeTexts();
        this.setupEventListeners();
        this.updateAllTexts();
        console.log('🌍 Language Manager initialized');
    }

    async loadTranslations() {
        try {
            const response = await fetch('data/ui-translations.json');
            this.translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to basic translations
            this.translations = {
                ja: { nav: { game: 'ゲーム', stats: '統計', fleet: '艦隊', settings: '設定' } },
                en: { nav: { game: 'Game', stats: 'Stats', fleet: 'Fleet', settings: 'Settings' } }
            };
        }
    }

    async loadPracticeTexts() {
        try {
            const jaResponse = await fetch('data/practice-texts.json');
            const enResponse = await fetch('data/practice-texts-en.json');
            
            this.practiceTexts = {
                ja: await jaResponse.json(),
                en: await enResponse.json()
            };
        } catch (error) {
            console.error('Failed to load practice texts:', error);
        }
    }

    setupEventListeners() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
            languageSelect.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
        }
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('cosmicTyping_language', lang);
        
        this.updateAllTexts();
        this.updatePracticeTexts();
        
        // Update language select
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = lang;
        }
        
        console.log(`Language switched to: ${lang}`);
    }

    updateAllTexts() {
        // Update navigation
        this.updateElement('nav-game', 'nav.game');
        this.updateElement('nav-stats', 'nav.stats');
        this.updateElement('nav-fleet', 'nav.fleet');
        this.updateElement('nav-settings', 'nav.settings');
        
        // Update mission buttons
        this.updateElement('mission-basic', 'missions.basic');
        this.updateElement('mission-exploration', 'missions.exploration');
        this.updateElement('mission-speed', 'missions.speed');
        this.updateElement('mission-accuracy', 'missions.accuracy');
        
        // Update game elements
        this.updateElement('startBtn', 'game.start');
        this.updateElement('pauseBtn', 'game.pause');
        this.updateElement('resetBtn', 'game.reset');
        
        // Update stats labels
        this.updateElement('bestWPM-label', 'stats.bestWPM');
        this.updateElement('avgWPM-label', 'stats.avgWPM');
        this.updateElement('bestAccuracy-label', 'stats.bestAccuracy');
        this.updateElement('totalTime-label', 'stats.totalTime');
        this.updateElement('totalSessions-label', 'stats.totalSessions');
        this.updateElement('totalPlanets-label', 'stats.totalPlanets');
        this.updateElement('totalXP-label', 'stats.totalXP');
        this.updateElement('currentLevel-label', 'stats.currentLevel');
        this.updateElement('weakKeys-label', 'stats.weakKeys');
        this.updateElement('achievements-label', 'stats.achievements');
        
        // Update fleet elements
        this.updateElement('ships-title', 'fleet.ships');
        this.updateElement('upgrades-title', 'fleet.upgrades');
        this.updateElement('engine-label', 'fleet.engine');
        this.updateElement('fuel-label', 'fleet.fuel');
        this.updateElement('shield-label', 'fleet.shield');
        
        // Update settings elements
        this.updateElement('language-label', 'settings.language');
        this.updateElement('fontSize-label', 'settings.fontSize');
        this.updateElement('soundEffects-label', 'settings.soundEffects');
        this.updateElement('backgroundMusic-label', 'settings.backgroundMusic');
        this.updateElement('autoSave-label', 'settings.autoSave');
        this.updateElement('pilotName-label', 'settings.pilotName');
        this.updateElement('exportData-label', 'settings.exportData');
        this.updateElement('importData-label', 'settings.importData');
        this.updateElement('resetData-label', 'settings.resetData');
    }

    updateElement(elementId, translationKey) {
        const element = document.getElementById(elementId);
        if (element) {
            const translation = this.getTranslation(translationKey);
            if (translation) {
                element.textContent = translation;
            }
        }
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return value;
    }

    updatePracticeTexts() {
        // Update planet names and descriptions
        const planets = this.practiceTexts[this.currentLanguage]?.planets;
        if (planets) {
            Object.keys(planets).forEach(planetKey => {
                const planet = planets[planetKey];
                const planetElement = document.querySelector(`[data-planet="${planetKey}"]`);
                if (planetElement) {
                    const nameElement = planetElement.querySelector('.planet-name');
                    const descElement = planetElement.querySelector('.planet-description');
                    
                    if (nameElement) nameElement.textContent = planet.name;
                    if (descElement) descElement.textContent = planet.description;
                }
            });
        }
    }

    getCurrentPracticeTexts() {
        return this.practiceTexts[this.currentLanguage] || this.practiceTexts.ja;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Helper method for dynamic text updates
    translate(key, fallback = '') {
        const translation = this.getTranslation(key);
        return translation || fallback;
    }
}

// Global language manager instance
window.LanguageManager = LanguageManager; 