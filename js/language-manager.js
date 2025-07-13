// Language Manager for Cosmic Typing Adventure

class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('cosmicTyping_language') || 'ja';
        this.translations = {};
        this.practiceTexts = {};
        
        this.loadTranslations();
        this.loadPracticeTexts();
        this.setupLanguageSwitcher();
        this.updateAllTexts();
        
        console.log('🌍 Language Manager initialized');
    }

    async loadTranslations() {
        try {
            const response = await fetch('data/ui-translations.json');
            this.translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            this.translations = {
                ja: {},
                en: {}
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
            this.practiceTexts = {
                ja: { planets: {} },
                en: { planets: {} }
            };
        }
    }

    setupLanguageSwitcher() {
        const languageButtons = document.querySelectorAll('[data-language]');
        languageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = button.getAttribute('data-language');
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('cosmicTyping_language', lang);
        
        // Update UI
        this.updateAllTexts();
        this.updatePracticeTexts();
        
        // Update language switcher UI
        this.updateLanguageSwitcherUI();
        
        // Show notification
        this.showLanguageNotification(lang);
        
        console.log(`Language switched to: ${lang}`);
    }

    updateLanguageSwitcherUI() {
        const languageButtons = document.querySelectorAll('[data-language]');
        languageButtons.forEach(button => {
            const lang = button.getAttribute('data-language');
            if (lang === this.currentLanguage) {
                button.classList.add('bg-blue-600', 'text-white');
                button.classList.remove('bg-gray-600', 'text-gray-300');
            } else {
                button.classList.remove('bg-blue-600', 'text-white');
                button.classList.add('bg-gray-600', 'text-gray-300');
            }
        });
    }

    updateElement(elementId, translationKey) {
        const element = document.getElementById(elementId);
        if (element && this.translations[this.currentLanguage]) {
            const keys = translationKey.split('.');
            let value = this.translations[this.currentLanguage];
            
            for (const key of keys) {
                if (value && value[key]) {
                    value = value[key];
                } else {
                    return; // Translation not found
                }
            }
            
            if (typeof value === 'string') {
                element.textContent = value;
            }
        }
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
        
        // Update achievement elements
        this.updateElement('achievement-progress-label', 'achievements.progress');
        this.updateElement('achievement-firstTyping', 'achievements.firstTyping');
        this.updateElement('achievement-speedPilot', 'achievements.speedPilot');
        this.updateElement('achievement-accuracyMaster', 'achievements.accuracyMaster');
        this.updateElement('achievement-planetExplorer', 'achievements.planetExplorer');
        this.updateElement('achievement-marathonRunner', 'achievements.marathonRunner');
        this.updateElement('achievement-comboMaster', 'achievements.comboMaster');
        this.updateElement('achievement-levelUp', 'achievements.levelUp');
        this.updateElement('achievement-veteran', 'achievements.veteran');
        this.updateElement('achievement-speedDemon', 'achievements.speedDemon');
        this.updateElement('achievement-perfectionist', 'achievements.perfectionist');
        
        // Update notification elements
        this.updateElement('notification-levelUp', 'notifications.levelUp');
        this.updateElement('notification-planetDiscovered', 'notifications.planetDiscovered');
        this.updateElement('notification-achievementUnlocked', 'notifications.achievementUnlocked');
        this.updateElement('notification-dataSaved', 'notifications.dataSaved');
        this.updateElement('notification-dataExported', 'notifications.dataExported');
        this.updateElement('notification-dataImported', 'notifications.dataImported');
    }

    updatePracticeTexts() {
        // Update planet names and descriptions
        const planets = this.practiceTexts[this.currentLanguage]?.planets || {};
        
        Object.keys(planets).forEach(planetKey => {
            const planet = planets[planetKey];
            const planetElement = document.querySelector(`[data-planet="${planetKey}"]`);
            
            if (planetElement) {
                // Update planet name
                const nameElement = planetElement.querySelector('.planet-name');
                if (nameElement && planet.name) {
                    nameElement.textContent = planet.name;
                }
                
                // Update planet description
                const descElement = planetElement.querySelector('.planet-description');
                if (descElement && planet.description) {
                    descElement.textContent = planet.description;
                }
            }
        });
    }

    getPracticeText(planetKey, textId = null) {
        const planet = this.practiceTexts[this.currentLanguage]?.planets?.[planetKey];
        if (!planet || !planet.texts) return null;
        
        if (textId) {
            return planet.texts.find(text => text.id === textId);
        } else {
            // Return random text from this planet
            const randomIndex = Math.floor(Math.random() * planet.texts.length);
            return planet.texts[randomIndex];
        }
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        return value || key;
    }

    showLanguageNotification(lang) {
        const langNames = {
            ja: '日本語',
            en: 'English'
        };
        
        const notification = document.createElement('div');
        notification.className = 'language-notification fixed top-4 right-4 p-4 rounded-lg z-50 bg-blue-600 text-white transform translate-x-full transition-transform duration-500';
        notification.textContent = `${langNames[lang]}に切り替えました`;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 2000);
    }

    // Get all available languages
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    // Check if translation exists
    hasTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return false;
            }
        }
        
        return typeof value === 'string';
    }
}

// Global language manager instance
window.LanguageManager = LanguageManager; 

// 言語切り替えボタンの状態を更新する関数
window.updateLanguageButtons = function() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const currentLang = (window.languageManager && window.languageManager.getCurrentLanguage) ? window.languageManager.getCurrentLanguage() : (window.currentLanguage || 'ja');
        langToggle.textContent = (currentLang === 'ja') ? 'EN' : '日本語';
        langToggle.classList.toggle('active', currentLang === 'ja');
    }
    // 他の言語ボタンがあれば同様に更新
}; 