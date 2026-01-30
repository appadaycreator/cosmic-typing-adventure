// エラーハンドリングユーティリティ
// アプリケーション全体で統一的なエラー処理を提供

import { logger } from './logger.js';
import { DOMUtils } from './dom-utils.js';

/**
 * エラーレベル定義
 */
const ErrorLevel = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * エラーハンドラクラス
 */
class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // 最大保存エラー数
    this.notificationTimeout = 5000; // 通知表示時間（ミリ秒）
    
    // グローバルエラーハンドラーを設定
    this.setupGlobalHandlers();
  }

  /**
   * グローバルエラーハンドラーを設定
   */
  setupGlobalHandlers() {
    // 未処理のエラー
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message, {
        level: ErrorLevel.ERROR,
        file: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });

    // 未処理のPromise拒否
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        level: ErrorLevel.ERROR,
        type: 'Promise Rejection'
      });
    });
  }

  /**
   * エラーを処理
   * @param {Error|string} error - エラーオブジェクトまたはメッセージ
   * @param {Object} options - オプション
   * @param {string} options.level - エラーレベル
   * @param {boolean} options.showNotification - 通知を表示するか
   * @param {string} options.userMessage - ユーザー向けメッセージ
   */
  handleError(error, options = {}) {
    const {
      level = ErrorLevel.ERROR,
      showNotification = true,
      userMessage = null,
      ...metadata
    } = options;

    // エラー情報を構築
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      level,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // エラーを記録
    this.logError(errorInfo);

    // ユーザーに通知
    if (showNotification) {
      const message = userMessage || this.getUserFriendlyMessage(errorInfo);
      this.showNotification(message, level);
    }

    // エラー履歴に追加
    this.addToHistory(errorInfo);

    return errorInfo;
  }

  /**
   * エラーをログに記録
   * @param {Object} errorInfo - エラー情報
   */
  logError(errorInfo) {
    const { level, message, stack, ...rest } = errorInfo;

    switch (level) {
      case ErrorLevel.INFO:
        logger.info('エラー情報:', message, rest);
        break;
      case ErrorLevel.WARNING:
        logger.warn('警告:', message, rest);
        break;
      case ErrorLevel.ERROR:
        logger.error('エラー:', message, stack || '', rest);
        break;
      case ErrorLevel.CRITICAL:
        logger.error('重大なエラー:', message, stack || '', rest);
        break;
    }
  }

  /**
   * ユーザーフレンドリーなメッセージを取得
   * @param {Object} errorInfo - エラー情報
   * @returns {string}
   */
  getUserFriendlyMessage(errorInfo) {
    const { message, level } = errorInfo;

    // 共通エラーメッセージのマッピング
    const errorMap = {
      'Failed to fetch': 'ネットワーク接続を確認してください',
      'Network request failed': 'ネットワーク接続を確認してください',
      'NetworkError': 'ネットワーク接続を確認してください',
      'Not found': 'リソースが見つかりませんでした',
      'Unauthorized': '認証が必要です',
      'Forbidden': 'アクセスが拒否されました',
      'Internal Server Error': 'サーバーエラーが発生しました',
    };

    // エラーマップから該当するメッセージを検索
    for (const [key, value] of Object.entries(errorMap)) {
      if (message.includes(key)) {
        return value;
      }
    }

    // レベルに応じたデフォルトメッセージ
    switch (level) {
      case ErrorLevel.INFO:
        return message;
      case ErrorLevel.WARNING:
        return `注意: ${message}`;
      case ErrorLevel.ERROR:
        return `エラーが発生しました: ${message}`;
      case ErrorLevel.CRITICAL:
        return `重大なエラーが発生しました。ページを再読み込みしてください。`;
      default:
        return message;
    }
  }

  /**
   * 通知を表示
   * @param {string} message - メッセージ
   * @param {string} level - エラーレベル
   */
  showNotification(message, level) {
    // 通知要素を作成
    const notification = DOMUtils.createElement('div', {
      className: `notification notification-${level}`,
      role: 'alert',
      'aria-live': 'polite'
    }, message);

    // アイコンを追加
    const icon = this.getIconForLevel(level);
    notification.insertAdjacentHTML('afterbegin', `<span class="notification-icon">${icon}</span>`);

    // 閉じるボタンを追加
    const closeBtn = DOMUtils.createElement('button', {
      className: 'notification-close',
      'aria-label': '閉じる'
    }, '×');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
    notification.appendChild(closeBtn);

    // 通知コンテナを取得または作成
    let container = document.getElementById('notification-container');
    if (!container) {
      container = DOMUtils.createElement('div', { id: 'notification-container' });
      document.body.appendChild(container);
    }

    // 通知を追加
    container.appendChild(notification);

    // アニメーションで表示
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // 自動的に削除
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, this.notificationTimeout);
  }

  /**
   * レベルに応じたアイコンを取得
   * @param {string} level - エラーレベル
   * @returns {string} アイコンHTML
   */
  getIconForLevel(level) {
    const icons = {
      [ErrorLevel.INFO]: 'ℹ️',
      [ErrorLevel.WARNING]: '⚠️',
      [ErrorLevel.ERROR]: '❌',
      [ErrorLevel.CRITICAL]: '🚨'
    };
    return icons[level] || '•';
  }

  /**
   * エラー履歴に追加
   * @param {Object} errorInfo - エラー情報
   */
  addToHistory(errorInfo) {
    this.errors.push(errorInfo);
    
    // 最大数を超えたら古いものを削除
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  /**
   * エラー履歴を取得
   * @returns {Array} エラー履歴
   */
  getHistory() {
    return [...this.errors];
  }

  /**
   * エラー履歴をクリア
   */
  clearHistory() {
    this.errors = [];
  }

  /**
   * エラーを安全に実行
   * @param {Function} fn - 実行する関数
   * @param {Object} options - オプション
   * @returns {*} 関数の戻り値またはnull
   */
  async safeExecute(fn, options = {}) {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, options);
      return null;
    }
  }

  /**
   * エラーをラップして再スロー
   * @param {Function} fn - 実行する関数
   * @param {string} context - コンテキスト情報
   */
  async wrapError(fn, context) {
    try {
      return await fn();
    } catch (error) {
      const wrappedError = new Error(`${context}: ${error.message}`);
      wrappedError.originalError = error;
      throw wrappedError;
    }
  }

  /**
   * バリデーションエラーを処理
   * @param {Object} errors - バリデーションエラー
   */
  handleValidationErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
      this.handleError(message, {
        level: ErrorLevel.WARNING,
        field,
        type: 'Validation Error'
      });
    });
  }

  /**
   * ネットワークエラーを処理
   * @param {Error} error - エラーオブジェクト
   * @param {Object} options - オプション
   */
  handleNetworkError(error, options = {}) {
    this.handleError(error, {
      level: ErrorLevel.ERROR,
      type: 'Network Error',
      userMessage: 'ネットワーク接続を確認してください',
      ...options
    });
  }

  /**
   * データベースエラーを処理
   * @param {Error} error - エラーオブジェクト
   * @param {Object} options - オプション
   */
  handleDatabaseError(error, options = {}) {
    this.handleError(error, {
      level: ErrorLevel.ERROR,
      type: 'Database Error',
      userMessage: 'データの保存に失敗しました',
      ...options
    });
  }
}

// シングルトンインスタンス
const errorHandler = new ErrorHandler();

// グローバルに公開（デバッグ用）
if (typeof window !== 'undefined') {
  window.errorHandler = errorHandler;
}

export { errorHandler, ErrorHandler, ErrorLevel };
