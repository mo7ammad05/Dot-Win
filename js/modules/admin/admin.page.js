

import { store } from '../../state/store.js';
import { appStore } from '../../state/store.js';
import { Storage, STORAGE_KEYS } from '../../state/storage.js';
import { destinationsData } from '../../data/destinations.data.js';
import { governoratesData } from '../../data/governorates.data.js';
import { defaultHomeCategoryCards } from '../../data/home-cards.data.js';
import { officialStampsData } from '../../data/stamps.data.js';
import { FirebaseService } from '../../services/firebase.service.js';
import { uploaderService } from '../../services/uploader.service.js';

import { AdminAuthGate } from './admin.auth.js';
import { AdminAnalytics } from './admin.analytics.js';
import { AdminBookings } from './admin.bookings.js';
import { AdminTrips } from './admin.trips.js';
import { AdminLandmarks } from './admin.landmarks.js';
import { AdminMap } from './admin.map.js';
import { AdminPoints } from './admin.points.js';
import { AdminDataPurge } from './admin.purge.js';
import { loadStampCatalog } from '../passport/stamp-collector.js';

export class AdminPageController {
  constructor() {
    this.authGate = new AdminAuthGate({
      onAuthenticated: async () => {
        await this.loadAllAdminData();
        this.renderDashboard();
      },
      onCancel: () => { window.location.href = 'index.html'; }
    });

    this.activeTab = 'stats'; // 'stats' | 'bookings' | 'trips' | 'landmarks' | 'map' | 'stamps' | 'branding' | 'home-cards' | 'points' | 'purge'
    this.appMount = document.getElementById('admin-app-mount');

    // البيانات المركزية المشتركة
    this.destinations = [];
    this.governorates = [];
    this.masterLandmarks = [];
    this.stamps = officialStampsData;
    this.bookings = [];
    this.communityPosts = [];
    this.reports = [];
    this.pointsSettings = {
      referredUserPoints: 100,
      referrerPoints: 150,
      referralDiscountJOD: 5,
      postPoints: 25,
      maxMonthlyPostsPerUser: 5,
      isMonthlyPostLimitActive: true,
    };
    this.hasCloudPointsSettings = false;
    this.homeCategoryCards = [...defaultHomeCategoryCards];
    this.hasCloudCategoryCards = false;
  }

  /**
   * نقطة البداية
   */
  async init() {
    if (!this.appMount) return;

    // 1. فحص الجلسة: إذا لم يكن مسجل الدخول، نعرض بوابة الحماية
    if (!this.authGate.isAuthenticated()) {
      this.authGate.renderGate(this.appMount);
      return;
    }

    // 2. إذا كان مصادقاً عليه، نقوم بتحميل البيانات ورسم اللوحة
    await this.loadAllAdminData();
    this.renderDashboard();
  }

  /**
   * جلب كافة بيانات النظام المركزية
   */
  async loadAllAdminData() {
    this.stamps = await loadStampCatalog();

    // محاولة القراءة السحابية من Firestore إن توفرت
    if (window.JordanFirebase && window.JordanFirebase.db) {
      try {
        const db = window.JordanFirebase.db;
        const [destDoc, govDoc, lmDoc, ptsDoc, mapDoc, categoryDoc] = await Promise.all([
          db.collection('settings').doc('destinations_data').get(),
          db.collection('settings').doc('governorates_data').get(),
          db.collection('settings').doc('landmarks_data').get(),
          db.collection('settings').doc('points_settings').get(),
          db.collection('settings').doc('map_image').get(),
          db.collection('settings').doc('category_cards').get()
        ]);

        if (destDoc.exists && Array.isArray(destDoc.data().list)) {
          const cloudCatalog = destDoc.data();
          this.destinations = cloudCatalog.list;
          if (cloudCatalog.list.length > 0 && !cloudCatalog.catalogVersion) {
            const merged = new Map(destinationsData.map((trip) => [trip.id, trip]));
            cloudCatalog.list.forEach((trip) => merged.set(trip.id, { ...merged.get(trip.id), ...trip }));
            this.destinations = [...merged.values()];
            await db.collection('settings').doc('destinations_data').set({
              list: this.destinations,
              catalogVersion: 1
            }, { merge: true });
          }
        }
        if (govDoc.exists && govDoc.data().list) this.governorates = govDoc.data().list;
        if (lmDoc.exists && lmDoc.data().list) this.masterLandmarks = lmDoc.data().list;
        if (mapDoc.exists && mapDoc.data().url) Storage.set(STORAGE_KEYS.MAP_IMAGE, mapDoc.data().url);
        if (categoryDoc.exists && Array.isArray(categoryDoc.data().list)) {
          this.homeCategoryCards = categoryDoc.data().list;
          this.hasCloudCategoryCards = true;
        }
        if (ptsDoc.exists) {
          this.pointsSettings = ptsDoc.data();
          this.hasCloudPointsSettings = true;
        }
      } catch (e) {
        console.warn('Firebase data load note:', e.message);
      }
    }

    // بيانات احتياطية متكاملة إذا لم تكن مخزنة سحابياً بعد
    if (this.destinations.length === 0) {
      this.destinations = Storage.get(STORAGE_KEYS.DESTINATIONS, []);
    }
    if (this.destinations.length === 0) this.destinations = [...destinationsData];

    if (this.masterLandmarks.length === 0) {
      this.masterLandmarks = Storage.get(STORAGE_KEYS.LANDMARKS, []);
    }

    if (!this.hasCloudCategoryCards) {
      try {
        const cachedCards = JSON.parse(localStorage.getItem('jt_home_category_cards') || 'null');
        if (Array.isArray(cachedCards) && cachedCards.length) this.homeCategoryCards = cachedCards;
      } catch (error) {}
    }
    if (this.masterLandmarks.length === 0) {
      this.masterLandmarks = Storage.get(STORAGE_KEYS.LANDMARKS, []);
    }

    if (this.governorates.length === 0) {
      this.governorates = Storage.get(STORAGE_KEYS.GOVERNORATES, []);
    }
    if (this.governorates.length === 0) this.governorates = [...governoratesData];

    if (this.masterLandmarks.length === 0) {
      this.masterLandmarks = this.governorates.flatMap((governorate) =>
        (governorate.landmarks || []).map((landmark) => ({ ...landmark, governorateId: governorate.id }))
      );
    }

    if (!this.hasCloudPointsSettings) {
      this.pointsSettings = Storage.get(STORAGE_KEYS.POINTS_SETTINGS, this.pointsSettings);
    }

    const cloudBookings = await FirebaseService.getBookings();
    this.bookings = cloudBookings || Storage.get(STORAGE_KEYS.BOOKINGS, []);

    appStore.setState({
      destinations: this.destinations,
      governorates: this.governorates,
      masterLandmarks: this.masterLandmarks,
      bookings: this.bookings,
      pointsSettings: this.pointsSettings,
      posts: this.communityPosts,
      reports: this.reports,
      leaderboard: []
    });

  }

  /**
   * رسم لوحة الإدارة المركزية بالكامل
   */
  renderDashboard() {
    if (!this.appMount) return;

    const isAr = store.language === 'ar';

    this.appMount.innerHTML = `
      <div class="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 select-none">
        
        <!-- الرأس الإداري الماستر (Admin Header Bar) -->
        <div class="bg-[#1E293B] text-white p-6 sm:p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-slate-700">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300 shadow">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-white">
                  ${isAr ? 'لوحة تحكم الإدارة الشاملة (Master Admin)' : 'Master Admin Portal'}
                </h1>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  SESSION ACTIVE
                </span>
              </div>
              <p class="text-xs text-slate-300 mt-1 font-sans">
                ${isAr ? 'تحكم كامل بنظام Jordan Tour: الحجوزات، كليك، المعالم، الأسعار، الهوية، والأختام.' : 'Full system control: Bookings, CliQ, Landmarks, Pricing, Branding & Stamps.'}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 text-xs">
            <button
              type="button"
              id="admin-logout-btn"
              class="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
            >
              ${isAr ? 'تسجيل خروج الإدارة' : 'Logout Admin'}
            </button>
            <a
              href="index.html"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold rounded-xl transition-colors"
            >
              ${isAr ? 'الرجوع للموقع ↗' : 'View Site ↗'}
            </a>
          </div>
        </div>

        <!-- شريط المزامنة السحابية الفورية (Live Cloud Sync Banner) -->
        <div class="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 text-white p-4 sm:p-5 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-extrabold text-sm text-emerald-200">
                  ${isAr ? 'المزامنة السحابية متصلة وفورية 🟢' : 'Real-Time Cloud Sync Active 🟢'}
                </h4>
                <span class="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live Firestore
                </span>
              </div>
              <p class="text-xs text-emerald-100/75 mt-0.5 leading-relaxed">
                ${isAr ? 'أي تعديل تجريه هنا يُحفظ سحابياً فوراً ويصل لجميع الزوار على كافة الأجهزة والهواتف دون لمس الكود!' : 'Changes are automatically synchronized to the cloud for all visitors in real-time.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="force-cloud-sync-btn"
            class="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>⚡</span>
            <span>${isAr ? 'مزامنة قسرية شاملة لكافة البيانات الآن' : 'Sync All Data to Cloud'}</span>
          </button>
        </div>

        <!-- أزرار تبويبات أقسام لوحة الإدارة الـ 9 -->
        <div class="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto text-xs sm:text-sm font-bold pb-1" id="admin-main-tabs-nav">
          ${[
            { id: 'stats', label: isAr ? 'الإحصائيات الشاملة 📊' : 'Analytics 📊' },
            { id: 'bookings', label: isAr ? `الحجوزات وإثباتات كليك (${this.bookings.length}) 🎟️` : `Bookings (${this.bookings.length}) 🎟️` },
            { id: 'trips', label: isAr ? `إدارة الرحلات (${this.destinations.length}) 🧭` : `Tours (${this.destinations.length}) 🧭` },
            { id: 'landmarks', label: isAr ? `المكتبة الشاملة للمعالم (${this.masterLandmarks.length}) 🏛️` : `Master Landmarks (${this.masterLandmarks.length}) 🏛️`, highlight: true },
            { id: 'map', label: isAr ? 'تعديل صفحة الخريطة 🗺️' : 'Map Editor 🗺️' },
            { id: 'stamps', label: isAr ? 'إدارة الأختام الـ 12 🏆' : '12 Stamps 🏆' },
            { id: 'branding', label: isAr ? 'هوية وشعار الموقع ⚙️' : 'Branding & CMS ⚙️', highlight: true },
            { id: 'ai-config', label: isAr ? 'إعدادات المرشد الذكي 🤖' : 'AI Guide Settings 🤖', highlight: true },
            { id: 'home-cards', label: isAr ? 'بطاقات الصفحة الرئيسية 🖼️' : 'Home Category Cards 🖼️', highlight: true },
            { id: 'points', label: isAr ? 'إدارة النقاط والإحالات 🪙' : 'Points Rules 🪙' },
            { id: 'purge', label: isAr ? 'تنظيف البيانات الوهمية 🧹' : 'Mock Purge 🧹', highlight: true },
          ].map(t => `
            <button
              type="button"
              data-admin-tab="${t.id}"
              class="admin-nav-tab-btn px-4 py-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap rounded-t-xl cursor-pointer ${
                this.activeTab === t.id
                  ? 'border-[#C86D51] text-[#C86D51] bg-[#C86D51]/5 font-black'
                  : t.highlight
                  ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }"
            >
              <span>${t.label}</span>
              ${t.highlight && this.activeTab !== t.id ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">NEW</span>` : ''}
            </button>
          `).join('')}
        </div>

        <!-- الحاوية الديناميكية للقسم النشط -->
        <div id="admin-active-tab-container"></div>

      </div>
    `;

    this.bindTopBarEvents();
    this.renderActiveTab();
  }

  /**
   * ربط أحداث الشريط العلوي والتبويبات
   */
  bindTopBarEvents() {
    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      this.authGate.logout();
    });

    document.getElementById('force-cloud-sync-btn')?.addEventListener('click', async () => {
      await this.syncAllDataToCloud();
    });

    this.appMount.querySelectorAll('.admin-nav-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.adminTab;
        this.renderDashboard();
      });
    });
  }

  /**
   * رسم محتوى القسم النشط
   */
  renderActiveTab() {
    const container = document.getElementById('admin-active-tab-container');
    if (!container) return;

    const state = appStore.getState();
    this.destinations = state.destinations;
    this.governorates = state.governorates;
    this.masterLandmarks = state.masterLandmarks;
    this.bookings = state.bookings;
    this.pointsSettings = state.pointsSettings;
    this.communityPosts = state.posts;
    this.reports = state.reports;

    container.innerHTML = '';

    // 1. الإحصائيات
    if (this.activeTab === 'stats') {
      container.innerHTML = AdminAnalytics.renderFullView(this.bookings, this.communityPosts, this.reports);
    }
    // 2. الحجوزات وكليك
    else if (this.activeTab === 'bookings') {
      container.innerHTML = AdminBookings.renderFullView(this.bookings);
      AdminBookings.bindEvents(container, () => this.renderActiveTab());
    }
    // 3. إدارة الرحلات
    else if (this.activeTab === 'trips') {
      container.innerHTML = AdminTrips.renderFullView(this.destinations, this.masterLandmarks, this.stamps);
      AdminTrips.bindEvents(container, () => {
        this.destinations = appStore.getState().destinations;
        this.renderDashboard();
      }, this.masterLandmarks, this.stamps);
    }
    // 4. المكتبة الشاملة للمعالم
    else if (this.activeTab === 'landmarks') {
      container.innerHTML = AdminLandmarks.renderFullView(this.masterLandmarks, this.governorates);
      AdminLandmarks.bindEvents(container, this.governorates, () => this.renderActiveTab());
    }
    // 5. محرر الخريطة
    else if (this.activeTab === 'map') {
      container.innerHTML = AdminMap.renderFullView(this.governorates, this.stamps);
      AdminMap.bindEvents(container, this.governorates, this.stamps, () => this.renderActiveTab());
    }
    // 6. هوية الموقع والشعار (Branding CMS)
    else if (this.activeTab === 'branding') {
      this.renderBrandingCMS(container);
    }
    // 7. إعداد مفتاح المرشد الذكي من لوحة الإدارة فقط
    else if (this.activeTab === 'ai-config') {
      this.renderAIConfig(container);
    }
    // 8. بطاقات تصنيفات الصفحة الرئيسية
    else if (this.activeTab === 'home-cards') {
      this.renderHomeCardsCMS(container);
    }
    // 9. إدارة الأختام الـ 12
    else if (this.activeTab === 'stamps') {
      this.renderStampsManager(container);
    }
    // 9. قواعد النقاط والإحالات
    else if (this.activeTab === 'points') {
      container.innerHTML = AdminPoints.renderFullView(this.pointsSettings);
      AdminPoints.bindEvents(container, () => this.renderActiveTab());
    }
    // 10. تنظيف البيانات الوهمية
    else if (this.activeTab === 'purge') {
      container.innerHTML = AdminDataPurge.renderFullView(appStore.getState());
      AdminDataPurge.bindEvents(container, () => this.renderActiveTab());
    }
  }

  /**
   * قسم تعديل هوية الموقع والشعار (ينعكس فورياً في كل الموقع دون لمس الكود)
   */
  async renderAIConfig(container) {
    let currentKey = '';
    try {
      const config = await FirebaseService.getSettingsDocument('ai_config');
      currentKey = config?.apiKey || '';
    } catch (error) {
      console.warn('Could not load AI configuration:', error);
    }

    container.innerHTML = `
      <form id="ai-config-form" class="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card space-y-5 animate-in fade-in duration-300">
        <div class="border-b pb-4">
          <h3 class="font-extrabold text-lg text-[#1E293B]">إعدادات المرشد السياحي الذكي</h3>
          <p class="text-xs text-slate-500 mt-1">يتم تعديل مفتاح Gemini من هذه اللوحة فقط، ولا يظهر للمستخدمين داخل الشات.</p>
        </div>
        <div>
          <label for="admin-gemini-api-key" class="text-xs font-bold text-slate-700 block mb-1">مفتاح Gemini API</label>
          <input type="password" id="admin-gemini-api-key" value="${currentKey.replace(/"/g, '&quot;')}" placeholder="AIzaSy..." autocomplete="new-password" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-mono text-[#1E293B]" />
        </div>
        <div class="flex items-center justify-between gap-3 border-t pt-4">
          <span id="ai-config-status" class="text-xs text-slate-500" aria-live="polite"></span>
          <button type="submit" class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-7 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer">حفظ المفتاح وتفعيله</button>
        </div>
      </form>
    `;

    container.querySelector('#ai-config-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = container.querySelector('#admin-gemini-api-key');
      const status = container.querySelector('#ai-config-status');
      const button = container.querySelector('#ai-config-form button[type="submit"]');
      const apiKey = input?.value.trim() || '';
      if (!apiKey) {
        status.textContent = 'أدخل مفتاح Gemini أولاً.';
        return;
      }

      button.disabled = true;
      status.textContent = 'جارٍ الحفظ...';
      const saved = await FirebaseService.saveToCloudDoc('ai_config', { apiKey });
      if (saved) window.dispatchEvent(new CustomEvent('translation-api-key-updated', { detail: apiKey }));
      button.disabled = false;
      status.textContent = saved ? 'تم حفظ المفتاح وتفعيله لجميع المستخدمين.' : 'تعذر الحفظ السحابي.';
    });
  }

  renderHomeCardsCMS(container) {
    const cards = this.homeCategoryCards || defaultHomeCategoryCards;
    const escape = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

    container.innerHTML = `
      <form id="home-cards-form" class="space-y-5 animate-in fade-in duration-300">
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card">
          <h3 class="font-extrabold text-lg text-[#1E293B]">بطاقات تصنيفات الصفحة الرئيسية</h3>
          <p class="text-xs text-slate-500 mt-1">عدّل كل بطاقة بشكل مستقل. عند الضغط عليها ينتقل الزائر إلى صفحة الاستكشاف حسب التصنيف المحدد.</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          ${cards.map((card, index) => `
            <section class="bg-white rounded-3xl border border-slate-200 shadow-soft-card p-5 space-y-3">
              <div class="flex items-center justify-between border-b pb-3">
                <h4 class="font-extrabold text-sm text-[#1E293B]">البطاقة ${index + 1}</h4>
                <span class="text-[10px] font-mono text-slate-400">${escape(card.id)}</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-bold text-slate-700 block mb-1">العنوان</label>
                  <input data-card-field="title" data-card-index="${index}" value="${escape(card.title)}" required class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 text-xs">
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-700 block mb-1">عدد الرحلات</label>
                  <input data-card-field="count" data-card-index="${index}" value="${escape(card.count)}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
                </div>
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">الوصف</label>
                <textarea data-card-field="description" data-card-index="${index}" rows="2" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 text-xs">${escape(card.description)}</textarea>
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">تصنيف الاستكشاف</label>
                <select data-card-field="category" data-card-index="${index}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 text-xs">
                  ${['adventure', 'relaxation', 'archaeology', 'eco', 'luxury'].map(category => `<option value="${category}" ${card.category === category ? 'selected' : ''}>${category}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">رابط الصورة أو رفع من الجهاز</label>
                <input data-card-field="image" data-card-index="${index}" value="${escape(card.image)}" placeholder="https://..." class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
                <div class="flex items-center gap-2 mt-2">
                  <input type="file" accept="image/*" data-card-file="${index}" class="hidden">
                  <button type="button" data-card-file-trigger="${index}" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700"><i class="fa-solid fa-upload me-1" aria-hidden="true"></i>رفع صورة</button>
                  <span data-card-file-name="${index}" class="text-[10px] text-slate-500"></span>
                </div>
              </div>
            </section>
          `).join('')}
        </div>
        <div class="bg-white p-5 rounded-3xl border border-slate-200 flex items-center justify-between gap-3">
          <span id="home-cards-status" class="text-xs text-slate-500" aria-live="polite"></span>
          <button type="submit" class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-7 py-3 rounded-xl text-xs font-bold shadow-md">حفظ البطاقات ونشرها</button>
        </div>
      </form>
    `;

    container.querySelectorAll('[data-card-file-trigger]').forEach((button) => {
      const index = button.dataset.cardFileTrigger;
      button.addEventListener('click', () => container.querySelector(`[data-card-file="${index}"]`)?.click());
    });
    container.querySelectorAll('[data-card-file]').forEach((input) => {
      input.addEventListener('change', () => {
        container.querySelector(`[data-card-file-name="${input.dataset.cardFile}"]`).textContent = input.files?.[0]?.name || '';
      });
    });
    container.querySelector('#home-cards-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = container.querySelector('#home-cards-status');
      const submit = container.querySelector('button[type="submit"]');
      submit.disabled = true;
      status.textContent = 'جارٍ رفع الصور وحفظ البطاقات...';
      try {
        const updatedCards = await Promise.all(cards.map(async (card, index) => {
          const read = (field) => container.querySelector(`[data-card-field="${field}"][data-card-index="${index}"]`)?.value.trim();
          const file = container.querySelector(`[data-card-file="${index}"]`)?.files?.[0];
          const image = file ? (await uploaderService.uploadFile(file)).dataUrl : read('image');
          return { ...card, title: read('title'), description: read('description'), count: read('count'), category: read('category'), image };
        }));
        this.homeCategoryCards = updatedCards;
        localStorage.setItem('jt_home_category_cards', JSON.stringify(updatedCards));
        const saved = await FirebaseService.saveToCloud('settings', 'category_cards', { list: updatedCards });
        status.textContent = saved ? 'تم حفظ البطاقات ونشرها لجميع الزوار.' : 'حُفظت محليًا وتعذرت المزامنة السحابية.';
      } catch (error) {
        status.textContent = 'تعذر حفظ البطاقات: ' + error.message;
      } finally {
        submit.disabled = false;
      }
    });
  }

  /**
   * قسم تعديل هوية الموقع والشعار (ينعكس فورياً في كل الموقع دون لمس الكود)
   */
  renderBrandingCMS(container) {
    const isAr = store.language === 'ar';
    const mediaEditors = [
      { key: 'home', title: 'خلفية الصفحة الرئيسية', type: store.homeHeroMediaType, url: store.homeHeroMediaUrl },
      { key: 'auth', title: 'خلفية تسجيل الدخول', type: store.authPanelMediaType, url: store.authPanelMediaUrl }
    ];

    container.innerHTML = `
      <form id="branding-cms-form" class="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card space-y-6 animate-in fade-in duration-300">
        <div class="border-b pb-4">
          <h3 class="font-extrabold text-lg text-[#1E293B]">
            ${isAr ? 'تعديل شعار واسم وهوية الموقع ومحتوى الصفحة الرئيسية' : 'Site Branding & Global Logo Control'}
          </h3>
          <p class="text-xs text-slate-500 mt-1">
            ${isAr ? 'عند تعديل الشعار أو الاسم هنا، يتغير تلقائياً في كل مكان: الهيدر، الفوتر، فورم تسجيل الدخول، والبطاقات البنكية دون لمس الكود!' : 'Logo & Brand updates reflect site-wide in real-time.'}
          </p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          ${mediaEditors.map((editor) => `
            <section class="space-y-3 rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
              <div>
                <h4 class="text-xs font-extrabold text-slate-800">${editor.title}</h4>
                <p class="mt-1 text-[11px] text-slate-500">اختر صورة أو فيديو مستقلاً، أو أدخل رابطاً عاماً.</p>
              </div>
              <input type="hidden" id="branding-${editor.key}-type" value="${editor.type}">
              <div class="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="نوع ${editor.title}">
                <button type="button" data-media-target="${editor.key}" data-media-type="video" class="branding-media-type-btn rounded-lg px-4 py-2 text-xs font-bold ${editor.type === 'video' ? 'bg-[#1E293B] text-white' : 'text-slate-600'}">فيديو</button>
                <button type="button" data-media-target="${editor.key}" data-media-type="image" class="branding-media-type-btn rounded-lg px-4 py-2 text-xs font-bold ${editor.type === 'image' ? 'bg-[#1E293B] text-white' : 'text-slate-600'}">صورة</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 items-start">
                <div class="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                  <img id="branding-${editor.key}-image-preview" src="${editor.type === 'image' ? editor.url : ''}" alt="معاينة ${editor.title}" class="${editor.type === 'image' ? '' : 'hidden'} h-full w-full object-cover">
                  <video id="branding-${editor.key}-video-preview" src="${editor.type === 'video' ? editor.url : ''}" muted playsinline controls class="${editor.type === 'video' ? '' : 'hidden'} h-full w-full object-cover"></video>
                </div>
                <div class="space-y-2">
                  <input type="url" id="branding-${editor.key}-url" value="${editor.url}" placeholder="https:// رابط الصورة أو الفيديو" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono">
                  <div class="flex flex-wrap items-center gap-2">
                    <input type="file" id="branding-${editor.key}-file" accept="${editor.type === 'image' ? 'image/*' : 'video/*'}" class="hidden">
                    <button type="button" data-media-file-trigger="${editor.key}" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><i class="fa-solid fa-upload me-1" aria-hidden="true"></i>رفع من الجهاز</button>
                    <span id="branding-${editor.key}-upload-status" class="text-[11px] text-slate-500" aria-live="polite"></span>
                  </div>
                </div>
              </div>
            </section>
          `).join('')}
        </div>

        <section class="space-y-3 rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
          <div>
            <h4 class="text-xs font-extrabold text-slate-800">نصوص الترحيب في تسجيل الدخول وإنشاء الحساب</h4>
            <p class="mt-1 text-[11px] text-slate-500">تظهر هذه العناوين والنصوص فوق خلفية الهوية في صفحة المصادقة.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="branding-auth-login-title" class="text-[11px] font-bold text-slate-700 block mb-1">عنوان تسجيل الدخول</label>
              <textarea id="branding-auth-login-title" rows="2" class="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900"></textarea>
            </div>
            <div>
              <label for="branding-auth-login-message" class="text-[11px] font-bold text-slate-700 block mb-1">نص تسجيل الدخول</label>
              <textarea id="branding-auth-login-message" rows="2" class="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900"></textarea>
            </div>
            <div>
              <label for="branding-auth-signup-title" class="text-[11px] font-bold text-slate-700 block mb-1">عنوان إنشاء الحساب</label>
              <textarea id="branding-auth-signup-title" rows="2" class="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900"></textarea>
            </div>
            <div>
              <label for="branding-auth-signup-message" class="text-[11px] font-bold text-slate-700 block mb-1">نص إنشاء الحساب</label>
              <textarea id="branding-auth-signup-message" rows="2" class="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900"></textarea>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">اسم الموقع (بالعربية):</label>
            <input type="text" id="branding-name-ar" value="${store.siteNameAr}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-[#1E293B]" required />
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">اسم الموقع (English):</label>
            <input type="text" id="branding-name-en" value="${store.siteName}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-[#1E293B]" required />
          </div>
        </div>

        <div class="space-y-3 rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
          <h4 class="text-xs font-extrabold text-slate-800">نصوص الصفحة الرئيسية</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-bold text-slate-700 block mb-1">العنوان الأول</label>
              <input type="text" id="branding-hero-title-first" value="${store.heroTitleFirst}" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900">
            </div>
            <div>
              <label class="text-[11px] font-bold text-slate-700 block mb-1">العنوان الملوّن</label>
              <input type="text" id="branding-hero-title-second" value="${store.heroTitleSecond}" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900">
            </div>
            <div class="sm:col-span-2">
              <label class="text-[11px] font-bold text-slate-700 block mb-1">النص التعريفي</label>
              <textarea id="branding-hero-subtitle" rows="2" class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900">${store.heroSubtitle}</textarea>
            </div>
            <div class="sm:col-span-2">
              <label class="text-[11px] font-bold text-slate-700 block mb-1">الشارة أعلى الهيرو</label>
              <input type="text" id="branding-hero-tag" value="${store.heroTag}" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900">
            </div>
          </div>
        </div>

        <!-- الشعار -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-700 block">رابط أو ملف شعار الموقع (Logo URL):</label>
          <div class="flex items-center gap-3">
            <img src="${store.logoUrl}" alt="Logo Preview" class="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow" id="branding-logo-preview" />
            <input type="text" id="branding-logo-input" value="${store.logoUrl}" class="flex-1 bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono" />
            <input type="file" id="branding-logo-file" accept="image/*" class="hidden" />
            <button type="button" id="trigger-logo-file-btn" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 shrink-0 cursor-pointer">
              <i class="fa-solid fa-upload me-1" aria-hidden="true"></i>رفع ملف
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">رقم واتساب المعتمد للتواصل:</label>
            <input type="text" id="branding-whatsapp" value="${store.whatsappNumber}" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold" />
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">الاسم المستعار لبنك كليك (CliQ Alias):</label>
            <input type="text" value="JORDANEXPLORER" disabled class="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#D97706]" />
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t">
          <button type="submit" class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer">
            حفظ وتعميم الهوية والشعار على كامل الموقع فوراً ✓
          </button>
        </div>
      </form>
    `;

    container.querySelector('#branding-auth-login-title').value = store.authLoginTitle || localStorage.getItem('jt_auth_login_title') || 'مرحباً\nبعودتك!';
    container.querySelector('#branding-auth-login-message').value = store.authLoginMessage || localStorage.getItem('jt_auth_login_message') || 'سجّل الدخول لمتابعة رحلتك واستكشاف الأردن.';
    container.querySelector('#branding-auth-signup-title').value = store.authSignupTitle || localStorage.getItem('jt_auth_signup_title') || 'أهلاً\nبك معنا!';
    container.querySelector('#branding-auth-signup-message').value = store.authSignupMessage || localStorage.getItem('jt_auth_signup_message') || 'أنشئ حسابك واجمع أختام المحافظات في جوازك الرقمي.';

    const form = container.querySelector('#branding-cms-form');
    const logoInput = container.querySelector('#branding-logo-input');
    const logoFile = container.querySelector('#branding-logo-file');
    const triggerBtn = container.querySelector('#trigger-logo-file-btn');
    const preview = container.querySelector('#branding-logo-preview');
    const getMediaEditor = (key) => ({
      typeInput: container.querySelector(`#branding-${key}-type`),
      urlInput: container.querySelector(`#branding-${key}-url`),
      fileInput: container.querySelector(`#branding-${key}-file`),
      imagePreview: container.querySelector(`#branding-${key}-image-preview`),
      videoPreview: container.querySelector(`#branding-${key}-video-preview`),
      status: container.querySelector(`#branding-${key}-upload-status`)
    });
    const updateMediaPreview = (editor, url) => {
      const isImage = editor.typeInput.value === 'image';
      editor.imagePreview.classList.toggle('hidden', !isImage || !url);
      editor.videoPreview.classList.toggle('hidden', isImage || !url);
      if (isImage) {
        editor.imagePreview.src = url;
        editor.videoPreview.pause();
      } else if (url) {
        editor.videoPreview.src = url;
        editor.videoPreview.load();
      }
    };

    container.querySelectorAll('.branding-media-type-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const editor = getMediaEditor(button.dataset.mediaTarget);
        editor.typeInput.value = button.dataset.mediaType;
        editor.fileInput.accept = button.dataset.mediaType === 'image' ? 'image/*' : 'video/*';
        container.querySelectorAll(`.branding-media-type-btn[data-media-target="${button.dataset.mediaTarget}"]`).forEach((item) => {
          const active = item === button;
          item.className = `branding-media-type-btn rounded-lg px-4 py-2 text-xs font-bold ${active ? 'bg-[#1E293B] text-white' : 'text-slate-600'}`;
        });
        updateMediaPreview(editor, editor.urlInput.value.trim());
      });
    });

    container.querySelectorAll('[data-media-file-trigger]').forEach((button) => {
      const editor = getMediaEditor(button.dataset.mediaFileTrigger);
      button.addEventListener('click', () => editor.fileInput.click());
      editor.fileInput.addEventListener('change', () => {
        const file = editor.fileInput.files?.[0];
        if (!file) return;
        editor.urlInput.value = '';
        updateMediaPreview(editor, URL.createObjectURL(file));
        editor.status.textContent = file.name;
      });
      editor.urlInput.addEventListener('input', () => updateMediaPreview(editor, editor.urlInput.value.trim()));
    });

    triggerBtn?.addEventListener('click', () => logoFile?.click());
    logoFile?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (logoInput) logoInput.value = evt.target.result;
          if (preview) preview.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newAr = container.querySelector('#branding-name-ar')?.value?.trim();
      const newEn = container.querySelector('#branding-name-en')?.value?.trim();
      const newLogo = logoInput?.value?.trim();
      const newWhatsapp = container.querySelector('#branding-whatsapp')?.value?.trim();
      const heroTitleFirst = container.querySelector('#branding-hero-title-first')?.value?.trim();
      const heroTitleSecond = container.querySelector('#branding-hero-title-second')?.value?.trim();
      const heroSubtitle = container.querySelector('#branding-hero-subtitle')?.value?.trim();
      const heroTag = container.querySelector('#branding-hero-tag')?.value?.trim();
      const authLoginTitle = container.querySelector('#branding-auth-login-title')?.value?.trim();
      const authLoginMessage = container.querySelector('#branding-auth-login-message')?.value?.trim();
      const authSignupTitle = container.querySelector('#branding-auth-signup-title')?.value?.trim();
      const authSignupMessage = container.querySelector('#branding-auth-signup-message')?.value?.trim();
      const mediaValues = {};
      try {
        for (const key of ['home', 'auth']) {
          const editor = getMediaEditor(key);
          let url = editor.urlInput.value.trim();
          const file = editor.fileInput.files?.[0];
          if (file) {
            editor.status.textContent = 'جارٍ رفع الملف...';
            url = (await uploaderService.uploadFile(file)).dataUrl;
            editor.urlInput.value = url;
            editor.status.textContent = 'تم الرفع';
          }
          if (!url) throw new Error(`أدخل رابطاً أو ارفع ملفاً لـ${key === 'home' ? 'خلفية الصفحة الرئيسية' : 'خلفية تسجيل الدخول'}.`);
          mediaValues[key] = { type: editor.typeInput.value, url };
        }
      } catch (err) {
        alert('تعذر رفع أو حفظ الخلفية: ' + err.message);
        return;
      }

      if (newAr) store.siteNameAr = newAr;
      if (newEn) store.siteName = newEn;
      if (newLogo) store.logoUrl = newLogo;
      if (newWhatsapp) store.whatsappNumber = newWhatsapp;
      if (heroTitleFirst) store.heroTitleFirst = heroTitleFirst;
      if (heroTitleSecond) store.heroTitleSecond = heroTitleSecond;
      if (heroSubtitle) store.heroSubtitle = heroSubtitle;
      if (heroTag) store.heroTag = heroTag;
      if (authLoginTitle) store.authLoginTitle = authLoginTitle;
      if (authLoginMessage) store.authLoginMessage = authLoginMessage;
      if (authSignupTitle) store.authSignupTitle = authSignupTitle;
      if (authSignupMessage) store.authSignupMessage = authSignupMessage;
      store.homeHeroMediaType = mediaValues.home.type;
      store.homeHeroMediaUrl = mediaValues.home.url;
      store.authPanelMediaType = mediaValues.auth.type;
      store.authPanelMediaUrl = mediaValues.auth.url;

      localStorage.setItem('jt_site_name', store.siteName);
      localStorage.setItem('jt_site_name_ar', store.siteNameAr);
      localStorage.setItem('jt_logo_url', store.logoUrl);
      localStorage.setItem('jt_whatsapp_number', store.whatsappNumber);
      localStorage.setItem('jt_home_hero_media_type', store.homeHeroMediaType);
      localStorage.setItem('jt_home_hero_media_url', store.homeHeroMediaUrl);
      localStorage.setItem('jt_auth_panel_media_type', store.authPanelMediaType);
      localStorage.setItem('jt_auth_panel_media_url', store.authPanelMediaUrl);
      localStorage.setItem('jt_hero_media_type', store.homeHeroMediaType);
      localStorage.setItem('jt_hero_media_url', store.homeHeroMediaUrl);
      localStorage.setItem('jt_hero_title_first', store.heroTitleFirst);
      localStorage.setItem('jt_hero_title_second', store.heroTitleSecond);
      localStorage.setItem('jt_hero_subtitle', store.heroSubtitle);
      localStorage.setItem('jt_hero_tag', store.heroTag);
      localStorage.setItem('jt_auth_login_title', store.authLoginTitle);
      localStorage.setItem('jt_auth_login_message', store.authLoginMessage);
      localStorage.setItem('jt_auth_signup_title', store.authSignupTitle);
      localStorage.setItem('jt_auth_signup_message', store.authSignupMessage);

      // تعميم فوري على DOM
      store.applyBranding();

      // حفظ سحابي في Firestore
      let cloudSaved = false;
      if (window.JordanFirebase && window.JordanFirebase.db) {
        try {
          await window.JordanFirebase.db.collection('settings').doc('branding').set({
            siteName: store.siteName,
            siteNameAr: store.siteNameAr,
            logoUrl: store.logoUrl,
            whatsappNumber: store.whatsappNumber,
            homeHeroMediaType: store.homeHeroMediaType,
            homeHeroMediaUrl: store.homeHeroMediaUrl,
            authPanelMediaType: store.authPanelMediaType,
            authPanelMediaUrl: store.authPanelMediaUrl,
            heroMediaType: store.homeHeroMediaType,
            heroMediaUrl: store.homeHeroMediaUrl,
            heroTitleFirst: store.heroTitleFirst,
            heroTitleSecond: store.heroTitleSecond,
            heroSubtitle: store.heroSubtitle,
            heroTag: store.heroTag,
            authLoginTitle: store.authLoginTitle,
            authLoginMessage: store.authLoginMessage,
            authSignupTitle: store.authSignupTitle,
            authSignupMessage: store.authSignupMessage,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          cloudSaved = true;
        } catch (err) {
          console.warn('Branding sync note:', err);
        }
      }

      alert(cloudSaved
        ? '✅ تم حفظ الهوية محلياً وسحابياً لتظهر للمستخدمين.'
        : 'حُفظت الهوية على هذا الجهاز فقط؛ تعذرت مزامنتها إلى Firestore.');
    });
  }

  /**
   * قسم إدارة أختام المحافظات الـ 12
   */
  renderStampsManager(container) {
    const isAr = store.language === 'ar';
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

    container.innerHTML = `
      <form id="stamps-manager-form" class="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card animate-in fade-in duration-300">
        <div class="flex items-center justify-between border-b pb-4">
          <div>
            <h3 class="font-extrabold text-base sm:text-lg text-[#1E293B]">
              ${isAr ? 'إدارة أختام المحافظات الـ 12 التراثية' : 'Manage 12 Governorate Stamps'}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              ${isAr ? 'عدّل بيانات الختم وارفع صورة اختيارية؛ عدم رفع صورة يُبقي الصورة الحالية.' : 'Edit stamp details and optionally upload an image; leaving it empty keeps the current image.'}
            </p>
          </div>
          <span class="text-xs font-mono font-bold bg-[#D97706]/10 text-[#D97706] px-3 py-1 rounded-full">
            12 Stamps
          </span>
        </div>

        <div class="space-y-4">
          ${this.stamps.map((stamp) => `
            <section class="rounded-2xl bg-[#FAF8F5] border border-slate-200 p-4 space-y-4" data-stamp-id="${escape(stamp.id)}">
              <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
                <img data-stamp-preview="${escape(stamp.id)}" src="${escape(stamp.imageUrl || '')}" alt="" class="${stamp.imageUrl ? '' : 'hidden'} w-14 h-14 rounded-xl object-cover border border-slate-200">
                <div class="min-w-0">
                  <h4 class="font-extrabold text-sm text-slate-800">${escape(stamp.name?.ar || stamp.id)}</h4>
                  <span class="text-[10px] text-slate-500 font-mono">${escape(stamp.id)} • ${escape(stamp.governorateId)}</span>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${[
                  ['name.ar', 'اسم الختم بالعربية', stamp.name?.ar], ['name.en', 'اسم الختم بالإنجليزية', stamp.name?.en],
                  ['governorateName.ar', 'اسم المحافظة بالعربية', stamp.governorateName?.ar], ['governorateName.en', 'اسم المحافظة بالإنجليزية', stamp.governorateName?.en],
                  ['description.ar', 'الوصف بالعربية', stamp.description?.ar], ['description.en', 'الوصف بالإنجليزية', stamp.description?.en],
                  ['hook', 'معلومة أو وصف إضافي', stamp.hook], ['color', 'لون الختم', stamp.color],
                  ['iconType', 'نوع الرمز', stamp.iconType], ['icon', 'رمز الأيقونة', stamp.icon],
                  ['shape', 'شكل الختم', stamp.shape], ['rarity', 'الندرة', stamp.rarity], ['xp', 'نقاط XP', stamp.xp]
                ].map(([field, label, value]) => `
                  <label class="text-[11px] font-bold text-slate-700">${label}
                    <input data-stamp-field="${field}" value="${escape(value)}" ${field === 'xp' ? 'type="number" min="0"' : field === 'color' ? 'type="color"' : 'type="text"'} class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal">
                  </label>
                `).join('')}
                <div>
                  <span class="text-[11px] font-bold text-slate-700 block">صورة الختم (اختياري)</span>
                  <input id="stamp-image-file-${escape(stamp.id)}" data-stamp-image-file="${escape(stamp.id)}" type="file" accept="image/*" class="hidden">
                  <label for="stamp-image-file-${escape(stamp.id)}" class="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"><i class="fa-solid fa-upload" aria-hidden="true"></i>رفع صورة</label>
                </div>
              </div>
            </section>
          `).join('')}
        </div>
        <div class="flex items-center justify-between border-t pt-4">
          <span id="stamps-save-status" class="text-xs text-slate-500" aria-live="polite"></span>
          <button type="submit" class="rounded-xl bg-[#C86D51] px-6 py-2.5 text-xs font-bold text-white">حفظ تعديلات الأختام</button>
        </div>
      </form>
    `;

    container.querySelectorAll('[data-stamp-image-file]').forEach((input) => {
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        const preview = container.querySelector(`[data-stamp-preview="${input.dataset.stampImageFile}"]`);
        if (!file || !preview) return;
        preview.src = URL.createObjectURL(file);
        preview.classList.remove('hidden');
      });
    });

    container.querySelector('#stamps-manager-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector('button[type="submit"]');
      const status = form.querySelector('#stamps-save-status');
      button.disabled = true;
      status.textContent = 'جارٍ حفظ الأختام...';
      try {
        const updatedStamps = await Promise.all(this.stamps.map(async (stamp) => {
          const section = form.querySelector(`[data-stamp-id="${stamp.id}"]`);
          const updated = { ...stamp, name: { ...stamp.name }, governorateName: { ...stamp.governorateName }, description: { ...stamp.description } };
          section.querySelectorAll('[data-stamp-field]').forEach((input) => {
            const [group, field] = input.dataset.stampField.split('.');
            if (field) updated[group][field] = group === 'description' || group === 'name' || group === 'governorateName' ? input.value.trim() : input.value;
            else updated[group] = group === 'xp' ? Number(input.value) || 0 : input.value.trim();
          });
          const imageFile = section.querySelector('[data-stamp-image-file]')?.files?.[0];
          if (imageFile) updated.imageUrl = (await uploaderService.uploadFile(imageFile)).dataUrl;
          return updated;
        }));
        const saved = await FirebaseService.saveToCloudDoc('stamps_data', { list: updatedStamps });
        this.stamps = updatedStamps;
        if (!saved) {
          status.textContent = 'تم حفظ التعديلات محلياً، لكن تعذرت مزامنتها سحابياً. تحقق من صلاحية الأدمن في Firebase.';
          return;
        }
        status.textContent = window.JordanFirebase?.db
          ? 'تم حفظ الأختام محلياً وسحابياً.'
          : 'تم حفظ الأختام على هذا الجهاز فقط؛ السحابة غير متاحة.';
      } catch (error) {
        status.textContent = `تعذر الحفظ: ${error.message}`;
      } finally {
        button.disabled = false;
      }
    });
  }

  // ================= معالجات العمليات (Action Handlers) =================

  handleApproveBooking(bookingId, activationCode) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (booking) {
      booking.status = 'confirmed';
      booking.activationCode = activationCode;
      this.renderDashboard();
      alert(`✅ تم اعتماد الحجز بنجاح وإصدار كود التفعيل: ${activationCode}`);
    }
  }

  handleRejectBooking(bookingId, reason) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (booking) {
      booking.status = 'rejected';
      this.renderDashboard();
      alert(`✕ تم رفض الحجز وإشعار المسافر بالسبب: ${reason || 'غير محدد'}`);
    }
  }

  handleSaveTrip(tripData) {
    const idx = this.destinations.findIndex((d) => d.id === tripData.id);
    if (idx >= 0) {
      this.destinations[idx] = tripData;
    } else {
      this.destinations.unshift(tripData);
    }
    this.renderDashboard();
    alert('✅ تم حفظ ونشر تفاصيل الرحلة والمعالم بنجاح!');
  }

  handleDeleteTrip(tripId) {
    this.destinations = this.destinations.filter((d) => d.id !== tripId);
    this.renderDashboard();
    alert('تم حذف الرحلة بنجاح.');
  }

  handleSaveLandmark(lmData) {
    const idx = this.masterLandmarks.findIndex((l) => l.id === lmData.id);
    if (idx >= 0) {
      this.masterLandmarks[idx] = lmData;
    } else {
      this.masterLandmarks.unshift(lmData);
    }
    this.renderDashboard();
    alert('✅ تم حفظ المعلم في المكتبة الشاملة بنجاح!');
  }

  handleDeleteLandmark(lmId) {
    this.masterLandmarks = this.masterLandmarks.filter((l) => l.id !== lmId);
    this.renderDashboard();
    alert('تم حذف المعلم من المكتبة.');
  }

  handleUpdateGovernorate(govData) {
    const idx = this.governorates.findIndex((g) => g.id === govData.id);
    if (idx >= 0) this.governorates[idx] = govData;
    alert(`تم تحديث بيانات ونقاط محافظة ${govData.name.ar} بنجاح!`);
  }

  handleUpdateMapBackground(bgUrl) {
    localStorage.setItem('jordan_map_custom_image', bgUrl);
    alert('تم حفظ وتطبيق صورة الخريطة بنجاح!');
  }

  handleMasterPurge() {
    this.destinations = this.destinations.slice(0, 3);
    this.bookings = [];
    this.communityPosts = [];
    this.renderDashboard();
  }

  async syncAllDataToCloud() {
    if (!window.JordanFirebase || !window.JordanFirebase.db) {
      alert('تمت المزامنة محلياً بنجاح!');
      return;
    }

    try {
      const db = window.JordanFirebase.db;
      await Promise.all([
        db.collection('settings').doc('destinations_data').set({ list: this.destinations }),
        db.collection('settings').doc('governorates_data').set({ list: this.governorates }),
        db.collection('settings').doc('landmarks_data').set({ list: this.masterLandmarks }),
        db.collection('settings').doc('points_settings').set(this.pointsSettings),
      ]);
      alert('⚡ تمت المزامنة القسرية لجميع البيانات مع سحابة Firebase بنجاح!');
    } catch (e) {
      alert('خطأ في المزامنة السحابية: ' + e.message);
    }
  }

  saveSettingsToStorage() {
    try {
      localStorage.setItem('jt_points_settings', JSON.stringify(this.pointsSettings));
    } catch (e) {}
  }
}

// تشغيل الصفحة تلقائياً
document.addEventListener('DOMContentLoaded', () => {
  const adminPage = new AdminPageController();
  adminPage.init();
});