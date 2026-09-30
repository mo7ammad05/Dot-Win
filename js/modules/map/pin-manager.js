/**
 * 🇯🇴 Jordan Tour - Interactive Map Pin Manager Module
 * مسار الملف: js/modules/map/pin-manager.js
 * يدير دبابيس المحافظات الـ 12 على الخريطة التفاعلية، النغمة الصوتية، والتحديد اللحظي
 */

import { store } from '../../state/store.js';

export class PinManager {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - حاوية الخريطة التي ستحتوي الدبابيس
   * @param {Array} options.governorates - مصفوفة المحافظات الـ 12
   * @param {Function} options.onSelect - دالة استدعاء عند اختيار محافظة
   */
  constructor({ container, governorates = [], onSelect = () => {} }) {
    this.container = container;
    this.governorates = governorates;
    this.onSelect = onSelect;
    this.selectedGovId = 'amman';
    this.audioCtx = null;
  }

  /**
   * تشغيل نغمة صوتية تفاعلية (Web Audio API) بترددات D5 -> A5 عند النقر على الدبوس
   */
  playPinChime() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // الانتقال الترددي السلس من نغمة D5 إلى A5
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio chime note:', e.message);
    }
  }

  /**
   * تحديد المحافظة النشطة وتحديث الدبابيس مع تشغيل الصوت
   * @param {string} govId
   */
  selectGovernorate(govId, triggerSound = true) {
    this.selectedGovId = govId;
    if (triggerSound) {
      this.playPinChime();
    }

    const foundGov = this.governorates.find((g) => g.id === govId) || this.governorates[0];
    this.updateActivePinStyles();
    this.onSelect(foundGov);
  }

  /**
   * رسم دبابيس المحافظات الـ 12 بالكامل على حاوية الخريطة
   */
  render() {
    if (!this.container) return;

    // إزالة أي دبابيس سابقة
    this.container.querySelectorAll('.jt-map-pin').forEach((el) => el.remove());

    const isArabic = (store.language === 'ar');

    this.governorates.forEach((gov) => {
      const isSelected = (gov.id === this.selectedGovId);
      const name = isArabic ? (gov.name?.ar || gov.name) : (gov.name?.en || gov.name);

      const pinBtn = document.createElement('button');
      pinBtn.type = 'button';
      pinBtn.className = `jt-map-pin absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition-transform z-20 cursor-pointer ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-115'
      }`;
      pinBtn.dataset.govId = gov.id;
      pinBtn.style.top = gov.pinPosition?.top || '50%';
      pinBtn.style.left = gov.pinPosition?.left || '50%';
      pinBtn.setAttribute('title', name);

      pinBtn.innerHTML = `
        <div class="flex flex-col items-center select-none pointer-events-none">
          <div class="pin-icon-box w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xl transition-all ${
            isSelected
              ? 'bg-[#C86D51] text-white ring-4 ring-[#C86D51]/50 scale-110 shadow-lg shadow-rose-600/40'
              : 'bg-white text-[#1E293B] hover:bg-[#FAF8F5] border border-slate-300'
          }">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <span class="pin-label mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap transition-all ${
            isSelected
              ? 'bg-[#D97706] text-white font-extrabold ring-2 ring-white/50 scale-105'
              : 'bg-slate-900/90 text-white/95 border border-white/20'
          }">
            ${name}
          </span>
        </div>
      `;

      pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectGovernorate(gov.id, true);
      });

      this.container.appendChild(pinBtn);
    });

    this.updateActivePinStyles();
  }

  /**
   * تحديث كلاسات المظهر للدبوس المختار والدبابيس الأخرى دون إعادة رسم الـ DOM
   */
  updateActivePinStyles() {
    if (!this.container) return;

    this.container.querySelectorAll('.jt-map-pin').forEach((btn) => {
      const isSelected = (btn.dataset.govId === this.selectedGovId);
      const iconBox = btn.querySelector('.pin-icon-box');
      const label = btn.querySelector('.pin-label');

      if (isSelected) {
        btn.classList.add('scale-125', 'z-30');
        btn.classList.remove('hover:scale-115');

        if (iconBox) {
          iconBox.className = 'pin-icon-box w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xl transition-all bg-[#C86D51] text-white ring-4 ring-[#C86D51]/50 scale-110 shadow-lg shadow-rose-600/40';
        }
        if (label) {
          label.className = 'pin-label mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap transition-all bg-[#D97706] text-white font-extrabold ring-2 ring-white/50 scale-105';
        }
      } else {
        btn.classList.remove('scale-125', 'z-30');
        btn.classList.add('hover:scale-115');

        if (iconBox) {
          iconBox.className = 'pin-icon-box w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xl transition-all bg-white text-[#1E293B] hover:bg-[#FAF8F5] border border-slate-300';
        }
        if (label) {
          label.className = 'pin-label mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap transition-all bg-slate-900/90 text-white/95 border border-white/20';
        }
      }
    });
  }

  /**
   * تحديث بيانات المحافظات (مثلاً بعد جلبها من Firestore أو تعديلها من لوحة الإدارة)
   * @param {Array} newGovernorates
   */
  setGovernorates(newGovernorates) {
    this.governorates = newGovernorates;
    this.render();
  }
}