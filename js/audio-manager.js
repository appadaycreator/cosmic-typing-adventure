// Audio Manager for Cosmic Typing Adventure

class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.isSoundEnabled = localStorage.getItem('soundEffects') !== 'false';
    this.isMusicEnabled = localStorage.getItem('backgroundMusic') !== 'false';
    this.volume = parseFloat(localStorage.getItem('audioVolume') || '0.5');
    
    this.init();
  }

  init() {
    this.loadSounds();
    this.setupEventListeners();
    console.log('🎵 Audio Manager initialized');
  }

  loadSounds() {
    // Create audio contexts for different sound effects
    this.sounds = {
      keypress: this.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      correct: this.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      error: this.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      complete: this.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      levelup: this.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      discovery: this.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      upgrade: this.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      achievement: this.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    };
  }

  createAudio(base64Data) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = this.volume;
    return audio;
  }

  setupEventListeners() {
    // Sound effects toggle
    const soundEffectsCheckbox = document.getElementById('soundEffects');
    if (soundEffectsCheckbox) {
      soundEffectsCheckbox.checked = this.isSoundEnabled;
      soundEffectsCheckbox.addEventListener('change', (e) => {
        this.isSoundEnabled = e.target.checked;
        localStorage.setItem('soundEffects', this.isSoundEnabled);
      });
    }

    // Background music toggle
    const backgroundMusicCheckbox = document.getElementById('backgroundMusic');
    if (backgroundMusicCheckbox) {
      backgroundMusicCheckbox.checked = this.isMusicEnabled;
      backgroundMusicCheckbox.addEventListener('change', (e) => {
        this.isMusicEnabled = e.target.checked;
        localStorage.setItem('backgroundMusic', this.isMusicEnabled);
        if (this.isMusicEnabled) {
          this.startBackgroundMusic();
        } else {
          this.stopBackgroundMusic();
        }
      });
    }
  }

  playSound(soundName) {
    if (!this.isSoundEnabled || !this.sounds[soundName]) return;
    
    try {
      const sound = this.sounds[soundName];
      sound.currentTime = 0;
      sound.volume = this.volume;
      sound.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });
    } catch (error) {
      console.warn('Audio playback error:', error);
    }
  }

  startBackgroundMusic() {
    if (!this.isMusicEnabled) return;
    
    // Create ambient space music
    this.music = new Audio();
    this.music.loop = true;
    this.music.volume = this.volume * 0.3; // Lower volume for background music
    
    // Start with a simple ambient sound
    this.music.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    this.music.play().catch(error => {
      console.warn('Failed to start background music:', error);
    });
  }

  stopBackgroundMusic() {
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('audioVolume', this.volume);
    
    // Update all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
    
    if (this.music) {
      this.music.volume = this.volume * 0.3;
    }
  }

  // Sound effect methods
  playKeypress() {
    this.playSound('keypress');
  }

  playCorrect() {
    this.playSound('correct');
  }

  playError() {
    this.playSound('error');
  }

  playComplete() {
    this.playSound('complete');
  }

  playLevelUp() {
    this.playSound('levelup');
  }

  playDiscovery() {
    this.playSound('discovery');
  }

  playUpgrade() {
    this.playSound('upgrade');
  }

  playAchievement() {
    this.playSound('achievement');
  }
}

// Global audio manager instance
window.AudioManager = AudioManager; 