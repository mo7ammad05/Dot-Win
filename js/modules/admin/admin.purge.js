
import { FirebaseService } from '../../services/firebase.service.js';
import { appStore } from '../../state/store.js';
import { Storage, STORAGE_KEYS } from '../../state/storage.js';
import { defaultExplorerStampIds } from '../../components/jordan-verification-badge.js';
import {
  initialLeaderboard as INITIAL_LEADERBOARD,
  initialCommunityPosts as INITIAL_COMMUNITY_POSTS,
  initialBookings as INITIAL_BOOKINGS
} from '../../data/mock.data.js';

export const AdminDataPurge = {
  /**
   * بناء الواجهة الكاملة لتبويب تنظيف البيانات الوهمية
   * @param {Object} state 
   * @returns {string} HTML
   */
  renderFullView(state = appStore.getState()) {
    const leaderboardCount = state.leaderboard ? state.leaderboard.length : 1;
    const postsCount = state.posts ? state.posts.length : 0;
    const bookingsCount = state.bookings ? state.bookings.length : 0;
    const isPurged = Storage.get('jordan_mock_data_purged', false);

    return `
      <div class="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
        
        <!-- الترويسة وبطاقات الحالة السريعة -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            <span>🧹</span>
            <span>إدارة واقعية البيانات وحذف النماذج التجريبية</span>
          </div>
          <h3 class="font-extrabold text-xl text-[#1E293B]">
            حذف كافة المستخدمين والمنشورات والحجوزات الوهمية (وضع واقعي 100%)
          </h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            تتيح لك هذه اللوحة تفريغ المنصة من أي مستخدمين افتراضيين أو منشورات تجريبية، ليقتصر محتوى الموقع ولوحة الشرف والمنتدى على المستخدمين والمنشورات والحجوزات الحقيقية فقط لتقديم نموذج إنتاجي واقعي ومهيب أمام لجنة التحكيم.
          </p>

          <!-- شريط إحصائيات البيانات الحالية -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div class="bg-[#FAF8F5] p-4 rounded-2xl border border-slate-200 text-center">
              <span class="text-[11px] text-slate-500 font-bold block">المستخدمون في لوحة الشرف</span>
              <span class="text-2xl font-black text-[#1E293B] mt-1 block font-mono">
                ${leaderboardCount}
              </span>
              <span class="text-[10px] font-bold mt-1 block ${leaderboardCount <= 1 ? 'text-emerald-600' : 'text-amber-600'}">
                ${leaderboardCount <= 1 ? '✅ مستخدم حقيقي فقط' : 'يحتوي على حسابات تجريبية'}
              </span>
            </div>

            <div class="bg-[#FAF8F5] p-4 rounded-2xl border border-slate-200 text-center">
              <span class="text-[11px] text-slate-500 font-bold block">منشورات ملتقى السياح</span>
              <span class="text-2xl font-black text-[#1E293B] mt-1 block font-mono">
                ${postsCount}
              </span>
              <span class="text-[10px] text-slate-500 font-bold mt-1 block">منشور مسجل</span>
            </div>

            <div class="bg-[#FAF8F5] p-4 rounded-2xl border border-slate-200 text-center">
              <span class="text-[11px] text-slate-500 font-bold block">الحجوزات النشطة</span>
              <span class="text-2xl font-black text-[#1E293B] mt-1 block font-mono">
                ${bookingsCount}
              </span>
              <span class="text-[10px] text-slate-500 font-bold mt-1 block">حجز مسجل في النظام</span>
            </div>
          </div>
        </div>

        <!-- بطاقات الإجراءات الفرعية الثلاث -->
        <div class="space-y-4">
          
          <!-- إجراء 1: حذف المستخدمين الوهميين من المتصدرين -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <h4 class="font-extrabold text-sm text-[#1E293B] flex items-center gap-2">
                <span>👥</span>
                <span>حذف المستخدمين الوهميين من لوحة الشرف</span>
              </h4>
              <p class="text-xs text-slate-500">
                يحذف جميع الحسابات التجريبية الافتراضية (طارق الهاشمي، سارة المجالي، عمر القاسم...) ويُبقي فقط على حسابك الفعلي (محمد الشوابكة).
              </p>
            </div>
            <button
              type="button"
              id="purge-leaderboard-btn"
              class="w-full sm:w-auto shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              حذف المستخدمين الوهميين
            </button>
          </div>

          <!-- إجراء 2: تفريغ منشورات المنتدى التجريبية -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <h4 class="font-extrabold text-sm text-[#1E293B] flex items-center gap-2">
                <span>💬</span>
                <span>حذف المنشورات والتعليقات الوهمية</span>
              </h4>
              <p class="text-xs text-slate-500">
                يحذف المنشورات التجريبية الافتراضية في ملتقى السياح، ويُبقي فقط على المشاركات الحقيقية التي قمت بنشرها وتوثيقها.
              </p>
            </div>
            <button
              type="button"
              id="purge-posts-btn"
              class="w-full sm:w-auto shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              حذف المنشورات الوهمية
            </button>
          </div>

          <!-- إجراء 3: تنظيف الحجوزات التجريبية -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <h4 class="font-extrabold text-sm text-[#1E293B] flex items-center gap-2">
                <span>🎟️</span>
                <span>حذف الحجوزات التجريبية السابقة</span>
              </h4>
              <p class="text-xs text-slate-500">
                ينظف سجل الحجوزات من الطلبات التجريبية السابقة، ويترك فقط الحجوزات المعتمدة الجديدة والحقيقية.
              </p>
            </div>
            <button
              type="button"
              id="purge-bookings-btn"
              class="w-full sm:w-auto shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              حذف الحجوزات التجريبية
            </button>
          </div>

          <!-- البانر النهائي: تنظيف شامل بنقرة واحدة أو استعادة التجريبية -->
          <div class="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-700 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
            <div class="space-y-1 text-center sm:text-start">
              <h4 class="font-extrabold text-sm text-amber-300">
                ⚡ تنظيف شامل لجميع البيانات الوهمية بنقرة واحدة (جعله موقعاً واقعياً 100%)
              </h4>
              <p class="text-xs text-slate-300">
                يقوم بحذف كافة المستخدمين، المنشورات، والحجوزات الوهمية دفعة واحدة وتحديث السحابة فوراً.
              </p>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <button
                type="button"
                id="restore-demo-data-btn"
                class="bg-white/10 hover:bg-white/20 text-slate-300 border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                استعادة التجريبية 🔄
              </button>
              <button
                type="button"
                id="master-purge-all-btn"
                class="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                🧹 تنظيف وحذف شامل الآن
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  /**
   * ربط كافة مستمعي الأحداث التفاعلية لتبويب التطهير
   * @param {HTMLElement} container 
   * @param {Function} onRefreshNeeded 
   */
  bindEvents(container, onRefreshNeeded) {
    if (!container) return;

    // 1. حذف متصدري لوحة الشرف الوهميين
    container.querySelector('#purge-leaderboard-btn')?.addEventListener('click', async () => {
      if (confirm('هل أنت متأكد من حذف الحسابات التجريبية من لوحة الشرف والإبقاء فقط على حسابك الفعلي؟')) {
        const state = appStore.getState();
        const realUserOnly = [
          state.leaderboard.find(u => u.isCurrentUser || u.username === 'sh3sher') || {
            rank: 1,
            name: state.user.name,
            username: state.user.username,
            avatar: state.user.avatar,
            level: 'Gold',
            levelAr: 'مستكشف موثق 👑',
            completedTrips: 6,
            totalPoints: state.points || 1450,
            isCurrentUser: true,
            isVerified: true,
            stamps: [...defaultExplorerStampIds]
          }
        ];

        Storage.set(STORAGE_KEYS.LEADERBOARD, realUserOnly);
        appStore.setState({ leaderboard: realUserOnly }, 'LEADERBOARD_PURGED');
        await FirebaseService.saveToCloud('settings', 'leaderboard_data', { list: realUserOnly });

        alert('✅ تم تنظيف لوحة الشرف وأصبح حسابك الفعلي في الصدارة!');
        if (onRefreshNeeded) onRefreshNeeded();
      }
    });

    // 2. تفريغ المنشورات التجريبية
    container.querySelector('#purge-posts-btn')?.addEventListener('click', async () => {
      if (confirm('هل تريد حذف المنشورات التجريبية من منتدى السياح؟')) {
        const state = appStore.getState();
        const realPosts = state.posts.filter(p => p.isCurrentUser || p.authorName.includes('محمد الشوابكة'));

        Storage.set(STORAGE_KEYS.COMMUNITY_POSTS, realPosts);
        appStore.setState({ posts: realPosts }, 'POSTS_PURGED');
        await FirebaseService.saveToCloud('settings', 'community_posts_data', { list: realPosts });

        alert('✅ تم تفريغ المنشورات التجريبية من المنتدى بنجاح!');
        if (onRefreshNeeded) onRefreshNeeded();
      }
    });

    // 3. تنظيف الحجوزات التجريبية
    container.querySelector('#purge-bookings-btn')?.addEventListener('click', async () => {
      if (confirm('هل تريد حذف طلبات الحجز السابقة والإبقاء فقط على الحجوزات الجديدة؟')) {
        const state = appStore.getState();
        const realBookings = state.bookings.filter(b => !b.id.startsWith('JO-BK-789'));

        Storage.set(STORAGE_KEYS.BOOKINGS, realBookings);
        appStore.setState({ bookings: realBookings }, 'BOOKINGS_PURGED');
        await FirebaseService.saveToCloud('settings', 'bookings_data', { list: realBookings });

        alert('✅ تم تنظيف سجل الحجوزات بنجاح!');
        if (onRefreshNeeded) onRefreshNeeded();
      }
    });

    // 4. التنظيف الشامل بنقرة واحدة
    container.querySelector('#master-purge-all-btn')?.addEventListener('click', async () => {
      if (confirm('⚠️ هل أنت متأكد من تطبيق التنظيف الشامل لكافة المستخدمين والمنشورات والحجوزات الوهمية لجعل الموقع واقعياً 100% أمام لجنة التحكيم؟')) {
        const state = appStore.getState();

        // 1. تصفية المتصدرين
        const realUserOnly = [
          state.leaderboard.find(u => u.isCurrentUser || u.username === 'sh3sher') || {
            rank: 1,
            name: state.user.name,
            username: state.user.username,
            avatar: state.user.avatar,
            level: 'Gold',
            levelAr: 'مستكشف موثق 👑',
            completedTrips: 6,
            totalPoints: state.points || 1450,
            isCurrentUser: true,
            isVerified: true,
            stamps: [...defaultExplorerStampIds]
          }
        ];
        Storage.set(STORAGE_KEYS.LEADERBOARD, realUserOnly);

        // 2. تصفية المنشورات
        const realPosts = state.posts.filter(p => p.isCurrentUser || p.authorName.includes('محمد الشوابكة'));
        Storage.set(STORAGE_KEYS.COMMUNITY_POSTS, realPosts);

        // 3. تصفية الحجوزات
        const realBookings = state.bookings.filter(b => !b.id.startsWith('JO-BK-789'));
        Storage.set(STORAGE_KEYS.BOOKINGS, realBookings);

        Storage.set('jordan_mock_data_purged', true);

        appStore.setState({
          leaderboard: realUserOnly,
          posts: realPosts,
          bookings: realBookings
        }, 'ALL_MOCK_PURGED');

        // تحديث السحابة بالكامل
        await Promise.all([
          FirebaseService.saveToCloud('settings', 'leaderboard_data', { list: realUserOnly }),
          FirebaseService.saveToCloud('settings', 'community_posts_data', { list: realPosts }),
          FirebaseService.saveToCloud('settings', 'bookings_data', { list: realBookings })
        ]);

        alert('🎉 مبروك! تم تنظيف المنصة بالكامل بنجاح. الموقع الآن واقعي 100% بحسابك الحقيقي وبدون أي أثر للبيانات الوهمية!');
        if (onRefreshNeeded) onRefreshNeeded();
      }
    });

    // 5. استعادة البيانات التجريبية
    container.querySelector('#restore-demo-data-btn')?.addEventListener('click', async () => {
      if (confirm('هل تود استعادة البيانات والنماذج التجريبية الافتراضية؟')) {
        Storage.set(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
        Storage.set(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
        Storage.set(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
        Storage.remove('jordan_mock_data_purged');

        appStore.setState({
          leaderboard: INITIAL_LEADERBOARD,
          posts: INITIAL_COMMUNITY_POSTS,
          bookings: INITIAL_BOOKINGS
        }, 'DEMO_RESTORED');

        await Promise.all([
          FirebaseService.saveToCloud('settings', 'leaderboard_data', { list: INITIAL_LEADERBOARD }),
          FirebaseService.saveToCloud('settings', 'community_posts_data', { list: INITIAL_COMMUNITY_POSTS }),
          FirebaseService.saveToCloud('settings', 'bookings_data', { list: INITIAL_BOOKINGS })
        ]);

        alert('تمت استعادة البيانات التجريبية الافتراضية بنجاح.');
        if (onRefreshNeeded) onRefreshNeeded();
      }
    });
  }
};