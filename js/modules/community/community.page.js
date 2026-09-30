/**
 * 🇯🇴 Jordan Tour - Community Forum Page Controller
 * مسار الملف: js/modules/community/community.page.js
 * مشغل صفحة منتدى السياح وتجارب السفر، البحث، المتابعة، والتعليقات الحية
 */

import { store } from '../../state/store.js';
import { CommentTreeManager } from './comment-tree.js';
import { PostComposer } from './post-composer.js';
import { destinationsService } from '../../services/destinations.service.js';
import { firebaseService } from '../../services/firebase.service.js';
import { socialService } from '../../services/social.service.js';
import { defaultExplorerStampIds, hasCollectedAllOfficialStamps, renderJordanVerificationBadge } from '../../components/jordan-verification-badge.js';

export class CommunityPage {
  constructor() {
    this.posts = [];
    this.destinations = [];
    this.searchQuery = '';
    this.activeFilterTab = 'all'; // 'all' | 'popular' | 'pending'
    this.selectedLocation = 'all';
    this.followingMap = {}; // authorName -> boolean
    this.userMonthlyPostsCount = 2;

    // الموديولات المساعدة
    this.commentTree = null;
    this.postComposer = null;

    // العناصر الحاوية
    this.postsFeedMount = document.getElementById('community-feed-mount');
    this.searchInput = document.getElementById('forum-search-input');
    this.locationFilterSelect = document.getElementById('forum-location-filter');
    this.filterTabsContainer = document.getElementById('forum-filter-tabs');
    this.newPostBtn = document.getElementById('open-composer-btn');
    this.commentsModalMount = document.getElementById('comments-modal-mount');
    this.reportModalMount = document.getElementById('report-modal-mount');
  }

  /**
   * تهيئة الصفحة وجلب البيانات الأولية
   */
  async init() {
    await this.loadInitialData();
    this.initCommentTree();
    this.initPostComposer();
    this.renderFilterTabs();
    this.populateLocationFilter();
    this.renderPostsFeed();
    this.setupEventListeners();
  }

  /**
   * جلب المنشورات والوجهات (من الكاش المحلي أو Firestore مع بيانات تجريبية واقعية)
   */
  async loadInitialData() {
    // 1. الوجهات لاختيارها في الفلتر والمحرر
    this.destinations = await destinationsService.getAll();
    const pointsSettings = await firebaseService.getPointsSettings();
    this.pointsSettings = pointsSettings || { postPoints: 25, maxMonthlyPostsPerUser: 5, isMonthlyPostLimitActive: true };

    // 2. محاولة جلب المنشورات من Firestore إذا توفرت
    try {
      if (window.JordanFirebase && window.JordanFirebase.db) {
        const snap = await window.JordanFirebase.db.collection('community_posts').get();
        if (!snap.empty) {
          this.posts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          await this.hydratePostAuthors();
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback to local community posts:', e.message);
    }

    // بيانات أولية واقعية للمنتدى
    this.posts = [
      {
        id: 'post-1',
        authorName: 'سارة المجالي • Sarah M.',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        authorLevel: 'مستكشف فضي (Silver)',
        isVerified: true,
        authorStamps: [...defaultExplorerStampIds],
        createdAt: 'منذ ساعتين',
        destinationId: 'petra-rose-city',
        destinationName: { ar: 'البتراء الوردية', en: 'Petra' },
        title: {
          ar: 'صعود الدير وقت الغروب.. سحر البتراء الذي لا يوصف!',
          en: 'Sunset Hike to Ad-Deir Monastery in Petra!'
        },
        content: {
          ar: 'بدأنا المسار من مدخل مركز الزوار الساعة 7 صباحاً، تجربة السيق وقت الصباح كانت خيالية وهادئة جداً. استراحة الشاي بالميرمية عند البدو فوق مطل الدير لا تفوّت أبداً! أنصح بارتداء حذاء مشي مريح.',
          en: 'Started our trek at 7 AM. The morning light on the Siq and Treasury was peaceful. Fresh sage tea at the top viewpoint is a must-do!'
        },
        imageUrl: 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=1000&auto=format&fit=crop&q=80',
        likesCount: 142,
        isLiked: false,
        status: 'approved',
        tags: ['#البتراء', '#الأردن', '#الدير'],
        comments: [
          {
            id: 'c1-1',
            authorName: 'طارق حداد',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            isVerified: true,
            authorStamps: [...defaultExplorerStampIds],
            createdAt: 'منذ ساعة',
            text: 'تصوير رائع جداً يا سارة! كم استغرق صعود الـ 800 درجة نحو قمة الدير؟',
            likesCount: 12,
            isLiked: false,
            replies: [
              {
                id: 'r1-1',
                authorName: 'سارة المجالي',
                authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                isVerified: true,
                authorStamps: [...defaultExplorerStampIds],
                createdAt: 'منذ 40 دقيقة',
                text: 'أهلاً طارق! استغرق منا حوالي 45 دقيقة مشي مريح مع التوقف لالتقاط الصور.',
                likesCount: 8,
                isLiked: false
              }
            ]
          }
        ]
      },
      {
        id: 'post-2',
        authorName: 'عمر القاسم • Omar Q.',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        authorLevel: 'مستكشف ذهبي (Gold)',
        isVerified: true,
        authorStamps: [...defaultExplorerStampIds],
        createdAt: 'منذ 5 ساعات',
        destinationId: 'wadi-rum-stargazing',
        destinationName: { ar: 'وادي رم وقبب المريخ', en: 'Wadi Rum' },
        title: {
          ar: 'تخييم تحت ملايين النجوم في وادي رم وعشاء الزرب البدوي',
          en: 'Stargazing Under Millions of Stars & Authentic Zarb'
        },
        content: {
          ar: 'صمت الصحراء ورؤية درب التبانة بالعين المجردة تجربة تعيدك للحياة. عشاء الزرب البدوي المدفون تحت الرمال بنكهة الحطب لا يُعلى عليه. وادي رم كوكب آخر على الأرض 🇯🇴✨',
          en: 'The absolute tranquility and seeing the Milky Way galaxy with the naked eye. The slow-roasted Bedouin Zarb meal was out of this world!'
        },
        imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000&auto=format&fit=crop&q=80',
        likesCount: 98,
        isLiked: true,
        status: 'approved',
        tags: ['#وادي_رم', '#رصد_النجوم', '#الزرب_البدوي'],
        comments: []
      }
    ];
  }

  async hydratePostAuthors() {
    const profileCache = new Map();
    const getProfile = (uid) => {
      if (!uid) return Promise.resolve(null);
      if (!profileCache.has(uid)) {
        profileCache.set(uid, socialService.getProfile(uid).catch(() => null));
      }
      return profileCache.get(uid);
    };
    const hydratePerson = async (person) => {
      const uid = person?.authorId || person?.userId || person?.uid;
      const profile = await getProfile(uid);
      if (!profile) return;
      person.authorAvatar = profile.avatar || person.authorAvatar;
      person.authorName = profile.displayName || person.authorName;
    };

    await Promise.all(this.posts.map(async (post) => {
      await hydratePerson(post);
      const comments = post.comments || [];
      await Promise.all(comments.map(async (comment) => {
        await hydratePerson(comment);
        await Promise.all((comment.replies || []).map(hydratePerson));
      }));
    }));
  }

  /**
   * تهيئة موديول شجرة التعليقات
   */
  initCommentTree() {
    this.commentTree = new CommentTreeManager({
      onAddComment: (postId, text) => this.handleAddComment(postId, text),
      onAddReply: (postId, commentId, text) => this.handleAddReply(postId, commentId, text),
      onLikeComment: (postId, commentId) => this.handleLikeComment(postId, commentId),
      onLikeReply: (postId, commentId, replyId) => this.handleLikeReply(postId, commentId, replyId),
      onReportComment: (postId, commentId) => this.openReportModal('comment', commentId, postId),
    });
  }

  /**
   * تهيئة موديول محرر المنشورات
   */
  initPostComposer() {
    this.postComposer = new PostComposer({
      destinations: this.destinations,
      pointsSettings: this.pointsSettings,
      userMonthlyPostsCount: this.userMonthlyPostsCount,
      onSubmit: (newPostData) => this.handleCreateNewPost(newPostData),
    });
  }

  /**
   * تعبئة قائمة الوجهات المنسدلة للفلترة
   */
  populateLocationFilter() {
    if (!this.locationFilterSelect) return;
    const isAr = store.language === 'ar';

    this.locationFilterSelect.innerHTML = `
      <option value="all">${isAr ? 'كل الوجهات والمحافظات' : 'All Destinations'}</option>
      ${this.destinations
        .map(
          (d) => `
        <option value="${d.id}">
          ${isAr ? d.title.ar : d.title.en}
        </option>
      `
        )
        .join('')}
    `;

    this.locationFilterSelect.addEventListener('change', (e) => {
      this.selectedLocation = e.target.value;
      this.renderPostsFeed();
    });
  }

  /**
   * رسم أزرار تبويب الفلاتر (الكل / الأكثر تفاعلاً / قيد المراجعة)
   */
  renderFilterTabs() {
    if (!this.filterTabsContainer) return;
    const isAr = store.language === 'ar';

    const tabs = [
      { id: 'all', label: isAr ? 'جميع المنشورات' : 'All Posts' },
      { id: 'popular', label: isAr ? 'الأكثر تفاعلاً 🔥' : 'Trending 🔥' },
      { id: 'pending', label: isAr ? 'منشورات قيد المراجعة ⏳' : 'Pending Approval ⏳' },
    ];

    this.filterTabsContainer.innerHTML = tabs
      .map(
        (t) => `
        <button
          type="button"
          data-tab="${t.id}"
          class="forum-tab-btn px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            this.activeFilterTab === t.id
              ? 'bg-[#1E293B] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
          }"
        >
          ${t.label}
        </button>
      `
      )
      .join('');

    this.filterTabsContainer.querySelectorAll('.forum-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeFilterTab = btn.dataset.tab;
        this.renderFilterTabs();
        this.renderPostsFeed();
      });
    });
  }

  /**
   * تصفية ورسم دفق المنشورات الكامل بنمط فيسبوك
   */
  renderPostsFeed() {
    if (!this.postsFeedMount) return;

    const isAr = store.language === 'ar';

    // تطبيق معايير التصفية
    const filtered = this.posts.filter((post) => {
      // 1. فحص البحث بالنص أو الهاشتاغ
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const matchAuthor = post.authorName?.toLowerCase().includes(q);
        const matchTitle = (post.title?.ar || '').toLowerCase().includes(q) || (post.title?.en || '').toLowerCase().includes(q);
        const matchContent = (post.content?.ar || '').toLowerCase().includes(q) || (post.content?.en || '').toLowerCase().includes(q);
        const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));

        if (!matchAuthor && !matchTitle && !matchContent && !matchTags) return false;
      }

      // 2. فحص الوجهة المختارة
      if (this.selectedLocation !== 'all' && post.destinationId !== this.selectedLocation) {
        return false;
      }

      // 3. فحص تبويب الحالة
      if (this.activeFilterTab === 'pending') {
        return post.status === 'pending_approval';
      }
      if (this.activeFilterTab === 'popular') {
        return (post.likesCount || 0) >= 50;
      }

      // الوضع الافتراضي: إظهار المعتمد، أو المنشورات قيد المراجعة الخاصة بالمستخدم
      return post.status !== 'rejected';
    });

    if (filtered.length === 0) {
      this.postsFeedMount.innerHTML = `
        <div class="text-center py-16 bg-white rounded-3xl border border-[#E2E8F0] p-8 space-y-2">
          <span class="text-4xl block">🧭</span>
          <h4 class="text-base font-bold text-slate-700">
            ${isAr ? 'لم يتم العثور على منشورات تطابق معايير البحث' : 'No posts matching your criteria'}
          </h4>
          <p class="text-xs text-slate-400">
            ${isAr ? 'جرّب البحث بكلمة مفتاحية أخرى أو تغيير تصفية الوجهة' : 'Try searching with different keywords'}
          </p>
        </div>
      `;
      return;
    }

    this.postsFeedMount.innerHTML = filtered
      .map((post) => this.renderPostCardHTML(post, isAr))
      .join('');

    this.bindPostCardEvents();
  }

  /**
   * توليد كود HTML لبطاقة المنشور الكاملة
   */
  renderPostCardHTML(post, isAr) {
    const isFollowing = !!this.followingMap[post.authorName];
    const isPending = post.status === 'pending_approval';
    const title = isAr ? (post.title?.ar || post.title) : (post.title?.en || post.title);
    const content = isAr ? (post.content?.ar || post.content) : (post.content?.en || post.content);
    const destName = isAr ? (post.destinationName?.ar || post.destinationName) : (post.destinationName?.en || post.destinationName);
    const commentsCount = post.comments?.length || 0;

    return `
      <div class="bg-white rounded-3xl overflow-hidden border shadow-soft-card transition-all hover:shadow-lg ${
        isPending ? 'border-amber-300 bg-amber-50/20' : 'border-[#E2E8F0]'
      }" data-post-id="${post.id}">
        
        <!-- شريط التنبيه إن كان قيد المراجعة -->
        ${
          isPending
            ? `
          <div class="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs font-bold text-amber-800">
            <span class="flex items-center gap-1.5">
              <span class="animate-spin">⏳</span>
              <span>${isAr ? 'منشورك قيد مراجعة الإدارة وسينشر فور اعتماده' : 'Pending Admin Approval'}</span>
            </span>
            <span class="text-[10px] bg-amber-200 px-2 py-0.5 rounded font-mono font-bold">${isAr ? 'قيد التدقيق' : 'Review'}</span>
          </div>
        `
            : ''
        }

        <!-- شريط صاحب المنشور (Author Bar) -->
        <div class="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <img
                src="${post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}"
                alt="${post.authorName}"
                class="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              ${
                hasCollectedAllOfficialStamps(post.authorStamps)
                  ? renderJordanVerificationBadge('absolute -bottom-1 -end-1 h-5 w-5 drop-shadow-sm')
                  : ''
              }
            </div>

            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-extrabold text-sm text-[#1E293B]">
                  ${post.authorName}
                </span>
                ${hasCollectedAllOfficialStamps(post.authorStamps) ? renderJordanVerificationBadge('h-4 w-4') : ''}
              </div>
              <span class="text-[11px] text-slate-500 font-semibold block">
                ${post.authorLevel || 'مستكشف'} • ${post.createdAt || (isAr ? 'الآن' : 'Just now')}
              </span>
            </div>
          </div>

          <!-- زر المتابعة والإبلاغ -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              data-action="toggle-follow"
              data-author="${post.authorName}"
              class="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isFollowing
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-[#C86D51] text-white hover:bg-[#B45A3E] shadow-xs'
              }"
            >
              <span>${isFollowing ? (isAr ? 'تتابعه ✓' : 'Following ✓') : (isAr ? '+ متابعة' : '+ Follow')}</span>
            </button>

            <button
              type="button"
              data-action="report-post"
              data-post-id="${post.id}"
              class="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="${isAr ? 'إبلاغ عن المنشور' : 'Report Post'}"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.924a5.5 5.5 0 014.288.243l.89.445a5.5 5.5 0 004.288.243L19 14.5V4.5l-3.77.924a5.5 5.5 0 01-4.288-.243l-.89-.445a5.5 5.5 0 00-4.288-.243L3 5.5v9.5z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- وسائط المنشور (صورة أو فيديو) -->
        ${
          post.imageUrl
            ? `
          <div class="relative aspect-video w-full bg-slate-900 overflow-hidden">
            <img src="${post.imageUrl}" alt="" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            <div class="absolute top-3 start-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span>📍</span>
              <span>${destName}</span>
            </div>
          </div>
        `
            : ''
        }

        <!-- جسم المنشور والهاشتاغات -->
        <div class="p-5 space-y-3">
          <h3 class="font-extrabold text-base sm:text-lg text-[#1E293B] leading-snug">
            ${title}
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            ${content}
          </p>

          ${
            post.tags && post.tags.length > 0
              ? `
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${post.tags
                .map(
                  (tag) => `
                <span class="text-[11px] font-bold text-[#C86D51] bg-[#C86D51]/5 px-2.5 py-0.5 rounded-md cursor-pointer hover:bg-[#C86D51]/15 transition-colors">
                  ${tag}
                </span>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <!-- شريط التفاعل والأزرار السريعة -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div class="flex items-center gap-4">
              <button
                type="button"
                data-action="like-post"
                data-post-id="${post.id}"
                class="flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                  post.isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                }"
              >
                <svg class="w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span>${post.likesCount || 0}</span>
              </button>

              <button
                type="button"
                data-action="open-comments-modal"
                data-post-id="${post.id}"
                class="flex items-center gap-1.5 font-bold hover:text-[#C86D51] transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <span>${commentsCount} ${isAr ? 'تعليقات' : 'Comments'}</span>
              </button>
            </div>

            <!-- رابط حجز الوجهة المذكورة -->
            <a
              href="attraction.html?id=${post.destinationId}"
              class="text-[#C86D51] font-bold text-xs flex items-center gap-1 hover:underline"
            >
              <span>${isAr ? 'احجز هذه الوجهة' : 'Book Destination'}</span>
              <span>${isAr ? '←' : '→'}</span>
            </a>
          </div>

          <!-- معاينة سريعة لآخر تعليقين بنمط فيسبوك -->
          <div class="inline-comments-container space-y-2 pt-1" id="comments-preview-${post.id}"></div>

          <!-- حقل إضافة تعليق سريع ومباشر بالأسفل -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              class="quick-comment-input flex-1 bg-[#FAF8F5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#C86D51]"
              placeholder="${isAr ? 'اكتب تعليقاً على هذه التجربة...' : 'Write a quick comment...'}"
              data-post-id="${post.id}"
            />
            <button
              type="button"
              data-action="send-quick-comment"
              data-post-id="${post.id}"
              class="p-2 bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * ربط أحداث البطاقات (الإعجاب، المتابعة، التعليق، والمودال)
   */
  bindPostCardEvents() {
    if (!this.postsFeedMount) return;

    // رسم معاينة آخر تعليقين لكل منشور
    this.posts.forEach((post) => {
      const container = document.getElementById(`comments-preview-${post.id}`);
      if (container && post.comments && post.comments.length > 0) {
        this.commentTree.render(container, post.comments.slice(-2), post.id);
      }
    });

    this.postsFeedMount.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const postId = target.dataset.postId;
      const author = target.dataset.author;

      if (action === 'like-post') {
        this.handleLikePost(postId);
      } else if (action === 'toggle-follow') {
        this.handleToggleFollow(author);
      } else if (action === 'open-comments-modal') {
        this.openCommentsModal(postId);
      } else if (action === 'send-quick-comment') {
        const input = target.parentElement.querySelector('.quick-comment-input');
        const text = input?.value?.trim();
        if (text) {
          this.handleAddComment(postId, text);
          input.value = '';
        }
      } else if (action === 'report-post') {
        this.openReportModal('post', postId);
      }
    });

    // الاستماع لضغط Enter في حقل التعليق السريع
    this.postsFeedMount.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = e.target.closest('.quick-comment-input');
        if (input) {
          const postId = input.dataset.postId;
          const text = input.value.trim();
          if (text) {
            this.handleAddComment(postId, text);
            input.value = '';
          }
        }
      }
    });
  }

  /**
   * معالجة الإعجاب بالمنشور
   */
  handleLikePost(postId) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    post.isLiked = !post.isLiked;
    post.likesCount = post.isLiked ? (post.likesCount || 0) + 1 : Math.max(0, (post.likesCount || 0) - 1);
    this.renderPostsFeed();
  }

  /**
   * معالجة متابعة أو إلغاء متابعة كاتب المنشور
   */
  handleToggleFollow(author) {
    this.followingMap[author] = !this.followingMap[author];
    const isNowFollowing = this.followingMap[author];
    const isAr = store.language === 'ar';

    this.showToast(
      isNowFollowing
        ? isAr ? `أصبحت تتابع ${author} الآن!` : `You are now following ${author}!`
        : isAr ? `ألغيت متابعة ${author}` : `Unfollowed ${author}`
    );

    this.renderPostsFeed();
  }

  /**
   * إضافة تعليق رئيسي على المنشور
   */
  handleAddComment(postId, text) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    const isAr = store.language === 'ar';
    const currentUser = store.user || {
      displayName: isAr ? 'أحمد شاشير' : 'Ahmad Shaesher',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    const newComment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.uid || '',
      authorName: currentUser.displayName,
      authorAvatar: currentUser.photoURL,
      authorStamps: currentUser.stamps || [],
      isVerified: hasCollectedAllOfficialStamps(currentUser),
      createdAt: isAr ? 'الآن' : 'Just now',
      text,
      likesCount: 0,
      isLiked: false,
      replies: [],
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);

    this.renderPostsFeed();

    // إذا كان المودال مفتوحاً نقوم بتحديثه
    const modalContainer = document.getElementById('modal-comments-tree-mount');
    if (modalContainer && this.activeCommentsPostId === postId) {
      this.commentTree.render(modalContainer, post.comments, postId);
    }

    this.showToast(isAr ? 'تمت إضافة تعليقك بنجاح!' : 'Comment posted successfully!');
  }

  /**
   * إضافة رد متداخل على تعليق
   */
  handleAddReply(postId, commentId, text) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    const comment = post.comments?.find((c) => c.id === commentId);
    if (!comment) return;

    const isAr = store.language === 'ar';
    const currentUser = store.user || {
      displayName: isAr ? 'أحمد شاشير' : 'Ahmad Shaesher',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    if (!comment.replies) comment.replies = [];
    comment.replies.push({
      id: `r-${Date.now()}`,
      authorId: currentUser.uid || '',
      authorName: currentUser.displayName,
      authorAvatar: currentUser.photoURL,
      authorStamps: currentUser.stamps || [],
      isVerified: hasCollectedAllOfficialStamps(currentUser),
      createdAt: isAr ? 'الآن' : 'Just now',
      text,
      likesCount: 0,
      isLiked: false,
    });

    this.renderPostsFeed();

    // تحديث المودال إذا كان مفتوحاً
    const modalContainer = document.getElementById('modal-comments-tree-mount');
    if (modalContainer && this.activeCommentsPostId === postId) {
      this.commentTree.render(modalContainer, post.comments, postId);
    }

    this.showToast(isAr ? 'تم إرسال ردك بنجاح!' : 'Reply posted!');
  }

  /**
   * الإعجاب بتعليق
   */
  handleLikeComment(postId, commentId) {
    const post = this.posts.find((p) => p.id === postId);
    const comment = post?.comments?.find((c) => c.id === commentId);
    if (!comment) return;

    comment.isLiked = !comment.isLiked;
    comment.likesCount = comment.isLiked ? (comment.likesCount || 0) + 1 : Math.max(0, (comment.likesCount || 0) - 1);
    this.renderPostsFeed();
  }

  /**
   * الإعجاب برد
   */
  handleLikeReply(postId, commentId, replyId) {
    const post = this.posts.find((p) => p.id === postId);
    const comment = post?.comments?.find((c) => c.id === commentId);
    const reply = comment?.replies?.find((r) => r.id === replyId);
    if (!reply) return;

    reply.isLiked = !reply.isLiked;
    reply.likesCount = reply.isLiked ? (reply.likesCount || 0) + 1 : Math.max(0, (reply.likesCount || 0) - 1);
    this.renderPostsFeed();
  }

  /**
   * فتح نافذة التعليقات الكاملة بنمط فيسبوك
   */
  openCommentsModal(postId) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post || !this.commentsModalMount) return;

    this.activeCommentsPostId = postId;
    const isAr = store.language === 'ar';
    const title = isAr ? (post.title?.ar || post.title) : (post.title?.en || post.title);

    this.commentsModalMount.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 my-auto">
          
          <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold text-base text-[#1E293B]">
                ${isAr ? 'التعليقات والمناقشات التفاعلية' : 'Comments & Discussion'}
              </h3>
              <span class="text-xs text-slate-500 truncate max-w-sm block mt-0.5">
                ${title}
              </span>
            </div>
            <button type="button" id="close-comments-modal-btn" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 sm:p-6" id="modal-comments-tree-mount"></div>

          <!-- حقل الإدخال بالأسفل -->
          <form id="modal-comment-form" class="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50 rounded-b-3xl">
            <input
              type="text"
              id="modal-comment-input"
              class="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#C86D51]"
              placeholder="${isAr ? 'اكتب تعليقاً على هذا المنشور...' : 'Write your comment...'}"
              required
            />
            <button
              type="submit"
              class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <span>${isAr ? 'إرسال' : 'Send'}</span>
              <span>✈️</span>
            </button>
          </form>

        </div>
      </div>
    `;

    document.getElementById('close-comments-modal-btn')?.addEventListener('click', () => {
      this.commentsModalMount.innerHTML = '';
      this.activeCommentsPostId = null;
    });

    const form = document.getElementById('modal-comment-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('modal-comment-input');
      const text = input?.value?.trim();
      if (text) {
        this.handleAddComment(postId, text);
        input.value = '';
      }
    });

    const treeContainer = document.getElementById('modal-comments-tree-mount');
    if (treeContainer) {
      this.commentTree.render(treeContainer, post.comments || [], postId);
    }
  }

  /**
   * فتح نافذة الإبلاغ عن محتوى غير لائق
   */
  openReportModal(targetType, targetId, parentPostId = null) {
    if (!this.reportModalMount) return;
    const isAr = store.language === 'ar';

    this.reportModalMount.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100 animate-in zoom-in-95 my-auto">
          <div class="flex items-center justify-between border-b pb-3">
            <h4 class="font-extrabold text-sm text-rose-600 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>${isAr ? 'إبلاغ عن محتوى غير لائق' : 'Report Inappropriate Content'}</span>
            </h4>
            <button type="button" id="close-report-modal-btn" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed">
            ${isAr ? 'سيصل هذا البلاغ مباشرة إلى لوحة تحكم الإدارة لمراجعته والتحقق من سلامة المحتوى.' : 'This report will reach moderators immediately for verification.'}
          </p>

          <div class="space-y-2 text-xs">
            <label class="block font-bold text-slate-700">${isAr ? 'سبب الإبلاغ:' : 'Reason:'}</label>
            <select id="report-reason-select" class="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800">
              <option value="spam">${isAr ? 'إعلانات مزعجة وسبام (Spam)' : 'Spam / Advertising'}</option>
              <option value="offensive">${isAr ? 'محتوى مسيء أو غير لائق' : 'Offensive content'}</option>
              <option value="misleading">${isAr ? 'معلومات سياحية مضللة' : 'Misleading information'}</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" id="cancel-report-btn" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              ${isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="button" id="submit-report-btn" class="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow">
              ${isAr ? 'إرسال البلاغ' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('close-report-modal-btn')?.addEventListener('click', () => {
      this.reportModalMount.innerHTML = '';
    });
    document.getElementById('cancel-report-btn')?.addEventListener('click', () => {
      this.reportModalMount.innerHTML = '';
    });
    document.getElementById('submit-report-btn')?.addEventListener('click', () => {
      this.showToast(isAr ? 'تم إرسال بلاغك للإدارة بنجاح!' : 'Report sent successfully!');
      this.reportModalMount.innerHTML = '';
    });
  }

  /**
   * إنشاء منشور جديد
   */
  handleCreateNewPost(newPostData) {
    const isAr = store.language === 'ar';
    const currentUser = store.user || {
      displayName: isAr ? 'أحمد شاشير' : 'Ahmad Shaesher',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    const newPost = {
      id: `post-${Date.now()}`,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.photoURL,
      authorLevel: 'مستكشف برونزي',
      authorStamps: currentUser.stamps || [],
      isVerified: hasCollectedAllOfficialStamps(currentUser),
      isCurrentUser: true,
      likesCount: 0,
      isLiked: false,
      comments: [],
      ...newPostData,
    };

    this.posts.unshift(newPost);
    this.userMonthlyPostsCount += 1;
    this.renderPostsFeed();

    this.showToast(
      isAr
        ? 'تم إرسال تجربتك! المنشور قيد مراجعة الإدارة مع مكافأة +25 نقطة ولاء 🛡️🪙'
        : 'Story submitted for admin review with +25 loyalty points! 🛡️🪙'
    );
  }

  /**
   * عرض رسالة تنبيه سريعة (Toast)
   */
  showToast(message) {
    const existing = document.getElementById('jt-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'jt-toast';
    toast.className = 'fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-[#1E293B] text-white px-6 py-3 rounded-2xl shadow-2xl border border-[#E5C598] flex items-center gap-2 text-xs sm:text-sm font-bold animate-in fade-in duration-200';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
  }

  /**
   * ربط الأحداث العامة للبحث والمحرر واللغات
   */
  setupEventListeners() {
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderPostsFeed();
    });

    this.newPostBtn?.addEventListener('click', () => {
      this.postComposer.open();
    });

    window.addEventListener('language-changed', () => {
      this.renderFilterTabs();
      this.populateLocationFilter();
      this.renderPostsFeed();
    });
  }
}

// تشغيل الصفحة تلقائياً عند جاهزية الـ DOM
document.addEventListener('DOMContentLoaded', () => {
  const communityPage = new CommunityPage();
  communityPage.init();
});