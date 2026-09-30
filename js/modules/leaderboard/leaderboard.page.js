/**
 * 🇯🇴 Jordan Tour - Leaderboard Page Controller
 * مسار الملف: js/modules/leaderboard/leaderboard.page.js
 * مشغل صفحة لوحة الشرف والمتصدرين، الفلترة الزمنية، وبطاقة الترتيب الشخصي
 */

import { store } from '../../state/store.js';
import { LeaderboardPodium } from './podium.js';
import { defaultExplorerStampIds, hasCollectedAllOfficialStamps, renderJordanVerificationBadge } from '../../components/jordan-verification-badge.js';

export class LeaderboardPage {
  constructor() {
    this.users = [];
    this.searchQuery = '';
    this.periodFilter = 'month'; // 'month' | 'year' | 'all'
    this.podium = null;

    // عناصر الـ DOM
    this.podiumMount = document.getElementById('podium-mount');
    this.userStandingMount = document.getElementById('user-standing-mount');
    this.leaderboardTableMount = document.getElementById('leaderboard-table-mount');
    this.searchInput = document.getElementById('leaderboard-search-input');
    this.periodFilterContainer = document.getElementById('period-filter-container');
    this.userModalMount = document.getElementById('leaderboard-user-modal-mount');
  }

  /**
   * تهيئة الصفحة وجلب البيانات الأولية
   */
  async init() {
    await this.loadUsersData();
    this.initPodium();
    this.renderPeriodFilters();
    this.renderUserStanding();
    this.renderLeaderboard();
    this.setupEventListeners();
  }

  /**
   * جلب قائمة المتصدرين (من Firestore أو كاش محلي مع مستكشفين معتمدين)
   */
  async loadUsersData() {
    try {
      if (window.JordanFirebase && window.JordanFirebase.db) {
        const snap = await window.JordanFirebase.db.collection('leaderboard').get();
        if (!snap.empty) {
          this.users = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback to local leaderboard data:', e.message);
    }

    // بيانات المستكشفين الأولية
    this.users = [
      {
        id: 'usr-1',
        rank: 1,
        name: 'طارق الهاشمي • Tariq H.',
        username: 'tariq_hashemi',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        totalPoints: 3420,
        monthlyPoints: 980,
        yearlyPoints: 2850,
        completedTrips: 14,
        level: 'Gold',
        levelAr: 'مستكشف ذهبي (Gold)',
        isVerified: true,
        bio: 'استكشفت كافة مسارات البتراء ووادي رم وجمعت كافة أختام المحافظات الـ 12 🇯🇴'
      },
      {
        id: 'usr-2',
        rank: 2,
        name: 'سارة المجالي • Sarah M.',
        username: 'sarah_majali',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        totalPoints: 2890,
        monthlyPoints: 840,
        yearlyPoints: 2410,
        completedTrips: 11,
        level: 'Silver',
        levelAr: 'مستكشف فضي (Silver)',
        isVerified: true,
        bio: 'مصورة وهاوية للمسارات المائية في وادي الموجب والأودية الساحرة.'
      },
      {
        id: 'usr-3',
        rank: 3,
        name: 'عمر القاسم • Omar Q.',
        username: 'omar_qasim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        totalPoints: 2450,
        monthlyPoints: 710,
        yearlyPoints: 2050,
        completedTrips: 9,
        level: 'Silver',
        levelAr: 'مستكشف فضي (Silver)',
        isVerified: true,
        bio: 'عاشق للمدن الرومانية في جرش وأم قيس وقلاع الأردن التاريخية.'
      },
      {
        id: 'usr-4',
        rank: 4,
        name: 'أحمد شاشير • Ahmad Shaesher',
        username: 'sh3sher',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        totalPoints: 1980,
        monthlyPoints: 580,
        yearlyPoints: 1650,
        completedTrips: 7,
        level: 'Bronze',
        levelAr: 'مستكشف برونزي (Bronze)',
        isVerified: true,
        isCurrentUser: true,
        stamps: [...defaultExplorerStampIds],
        bio: 'أجمع أختام المحافظات الأردنية، وأشارك تقييماتي بعد كل رحلة!'
      },
      {
        id: 'usr-5',
        rank: 5,
        name: 'رنا الكردي • Rana K.',
        username: 'rana_kurdi',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        totalPoints: 1620,
        monthlyPoints: 460,
        yearlyPoints: 1350,
        completedTrips: 6,
        level: 'Bronze',
        levelAr: 'مستكشف برونزي (Bronze)',
        isVerified: false,
        bio: 'مهتمة برحلات الاستجمام في البحر الميت والينابيع المعدنية.'
      },
      {
        id: 'usr-6',
        rank: 6,
        name: 'د. فيصل الشمري • Dr. Faisal',
        username: 'faisal_shammari',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        totalPoints: 1410,
        monthlyPoints: 390,
        yearlyPoints: 1180,
        completedTrips: 5,
        level: 'Bronze',
        levelAr: 'مستكشف برونزي (Bronze)',
        isVerified: true,
        bio: 'زائر دائم للأردن الحبيب من المملكة العربية السعودية.'
      }
    ];
  }

  /**
   * تهيئة موديول منصة التتويج
   */
  initPodium() {
    this.podium = new LeaderboardPodium({
      onSelectUser: (user) => this.openUserProfileModal(user)
    });
  }

  /**
   * حساب وترتيب المستكشفين بحسب الفترة والبحث
   */
  getProcessedUsers() {
    let list = this.users.map((u) => {
      let points = u.totalPoints;
      if (this.periodFilter === 'month') {
        points = u.monthlyPoints !== undefined ? u.monthlyPoints : Math.round(u.totalPoints * 0.28);
      } else if (this.periodFilter === 'year') {
        points = u.yearlyPoints !== undefined ? u.yearlyPoints : Math.round(u.totalPoints * 0.82);
      }

      return {
        ...u,
        displayPoints: points
      };
    });

    // فرز تنازلي حسب النقاط
    list.sort((a, b) => b.displayPoints - a.displayPoints);

    // إعادة ترقيم المراتب 1، 2، 3...
    list = list.map((u, idx) => ({ ...u, dynamicRank: idx + 1 }));

    // تصفية حسب نص البحث إن وُجد
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          u.level.toLowerCase().includes(q) ||
          (u.levelAr && u.levelAr.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * رسم أزرار الفلترة الزمنية
   */
  renderPeriodFilters() {
    if (!this.periodFilterContainer) return;
    const isAr = store.language === 'ar';

    const periods = [
      { id: 'month', label: isAr ? 'هذا الشهر' : 'This Month' },
      { id: 'year', label: isAr ? 'هذه السنة' : 'This Year' },
      { id: 'all', label: isAr ? 'طول الفترة' : 'All Time' },
    ];

    this.periodFilterContainer.innerHTML = periods
      .map(
        (p) => `
        <button
          type="button"
          data-period="${p.id}"
          class="period-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            this.periodFilter === p.id
              ? 'bg-[#1E293B] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-100'
          }"
        >
          ${p.label}
        </button>
      `
      )
      .join('');

    this.periodFilterContainer.querySelectorAll('.period-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.periodFilter = btn.dataset.period;
        this.renderPeriodFilters();
        this.renderUserStanding();
        this.renderLeaderboard();
      });
    });
  }

  /**
   * رسم بطاقة الترتيب الشخصي للمستخدم
   */
  renderUserStanding() {
    if (!this.userStandingMount) return;

    const isAr = store.language === 'ar';
    const users = this.getProcessedUsers();

    // العثور على المستخدم الحالي
    const myEntry = users.find(
      (u) =>
        u.isCurrentUser ||
        (store.user && (u.username === store.user.username || u.name === store.user.displayName))
    ) || users[3]; // مستكشف افتراضي

    const myRank = myEntry ? myEntry.dynamicRank : 4;
    const totalExplorers = users.length;
    const points = myEntry ? myEntry.displayPoints : (store.user?.xp || 1450);

    this.userStandingMount.innerHTML = `
      <div class="bg-gradient-to-r from-[#1E293B] via-[#2A3B53] to-[#1E293B] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-[#E5C598]/50 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden animate-in fade-in duration-300">
        <div class="absolute top-0 end-0 -mt-6 -mr-6 w-32 h-32 bg-[#D97706]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex items-center gap-4 text-start w-full md:w-auto">
          <div class="relative shrink-0">
            <img
              src="${myEntry?.avatar || store.user?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}"
              alt="${myEntry?.name || 'Explorer'}"
              class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#D97706] shadow-lg"
            />
            ${hasCollectedAllOfficialStamps(store.user || myEntry) ? renderJordanVerificationBadge('absolute -bottom-1 -end-1 h-6 w-6') : ''}
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-wider bg-[#D97706]/30 text-amber-200 px-2.5 py-0.5 rounded-full border border-[#D97706]/40">
                ${isAr ? 'مرتبتك الرسمية بالمملكة' : 'Your Official Standing'}
              </span>
              <span class="text-xs text-slate-300 font-mono">@${myEntry?.username || 'sh3sher'}</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-white mt-1">
              ${myEntry?.name || 'أحمد شاشير'}
            </h3>
            <p class="text-xs text-slate-300 mt-0.5">
              ${
                isAr
                  ? `أنت حالياً في المركز #${myRank} من بين ${totalExplorers} مستكشف مسجل في المملكة 🇯🇴`
                  : `You are officially ranked #${myRank} among ${totalExplorers} registered explorers 🇯🇴`
              }
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-700/60">
          <div class="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center min-w-[80px]">
            <span class="text-[10px] text-slate-300 block uppercase font-bold">${isAr ? 'المرتبة' : 'Rank'}</span>
            <span class="text-xl sm:text-2xl font-black font-mono text-amber-300">#${myRank}</span>
          </div>
          <div class="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center min-w-[90px]">
            <span class="text-[10px] text-slate-300 block uppercase font-bold">${isAr ? 'النقاط' : 'Points'}</span>
            <span class="text-xl sm:text-2xl font-black font-mono text-white">${points.toLocaleString()}</span>
          </div>
          <a
            href="explore.html"
            class="bg-gradient-to-r from-[#C86D51] to-[#D97706] hover:brightness-110 text-white px-4 py-3 rounded-2xl text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            ${isAr ? 'عزّز ترتيبك 🚀' : 'Boost Rank 🚀'}
          </a>
        </div>
      </div>
    `;
  }

  /**
   * رسم منصة التتويج والجدول الكامل
   */
  renderLeaderboard() {
    const isAr = store.language === 'ar';
    const users = this.getProcessedUsers();

    // 1. رسم المنصة إذا لم يكن هناك بحث نشط
    if (this.podiumMount) {
      if (!this.searchQuery && users.length >= 3) {
        this.podium.render(this.podiumMount, users.slice(0, 3));
      } else {
        this.podiumMount.innerHTML = '';
      }
    }

    // 2. رسم الجدول الكامل
    if (!this.leaderboardTableMount) return;

    if (users.length === 0) {
      this.leaderboardTableMount.innerHTML = `
        <div class="p-12 text-center text-slate-400 text-xs">
          ${isAr ? 'لم يتم العثور على مستكشفين يطابقون كلمة البحث' : 'No explorers found matching query'}
        </div>
      `;
      return;
    }

    this.leaderboardTableMount.innerHTML = `
      <div class="divide-y divide-slate-100">
        ${users
          .map((user) => {
            const isMe = user.isCurrentUser || (store.user && user.username === store.user.username);
            const isVerified = hasCollectedAllOfficialStamps(user) || (isMe && hasCollectedAllOfficialStamps(store.user));
            return `
            <div
              data-user-id="${user.id}"
              class="leaderboard-row p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:bg-slate-50 cursor-pointer ${
                isMe ? 'bg-amber-50/80 border-s-4 border-s-[#D97706] ring-1 ring-[#D97706]/20' : ''
              }"
            >
              <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                <span class="font-mono font-bold text-sm sm:text-base text-slate-400 w-8 text-center shrink-0">
                  #${user.dynamicRank || user.rank}
                </span>

                <div class="relative shrink-0">
                  <img
                    src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}"
                    alt="${user.name}"
                    class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border ${
                      isMe ? 'border-2 border-[#D97706] shadow-sm' : 'border-slate-200'
                    }"
                  />
                  ${
                    isVerified
                      ? renderJordanVerificationBadge('absolute -bottom-1 -end-1 h-5 w-5')
                      : ''
                  }
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h4 class="font-bold text-xs sm:text-sm truncate ${isMe ? 'text-[#C86D51]' : 'text-[#1E293B]'}">
                      ${user.name}
                    </h4>
                    ${
                      isMe
                        ? `<span class="text-[10px] font-black bg-[#D97706] text-white px-2 py-0.5 rounded-full shadow-xs">${isAr ? 'أنت' : 'You'}</span>`
                        : ''
                    }
                  </div>
                  <span class="text-[11px] text-slate-500 block truncate font-mono">
                    @${user.username || 'explorer'} • ${user.completedTrips || 5} ${isAr ? 'رحلات مكتملة' : 'trips'}
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end shrink-0">
                <span class="font-mono font-black text-sm sm:text-base text-[#D97706]">
                  +${user.displayPoints.toLocaleString()} ${isAr ? 'نقطة' : 'pts'}
                </span>
                <span class="text-[11px] font-semibold text-slate-400">
                  ${isAr ? (user.levelAr || user.level) : `${user.level} Explorer`}
                </span>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;

    // ربط النقر على الصفوف
    this.leaderboardTableMount.querySelectorAll('.leaderboard-row').forEach((row) => {
      row.addEventListener('click', () => {
        const userId = row.dataset.userId;
        const user = users.find((u) => u.id === userId);
        if (user) {
          this.openUserProfileModal(user);
        }
      });
    });
  }

  /**
   * فتح نافذة تفاصيل بروفايل المستكشف
   */
  openUserProfileModal(user) {
    if (!this.userModalMount) return;
    const isAr = store.language === 'ar';

    this.userModalMount.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 border border-slate-200 my-auto">
          <div class="relative w-20 h-20 mx-auto">
            <img
              src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}"
              alt="${user.name}"
              class="w-full h-full rounded-2xl object-cover border-2 border-[#D97706] shadow-md"
            />
            ${hasCollectedAllOfficialStamps(user) ? renderJordanVerificationBadge('absolute -bottom-1 -end-1 h-6 w-6') : ''}
          </div>

          <div>
            <h3 class="font-extrabold text-base text-[#1E293B]">${user.name}</h3>
            <span class="text-xs text-[#C86D51] font-mono font-bold">@${user.username || 'explorer'}</span>
            <p class="text-xs text-slate-500 mt-2 leading-relaxed font-arabic">
              "${user.bio || (isAr ? 'عاشق لدروب الأردن ومحافظاته الـ 12 ومستكشف معتمد!' : 'Dedicated Jordan explorer.')}"
            </p>
          </div>

          <div class="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block">${isAr ? 'الترتيب' : 'Rank'}</span>
              <span class="font-mono font-black text-amber-600">#${user.dynamicRank || user.rank}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">${isAr ? 'نقاط الولاء' : 'Points'}</span>
              <span class="font-mono font-black text-[#1E293B]">${(user.displayPoints || user.totalPoints).toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            id="close-user-modal-btn"
            class="w-full bg-[#1E293B] hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            ${isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('close-user-modal-btn')?.addEventListener('click', () => {
      this.userModalMount.innerHTML = '';
    });
  }

  /**
   * ربط الأحداث العامة للبحث واللغات
   */
  setupEventListeners() {
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderLeaderboard();
    });

    window.addEventListener('language-changed', () => {
      this.renderPeriodFilters();
      this.renderUserStanding();
      this.renderLeaderboard();
    });

    window.addEventListener('user-state-changed', () => {
      this.renderUserStanding();
      this.renderLeaderboard();
    });
  }
}

// تشغيل الصفحة تلقائياً عند جاهزية الـ DOM
document.addEventListener('DOMContentLoaded', () => {
  const leaderboardPage = new LeaderboardPage();
  leaderboardPage.init();
});