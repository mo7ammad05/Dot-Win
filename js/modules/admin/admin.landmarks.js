import { FirebaseService } from '../../services/firebase.service.js';
import { appStore } from '../../state/store.js';
import { Storage, STORAGE_KEYS } from '../../state/storage.js';
import { uploaderService } from '../../services/uploader.service.js';

export const AdminLandmarks = {
  activeSearchQuery: '',
  activeGovFilter: 'all',
  editingLandmark: null,

  /**
   * تنظيف قائمة المعالم من نصوص الـ Base64 وقيم undefined الممنوعة في فايربيس
   */
  sanitizeLandmarksData(list = []) {
    const fallbackImage = 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800';
    return (list || []).map(lm => {
      let img = lm.image || fallbackImage;
      if (typeof img === 'string' && img.startsWith('data:')) {
        img = fallbackImage;
      }
      let vid = lm.videoUrl || '';
      if (typeof vid === 'string' && vid.startsWith('data:')) {
        vid = '';
      }
      return {
        id: String(lm.id || `lm-${Date.now()}`),
        name: { ar: String(lm.name?.ar || lm.name || ''), en: String(lm.name?.en || '') },
        tag: { ar: String(lm.tag?.ar || lm.tag || 'معلم سياحي'), en: String(lm.tag?.en || '') },
        desc: { ar: String(lm.desc?.ar || lm.desc || ''), en: String(lm.desc?.en || '') },
        image: String(img),
        videoUrl: String(vid),
        governorateId: String(lm.governorateId || 'amman'),
        rating: Number(lm.rating || 4.9)
      };
    });
  },

  /**
   * بناء الواجهة الكاملة لتبويب المكتبة الشاملة للمعالم البارزة
   */
  renderFullView(landmarks = [], governorates = []) {
    const sanitizedList = this.sanitizeLandmarksData(landmarks);
    const filtered = sanitizedList.filter(lm => {
      const q = this.activeSearchQuery.toLowerCase().trim();
      const nameAr = lm.name?.ar || lm.name || '';
      const nameEn = lm.name?.en || '';
      const tagAr = lm.tag?.ar || lm.tag || '';
      const descAr = lm.desc?.ar || lm.desc || '';

      const matchSearch = !q || 
        nameAr.toLowerCase().includes(q) ||
        nameEn.toLowerCase().includes(q) ||
        tagAr.toLowerCase().includes(q) ||
        descAr.toLowerCase().includes(q);

      const matchGov = this.activeGovFilter === 'all' || lm.governorateId === this.activeGovFilter;
      return matchSearch && matchGov;
    });

    return `
      <div class="space-y-6 animate-in fade-in duration-200">
        
        <!-- الترويسة وزر إضافة معلم جديد -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl">🏛️</span>
              <h3 class="font-extrabold text-base text-[#1E293B]">
                المكتبة الشاملة للمعالم السياحية البارزة (Master Landmarks)
              </h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              تصميم وتعديل معالم المملكة بالتفصيل (صور، فيديو، وصف، موقع) وتوثيقها سحابياً لجميع الرحلات.
            </p>
          </div>

          <button
            type="button"
            id="open-add-landmark-modal-btn"
            class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition shrink-0 cursor-pointer"
          >
            <span>+ إضافة معلم جديد للمكتبة 🏛️</span>
          </button>
        </div>

        <!-- شريط البحث وفلترة المحافظات -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="relative flex-1 w-full">
            <span class="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              id="landmark-search-input"
              value="${this.activeSearchQuery}"
              placeholder="بحث باسم المعلم، التصنيف، الوصف..."
              class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl ps-10 pe-4 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#C86D51]"
            />
          </div>

          <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <label class="text-xs font-bold text-slate-500">المحافظة:</label>
            <select
              id="landmark-gov-filter"
              class="bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] cursor-pointer"
            >
              <option value="all" ${this.activeGovFilter === 'all' ? 'selected' : ''}>كل المحافظات</option>
              ${governorates.map(g => `
                <option value="${g.id}" ${this.activeGovFilter === g.id ? 'selected' : ''}>
                  ${g.name?.ar || g.name}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- شبكة بطاقات المعالم -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.length === 0 ? `
            <div class="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 font-bold text-xs">
              لا توجد معالم تطابق معايير البحث.
            </div>
          ` : filtered.map(lm => this.renderLandmarkCard(lm, governorates)).join('')}
        </div>

        <!-- حاوية نافذة المودال -->
        <div id="landmark-modal-container"></div>
      </div>
    `;
  },

  /**
   * توليد بطاقة المعلم الفردية
   */
  renderLandmarkCard(lm, governorates = []) {
    const matchedGov = governorates.find(g => g.id === lm.governorateId);
    const govName = matchedGov ? (matchedGov.name?.ar || matchedGov.name) : 'الأردن';
    const name = lm.name?.ar || lm.name || 'معلم سياحي';
    const tag = lm.tag?.ar || lm.tag || 'أيقونة تراثية';
    const desc = lm.desc?.ar || lm.desc || '';
    const img = (lm.image && !lm.image.startsWith('data:')) ? lm.image : 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800';

    return `
      <div class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-soft-card flex flex-col justify-between hover:border-[#C86D51] transition group">
        <div>
          <div class="relative aspect-video w-full bg-slate-900 overflow-hidden">
            <img src="${img}" alt="${name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <span class="absolute top-3 start-3 bg-[#1E293B]/80 backdrop-blur-md text-[#E5C598] text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-[#E5C598]/30">
              ${tag}
            </span>
            ${lm.videoUrl ? `
              <span class="absolute bottom-3 end-3 bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-300/40">
                فيديو متاح 🎬
              </span>
            ` : ''}
          </div>

          <div class="p-5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-[#C86D51] bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                📍 ${govName}
              </span>
              <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                ⭐ ${lm.rating || 4.9}
              </span>
            </div>

            <h4 class="font-extrabold text-base text-[#1E293B] group-hover:text-[#C86D51] transition-colors leading-tight">
              ${name}
            </h4>
            <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">
              ${desc}
            </p>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            class="edit-landmark-trigger font-extrabold text-slate-700 hover:text-[#C86D51] cursor-pointer"
            data-id="${lm.id}"
          >
            تعديل تفاصيل المعلم ✏️
          </button>

          <button
            type="button"
            class="delete-landmark-trigger text-rose-500 hover:text-rose-700 cursor-pointer p-1"
            data-id="${lm.id}"
            title="حذف المعلم"
          >
            🗑️
          </button>
        </div>
      </div>
    `;
  },

  /**
   * توليد نافذة المودال لإضافة أو تعديل معلم
   */
  renderLandmarkModal(lm = null, governorates = []) {
    const isEdit = Boolean(lm);
    const nameAr = lm?.name?.ar || lm?.name || '';
    const nameEn = lm?.name?.en || '';
    const tagAr = lm?.tag?.ar || lm?.tag || 'معلم سياحي بارز';
    const descAr = lm?.desc?.ar || lm?.desc || '';
    const image = (lm?.image && !lm.image.startsWith('data:')) ? lm.image : '';
    const videoUrl = (lm?.videoUrl && !lm.videoUrl.startsWith('data:')) ? lm.videoUrl : '';
    const govId = lm?.governorateId || 'amman';

    return `
      <div id="landmark-modal-overlay" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <form id="landmark-editor-form" class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto my-auto border-2 border-[#E5C598]">
          
          <input type="hidden" id="modal-lm-id" value="${lm?.id || `lm-${Date.now()}`}" />

          <div class="flex items-center justify-between border-b pb-4">
            <div>
              <h3 class="font-extrabold text-base text-[#1E293B] flex items-center gap-2">
                <span>🏛️</span>
                <span>${isEdit ? 'تعديل بيانات المعلم البارز' : 'إضافة معلم سياحي بارز جديد للمكتبة الشاملة'}</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                تخصيص كامل للمعلم وحفظ مباشر في السحابة
              </p>
            </div>
            <button type="button" id="close-lm-modal-btn" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer">
              ✕
            </button>
          </div>

          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="font-bold text-slate-700 block mb-1">اسم المعلم البارز (عربي):</label>
                <input type="text" id="lm-in-name-ar" value="${nameAr}" required placeholder="مثال: خزينة الفرعون الأثرية" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-[#1E293B]" />
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">اسم المعلم بالإنجليزية (English):</label>
                <input type="text" id="lm-in-name-en" value="${nameEn}" placeholder="Al-Khazneh Treasury" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#1E293B]" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="font-bold text-slate-700 block mb-1">وسم / شارة المعلم (عربي):</label>
                <input type="text" id="lm-in-tag-ar" value="${tagAr}" required placeholder="أعجوبة نبطية" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#1E293B]" />
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">المحافظة التابع لها المعلم:</label>
                <select id="lm-in-gov-id" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-[#1E293B] cursor-pointer">
                  ${governorates.map(g => `
                    <option value="${g.id}" ${govId === g.id ? 'selected' : ''}>
                      ${g.name?.ar || g.name}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div>
              <label class="font-bold text-slate-700 block mb-1">وصف المعلم التفصيلي (عربي):</label>
              <textarea id="lm-in-desc-ar" rows="3" required class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 leading-relaxed text-[#1E293B]">${descAr}</textarea>
            </div>

            <div>
              <label class="font-bold text-slate-700 block mb-1">صورة المعلم (رابط مباشر أو رفع من جهازك):</label>
              <input type="url" id="lm-in-image" value="${image}" placeholder="https://..." class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono" />
              <div class="flex items-center gap-2 mt-2">
                <input type="file" id="lm-in-image-file" accept="image/*" class="hidden" />
                <button type="button" id="lm-image-file-trigger" class="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100">
                  <i class="fa-solid fa-upload me-1" aria-hidden="true"></i>اختر صورة من جهازك
                </button>
                <span id="lm-image-file-name" class="text-[11px] text-[#C86D51] font-bold"></span>
              </div>
            </div>

            <div>
              <label class="font-bold text-slate-700 block mb-1">فيديو شرح المعلم (رابط أو رفع اختياري):</label>
              <input type="url" id="lm-in-video" value="${videoUrl}" placeholder="https://..." class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono" />
              <div class="flex items-center gap-2 mt-2">
                <input type="file" id="lm-in-video-file" accept="video/*" class="hidden" />
                <button type="button" id="lm-video-file-trigger" class="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100">
                  <i class="fa-solid fa-video me-1"></i>اختر فيديو
                </button>
                <span id="lm-video-file-name" class="text-[11px] text-[#C86D51] font-bold"></span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t flex items-center justify-between">
            <button type="button" id="cancel-lm-modal-btn" class="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer">
              إلغاء
            </button>
            <button type="submit" id="submit-lm-btn" class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-7 py-2.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer">
              حفظ وتطبيق المعلم سحابياً ✓
            </button>
          </div>

        </form>
      </div>
    `;
  },

  /**
   * ربط مستمعي الأحداث
   */
  bindEvents(container, governorates, onRefreshNeeded) {
    if (!container) return;

    // 1. البحث الحي
    container.querySelector('#landmark-search-input')?.addEventListener('input', (e) => {
      this.activeSearchQuery = e.target.value;
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 2. فلترة المحافظات
    container.querySelector('#landmark-gov-filter')?.addEventListener('change', (e) => {
      this.activeGovFilter = e.target.value;
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 3. فتح مودال إضافة معلم جديد
    container.querySelector('#open-add-landmark-modal-btn')?.addEventListener('click', () => {
      this.editingLandmark = null;
      const modalBox = container.querySelector('#landmark-modal-container');
      if (modalBox) {
        modalBox.innerHTML = this.renderLandmarkModal(null, governorates);
        this.bindModalEvents(container, governorates, onRefreshNeeded);
      }
    });

    // 4. تعديل معلم
    container.querySelectorAll('.edit-landmark-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const state = appStore.getState();
        const list = this.sanitizeLandmarksData(state.masterLandmarks || []);
        const lm = list.find(l => l.id === id);
        if (lm) {
          this.editingLandmark = lm;
          const modalBox = container.querySelector('#landmark-modal-container');
          if (modalBox) {
            modalBox.innerHTML = this.renderLandmarkModal(lm, governorates);
            this.bindModalEvents(container, governorates, onRefreshNeeded);
          }
        }
      });
    });

    // 5. حذف معلم
    container.querySelectorAll('.delete-landmark-trigger').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('هل أنت متأكد من حذف هذا المعلم من المكتبة الشاملة؟')) {
          const state = appStore.getState();
          const list = this.sanitizeLandmarksData(state.masterLandmarks || []);
          const updated = list.filter(l => l.id !== id);

          Storage.set(STORAGE_KEYS.LANDMARKS, updated);
          appStore.setState({ masterLandmarks: updated }, 'LANDMARKS_UPDATED');
          
          const cleanPayload = JSON.parse(JSON.stringify({ list: updated }));
          const saved = await FirebaseService.saveToCloud('settings', 'landmarks_data', cleanPayload);

          alert(saved ? '✅ تم حذف المعلم ومزامنته سحابياً بنجاح.' : 'حُفظ المعلم على هذا الجهاز فقط؛ تعذرت مزامنته سحابياً.');
          if (onRefreshNeeded) onRefreshNeeded();
        }
      });
    });
  },

  /**
   * ربط أحداث المودال الداخلي
   */
  bindModalEvents(container, governorates, onRefreshNeeded) {
    const modalBox = container.querySelector('#landmark-modal-container');
    const close = () => { if (modalBox) modalBox.innerHTML = ''; };

    container.querySelector('#close-lm-modal-btn')?.addEventListener('click', close);
    container.querySelector('#cancel-lm-modal-btn')?.addEventListener('click', close);
    container.querySelector('#lm-image-file-trigger')?.addEventListener('click', () => container.querySelector('#lm-in-image-file')?.click());
    container.querySelector('#lm-video-file-trigger')?.addEventListener('click', () => container.querySelector('#lm-in-video-file')?.click());

    container.querySelector('#lm-in-image-file')?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      container.querySelector('#lm-image-file-name').textContent = file ? `تم اختيار: ${file.name}` : '';
    });

    container.querySelector('#lm-in-video-file')?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      container.querySelector('#lm-video-file-name').textContent = file ? `تم اختيار: ${file.name}` : '';
    });

    container.querySelector('#landmark-editor-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = container.querySelector('#submit-lm-btn');
      
      const state = appStore.getState();
      const list = this.sanitizeLandmarksData(state.masterLandmarks || []);

      const id = container.querySelector('#modal-lm-id').value;
      const nameAr = container.querySelector('#lm-in-name-ar').value.trim();
      const nameEn = container.querySelector('#lm-in-name-en').value.trim() || nameAr;
      const tagAr = container.querySelector('#lm-in-tag-ar').value.trim();
      const descAr = container.querySelector('#lm-in-desc-ar').value.trim();
      let image = container.querySelector('#lm-in-image').value.trim();
      let videoUrl = container.querySelector('#lm-in-video').value.trim();

      const imageFile = container.querySelector('#lm-in-image-file').files?.[0];
      const videoFile = container.querySelector('#lm-in-video-file').files?.[0];

      submitBtn.disabled = true;
      submitBtn.textContent = 'جارِ رفع الوسائط وحفظ المعلم سحابياً... ⏳';

      try {
        if (imageFile) {
          const res = await uploaderService.uploadFile(imageFile);
          image = res.cloudinaryUrl || res.dataUrl;
          if (image.startsWith('data:')) {
            throw new Error('فشل الرفع السحابي للصورة، تم رفض Base64 لسلامة قاعدة البيانات.');
          }
        }

        if (videoFile) {
          const res = await uploaderService.uploadFile(videoFile);
          videoUrl = res.cloudinaryUrl || res.dataUrl;
          if (videoUrl.startsWith('data:')) {
            throw new Error('فشل الرفع السحابي للفيديو.');
          }
        }
      } catch (err) {
        alert('تعذر رفع الوسائط سحابياً: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'حفظ وتطبيق المعلم سحابياً ✓';
        return;
      }

      if (!image) {
        alert('يرجى إدخال رابط صورة أو اختيار صورة من جهازك.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'حفظ وتطبيق المعلم سحابياً ✓';
        return;
      }

      const govId = container.querySelector('#lm-in-gov-id').value;

      // بناء الكائن بدون أي قيمة undefined نهائياً
      const payload = {
        id: String(id),
        name: { ar: String(nameAr), en: String(nameEn) },
        tag: { ar: String(tagAr), en: String(tagAr) },
        desc: { ar: String(descAr), en: String(descAr) },
        image: String(image || 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800'),
        videoUrl: String(videoUrl || ''), // ضمان أنه نص دائماً وليس undefined
        governorateId: String(govId),
        rating: Number(this.editingLandmark?.rating || 4.9)
      };

      const idx = list.findIndex(l => l.id === id);
      const updatedList = this.sanitizeLandmarksData(
        idx >= 0
          ? list.map(l => l.id === id ? payload : l)
          : [payload, ...list]
      );

      // تنظيف كامل قبل الحفظ السحابي
      const cleanPayload = JSON.parse(JSON.stringify({ list: updatedList }));

      Storage.set(STORAGE_KEYS.LANDMARKS, updatedList);
      appStore.setState({ masterLandmarks: updatedList }, 'LANDMARKS_UPDATED');
      const saved = await FirebaseService.saveToCloud('settings', 'landmarks_data', cleanPayload);

      alert(saved ? '✅ تم حفظ وتعديل المعلم ونشره سحابياً بنجاح!' : 'حُفظ المعلم على هذا الجهاز فقط؛ تعذرت مزامنته سحابياً.');
      close();
      if (onRefreshNeeded) onRefreshNeeded();
    });
  }
};