

import { FirebaseService } from '../../services/firebase.service.js';
import { appStore } from '../../state/store.js';
import { Storage, STORAGE_KEYS } from '../../state/storage.js';

export const AdminBookings = {
  activeSearchQuery: '',
  activeStatusFilter: 'all',
  selectedProofUrl: null,

  /**
   * توليد كود تفعيل فوري معتمد
   * @returns {string}
   */
  generateActivationCode() {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `CLIQ-ACT-${randomDigits}`;
  },

  /**
   * تصفية الحجوزات وفق البحث والحالة
   * @param {Array} bookings 
   * @returns {Array}
   */
  getFilteredBookings(bookings = []) {
    return bookings.filter(b => {
      const q = this.activeSearchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        (b.customerName || '').toLowerCase().includes(q) ||
        (b.id || '').toLowerCase().includes(q) ||
        (b.customerPhone || '').toLowerCase().includes(q) ||
        (b.destinationTitle?.ar || b.destinationTitle || '').toLowerCase().includes(q);

      const matchStatus = this.activeStatusFilter === 'all' || b.status === this.activeStatusFilter;
      return matchSearch && matchStatus;
    });
  },

  /**
   * بناء الواجهة الكاملة لتبويب الحجوزات وإثباتات كليك (Master Table & Audit View)
   * @param {Array} bookings 
   * @returns {string} HTML
   */
  renderFullView(bookings = []) {
    const filtered = this.getFilteredBookings(bookings);

    return `
      <div class="space-y-6 animate-in fade-in duration-200">
        
        <!-- شريط البحث والتصفية السريع -->
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="relative flex-1 w-full">
            <span class="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              id="booking-search-input"
              value="${this.activeSearchQuery}"
              placeholder="بحث باسم المسافر، رقم الحجز، الهاتف، أو اسم الرحلة..."
              class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl ps-10 pe-4 py-2.5 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#C86D51]"
            />
          </div>

          <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <select
              id="booking-status-filter"
              class="w-full sm:w-auto bg-[#FAF8F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#C86D51] cursor-pointer"
            >
              <option value="all" ${this.activeStatusFilter === 'all' ? 'selected' : ''}>كل الحالات (${bookings.length})</option>
              <option value="pending" ${this.activeStatusFilter === 'pending' ? 'selected' : ''}>بانتظار التدقيق والتحقق (Pending)</option>
              <option value="confirmed" ${this.activeStatusFilter === 'confirmed' ? 'selected' : ''}>معتمد ومؤكد (Confirmed)</option>
              <option value="rejected" ${this.activeStatusFilter === 'rejected' ? 'selected' : ''}>مرفوض (Rejected)</option>
            </select>
          </div>
        </div>

        <!-- صندوق جدول الحجوزات الكامل -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-soft-card overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h4 class="font-extrabold text-sm text-[#1E293B] flex items-center gap-2">
                <span>🎟️</span>
                <span>سجل طلبات الحجز وإثباتات كليك بالكامل</span>
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">
                مراجعة إشعارات التحويل، توليد كود التفعيل المعتمد، وإرسال التذكرة للعميل مباشرة.
              </p>
            </div>
            <span class="text-xs font-bold bg-[#1E293B] text-white px-3 py-1 rounded-full">
              ${filtered.length} طلبات معروضة
            </span>
          </div>

          <div class="divide-y divide-slate-100">
            ${filtered.length === 0 ? `
              <div class="p-12 text-center space-y-2">
                <span class="text-3xl block">⏳</span>
                <p class="text-xs font-bold text-slate-500">لا توجد طلبات حجز تطابق معايير البحث المحددة حالياً.</p>
              </div>
            ` : filtered.map(b => this.renderBookingCard(b)).join('')}
          </div>
        </div>

        <!-- نافذة معاينة صورة إشعار كليك المكبرة -->
        ${this.renderProofModal()}
      </div>
    `;
  },

  /**
   * توليد بطاقة الحجز الفردية بكامل تفاصيلها
   * @param {Object} b 
   * @returns {string} HTML
   */
  renderBookingCard(b) {
    const isConfirmed = b.status === 'confirmed';
    const isRejected = b.status === 'rejected';
    const defaultCode = b.activationCode || b.bookingCode || this.generateActivationCode();
    const destTitle = b.destinationTitle?.ar || b.destinationTitle || 'جولة الأردن السياحية';

    return `
      <div class="p-6 space-y-4 hover:bg-slate-50/60 transition-colors" data-booking-card-id="${b.id}">
        
        <!-- الترويسة: رقم الحجز، الحالة، المبلغ -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="font-mono font-extrabold text-xs text-[#C86D51] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
              #${b.id}
            </span>
            <span class="text-[10px] font-bold px-3 py-1 rounded-full ${
              isConfirmed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              isRejected ? 'bg-rose-100 text-rose-800 border border-rose-300' :
              'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
            }">
              ${isConfirmed ? '✓ تم الاعتماد والتفعيل' : isRejected ? '✕ تم رفض الطلب' : '⏳ قيد التدقيق والمراجعة'}
            </span>
            <span class="text-[10px] font-mono font-extrabold bg-slate-800 text-amber-300 px-2.5 py-1 rounded-lg">
              وسيلة الدفع: ${(b.paymentMode || 'cliq').toUpperCase()}
            </span>
            <span class="text-[11px] text-slate-400 font-mono">
              ${b.createdAt || 'الآن'}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-400">المبلغ المسدد:</span>
            <span class="font-mono font-black text-lg text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              ${b.totalPriceJOD || 0} د.أ
            </span>
          </div>
        </div>

        <!-- شبكة تفاصيل المسافر، الرحلة، وإشعار الدفع -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-slate-200">
          
          <!-- عمود 1: المسافر -->
          <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              👤 معلومات المسافر الرئيسي:
            </span>
            <p class="font-extrabold text-[#1E293B] text-sm">${b.customerName || 'غير محدد'}</p>
            <p class="text-slate-600 font-mono">📞 ${b.customerPhone || 'بدون هاتف'}</p>
            <p class="text-slate-600 font-mono">✉️ ${b.customerEmail || 'بدون بريد'}</p>
          </div>

          <!-- عمود 2: الرحلة والموعد -->
          <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              🗺️ تفاصيل الرحلة والموعد:
            </span>
            <p class="font-bold text-[#1E293B] text-sm">${destTitle}</p>
            <p class="text-slate-600 font-mono">📅 التاريخ: ${b.date || '2026-10-15'}</p>
            <p class="text-slate-600 font-mono">⏰ الانطلاق: ${b.timeSlot || '08:00 AM'}</p>
            <p class="text-slate-600 font-bold">👥 عدد الضيوف: ${b.guests || 2}</p>
          </div>

          <!-- عمود 3: إشعار الدفع والملاحظات -->
          <div class="space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              📑 إثبات الدفع والطلبات:
            </span>
            ${b.specialRequests ? `
              <p class="text-slate-600 bg-white p-2 rounded-xl border border-slate-200 italic text-[11px]">
                "${b.specialRequests}"
              </p>
            ` : '<p class="text-slate-400 text-[11px] italic">لا توجد ملاحظات خاصة</p>'}

            ${b.paymentProofUrl ? `
              <div class="flex items-center gap-2 pt-1">
                <img
                  src="${b.paymentProofUrl}"
                  alt="Proof Thumbnail"
                  class="w-10 h-10 object-cover rounded-lg border border-amber-300 shadow-xs cursor-pointer view-proof-trigger"
                  data-url="${b.paymentProofUrl}"
                />
                <button
                  type="button"
                  class="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer view-proof-trigger"
                  data-url="${b.paymentProofUrl}"
                >
                  معاينة إشعار كليك الكامل 📄
                </button>
              </div>
            ` : '<span class="text-[11px] text-slate-400 italic block">لم يُرفق إشعار مصور (تحويل مباشر)</span>'}
          </div>
        </div>

        <!-- شريط اتخاذ القرار: كود التفعيل وأزرار الاعتماد والرفض -->
        <div class="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex-1 w-full space-y-1">
            <label class="text-xs font-bold text-amber-900 block">
              كود تفعيل الرحلة الرسمي (Activation Code):
            </label>
            <div class="flex items-center gap-2 max-w-md">
              <input
                type="text"
                id="activation-code-input-${b.id}"
                value="${defaultCode}"
                class="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1E293B] focus:outline-none"
              />
              <button
                type="button"
                class="auto-gen-code-btn bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer"
                data-target-input="activation-code-input-${b.id}"
              >
                توليد تلقائي ⚡
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              type="button"
              class="reject-booking-btn bg-rose-100 hover:bg-rose-200 text-rose-800 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              data-booking-id="${b.id}"
            >
              رفض الطلب ✕
            </button>

            <button
              type="button"
              class="approve-booking-btn bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              data-booking-id="${b.id}"
            >
              <span>${isConfirmed ? 'إعادة إرسال كود التفعيل ✓' : 'اعتماد وتفعيل وإرسال الكود ✓'}</span>
            </button>
          </div>
        </div>

      </div>
    `;
  },

  /**
   * توليد نافذة معاينة صورة الإشعار المكبرة
   * @returns {string} HTML
   */
  renderProofModal() {
    return `
      <div id="admin-proof-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
          <div class="flex items-center justify-between border-b pb-3">
            <h3 class="font-extrabold text-sm text-[#1E293B]">إشعار تحويل كليك المرفوع من العميل</h3>
            <button type="button" id="close-proof-modal-btn" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
              ✕
            </button>
          </div>
          <div class="max-h-[65vh] overflow-y-auto rounded-2xl border bg-slate-900 flex items-center justify-center p-2">
            <img id="admin-proof-modal-img" src="" alt="Proof Full" class="max-h-[60vh] object-contain rounded-xl" />
          </div>
          <button type="button" id="close-proof-modal-footer-btn" class="w-full bg-[#1E293B] text-white py-2.5 rounded-xl font-bold text-xs">
            إغلاق المعاينة
          </button>
        </div>
      </div>
    `;
  },

  /**
   * تنفيذ اعتماد الحجز سحابياً ومحلياً
   * @param {string} bookingId 
   * @param {string} customCode 
   */
  async executeApprove(bookingId, customCode) {
    const state = appStore.getState();
    const code = customCode || this.generateActivationCode();

    const updatedBookings = state.bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'confirmed', activationCode: code, bookingCode: code } : b
    );

    // 1. التحديث المحلي الفوري
    Storage.set(STORAGE_KEYS.BOOKINGS, updatedBookings);
    appStore.setState({ bookings: updatedBookings }, 'BOOKING_APPROVED');

    return {
      code,
      synced: await FirebaseService.updateBooking(bookingId, {
        status: 'confirmed',
        activationCode: code,
        bookingCode: code
      })
    };
  },

  /**
   * تنفيذ رفض الحجز سحابياً ومحلياً
   * @param {string} bookingId 
   * @param {string} reason 
   */
  async executeReject(bookingId, reason) {
    const state = appStore.getState();
    const updatedBookings = state.bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'rejected', rejectionReason: reason } : b
    );

    Storage.set(STORAGE_KEYS.BOOKINGS, updatedBookings);
    appStore.setState({ bookings: updatedBookings }, 'BOOKING_REJECTED');

    return FirebaseService.updateBooking(bookingId, {
      status: 'rejected',
      rejectionReason: reason
    });
  },

  /**
   * ربط كافة مستمعي الأحداث التفاعلية لتبويب الحجوزات
   * @param {HTMLElement} container 
   * @param {Function} onRefreshNeeded 
   */
  bindEvents(container, onRefreshNeeded) {
    if (!container) return;

    // 1. البحث الحي
    const searchIn = container.querySelector('#booking-search-input');
    if (searchIn) {
      searchIn.addEventListener('input', (e) => {
        this.activeSearchQuery = e.target.value;
        if (onRefreshNeeded) onRefreshNeeded();
      });
    }

    // 2. فلتر الحالة
    const statusSel = container.querySelector('#booking-status-filter');
    if (statusSel) {
      statusSel.addEventListener('change', (e) => {
        this.activeStatusFilter = e.target.value;
        if (onRefreshNeeded) onRefreshNeeded();
      });
    }

    // 3. أزرار التوليد التلقائي للكود
    container.querySelectorAll('.auto-gen-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target-input');
        const targetInput = container.querySelector(`#${targetId}`);
        if (targetInput) {
          targetInput.value = this.generateActivationCode();
        }
      });
    });

    // 4. أزرار الاعتماد
    container.querySelectorAll('.approve-booking-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-booking-id');
        const codeInput = container.querySelector(`#activation-code-input-${id}`);
        const code = codeInput ? codeInput.value.trim() : null;

        btn.disabled = true;
        btn.innerText = 'جارِ الاعتماد السحابي... ⏳';

        const result = await this.executeApprove(id, code);
        alert(result.synced
          ? `✅ تم اعتماد الحجز وكود التفعيل (${result.code}) ومزامنته سحابياً.`
          : `تم اعتماد الحجز (${result.code}) محلياً، لكن تعذرت مزامنته إلى Firestore.`);
        if (onRefreshNeeded) onRefreshNeeded();
      });
    });

    // 5. أزرار الرفض
    container.querySelectorAll('.reject-booking-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-booking-id');
        const reason = prompt('ادخل سبب عدم اعتماد الطلب (سيرسل للعميل عبر الإشعارات):', 'إشعار كليك غير واضح أو عدم اكتمال البيانات');
        
        if (reason !== null) {
          const synced = await this.executeReject(id, reason);
          alert(synced ? 'تم رفض الطلب ومزامنته سحابياً.' : 'تم رفض الطلب محلياً، لكن تعذرت مزامنته إلى Firestore.');
          if (onRefreshNeeded) onRefreshNeeded();
        }
      });
    });

    // 6. معاينة صورة الإشعار
    const modal = document.querySelector('#admin-proof-modal');
    const modalImg = document.querySelector('#admin-proof-modal-img');
    const closeModal = () => modal?.classList.add('hidden');

    container.querySelectorAll('.view-proof-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const url = trigger.getAttribute('data-url');
        if (modal && modalImg && url) {
          modalImg.src = url;
          modal.classList.remove('hidden');
        }
      });
    });

    document.querySelector('#close-proof-modal-btn')?.addEventListener('click', closeModal);
    document.querySelector('#close-proof-modal-footer-btn')?.addEventListener('click', closeModal);
  }
};