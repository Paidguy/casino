class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;
  private unlockHandler: (() => void) | null = null;

  constructor() {
    try {
      const stored = localStorage.getItem('sound_enabled_v1');
      this.enabled = stored !== 'false';
      
      if (typeof window !== 'undefined') {
        // Aggressive unlocking for Chrome Autoplay Policy
        this.unlockHandler = () => {
          this.checkAndResume();
          if (this.ctx && this.ctx.state === 'running' && this.unlockHandler) {
             window.removeEventListener('click', this.unlockHandler);
             window.removeEventListener('touchstart', this.unlockHandler);
             window.removeEventListener('keydown', this.unlockHandler);
             this.unlockHandler = null;
          }
        };
        window.addEventListener('click', this.unlockHandler);
        window.addEventListener('touchstart', this.unlockHandler);
        window.addEventListener('keydown', this.unlockHandler);
      }
    } catch (e) {
      this.enabled = true;
    }
  }

  /**
   * Clean up audio context and event listeners
   * Call this before destroying the audio manager
   */
  public destroy(): void {
    if (typeof window !== 'undefined' && this.unlockHandler) {
      window.removeEventListener('click', this.unlockHandler);
      window.removeEventListener('touchstart', this.unlockHandler);
      window.removeEventListener('keydown', this.unlockHandler);
      this.unlockHandler = null;
    }
    
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  private init() {
    if (!this.enabled) return;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
    } catch (e) {
      // Silence init errors
    }
  }

  private checkAndResume() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
      }
  }

  public toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('sound_enabled_v1', String(this.enabled));
    } catch(e) {}
    
    if (this.enabled) {
        this.init();
        this.checkAndResume();
    }
    return this.enabled;
  }

  get isEnabled() { return this.enabled; }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime = 0, vol = 0.1) {
    if (!this.enabled) return;
    
    this.checkAndResume();
    
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    } catch (e) {
      // Swallow errors to ensure game flow continues
    }
  }

  // Public methods wrapped to prevent game logic failure
  public playClick() { try { this.playTone(800, 'sine', 0.1, 0, 0.05); } catch(e){} }
  public playBet() { 
    try {
      this.playTone(400, 'square', 0.08, 0, 0.03); 
      this.playTone(600, 'square', 0.08, 0.05, 0.03); 
    } catch(e){}
  }
  public playWin() { 
    try {
      this.playTone(523.25, 'sine', 0.3, 0, 0.08); 
      this.playTone(659.25, 'sine', 0.3, 0.1, 0.08); 
      this.playTone(783.99, 'sine', 0.5, 0.2, 0.08); 
    } catch(e){}
  }
  public playLoss() {
    try {
      this.playTone(180, 'sawtooth', 0.4, 0, 0.08);
      this.playTone(130, 'sawtooth', 0.4, 0.15, 0.08);
    } catch(e){}
  }
  public playSpin() {
    try {
      this.playTone(1000, 'sine', 0.02, 0, 0.02);
    } catch(e){}
  }
}

export const audio = new AudioManager();