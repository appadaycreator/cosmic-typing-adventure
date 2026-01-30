// Achievement System for Cosmic Typing Adventure

export class AchievementSystem {
  constructor(userStats) {
    this.achievements = {
      firstTyping: {
        id: 'firstTyping',
        name: { ja: '初回航行', en: 'First Flight' },
        description: { ja: '最初のタイピングを完了', en: 'Complete your first typing session' },
        icon: 'fas fa-rocket',
        condition: (stats) => stats.totalSessions >= 1,
        unlocked: false
      },
      speedPilot: {
        id: 'speedPilot',
        name: { ja: 'スピードパイロット', en: 'Speed Pilot' },
        description: { ja: '50 WPMを達成', en: 'Achieve 50 WPM' },
        icon: 'fas fa-bolt',
        condition: (stats) => stats.bestWPM >= 50,
        unlocked: false
      },
      accuracyMaster: {
        id: 'accuracyMaster',
        name: { ja: '精密制御', en: 'Precision Master' },
        description: { ja: '95%以上の正確率を達成', en: 'Achieve 95% accuracy' },
        icon: 'fas fa-crosshairs',
        condition: (stats) => stats.bestAccuracy >= 95,
        unlocked: false
      },
      planetExplorer: {
        id: 'planetExplorer',
        name: { ja: '惑星発見者', en: 'Planet Explorer' },
        description: { ja: '最初の惑星を発見', en: 'Discover your first planet' },
        icon: 'fas fa-globe',
        condition: (stats) => (stats.planetsDiscovered && stats.planetsDiscovered.length >= 1),
        unlocked: false
      },
      marathonRunner: {
        id: 'marathonRunner',
        name: { ja: 'マラソンランナー', en: 'Marathon Runner' },
        description: { ja: '10分間の練習を完了', en: 'Complete 10 minutes of practice' },
        icon: 'fas fa-stopwatch',
        condition: (stats) => stats.totalTime >= 600,
        unlocked: false
      },
      comboMaster: {
        id: 'comboMaster',
        name: { ja: 'コンボマスター', en: 'Combo Master' },
        description: { ja: '100コンボを達成', en: 'Achieve 100 combo' },
        icon: 'fas fa-fire',
        condition: (stats) => stats.bestCombo >= 100,
        unlocked: false
      },
      levelUp: {
        id: 'levelUp',
        name: { ja: 'レベルアップ', en: 'Level Up' },
        description: { ja: 'レベル5に到達', en: 'Reach level 5' },
        icon: 'fas fa-star',
        condition: (stats) => stats.level >= 5,
        unlocked: false
      },
      veteran: {
        id: 'veteran',
        name: { ja: 'ベテラン', en: 'Veteran' },
        description: { ja: '100セッションを完了', en: 'Complete 100 sessions' },
        icon: 'fas fa-medal',
        condition: (stats) => stats.totalSessions >= 100,
        unlocked: false
      },
      speedDemon: {
        id: 'speedDemon',
        name: { ja: 'スピードデーモン', en: 'Speed Demon' },
        description: { ja: '100 WPMを達成', en: 'Achieve 100 WPM' },
        icon: 'fas fa-tachometer-alt',
        condition: (stats) => stats.bestWPM >= 100,
        unlocked: false
      },
      perfectionist: {
        id: 'perfectionist',
        name: { ja: '完璧主義者', en: 'Perfectionist' },
        description: { ja: '100%の正確率を達成', en: 'Achieve 100% accuracy' },
        icon: 'fas fa-gem',
        condition: (stats) => stats.bestAccuracy >= 100,
        unlocked: false
      }
    };

    this.loadAchievements();
    if (userStats) {
      this.checkAchievements(userStats);
    }
  }

  loadAchievements() {
    const savedAchievements = localStorage.getItem('cosmicTyping_achievements');
    if (savedAchievements) {
      const unlockedAchievements = JSON.parse(savedAchievements);
      Object.keys(unlockedAchievements).forEach(id => {
        if (this.achievements[id]) {
          this.achievements[id].unlocked = true;
        }
      });
    }
  }

  saveAchievements() {
    const unlockedAchievements = {};
    Object.values(this.achievements).forEach(achievement => {
      if (achievement.unlocked) {
        unlockedAchievements[achievement.id] = true;
      }
    });
    localStorage.setItem('cosmicTyping_achievements', JSON.stringify(unlockedAchievements));
  }

  checkAchievements(userStats) {
    const newlyUnlocked = [];

    Object.values(this.achievements).forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(userStats)) {
        achievement.unlocked = true;
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveAchievements();
      this.showAchievementNotification(newlyUnlocked);
      this.updateAchievementDisplay();
    }

    return newlyUnlocked;
  }

  showAchievementNotification(achievements) {
    achievements.forEach(achievement => {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'achievement-notification fixed top-4 right-4 bg-cosmic-card border border-planet-orange rounded-lg p-4 z-50 transform translate-x-full transition-transform duration-500';
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <i class="${achievement.icon} text-planet-orange text-2xl"></i>
          <div>
            <div class="font-bold text-planet-orange">${achievement.name.ja}</div>
            <div class="text-sm text-gray-400">${achievement.description.ja}</div>
          </div>
        </div>
      `;

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.classList.remove('translate-x-full');
      }, 100);

      // Animate out and remove
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);

      // Play achievement sound
      if (window.audioManager) {
        window.audioManager.playAchievement();
      }
    });
  }

  updateAchievementDisplay() {
    const achievementList = document.getElementById('achievementList');
    if (!achievementList) return;

    achievementList.innerHTML = '';

    Object.values(this.achievements).forEach(achievement => {
      const achievementElement = document.createElement('div');
      achievementElement.className = `achievement-item p-2 bg-gray-800 rounded flex items-center space-x-3 ${achievement.unlocked ? '' : 'opacity-50'}`;
      achievementElement.innerHTML = `
        <i class="${achievement.icon} ${achievement.unlocked ? 'text-planet-orange' : 'text-gray-500'}"></i>
        <div class="text-sm">
          <div class="font-bold ${achievement.unlocked ? 'text-planet-orange' : 'text-gray-500'}">${achievement.name.ja}</div>
          <div class="text-xs ${achievement.unlocked ? 'text-gray-400' : 'text-gray-600'}">${achievement.description.ja}</div>
        </div>
      `;

      achievementList.appendChild(achievementElement);
    });
  }

  getUnlockedCount() {
    return Object.values(this.achievements).filter(a => a.unlocked).length;
  }

  getTotalCount() {
    return Object.keys(this.achievements).length;
  }

  getProgress() {
    return {
      unlocked: this.getUnlockedCount(),
      total: this.getTotalCount(),
      percentage: Math.round((this.getUnlockedCount() / this.getTotalCount()) * 100)
    };
  }
} 