// PWA Installer for Cosmic Typing Adventure

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createInstallButton();
        console.log('📱 PWA Installer initialized');
    }

    setupEventListeners() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for successful installation
        window.addEventListener('appinstalled', (e) => {
            console.log('📱 PWA installed successfully');
            this.hideInstallButton();
            this.showInstallSuccess();
        });

        // Check if app is already installed
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            console.log('📱 App is already installed');
            this.hideInstallButton();
        }
    }

    createInstallButton() {
        // Create install button
        this.installButton = document.createElement('button');
        this.installButton.id = 'pwa-install-btn';
        this.installButton.className = 'fixed bottom-4 right-4 bg-cosmic-cyan hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-colors z-50 transform translate-y-full';
        this.installButton.innerHTML = `
            <i class="fas fa-download mr-2"></i>
            <span id="install-text">アプリをインストール</span>
        `;
        
        this.installButton.addEventListener('click', () => {
            this.installApp();
        });

        document.body.appendChild(this.installButton);
    }

    showInstallButton() {
        if (this.installButton) {
            this.installButton.classList.remove('translate-y-full');
            this.updateInstallText();
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.classList.add('translate-y-full');
        }
    }

    updateInstallText() {
        const installText = document.getElementById('install-text');
        if (installText) {
            const currentLang = window.languageManager?.getCurrentLanguage() || 'ja';
            if (currentLang === 'en') {
                installText.textContent = 'Install App';
            } else {
                installText.textContent = 'アプリをインストール';
            }
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                this.showInstallSuccess();
            } else {
                console.log('User dismissed the install prompt');
            }
            
            // Clear the deferredPrompt
            this.deferredPrompt = null;
            
        } catch (error) {
            console.error('Error during PWA installation:', error);
            this.showInstallError();
        }
    }

    showInstallSuccess() {
        const notification = document.createElement('div');
        notification.className = 'pwa-notification fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white p-6 rounded-lg z-50 text-center';
        notification.innerHTML = `
            <div class="text-2xl mb-2">🎉</div>
            <div class="text-lg font-bold mb-2">インストール完了！</div>
            <div class="text-sm">アプリが正常にインストールされました</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    showInstallError() {
        const notification = document.createElement('div');
        notification.className = 'pwa-notification fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-6 rounded-lg z-50 text-center';
        notification.innerHTML = `
            <div class="text-2xl mb-2">❌</div>
            <div class="text-lg font-bold mb-2">インストールエラー</div>
            <div class="text-sm">インストールに失敗しました</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    // Check if app is running in standalone mode
    isStandalone() {
        return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    }

    // Check if app is running on mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Get install prompt availability
    canInstall() {
        return this.deferredPrompt !== null;
    }
}

// Global PWA installer instance
window.PWAInstaller = PWAInstaller; 