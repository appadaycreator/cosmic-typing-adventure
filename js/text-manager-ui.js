// Text Manager UI Component
// Manages the UI for text filtering, favorites, and custom text upload
// Version: 2.0.0

import { logger } from './logger.js';
import { errorHandler } from './error-handler.js';
import { DOMUtils } from './dom-utils.js';
import { getTextManager } from './text-manager.js';

export class TextManagerUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with ID "${containerId}" not found`);
    }
    this.textManager = getTextManager();
    this.currentFilters = {
      category: null,
      difficulty: null,
      favorite: false
    };
  }

  /**
   * Initialize UI
   */
  async init() {
    try {
      await this.textManager.init();
      this.textManager.loadFavoritesFromLocalStorage();
      this.textManager.loadCustomTextsFromLocalStorage();
      this.render();
      this.attachEventListeners();
      logger.info('TextManagerUI initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize TextManagerUI:', error);
      errorHandler.handleError(error, {
        userMessage: 'テキスト管理UIの初期化に失敗しました。',
        showNotification: true
      });
    }
  }

  /**
   * Render UI
   */
  render() {
    this.container.innerHTML = `
      <div class="text-manager-ui">
        <!-- Header -->
        <div class="text-manager-header">
          <h2>📚 練習テキスト管理</h2>
          <button id="add-custom-text-btn" class="btn btn-primary">
            <i class="fas fa-plus"></i> カスタムテキスト追加
          </button>
        </div>

        <!-- Filters -->
        <div class="text-filters">
          <div class="filter-group">
            <label for="category-filter">カテゴリ:</label>
            <select id="category-filter" class="filter-select">
              <option value="">すべて</option>
              ${this.renderCategoryOptions()}
            </select>
          </div>

          <div class="filter-group">
            <label for="difficulty-filter">難易度:</label>
            <select id="difficulty-filter" class="filter-select">
              <option value="">すべて</option>
              ${this.renderDifficultyOptions()}
            </select>
          </div>

          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" id="favorite-filter" />
              <span>お気に入りのみ</span>
            </label>
          </div>

          <button id="reset-filters-btn" class="btn btn-secondary">
            <i class="fas fa-redo"></i> リセット
          </button>
        </div>

        <!-- Statistics -->
        <div class="text-statistics">
          ${this.renderStatistics()}
        </div>

        <!-- Text List -->
        <div class="text-list" id="text-list">
          ${this.renderTextList()}
        </div>

        <!-- Custom Text Modal -->
        <div id="custom-text-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h3>カスタムテキスト追加</h3>
              <button class="modal-close" id="close-modal-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-tabs">
                <button class="tab-btn active" data-tab="manual">手動入力</button>
                <button class="tab-btn" data-tab="file">ファイルアップロード</button>
                <button class="tab-btn" data-tab="url">URL読み込み</button>
              </div>

              <!-- Manual Input Tab -->
              <div class="tab-content active" id="manual-tab">
                <div class="form-group">
                  <label for="text-title">タイトル <span class="required">*</span></label>
                  <input type="text" id="text-title" class="form-input" placeholder="テキストのタイトル" required />
                </div>

                <div class="form-group">
                  <label for="text-content">内容 <span class="required">*</span></label>
                  <textarea id="text-content" class="form-textarea" rows="6" placeholder="練習用のテキストを入力してください" required></textarea>
                  <div class="char-count">
                    <span id="char-count">0</span> / 1000 文字
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="text-category">カテゴリ</label>
                    <select id="text-category" class="form-select">
                      <option value="">選択してください</option>
                      ${this.renderCategoryOptions()}
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="text-difficulty">難易度</label>
                    <select id="text-difficulty" class="form-select">
                      <option value="">自動判定</option>
                      ${this.renderDifficultyOptions()}
                    </select>
                  </div>
                </div>
              </div>

              <!-- File Upload Tab -->
              <div class="tab-content" id="file-tab">
                <div class="form-group">
                  <label for="text-file">テキストファイル</label>
                  <input type="file" id="text-file" class="form-file" accept=".txt,.md" />
                  <p class="form-help">テキストファイル(.txt, .md)をアップロードしてください</p>
                </div>
              </div>

              <!-- URL Tab -->
              <div class="tab-content" id="url-tab">
                <div class="form-group">
                  <label for="text-url">URL</label>
                  <input type="url" id="text-url" class="form-input" placeholder="https://example.com/article" />
                  <p class="form-help">記事のURLを入力してください</p>
                </div>
                <button id="load-url-btn" class="btn btn-secondary" style="width: 100%;">
                  <i class="fas fa-download"></i> URLから読み込む
                </button>
              </div>
            </div>

            <div class="modal-footer">
              <button id="cancel-custom-text-btn" class="btn btn-secondary">キャンセル</button>
              <button id="save-custom-text-btn" class="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render category options
   */
  renderCategoryOptions() {
    return this.textManager.getCategories()
      .map(cat => `<option value="${cat.id}">${cat.name}</option>`)
      .join('');
  }

  /**
   * Render difficulty options
   */
  renderDifficultyOptions() {
    return this.textManager.getDifficultyLevels()
      .map(diff => `<option value="${diff.id}">${diff.name}</option>`)
      .join('');
  }

  /**
   * Render statistics
   */
  renderStatistics() {
    const stats = this.textManager.getStatistics();
    return `
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <div class="stat-label">総テキスト数</div>
            <div class="stat-value">${stats.total}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <div class="stat-label">お気に入り</div>
            <div class="stat-value">${stats.favorites}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✏️</div>
          <div class="stat-info">
            <div class="stat-label">カスタムテキスト</div>
            <div class="stat-value">${stats.custom}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render text list
   */
  renderTextList() {
    const texts = this.textManager.getFilteredTexts(this.currentFilters);
    
    if (texts.length === 0) {
      return '<div class="empty-state">該当するテキストが見つかりませんでした。</div>';
    }

    return `
      <div class="text-items">
        ${texts.map(text => this.renderTextItem(text)).join('')}
      </div>
      <div class="text-list-footer">
        <p>全 ${texts.length} 件のテキスト</p>
      </div>
    `;
  }

  /**
   * Render single text item
   */
  renderTextItem(text) {
    const categoryName = this.textManager.getCategories().find(c => c.id === text.category)?.name || text.category;
    const difficultyName = this.textManager.getDifficultyLevels().find(d => d.id === text.difficulty)?.name || text.difficulty;
    
    return `
      <div class="text-item" data-text-id="${text.id || text.text_id}">
        <div class="text-item-header">
          <h4 class="text-item-title">${DOMUtils.escapeHtml(text.title)}</h4>
          <button class="btn-favorite ${text.is_favorite ? 'active' : ''}" data-text-id="${text.id || text.text_id}">
            <i class="fas fa-star"></i>
          </button>
        </div>
        <div class="text-item-content">
          ${DOMUtils.escapeHtml(text.content.substring(0, 100))}${text.content.length > 100 ? '...' : ''}
        </div>
        <div class="text-item-meta">
          <span class="badge badge-category">${categoryName}</span>
          <span class="badge badge-difficulty difficulty-${text.difficulty}">${difficultyName}</span>
          <span class="text-meta-info">
            <i class="fas fa-font"></i> ${text.char_count || text.content.length} 文字
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Filter changes
    const categoryFilter = document.getElementById('category-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const favoriteFilter = document.getElementById('favorite-filter');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentFilters.category = e.target.value || null;
        this.updateTextList();
      });
    }

    if (difficultyFilter) {
      difficultyFilter.addEventListener('change', (e) => {
        this.currentFilters.difficulty = e.target.value ? parseInt(e.target.value) : null;
        this.updateTextList();
      });
    }

    if (favoriteFilter) {
      favoriteFilter.addEventListener('change', (e) => {
        this.currentFilters.favorite = e.target.checked;
        this.updateTextList();
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        this.currentFilters = { category: null, difficulty: null, favorite: false };
        categoryFilter.value = '';
        difficultyFilter.value = '';
        favoriteFilter.checked = false;
        this.updateTextList();
      });
    }

    // Favorite buttons
    this.container.addEventListener('click', async (e) => {
      const favoriteBtn = e.target.closest('.btn-favorite');
      if (favoriteBtn) {
        e.preventDefault();
        const textId = favoriteBtn.dataset.textId;
        await this.toggleFavorite(textId, favoriteBtn);
      }
    });

    // Custom text modal
    const addCustomTextBtn = document.getElementById('add-custom-text-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-custom-text-btn');
    const saveBtn = document.getElementById('save-custom-text-btn');
    const modal = document.getElementById('custom-text-modal');

    if (addCustomTextBtn) {
      addCustomTextBtn.addEventListener('click', () => {
        this.openCustomTextModal();
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.closeCustomTextModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeCustomTextModal();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveCustomText();
      });
    }

    // Tab switching
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Character count
    const textContent = document.getElementById('text-content');
    if (textContent) {
      textContent.addEventListener('input', (e) => {
        const charCount = document.getElementById('char-count');
        if (charCount) {
          charCount.textContent = e.target.value.length;
        }
      });
    }

    // File upload
    const textFile = document.getElementById('text-file');
    if (textFile) {
      textFile.addEventListener('change', (e) => {
        this.handleFileUpload(e.target.files[0]);
      });
    }

    // URL load
    const loadUrlBtn = document.getElementById('load-url-btn');
    if (loadUrlBtn) {
      loadUrlBtn.addEventListener('click', () => {
        this.loadFromURL();
      });
    }

    // Close modal on outside click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeCustomTextModal();
        }
      });
    }
  }

  /**
   * Update text list
   */
  updateTextList() {
    const textList = document.getElementById('text-list');
    if (textList) {
      textList.innerHTML = this.renderTextList();
    }

    // Update statistics
    const statsContainer = this.container.querySelector('.text-statistics');
    if (statsContainer) {
      statsContainer.innerHTML = this.renderStatistics();
    }
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(textId, button) {
    try {
      const isFavorite = await this.textManager.toggleFavorite(textId);
      button.classList.toggle('active', isFavorite);
      
      // Update statistics
      const statsContainer = this.container.querySelector('.text-statistics');
      if (statsContainer) {
        statsContainer.innerHTML = this.renderStatistics();
      }

      this.showNotification(
        isFavorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました',
        'success'
      );
    } catch (error) {
      logger.error('Failed to toggle favorite:', error);
      this.showNotification('お気に入りの更新に失敗しました', 'error');
    }
  }

  /**
   * Open custom text modal
   */
  openCustomTextModal() {
    const modal = document.getElementById('custom-text-modal');
    if (modal) {
      modal.classList.remove('hidden');
      // Clear form
      document.getElementById('text-title').value = '';
      document.getElementById('text-content').value = '';
      document.getElementById('text-category').value = '';
      document.getElementById('text-difficulty').value = '';
      document.getElementById('char-count').textContent = '0';
    }
  }

  /**
   * Close custom text modal
   */
  closeCustomTextModal() {
    const modal = document.getElementById('custom-text-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  /**
   * Switch tab
   */
  switchTab(tabId) {
    // Update tab buttons
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update tab contents
    const tabContents = this.container.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabId}-tab`);
    });
  }

  /**
   * Save custom text
   */
  async saveCustomText() {
    try {
      const title = document.getElementById('text-title').value.trim();
      const content = document.getElementById('text-content').value.trim();
      const category = document.getElementById('text-category').value;
      const difficulty = document.getElementById('text-difficulty').value;

      if (!title || !content) {
        this.showNotification('タイトルと内容を入力してください', 'error');
        return;
      }

      if (content.length > 1000) {
        this.showNotification('内容は1000文字以内にしてください', 'error');
        return;
      }

      const textData = {
        title,
        content,
        category: category || 'daily',
        difficulty: difficulty ? parseInt(difficulty) : this.estimateDifficulty(content),
        source: 'manual'
      };

      await this.textManager.uploadCustomText(textData);
      
      this.showNotification('カスタムテキストを追加しました', 'success');
      this.closeCustomTextModal();
      this.updateTextList();
    } catch (error) {
      logger.error('Failed to save custom text:', error);
      this.showNotification('カスタムテキストの保存に失敗しました', 'error');
    }
  }

  /**
   * Handle file upload
   */
  async handleFileUpload(file) {
    if (!file) return;

    try {
      const content = await this.readFileAsText(file);
      
      // Populate form
      document.getElementById('text-title').value = file.name.replace(/\.[^/.]+$/, '');
      document.getElementById('text-content').value = content.substring(0, 1000);
      document.getElementById('char-count').textContent = Math.min(content.length, 1000);

      // Switch to manual tab
      this.switchTab('manual');
      
      this.showNotification('ファイルを読み込みました', 'success');
    } catch (error) {
      logger.error('Failed to read file:', error);
      this.showNotification('ファイルの読み込みに失敗しました', 'error');
    }
  }

  /**
   * Read file as text
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Load from URL
   */
  async loadFromURL() {
    const urlInput = document.getElementById('text-url');
    const url = urlInput.value.trim();

    if (!url) {
      this.showNotification('URLを入力してください', 'error');
      return;
    }

    try {
      this.showNotification('URLから読み込み中...', 'info');
      
      const textData = await this.textManager.loadTextFromURL(url);
      
      // Populate form
      document.getElementById('text-title').value = textData.title;
      document.getElementById('text-content').value = textData.content;
      document.getElementById('char-count').textContent = textData.content.length;

      // Switch to manual tab
      this.switchTab('manual');
      
      this.showNotification('URLから読み込みました', 'success');
    } catch (error) {
      logger.error('Failed to load from URL:', error);
      this.showNotification('URLからの読み込みに失敗しました', 'error');
    }
  }

  /**
   * Estimate difficulty based on content
   */
  estimateDifficulty(content) {
    const length = content.length;
    const kanjis = (content.match(/[\u4e00-\u9faf]/g) || []).length;
    const kanjiRatio = kanjis / length;

    if (length < 30 || kanjiRatio < 0.1) {
      return 1; // 初級
    } else if (length < 100 || kanjiRatio < 0.3) {
      return 2; // 中級
    } else {
      return 3; // 上級
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 14px 20px;
      border-radius: 8px;
      background: var(--cosmic-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'cyan'});
      color: white;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}
