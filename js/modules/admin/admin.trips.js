

import { FirebaseService } from '../../services/firebase.service.js';
import { appStore } from '../../state/store.js';
import { Storage, STORAGE_KEYS } from '../../state/storage.js';
import { uploaderService } from '../../services/uploader.service.js';

export const AdminTrips = {
  // حالة المودال النشط
  editingTrip: null,
  activeModalTab: 'basics',
  landmarkCatalog: [],
  stampCatalog: [],

  /**
   * بناء الواجهة الكاملة لتبويب إدارة الرحلات والأسعار
   * @param {Array} trips 
   * @returns {string} HTML
   */
  renderFullView(trips = [], masterLandmarks = [], stamps = []) {
    this.landmarkCatalog = masterLandmarks;
    this.stampCatalog = stamps;
    return `
      <div class="space-y-6 animate-in fade-in duration-200">
        
        <!-- الترويسة وأزرار الإجراءات السحابية -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-soft-card">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl">🧭</span>
              <h3 class="font-extrabold text-base text-[#1E293B]">
                إدارة الرحلات والأسعار والمعالم (مزامنة سحابية حية 🟢)
              </h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              أي تعديل أو إضافة على الرحلات والأسعار يُحفظ فوراً في السحابة ويصل لجميع الزوار على كافة الأجهزة.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              id="sync-trips-cloud-btn"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="مزامنة فورية لكافة الرحلات إلى السحابة"
            >
              <span>🌐 مزامنة سحابية لكافة الأجهزة</span>
            </button>

            <button
              type="button"
              id="open-add-trip-modal-btn"
              class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <span>+ إضافة رحلة جديدة</span>
            </button>
          </div>
        </div>

        <!-- شبكة بطاقات الرحلات المعروضة -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${trips.length === 0 ? `
            <div class="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 font-bold text-xs">
              لا توجد رحلات مسجلة حالياً. اضغط على "إضافة رحلة جديدة" للبدء.
            </div>
          ` : trips.map(t => this.renderTripCard(t)).join('')}
        </div>

        <!-- نافذة إضافة وتعديل الرحلة الشاملة (6 تبويبات) -->
        <div id="trip-editor-modal-container"></div>
      </div>
    `;
  },

  /**
   * توليد بطاقة الرحلة الفردية في لوحة الإدارة
   * @param {Object} t 
   * @returns {string} HTML
   */
  renderTripCard(t) {
    const title = t.title?.ar || t.title || 'رحلة سياحية';
    const region = t.region?.ar || t.region || 'الأردن';
    const desc = t.description?.ar || t.description || '';
    const img = t.imageUrl || 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=600';

    return `
      <div class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-soft-card space-y-3 flex flex-col justify-between hover:border-[#C86D51] transition" data-trip-id="${t.id}">
        <div>
          <div class="relative aspect-video w-full overflow-hidden bg-slate-900">
            <img src="${img}" alt="${title}" class="w-full h-full object-cover" />
            <span class="absolute top-2.5 start-2.5 bg-[#1E293B]/85 text-[#FAF8F5] text-[10px] font-bold px-2 py-0.5 rounded-full">
              ${t.duration?.ar || t.duration || 'يوم كامل'}
            </span>
            ${t.discountPercent ? `
              <span class="absolute bottom-2.5 start-2.5 bg-[#C86D51] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -${t.discountPercent}% خصم
              </span>
            ` : ''}
          </div>

          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-[#C86D51]">📍 ${region}</span>
              <span class="font-mono font-black text-sm text-[#1E293B]">${t.priceJOD} د.أ</span>
            </div>

            <h4 class="font-extrabold text-sm text-[#1E293B] leading-tight line-clamp-1">${title}</h4>
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">${desc}</p>
          </div>
        </div>

        <div class="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            class="edit-trip-trigger text-xs font-bold text-slate-700 hover:text-[#C86D51] flex items-center gap-1 cursor-pointer"
            data-id="${t.id}"
          >
            <span>تعديل التفاصيل والمعالم ✏️</span>
          </button>
          <button
            type="button"
            class="delete-trip-trigger p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            data-id="${t.id}"
            title="حذف الرحلة"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * توليد نافذة المودال الشاملة ذات الـ 6 تبويبات لتعديل أو إضافة رحلة
   * @param {Object|null} trip 
   * @returns {string} HTML
   */
  renderTripModal(trip = null, masterLandmarks = this.landmarkCatalog, stamps = this.stampCatalog) {
    const isEdit = Boolean(trip);
    const titleAr = trip?.title?.ar || trip?.title || '';
    const titleEn = trip?.title?.en || '';
    const regionAr = trip?.region?.ar || trip?.region || '';
    const descAr = trip?.description?.ar || trip?.description || '';
    const durationAr = trip?.duration?.ar || trip?.duration || 'يوم كامل (8 ساعات)';
    const price = trip?.priceJOD || 65;
    const discount = trip?.discountPercent || 0;
    const adultPrice = trip?.adultPriceJOD || price;
    const childPrice = trip?.childPriceJOD || Math.round(price * 0.6);
    const rewardPoints = trip?.rewardPoints || 150;
    const imageUrl = trip?.imageUrl || '';
    const videoUrl = trip?.videoUrl || '';
    const galleryUrls = (trip?.gallery || []).map((item) => typeof item === 'string' ? item : item.url).filter(Boolean).join('\n');
    const itineraryLines = (trip?.itinerary || []).map((step) => [step.time, step.activity?.ar || step.activity || '', step.description?.ar || step.description || ''].join(' | ')).join('\n');
    const includedLines = (trip?.includedServices?.ar || []).join('\n');
    const excludedLines = (trip?.excludedServices?.ar || []).join('\n');
    const selectedLandmarkIds = new Set((trip?.landmarks || []).map((item) => item.id));
    const landmarksForModal = new Map([
      ...masterLandmarks,
      ...(trip?.landmarks || [])
    ].map((landmark) => [landmark.id, landmark]));
    const dates = trip?.availableDates ? trip.availableDates.join(', ') : '2026-10-15, 2026-10-22, 2026-10-29';
    const times = trip?.departureTimes ? trip.departureTimes.join(', ') : '07:00 ص, 09:30 ص';
    const selectedStampId = trip?.stampId || stamps.find((stamp) => stamp.id === trip?.stampName || stamp.name?.ar === trip?.stampName)?.id || '';

    return `
      <div id="trip-modal-overlay" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <form id="trip-editor-form" class="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 my-6 border-2 border-[#E5C598]">
          
          <input type="hidden" id="modal-trip-id" value="${trip?.id || `trip-${Date.now()}`}" />

          <!-- ترويسة المودال -->
          <div class="flex items-center justify-between border-b pb-4">
            <div>
              <h3 class="font-extrabold text-base sm:text-lg text-[#1E293B]">
                ${isEdit ? `تعديل بيانات الرحلة: ${titleAr}` : 'إضافة رحلة سياحية جديدة بكافة التفاصيل'}
              </h3>
              <span class="text-[11px] text-slate-500">
                تخصيص الأسعار، الخصومات، أختام الجواز، التواريخ، مواعيد الانطلاق، والجدول الزمني
              </span>
            </div>
            <button type="button" id="close-trip-modal-btn" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
              ✕
            </button>
          </div>

          <!-- تبويبات محرر الرحلة -->
          <div class="flex flex-wrap gap-1.5 p-1 bg-[#FAF8F5] rounded-2xl border border-slate-200">
            <button type="button" class="trip-subtab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition bg-[#C86D51] text-white" data-subtab="basics">1. البيانات والمحافظة</button>
            <button type="button" class="trip-subtab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-black" data-subtab="pricing">2. الأسعار والخصومات</button>
            <button type="button" class="trip-subtab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-black" data-subtab="rewards">3. النقاط والختم والمواعيد</button>
            <button type="button" class="trip-subtab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-black" data-subtab="media">4. الصور والفيديو</button>
            <button type="button" class="trip-subtab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-black" data-subtab="landmarks">5. أبرز المعالم</button>
            <button type="button" class="trip-subtab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-black" data-subtab="itinerary">6. الجدول الزمني</button>
            <button type="button" class="trip-subtab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-black" data-subtab="services">7. يشمل / لا يشمل</button>
          </div>

          <!-- 1. تبويب البيانات الأساسية -->
          <div id="subtab-panel-basics" class="trip-subtab-panel space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">عنوان الرحلة (بالعربية):</label>
                <input type="text" id="trip-in-title-ar" value="${titleAr}" required placeholder="مثال: مدينة البتراء الوردية وكنز الأنباط" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1E293B]" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">العنوان بالإنجليزية (English):</label>
                <input type="text" id="trip-in-title-en" value="${titleEn}" placeholder="Petra Rose City Tour" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">المنطقة والمحافظة:</label>
                <input type="text" id="trip-in-region-ar" value="${regionAr}" required placeholder="معان • البتراء" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">المدة الزمنية للرحلة:</label>
                <input type="text" id="trip-in-duration-ar" value="${durationAr}" required placeholder="يومان / ليلة واحدة" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]" />
              </div>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">الوصف العام والتفصيلي للرحلة:</label>
              <textarea id="trip-in-desc-ar" rows="3" required class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-[#1E293B]">${descAr}</textarea>
            </div>
          </div>

          <!-- 2. تبويب الأسعار والخصومات -->
          <div id="subtab-panel-pricing" class="trip-subtab-panel hidden space-y-4">
            <div class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">السعر النهائي للبالغين (JOD):</label>
                <input type="number" id="trip-in-price" value="${price}" required min="1" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-black" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">نسبة الخصم المئوية إن وجدت (%):</label>
                <input type="number" id="trip-in-discount" value="${discount}" min="0" max="90" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">سعر تذكرة الأطفال (JOD):</label>
                <input type="number" id="trip-in-child-price" value="${childPrice}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">نقاط المكافأة المكتسبة:</label>
                <input type="number" id="trip-in-points" value="${rewardPoints}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#D97706]" />
              </div>
            </div>
          </div>

          <!-- 3. تبويب التواريخ والمواعيد -->
          <div id="subtab-panel-rewards" class="trip-subtab-panel hidden space-y-4">
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">التواريخ المتوفرة للرحلة (مفصولة بفواصل):</label>
              <input type="text" id="trip-in-dates" value="${dates}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">مواعيد وساعات الانطلاق (مفصولة بفواصل):</label>
              <input type="text" id="trip-in-times" value="${times}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold" />
            </div>
            <div>
              <label for="trip-in-stamp" class="text-xs font-bold text-slate-700 block mb-1">الختم المرتبط بالرحلة:</label>
              <select id="trip-in-stamp" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs">
                <option value="">بدون ختم</option>
                ${stamps.map((stamp) => `<option value="${stamp.id}" ${selectedStampId === stamp.id ? 'selected' : ''}>${stamp.name?.ar || stamp.name || stamp.id} - ${stamp.governorateName?.ar || stamp.gov || ''}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- 4. تبويب الصور والفيديو -->
          <div id="subtab-panel-media" class="trip-subtab-panel hidden space-y-4">
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">صورة الغلاف: رابط أو رفع من الجهاز</label>
              <input type="url" id="trip-in-image" value="${imageUrl}" placeholder="https://..." class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono" />
              <div class="flex items-center gap-2 mt-2">
                <input type="file" id="trip-in-image-file" accept="image/*" class="hidden" />
                <button type="button" id="trip-image-file-trigger" class="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700"><i class="fa-solid fa-upload me-1" aria-hidden="true"></i>رفع صورة الغلاف</button>
                <span id="trip-image-file-name" class="text-[11px] text-slate-500"></span>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">معرض الصور: رابط في كل سطر أو ارفع عدة صور</label>
              <textarea id="trip-in-gallery-urls" rows="3" placeholder="https://..." class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 text-xs font-mono">${galleryUrls}</textarea>
              <div class="flex items-center gap-2 mt-2">
                <input type="file" id="trip-in-gallery-files" accept="image/*" multiple class="hidden" />
                <button type="button" id="trip-gallery-files-trigger" class="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700"><i class="fa-solid fa-upload me-1" aria-hidden="true"></i>رفع مجموعة صور</button>
                <span id="trip-gallery-file-count" class="text-[11px] text-slate-500"></span>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">فيديو الرحلة: رابط أو رفع من الجهاز</label>
              <input type="url" id="trip-in-video" value="${videoUrl}" placeholder="https://..." class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono" />
              <div class="flex items-center gap-2 mt-2">
                <input type="file" id="trip-in-video-file" accept="video/*" class="hidden" />
                <button type="button" id="trip-video-file-trigger" class="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700">رفع فيديو</button>
                <span id="trip-video-file-name" class="text-[11px] text-slate-500"></span>
              </div>
            </div>
          </div>

          <!-- 5. اختيار أبرز المعالم من المكتبة -->
          <div id="subtab-panel-landmarks" class="trip-subtab-panel hidden space-y-3">
            <p class="text-xs text-slate-500">حدد المعالم التي تظهر في تفاصيل هذه الرحلة. تتم مزامنة الاختيارات مع مكتبة المعالم الشاملة.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              ${landmarksForModal.size ? [...landmarksForModal.values()].map((landmark) => `
                <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800">
                  <input type="checkbox" name="trip-landmark-checkbox" value="${landmark.id}" ${selectedLandmarkIds.has(landmark.id) ? 'checked' : ''} class="h-4 w-4 accent-[#C86D51]">
                  <span class="min-w-0 flex-1 font-bold">${landmark.name?.ar || landmark.name || 'معلم'}</span>
                  <span class="text-[10px] text-slate-500">${landmark.governorateId || ''}</span>
                </label>
              `).join('') : '<p class="col-span-full rounded-xl bg-amber-50 p-3 text-xs text-amber-900">أضف معالم إلى المكتبة الشاملة أولاً.</p>'}
            </div>
          </div>

          <!-- 6. خطة الرحلة -->
          <div id="subtab-panel-itinerary" class="trip-subtab-panel hidden space-y-3">
            <label for="trip-in-itinerary" class="text-xs font-bold text-slate-700">محطات الرحلة، محطة في كل سطر: الوقت | النشاط | الوصف</label>
            <textarea id="trip-in-itinerary" rows="8" placeholder="07:30 ص | التجمع والانطلاق | الالتقاء بالمرشد عند مركز الزوار" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 text-xs leading-6 text-slate-800">${itineraryLines}</textarea>
          </div>

          <!-- 7. الخدمات المشمولة وغير المشمولة -->
          <div id="subtab-panel-services" class="trip-subtab-panel hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="trip-in-included" class="text-xs font-bold text-slate-700 block mb-1">يشمل، عنصر في كل سطر</label>
              <textarea id="trip-in-included" rows="7" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 text-xs leading-6 text-slate-800">${includedLines}</textarea>
            </div>
            <div>
              <label for="trip-in-excluded" class="text-xs font-bold text-slate-700 block mb-1">لا يشمل، عنصر في كل سطر</label>
              <textarea id="trip-in-excluded" rows="7" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 text-xs leading-6 text-slate-800">${excludedLines}</textarea>
            </div>
          </div>

          <!-- أزرار الحفظ والإلغاء -->
          <div class="pt-4 flex items-center justify-between border-t">
            <button type="button" id="cancel-trip-modal-btn" class="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">
              إلغاء
            </button>
            <button type="submit" class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-7 py-2.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer">
              حفظ وتطبيق التغييرات سحابياً ✓
            </button>
          </div>

        </form>
      </div>
    `;
  },

  /**
   * ربط كافة مستمعي الأحداث لتبويب الرحلات
   * @param {HTMLElement} container 
   * @param {Function} onRefreshNeeded 
   */
  bindEvents(container, onRefreshNeeded, masterLandmarks = [], stamps = this.stampCatalog) {
    if (!container) return;
    this.landmarkCatalog = masterLandmarks;
    this.stampCatalog = stamps;

    // 1. فتح مودال إضافة رحلة جديدة
    container.querySelector('#open-add-trip-modal-btn')?.addEventListener('click', () => {
      this.editingTrip = null;
      const modalBox = container.querySelector('#trip-editor-modal-container');
      if (modalBox) {
        modalBox.innerHTML = this.renderTripModal(null, masterLandmarks, stamps);
        this.bindModalEvents(container, onRefreshNeeded);
      }
    });

    // 2. المزامنة القسرية للرحلات إلى Firebase
    container.querySelector('#sync-trips-cloud-btn')?.addEventListener('click', async () => {
      const state = appStore.getState();
      const btn = container.querySelector('#sync-trips-cloud-btn');
      if (btn) btn.innerText = 'جارٍ المزامنة السحابية... ⏳';

      const saved = await FirebaseService.saveToCloud('settings', 'destinations_data', { list: state.destinations });
      alert(saved ? '✅ تم نشر كافة الرحلات والأسعار سحابياً.' : 'تعذر الاتصال بالسحابة. بقيت البيانات محفوظة على هذا الجهاز فقط.');
      if (btn) btn.innerText = '🌐 مزامنة سحابية لكافة الأجهزة';
    });

    // 3. فتح مودال تعديل رحلة قائمة
    container.querySelectorAll('.edit-trip-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const state = appStore.getState();
        const trip = state.destinations.find(d => d.id === id);
        if (trip) {
          this.editingTrip = trip;
          const modalBox = container.querySelector('#trip-editor-modal-container');
          if (modalBox) {
            modalBox.innerHTML = this.renderTripModal(trip, masterLandmarks, stamps);
            this.bindModalEvents(container, onRefreshNeeded);
          }
        }
      });
    });

    // 4. حذف رحلة ومزامنة الحذف
    container.querySelectorAll('.delete-trip-trigger').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('هل أنت متأكد من رغبتك في حذف هذه الرحلة نهائياً؟')) {
          const state = appStore.getState();
          const updated = state.destinations.filter(d => d.id !== id);
          
          Storage.set(STORAGE_KEYS.DESTINATIONS, updated);
          appStore.setState({ destinations: updated }, 'DESTINATIONS_UPDATED');
          const saved = await FirebaseService.saveToCloud('settings', 'destinations_data', { list: updated });

          alert(saved ? 'تم حذف الرحلة وتحديث السحابة بنجاح.' : 'حُذفت الرحلة من هذا الجهاز، لكن تعذرت مزامنتها إلى السحابة.');
          if (onRefreshNeeded) onRefreshNeeded();
        }
      });
    });
  },

  /**
   * ربط أحداث المودال الداخلي (التبويبات وحفظ النموذج)
   */
  bindModalEvents(container, onRefreshNeeded) {
    const modalBox = container.querySelector('#trip-editor-modal-container');
    const close = () => { if (modalBox) modalBox.innerHTML = ''; };

    container.querySelector('#close-trip-modal-btn')?.addEventListener('click', close);
    container.querySelector('#cancel-trip-modal-btn')?.addEventListener('click', close);

    [
      ['#trip-image-file-trigger', '#trip-in-image-file'],
      ['#trip-gallery-files-trigger', '#trip-in-gallery-files'],
      ['#trip-video-file-trigger', '#trip-in-video-file']
    ].forEach(([buttonSelector, inputSelector]) => {
      container.querySelector(buttonSelector)?.addEventListener('click', () => container.querySelector(inputSelector)?.click());
    });
    container.querySelector('#trip-in-image-file')?.addEventListener('change', (event) => {
      const fileName = container.querySelector('#trip-image-file-name');
      if (fileName) fileName.textContent = event.target.files?.[0]?.name || '';
    });
    container.querySelector('#trip-in-gallery-files')?.addEventListener('change', (event) => {
      const count = event.target.files?.length || 0;
      const fileCount = container.querySelector('#trip-gallery-file-count');
      if (fileCount) fileCount.textContent = count ? `${count} صور محددة` : '';
    });
    container.querySelector('#trip-in-video-file')?.addEventListener('change', (event) => {
      const fileName = container.querySelector('#trip-video-file-name');
      if (fileName) fileName.textContent = event.target.files?.[0]?.name || '';
    });

    // تبديل التبويبات الفرعية للمودال
    container.querySelectorAll('.trip-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-subtab');
        container.querySelectorAll('.trip-subtab-btn').forEach(b => {
          b.classList.remove('bg-[#C86D51]', 'text-white');
          b.classList.add('text-slate-600');
        });
        btn.classList.add('bg-[#C86D51]', 'text-white');
        btn.classList.remove('text-slate-600');

        container.querySelectorAll('.trip-subtab-panel').forEach(p => p.classList.add('hidden'));
        container.querySelector(`#subtab-panel-${tab}`)?.classList.remove('hidden');
      });
    });

    // حفظ وتطبيق الرحلة سحابياً
    container.querySelector('#trip-editor-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = container.querySelector('#trip-editor-form button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      try {
      const state = appStore.getState();
      const tripId = container.querySelector('#modal-trip-id').value;
      const titleAr = container.querySelector('#trip-in-title-ar').value.trim();
      const titleEn = container.querySelector('#trip-in-title-en').value.trim() || titleAr;
      const regionAr = container.querySelector('#trip-in-region-ar').value.trim();
      const durationAr = container.querySelector('#trip-in-duration-ar').value.trim();
      const descAr = container.querySelector('#trip-in-desc-ar').value.trim();
      const price = Number(container.querySelector('#trip-in-price').value) || 65;
      const discount = Number(container.querySelector('#trip-in-discount').value) || 0;
      const childPrice = Number(container.querySelector('#trip-in-child-price').value) || Math.round(price * 0.6);
      const points = Number(container.querySelector('#trip-in-points').value) || 150;
      let imageUrl = container.querySelector('#trip-in-image').value.trim();
      let videoUrl = container.querySelector('#trip-in-video').value.trim();
      const coverFile = container.querySelector('#trip-in-image-file').files?.[0];
      const galleryFiles = Array.from(container.querySelector('#trip-in-gallery-files').files || []);
      const videoFile = container.querySelector('#trip-in-video-file').files?.[0];
      if (coverFile) imageUrl = (await uploaderService.uploadFile(coverFile)).dataUrl;
      if (videoFile) videoUrl = (await uploaderService.uploadFile(videoFile)).dataUrl;
      const galleryUrls = container.querySelector('#trip-in-gallery-urls').value.split('\n').map(url => url.trim()).filter(Boolean);
      const uploadedGalleryUrls = await Promise.all(galleryFiles.map(async (file) => (await uploaderService.uploadFile(file)).dataUrl));
      const previousGallery = this.editingTrip?.gallery || [];
      const gallery = [...new Set([...galleryUrls, ...uploadedGalleryUrls])].map((url, index) => {
        const previous = previousGallery.find(item => (typeof item === 'string' ? item : item.url) === url);
        return typeof previous === 'object' ? previous : {
          url,
          title: { ar: index === 0 ? titleAr : `${titleAr} - ${index + 1}`, en: titleEn }
        };
      });
      if (!imageUrl) throw new Error('أضف صورة غلاف أو ارفع صورة من جهازك.');

      const dates = container.querySelector('#trip-in-dates').value.split(',').map(s => s.trim()).filter(Boolean);
      const times = container.querySelector('#trip-in-times').value.split(',').map(s => s.trim()).filter(Boolean);
      const parseLines = (selector) => container.querySelector(selector).value.split('\n').map(line => line.trim()).filter(Boolean);
      const itinerary = parseLines('#trip-in-itinerary').map((line, index) => {
        const [time = '', activity = '', ...descriptionParts] = line.split('|').map(part => part.trim());
        const previous = this.editingTrip?.itinerary?.[index];
        const description = descriptionParts.join(' | ');
        return {
          time,
          activity: { ar: activity, en: previous?.activity?.en || activity },
          description: { ar: description, en: previous?.description?.en || description }
        };
      }).filter(step => step.time || step.activity.ar || step.description.ar);
      const included = parseLines('#trip-in-included');
      const excluded = parseLines('#trip-in-excluded');
      const selectedLandmarkIds = new Set(Array.from(container.querySelectorAll('input[name="trip-landmark-checkbox"]:checked')).map(input => input.value));
      const availableLandmarks = new Map([
        ...this.landmarkCatalog,
        ...(this.editingTrip?.landmarks || [])
      ].map(landmark => [landmark.id, landmark]));
      const selectedLandmarks = [...availableLandmarks.values()]
        .filter(landmark => selectedLandmarkIds.has(landmark.id))
        .map(landmark => ({ ...landmark, image: landmark.image || landmark.img }));

      const tripPayload = {
        ...(this.editingTrip || {}),
        id: tripId,
        title: { ...(this.editingTrip?.title || {}), ar: titleAr, en: titleEn },
        region: { ...(this.editingTrip?.region || {}), ar: regionAr, en: this.editingTrip?.region?.en || regionAr },
        duration: { ...(this.editingTrip?.duration || {}), ar: durationAr, en: this.editingTrip?.duration?.en || durationAr },
        description: { ...(this.editingTrip?.description || {}), ar: descAr, en: this.editingTrip?.description?.en || descAr },
        priceJOD: price,
        discountPercent: discount,
        adultPriceJOD: price,
        childPriceJOD: childPrice,
        rewardPoints: points,
        stampId: container.querySelector('#trip-in-stamp')?.value || null,
        imageUrl: imageUrl,
        videoUrl,
        gallery,
        landmarks: selectedLandmarks,
        itinerary,
        includedServices: { ...(this.editingTrip?.includedServices || {}), ar: included, en: this.editingTrip?.includedServices?.en || included },
        excludedServices: { ...(this.editingTrip?.excludedServices || {}), ar: excluded, en: this.editingTrip?.excludedServices?.en || excluded },
        availableDates: dates,
        departureTimes: times,
        rating: this.editingTrip ? this.editingTrip.rating : 4.9,
        reviewsCount: this.editingTrip ? this.editingTrip.reviewsCount : 24,
        isUnesco: this.editingTrip ? this.editingTrip.isUnesco : false,
        category: this.editingTrip ? this.editingTrip.category : 'archaeology'
      };

      const exists = state.destinations.some(d => d.id === tripId);
      const updatedList = exists
        ? state.destinations.map(d => d.id === tripId ? tripPayload : d)
        : [tripPayload, ...state.destinations];

      // 1. تحديث التخزين المحلي والحالة
      Storage.set(STORAGE_KEYS.DESTINATIONS, updatedList);
      appStore.setState({ destinations: updatedList }, 'DESTINATIONS_UPDATED');

      // 2. النشر السحابي المباشر في Firebase
      const saved = await FirebaseService.saveToCloud('settings', 'destinations_data', { list: updatedList });

      alert(saved ? '✅ تم حفظ بيانات الرحلة ونشرها سحابياً لجميع الزوار.' : 'حُفظت الرحلة على هذا الجهاز، لكن تعذرت مزامنتها سحابياً.');
      close();
      if (onRefreshNeeded) onRefreshNeeded();
      } catch (error) {
        alert('تعذر حفظ الرحلة أو رفع وسائطها: ' + error.message);
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
};