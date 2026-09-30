/**
 * 🇯🇴 Jordan Tour - Top 3 Podium Renderer Module
 * مسار الملف: js/modules/leaderboard/podium.js
 * يرسم منصة التتويج للمراكز الثلاثة الأولى بالميداليات الذهبية والفضية والبرونزية
 */

import { store } from '../../state/store.js';

export class LeaderboardPodium {
  /**
   * @param {Object} options
   * @param {Function} options.onSelectUser - دالة استدعاء عند النقر على أحد المتصدرين
   */
  constructor({ onSelectUser = () => {} } = {}) {
    this.onSelectUser = onSelectUser;
  }

  /**
   * رسم منصة التتويج للثلاثة الأوائل
   * @param {HTMLElement} container - عنصر الـ DOM الحاوي لمنصة التتويج
   * @param {Array} topUsers - مصفوفة تحتوي على أول 3 متصدرين
   */
  render(container, topUsers = []) {
    if (!container) return;

    const isAr = store.language === 'ar';

    if (topUsers.length < 3) {
      container.innerHTML = '';
      return;
    }

    const top1 = topUsers[0];
    const top2 = topUsers[1];
    const top3 = topUsers[2];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto mb-16 select-none animate-in fade-in duration-300">
        <div class="grid grid-cols-3 gap-3 sm:gap-6 items-end">
          
          <!-- المركز الثاني (الفضي - Silver) -->
          <div
            data-user-index="1"
            class="podium-card flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1"
            title="${top2.name}"
          >
            <div class="relative mb-3 flex flex-col items-center text-center">
              <div class="relative">
                <img
                  src="${top2.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}"
                  alt="${top2.name}"
                  class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-slate-300 shadow-md group-hover:scale-105 transition-transform"
                />
                <div class="absolute -top-3 -end-2 w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-700 font-bold text-xs shadow">
                  🥈
                </div>
              </div>
              <h4 class="mt-2 text-xs sm:text-sm font-bold text-[#1E293B] text-center truncate max-w-[110px] sm:max-w-[150px] group-hover:text-[#C86D51] transition-colors">
                ${top2.name}
              </h4>
              <span class="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                ${isAr ? (top2.levelAr || top2.level) : `${top2.level} Explorer`}
              </span>
              <span class="mt-1 font-mono font-bold text-xs text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-full border border-[#D97706]/20">
                +${(top2.displayPoints || top2.totalPoints || 0).toLocaleString()} ${isAr ? 'نقطة' : 'pts'}
              </span>
            </div>

            <!-- عمود المنصة الفضية -->
            <div class="w-full h-32 sm:h-40 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 border-t-4 border-slate-300 flex flex-col items-center justify-center p-3 shadow-sm group-hover:bg-slate-200 transition-colors">
              <span class="text-3xl sm:text-4xl font-black text-slate-400 font-mono">2</span>
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                ${isAr ? 'المركز الثاني' : '2nd Place'}
              </span>
            </div>
          </div>

          <!-- المركز الأول (الذهبي الملكي - Gold Champion) -->
          <div
            data-user-index="0"
            class="podium-card flex flex-col items-center -mt-6 cursor-pointer group transition-transform hover:-translate-y-1.5"
            title="${top1.name}"
          >
            <div class="relative mb-3 flex flex-col items-center text-center">
              <div class="relative">
                <!-- التاج الهاشمي الذهبي -->
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                  👑
                </div>
                <img
                  src="${top1.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}"
                  alt="${top1.name}"
                  class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#D97706] shadow-xl ring-4 ring-[#D97706]/30 group-hover:scale-105 transition-transform"
                />
                <div class="absolute -top-2 -end-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-[#D97706] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                  🥇
                </div>
              </div>
              <h4 class="mt-2 text-sm sm:text-base font-extrabold text-[#1E293B] text-center truncate max-w-[130px] sm:max-w-[180px] group-hover:text-[#C86D51] transition-colors">
                ${top1.name}
              </h4>
              <span class="text-xs font-semibold text-[#D97706] flex items-center justify-center gap-1">
                <span>🛡️</span>
                <span>${isAr ? (top1.levelAr || 'أسطورة الذهب') : 'Gold Legend'}</span>
              </span>
              <span class="mt-1 font-mono font-black text-xs sm:text-sm text-[#D97706] bg-amber-100 px-3 py-0.5 rounded-full border border-[#D97706]/40">
                +${(top1.displayPoints || top1.totalPoints || 0).toLocaleString()} ${isAr ? 'نقطة' : 'pts'}
              </span>
            </div>

            <!-- عمود المنصة الذهبية المتوجة -->
            <div class="w-full h-40 sm:h-52 rounded-t-2xl bg-gradient-to-t from-amber-300 via-amber-200 to-amber-100 border-t-4 border-[#D97706] flex flex-col items-center justify-center p-3 shadow-md group-hover:brightness-105 transition-all">
              <span class="text-4xl sm:text-5xl font-black text-amber-700/80 font-mono">1</span>
              <span class="text-[11px] font-black text-amber-900 uppercase tracking-wider mt-0.5">
                ${isAr ? 'بطل المتصدرين' : '1st Champion'}
              </span>
            </div>
          </div>

          <!-- المركز الثالث (البرونزي - Bronze) -->
          <div
            data-user-index="2"
            class="podium-card flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1"
            title="${top3.name}"
          >
            <div class="relative mb-3 flex flex-col items-center text-center">
              <div class="relative">
                <img
                  src="${top3.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}"
                  alt="${top3.name}"
                  class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-amber-600/50 shadow-md group-hover:scale-105 transition-transform"
                />
                <div class="absolute -top-3 -end-2 w-7 h-7 rounded-full bg-amber-700 text-white border-2 border-white flex items-center justify-center font-bold text-xs shadow">
                  🥉
                </div>
              </div>
              <h4 class="mt-2 text-xs sm:text-sm font-bold text-[#1E293B] text-center truncate max-w-[110px] sm:max-w-[150px] group-hover:text-[#C86D51] transition-colors">
                ${top3.name}
              </h4>
              <span class="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                ${isAr ? (top3.levelAr || top3.level) : `${top3.level} Explorer`}
              </span>
              <span class="mt-1 font-mono font-bold text-xs text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-full border border-[#D97706]/20">
                +${(top3.displayPoints || top3.totalPoints || 0).toLocaleString()} ${isAr ? 'نقطة' : 'pts'}
              </span>
            </div>

            <!-- عمود المنصة البرونزية -->
            <div class="w-full h-24 sm:h-32 rounded-t-2xl bg-gradient-to-t from-amber-100 to-amber-50 border-t-4 border-amber-600/40 flex flex-col items-center justify-center p-3 shadow-sm group-hover:bg-amber-100 transition-colors">
              <span class="text-3xl sm:text-4xl font-black text-amber-700/60 font-mono">3</span>
              <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider mt-0.5">
                ${isAr ? 'المركز الثالث' : '3rd Place'}
              </span>
            </div>
          </div>

        </div>
      </div>
    `;

    // ربط النقر على البطاقات لمعاينة بروفايل المتصدر
    container.querySelectorAll('.podium-card').forEach((card) => {
      card.addEventListener('click', () => {
        const index = Number(card.dataset.userIndex);
        const user = topUsers[index];
        if (user) {
          this.onSelectUser(user);
        }
      });
    });
  }
}