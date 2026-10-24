class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      const stored = localStorage.getItem('stakepro_sound_v1');
      this.enabled = stored !== 'false';

      if (typeof window !== 'undefined') {
        const unlock = () => {
          this.checkAndResume();
          if (this.ctx && this.ctx.state === 'running') {
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('keydown', unlock);
          }
        };
        window.addEventListener('click', unlock);
        window.addEventListener('touchstart', unlock);
        window.addEventListener('keydown', unlock);
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
    } catch (e) {}
  }

  private checkAndResume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('stakepro_sound_v1', String(this.enabled));
    } catch (e) {}

    if (this.enabled) {
      this.init();
      this.checkAndResume();
      this.playClick();
    }
    return this.enabled;
  }

  get isEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime = 0, vol = 0.08) {
    if (!this.enabled) return;
    this.checkAndResume();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0008, this.ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    } catch (e) {}
  }

  public playClick() {
    this.playTone(620, 'sine', 0.045, 0, 0.04);
  }

  public playBet() {
    this.playTone(340, 'triangle', 0.06, 0, 0.05);
    this.playTone(510, 'sine', 0.07, 0.035, 0.05);
  }

  public playTileSafe(step = 1) {
    const pitch = Math.min(1400, 440 * Math.pow(1.07, step));
    this.playTone(pitch, 'sine', 0.14, 0, 0.07);
    this.playTone(pitch * 1.5, 'triangle', 0.1, 0.03, 0.04);
  }

  public playWin() {
    this.playTone(523.25, 'sine', 0.16, 0, 0.07);
    this.playTone(659.25, 'sine', 0.16, 0.07, 0.07);
    this.playTone(783.99, 'sine', 0.24, 0.14, 0.08);
    this.playTone(1046.5, 'triangle', 0.32, 0.21, 0.06);
  }

  public playLoss() {
    this.playTone(210, 'triangle', 0.18, 0, 0.07);
    this.playTone(145, 'sawtooth', 0.25, 0.09, 0.05);
  }

  public playSpin() {
    this.playTone(880, 'sine', 0.025, 0, 0.025);
  }
}

export const audio = new AudioManager();