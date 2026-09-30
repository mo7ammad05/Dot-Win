

import { FirebaseService } from '../../services/firebase.service.js';
import { appStore } from '../../state/store.js';
import { Storage, STORAGE_KEYS } from '../../state/storage.js';

export const AdminPoints = {
  // سجل المحاكاة التفاعلية الحي
  simulationLogs: [],
  simulatedPostCount: 2,

  /**
   * بناء الواجهة الكاملة لقواعد النقاط والإحالات والمحاكي والمنح اليدوي
   * @param {Object} settings 
   * @param {Array} transactions 
   * @returns {string} HTML
   */
  renderFullView(settings = {}, transactions = []) {
    const s = {
      referredUserPoints: settings.referredUserPoints ?? 100,
      referrerPoints: settings.referrerPoints ?? 150,
      postPoints: settings.postPoints ?? 25,
      maxMonthlyPostsPerUser: settings.maxMonthlyPostsPerUser ?? 5,
      isMonthlyPostLimitActive: settings.isMonthlyPostLimitActive ?? true,
      referralDiscountJOD: settings.referralDiscountJOD ?? 5
    };

    return `
      <div class="space-y-8 animate-in fade-in duration-200">
        
        <!-- الترويسة وبانر التحكم العام -->
        <div class="bg-gradient-to-r from-[#1E293B] via-[#2D3748] to-[#1E293B] rounded-3xl p-6 sm:p-8 text-white border-2 border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <span>🪙</span>
              <span>نظام النقاط والمكافآت والحد الشهري</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black">
              إدارة نقاط الإحالات ومنشورات منتدى السياح
            </h2>
            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تحكم دقيق بقواعد منح النقاط للمسجلين الجدد عبر الإحالة، مكافأة أصحاب الرموز، نقاط نشر المقالات، وتحديد سقف شهري لكل مستخدم لمنع التكرار والإغراق.
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="reset-points-defaults-btn"
              class="px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <span>الافتراضي 🔄</span>
            </button>
            <button
              type="button"
              id="save-points-rules-btn"
              class="px-6 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B45A3E] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <span>حفظ الإعدادات سحابياً 💾</span>
            </button>
          </div>
        </div>

        <!-- بطاقات الملخص الـ 4 السريعة -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
              👥
            </div>
            <div>
              <span class="text-[11px] font-bold text-slate-400 block">نقاط المسجل الجديد</span>
              <div class="text-xl font-black text-slate-900 mt-0.5">
                +${s.referredUserPoints} <span class="text-xs font-bold text-emerald-600">نقطة</span>
              </div>
              <span class="text-[10px] text-slate-400">هدية ترحيبية فورية</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-xl shrink-0">
              👑
            </div>
            <div>
              <span class="text-[11px] font-bold text-slate-400 block">نقاط صاحب كود الإحالة</span>
              <div class="text-xl font-black text-slate-900 mt-0.5">
                +${s.referrerPoints} <span class="text-xs font-bold text-amber-600">نقطة</span>
              </div>
              <span class="text-[10px] text-slate-400">لكل دعوة صديق ناجحة</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-[#C86D51] flex items-center justify-center font-bold text-xl shrink-0">
              ✍️
            </div>
            <div>
              <span class="text-[11px] font-bold text-slate-400 block">مكافأة نشر تجربة بالمنتدى</span>
              <div class="text-xl font-black text-slate-900 mt-0.5">
                +${s.postPoints} <span class="text-xs font-bold text-[#C86D51]">نقطة</span>
              </div>
              <span class="text-[10px] text-slate-400">تمنح عند اعتماد القصة</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
              🛡️
            </div>
            <div>
              <span class="text-[11px] font-bold text-slate-400 block">سقف المنشورات الشهري</span>
              <div class="text-xl font-black text-slate-900 mt-0.5">
                ${s.isMonthlyPostLimitActive ? `${s.maxMonthlyPostsPerUser} منشورات` : 'غير محدود ∞'}
              </div>
              <span class="text-[10px] text-slate-400">
                ${s.isMonthlyPostLimitActive ? 'حماية من التكرار مفعلة' : 'الحماية معطلة'}
              </span>
            </div>
          </div>
        </div>

        <!-- نموذج إعدادات القواعد الكامل (عامودان متناسقان) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- عامود 1: إعدادات الإحالة والمكافآت -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-6">
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <span class="text-2xl">👥</span>
              <div>
                <h3 class="font-extrabold text-base text-slate-900">إعدادات نظام الإحالة (Referral Rules)</h3>
                <p class="text-xs text-slate-400">تحديد النقاط والخصومات التلقائية للداعي والمدعو</p>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <label class="font-bold text-slate-800">1. نقاط الشخص المسجل عبر الإحالة (المدعو):</label>
                <span class="font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+${s.referredUserPoints} نقطة</span>
              </div>
              <input
                type="number"
                id="pts-referred-user-in"
                value="${s.referredUserPoints}"
                min="0"
                step="10"
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none"
              />
              <p class="text-[11px] text-slate-500">تضاف فوراً لرصيد المستخدم الجديد عند تسجيله بكود إحالة أو إدخاله في حسابه.</p>
            </div>

            <div class="space-y-2 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between text-xs">
                <label class="font-bold text-slate-800">2. نقاط صاحب كود الإحالة (الداعي):</label>
                <span class="font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">+${s.referrerPoints} نقطة</span>
              </div>
              <input
                type="number"
                id="pts-referrer-in"
                value="${s.referrerPoints}"
                min="0"
                step="10"
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none"
              />
              <p class="text-[11px] text-slate-500">تضاف لرصيد صاحب الكود في كل مرة يسجل فيها صديق جديد برمز دعوته.</p>
            </div>

            <div class="space-y-2 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between text-xs">
                <label class="font-bold text-slate-800">3. الخصم المالي المباشر للإحالة (بالدينار JOD):</label>
                <span class="font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">${s.referralDiscountJOD} د.أ</span>
              </div>
              <input
                type="number"
                id="pts-discount-jod-in"
                value="${s.referralDiscountJOD}"
                min="0"
                max="50"
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none"
              />
              <p class="text-[11px] text-slate-500">يُطبق هذا الخصم تلقائياً عند حجز أول رحلة للمستخدم الجديد في صفحة كليك.</p>
            </div>
          </div>

          <!-- عامود 2: إعدادات المنتدى وسقف المنشورات الشهري -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-6">
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <span class="text-2xl">💬</span>
              <div>
                <h3 class="font-extrabold text-base text-slate-900">منتدى السياح وسقف المنشورات الشهري</h3>
                <p class="text-xs text-slate-400">مكافأة نشر القصص والحد الأقصى لكل مستخدم شهرياً</p>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <label class="font-bold text-slate-800">4. نقاط نشر منشور تجربة سياحية:</label>
                <span class="font-mono font-black text-[#C86D51] bg-rose-50 px-2 py-0.5 rounded-full">+${s.postPoints} نقطة</span>
              </div>
              <input
                type="number"
                id="pts-post-reward-in"
                value="${s.postPoints}"
                min="0"
                step="5"
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none"
              />
              <p class="text-[11px] text-slate-500">تمنح للمستكشف مباشرة عند نشر واعتماد تجربته السياحية في منتدى المسافرين.</p>
            </div>

            <div class="space-y-4 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-xs font-bold text-slate-800 block">5. تفعيل سقف المنشورات شهرياً لكل مستخدم:</label>
                  <span class="text-[11px] text-slate-400">حماية المنصة من إغراق المنشورات المتكررة</span>
                </div>
                <input
                  type="checkbox"
                  id="pts-limit-active-toggle"
                  ${s.isMonthlyPostLimitActive ? 'checked' : ''}
                  class="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div class="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <label class="font-bold text-slate-700 block">الحد الأقصى المسموح به لكل مستخدم في الشهر:</label>
                <input
                  type="number"
                  id="pts-max-posts-in"
                  value="${s.maxMonthlyPostsPerUser}"
                  min="1"
                  max="100"
                  class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-sm font-bold text-blue-600"
                />
                <span class="text-[11px] text-slate-500 block">إذا حاول أي مستخدم نشر المنشور رقم (${s.maxMonthlyPostsPerUser + 1})، يرفض النظام النشر بلطف لحين بداية الشهر التالي.</span>
              </div>
            </div>
          </div>

        </div>

        <!-- محاكي واختبار القواعد الفوري (Live Rules Simulator) -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-700 shadow-xl space-y-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⚡</span>
              <div>
                <h3 class="font-extrabold text-base text-white">محاكي واختبار القواعد الفوري (Live Rules Simulator)</h3>
                <p class="text-xs text-slate-400">جرّب آلية احتساب النقاط وسقف المنشورات للتأكد من عمل المنظومة</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">جاهز للاختبار ✓</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- اختبار 1: محاكاة إحالة -->
            <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 text-xs">
              <h4 class="font-bold text-amber-300">اختبار 1: تسجيل مستخدم جديد بكود إحالة</h4>
              <div class="grid grid-cols-2 gap-2">
                <input type="text" id="sim-friend-name" value="سيف القضاة" placeholder="اسم الصديق" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                <input type="text" id="sim-ref-code" value="SH3SHER2026" placeholder="كود الإحالة" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-amber-300 uppercase" />
              </div>
              <button type="button" id="sim-run-referral-btn" class="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl transition cursor-pointer">
                تنفيذ محاكاة التسجيل (+${s.referredUserPoints} و +${s.referrerPoints} نقطة)
              </button>
            </div>

            <!-- اختبار 2: محاكاة نشر وسقف المنشورات -->
            <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-blue-300">اختبار 2: نشر منشور في المنتدى وفحص السقف</h4>
                <button type="button" id="sim-reset-count-btn" class="text-[11px] text-slate-400 hover:text-white underline">تصفير العداد</button>
              </div>
              <div class="p-3 bg-slate-900 rounded-xl border border-slate-700 flex justify-between items-center">
                <span class="text-slate-400">منشورات المستخدم هذا الشهر:</span>
                <span id="sim-post-count-display" class="font-mono text-base font-black text-white">${this.simulatedPostCount} / ${s.isMonthlyPostLimitActive ? s.maxMonthlyPostsPerUser : '∞'}</span>
              </div>
              <button type="button" id="sim-run-post-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition cursor-pointer">
                محاكاة نشر بوست جديد (+${s.postPoints} نقطة)
              </button>
            </div>
          </div>

          <!-- سجل نتائج المحاكاة الحي -->
          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>سجل المحاكاة الحي (Real-time logs):</span>
              <button type="button" id="sim-clear-logs-btn" class="text-amber-400 hover:underline cursor-pointer">مسح السجل</button>
            </div>
            <div id="sim-logs-container" class="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
              ${this.simulationLogs.length === 0 ? `
                <div class="text-slate-500 italic p-1">اضغط على أزرار المحاكاة أعلاه لتظهر النتائج هنا لحظياً...</div>
              ` : this.simulationLogs.map(log => `
                <div class="text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40">${log}</div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- أداة المنح والخصم اليدوي للمشرف -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-4">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span class="text-2xl">🎁</span>
            <div>
              <h3 class="font-extrabold text-base text-slate-900">منح أو خصم يدوي لنقاط أي مستخدم (Manual Adjuster)</h3>
              <p class="text-xs text-slate-400">مكافأة الأعضاء المتميزين أو تعديل الأرصدة يدوياً من قِبل المشرف</p>
            </div>
          </div>

          <form id="manual-points-form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-xs">
            <div>
              <label class="font-bold text-slate-700 block mb-1">البريد الإلكتروني أو UID للمستخدم:</label>
              <input type="text" id="man-target-user" placeholder="user@example.com أو Firebase UID" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold" />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">العملية والكمية:</label>
              <div class="flex gap-2">
                <select id="man-type" class="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 font-bold">
                  <option value="+">منح (+)</option>
                  <option value="-">خصم (-)</option>
                </select>
                <input type="number" id="man-amount" value="50" min="5" step="5" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold" />
              </div>
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">السبب / الملاحظة:</label>
              <input type="text" id="man-reason" value="مكافأة مشاركة مميزة في ملتقى السياح" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5" />
            </div>
            <div>
              <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition cursor-pointer">
                تنفيذ العملية 🚀
              </button>
            </div>
          </form>
        </div>

      </div>
    `;
  },

  /**
   * ربط كافة أحداث تبويب النقاط والمحاكي والمنح اليدوي
   * @param {HTMLElement} container 
   * @param {Function} onRefreshNeeded 
   */
  bindEvents(container, onRefreshNeeded) {
    if (!container) return;

    // 1. حفظ وتطبيق الإعدادات سحابياً
    container.querySelector('#save-points-rules-btn')?.addEventListener('click', async () => {
      const referredPts = Number(container.querySelector('#pts-referred-user-in').value) || 100;
      const referrerPts = Number(container.querySelector('#pts-referrer-in').value) || 150;
      const discountJOD = Number(container.querySelector('#pts-discount-jod-in').value) || 5;
      const postPts = Number(container.querySelector('#pts-post-reward-in').value) || 25;
      const isLimitActive = container.querySelector('#pts-limit-active-toggle').checked;
      const maxPosts = Number(container.querySelector('#pts-max-posts-in').value) || 5;

      const newSettings = {
        referredUserPoints: referredPts,
        referrerPoints: referrerPts,
        referralDiscountJOD: discountJOD,
        postPoints: postPts,
        isMonthlyPostLimitActive: isLimitActive,
        maxMonthlyPostsPerUser: maxPosts,
        bonusActive: false
      };

      // حفظ محلي وسحابي مباشر في Firebase Firestore
      Storage.set(STORAGE_KEYS.POINTS_SETTINGS, newSettings);
      appStore.setState({ pointsSettings: newSettings }, 'POINTS_SETTINGS_UPDATED');
      const saved = await FirebaseService.saveToCloud('settings', 'points_settings', newSettings);

      alert(saved ? '✅ تم حفظ قواعد النقاط سحابياً.' : 'حُفظت القواعد على هذا الجهاز فقط؛ تعذرت مزامنتها سحابياً.');
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 2. استعادة الإعدادات الافتراضية
    container.querySelector('#reset-points-defaults-btn')?.addEventListener('click', async () => {
      const defaults = {
        referredUserPoints: 100,
        referrerPoints: 150,
        postPoints: 25,
        maxMonthlyPostsPerUser: 5,
        isMonthlyPostLimitActive: true,
        bonusActive: false,
        referralDiscountJOD: 5
      };

      Storage.set(STORAGE_KEYS.POINTS_SETTINGS, defaults);
      appStore.setState({ pointsSettings: defaults }, 'POINTS_SETTINGS_UPDATED');
      const saved = await FirebaseService.saveToCloud('settings', 'points_settings', defaults);

      alert(saved ? 'تمت استعادة الإعدادات الافتراضية ومزامنتها سحابياً.' : 'استُعيدت الإعدادات محلياً فقط؛ تعذرت مزامنتها سحابياً.');
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 3. محاكاة تسجيل إحالة
    container.querySelector('#sim-run-referral-btn')?.addEventListener('click', () => {
      const name = container.querySelector('#sim-friend-name').value.trim() || 'صديق جديد';
      const code = container.querySelector('#sim-ref-code').value.trim() || 'SH3SHER2026';
      const settings = appStore.getState().pointsSettings;

      const log = `[محاكاة إحالة]: سجل المستخدم (${name}) برمز (${code}) -> حصل على +${settings.referredUserPoints} نقطة، وحصل صاحب الرمز على +${settings.referrerPoints} نقطة وخصم ${settings.referralDiscountJOD} د.أ.`;
      this.simulationLogs.unshift(log);
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 4. محاكاة نشر بوست وفحص السقف
    container.querySelector('#sim-run-post-btn')?.addEventListener('click', () => {
      const settings = appStore.getState().pointsSettings;
      const countDisplay = container.querySelector('#sim-post-count-display');

      if (settings.isMonthlyPostLimitActive && this.simulatedPostCount >= settings.maxMonthlyPostsPerUser) {
        const log = `[محاكاة منتدى]: ⚠️ تنبيه! تجاوز المستخدم السقف الشهري المسموح به (${settings.maxMonthlyPostsPerUser} منشورات). تم رفض النشر.`;
        this.simulationLogs.unshift(log);
      } else {
        this.simulatedPostCount++;
        const log = `[محاكاة منتدى]: تم اعتماد منشور سياحي جديد (#${this.simulatedPostCount} هذا الشهر) -> مُنح الناشر +${settings.postPoints} نقطة ولاء 🪙.`;
        this.simulationLogs.unshift(log);
      }
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 5. تصفير عداد المنشورات للمحاكي
    container.querySelector('#sim-reset-count-btn')?.addEventListener('click', () => {
      this.simulatedPostCount = 0;
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 6. مسح سجل المحاكاة
    container.querySelector('#sim-clear-logs-btn')?.addEventListener('click', () => {
      this.simulationLogs = [];
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 7. المنح والخصم اليدوي للنقاط
    container.querySelector('#manual-points-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = container.querySelector('#man-target-user').value.trim();
      const type = container.querySelector('#man-type').value;
      const amount = Number(container.querySelector('#man-amount').value) || 50;
      const reason = container.querySelector('#man-reason').value.trim();

      const finalAmount = type === '+' ? amount : -amount;
      const saved = await FirebaseService.adjustUserPoints(user, finalAmount, reason);
      alert(saved
        ? `✅ تم تحديث رصيد المستخدم (${user}) في Firestore.`
        : 'تعذر تحديث المستخدم. تحقق من البريد أو UID واتصال Firestore وصلاحيات الكتابة.');
      if (onRefreshNeeded) onRefreshNeeded();
    });
  }
};