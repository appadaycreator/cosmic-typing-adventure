// Ship Upgrade System for Cosmic Typing Adventure

class ShipUpgradeSystem {
    constructor() {
        this.upgrades = {
            engine: { level: 1, cost: 100, effect: 0.05, maxLevel: 5 },
            fuel: { level: 1, cost: 150, effect: 0.02, maxLevel: 5 },
            shield: { level: 1, cost: 200, effect: 0.10, maxLevel: 5 }
        };
        
        this.loadUpgrades();
        this.setupEventListeners();
        console.log('🚀 Ship Upgrade System initialized');
    }

    loadUpgrades() {
        const savedUpgrades = localStorage.getItem('cosmicTyping_upgrades');
        if (savedUpgrades) {
            const parsedUpgrades = JSON.parse(savedUpgrades);
            Object.keys(parsedUpgrades).forEach(key => {
                if (this.upgrades[key]) {
                    this.upgrades[key].level = parsedUpgrades[key].level;
                }
            });
        }
    }

    saveUpgrades() {
        const upgradeData = {};
        Object.keys(this.upgrades).forEach(key => {
            upgradeData[key] = { level: this.upgrades[key].level };
        });
        localStorage.setItem('cosmicTyping_upgrades', JSON.stringify(upgradeData));
    }

    setupEventListeners() {
        // Engine upgrade button
        const engineBtn = document.querySelector('[data-upgrade="engine"]');
        if (engineBtn) {
            engineBtn.addEventListener('click', () => this.upgradeShip('engine'));
        }

        // Fuel upgrade button
        const fuelBtn = document.querySelector('[data-upgrade="fuel"]');
        if (fuelBtn) {
            fuelBtn.addEventListener('click', () => this.upgradeShip('fuel'));
        }

        // Shield upgrade button
        const shieldBtn = document.querySelector('[data-upgrade="shield"]');
        if (shieldBtn) {
            shieldBtn.addEventListener('click', () => this.upgradeShip('shield'));
        }
    }

    upgradeShip(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        
        if (!upgrade) {
            console.error('Invalid upgrade type:', upgradeType);
            return;
        }

        if (upgrade.level >= upgrade.maxLevel) {
            this.showNotification('Maximum level reached!', 'warning');
            return;
        }

        const cost = upgrade.cost * upgrade.level;
        
        if (window.userStats && window.userStats.xp >= cost) {
            // Deduct XP
            window.userStats.xp -= cost;
            
            // Upgrade level
            upgrade.level++;
            
            // Apply effects
            this.applyUpgradeEffects();
            
            // Save upgrades
            this.saveUpgrades();
            
            // Update UI
            this.updateUpgradeDisplay();
            if (window.updateUI) {
                window.updateUI();
            }
            
            // Show success notification
            this.showNotification(`${upgradeType.toUpperCase()} upgraded to level ${upgrade.level}!`, 'success');
            
            // Play upgrade sound
            if (window.audioManager) {
                window.audioManager.playUpgrade();
            }
            
            console.log(`${upgradeType} upgraded to level ${upgrade.level}`);
        } else {
            this.showNotification('Not enough XP!', 'error');
        }
    }

    applyUpgradeEffects() {
        if (!window.gameState) return;
        
        // Calculate bonuses
        const engineBonus = (this.upgrades.engine.level - 1) * this.upgrades.engine.effect;
        const fuelBonus = (this.upgrades.fuel.level - 1) * this.upgrades.fuel.effect;
        const shieldBonus = (this.upgrades.shield.level - 1) * this.upgrades.shield.effect;
        
        // Apply effects to game state
        window.gameState.speedMultiplier = 1 + engineBonus;
        window.gameState.accuracyBonus = fuelBonus;
        window.gameState.comboPenaltyReduction = shieldBonus;
        
        console.log('Upgrade effects applied:', {
            speedMultiplier: window.gameState.speedMultiplier,
            accuracyBonus: window.gameState.accuracyBonus,
            comboPenaltyReduction: window.gameState.comboPenaltyReduction
        });
    }

    updateUpgradeDisplay() {
        // Update engine display
        this.updateUpgradeElement('engine', 'engineLevel', 'engineProgress');
        
        // Update fuel display
        this.updateUpgradeElement('fuel', 'fuelLevel', 'fuelProgress');
        
        // Update shield display
        this.updateUpgradeElement('shield', 'shieldLevel', 'shieldProgress');
        
        // Update upgrade buttons
        this.updateUpgradeButtons();
    }

    updateUpgradeElement(upgradeType, levelElementId, progressElementId) {
        const upgrade = this.upgrades[upgradeType];
        const levelElement = document.getElementById(levelElementId);
        const progressElement = document.getElementById(progressElementId);
        
        if (levelElement) {
            levelElement.textContent = upgrade.level;
        }
        
        if (progressElement) {
            const progress = (upgrade.level / upgrade.maxLevel) * 100;
            progressElement.style.width = `${progress}%`;
        }
    }

    updateUpgradeButtons() {
        Object.keys(this.upgrades).forEach(upgradeType => {
            const upgrade = this.upgrades[upgradeType];
            const button = document.querySelector(`[data-upgrade="${upgradeType}"]`);
            
            if (button) {
                const cost = upgrade.cost * upgrade.level;
                const canAfford = window.userStats && window.userStats.xp >= cost;
                const isMaxLevel = upgrade.level >= upgrade.maxLevel;
                
                // Update button text
                if (isMaxLevel) {
                    button.textContent = 'MAX LEVEL';
                    button.disabled = true;
                    button.classList.add('opacity-50');
                } else {
                    button.textContent = `Upgrade (${cost} XP)`;
                    button.disabled = !canAfford;
                    button.classList.toggle('opacity-50', !canAfford);
                }
            }
        });
    }

    getUpgradeBonus(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        if (!upgrade) return 0;
        
        return (upgrade.level - 1) * upgrade.effect;
    }

    getTotalBonuses() {
        return {
            speed: this.getUpgradeBonus('engine'),
            accuracy: this.getUpgradeBonus('fuel'),
            combo: this.getUpgradeBonus('shield')
        };
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `upgrade-notification fixed top-4 right-4 p-4 rounded-lg z-50 transform translate-x-full transition-transform duration-500`;
        
        // Set color based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-600', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-600', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-600', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-600', 'text-white');
        }
        
        notification.textContent = message;
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

    resetUpgrades() {
        Object.keys(this.upgrades).forEach(key => {
            this.upgrades[key].level = 1;
        });
        
        this.saveUpgrades();
        this.updateUpgradeDisplay();
        this.applyUpgradeEffects();
        
        console.log('All upgrades reset to level 1');
    }
}

// Global ship upgrade system instance
window.ShipUpgradeSystem = ShipUpgradeSystem; 