/**
 * 🇯🇴 غلاف التخزين المحلي الآمن (LocalStorage Wrapper & Cache Engine)
 * يتضمن معالجة الأخطاء، انتهاء الصلاحية الزمني (TTL)، وإدارة المفضلة
 */

export const storage = {
  prefix: 'je_',

  /**
   * حفظ قيمة مع دعم مدة الصلاحية الاختيارية بالمللي ثانية (TTL)
   */
  set: function(key, value, ttlMs = null) {
    if (typeof window === 'undefined') return false;
    try {
      const item = {
        value: value,
        timestamp: Date.now(),
        expiresAt: ttlMs ? Date.now() + ttlMs : null
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
      return false;
    }
  },

  /**
   * استرجاع قيمة مع التحقق التلقائي من عدم انتهاء الصلاحية
   */
  get: function(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return defaultValue;

      const item = JSON.parse(raw);
      // فحص انتهاء الصلاحية
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return defaultValue;
      }
      return item.value !== undefined ? item.value : defaultValue;
    } catch (e) {
      console.warn('LocalStorage read failed for key:', key, e);
      return defaultValue;
    }
  },

  /**
   * حذف عنصر محدد
   */
  remove: function(key) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (e) {
      console.warn('LocalStorage remove failed:', e);
    }
  },

  /**
   * تفريغ كاش المنصة فقط
   */
  clear: function() {
    if (typeof window === 'undefined') return;
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(this.prefix)) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.warn('LocalStorage clear failed:', e);
    }
  },

  /* ================= دوال مساعدة خاصة بـ Jordan Tour ================= */

  // إدارة الرحلات المفضلة
  getBookmarks: function() {
    return this.get('saved_destinations', ['petra-rose-city']);
  },

  toggleBookmark: function(destId) {
    const list = this.getBookmarks();
    const idx = list.indexOf(destId);
    let isSaved = false;

    if (idx > -1) {
      list.splice(idx, 1);
      isSaved = false;
    } else {
      list.push(destId);
      isSaved = true;
    }

    this.set('saved_destinations', list);
    window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: { id: destId, isSaved } }));
    return isSaved;
  },

  // إدارة سجل عمليات البحث الأخيرة
  getRecentSearches: function() {
    return this.get('recent_searches', ['البتراء', 'وادي رم', 'البحر الميت']);
  },

  addRecentSearch: function(query) {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    let searches = this.getRecentSearches();
    searches = [clean, ...searches.filter(s => s !== clean)].slice(0, 6);
    this.set('recent_searches', searches);
  }
};

export const STORAGE_KEYS = {
  DESTINATIONS: 'destinations_data',
  GOVERNORATES: 'governorates_data',
  MAP_IMAGE: 'map_image',
  POINTS_SETTINGS: 'points_settings',
  BOOKINGS: 'bookings_data',
  LANDMARKS: 'landmarks_data',
  LEADERBOARD: 'leaderboard_data',
  COMMUNITY_POSTS: 'community_posts_data'
};

export const Storage = {
  get: (key, fallback) => storage.get(key, fallback),
  set: (key, value, ttlMs) => storage.set(key, value, ttlMs),
  remove: (key) => storage.remove(key)
};