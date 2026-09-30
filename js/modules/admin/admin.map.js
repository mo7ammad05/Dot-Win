import { FirebaseService } from '../../services/firebase.service.js';
import { appStore } from '../../state/store.js';
import { Storage, STORAGE_KEYS } from '../../state/storage.js';
import { UploaderService } from '../../services/uploader.service.js';

export const AdminMap = {
  selectedGovId: 'amman',
  isEditingPinMode: false,
  mapBgUrl: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=1200&auto=format&fit=crop&q=80',

  /**
   * تنظيف قائمة المحافظات من أي صور Base64 قديمة لحماية حجم مستند فايربيس
   */
  sanitizeGovData(govs = []) {
    return govs.map(g => ({
      ...g,
      photos: Array.isArray(g.photos)
        ? g.photos.filter(p => typeof p === 'string' && !p.startsWith('data:'))
        : [],
      videoUrl: (typeof g.videoUrl === 'string' && g.videoUrl.startsWith('data:')) ? '' : (g.videoUrl || '')
    }));
  },

  /**
   * بناء الواجهة الكاملة لمحرر الخريطة التفاعلية
   */
  renderFullView(governorates = [], stamps = []) {
    const selectedGov = governorates.find(g => g.id === this.selectedGovId) || governorates[0] || {};
    const associatedStamp = stamps.find(s => s.governorateId === selectedGov.id || s.id === selectedGov.stampId);
    const savedMapBg = Storage.get(STORAGE_KEYS.MAP_IMAGE, this.mapBgUrl);

    return `
      <div class="space-y-6 animate-in fade-in duration-200">
        
        <!-- الترويسة وأدوات التحكم العلوية -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl">🗺️</span>
                <h3 class="font-extrabold text-base text-[#1E293B]">
                  تعديل صفحة الخريطة التفاعلية ومواقع النقاط المباشرة
                </h3>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                انقر مباشرة على الخريطة لتثبيت مكان النقطة بدقة، أو ارفع صوراً وفيديوهات جديدة لكل محافظة لحفظها في السحابة.
              </p>
            </div>

            <!-- أزرار الإجراء السريع -->
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                id="toggle-pin-mode-btn"
                class="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow cursor-pointer ${
                  this.isEditingPinMode
                    ? 'bg-[#D97706] text-white ring-4 ring-[#D97706]/30 animate-pulse'
                    : 'bg-[#1E293B] text-white hover:bg-slate-800'
                }"
              >
                ${this.isEditingPinMode
                  ? 'وضع نقل النقاط مفعّل (انقر على الخريطة لتثبيت مكان جديد) ✓'
                  : 'تفعيل وضع النقر لنقل النقطة على الخريطة 📍'}
              </button>

              <select
                id="select-gov-edit-dropdown"
                class="bg-[#FAF8F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-[#1E293B] cursor-pointer"
              >
                ${governorates.map(g => `
                  <option value="${g.id}" ${this.selectedGovId === g.id ? 'selected' : ''}>
                    ${g.name?.ar || g.name} (${g.name?.en || ''})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- رفع وتغيير صورة خلفية الخريطة -->
          <div class="pt-2 flex flex-col md:flex-row items-stretch md:items-end gap-3 text-xs">
            <div class="flex-1 space-y-1">
              <label class="font-bold text-slate-700 block">رفع صورة خريطة جديدة أو تعديل رابطها:</label>
              <input
                type="url"
                id="map-bg-url-input"
                value="${savedMapBg}"
                placeholder="https://... رابط صورة الخريطة"
                class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#1E293B]"
              />
              <div class="flex items-center gap-2 pt-1">
                <input type="file" id="map-bg-file-input" accept="image/*" class="hidden" />
                <button type="button" id="map-bg-file-trigger" class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                  <i class="fa-solid fa-upload me-1" aria-hidden="true"></i>رفع صورة من الجهاز
                </button>
                <span id="map-bg-file-name" class="text-[10px] text-slate-500"></span>
              </div>
            </div>
            <button
              type="button"
              id="save-map-bg-btn"
              class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-5 py-2.5 rounded-xl font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              حفظ صورة الخريطة 💾
            </button>
          </div>
        </div>

        <!-- المعمارية المزدوجة: كانفاس الخريطة + محرر المحافظة -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- كانفاس الخريطة -->
          <div
            id="interactive-map-canvas"
            class="lg:col-span-5 bg-slate-900 rounded-3xl relative h-[560px] sm:h-[640px] shadow-2xl border-2 border-slate-200 overflow-hidden select-none ${
              this.isEditingPinMode ? 'cursor-crosshair ring-4 ring-[#D97706]' : ''
            }"
          >
            <img
              src="${savedMapBg}"
              alt="Map Canvas"
              class="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />
            <div class="absolute inset-0 bg-slate-950/40 pointer-events-none"></div>

            <div class="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none z-20">
              <div class="px-3.5 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold border shadow flex items-center gap-1.5 ${
                this.isEditingPinMode
                  ? 'bg-amber-600 text-white border-amber-300 ring-2 ring-amber-400 animate-pulse'
                  : 'bg-slate-900/85 text-white border-white/20'
              }">
                <span>📍</span>
                <span>
                  ${this.isEditingPinMode
                    ? `انقر في أي مكان لنقل نقطة: ${selectedGov.name?.ar || ''}`
                    : `المحافظة المحددة: ${selectedGov.name?.ar || ''}`}
                </span>
              </div>
            </div>

            ${governorates.map(gov => {
              const isSelected = gov.id === this.selectedGovId;
              const top = gov.pinPosition?.top || '50%';
              const left = gov.pinPosition?.left || '50%';

              return `
                <div
                  style="top: ${top}; left: ${left};"
                  class="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none transition-transform ${
                    isSelected ? 'scale-125 z-30' : ''
                  }"
                >
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md ${
                    isSelected ? 'bg-[#C86D51] ring-4 ring-white' : 'bg-slate-800 border border-white/40'
                  }">
                    📍
                  </div>
                  <span class="text-[9px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap shadow-sm font-arabic">
                    ${gov.name?.ar || gov.name}
                  </span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- لوحة تعديل التفاصيل والصور -->
          <div class="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <h4 class="font-extrabold text-base text-[#1E293B]">
                تعديل بيانات وصور: <span class="text-[#C86D51]">${selectedGov.name?.ar || ''}</span>
              </h4>
              <span class="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg">
                ID: ${selectedGov.id}
              </span>
            </div>

            <!-- إحداثيات النقطة -->
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span class="font-bold text-amber-900 block">📍 إحداثيات النقطة على الخريطة:</span>
                <span class="text-[11px] text-amber-700">انقر على الكانفاس لتثبيت الموقع، أو أدخل النسب يدوياً:</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1.5">
                  <span class="text-slate-600 font-bold">Top:</span>
                  <input
                    type="text"
                    id="gov-coord-top"
                    value="${selectedGov.pinPosition?.top || '50%'}"
                    class="w-18 bg-white border border-amber-300 rounded-xl px-2 py-1 text-xs font-mono font-bold text-center text-[#C86D51]"
                  />
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-slate-600 font-bold">Left:</span>
                  <input
                    type="text"
                    id="gov-coord-left"
                    value="${selectedGov.pinPosition?.left || '50%'}"
                    class="w-18 bg-white border border-amber-300 rounded-xl px-2 py-1 text-xs font-mono font-bold text-center text-[#C86D51]"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="font-bold text-slate-700 block mb-1">العنوان التعريفي البارز:</label>
                <input
                  type="text"
                  id="gov-title-ar-in"
                  value="${selectedGov.title?.ar || selectedGov.title || ''}"
                  class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 font-bold text-[#1E293B]"
                />
              </div>

              <div>
                <label class="font-bold text-slate-700 block mb-1">الوصف العام للمحافظة:</label>
                <textarea
                  id="gov-desc-ar-in"
                  rows="2"
                  class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-2.5 leading-relaxed text-[#1E293B]"
                >${selectedGov.description?.ar || selectedGov.description || ''}</textarea>
              </div>

              <div>
                <label class="font-bold text-slate-700 block mb-1">تاريخها ونبذتها التراثية العريقة:</label>
                <textarea
                  id="gov-history-ar-in"
                  rows="3"
                  class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-2.5 leading-relaxed text-[#1E293B]"
                >${selectedGov.history?.ar || selectedGov.history || ''}</textarea>
              </div>

              <!-- ألبوم صور المحافظة -->
              <div class="space-y-2 pt-2 border-t border-slate-100">
                <div class="flex items-center justify-between">
                  <label class="font-bold text-[#1E293B]">صور ومعالم المحافظة في الخريطة:</label>
                  <span class="font-mono text-slate-400 text-[11px]">${selectedGov.photos?.length || 0} صور</span>
                </div>

                <!-- شبكة مصغرات الصور -->
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  ${(selectedGov.photos || []).map((photo, idx) => `
                    <div class="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                      <img src="${photo}" alt="" class="w-full h-full object-cover" />
                      <button
                        type="button"
                        class="delete-gov-photo-btn absolute top-1 end-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer transition shadow"
                        data-idx="${idx}"
                        title="حذف الصورة"
                      >
                        ✕
                      </button>
                    </div>
                  `).join('')}
                </div>

                <!-- رفع وإضافة صور جديدة -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <input
                    type="url"
                    id="new-gov-photo-url-in"
                    placeholder="https://... رابط مباشر لصورة"
                    class="flex-1 bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1E293B]"
                  />
                  <input type="file" id="new-gov-photo-files-in" accept="image/*" multiple class="hidden" />
                  <button type="button" id="trigger-gov-photo-files-btn" class="border border-slate-300 bg-white text-slate-700 px-3 py-1.5 rounded-xl font-bold cursor-pointer">
                    <i class="fa-solid fa-upload me-1" aria-hidden="true"></i>اختر صوراً من جهازك
                  </button>
                  <button
                    type="button"
                    id="add-gov-photo-btn"
                    class="bg-[#1E293B] hover:bg-slate-800 text-white px-4 py-1.5 rounded-xl font-bold transition cursor-pointer"
                  >
                    إضافة ورفع للصور 🚀
                  </button>
                </div>
                <div id="gov-photos-status" class="text-[11px] text-slate-500 font-semibold"></div>
              </div>

              <!-- فيديو استكشافي للمحافظة -->
              <div class="pt-2 border-t border-slate-100 space-y-1">
                <label class="font-bold text-slate-700 block mb-1">فيديو استكشافي للمحافظة (رابط أو ملف MP4):</label>
                <div class="flex items-center gap-2">
                  <input
                    type="url"
                    id="gov-video-url-in"
                    value="${selectedGov.videoUrl || ''}"
                    placeholder="https://... رابط ملف الفيديو"
                    class="flex-1 bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-[#1E293B]"
                  />
                  <input type="file" id="gov-video-file-in" accept="video/*" class="hidden" />
                  <button type="button" id="trigger-gov-video-file-btn" class="border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-xl font-bold cursor-pointer shrink-0">
                    <i class="fa-solid fa-video me-1"></i>رفع فيديو
                  </button>
                </div>
                <span id="gov-video-file-name" class="text-[11px] text-[#C86D51] font-semibold block"></span>
              </div>

              <!-- الختم المرتبط -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between bg-[#FAF8F5] p-3 rounded-2xl">
                <div>
                  <span class="text-[10px] font-bold text-[#D97706] block">الختم التذكاري المرتبط بالمحافظة:</span>
                  <span class="font-extrabold text-xs text-[#1E293B]">
                    ${associatedStamp?.name?.ar || associatedStamp?.name || 'ختم معتمد'}
                  </span>
                </div>
                <span class="text-2xl">${associatedStamp?.iconType === 'petra' ? '🏛️' : associatedStamp?.iconType === 'coral' ? '🐠' : '🏰'}</span>
              </div>
            </div>

            <!-- زر الحفظ النهائي للمحافظة -->
            <div class="flex justify-end pt-3 border-t">
              <button
                type="button"
                id="save-gov-changes-btn"
                class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-7 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
              >
                حفظ تعديلات المحافظة سحابياً ✓
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  /**
   * ربط كافة مستمعي الأحداث
   */
  bindEvents(container, governorates, stamps, onRefreshNeeded) {
    if (!container) return;

    // استدعاء محددات الملفات
    container.querySelector('#map-bg-file-trigger')?.addEventListener('click', () => container.querySelector('#map-bg-file-input')?.click());
    container.querySelector('#map-bg-file-input')?.addEventListener('change', (event) => {
      container.querySelector('#map-bg-file-name').textContent = event.target.files?.[0]?.name ? `تم اختيار: ${event.target.files[0].name}` : '';
    });

    container.querySelector('#trigger-gov-video-file-btn')?.addEventListener('click', () => container.querySelector('#gov-video-file-in')?.click());
    container.querySelector('#gov-video-file-in')?.addEventListener('change', (event) => {
      container.querySelector('#gov-video-file-name').textContent = event.target.files?.[0]?.name ? `ملف الفيديو المختار: ${event.target.files[0].name}` : '';
    });

    container.querySelector('#trigger-gov-photo-files-btn')?.addEventListener('click', () => container.querySelector('#new-gov-photo-files-in')?.click());
    container.querySelector('#new-gov-photo-files-in')?.addEventListener('change', (event) => {
      const count = event.target.files?.length || 0;
      container.querySelector('#gov-photos-status').textContent = count > 0 ? `تم تحديد ${count} صور جاهزة للرفع` : '';
    });

    // 1. تبديل وضع نقل النقاط
    container.querySelector('#toggle-pin-mode-btn')?.addEventListener('click', () => {
      this.isEditingPinMode = !this.isEditingPinMode;
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 2. تغيير المحافظة
    container.querySelector('#select-gov-edit-dropdown')?.addEventListener('change', (e) => {
      this.selectedGovId = e.target.value;
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 3. النقر على الكانفاس لتثبيت إحداثيات النقطة
    const canvas = container.querySelector('#interactive-map-canvas');
    if (canvas) {
      canvas.addEventListener('click', async (e) => {
        if (!this.isEditingPinMode) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const leftPercent = `${Math.round((x / rect.width) * 100)}%`;
        const topPercent = `${Math.round((y / rect.height) * 100)}%`;

        const state = appStore.getState();
        const updatedGovs = this.sanitizeGovData(state.governorates.map(g => {
          if (g.id === this.selectedGovId) {
            return {
              ...g,
              pinPosition: { top: topPercent, left: leftPercent }
            };
          }
          return g;
        }));

        Storage.set(STORAGE_KEYS.GOVERNORATES, updatedGovs);
        appStore.setState({ governorates: updatedGovs }, 'GOVERNORATES_UPDATED');
        const saved = await FirebaseService.saveToCloud('settings', 'governorates_data', { list: updatedGovs });

        alert(saved
          ? `📍 تم تحديث الموقع ومزامنته سحابياً (Top: ${topPercent}, Left: ${leftPercent}).`
          : 'حُدّث الموقع على هذا الجهاز فقط؛ تعذرت مزامنته سحابياً.');
        if (onRefreshNeeded) onRefreshNeeded();
      });
    }

    // 4. حفظ خلفية الخريطة
    container.querySelector('#save-map-bg-btn')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const input = container.querySelector('#map-bg-url-input');
      let url = input ? input.value.trim() : '';
      const file = container.querySelector('#map-bg-file-input')?.files?.[0];

      if (file) {
        btn.disabled = true;
        btn.textContent = 'جارِ رفع الخريطة إلى Cloudinary... ⏳';
        try {
          const res = await new UploaderService().uploadFile(file);
          url = res.cloudinaryUrl || res.dataUrl;
          if (url.startsWith('data:')) throw new Error('فشل الرفع السحابي للخريطة');
          input.value = url;
        } catch (err) {
          alert('تعذر رفع صورة الخريطة: ' + err.message);
          btn.disabled = false;
          btn.textContent = 'حفظ صورة الخريطة 💾';
          return;
        }
      }

      if (url) {
        this.mapBgUrl = url;
        Storage.set(STORAGE_KEYS.MAP_IMAGE, url);
        const saved = await FirebaseService.saveToCloud('settings', 'map_image', { url });
        alert(saved ? '✅ تم حفظ صورة خلفية الخريطة سحابياً.' : 'حُفظت محلياً فقط؛ تعذرت المزامنة.');
        btn.disabled = false;
        btn.textContent = 'حفظ صورة الخريطة 💾';
        if (onRefreshNeeded) onRefreshNeeded();
      }
    });

    // 5. إضافة صور المحافظة مع الرفع المباشر لـ Cloudinary
    container.querySelector('#add-gov-photo-btn')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const inEl = container.querySelector('#new-gov-photo-url-in');
      const photoUrl = inEl ? inEl.value.trim() : '';
      const fileInput = container.querySelector('#new-gov-photo-files-in');
      const files = Array.from(fileInput?.files || []);

      if (!photoUrl && !files.length) {
        alert('يرجى اختيار صور من جهازك أو وضع رابط صالح أولاً.');
        return;
      }

      let uploadedUrls = [];
      if (files.length) {
        btn.disabled = true;
        btn.textContent = `جارِ رفع ${files.length} صور إلى Cloudinary... ⏳`;
        try {
          uploadedUrls = await Promise.all(files.map(async (file) => {
            const res = await new UploaderService().uploadFile(file);
            const link = res.cloudinaryUrl || res.dataUrl;
            if (link.startsWith('data:')) {
              throw new Error('تم رفض تحويل الصورة لـ Base64 لسلامة السحابة');
            }
            return link;
          }));
        } catch (err) {
          alert('تعذر رفع الصور إلى السحابة: ' + err.message);
          btn.disabled = false;
          btn.textContent = 'إضافة ورفع للصور 🚀';
          return;
        }
      }

      const photosToAdd = [...(photoUrl ? [photoUrl] : []), ...uploadedUrls];
      const state = appStore.getState();

      const updatedGovs = this.sanitizeGovData(state.governorates.map(g => {
        if (g.id === this.selectedGovId) {
          return {
            ...g,
            photos: [...(g.photos || []), ...photosToAdd]
          };
        }
        return g;
      }));

      Storage.set(STORAGE_KEYS.GOVERNORATES, updatedGovs);
      appStore.setState({ governorates: updatedGovs }, 'GOVERNORATES_UPDATED');
      const saved = await FirebaseService.saveToCloud('settings', 'governorates_data', { list: updatedGovs });

      alert(saved ? '✅ تم رفع وحفظ الصور في السحابة بنجاح!' : 'حُفظت الصور على هذا الجهاز فقط؛ تعذرت المزامنة.');
      btn.disabled = false;
      btn.textContent = 'إضافة ورفع للصور 🚀';
      if (fileInput) fileInput.value = '';
      if (onRefreshNeeded) onRefreshNeeded();
    });

    // 6. حذف صورة من المحافظة
    container.querySelectorAll('.delete-gov-photo-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.getAttribute('data-idx'));
        const state = appStore.getState();

        const updatedGovs = this.sanitizeGovData(state.governorates.map(g => {
          if (g.id === this.selectedGovId) {
            const list = [...(g.photos || [])];
            list.splice(idx, 1);
            return { ...g, photos: list };
          }
          return g;
        }));

        Storage.set(STORAGE_KEYS.GOVERNORATES, updatedGovs);
        appStore.setState({ governorates: updatedGovs }, 'GOVERNORATES_UPDATED');
        await FirebaseService.saveToCloud('settings', 'governorates_data', { list: updatedGovs });
        if (onRefreshNeeded) onRefreshNeeded();
      });
    });

    // 7. حفظ التعديلات الكاملة للمحافظة والفيديو
    container.querySelector('#save-gov-changes-btn')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const topIn = container.querySelector('#gov-coord-top').value.trim();
      const leftIn = container.querySelector('#gov-coord-left').value.trim();
      const titleIn = container.querySelector('#gov-title-ar-in').value.trim();
      const descIn = container.querySelector('#gov-desc-ar-in').value.trim();
      const histIn = container.querySelector('#gov-history-ar-in').value.trim();
      let vidIn = container.querySelector('#gov-video-url-in').value.trim();
      const videoFile = container.querySelector('#gov-video-file-in')?.files?.[0];

      if (videoFile) {
        btn.disabled = true;
        btn.textContent = 'جارِ رفع الفيديو إلى Cloudinary... ⏳';
        try {
          const res = await new UploaderService().uploadFile(videoFile);
          vidIn = res.cloudinaryUrl || res.dataUrl;
          if (vidIn.startsWith('data:')) throw new Error('فيديو غير صالح للحفظ السحابي');
        } catch (err) {
          alert('تعذر رفع فيديو المحافظة: ' + err.message);
          btn.disabled = false;
          btn.textContent = 'حفظ تعديلات المحافظة سحابياً ✓';
          return;
        }
      }

      btn.disabled = true;
      btn.textContent = 'جارِ حفظ التعديلات في السحابة... ⏳';

      const state = appStore.getState();
      const updatedGovs = this.sanitizeGovData(state.governorates.map(g => {
        if (g.id === this.selectedGovId) {
          return {
            ...g,
            title: { ar: titleIn, en: g.title?.en || titleIn },
            description: { ar: descIn, en: g.description?.en || descIn },
            history: { ar: histIn, en: g.history?.en || histIn },
            videoUrl: vidIn || undefined,
            pinPosition: { top: topIn, left: leftIn }
          };
        }
        return g;
      }));

      Storage.set(STORAGE_KEYS.GOVERNORATES, updatedGovs);
      appStore.setState({ governorates: updatedGovs }, 'GOVERNORATES_UPDATED');
      const saved = await FirebaseService.saveToCloud('settings', 'governorates_data', { list: updatedGovs });

      alert(saved ? '✅ تم حفظ تعديلات المحافظة ونشرها سحابياً لجميع الأجهزة!' : 'حُفظت التعديلات على هذا الجهاز فقط؛ تعذرت مزامنتها سحابياً.');
      btn.disabled = false;
      btn.textContent = 'حفظ تعديلات المحافظة سحابياً ✓';
      if (onRefreshNeeded) onRefreshNeeded();
    });
  }
};