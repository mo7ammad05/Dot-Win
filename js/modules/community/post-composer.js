/**
 * 🇯🇴 Jordan Tour - Post Composer & Media Uploader Module
 * مسار الملف: js/modules/community/post-composer.js
 * نافذة إنشاء ونشر التجارب السياحية مع رفع الصور والفيديوهات والتحقق من السقف الشهري
 */

import { store } from '../../state/store.js';

export class PostComposer {
  /**
   * @param {Object} options
   * @param {Array} options.destinations - قائمة الوجهات لاختيار مكان الرحلة
   * @param {Object} options.pointsSettings - قواعد وسقف المنشورات الشهرية
   * @param {number} options.userMonthlyPostsCount - عدد منشورات المستخدم خلال الشهر
   * @param {Function} options.onSubmit - دالة استدعاء عند إرسال المنشور
   */
  constructor({
    destinations = [],
    pointsSettings = { postPoints: 25, maxMonthlyPostsPerUser: 5, isMonthlyPostLimitActive: true },
    userMonthlyPostsCount = 0,
    onSubmit = () => {}
  } = {}) {
    this.destinations = destinations;
    this.pointsSettings = pointsSettings;
    this.userMonthlyPostsCount = userMonthlyPostsCount;
    this.onSubmit = onSubmit;
    this.uploadedMediaList = []; // Array of { id, url, type, name }
    this.modalElem = null;
  }

  /**
   * فتح نافذة محرر المنشور المنبثقة
   */
  open() {
    const isAr = store.language === 'ar';
    const postLimit = this.pointsSettings?.maxMonthlyPostsPerUser ?? 5;
    const isLimitActive = this.pointsSettings?.isMonthlyPostLimitActive ?? true;

    // فحص السقف الشهري للمنشورات
    if (isLimitActive && this.userMonthlyPostsCount >= postLimit) {
      alert(
        isAr
          ? `عذراً! لقد بلغت الحد الأقصى المسموح به لنشر المنشورات لهذا الشهر (${postLimit} منشورات) وفق سياسة إدارة المنصة لمنع التكرار والإغراق. يمكنك النشر مجدداً في بداية الشهر القادم.`
          : `You have reached the monthly post limit (${postLimit} posts) per admin policy. You can publish again next month.`
      );
      return;
    }

    this.renderModal();
  }

  /**
   * إغلاق وتفريغ النافذة المنبثقة
   */
  close() {
    if (this.modalElem) {
      this.modalElem.remove();
      this.modalElem = null;
      this.uploadedMediaList = [];
    }
  }

  /**
   * رسم الـ Modal في صفحة الـ DOM
   */
  renderModal() {
    this.close();

    const isAr = store.language === 'ar';
    const postReward = this.pointsSettings?.postPoints ?? 25;
    const postLimit = this.pointsSettings?.maxMonthlyPostsPerUser ?? 5;

    this.modalElem = document.createElement('div');
    this.modalElem.className = 'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200';

    this.modalElem.innerHTML = `
      <div class="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-auto">
        <!-- الرأس -->
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-[#C86D51]/10 text-[#C86D51] flex items-center justify-center font-bold text-base">
              📷
            </span>
            <h3 class="font-extrabold text-lg text-[#1E293B]">
              ${isAr ? 'نشر تجربة استكشافية جديدة' : 'Publish Expedition Story'}
            </h3>
          </div>
          <button type="button" id="close-composer-btn" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <!-- تنبيه النقاط وسقف الشهر وموافقة الإدارة -->
        <div class="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-xs text-amber-900 space-y-1.5 shadow-2xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-bold">
            <span class="flex items-center gap-1.5 text-amber-950 font-black">
              <span>🪙</span>
              <span>${isAr ? `مكافأة النشر المعتمدة: +${postReward} نقطة ولاء` : `Publishing Reward: +${postReward} Loyalty Points`}</span>
            </span>
            <span class="text-[11px] bg-amber-200/80 text-amber-950 px-2.5 py-0.5 rounded-lg w-fit font-mono font-bold">
              ${isAr ? `منشوراتك: ${this.userMonthlyPostsCount} من ${postLimit} هذا الشهر` : `Quota: ${this.userMonthlyPostsCount} of ${postLimit}`}
            </span>
          </div>
          <p class="text-[11px] text-amber-800 leading-relaxed font-arabic">
            ${isAr
              ? '🛡️ سيتم إرسال تجربتك إلى لوحة الإدارة للمراجعة والتدقيق، وتضاف النقاط تلقائياً إلى رصيدك فور اعتماد المنشور ليظهر للجميع.'
              : '🛡️ Your story will be reviewed by platform moderators. Points will be credited to your wallet once approved.'}
          </p>
        </div>

        <!-- نموذج الإدخال -->
        <form id="post-composer-form" class="space-y-4">
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">
              ${isAr ? 'عنوان التجربة أو الرحلة:' : 'Story Title / Headline:'}
            </label>
            <input
              type="text"
              id="composer-title"
              placeholder="${isAr ? 'مثال: صعود الدير في البتراء عند المغيب وسحر الطبيعة...' : 'e.g. Sunset climb to Ad-Deir in Petra...'}"
              class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#C86D51]"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">
                ${isAr ? 'الوجهة السياحية:' : 'Destination:'}
              </label>
              <select
                id="composer-dest-select"
                class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#C86D51]"
              >
                ${this.destinations
                  .map(
                    (d) => `
                  <option value="${d.id}">
                    ${isAr ? d.title.ar : d.title.en}
                  </option>
                `
                  )
                  .join('')}
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">
                ${isAr ? 'تقييمك للمكان (نجوم):' : 'Your Rating:'}
              </label>
              <select
                id="composer-rating-select"
                class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-700 focus:outline-none focus:border-[#C86D51]"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5.0 ممتازة جداً)</option>
                <option value="4">⭐⭐⭐⭐ (4.0 تجربة رائعة)</option>
                <option value="3">⭐⭐⭐ (3.0 جيدة)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">
              ${isAr ? 'قصتك وتفاصيل الرحلة ونصائحك للمسافرين:' : 'Your Story & Traveler Tips:'}
            </label>
            <textarea
              id="composer-content"
              rows="4"
              placeholder="${isAr ? 'صف جمال المكان، المرشد، الطعام البدوي، التوقيت المفضل للزيارة...' : 'Describe what you saw, best time to visit, guide tips...'}"
              class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-[#1E293B] leading-relaxed focus:outline-none focus:border-[#C86D51]"
              required
            ></textarea>
          </div>

          <!-- رفع الصور والفيديوهات المتعددة -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-[#1E293B] block">
                ${isAr ? 'رفع صور أو فيديوهات للتجربة:' : 'Upload Experience Media:'}
              </label>
              <span id="composer-media-count" class="text-[11px] font-mono font-bold text-slate-400">0 ملفات</span>
            </div>

            <input
              type="file"
              id="composer-file-input"
              accept="image/*,video/*"
              multiple
              class="hidden"
            />

            <button
              type="button"
              id="composer-upload-trigger"
              class="w-full border-2 border-dashed border-[#C86D51]/40 hover:border-[#C86D51] p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all bg-[#FAF8F5] hover:bg-[#C86D51]/5 cursor-pointer"
            >
              <div class="flex items-center gap-2 text-[#C86D51]">
                <i class="fa-solid fa-upload text-lg" aria-hidden="true"></i>
                <span class="text-xs font-bold text-[#1E293B]">${isAr ? 'اضغط لاختيار صور وفيديوهات من جهازك' : 'Click to select media from device'}</span>
              </div>
              <span class="text-[10px] text-slate-500">${isAr ? 'يدعم الصور عالية الدقة وملفات الفيديو MP4' : 'Supports high-res JPG, PNG, and MP4 videos'}</span>
            </button>

            <!-- شبكة المعاينات المصغرة للملفات المرفوعة -->
            <div id="composer-media-preview-grid" class="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3 empty:hidden"></div>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">
              ${isAr ? 'الوسوم (هاشتاغ):' : 'Hashtags:'}
            </label>
            <input
              type="text"
              id="composer-tags"
              value="#الأردن #البتراء #استكشاف"
              placeholder="#البتراء #وادي_رم"
              class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-[#C86D51]"
            />
          </div>

          <!-- الأزرار -->
          <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              id="cancel-composer-btn"
              class="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ${isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              class="bg-gradient-to-r from-[#C86D51] to-[#B45A3E] hover:from-[#B45A3E] hover:to-[#9E452B] text-white px-7 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>${isAr ? 'إرسال المنشور للمراجعة 🚀' : 'Submit for Approval 🚀'}</span>
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(this.modalElem);
    this.bindModalEvents();
  }

  /**
   * ربط أحداث النموذج والرفع
   */
  bindModalEvents() {
    if (!this.modalElem) return;

    // أزرار الإغلاق
    document.getElementById('close-composer-btn')?.addEventListener('click', () => this.close());
    document.getElementById('cancel-composer-btn')?.addEventListener('click', () => this.close());

    // زناد اختيار الملفات
    const fileInput = document.getElementById('composer-file-input');
    const uploadTrigger = document.getElementById('composer-upload-trigger');

    uploadTrigger?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      files.forEach((file) => {
        const isVideo = file.type.startsWith('video');
        const reader = new FileReader();

        reader.onload = (loadEvt) => {
          this.uploadedMediaList.push({
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: loadEvt.target.result,
            type: isVideo ? 'video' : 'image',
            name: file.name
          });
          this.updateMediaPreviews();
        };

        reader.readAsDataURL(file);
      });

      e.target.value = '';
    });

    // إرسال النموذج
    const form = document.getElementById('post-composer-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('composer-title')?.value?.trim();
      const content = document.getElementById('composer-content')?.value?.trim();
      const destId = document.getElementById('composer-dest-select')?.value;
      const rating = Number(document.getElementById('composer-rating-select')?.value || 5);
      const tagsText = document.getElementById('composer-tags')?.value?.trim() || '';

      if (!title || !content) return;

      const matchedDest = this.destinations.find((d) => d.id === destId) || this.destinations[0] || {
        id: 'petra-rose-city',
        title: { ar: 'البتراء الوردية', en: 'Petra Rose City' }
      };

      const firstImage = this.uploadedMediaList.find((m) => m.type === 'image')?.url;
      const firstVideo = this.uploadedMediaList.find((m) => m.type === 'video')?.url;
      const finalImage = firstImage || 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=1000&auto=format&fit=crop&q=80';

      const parsedTags = tagsText
        .split(/[\s,]+/)
        .filter((t) => t.trim().length > 0)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));

      const newPostPayload = {
        authorId: store.user?.uid || '',
        authorName: store.user?.displayName || '',
        authorAvatar: store.user?.photoURL || '',
        title: { ar: title, en: title },
        content: { ar: content, en: content },
        destinationId: matchedDest.id,
        destinationName: {
          ar: matchedDest.title?.ar || matchedDest.title,
          en: matchedDest.title?.en || matchedDest.title
        },
        imageUrl: finalImage,
        videoUrl: firstVideo || undefined,
        rating,
        tags: parsedTags,
        createdAt: store.language === 'ar' ? 'الآن' : 'Just now',
        status: 'pending_approval' // يرسل للمراجعة وفق المعايير
      };

      this.onSubmit(newPostPayload);
      this.close();
    });
  }

  /**
   * تحديث شبكة المعاينات المصغرة
   */
  updateMediaPreviews() {
    const grid = document.getElementById('composer-media-preview-grid');
    const countLabel = document.getElementById('composer-media-count');
    if (!grid) return;

    if (countLabel) {
      countLabel.textContent = `${this.uploadedMediaList.length} ملفات`;
    }

    grid.innerHTML = this.uploadedMediaList
      .map(
        (item, idx) => `
        <div class="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs group">
          ${
            item.type === 'video'
              ? `<video src="${item.url}" class="w-full h-full object-cover"></video><span class="absolute inset-0 flex items-center justify-center text-white bg-black/30 text-xs">🎥</span>`
              : `<img src="${item.url}" alt="" class="w-full h-full object-cover" />`
          }
          <button
            type="button"
            data-delete-idx="${idx}"
            class="delete-media-btn absolute top-1 end-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full transition-colors shadow-xs text-[10px]"
            title="حذف"
          >
            ✕
          </button>
        </div>
      `
      )
      .join('');

    grid.querySelectorAll('.delete-media-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.dataset.deleteIdx);
        this.uploadedMediaList.splice(idx, 1);
        this.updateMediaPreviews();
      });
    });
  }
}