// Text Manager Tests
// Version: 2.0.0

import { TextManager } from '../js/text-manager.js';

export const textManagerTests = {
  name: 'Text Manager Tests',
  tests: []
};

// Test 1: TextManager initialization
textManagerTests.tests.push({
  name: 'TextManager should initialize successfully',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    if (textManager.texts.length === 0) {
      throw new Error('No texts loaded');
    }
    
    if (textManager.texts.length < 200) {
      throw new Error(`Expected at least 200 texts, got ${textManager.texts.length}`);
    }
    
    return true;
  }
});

// Test 2: Get texts by category
textManagerTests.tests.push({
  name: 'Should filter texts by category',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const dailyTexts = textManager.getTextsByCategory('daily');
    const businessTexts = textManager.getTextsByCategory('business');
    const programmingTexts = textManager.getTextsByCategory('programming');
    const literatureTexts = textManager.getTextsByCategory('literature');
    
    if (dailyTexts.length < 50) {
      throw new Error(`Expected at least 50 daily texts, got ${dailyTexts.length}`);
    }
    
    if (businessTexts.length < 50) {
      throw new Error(`Expected at least 50 business texts, got ${businessTexts.length}`);
    }
    
    if (programmingTexts.length < 50) {
      throw new Error(`Expected at least 50 programming texts, got ${programmingTexts.length}`);
    }
    
    if (literatureTexts.length < 50) {
      throw new Error(`Expected at least 50 literature texts, got ${literatureTexts.length}`);
    }
    
    return true;
  }
});

// Test 3: Get texts by difficulty
textManagerTests.tests.push({
  name: 'Should filter texts by difficulty',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const level1 = textManager.getTextsByDifficulty(1);
    const level2 = textManager.getTextsByDifficulty(2);
    const level3 = textManager.getTextsByDifficulty(3);
    
    if (level1.length === 0) {
      throw new Error('No level 1 texts found');
    }
    
    if (level2.length === 0) {
      throw new Error('No level 2 texts found');
    }
    
    if (level3.length === 0) {
      throw new Error('No level 3 texts found');
    }
    
    // Verify all texts have correct difficulty
    const wrongDifficulty = level1.filter(t => t.difficulty !== 1);
    if (wrongDifficulty.length > 0) {
      throw new Error('Found texts with wrong difficulty in level 1');
    }
    
    return true;
  }
});

// Test 4: Get random text
textManagerTests.tests.push({
  name: 'Should get random text',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const randomText = textManager.getRandomText();
    
    if (!randomText) {
      throw new Error('Failed to get random text');
    }
    
    if (!randomText.content) {
      throw new Error('Random text missing content');
    }
    
    if (!randomText.title) {
      throw new Error('Random text missing title');
    }
    
    return true;
  }
});

// Test 5: Get random text with filters
textManagerTests.tests.push({
  name: 'Should get random text with filters',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const filters = { category: 'daily', difficulty: 1 };
    const randomText = textManager.getRandomText(filters);
    
    if (!randomText) {
      throw new Error('Failed to get filtered random text');
    }
    
    if (randomText.category !== 'daily') {
      throw new Error('Random text does not match category filter');
    }
    
    if (randomText.difficulty !== 1) {
      throw new Error('Random text does not match difficulty filter');
    }
    
    return true;
  }
});

// Test 6: Toggle favorite
textManagerTests.tests.push({
  name: 'Should toggle favorite status',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const text = textManager.texts[0];
    const textId = text.id || text.text_id;
    
    const initialStatus = text.is_favorite || false;
    
    await textManager.toggleFavorite(textId);
    const afterToggle = text.is_favorite;
    
    if (afterToggle === initialStatus) {
      throw new Error('Favorite status did not toggle');
    }
    
    return true;
  }
});

// Test 7: Calculate text metadata
textManagerTests.tests.push({
  name: 'Should calculate text metadata correctly',
  async run() {
    const textManager = new TextManager();
    
    const testText = 'これはテストです。This is a test.';
    const metadata = textManager.calculateTextMetadata(testText);
    
    if (!metadata.charCount) {
      throw new Error('Character count not calculated');
    }
    
    if (!metadata.wordCount) {
      throw new Error('Word count not calculated');
    }
    
    if (metadata.charCount !== testText.length) {
      throw new Error(`Expected char count ${testText.length}, got ${metadata.charCount}`);
    }
    
    return true;
  }
});

// Test 8: Get favorite texts
textManagerTests.tests.push({
  name: 'Should get favorite texts',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    // Mark some texts as favorite
    const firstText = textManager.texts[0];
    const secondText = textManager.texts[1];
    
    firstText.is_favorite = true;
    secondText.is_favorite = true;
    
    const favorites = textManager.getFavoriteTexts();
    
    if (favorites.length < 2) {
      throw new Error('Failed to get favorite texts');
    }
    
    const allFavorites = favorites.every(t => t.is_favorite === true);
    if (!allFavorites) {
      throw new Error('Non-favorite texts in favorite list');
    }
    
    return true;
  }
});

// Test 9: Get statistics
textManagerTests.tests.push({
  name: 'Should get text statistics',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const stats = textManager.getStatistics();
    
    if (!stats.total) {
      throw new Error('Total count missing in statistics');
    }
    
    if (!stats.byCategory || stats.byCategory.length === 0) {
      throw new Error('Category statistics missing');
    }
    
    if (!stats.byDifficulty || stats.byDifficulty.length === 0) {
      throw new Error('Difficulty statistics missing');
    }
    
    if (stats.total < 200) {
      throw new Error(`Expected at least 200 total texts, got ${stats.total}`);
    }
    
    return true;
  }
});

// Test 10: Upload custom text
textManagerTests.tests.push({
  name: 'Should upload custom text',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const customText = {
      title: 'テストカスタムテキスト',
      content: 'これはテスト用のカスタムテキストです。',
      category: 'daily',
      difficulty: 1
    };
    
    const uploaded = await textManager.uploadCustomText(customText);
    
    if (!uploaded) {
      throw new Error('Failed to upload custom text');
    }
    
    if (uploaded.title !== customText.title) {
      throw new Error('Custom text title mismatch');
    }
    
    if (uploaded.content !== customText.content) {
      throw new Error('Custom text content mismatch');
    }
    
    if (!uploaded.word_count) {
      throw new Error('Word count not calculated for custom text');
    }
    
    if (!uploaded.char_count) {
      throw new Error('Char count not calculated for custom text');
    }
    
    return true;
  }
});

// Test 11: Validate all texts have required fields
textManagerTests.tests.push({
  name: 'All texts should have required fields',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const requiredFields = ['title', 'content', 'category', 'difficulty'];
    
    for (const text of textManager.texts) {
      for (const field of requiredFields) {
        if (!text[field]) {
          throw new Error(`Text missing required field: ${field} (ID: ${text.id || text.text_id})`);
        }
      }
    }
    
    return true;
  }
});

// Test 12: Validate text categories
textManagerTests.tests.push({
  name: 'All texts should have valid categories',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const validCategories = ['daily', 'business', 'programming', 'literature'];
    
    for (const text of textManager.texts) {
      if (!validCategories.includes(text.category)) {
        throw new Error(`Invalid category: ${text.category} (ID: ${text.id || text.text_id})`);
      }
    }
    
    return true;
  }
});

// Test 13: Validate text difficulties
textManagerTests.tests.push({
  name: 'All texts should have valid difficulties',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const validDifficulties = [1, 2, 3];
    
    for (const text of textManager.texts) {
      if (!validDifficulties.includes(text.difficulty)) {
        throw new Error(`Invalid difficulty: ${text.difficulty} (ID: ${text.id || text.text_id})`);
      }
    }
    
    return true;
  }
});

// Test 14: Get recommended texts (local fallback)
textManagerTests.tests.push({
  name: 'Should get recommended texts',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const recommended = textManager.getLocalRecommendedTexts(10);
    
    if (recommended.length !== 10) {
      throw new Error(`Expected 10 recommended texts, got ${recommended.length}`);
    }
    
    return true;
  }
});

// Test 15: Category distribution
textManagerTests.tests.push({
  name: 'Categories should have balanced distribution',
  async run() {
    const textManager = new TextManager();
    await textManager.init();
    
    const categories = textManager.getCategories();
    const minTextsPerCategory = 40; // At least 40 texts per category
    
    for (const category of categories) {
      const categoryTexts = textManager.getTextsByCategory(category.id);
      if (categoryTexts.length < minTextsPerCategory) {
        throw new Error(`Category ${category.name} has only ${categoryTexts.length} texts, expected at least ${minTextsPerCategory}`);
      }
    }
    
    return true;
  }
});
