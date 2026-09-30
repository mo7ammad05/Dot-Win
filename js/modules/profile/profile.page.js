/**
 * 🇯🇴 Jordan Tour - Profile Page Controller
 * مسار الملف: js/modules/profile/profile.page.js
 * مشغل صفحة الملف الشخصي، أختام جواكر الـ 12، تعديل البيانات، وإدارة التذاكر والإحالات
 */

import { store } from '../../state/store.js';
import { officialStampsData } from '../../data/stamps.data.js';
import { ReferralManager } from './referral.js';
import { StampCollector, loadStampCatalog } from '../passport/stamp-collector.js';
import { firebaseService } from '../../services/firebase.service.js';
import { uploaderService } from '../../services/uploader.service.js';
import { defaultExplorerStampIds, hasCollectedAllOfficialStamps, renderJordanVerificationBadge } from '../../components/jordan-verification-badge.js';

export class ProfilePage {
  constructor() {
    this.collector = new StampCollector();
    this.referralManager = new ReferralManager({
      onPointsUpdated: () => this.updateHeaderStats(),
    });

    this.activeTab = 'stamps'; // 'stamps' | 'referral' | 'posts' | 'bookings' | 'ledger'
    this.stamps = officialStampsData;
    this.bookings = [];
    this.posts = [];
    this.pointsLedger = [];

    // عناصر الـ DOM
    this.profileHeroMount = document.getElementById('profile-hero-mount');
    this.stampsStripMount = document.getElementById('profile-stamps-strip-mount');
    this.tabsNavMount = document.getElementById('profile-tabs-nav');
    this.tabContentMount = document.getElementById('profile-tab-content-mount');
    this.modalMount = document.getElementById('profile-modal-mount');
  }

  /**
   * تهيئة الصفحة
   */
  async init() {
    await this.loadUserData();
    this.stamps = await loadStampCatalog();
    this.collector.stampsCatalog = this.stamps;
    this.referralManager.pointsSettings = await firebaseService.getPointsSettings() || this.referralManager.pointsSettings;
    this.renderProfileHero();
    this.renderStampsMiniStrip();
    this.renderTabsNav();
    this.renderActiveTabContent();
    this.setupEventListeners();
  }

  /**
   * تحميل بيانات المستخدم وحجوزاته ونقاطه
   */
  async loadUserData() {
    const isAr = store.language === 'ar';

    // الحجوزات المخزنة محلياً
    try {
      const rawBookings = localStorage.getItem('jt_user_bookings');
      if (rawBookings) {
        this.bookings = JSON.parse(rawBookings);
      } else {
        this.bookings = [
          {
            id: 'JO-EXP-2026-9812',
            destinationTitle: { ar: 'مدينة البتراء الوردية وكنز الأنباط', en: 'Petra Rose City & Treasury Trek' },
            date: '2026-10-15',
            timeSlot: '08:00 AM',
            guests: 2,
            totalPriceJOD: 130,
            status: 'confirmed',
            paymentMode: 'cliq'
          },
          {
            id: 'JO-EXP-2026-4402',
            destinationTitle: { ar: 'سفاري وادي رم وقباب المريخ الفاخرة', en: 'Wadi Rum Martian Dome Glamping' },
            date: '2026-10-22',
            timeSlot: '02:00 PM',
            guests: 2,
            totalPriceJOD: 190,
            status: 'pending',
            paymentMode: 'cliq'
          }
        ];
      }
    } catch (e) {
      this.bookings = [];
    }

    const userBookings = await firebaseService.getBookingsForUser(store.user);
    if (userBookings) this.bookings = userBookings;

    // سجل النقاط
    this.pointsLedger = [
      { id: 'tx-1', title: { ar: 'حجز رحلة البتراء وتأكيد كليك', en: 'Petra Tour Booking via CliQ' }, points: 150, type: '+', date: '2026-09-28' },
      { id: 'tx-2', title: { ar: 'مكافأة تسجيل حساب مستكشف جديد', en: 'New Explorer Welcome Bonus' }, points: 100, type: '+', date: '2026-09-25' },
      { id: 'tx-3', title: { ar: 'خصم نقاط عند حجز رحلة وادي رم', en: 'Points Redemption for Wadi Rum' }, points: 50, type: '-', date: '2026-09-24' }
    ];
  }

  /**
   * 1. رسم بطاقة البروفايل الرئيسية (Profile Hero) مع الشارة والرتبة
   */
  renderProfileHero() {
    if (!this.profileHeroMount) return;

    const isAr = store.language === 'ar';
    const user = store.user || {
      displayName: isAr ? 'أحمد شاشير' : 'Ahmad Shaesher',
      username: 'sh3sher',
      email: 'mhmdsh3sher@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250',
      bio: isAr ? 'عاشق لصحراء وادي رم ودروب البتراء الوردية. أسعى لجمع كافة أختام محافظات المملكة الـ 12 وتوثيق كل زاوية في الأردن الحبيب 🇯🇴✨' : 'Passionate explorer collecting all 12 Jordan governorate stamps.',
      xp: 1450,
      followersCount: 342,
      followingCount: 128,
      stamps: [...defaultExplorerStampIds]
    };
    const isVerified = hasCollectedAllOfficialStamps(user);

    const rank = this.collector.getExplorerRank();

    this.profileHeroMount.innerHTML = `
      <div class="relative w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-soft-card overflow-hidden">
        <!-- التدرج اللوني العلوي -->
        <div class="absolute top-0 inset-x-0 h-28 bg-gradient-to-r from-[#1E293B] via-[#2A3B53] to-[#C86D51]"></div>

        <div class="relative z-10 pt-10 sm:pt-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-start">
            <div class="relative shrink-0">
              <img
                src="${user.photoURL}"
                alt="${user.displayName}"
                class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl"
              />
              ${isVerified ? renderJordanVerificationBadge('absolute -bottom-2 -end-2 h-9 w-9 drop-shadow-md') : ''}
            </div>

            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-[#1E293B]">
                  ${user.displayName}
                </h1>
                ${isVerified ? `
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-950">
                    ${renderJordanVerificationBadge('h-4 w-4')}
                    <span>${isAr ? 'مستكشف موثّق' : 'Verified Explorer'}</span>
                  </span>
                ` : ''}
              </div>

              <span class="text-xs font-mono font-bold text-[#C86D51] block">
                @${user.username || 'sh3sher'}
              </span>

              <p class="text-xs text-slate-600 max-w-lg leading-relaxed pt-1 font-sans">
                ${user.bio}
              </p>

              <div class="flex items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-700 pt-1">
                <span>
                  <strong class="text-[#1E293B] font-mono text-sm">${user.followersCount || 342}</strong>
                  <span class="text-slate-500 font-normal"> ${isAr ? 'متابِع' : 'Followers'}</span>
                </span>
                <span>•</span>
                <span>
                  <strong class="text-[#1E293B] font-mono text-sm">${user.followingCount || 128}</strong>
                  <span class="text-slate-500 font-normal"> ${isAr ? 'يتابِع' : 'Following'}</span>
                </span>
                <span>•</span>
                <span class="text-[#D97706] font-mono font-bold" id="profile-xp-counter">
                  ${user.xp || 1450} ${isAr ? 'نقطة ولاء 🪙' : 'Points 🪙'}
                </span>
              </div>
            </div>
          </div>

          <!-- الأزرار السريعة: تعديل الحساب ومشاركة الكود -->
          <div class="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full lg:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
            <button
              type="button"
              id="open-edit-profile-btn"
              class="bg-[#FAF8F5] hover:bg-slate-100 text-[#1E293B] border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>✏️</span>
              <span>${isAr ? 'تعديل الملف الشخصي' : 'Edit Profile'}</span>
            </button>

            <button
              type="button"
              id="switch-to-referral-tab-btn"
              class="bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>🎁</span>
              <span>${isAr ? 'كود الإحالة والمكافآت' : 'Referral Rewards'}</span>
            </button>
          </div>

        </div>
      </div>
    `;

    document.getElementById('open-edit-profile-btn')?.addEventListener('click', () => {
      this.openEditProfileModal();
    });

    document.getElementById('switch-to-referral-tab-btn')?.addEventListener('click', () => {
      this.activeTab = 'referral';
      this.renderTabsNav();
      this.renderActiveTabContent();
    });
  }

  /**
   * 2. رسم شريط أختام المحافظات الـ 12 المجمعة المميز بجانب البروفايل (Jawaker-style strip)
   */
  renderStampsMiniStrip() {
    if (!this.stampsStripMount) return;

    const isAr = store.language === 'ar';
    const unlockedCount = this.collector.getUnlockedCount();
    const stamps = this.collector.getAllStampsWithUserStatus();

    this.stampsStripMount.innerHTML = `
      <div class="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-soft-card space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-xl">🏛️</span>
            <h3 class="font-extrabold text-sm sm:text-base text-[#1E293B]">
              ${isAr ? 'شريط أختام محافظات الأردن الـ 12 المعتمدة (نظام التجميع الملكي):' : 'Official 12 Jordan Governorate Seals (Collector Shelf):'}
            </h3>
            <span class="text-xs font-mono font-bold bg-[#D97706]/10 text-[#D97706] px-2.5 py-0.5 rounded-full">
              ${unlockedCount} / ${stamps.length}
            </span>
          </div>

          <button
            type="button"
            id="view-all-stamps-btn"
            class="text-xs font-bold text-[#C86D51] hover:underline cursor-pointer"
          >
            ${isAr ? 'عرض كافة الأختام والتحديات ←' : 'View All 12 Stamps →'}
          </button>
        </div>

        <!-- شريط أفقي قابل للسحب السلس -->
        <div class="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          ${stamps
            .map((stamp) => `
            <div
              data-stamp-id="${stamp.id}"
              class="stamp-mini-item shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95"
              title="${isAr ? stamp.name.ar : stamp.name.en}"
            >
              ${this.collector.generateStampSVG(stamp, 'sm')}
            </div>
          `)
            .join('')}
        </div>
      </div>
    `;

    document.getElementById('view-all-stamps-btn')?.addEventListener('click', () => {
      this.activeTab = 'stamps';
      this.renderTabsNav();
      this.renderActiveTabContent();
    });

    this.stampsStripMount.querySelectorAll('.stamp-mini-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.dataset.stampId;
        const stamp = stamps.find((s) => s.id === id);
        if (stamp) this.openStampModal(stamp);
      });
    });
  }

  /**
   * 3. رسم أزرار التبويبات الرئيسية
   */
  renderTabsNav() {
    if (!this.tabsNavMount) return;

    const isAr = store.language === 'ar';
    const tabs = [
      { id: 'stamps', label: isAr ? 'أختام المحافظات الـ 12 🏛️' : '12 Stamps 🏛️' },
      { id: 'referral', label: isAr ? 'رمز الإحالة والمكافآت 🎁' : 'Referral Rewards 🎁' },
      { id: 'bookings', label: isAr ? `حجوزاتي وتذاكري (${this.bookings.length}) 🎟️` : `My Bookings (${this.bookings.length}) 🎟️` },
      { id: 'posts', label: isAr ? 'منشوراتي بالمنتدى 💬' : 'My Forum Stories 💬' },
      { id: 'ledger', label: isAr ? 'سجل نقاط المستكشف 🪙' : 'Points Ledger 🪙' },
    ];

    this.tabsNavMount.innerHTML = `
      <div class="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
        ${tabs
          .map(
            (t) => `
          <button
            type="button"
            data-tab="${t.id}"
            class="profile-tab-btn px-4 py-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              this.activeTab === t.id
                ? 'border-[#C86D51] text-[#C86D51] bg-[#C86D51]/5 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
            }"
          >
            <span>${t.label}</span>
          </button>
        `
          )
          .join('')}
      </div>
    `;

    this.tabsNavMount.querySelectorAll('.profile-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.renderTabsNav();
        this.renderActiveTabContent();
      });
    });
  }

  /**
   * 4. رسم محتوى التبويب النشط
   */
  renderActiveTabContent() {
    if (!this.tabContentMount) return;

    this.tabContentMount.innerHTML = '';

    if (this.activeTab === 'stamps') {
      this.renderStampsTab();
    } else if (this.activeTab === 'referral') {
      this.renderReferralTab();
    } else if (this.activeTab === 'bookings') {
      this.renderBookingsTab();
    } else if (this.activeTab === 'posts') {
      this.renderPostsTab();
    } else if (this.activeTab === 'ledger') {
      this.renderLedgerTab();
    }
  }

  /**
   * تبويب الأختام الـ 12
   */
  renderStampsTab() {
    const isAr = store.language === 'ar';
    const stamps = this.collector.getAllStampsWithUserStatus();

    const container = document.createElement('div');
    container.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-300';

    container.innerHTML = stamps
      .map(
        (stamp) => `
        <div
          data-stamp-id="${stamp.id}"
          class="stamp-card bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer shadow-soft-card hover:shadow-floating-modal flex flex-col items-center text-center justify-between ${
            stamp.unlocked ? 'border-[#E5C598] hover:border-[#D97706]' : 'border-slate-200 opacity-60'
          }"
        >
          <div class="w-full flex items-center justify-between text-[10px] font-mono font-bold mb-2">
            <span class="px-2 py-0.5 rounded-full ${stamp.unlocked ? 'bg-amber-100 text-[#D97706]' : 'bg-slate-100 text-slate-500'}">
              ${stamp.rarity}
            </span>
            <span class="${stamp.unlocked ? 'text-emerald-700 font-bold' : 'text-slate-400'}">
              +${stamp.xp} XP
            </span>
          </div>

          <div class="my-2">${this.collector.generateStampSVG(stamp, 'md')}</div>

          <div class="space-y-1 mt-2">
            <h4 class="font-extrabold text-xs sm:text-sm text-[#1E293B]">
              ${isAr ? stamp.name.ar : stamp.name.en}
            </h4>
            <span class="text-[11px] text-[#D97706] font-bold block">
              📍 ${isAr ? stamp.governorateName.ar : stamp.governorateName.en}
            </span>
          </div>

          <div class="w-full pt-3 mt-3 border-t border-slate-100 text-[11px] font-bold text-[#C86D51]">
            ${stamp.unlocked ? (isAr ? 'معتمد رسمي ✓' : 'Collected ✓') : (isAr ? 'مغلق 🔒' : 'Locked 🔒')}
          </div>
        </div>
      `
      )
      .join('');

    container.querySelectorAll('.stamp-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.stampId;
        const stamp = stamps.find((s) => s.id === id);
        if (stamp) this.openStampModal(stamp);
      });
    });

    this.tabContentMount.appendChild(container);
  }

  /**
   * تبويب نظام الإحالات والمكافآت
   */
  renderReferralTab() {
    const wrap = document.createElement('div');
    wrap.className = 'max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300';

    const cardContainer = document.createElement('div');
    const redeemContainer = document.createElement('div');

    wrap.appendChild(cardContainer);
    wrap.appendChild(redeemContainer);

    this.referralManager.renderReferralCard(cardContainer);
    this.referralManager.renderRedeemCard(redeemContainer);

    this.tabContentMount.appendChild(wrap);
  }

  /**
   * تبويب حجوزاتي وتذاكري
   */
  renderBookingsTab() {
    const isAr = store.language === 'ar';
    const wrap = document.createElement('div');
    wrap.className = 'space-y-4 animate-in fade-in duration-300';

    if (this.bookings.length === 0) {
      wrap.innerHTML = `
        <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <span class="text-4xl block">🎟️</span>
          <h4 class="text-base font-bold text-slate-700">${isAr ? 'لا توجد حجوزات مسجلة بعد' : 'No bookings found'}</h4>
          <a href="explore.html" class="inline-block mt-2 bg-[#C86D51] text-white px-5 py-2 rounded-xl text-xs font-bold">
            ${isAr ? 'استكشف واحجز رحلتك الأولى' : 'Explore Tours'}
          </a>
        </div>
      `;
      this.tabContentMount.appendChild(wrap);
      return;
    }

    wrap.innerHTML = this.bookings
      .map(
        (b) => `
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="text-[10px] font-mono font-bold text-[#C86D51] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              #${b.id}
            </span>
            <h4 class="font-extrabold text-sm sm:text-base text-[#1E293B]">
              ${isAr ? (b.destinationTitle?.ar || b.destinationTitle) : (b.destinationTitle?.en || b.destinationTitle)}
            </h4>
            <span class="text-xs text-slate-500 font-semibold block">
              📅 ${b.date} • ⏰ ${b.timeSlot || '08:00 AM'} • 👥 ${b.guests} ${isAr ? 'ضيوف' : 'guests'} • ${b.paymentMode.toUpperCase()}
            </span>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span class="font-mono font-black text-base text-[#1E293B]">
              ${b.totalPriceJOD} JOD
            </span>

            <span class="text-[10px] font-bold px-3 py-1 rounded-full ${
              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
            }">
              ${b.status === 'confirmed' ? (isAr ? 'معتمد ومؤكد ✓' : 'Confirmed ✓') : (isAr ? 'قيد المراجعة' : 'Pending')}
            </span>

            <a
              href="ticket.html?ref=${b.id}"
              class="bg-[#1E293B] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>${isAr ? 'عرض وطباعة التذكرة' : 'View Ticket'}</span>
            </a>
          </div>
        </div>
      `
      )
      .join('');

    this.tabContentMount.appendChild(wrap);
  }

  /**
   * تبويب منشوراتي في المنتدى
   */
  renderPostsTab() {
    const isAr = store.language === 'ar';
    const wrap = document.createElement('div');
    wrap.className = 'grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300';

    wrap.innerHTML = `
      <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft-card space-y-3">
        <img
          src="https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800"
          alt=""
          class="w-full aspect-video rounded-2xl object-cover"
        />
        <h4 class="font-extrabold text-sm text-[#1E293B]">
          ${isAr ? 'تجربتي الرائعة في مسار السيق والخزينة' : 'My Awesome Experience at Petra'}
        </h4>
        <p class="text-xs text-slate-600 line-clamp-2">
          ${isAr ? 'انطلقنا في الصباح الباكر، كانت الإضاءة خيالية والمرشد البدوي شرح لنا أسرار قنوات المياه النبطية بالتفصيل.' : 'Early morning hike through the Siq. Beautiful lighting and history.'}
        </p>
        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t">
          <span>❤️ 98 إعجاب • 💬 14 تعليق</span>
          <span class="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">${isAr ? 'معتمد بالمنتدى' : 'Published'}</span>
        </div>
      </div>
    `;

    this.tabContentMount.appendChild(wrap);
  }

  /**
   * تبويب كشف حساب نقاط الولاء
   */
  renderLedgerTab() {
    const isAr = store.language === 'ar';
    const wrap = document.createElement('div');
    wrap.className = 'bg-white rounded-3xl border border-slate-200 shadow-soft-card overflow-hidden animate-in fade-in duration-300';

    wrap.innerHTML = `
      <div class="divide-y divide-slate-100">
        ${this.pointsLedger
          .map(
            (tx) => `
          <div class="p-4 sm:p-5 flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="font-bold text-xs sm:text-sm text-[#1E293B] block">
                ${isAr ? tx.title.ar : tx.title.en}
              </span>
              <span class="text-[10px] text-slate-400 font-mono">${tx.date}</span>
            </div>
            <span class="font-mono font-black text-sm sm:text-base ${
              tx.type === '+' ? 'text-emerald-600' : 'text-rose-600'
            }">
              ${tx.type}${tx.points} PTS 🪙
            </span>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    this.tabContentMount.appendChild(wrap);
  }

  /**
   * فتح نافذة تعديل الملف الشخصي
   */
  openEditProfileModal() {
    if (!this.modalMount) return;
    const isAr = store.language === 'ar';
    const user = store.user || {
      displayName: isAr ? 'أحمد شاشير' : 'Ahmad Shaesher',
      username: 'sh3sher',
      bio: isAr ? 'عاشق لصحراء وادي رم ودروب البتراء الوردية.' : 'Dedicated Jordan explorer.',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250',
    };

    this.modalMount.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-auto">
          
          <div class="flex items-center justify-between border-b pb-3">
            <h3 class="font-extrabold text-base sm:text-lg text-[#1E293B]">
              ${isAr ? 'تعديل بيانات الملف الشخصي' : 'Edit Profile Details'}
            </h3>
            <button type="button" id="close-profile-modal-btn" class="text-slate-400 hover:text-slate-700">✕</button>
          </div>

          <form id="edit-profile-form" class="space-y-4">
            <!-- الصورة الشخصية ورفعها -->
            <div class="flex items-center gap-4">
              <img id="edit-avatar-preview" src="${user.photoURL}" alt="" class="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow" />
              <input type="file" id="edit-avatar-file" accept="image/*" class="hidden" />
              <button
                type="button"
                id="edit-avatar-trigger"
                class="bg-[#FAF8F5] border border-slate-200 hover:border-[#C86D51] px-4 py-2 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                <i class="fa-solid fa-upload me-1" aria-hidden="true"></i>${isAr ? 'رفع صورة جديدة' : 'Change Avatar'}
              </button>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">${isAr ? 'الاسم الكامل:' : 'Full Name:'}</label>
              <input type="text" id="edit-display-name" value="${user.displayName}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800" required />
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">${isAr ? 'اسم المستخدم (@):' : 'Username (@):'}</label>
              <input type="text" id="edit-username" value="${user.username}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800" required />
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">${isAr ? 'الوصف والنبذة التعريفية (Bio):' : 'Bio:'}</label>
              <textarea id="edit-bio" rows="3" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed">${user.bio}</textarea>
            </div>

            <div class="pt-2 flex justify-end gap-2 border-t">
              <button type="button" id="cancel-profile-modal-btn" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
                ${isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer">
                ${isAr ? 'حفظ التعديلات' : 'Save Changes'}
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    document.getElementById('close-profile-modal-btn')?.addEventListener('click', () => {
      this.modalMount.innerHTML = '';
    });
    document.getElementById('cancel-profile-modal-btn')?.addEventListener('click', () => {
      this.modalMount.innerHTML = '';
    });

    const fileInput = document.getElementById('edit-avatar-file');
    const trigger = document.getElementById('edit-avatar-trigger');
    const preview = document.getElementById('edit-avatar-preview');

    trigger?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (trigger) trigger.disabled = true;
      try {
        const uploaded = await uploaderService.uploadFile(file);
        preview.src = uploaded.dataUrl;
      } catch (error) {
        alert('تعذر رفع الصورة: ' + error.message);
      } finally {
        if (trigger) trigger.disabled = false;
      }
    });

    document.getElementById('edit-profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('edit-display-name')?.value?.trim();
      const newUsername = document.getElementById('edit-username')?.value?.trim();
      const newBio = document.getElementById('edit-bio')?.value?.trim();
      const newPhoto = preview?.src;

      if (store.user) {
        store.user.displayName = newName;
        store.user.username = newUsername;
        store.user.bio = newBio;
        store.user.photoURL = newPhoto;
      }

      this.renderProfileHero();
      this.modalMount.innerHTML = '';
    });
  }

  /**
   * فتح نافذة تفاصيل الختم
   */
  openStampModal(stamp) {
    if (!this.modalMount) return;
    const isAr = store.language === 'ar';

    this.modalMount.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-2 border-[#E5C598] animate-in zoom-in-95 my-auto">
          <div class="flex justify-center">${this.collector.generateStampSVG(stamp, 'lg')}</div>
          <div>
            <span class="text-xs font-mono font-bold text-[#D97706] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              📍 ${isAr ? stamp.governorateName.ar : stamp.governorateName.en} • ${stamp.rarity}
            </span>
            <h3 class="text-lg font-black text-[#1E293B] mt-2">
              ${isAr ? stamp.name.ar : stamp.name.en}
            </h3>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            ${isAr ? stamp.description.ar : stamp.description.en}
          </p>
          <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 font-arabic">
            "${stamp.hook || 'لغز تاريخي وسر أثري عريق.'}"
          </div>
          <button type="button" id="close-stamp-modal-btn" class="w-full bg-[#1E293B] text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer">
            ${isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('close-stamp-modal-btn')?.addEventListener('click', () => {
      this.modalMount.innerHTML = '';
    });
  }

  /**
   * تحديث عداد النقاط
   */
  updateHeaderStats() {
    const el = document.getElementById('profile-xp-counter');
    if (el) {
      const isAr = store.language === 'ar';
      el.textContent = `${store.user?.xp || 1450} ${isAr ? 'نقطة ولاء 🪙' : 'Points 🪙'}`;
    }
  }

  /**
   * ربط الأحداث العامة
   */
  setupEventListeners() {
    window.addEventListener('user-state-changed', async () => {
      await this.loadUserData();
      this.renderProfileHero();
      this.renderTabsNav();
      this.renderActiveTabContent();
    });

    window.addEventListener('language-changed', () => {
      this.init();
    });

    window.addEventListener('points-updated', () => {
      this.updateHeaderStats();
    });
  }
}

// تشغيل الصفحة تلقائياً
document.addEventListener('DOMContentLoaded', () => {
  const profilePage = new ProfilePage();
  profilePage.init();
});