/**
 * 🇯🇴 Jordan Tour - Digital Passport Page Controller
 * مسار الملف: js/modules/passport/passport.page.js
 * مشغل صفحة جواز السفر الرقمي الأردني، شبكة الأختام الـ 12، ونظام التلعيب
 */

import { store } from '../../state/store.js';
import { StampCollector, loadStampCatalog } from './stamp-collector.js';

export class PassportPage {
  constructor() {
    this.collector = new StampCollector();
    this.activeFilter = 'all'; // 'all' | 'unlocked' | 'locked'
    this.selectedStamp = null;

    // عناصر الـ DOM
    this.passportBookletMount = document.getElementById('passport-booklet-mount');
    this.progressBarMount = document.getElementById('passport-progress-mount');
    this.stampsGridMount = document.getElementById('stamps-grid-mount');
    this.filterButtonsContainer = document.getElementById('stamps-filter-buttons');
    this.modalMount = document.getElementById('stamp-detail-modal-mount');
  }

  /**
   * تهيئة الصفحة وتشغيل المكونات
   */
  async init() {
    this.collector.stampsCatalog = await loadStampCatalog();
    this.renderPassportHeader();
    this.renderProgressBar();
    this.renderFilterTabs();
    this.renderStampsGrid();
    this.setupEventListeners();
  }

  /**
   * 1. رسم بطاقة دفتر جواز السفر الرقمي الملكي (Digital Passport Booklet Header)
   */
  renderPassportHeader() {
    if (!this.passportBookletMount) return;

    const isAr = store.language === 'ar';
    const user = store.user || {
      displayName: isAr ? 'أحمد شاشير' : 'Ahmad Shaesher',
      email: 'mhmdsh3sher@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250',
      xp: 1450,
      passportNo: 'JOR-EXP-2026-9041',
    };

    const rank = this.collector.getExplorerRank();
    const unlockedCount = this.collector.getUnlockedCount();
    const totalCount = this.collector.getTotalStampsCount();
    const earnedXP = this.collector.getTotalEarnedXP();

    this.passportBookletMount.innerHTML = `
      <div class="relative w-full bg-gradient-to-br from-[#1E293B] via-[#243348] to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#E5C598]/60 shadow-2xl overflow-hidden">
        
        <!-- التوهج الخلفي والزخارف التراثية -->
        <div class="absolute -top-16 -end-16 w-56 h-56 rounded-full bg-radial from-[#D97706]/20 via-[#C86D51]/10 to-transparent blur-2xl pointer-events-none"></div>
        <div class="absolute bottom-0 start-0 w-48 h-48 rounded-full bg-radial from-[#C86D51]/15 to-transparent blur-xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <!-- معلومات المسافر وهوية الجواز -->
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-start">
            <div class="relative shrink-0">
              <img
                src="${user.photoURL}"
                alt="${user.displayName}"
                class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#E5C598] shadow-2xl"
              />
              <span class="absolute -bottom-2 -end-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#D97706] to-[#C86D51] text-white flex items-center justify-center text-xs font-black border-2 border-white shadow-md">
                ${rank.badge}
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-[#E5C598] text-[11px] font-bold uppercase tracking-wider">
                <span>🇯🇴 ${isAr ? 'جواز سفر المستكشف الرقمي' : 'OFFICIAL DIGITAL EXPLORER PASSPORT'}</span>
              </div>

              <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ${user.displayName}
              </h2>

              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono text-slate-300">
                <span class="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-amber-200">
                  NO: ${user.passportNo || 'JOR-EXP-2026-9041'}
                </span>
                <span>•</span>
                <span class="text-emerald-400 font-bold">
                  ${isAr ? 'الجنسية: الأردنية' : 'Nationality: Jordan'}
                </span>
              </div>

              <!-- الرتبة الحالية -->
              <div class="pt-2 flex items-center justify-center sm:justify-start gap-2">
                <span class="text-xs font-bold text-slate-300">${isAr ? 'الرتبة الشرفية:' : 'Honorary Rank:'}</span>
                <span class="text-xs font-black px-3 py-1 rounded-xl text-white shadow-sm flex items-center gap-1.5" style="background-color: ${rank.color};">
                  <span>${rank.badge}</span>
                  <span>${rank.title}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- بطاقات الإحصائيات السريعة -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[105px]">
              <span class="text-[10px] text-slate-300 block uppercase font-bold tracking-wider mb-1">
                ${isAr ? 'الأختام المجمعة' : 'Stamps'}
              </span>
              <span class="text-2xl font-black font-mono text-[#FDE68A]">
                ${unlockedCount} / ${totalCount}
              </span>
            </div>

            <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[105px]">
              <span class="text-[10px] text-slate-300 block uppercase font-bold tracking-wider mb-1">
                ${isAr ? 'نقاط الخبرة XP' : 'Total XP'}
              </span>
              <span class="text-2xl font-black font-mono text-emerald-300">
                +${earnedXP}
              </span>
            </div>

            <div class="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[105px]">
              <span class="text-[10px] text-slate-300 block uppercase font-bold tracking-wider mb-1">
                ${isAr ? 'نسبة الاكتمال' : 'Progress'}
              </span>
              <span class="text-2xl font-black font-mono text-[#C86D51]">
                ${this.collector.getProgressPercentage()}%
              </span>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  /**
   * 2. رسم شريط التقدم التفاعلي (Progress Bar)
   */
  renderProgressBar() {
    if (!this.progressBarMount) return;

    const percentage = this.collector.getProgressPercentage();
    const unlocked = this.collector.getUnlockedCount();
    const total = this.collector.getTotalStampsCount();
    const isAr = store.language === 'ar';

    this.progressBarMount.innerHTML = `
      <div class="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-soft-card space-y-3">
        <div class="flex items-center justify-between text-xs font-bold text-slate-700">
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-[#D97706]/10 text-[#D97706]">🏆</span>
            <span>${isAr ? 'مسار استكشاف محافظات المملكة الـ 12:' : 'Jordan 12 Governorates Trail Progress:'}</span>
          </div>
          <span class="font-mono text-[#C86D51] font-black text-sm">
            ${percentage}% (${unlocked} ${isAr ? 'من' : 'of'} ${total})
          </span>
        </div>

        <div class="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            class="h-full rounded-full bg-gradient-to-r from-[#D97706] via-[#C86D51] to-emerald-500 transition-all duration-700 ease-out shadow-inner"
            style="width: ${percentage}%;"
          ></div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>${isAr ? 'ابدأ رحلتك واحجز الرحلات لفتح أختام باقي المحافظات' : 'Book tours to unlock remaining governorate seals'}</span>
          ${
            percentage === 100
              ? `<span class="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">🎉 ${isAr ? 'تم استكمال كافة أختام الأردن!' : 'All Seals Collected!'}</span>`
              : `<span class="font-bold text-[#D97706]">${total - unlocked} ${isAr ? 'أختام متبقية' : 'stamps remaining'}</span>`
          }
        </div>
      </div>
    `;
  }

  /**
   * 3. أزرار تصفية الأختام (الكل / المكتسبة / المقفلة)
   */
  renderFilterTabs() {
    if (!this.filterButtonsContainer) return;

    const isAr = store.language === 'ar';
    const unlockedCount = this.collector.getUnlockedCount();
    const totalCount = this.collector.getTotalStampsCount();
    const lockedCount = totalCount - unlockedCount;

    const tabs = [
      { id: 'all', label: isAr ? `كافة الأختام (${totalCount})` : `All Stamps (${totalCount})` },
      { id: 'unlocked', label: isAr ? `الأختام المكتسبة (${unlockedCount}) ✨` : `Unlocked (${unlockedCount}) ✨` },
      { id: 'locked', label: isAr ? `المتبقية المقفلة (${lockedCount}) 🔒` : `Locked (${lockedCount}) 🔒` },
    ];

    this.filterButtonsContainer.innerHTML = `
      <div class="flex flex-wrap items-center gap-2">
        ${tabs
          .map(
            (tab) => `
          <button
            type="button"
            data-filter="${tab.id}"
            class="filter-tab-btn px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              this.activeFilter === tab.id
                ? 'bg-[#1E293B] text-white shadow-md'
                : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
            }"
          >
            ${tab.label}
          </button>
        `
          )
          .join('')}
      </div>
    `;

    this.filterButtonsContainer.querySelectorAll('.filter-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.dataset.filter;
        this.renderFilterTabs();
        this.renderStampsGrid();
      });
    });
  }

  /**
   * 4. رسم شبكة أختام المحافظات الـ 12
   */
  renderStampsGrid() {
    if (!this.stampsGridMount) return;

    const isAr = store.language === 'ar';
    let stamps = this.collector.getAllStampsWithUserStatus();

    if (this.activeFilter === 'unlocked') {
      stamps = stamps.filter((s) => s.unlocked);
    } else if (this.activeFilter === 'locked') {
      stamps = stamps.filter((s) => !s.unlocked);
    }

    if (stamps.length === 0) {
      this.stampsGridMount.innerHTML = `
        <div class="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <span class="text-4xl mb-3 block">🏛️</span>
          <h4 class="text-base font-bold text-slate-700">${isAr ? 'لا توجد أختام تطابق التصفية الحالية' : 'No stamps found matching filter'}</h4>
        </div>
      `;
      return;
    }

    this.stampsGridMount.innerHTML = stamps
      .map((stamp) => {
        const title = isAr ? stamp.name?.ar : stamp.name?.en;
        const gov = isAr ? stamp.governorateName?.ar || stamp.gov : stamp.governorateName?.en || stamp.gov;
        const desc = isAr ? stamp.description?.ar : stamp.description?.en;
        const isUnlocked = stamp.unlocked;

        return `
          <div
            data-stamp-id="${stamp.id}"
            class="stamp-card group relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer shadow-soft-card hover:shadow-floating-modal flex flex-col items-center justify-between text-center ${
              isUnlocked
                ? 'border-[#E5C598] hover:border-[#D97706]'
                : 'border-slate-200 opacity-65 hover:opacity-90'
            }"
          >
            <!-- شارة الحالة بالأعلى -->
            <div class="w-full flex items-center justify-between text-[10px] font-mono font-bold mb-3">
              <span class="px-2 py-0.5 rounded-full ${
                isUnlocked ? 'bg-amber-100 text-[#D97706]' : 'bg-slate-100 text-slate-500'
              }">
                ${stamp.rarity || 'Heritage'}
              </span>
              <span class="${isUnlocked ? 'text-emerald-700 font-bold' : 'text-slate-400'}">
                +${stamp.xp || 100} XP
              </span>
            </div>

            <!-- شكل الختم التراثي بصيغة SVG -->
            <div class="my-2 flex items-center justify-center pointer-events-none">
              ${this.collector.generateStampSVG(stamp, 'md')}
            </div>

            <!-- تفاصيل الختم -->
            <div class="space-y-1.5 mt-2 w-full">
              <h4 class="font-extrabold text-xs sm:text-sm text-[#1E293B] group-hover:text-[#C86D51] transition-colors leading-tight line-clamp-1">
                ${title}
              </h4>
              <span class="text-[11px] text-[#D97706] font-bold block">
                📍 ${gov}
              </span>
              <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                ${desc}
              </p>
            </div>

            <!-- زر قراءة القصة أو شروط الفتح -->
            <div class="w-full pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
              <span class="${isUnlocked ? 'text-emerald-700' : 'text-slate-400'}">
                ${isUnlocked ? (isAr ? 'معتمد في جوازك ✓' : 'Collected ✓') : (isAr ? 'مغلق 🔒' : 'Locked 🔒')}
              </span>
              <span class="text-[#C86D51] group-hover:underline">
                ${isAr ? 'الأسرار والتحدي ←' : 'Story Hook →'}
              </span>
            </div>
          </div>
        `;
      })
      .join('');

    // ربط النقر على البطاقات لفتح الـ Modal
    this.stampsGridMount.querySelectorAll('.stamp-card').forEach((card) => {
      card.addEventListener('click', () => {
        const stampId = card.dataset.stampId;
        const found = this.collector.getAllStampsWithUserStatus().find((s) => s.id === stampId);
        if (found) {
          this.openStampDetailModal(found);
        }
      });
    });
  }

  /**
   * 5. فتح نافذة معاينة تفاصيل ولغز الختم التراثي (Story Hook Modal)
   * @param {Object} stamp
   */
  openStampDetailModal(stamp) {
    if (!this.modalMount) return;

    const isAr = store.language === 'ar';
    const title = isAr ? stamp.name?.ar : stamp.name?.en;
    const gov = isAr ? stamp.governorateName?.ar || stamp.gov : stamp.governorateName?.en || stamp.gov;
    const desc = isAr ? stamp.description?.ar : stamp.description?.en;
    const hook = stamp.hook || (isAr ? 'أسرار أثرية تنتظر من يكتشفها في الميدان!' : 'Ancient secrets waiting in the field!');
    const isUnlocked = stamp.unlocked;

    this.modalMount.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-[#E5C598] relative animate-in zoom-in-95">
          
          <button
            type="button"
            id="close-stamp-modal-btn"
            class="absolute top-4 end-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>

          <!-- الختم SVG بحجم كبير -->
          <div class="flex flex-col items-center text-center space-y-3 pt-2">
            ${this.collector.generateStampSVG(stamp, 'lg')}

            <div>
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] bg-amber-50 px-3 py-0.5 rounded-full border border-amber-200 inline-block mb-1">
                📍 ${gov} • ${stamp.rarity || 'Heritage'}
              </span>
              <h3 class="text-xl font-black text-[#1E293B] leading-tight">
                ${title}
              </h3>
            </div>
          </div>

          <!-- تفاصيل الوصف -->
          <div class="space-y-3 text-xs leading-relaxed text-slate-700">
            <p>${desc}</p>

            <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <span class="font-extrabold text-[#B45309] block text-xs">
                🔍 ${isAr ? 'السر التاريخي والتحدي التشويقي:' : 'Historical Secret & Story Hook:'}
              </span>
              <p class="text-amber-950 font-arabic">
                "${hook}"
              </p>
            </div>
          </div>

          <!-- الأزرار والإجراءات -->
          <div class="pt-2 flex flex-col gap-2">
            ${
              !isUnlocked
                ? `
              <a
                href="explore.html?gov=${stamp.governorateId || ''}"
                class="w-full bg-[#C86D51] hover:bg-[#B45A3E] text-white py-3 rounded-2xl font-bold text-xs text-center shadow-md transition-all block"
              >
                ${isAr ? 'احجز رحلة لهذه المحافظة لفك قفل الختم 🚀' : 'Book a Tour to Unlock this Stamp 🚀'}
              </a>
            `
                : `
              <div class="w-full bg-emerald-50 text-emerald-800 py-3 rounded-2xl font-bold text-xs text-center border border-emerald-200">
                ✓ ${isAr ? 'هذا الختم معتمد وموثق في جوازك الرقمي' : 'Verified in your official passport'}
              </div>
            `
            }
            <button
              type="button"
              id="dismiss-stamp-modal-btn"
              class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
            >
              ${isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>

        </div>
      </div>
    `;

    document.getElementById('close-stamp-modal-btn')?.addEventListener('click', () => {
      this.modalMount.innerHTML = '';
    });
    document.getElementById('dismiss-stamp-modal-btn')?.addEventListener('click', () => {
      this.modalMount.innerHTML = '';
    });
  }

  /**
   * ربط الأحداث العامة لتحديث الصفحة فوراً
   */
  setupEventListeners() {
    window.addEventListener('language-changed', () => {
      this.init();
    });

    window.addEventListener('stamp-unlocked', () => {
      this.renderPassportHeader();
      this.renderProgressBar();
      this.renderFilterTabs();
      this.renderStampsGrid();
    });

    window.addEventListener('user-state-changed', () => {
      this.renderPassportHeader();
    });
  }
}

// تشغيل الصفحة تلقائياً عند جاهزية الـ DOM
document.addEventListener('DOMContentLoaded', () => {
  const passportPage = new PassportPage();
  passportPage.init();
});