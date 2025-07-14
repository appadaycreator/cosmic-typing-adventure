// Language Manager for Cosmic Typing Adventure

class LanguageManager {
    constructor() {
        this.practiceTexts = {};
        this.loadPracticeTexts();
        console.log('🌍 Language Manager initialized (Japanese only)');
    }

    async loadPracticeTexts() {
        try {
            const jaResponse = await fetch('data/practice-texts.json');
            this.practiceTexts = { ja: await jaResponse.json() };
        } catch (error) {
            console.error('Failed to load practice texts:', error);
            this.practiceTexts = { ja: { planets: {} } };
        }
    }

    // 日本語テキスト取得用
    getPracticeText(planetKey, textId = null) {
        const planet = this.practiceTexts.ja?.planets?.[planetKey];
        if (!planet || !planet.texts) return null;
        if (textId) {
            return planet.texts.find(text => text.id === textId);
        } else {
            // ランダム取得
            const randomIndex = Math.floor(Math.random() * planet.texts.length);
            return planet.texts[randomIndex];
        }
    }
}

// グローバル定義
window.LanguageManager = LanguageManager; 