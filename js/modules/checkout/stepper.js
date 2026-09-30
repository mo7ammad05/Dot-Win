/**
 * 🇯🇴 مدير خطوات الحجز والـ Stepper لمنصة Jordan Tour (Booking Stepper Controller)
 * يدير التنقل المتسلسل، شريط التقدم، وفحص صحة البيانات قبل الانتقال
 */

export class BookingStepper {
  constructor(totalSteps = 4) {
    this.totalSteps = totalSteps;
    this.currentStep = 1;
    this.listeners = [];
  }

  /**
   * الانتقال إلى خطوة محددة مع التحقق والتحديث البصري
   * @param {number} step رقم الخطوة (1 - 4)
   * @param {boolean} skipValidation تجاوز التحقق (اختياري)
   */
  goTo(step, skipValidation = false) {
    if (step < 1 || step > this.totalSteps) return false;

    // فحص صحة بيانات الخطوة الحالية قبل التقدم للأمام
    if (!skipValidation && step > this.currentStep) {
      if (!this.validateCurrentStep()) return false;
    }

    this.currentStep = step;
    this.updateDomView();
    this.notifyListeners(step);

    // التمرير السلس لأعلى منطقة النموذج
    window.scrollTo({ top: 120, behavior: 'smooth' });
    return true;
  }

  next() {
    return this.goTo(this.currentStep + 1);
  }

  prev() {
    return this.goTo(this.currentStep - 1, true);
  }

  /**
   * التحقق من اكتمال حقول كل خطوة
   */
  validateCurrentStep() {
    if (this.currentStep === 1) {
      const dateIn = document.getElementById('ck-date-input');
      if (!dateIn || !dateIn.value) {
        alert('يرجى تحديد تاريخ الرحلة المفضل.');
        return false;
      }
      return true;
    }

    if (this.currentStep === 2) {
      const name = document.getElementById('traveler-name')?.value.trim();
      const email = document.getElementById('traveler-email')?.value.trim();
      const phone = document.getElementById('traveler-phone')?.value.trim();

      if (!name) {
        alert('يرجى كتابة الاسم الكامل للمسافر الرئيسي.');
        return false;
      }
      if (!email || !email.includes('@')) {
        alert('يرجى إدخال بريد إلكتروني صالح لاستلام التذكرة.');
        return false;
      }
      if (!phone || phone.length < 8) {
        alert('يرجى إدخال رقم هاتف صحيح للتواصل وتأكيد الحجز.');
        return false;
      }
      return true;
    }

    return true;
  }

  /**
   * تحديث واجهة الـ DOM (الألواح، الأزرار، وشريط التقدم)
   */
  updateDomView() {
    // 1. تحديث ألواح الخطوات
    for (let i = 1; i <= this.totalSteps; i++) {
      const pane = document.getElementById(`step-pane-${i}`);
      const btn = document.getElementById(`step-btn-${i}`);

      if (pane) {
        pane.classList.toggle('hidden', i !== this.currentStep);
      }

      if (btn) {
        if (i === this.currentStep) {
          btn.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm bg-[#C86D51] text-white ring-4 ring-[#C86D51]/20 scale-110 shadow-md";
          btn.textContent = i;
        } else if (i < this.currentStep) {
          btn.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm bg-emerald-600 text-white shadow-md";
          btn.textContent = "✓";
        } else {
          btn.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm bg-white text-slate-400 border border-[#E2E8F0] shadow-md";
          btn.textContent = i;
        }
      }
    }

    // 2. تحديث عرض شريط التقدم البرتقالي
    const progressBar = document.getElementById('stepper-progress-bar');
    if (progressBar) {
      const percent = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
      progressBar.style.width = `${percent}%`;
    }

    // 3. في الخطوة 4 (التذكرة): إخفاء الملخص الجانبي لضمان تنسيق طباعة نظيف
    const sidebar = document.getElementById('checkout-sidebar-summary');
    if (sidebar) {
      sidebar.classList.toggle('hidden', this.currentStep === 4);
    }
  }

  onStepChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  notifyListeners(step) {
    this.listeners.forEach(cb => cb(step));
  }
}

export const stepper = new BookingStepper(4);