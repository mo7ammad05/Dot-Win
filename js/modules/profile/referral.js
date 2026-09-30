/**
 * 🇯🇴 Jordan Tour - Referral & Rewards Engine Module
 * مسار الملف: js/modules/profile/referral.js
 * يدير أكواد الدعوة، احتساب مكافآت الإحالة، تطبيق أكواد الأصدقاء، والخصومات
 */

import { store } from '../../state/store.js';

export class ReferralManager {
  /**
   * @param {Object} options
   * @param {Object} options.pointsSettings - إعدادات وقواعد النقاط
   * @param {Function} options.onPointsUpdated - استدعاء عند تحديث رصيد النقاط
   */
  constructor({
    pointsSettings = {
      referredUserPoints: 100,
      referrerPoints: 150,
      referralDiscountJOD: 5,
    },
    onPointsUpdated = () => {},
  } = {}) {
    this.pointsSettings = pointsSettings;
    this.onPointsUpdated = onPointsUpdated;
  }

  /**
   * جلب رمز الإحالة الخاص بالمستخدم الحالي
   * @returns {string}
   */
  getUserReferralCode() {
    if (store.user && store.user.referralCode) {
      return store.user.referralCode.toUpperCase();
    }
    const saved = localStorage.getItem('jt_user_referral_code');
    if (saved) return saved.toUpperCase();

    // توليد كود فريد تلقائياً إذا لم يتوفر
    const randomCode = `JO-EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('jt_user_referral_code', randomCode);
    return randomCode;
  }

  /**
   * نسخ رمز الإحالة إلى الحافظة
   * @returns {Promise<boolean>}
   */
  async copyReferralCode() {
    const code = this.getUserReferralCode();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        return true;
      }
      // طريقة احتياطية للمتصفحات القديمة
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      console.warn('Copy failed:', err);
      return false;
    }
  }

  /**
   * مشاركة رابط الإحالة عبر Web Share API أو نسخه
   */
  async shareReferralLink() {
    const code = this.getUserReferralCode();
    const shareUrl = `${window.location.origin}/index.html?ref=${code}`;
    const isAr = store.language === 'ar';

    const shareData = {
      title: isAr ? 'انضم إلى منصة جولة في الأردن' : 'Join Jordan Tour Platform',
      text: isAr
        ? `سجل في منصة مستكشف الأردن باستخدام كود الإحالة (${code}) واحصل فوراً على +${this.pointsSettings.referredUserPoints} نقطة ولاء وخصم ${this.pointsSettings.referralDiscountJOD} دنانير على حجزك القادم! 🇯🇴✨`
        : `Register on Jordan Tour using my referral code (${code}) to get +${this.pointsSettings.referredUserPoints} loyalty points and ${this.pointsSettings.referralDiscountJOD} JOD discount! 🇯🇴✨`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return await this.copyReferralCode();
    }
  }

  /**
   * التحقق من وتطبيق رمز إحالة صديق للمستخدم الحالي
   * @param {string} inputCode - رمز الإحالة المدخل
   * @returns {Object} نتيجة المحاولة { success: boolean, message: string }
   */
  async applyFriendReferralCode(inputCode) {
    const isAr = store.language === 'ar';
    const cleanCode = (inputCode || '').trim().toUpperCase();

    if (!cleanCode) {
      return {
        success: false,
        message: isAr ? 'يرجى إدخال رمز الإحالة أولاً.' : 'Please enter a referral code.',
      };
    }

    // منع استخدام الكود الشخصي
    const myCode = this.getUserReferralCode();
    if (cleanCode === myCode) {
      return {
        success: false,
        message: isAr
          ? 'عذراً، لا يمكنك استخدام رمز الإحالة الخاص بك!'
          : 'You cannot use your own referral code!',
      };
    }

    // التحقق مما إذا كان قد استخدم كود إحالة سابقاً
    const hasApplied = localStorage.getItem('jt_applied_referral_code');
    if (hasApplied) {
      return {
        success: false,
        message: isAr
          ? `لقد قمت بالفعل بتفعيل كود إحالة سابقاً (${hasApplied}). يُسمح بكود ترحيبي واحد لكل حساب.`
          : `You have already redeemed a referral code (${hasApplied}).`,
      };
    }

    const earnedPoints = this.pointsSettings.referredUserPoints || 100;
    const discountJOD = this.pointsSettings.referralDiscountJOD || 5;

    // حفظ الكود المطبق محلياً
    localStorage.setItem('jt_applied_referral_code', cleanCode);
    localStorage.setItem('jt_referral_discount_active', 'true');

    // تحديث رصيد المستخدم
    if (store.user) {
      store.user.xp = (store.user.xp || 0) + earnedPoints;
      // تحديث سحابي
      if (window.JordanFirebase && window.JordanFirebase.db) {
        try {
          await window.JordanFirebase.db.collection('users').doc(store.user.uid).set(
            {
              xp: store.user.xp,
              redeemedReferralCode: cleanCode,
              referralDiscountActive: true,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn('Cloud sync error for referral:', e);
        }
      }
    }

    this.onPointsUpdated(earnedPoints);
    window.dispatchEvent(
      new CustomEvent('points-updated', {
        detail: { addedPoints: earnedPoints, newTotal: store.user?.xp || 1450 },
      })
    );

    return {
      success: true,
      message: isAr
        ? `مبروك! تم تفعيل رمز الإحالة (${cleanCode}) بنجاح. حصلت على +${earnedPoints} نقطة ولاء وخصم مباشر ${discountJOD} د.أ على حجزك القادم! 🎁`
        : `Congratulations! Code (${cleanCode}) applied. You received +${earnedPoints} points and ${discountJOD} JOD discount! 🎁`,
    };
  }

  /**
   * رسم بطاقة كود الإحالة والمكافآت داخل الحاوية
   * @param {HTMLElement} container
   */
  renderReferralCard(container) {
    if (!container) return;

    const isAr = store.language === 'ar';
    const myCode = this.getUserReferralCode();
    const referredPts = this.pointsSettings.referredUserPoints || 100;
    const referrerPts = this.pointsSettings.referrerPoints || 150;
    const discountJOD = this.pointsSettings.referralDiscountJOD || 5;

    container.innerHTML = `
      <div class="bg-gradient-to-br from-[#1E293B] via-[#2A3B53] to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#E5C598] shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
        
        <!-- التوهج الخلفي -->
        <div class="absolute top-0 end-0 -mt-10 -mr-10 w-44 h-44 bg-[#D97706]/15 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 space-y-5">
          <!-- الرأس -->
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-[#D97706]/20 border border-[#D97706] text-[#FDE68A] flex items-center justify-center font-bold text-xl shadow shrink-0">
              👑
            </div>
            <div>
              <h3 class="text-xl sm:text-2xl font-black text-white">
                ${isAr ? 'رمز الإحالة والمكافآت الحصري لك' : 'Your Official Referral Code'}
              </h3>
              <span class="text-xs text-[#E5C598]">
                ${isAr ? 'شارك هذا الكود مع أصدقائك واكسب نقاطاً وخصومات حقيقية' : 'Share with friends to earn points & discounts'}
              </span>
            </div>
          </div>

          <!-- صندوق الكود وزر النسخ والمشاركة -->
          <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span class="text-[10px] font-mono text-slate-300 uppercase tracking-widest block mb-0.5">
                ${isAr ? 'كود الدعوة المعتمد' : 'OFFICIAL REFERRAL CODE'}
              </span>
              <span class="font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#FDE68A]">
                ${myCode}
              </span>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                id="btn-copy-referral-code"
                class="flex-1 sm:flex-initial bg-[#D97706] hover:bg-[#B45309] active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
              >
                <span>📋</span>
                <span id="copy-btn-text">${isAr ? 'نسخ الكود' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                id="btn-share-referral-link"
                class="bg-white/15 hover:bg-white/25 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/20 cursor-pointer"
                title="${isAr ? 'مشاركة الرابط' : 'Share Link'}"
              >
                <span>🔗</span>
                <span>${isAr ? 'مشاركة' : 'Share'}</span>
              </button>
            </div>
          </div>

          <!-- شرح الفوائد والمكافآت المعتمدة -->
          <div class="pt-4 border-t border-white/10 space-y-3">
            <h4 class="font-extrabold text-xs sm:text-sm text-[#E5C598] flex items-center gap-2">
              <span>✨</span>
              <span>${isAr ? 'المكافآت والحوافز التي تحصل عليها أنت وصديقك:' : 'Rewards & Perks for You & Friends:'}</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span class="text-[#FDE68A] font-black text-sm block">
                  +${referrerPts} نقطة ولاء 🪙
                </span>
                <p class="text-slate-300 text-[11px] leading-snug">
                  ${isAr ? 'تضاف لمحفظتك لكل صديق يقوم بإنشاء حساب جديد باستخدام كودك.' : 'Credited to your balance for each friend who signs up with your code.'}
                </p>
              </div>

              <div class="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span class="text-[#FDE68A] font-black text-sm block">
                  خصم ${discountJOD} دنانير 🏷️
                </span>
                <p class="text-slate-300 text-[11px] leading-snug">
                  ${isAr ? 'خصم مالي فوري يُطبق في صفحة الدفع لحجز رحلتك القادمة.' : 'Instant cash discount applied at CliQ checkout for your next trip.'}
                </p>
              </div>

              <div class="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span class="text-[#FDE68A] font-black text-sm block">
                  هدية ترحيب لصديقك 🎁
                </span>
                <p class="text-slate-300 text-[11px] leading-snug">
                  ${isAr ? `صديقك يحصل فوراً على +${referredPts} نقطة ترحيبية وخصم ${discountJOD} د.أ عند التسجيل.` : `Your friend gets +${referredPts} welcome bonus points and ${discountJOD} JOD discount.`}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    // ربط أزرار النسخ والمشاركة
    const copyBtn = container.querySelector('#btn-copy-referral-code');
    const copyBtnText = container.querySelector('#copy-btn-text');
    const shareBtn = container.querySelector('#btn-share-referral-link');

    copyBtn?.addEventListener('click', async () => {
      const ok = await this.copyReferralCode();
      if (ok && copyBtnText) {
        copyBtnText.textContent = isAr ? 'تم النسخ بنجاح! ✓' : 'Copied! ✓';
        setTimeout(() => {
          copyBtnText.textContent = isAr ? 'نسخ الكود' : 'Copy Code';
        }, 2500);
      }
    });

    shareBtn?.addEventListener('click', async () => {
      await this.shareReferralLink();
    });
  }

  /**
   * رسم نموذج إدخال كود إحالة صديق (Redeem Friend Code Form)
   * @param {HTMLElement} container
   */
  renderRedeemCard(container) {
    if (!container) return;

    const isAr = store.language === 'ar';
    const appliedCode = localStorage.getItem('jt_applied_referral_code');
    const referredPts = this.pointsSettings.referredUserPoints || 100;
    const discountJOD = this.pointsSettings.referralDiscountJOD || 5;

    container.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-4 animate-in fade-in duration-300">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
            🎁
          </div>
          <div>
            <h4 class="font-extrabold text-sm sm:text-base text-slate-900">
              ${isAr ? 'هل تمت دعوتك من قِبل صديق؟ أدخل رمز الإحالة هنا' : 'Have a Friend’s Referral Code?'}
            </h4>
            <p class="text-xs text-slate-500">
              ${isAr ? `أدخل كود صديقك لتحصل فوراً على +${referredPts} نقطة ولاء وخصم ${discountJOD} دنانير!` : `Enter friend's code to get +${referredPts} points & ${discountJOD} JOD off!`}
            </p>
          </div>
        </div>

        ${
          appliedCode
            ? `
          <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <span class="text-base">✅</span>
            <span>${isAr ? `لقد قمت بتفعيل رمز الإحالة (${appliedCode}) بنجاح! رصيدك والخصم مفعلان.` : `Referral code (${appliedCode}) is active!`}</span>
          </div>
        `
            : `
          <form id="redeem-referral-form" class="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <input
              type="text"
              id="redeem-code-input"
              placeholder="${isAr ? 'أدخل كود الإحالة هنا (مثال: SH3SHER2026)' : 'Enter referral code here'}"
              class="flex-1 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C86D51] uppercase"
              required
            />
            <button
              type="submit"
              class="w-full sm:w-auto bg-[#1E293B] hover:bg-slate-800 active:scale-95 text-white font-bold px-7 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition-all shrink-0 cursor-pointer"
            >
              <span>✨</span>
              <span>${isAr ? 'تفعيل واستلام الهدية' : 'Claim Reward'}</span>
            </button>
          </form>
          <div id="redeem-feedback" class="text-xs font-bold pt-1 empty:hidden"></div>
        `
        }
      </div>
    `;

    const form = container.querySelector('#redeem-referral-form');
    const input = container.querySelector('#redeem-code-input');
    const feedback = container.querySelector('#redeem-feedback');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = input?.value?.trim();
      if (!code) return;

      const res = await this.applyFriendReferralCode(code);
      if (feedback) {
        feedback.className = `text-xs font-bold pt-1 p-3 rounded-xl border ${
          res.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`;
        feedback.textContent = res.message;
      }

      if (res.success) {
        setTimeout(() => this.renderRedeemCard(container), 2000);
      }
    });
  }
}