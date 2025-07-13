// PWA Installer for Cosmic Typing Adventure

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.installButton = null;
        this.installContainer = null;
        
        this.init();
        console.log('📱 PWA Installer initialized');
    }

    init() {
        this.setupEventListeners();
        this.checkInstallationStatus();
        this.createInstallButton();
    }

    setupEventListeners() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
            console.log('PWA install prompt available');
        });

        // Listen for appinstalled event
        window.addEventListener('appinstalled', (e) => {
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallationSuccess();
            console.log('PWA installed successfully');
        });

        // Listen for visibility change to detect if app is running in standalone mode
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkInstallationStatus();
            }
        });

        // Check if running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            this.hideInstallButton();
        }
    }

    createInstallButton() {
        // Create install button container
        this.installContainer = document.createElement('div');
        this.installContainer.id = 'pwa-install-container';
        this.installContainer.className = 'fixed bottom-4 right-4 z-50 transform translate-y-full transition-transform duration-500';
        
        // Create install button
        this.installButton = document.createElement('button');
        this.installButton.id = 'pwa-install-button';
        this.installButton.className = `
            bg-gradient-to-r from-blue-600 to-purple-600 
            hover:from-blue-700 hover:to-purple-700 
            text-white font-bold py-3 px-6 rounded-full 
            shadow-lg hover:shadow-xl transform hover:scale-105 
            transition-all duration-300 flex items-center space-x-2
        `;
        this.installButton.innerHTML = `
            <i class="fas fa-download text-lg"></i>
            <span class="install-text">アプリをインストール</span>
        `;
        
        // Add click event
        this.installButton.addEventListener('click', () => {
            this.installApp();
        });
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = `
            absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 
            text-white rounded-full w-6 h-6 flex items-center justify-center 
            text-xs font-bold transition-colors duration-200
        `;
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => {
            this.hideInstallButton();
            this.dismissInstallPrompt();
        });
        
        // Assemble container
        this.installContainer.appendChild(this.installButton);
        this.installContainer.appendChild(closeButton);
        
        // Add to page
        document.body.appendChild(this.installContainer);
    }

    showInstallButton() {
        if (this.isInstalled || !this.deferredPrompt) return;
        
        // Update button text based on language
        this.updateInstallButtonText();
        
        // Show button with animation
        setTimeout(() => {
            this.installContainer.classList.remove('translate-y-full');
        }, 1000);
        
        // Auto-hide after 10 seconds if not clicked
        setTimeout(() => {
            if (this.installContainer.classList.contains('translate-y-full')) {
                this.hideInstallButton();
            }
        }, 10000);
    }

    hideInstallButton() {
        this.installContainer.classList.add('translate-y-full');
    }

    updateInstallButtonText() {
        const installText = this.installButton.querySelector('.install-text');
        if (installText) {
            const currentLang = window.languageManager?.getCurrentLanguage() || 'ja';
            const texts = {
                ja: 'アプリをインストール',
                en: 'Install App'
            };
            installText.textContent = texts[currentLang] || texts.ja;
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            this.showInstallationError('Installation not available');
            return;
        }

        try {
            // Show loading state
            this.setInstallButtonLoading(true);
            
            // Prompt user to install
            this.deferredPrompt.prompt();
            
            // Wait for user response
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.showInstallationSuccess();
                console.log('User accepted PWA installation');
            } else {
                this.showInstallationCancelled();
                console.log('User declined PWA installation');
            }
            
            // Clear the deferred prompt
            this.deferredPrompt = null;
            
        } catch (error) {
            console.error('PWA installation failed:', error);
            this.showInstallationError(error.message);
        } finally {
            this.setInstallButtonLoading(false);
        }
    }

    setInstallButtonLoading(loading) {
        if (loading) {
            this.installButton.disabled = true;
            this.installButton.innerHTML = `
                <i class="fas fa-spinner fa-spin text-lg"></i>
                <span>インストール中...</span>
            `;
        } else {
            this.installButton.disabled = false;
            this.updateInstallButtonText();
        }
    }

    showInstallationSuccess() {
        const notification = this.createNotification(
            '✅ アプリがインストールされました！',
            'success'
        );
        this.showNotification(notification);
        
        // Hide install button
        this.hideInstallButton();
        
        // Track installation
        this.trackInstallation('success');
    }

    showInstallationCancelled() {
        const notification = this.createNotification(
            '❌ インストールがキャンセルされました',
            'warning'
        );
        this.showNotification(notification);
        
        // Track installation
        this.trackInstallation('cancelled');
    }

    showInstallationError(message) {
        const notification = this.createNotification(
            `❌ インストールエラー: ${message}`,
            'error'
        );
        this.showNotification(notification);
        
        // Track installation
        this.trackInstallation('error', message);
    }

    createNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `
            fixed top-4 right-4 p-4 rounded-lg z-50 
            transform translate-x-full transition-transform duration-500
            ${this.getNotificationClasses(type)}
        `;
        notification.textContent = message;
        return notification;
    }

    getNotificationClasses(type) {
        switch (type) {
            case 'success':
                return 'bg-green-600 text-white';
            case 'error':
                return 'bg-red-600 text-white';
            case 'warning':
                return 'bg-yellow-600 text-white';
            default:
                return 'bg-blue-600 text-white';
        }
    }

    showNotification(notification) {
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
        }, 3000);
    }

    dismissInstallPrompt() {
        // Hide the install button
        this.hideInstallButton();
        
        // Clear the deferred prompt
        this.deferredPrompt = null;
        
        // Show dismissal notification
        const notification = this.createNotification(
            'インストールボタンを非表示にしました',
            'info'
        );
        this.showNotification(notification);
    }

    checkInstallationStatus() {
        // Check if app is running in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInstalled = window.navigator.standalone || isStandalone;
        
        if (isInstalled && !this.isInstalled) {
            this.isInstalled = true;
            this.hideInstallButton();
            console.log('PWA detected as installed');
        }
    }

    trackInstallation(status, error = null) {
        // Track installation events for analytics
        const event = {
            type: 'pwa_installation',
            status: status,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            error: error
        };
        
        // Store in localStorage for analytics
        try {
            const analytics = JSON.parse(localStorage.getItem('cosmicTyping_analytics') || '[]');
            analytics.push(event);
            localStorage.setItem('cosmicTyping_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Failed to track installation:', error);
        }
        
        // Log to console
        console.log('PWA installation tracked:', event);
    }

    // Get installation statistics
    getInstallationStats() {
        try {
            const analytics = JSON.parse(localStorage.getItem('cosmicTyping_analytics') || '[]');
            const installationEvents = analytics.filter(event => event.type === 'pwa_installation');
            
            const stats = {
                totalAttempts: installationEvents.length,
                successful: installationEvents.filter(e => e.status === 'success').length,
                cancelled: installationEvents.filter(e => e.status === 'cancelled').length,
                errors: installationEvents.filter(e => e.status === 'error').length,
                successRate: 0
            };
            
            if (stats.totalAttempts > 0) {
                stats.successRate = (stats.successful / stats.totalAttempts) * 100;
            }
            
            return stats;
        } catch (error) {
            console.error('Failed to get installation stats:', error);
            return {
                totalAttempts: 0,
                successful: 0,
                cancelled: 0,
                errors: 0,
                successRate: 0
            };
        }
    }

    // Check if PWA is supported
    isPWASupported() {
        return 'serviceWorker' in navigator && 
               'PushManager' in window && 
               window.matchMedia('(display-mode: standalone)').matches === false;
    }

    // Get PWA capabilities
    getPWACapabilities() {
        return {
            serviceWorker: 'serviceWorker' in navigator,
            pushNotifications: 'PushManager' in window,
            backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            beforeInstallPrompt: !!this.deferredPrompt,
            isInstalled: this.isInstalled,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches
        };
    }

    // Force show install button (for testing)
    forceShowInstallButton() {
        if (this.deferredPrompt) {
            this.showInstallButton();
        } else {
            console.warn('No install prompt available');
        }
    }

    // Reset installation state (for testing)
    resetInstallationState() {
        this.isInstalled = false;
        this.deferredPrompt = null;
        this.showInstallButton();
    }
}

// Global PWA installer instance
window.PWAInstaller = PWAInstaller; 