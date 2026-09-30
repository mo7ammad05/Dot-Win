

import { store } from '../../state/store.js';

export class AdminAuthGate {
  /**
   * @param {Object} options
   * @param {Function} options.onAuthenticated - دالة الاستدعاء عند نجاح المصادقة
   * @param {Function} options.onCancel - دالة الاستدعاء عند إلغاء الدخول والرجوع
   */
  constructor({ onAuthenticated = () => {}, onCancel = () => {} } = {}) {
    this.onAuthenticated = onAuthenticated;
    this.onCancel = onCancel;
    this.masterKey = 'Dotwin511$'; // المفتاح الأمني المعتمد للإدارة
    this.sessionStorageKey = 'jt_admin_master_session';
  }

  /**
   * فحص ما إذا كان المدير مسجل دخوله ومصادقاً عليه حالياً
   * @returns {boolean}
   */
  isAuthenticated() {
    try {
      const token = sessionStorage.getItem(this.sessionStorageKey);
      return token === btoa(this.masterKey + '_verified_admin');
    } catch (e) {
      return false;
    }
  }

  /**
   * تسجيل الخروج وإلغاء جلسة الإدارة
   */
  logout() {
    sessionStorage.removeItem(this.sessionStorageKey);
    window.location.reload();
  }

  /**
   * تعيين جلسة الإدارة المعتمدة
   */
  setSession() {
    try {
      sessionStorage.setItem(this.sessionStorageKey, btoa(this.masterKey + '_verified_admin'));
    } catch (e) {
      console.warn('Session storage error:', e);
    }
  }

  /**
   * رسم واجهة بوابة حماية الأدمن وإخفاء محتوى اللوحة حتى التحقق
   * @param {HTMLElement} container - العنصر الحاوي
   */
  renderGate(container) {
    if (!container) return;

    const isAr = store.language === 'ar';

    container.innerHTML = `
      <div class="min-h-[75vh] flex items-center justify-center px-4 py-12 select-none animate-in fade-in duration-300">
        <div class="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-floating-modal relative overflow-hidden">
          
          <!-- شريط التوهج الأمني العلوي -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D97706] via-[#C86D51] to-purple-600"></div>

          <!-- الرأس والأيقونة -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            
            <span class="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-3 py-0.5 rounded-full inline-block mb-2">
              RESTRICTED ADMIN ACCESS
            </span>
            
            <h2 class="text-2xl font-extrabold text-[#1E293B] font-arabic">
              ${isAr ? 'بوابة إدارة منصة جولة في الأردن' : 'Jordan Tour Admin Portal'}
            </h2>
            
            <p class="text-xs text-[#64748B] mt-1.5 leading-relaxed font-sans">
              ${
                isAr
                  ? 'هذه اللوحة محمية وخاصة بالإدارة المركزية. يرجى إدخال كلمة المرور المعتمدة للدخول.'
                  : 'This portal is restricted to authorized operations. Please enter the master admin key.'
              }
            </p>
          </div>

          <!-- رسالة الخطأ التنبيهية -->
          <div id="admin-auth-error-box" class="hidden mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
            <span>⚠️</span>
            <span>${isAr ? 'كلمة المرور غير صحيحة! يرجى التأكد من الرمز والمحاولة مجدداً.' : 'Incorrect password! Access denied.'}</span>
          </div>

          <!-- نموذج إدخال كلمة المرور -->
          <form id="admin-auth-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-[#1E293B] mb-1.5">
                ${isAr ? 'كلمة المرور الإدارية (Admin Password):' : 'Admin Security Key:'}
              </label>
              
              <div class="relative">
                <input
                  type="password"
                  id="admin-password-input"
                  autofocus
                  required
                  placeholder="••••••••••••"
                  class="w-full bg-[#FAF8F5] border border-[#E2E8F0] focus:border-[#C86D51] rounded-xl px-4 py-3 text-sm text-[#1E293B] font-mono tracking-wider focus:outline-none transition-all shadow-inner pe-16"
                />
                
                <button
                  type="button"
                  id="toggle-pwd-visibility-btn"
                  class="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ${isAr ? 'إظهار' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full bg-[#1E293B] hover:bg-[#C86D51] text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>${isAr ? 'الدخول إلى لوحة الإدارة' : 'Unlock Admin Portal'}</span>
              <span>${isAr ? '←' : '→'}</span>
            </button>

            <button
              type="button"
              id="admin-auth-cancel-btn"
              class="w-full text-center text-xs font-semibold text-[#64748B] hover:text-[#1E293B] pt-2 cursor-pointer"
            >
              ${isAr ? 'الرجوع إلى الموقع الرئيسي' : 'Return to Website'}
            </button>
          </form>

        </div>
      </div>
    `;

    // ربط الأحداث
    const form = container.querySelector('#admin-auth-form');
    const pwdInput = container.querySelector('#admin-password-input');
    const errorBox = container.querySelector('#admin-auth-error-box');
    const toggleBtn = container.querySelector('#toggle-pwd-visibility-btn');
    const cancelBtn = container.querySelector('#admin-auth-cancel-btn');

    let showPassword = false;
    toggleBtn?.addEventListener('click', () => {
      showPassword = !showPassword;
      if (pwdInput) {
        pwdInput.type = showPassword ? 'text' : 'password';
      }
      if (toggleBtn) {
        toggleBtn.textContent = showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show');
      }
    });

    pwdInput?.addEventListener('input', () => {
      errorBox?.classList.add('hidden');
    });

    cancelBtn?.addEventListener('click', () => {
      if (this.onCancel) {
        this.onCancel();
      } else {
        window.location.href = 'index.html';
      }
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = pwdInput?.value;

      if (entered === this.masterKey) {
        errorBox?.classList.add('hidden');
        this.setSession();
        this.onAuthenticated();
      } else {
        errorBox?.classList.remove('hidden');
        if (pwdInput) {
          pwdInput.value = '';
          pwdInput.focus();
        }
      }
    });
  }
}/**
 * 🇯🇴 منصة مستكشف الأردن | Jordan Explorer
 * وحدة حماية وبوابة مصادقة المشرف (Admin Authentication Gate)
 * مسار الملف: js/modules/admin/admin.auth.js
 * كود نقي 100% بدون أي أطر عمل أو ريأكت
 */

export const AdminAuth = {
  // الرمز السري المعتمد للمشرف (المطابق لمنظومة المشروع الأصلية)
  SECRET_PASSCODE: '2026',
  SESSION_STORAGE_KEY: 'jordan_admin_auth',

  /**
   * التحقق مما إذا كان المشرف مسجل دخوله حالياً في الجلسة
   * @returns {boolean}
   */
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    
    // التحقق من الجلسة الحالية
    const sessionAuth = sessionStorage.getItem(this.SESSION_STORAGE_KEY) === 'true';
    if (sessionAuth) return true;

    // فحص الرابط المباشر للتخويل السريع المعتمد في المسابقة
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (path.includes('dotadminwin26') || hash === 'dotadminwin26') {
      this.setSessionAuthenticated(true);
      return true;
    }

    return false;
  },

  /**
   * تسجيل دخول المشرف بالرمز السري
   * @param {string} inputCode 
   * @returns {{ success: boolean, message: string }}
   */
  login(inputCode) {
    const cleanCode = (inputCode || '').trim();
    
    if (cleanCode === this.SECRET_PASSCODE || cleanCode === 'dotadminwin26') {
      this.setSessionAuthenticated(true);
      return {
        success: true,
        message: 'تم التحقق من صلاحية المشرف بنجاح! مرحباً بك في لوحة الإدارة.'
      };
    }

    return {
      success: false,
      message: 'رمز الدخول السري غير صحيح! يرجى التأكد من الرمز والمحاولة مجدداً.'
    };
  },

  /**
   * تثبيت حالة الدخول في SessionStorage
   * @param {boolean} status 
   */
  setSessionAuthenticated(status) {
    if (typeof window === 'undefined') return;
    if (status) {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    }
  },

  /**
   * تسجيل الخروج وإعادة التوجيه للصفحة الرئيسية
   */
  logout() {
    this.setSessionAuthenticated(false);
    window.location.href = 'index.html';
  },

  /**
   * فحص فوري عند فتح صفحة الأدمن: إذا لم يكن مسجلاً يطلب الرمز أو يوجه للرئيسية
   * @returns {boolean}
   */
  enforceProtection() {
    if (this.isAuthenticated()) {
      return true;
    }

    const enteredCode = prompt('🔒 منطقة مشرفة ومحمية: أدخل رمز الدخول السري للمنصة (الرمز الافتراضي: 2026):');
    
    if (enteredCode !== null) {
      const result = this.login(enteredCode);
      if (result.success) {
        return true;
      } else {
        alert(result.message);
      }
    }

    // إعادة التوجيه للرئيسية في حال الفشل أو الإلغاء
    window.location.href = 'index.html';
    return false;
  }
};