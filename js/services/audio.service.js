/**
 * 🇯🇴 خدمة المؤثرات الصوتية التفاعلية (Web Audio API Sound Service)
 * نغمات أصيلة بدون أي ملفات mp3 خارجية لضمان السرعة والعمل حتى بدون إنترنت
 */

class AudioService {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('jt_sound_muted') === 'true';
  }

  /**
   * تهيئة سياق الصوت وضمان تفعيله بعد أول تفاعل من المستخدم
   */
  initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * 1. نغمة نقر دبابيس خريطة الأردن التفاعلية (D5 -> A5 Harmonic Chime)
   */
  playPinChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // التردد البدائي نغمة D5
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);
      // الصعود التدريجي التوافقي لنغمة A5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio play skipped:', e);
    }
  }

  /**
   * 2. نغمة الإنجاز وفك قفل الأختام الملكية وتأكيد الحجز (Celebratory Arpeggio)
   */
  playSuccessChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (أوتار النصر والاحتفال)
      notes.forEach((freq, idx) => {
        const startTime = this.audioCtx.currentTime + (idx * 0.08);
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {
      console.warn('Success chime skipped:', e);
    }
  }

  /**
   * 3. نغمة لمس هادئة للأزرار والتبويبات (Soft Tactile Click)
   */
  playSoftClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // تجاهل أخطاء التفاعل التلقائي
    }
  }

  /**
   * تبديل كتم الصوت وحفظ التفضيل
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('jt_sound_muted', this.isMuted ? 'true' : 'false');
    return this.isMuted;
  }
}

export const audioService = new AudioService();