/**
 * 🇯🇴 مكون شريط التنقل العلوي المتجاوب (Global Header Component)
 * يتضمن الربط اللحظي مع مخزن الحالة والشعار ومبدل اللغات والإشعارات
 */

import { store } from '../state/store.js';
import { initialNotifications } from '../data/mock.data.js';
import { hasCollectedAllOfficialStamps, renderJordanVerificationBadge } from './jordan-verification-badge.js';

let currentActiveTab = 'home';
let userStateListenerBound = false;

export function renderHeader(activeTab = 'home') {
  const mountEl = document.getElementById('navbar-mount');
  if (!mountEl) return;

  currentActiveTab = activeTab;
  if (!userStateListenerBound) {
    window.addEventListener('user-state-changed', (event) => {
      store.user = event.detail;
      renderHeader(currentActiveTab);
    });

    window.addEventListener('language-changed', () => {
      renderHeader(currentActiveTab);
    });

    userStateListenerBound = true;
  }

  const isRtl = store.language === 'ar';
  const user = store.user;
  const isVerified = hasCollectedAllOfficialStamps(user);
  const notifications = initialNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;
  const languageOptions = [
    { code: 'ar', label: '🇯🇴 العربية', short: 'العربية' },
    { code: 'en', label: '🇬🇧 English', short: 'English' },
    { code: 'fr', label: '🇫🇷 Français', short: 'Français' },
    { code: 'de', label: '🇩🇪 Deutsch', short: 'Deutsch' },
    { code: 'tr', label: '🇹🇷 Türkçe', short: 'Türkçe' }
  ];
  const currentLanguageLabel = languageOptions.find(lang => lang.code === store.language)?.label || '🇯🇴 العربية';

  const navLinks = [
    { id: 'home', url: 'index.html', labelAr: 'الرئيسية', labelEn: 'Home' },
    { id: 'explore', url: 'explore.html', labelAr: 'استكشف الرحلات', labelEn: 'Explore Tours' },
    { id: 'community', url: 'community.html', labelAr: 'منتدى السياح', labelEn: 'Travelers Forum' },
    { id: 'map', url: 'map.html', labelAr: 'خريطة الأردن', labelEn: 'Jordan Map' },
    { id: 'leaderboard', url: 'leaderboard.html', labelAr: 'المتصدرين', labelEn: 'Leaderboard' }
  ];

  mountEl.innerHTML = `
    <div class="w-full bg-white border-b border-[#E2E8F0] shadow-xs transition-colors">
      <div class="max-w-[1440px] mx-auto h-[70px] sm:h-[76px] px-4 sm:px-6 md:px-8 flex items-center justify-between">
        
        <!-- الشعار واسم الموقع -->
        <a href="index.html" class="flex items-center gap-2 sm:gap-3 group text-start shrink-0">
          <img
            src="${store.logoUrl}"
            alt="${store.siteName}"
            class="dynamic-logo w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover shadow border border-slate-800 transition-transform group-hover:scale-105"
          >
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="dynamic-site-name font-black text-base sm:text-xl tracking-tight text-[#111827]">
                Jordan Tour
              </span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#C86D51]"></span>
            </div>
            <p class="text-[10px] sm:text-[11px] font-semibold text-[#C86D51] font-arabic -mt-0.5 truncate max-w-[150px] sm:max-w-none">
              ${isRtl ? 'بوابة السياحة والتجارب الأردنية' : 'Official Jordan Heritage Portal'}
            </p>
          </div>
        </a>

        <!-- الروابط الرئيسية لشاشات الديسكتوب -->
        <nav
          class="hidden lg:flex flex-1 items-center justify-center gap-1.5 xl:gap-3"
          style="display: none;" 
        >
          ${navLinks.map(link => {
            const isActive = (activeTab === link.id);
            return `
              <a
                href="${link.url}"
                class="px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'text-[#C86D51] bg-[#FDF2EE] font-black'
                    : 'text-[#1E293B] hover:text-[#C86D51] hover:bg-slate-50'
                }"
              >
                ${isRtl ? link.labelAr : link.labelEn}
              </a>
            `;
          }).join('')}
        </nav>

        <!-- أزرار الإجراءات على اليمين (اللغات، العملة، الإشعارات، الحساب) -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          
          <!-- قائمة تحويل العملات -->
          <div class="hidden sm:block relative" id="header-currency-dropdown">
            <button
              type="button"
              id="btn-currency-toggle"
              class="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white text-xs font-bold text-[#1E293B] transition-colors shadow-2xs cursor-pointer"
            >
              <span id="current-currency-text">${store.currency}</span>
              <i class="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
            </button>
            <div id="currency-menu" class="hidden absolute top-full end-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-1.5 z-50">
              <button onclick="window.changeCurrency('JOD')" class="w-full px-3 py-1.5 text-start text-xs font-bold hover:bg-slate-50 flex justify-between cursor-pointer">
                <span>JOD (د.أ)</span>
              </button>
              <button onclick="window.changeCurrency('USD')" class="w-full px-3 py-1.5 text-start text-xs font-bold hover:bg-slate-50 flex justify-between cursor-pointer">
                <span>USD ($)</span>
              </button>
              <button onclick="window.changeCurrency('EUR')" class="w-full px-3 py-1.5 text-start text-xs font-bold hover:bg-slate-50 flex justify-between cursor-pointer">
                <span>EUR (€)</span>
              </button>
            </div>
          </div>

          <!-- قائمة اللغات (5 لغات) -->
          <div class="relative" id="header-lang-dropdown">
            <button
              type="button"
              id="btn-lang-toggle"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white text-xs font-bold text-[#1E293B] transition-colors shadow-2xs cursor-pointer"
            >
              <span>${currentLanguageLabel}</span>
              <i class="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
            </button>
            <div id="lang-menu" class="hidden absolute top-full end-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50">
              ${languageOptions.map(lang => `
                <button onclick="window.changeLanguage('${lang.code}')" class="w-full px-3.5 py-2 text-start text-xs font-bold hover:bg-slate-50 flex items-center justify-between cursor-pointer ${store.language === lang.code ? 'text-[#C86D51] bg-[#C86D51]/5' : ''}">
                  <span>${lang.label}</span>
                  ${store.language === lang.code ? '<span>✓</span>' : ''}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- جرس الإشعارات التفاعلية -->
          ${user ? `
          <div class="relative" id="header-notifications-dropdown">
            <button
              type="button"
              id="btn-notif-toggle"
              class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white text-slate-600 hover:text-[#C86D51] transition-colors flex items-center justify-center shadow-2xs cursor-pointer"
              title="التنبيهات والإشعارات"
            >
              <i class="fa-regular fa-bell text-sm"></i>
              ${unreadCount > 0 ? `
                <span class="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E29578] text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                  ${unreadCount}
                </span>
              ` : ''}
            </button>

            <!-- صندوق الإشعارات المنسدل -->
            <div id="notif-menu" class="hidden absolute top-full end-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] p-4 z-50 animate-in fade-in">
              <div class="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-bell text-[#C86D51]"></i>
                  <h4 class="font-extrabold text-sm text-[#1E293B]">مركز الإشعارات والتنبيهات</h4>
                </div>
                <span class="text-[10px] font-bold text-[#C86D51] bg-[#C86D51]/10 px-2 py-0.5 rounded-full">
                  ${unreadCount} جديد
                </span>
              </div>

              <div class="max-h-72 overflow-y-auto space-y-2">
                ${notifications.map(n => `
                  <a
                    href="${n.targetUrl || 'profile.html'}"
                    class="p-3 rounded-2xl border text-start transition-all hover:bg-slate-50 flex items-start gap-2.5 ${!n.read ? 'bg-[#C86D51]/5 border-[#C86D51]/20' : 'bg-white border-[#E2E8F0]'}"
                  >
                    <div class="w-8 h-8 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                      <i class="fa-solid ${n.type === 'booking' ? 'fa-ticket' : n.type === 'cliq' ? 'fa-shield-check' : 'fa-sparkles'} text-xs"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-[#1E293B] leading-snug">${n.title.ar}</p>
                      <span class="text-[10px] text-slate-400 mt-1 block">${n.time.ar}</span>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          <!-- زر الحساب الشخصي أو زر الدخول العصري -->
          <div class="relative">
            ${user ? `
              <a
                href="profile.html"
                class="relative p-0.5 rounded-full border-2 border-slate-200 hover:border-[#C86D51] transition-all flex items-center justify-center cursor-pointer group"
                title="${user.displayName || 'الملف الشخصي'}"
              >
                <img
                  src="${user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}"
                  alt="User Avatar"
                  class="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white"
                >
                ${isVerified ? renderJordanVerificationBadge('absolute -bottom-1 -end-1 h-6 w-6 drop-shadow-sm') : ''}
              </a>
            ` : `
              <button
                type="button"
                id="btn-nav-auth-login"
                class="group flex min-h-11 items-center gap-2 rounded-xl border border-[#1E293B] bg-[#1E293B] px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-[#0F172A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706] active:scale-[0.98] cursor-pointer"
              >
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm" style="background-color: #FDE68A; color: #1E293B;">
                  <i class="fa-solid fa-arrow-right-to-bracket text-sm" aria-hidden="true"></i>
                </span>
                <span>تسجيل الدخول</span>
              </button>
            `}
          </div>

          <!-- زر القائمة المتجاوبة للموبايل -->
          <button
            type="button"
            id="btn-mobile-menu-toggle"
            class="lg:hidden w-9 h-9 rounded-xl border border-[#E2E8F0] bg-slate-50 flex items-center justify-center text-slate-700 cursor-pointer"
          >
            <i class="fa-solid fa-bars text-sm"></i>
          </button>

        </div>
      </div>
    </div>

    <!-- الدرج الجانبي المنزلق لشاشات الموبايل (Slide-over Drawer) -->
    <div id="mobile-menu-drawer" class="fixed inset-0 z-50 hidden">
      <div id="drawer-backdrop" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"></div>
      <div class="fixed top-0 end-0 w-[85%] max-w-[320px] h-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto p-5 animate-in slide-in-from-end">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div class="flex items-center gap-2">
              <img src="${store.logoUrl}" class="dynamic-logo w-8 h-8 rounded-lg object-cover">
              <span class="dynamic-site-name font-black text-sm text-slate-900">Jordan Tour</span>
            </div>
            <button id="btn-close-drawer" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer">&times;</button>
          </div>

          <!-- روابط الموبايل -->
          <nav class="space-y-1">
            ${navLinks.map(link => `
              <a href="${link.url}" class="block px-4 py-2.5 rounded-xl font-bold text-xs ${activeTab === link.id ? 'bg-[#C86D51]/10 text-[#C86D51]' : 'text-slate-700 hover:bg-slate-50'}">
                ${isRtl ? link.labelAr : link.labelEn}
              </a>
            `).join('')}
            <a href="profile.html" class="block px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50">الملف الشخصي</a>
          </nav>
        </div>

        <div class="pt-4 border-t border-slate-100 space-y-3">
          <a href="https://wa.me/962791234567" target="_blank" class="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow">
            <i class="fa-brands fa-whatsapp text-sm"></i>
            <span>تواصل واتساب للدعم</span>
          </a>
        </div>
      </div>
    </div>
  `;

  // ربط أحداث القوائم المنسدلة
  initHeaderInteractions();
}

function initHeaderInteractions() {
  // 1. فتح نافذة تسجيل الدخول/التسجيل الحديثة
  document.getElementById('btn-nav-auth-login')?.addEventListener('click', () => {
    if (window.authModal) {
      window.authModal.show('login');
    }
  });

  // 2. القوائم المنسدلة (العملة، اللغة، الإشعارات)
  const toggleDropdown = (btnId, menuId) => {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return;

    btn.onclick = (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    };
  };

  toggleDropdown('btn-currency-toggle', 'currency-menu');
  toggleDropdown('btn-lang-toggle', 'lang-menu');
  toggleDropdown('btn-notif-toggle', 'notif-menu');

  // إغلاق القوائم عند النقر في أي مكان آخر
  document.addEventListener('click', () => {
    document.getElementById('currency-menu')?.classList.add('hidden');
    document.getElementById('lang-menu')?.classList.add('hidden');
    document.getElementById('notif-menu')?.classList.add('hidden');
  });

  // 3. درج الموبايل
  const drawer = document.getElementById('mobile-menu-drawer');
  document.getElementById('btn-mobile-menu-toggle')?.addEventListener('click', () => drawer?.classList.remove('hidden'));
  document.getElementById('btn-close-drawer')?.addEventListener('click', () => drawer?.classList.add('hidden'));
  document.getElementById('drawer-backdrop')?.addEventListener('click', () => drawer?.classList.add('hidden'));

  // دوال التحويل العامة
  window.changeCurrency = (curr) => {
    store.setCurrency(curr);
    document.getElementById('current-currency-text').textContent = curr;
    document.getElementById('currency-menu')?.classList.add('hidden');
  };

  window.changeLanguage = async (lang) => {
    const changed = await store.setLanguage(lang);
    if (!changed) {
      alert('تعذر ترجمة الموقع بالكامل الآن. تم الإبقاء على اللغة الحالية؛ تحقق من خدمة الترجمة وحاول مجدداً.');
    }
  };
}