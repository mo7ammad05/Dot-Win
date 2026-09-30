/**
 * 🇯🇴 معرض الصور الكامل ونافذة تفاصيل المعالم (Attraction Gallery & Landmark Modal)
 * استعراض فائق الدقة بملء الشاشة مع دعم كامل للتنقل واللمس والكيبورد
 */

class GalleryModalManager {
  constructor() {
    this.images = [];
    this.currentIndex = 0;
    this.initDOM();
  }

  /**
   * إنشاء هياكل النوافذ المنبثقة في الـ DOM
   */
  initDOM() {
    if (document.getElementById('gallery-fullscreen-modal')) return;

    // 1. نافذة معرض الصور بملء الشاشة
    const galleryEl = document.createElement('div');
    galleryEl.id = 'gallery-fullscreen-modal';
    galleryEl.className = 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 hidden animate-in fade-in duration-200';
    galleryEl.innerHTML = `
      <button type="button" id="btn-close-gallery" class="absolute top-6 end-6 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer z-50">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <div class="max-w-5xl w-full space-y-4">
        <div class="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black flex items-center justify-center">
          <img id="gallery-main-img" src="" class="w-full h-full object-contain">

          <!-- أزرار التنقل -->
          <button type="button" id="btn-gallery-prev" class="absolute start-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md cursor-pointer border border-white/20">
            <i class="fa-solid fa-chevron-right text-base"></i>
          </button>
          <button type="button" id="btn-gallery-next" class="absolute end-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md cursor-pointer border border-white/20">
            <i class="fa-solid fa-chevron-left text-base"></i>
          </button>

          <!-- شريط الوصف والترقيم -->
          <div class="absolute bottom-4 inset-x-4 text-center pointer-events-none">
            <span id="gallery-caption-badge" class="bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border border-white/20">
              صورة المعلم (1 / 5)
            </span>
          </div>
        </div>

        <!-- شريط الصور المصغرة بالأسفل -->
        <div id="gallery-thumbs-row" class="flex items-center justify-center gap-2 overflow-x-auto py-2"></div>
      </div>
    `;
    document.body.appendChild(galleryEl);

    // 2. نافذة تفاصيل المحطة والمعلم السياحي
    const landmarkEl = document.createElement('div');
    landmarkEl.id = 'landmark-detail-modal';
    landmarkEl.className = 'fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto hidden animate-in fade-in duration-200';
    landmarkEl.innerHTML = `
      <div class="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-[#E5C598] max-h-[90vh] flex flex-col my-auto animate-in zoom-in-95">
        <div class="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden shrink-0">
          <img id="lm-modal-img" src="" class="w-full h-full object-cover">
          <video id="lm-modal-video" controls class="w-full h-full object-cover hidden"></video>

          <button type="button" id="btn-close-lm-modal" class="absolute top-4 end-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>

          <div class="absolute bottom-3 start-4 end-4 flex items-center justify-between pointer-events-none">
            <span id="lm-modal-tag" class="bg-[#1E293B]/90 backdrop-blur-md text-[#E5C598] text-xs font-mono font-bold px-3 py-1 rounded-xl border border-[#E5C598]/30"></span>
            <span class="bg-white/95 text-[#1E293B] text-xs font-extrabold px-3 py-1 rounded-xl flex items-center gap-1 shadow">
              <i class="fa-solid fa-star text-amber-500"></i>
              <span id="lm-modal-rating">4.9</span>
            </span>
          </div>
        </div>

        <div class="p-6 sm:p-7 overflow-y-auto space-y-4 text-xs">
          <div>
            <h3 id="lm-modal-name" class="text-xl sm:text-2xl font-black text-[#1E293B] leading-tight mb-2"></h3>
            <p id="lm-modal-desc" class="text-sm text-slate-700 leading-relaxed"></p>
          </div>
          <div id="lm-modal-gallery-box" class="space-y-2 pt-2 border-t border-slate-100 hidden">
            <span class="font-extrabold text-[#1E293B] block">معرض صور هذا المعلم:</span>
            <div id="lm-modal-gallery-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-2"></div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span class="text-slate-500 font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-circle-check text-emerald-600"></i>
            <span>معلم رئيسي مخصص ضمن مسار الرحلة</span>
          </span>
          <button type="button" id="btn-close-lm-modal-bottom" class="bg-[#1E293B] hover:bg-slate-800 text-white px-6 py-2 rounded-xl font-bold cursor-pointer">
            إغلاق المعاينة
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(landmarkEl);

    this.bindEvents();
  }

  bindEvents() {
    const galleryEl = document.getElementById('gallery-fullscreen-modal');
    const lmEl = document.getElementById('landmark-detail-modal');

    document.getElementById('btn-close-gallery')?.addEventListener('click', () => this.close());
    document.getElementById('btn-gallery-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('btn-gallery-next')?.addEventListener('click', () => this.next());

    document.getElementById('btn-close-lm-modal')?.addEventListener('click', () => this.closeLandmark());
    document.getElementById('btn-close-lm-modal-bottom')?.addEventListener('click', () => this.closeLandmark());

    // إغلاق عبر زر الهروب ESC والتنقل بالأسهم
    document.addEventListener('keydown', (e) => {
      if (!galleryEl?.classList.contains('hidden')) {
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowRight') this.prev();
        if (e.key === 'ArrowLeft') this.next();
      }
      if (!lmEl?.classList.contains('hidden') && e.key === 'Escape') {
        this.closeLandmark();
      }
    });
  }

  open(images, startIndex = 0) {
    if (!Array.isArray(images) || images.length === 0) return;
    this.images = images.map(item => (typeof item === 'string' ? { url: item, title: '' } : item));
    this.currentIndex = startIndex >= 0 && startIndex < this.images.length ? startIndex : 0;
    this.updateGalleryView();
    document.getElementById('gallery-fullscreen-modal')?.classList.remove('hidden');
  }

  updateGalleryView() {
    const current = this.images[this.currentIndex];
    if (!current) return;

    const imgEl = document.getElementById('gallery-main-img');
    const badgeEl = document.getElementById('gallery-caption-badge');
    const thumbsRow = document.getElementById('gallery-thumbs-row');

    if (imgEl) imgEl.src = current.url;
    if (badgeEl) {
      const caption = current.title?.ar || current.title || 'صورة المعلم';
      badgeEl.textContent = `${caption} (${this.currentIndex + 1} / ${this.images.length})`;
    }

    if (thumbsRow) {
      thumbsRow.innerHTML = this.images.map((img, i) => `
        <button type="button" class="w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
          i === this.currentIndex ? 'border-[#C86D51] scale-105 opacity-100 shadow-md' : 'border-transparent opacity-50 hover:opacity-80'
        }" data-idx="${i}">
          <img src="${img.url}" class="w-full h-full object-cover">
        </button>
      `).join('');

      thumbsRow.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => {
          this.currentIndex = parseInt(btn.getAttribute('data-idx'), 10);
          this.updateGalleryView();
        };
      });
    }
  }

  prev() {
    this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
    this.updateGalleryView();
  }

  next() {
    this.currentIndex = this.currentIndex === this.images.length - 1 ? 0 : this.currentIndex + 1;
    this.updateGalleryView();
  }

  close() {
    document.getElementById('gallery-fullscreen-modal')?.classList.add('hidden');
  }

  openLandmark(landmark) {
    if (!landmark) return;
    const name = landmark.name?.ar || landmark.name || 'معلم سياحي';
    const tag = landmark.tag?.ar || landmark.tag || 'محطة رئيسية';
    const desc = landmark.desc?.ar || landmark.desc || '';
    const img = landmark.image || landmark.img || '';
    const vid = landmark.videoUrl || '';
    const rating = landmark.rating || 4.9;

    document.getElementById('lm-modal-name').textContent = name;
    document.getElementById('lm-modal-tag').textContent = tag;
    document.getElementById('lm-modal-desc').textContent = desc;
    document.getElementById('lm-modal-rating').textContent = rating;

    const imgEl = document.getElementById('lm-modal-img');
    const vidEl = document.getElementById('lm-modal-video');

    if (vid) {
      vidEl.src = vid;
      vidEl.classList.remove('hidden');
      imgEl.classList.add('hidden');
    } else {
      imgEl.src = img;
      imgEl.classList.remove('hidden');
      vidEl.classList.add('hidden');
    }

    const box = document.getElementById('lm-modal-gallery-box');
    const grid = document.getElementById('lm-modal-gallery-grid');
    if (landmark.photos && landmark.photos.length > 0) {
      grid.innerHTML = landmark.photos.map(p => `
        <img src="${p}" class="w-full aspect-[4/3] rounded-xl object-cover border border-slate-200">
      `).join('');
      box.classList.remove('hidden');
    } else {
      box.classList.add('hidden');
    }

    document.getElementById('landmark-detail-modal')?.classList.remove('hidden');
  }

  closeLandmark() {
    const vidEl = document.getElementById('lm-modal-video');
    if (vidEl) { vidEl.pause(); vidEl.src = ''; }
    document.getElementById('landmark-detail-modal')?.classList.add('hidden');
  }
}

export const galleryModal = new GalleryModalManager();