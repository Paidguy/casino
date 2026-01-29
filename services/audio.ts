class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    try {
      const stored = localStorage.getItem('sound_enabled_v1');
      this.enabled = stored !== 'false';
      
      // Auto-init on first gesture for mobile
      if (typeof window !== 'undefined') {
        const unlock = () => {
          this.init();
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('touchstart', unlock);
      }
    } catch (e) {
      this.enabled = true;
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
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      // Silence init errors
    }
  }

  public toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('sound_enabled_v1', String(this.enabled));
    } catch(e) {}
    
    if (this.enabled) this.init();
    return this.enabled;
  }

  get isEnabled() { return this.enabled; }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime = 0, vol = 0.1) {
    if (!this.enabled) return;
    // Attempt init but don't block
    this.init();
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
      // Swallow audio errors so game logic proceeds
    }
  }

  // Public methods now safely wrap the internal logic
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