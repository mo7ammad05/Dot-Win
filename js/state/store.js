/**
 * 🇯🇴 مخزن الحالة التفاعلي العام لمنصة Jordan Tour (Reactive State Store)
 * يدير حالة المستخدم، المصادقة، مزامنة الشعار والهوية، وتحويل العملات لحظياً
 */

import { auth, db } from '../config/firebase.config.js';
import { translationService } from '../services/translation.service.js';
import { socialService } from '../services/social.service.js';

class ReactiveStateStore {
  constructor() {
    this.user = null;
    this.language = localStorage.getItem('jt_language') || 'ar';
    this.currency = localStorage.getItem('jt_currency') || 'JOD';
    
    // هوية وشعار الموقع (مع قراءة الكاش المحلي للسرعة الفائقة)
    this.siteName = localStorage.getItem('jt_site_name') || 'Jordan Tour';
    this.siteNameAr = 'Jordan Tour';
    this.logoUrl = localStorage.getItem('jt_logo_url') || 'https://cdn-icons-png.flaticon.com/512/8212/8212607.png';
    this.whatsappNumber = localStorage.getItem('jt_whatsapp_number') || '+962 7 9123 4567';
    this.authLoginTitle = localStorage.getItem('jt_auth_login_title') || 'مرحباً\nبعودتك!';
    this.authLoginMessage = localStorage.getItem('jt_auth_login_message') || 'سجّل الدخول لمتابعة رحلتك واستكشاف الأردن.';
    this.authSignupTitle = localStorage.getItem('jt_auth_signup_title') || 'أهلاً\nبك معنا!';
    this.authSignupMessage = localStorage.getItem('jt_auth_signup_message') || 'أنشئ حسابك واجمع أختام المحافظات في جوازك الرقمي.';
    const fallbackHeroMediaUrl = 'media/video.mp4';
    const legacyHeroMediaType = localStorage.getItem('jt_hero_media_type') || 'video';
    const legacyHeroMediaUrl = localStorage.getItem('jt_hero_media_url') || fallbackHeroMediaUrl;

    this.homeHeroMediaType = localStorage.getItem('jt_home_hero_media_type') || legacyHeroMediaType;
    this.homeHeroMediaUrl = localStorage.getItem('jt_home_hero_media_url') || legacyHeroMediaUrl;
    this.authPanelMediaType = localStorage.getItem('jt_auth_panel_media_type') || legacyHeroMediaType;
    this.authPanelMediaUrl = localStorage.getItem('jt_auth_panel_media_url') || legacyHeroMediaUrl;

    localStorage.setItem('jt_home_hero_media_type', this.homeHeroMediaType);
    localStorage.setItem('jt_home_hero_media_url', this.homeHeroMediaUrl);
    localStorage.setItem('jt_auth_panel_media_type', this.authPanelMediaType);
    localStorage.setItem('jt_auth_panel_media_url', this.authPanelMediaUrl);
    this.heroTitleFirst = localStorage.getItem('jt_hero_title_first') || 'اكتشف سحر الأردن الخالد';
    this.heroTitleSecond = localStorage.getItem('jt_hero_title_second') || 'من البتراء إلى وادي رم';
    this.heroSubtitle = localStorage.getItem('jt_hero_subtitle') || 'احجز جولاتك الأثرية والطبيعية فوراً عبر كليك الأردني (CliQ)، واجمع أختام المحافظات الـ 12 في جواز سفرك الرقمي.';
    this.heroTag = localStorage.getItem('jt_hero_tag') || '🇯🇴 البوابة الوطنية للسياحة والتجارب الأردنية الـ 12';

    // أسعار صرف العملات المعتمدة مقابل الدينار الأردني
    this.currencyRates = {
      JOD: { code: 'JOD', symbol: 'د.أ', rate: 1.0 },
      USD: { code: 'USD', symbol: '$', rate: 1.41 },
      EUR: { code: 'EUR', symbol: '€', rate: 1.30 }
    };

    this.initBrandingRealtimeSync();
    this.initAuthObserver();
  }

  /**
   * 1. الاستماع المباشر لتحديثات الشعار والهوية من لوحة الإدارة عبر Firestore
   * وتعميمها فوراً على كل صفحة دون الحاجة لإعادة تحميل الموقع
   */
  initBrandingRealtimeSync() {
    if (!db) return;

    db.collection('settings').doc('branding').onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        this.siteName = data.siteName || data.siteNameEn || 'Jordan Tour';
        this.siteNameAr = 'Jordan Tour';
        this.logoUrl = data.logoUrl || 'https://cdn-icons-png.flaticon.com/512/8212/8212607.png';
        this.whatsappNumber = data.whatsappNumber || '+962 7 9123 4567';
        const legacyMediaType = data.heroMediaType || 'video';
        const legacyMediaUrl = data.heroMediaUrl && String(data.heroMediaUrl).trim() ? String(data.heroMediaUrl).trim() : 'media/video.mp4';
        this.homeHeroMediaType = data.homeHeroMediaType || legacyMediaType;
        this.homeHeroMediaUrl = data.homeHeroMediaUrl || legacyMediaUrl;
        this.authPanelMediaType = data.authPanelMediaType || legacyMediaType;
        this.authPanelMediaUrl = data.authPanelMediaUrl || legacyMediaUrl;
        this.heroTitleFirst = data.heroTitleFirst || this.heroTitleFirst;
        this.heroTitleSecond = data.heroTitleSecond || this.heroTitleSecond;
        this.heroSubtitle = data.heroSubtitle || this.heroSubtitle;
        this.heroTag = data.heroTag || this.heroTag;
        this.authLoginTitle = data.authLoginTitle || this.authLoginTitle;
        this.authLoginMessage = data.authLoginMessage || this.authLoginMessage;
        this.authSignupTitle = data.authSignupTitle || this.authSignupTitle;
        this.authSignupMessage = data.authSignupMessage || this.authSignupMessage;

        localStorage.setItem('jt_site_name', this.siteName);
        localStorage.setItem('jt_site_name_ar', this.siteNameAr);
        localStorage.setItem('jt_logo_url', this.logoUrl);
        localStorage.setItem('jt_whatsapp_number', this.whatsappNumber);
        localStorage.setItem('jt_home_hero_media_type', this.homeHeroMediaType);
        localStorage.setItem('jt_home_hero_media_url', this.homeHeroMediaUrl);
        localStorage.setItem('jt_auth_panel_media_type', this.authPanelMediaType);
        localStorage.setItem('jt_auth_panel_media_url', this.authPanelMediaUrl);
        localStorage.setItem('jt_hero_media_type', this.homeHeroMediaType);
        localStorage.setItem('jt_hero_media_url', this.homeHeroMediaUrl);
        localStorage.setItem('jt_hero_title_first', this.heroTitleFirst);
        localStorage.setItem('jt_hero_title_second', this.heroTitleSecond);
        localStorage.setItem('jt_hero_subtitle', this.heroSubtitle);
        localStorage.setItem('jt_hero_tag', this.heroTag);
        localStorage.setItem('jt_auth_login_title', this.authLoginTitle);
        localStorage.setItem('jt_auth_login_message', this.authLoginMessage);
        localStorage.setItem('jt_auth_signup_title', this.authSignupTitle);
        localStorage.setItem('jt_auth_signup_message', this.authSignupMessage);

        this.applyBranding();
        window.dispatchEvent(new CustomEvent('branding-updated', { detail: { name: this.siteName, logo: this.logoUrl } }));
      }
    }, (err) => {
      console.warn('Realtime branding listener fallback to cache:', err.message);
    });
  }

  /**
   * 2. مراقب حالة تسجيل الدخول والمصادقة مع مزامنة بيانات المستخدم في Firestore
   */
  initAuthObserver() {
    if (!auth) return;

    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        let userDbData = {};
        if (db) {
          try {
            const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
            if (userDoc.exists) {
              userDbData = userDoc.data();
            }
          } catch (e) {
            console.warn('Could not fetch user document:', e);
          }
        }

        this.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName || userDbData.name || 'مستكشف الأردن',
          photoURL: userDbData.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          xp: userDbData.xp !== undefined ? userDbData.xp : 1450,
          rank: userDbData.rank || 'مستكشف فضي (Silver)',
          stamps: userDbData.stamps || ['stamp-maan-petra', 'stamp-amman-citadel', 'stamp-jerash-hadrian'],
          referralCode: userDbData.referralCode || 'SH3SHER2026',
          ...userDbData
        };
        try {
          await socialService.publishProfile(this.user);
        } catch (error) {
          console.warn('Could not sync public profile:', error);
        }
      } else {
        this.user = null;
      }

      window.dispatchEvent(new CustomEvent('user-state-changed', { detail: this.user }));
    });
  }

  /**
   * 3. دالة تعميم الشعار والاسم على عناصر الـ DOM في كامل الموقع
   */
  applyBranding() {
    const displayName = 'Jordan Tour';

    // تحديث كافة الصور ذات الكلاس dynamic-logo
    document.querySelectorAll('.dynamic-logo').forEach((img) => {
      if (img.tagName === 'IMG') {
        img.src = this.logoUrl;
      }
    });

    // تحديث كافة نصوص اسم الموقع ذات الكلاس dynamic-site-name
    document.querySelectorAll('.dynamic-site-name').forEach((el) => {
      el.textContent = displayName;
    });

    const heroTitleFirst = document.getElementById('hero-title-first');
    const heroTitleSecond = document.getElementById('hero-title-second');
    const heroSubtitle = document.getElementById('hero-subtitle');
    if (heroTitleFirst) heroTitleFirst.textContent = this.heroTitleFirst;
    if (heroTitleSecond) heroTitleSecond.textContent = this.heroTitleSecond;
    if (heroSubtitle) heroSubtitle.textContent = this.heroSubtitle;
    document.querySelectorAll('.dynamic-hero-tag').forEach((el) => {
      el.textContent = this.heroTag;
    });

    const whatsappDigits = this.whatsappNumber.replace(/\D/g, '');
    document.querySelectorAll('.dynamic-whatsapp-number').forEach((el) => {
      el.textContent = this.whatsappNumber;
    });
    document.querySelectorAll('.dynamic-whatsapp-link').forEach((el) => {
      el.href = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن حجوزات رحلات الأردن.')}`;
    });

    const heroVideo = document.getElementById('hero-video-element');
    const heroImage = document.getElementById('hero-image-element');
    const safeHeroVideoUrl = this.homeHeroMediaType === 'video' ? (this.homeHeroMediaUrl || 'media/video.mp4') : 'media/video.mp4';
    const fallbackRemoteVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

    if (this.homeHeroMediaType === 'image') {
      this.homeHeroMediaUrl = this.homeHeroMediaUrl || 'https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=1600&auto=format&fit=crop&q=80';
    }

    if (heroVideo && heroImage) {
      if (this.homeHeroMediaType === 'image') {
        heroVideo.pause();
        heroVideo.classList.add('hidden');
        heroVideo.style.display = 'none';
        heroImage.src = this.homeHeroMediaUrl;
        heroImage.classList.remove('hidden');
        heroImage.style.display = 'block';
      } else {
        heroVideo.classList.remove('hidden');
        heroVideo.style.display = 'block';
        heroImage.classList.add('hidden');
        heroImage.style.display = 'none';

        const applyHeroVideoSource = (src) => {
          heroVideo.src = src;
          heroVideo.load();
          heroVideo.play().catch(() => {});
        };

        heroVideo.onerror = () => {
          if (heroVideo.src !== fallbackRemoteVideoUrl) {
            applyHeroVideoSource(fallbackRemoteVideoUrl);
          }
        };

        if (heroVideo.src !== safeHeroVideoUrl) {
          applyHeroVideoSource(safeHeroVideoUrl);
        }
      }
    }

    // تحديث عنوان التبويب في المتصفح إذا لم يكن في لوحة الأدمن
    if (!document.title.includes('Master Admin') && !document.title.includes('لوحة تحكم الإدارة')) {
      document.title = `${displayName} | المنصة الوطنية لاكتشاف الأردن`;
    }
  }

  /**
   * 4. تحويل الأسعار بحسب العملة المختارة (JOD, USD, EUR)
   */
  convertPrice(amountInJOD, targetCurrency = this.currency) {
    const curr = this.currencyRates[targetCurrency] || this.currencyRates.JOD;
    const converted = Math.round(amountInJOD * curr.rate);
    return {
      amount: converted,
      currencyCode: curr.code,
      symbol: curr.symbol,
      formatted: `${converted} ${curr.symbol}`
    };
  }

  /**
   * 5. تغيير اللغة الحالية وحفظها
   */
  async setLanguage(lang) {
    const normalized = ['ar', 'en', 'fr', 'de', 'tr'].includes(lang) ? lang : 'ar';
    if (normalized !== 'ar' && !translationService.isAvailable()) return false;

    const previousLanguage = this.language;
    try {
      if (normalized !== 'ar') {
        const translated = await translationService.translatePage(normalized);
        if (!translated) return false;
      } else {
        await translationService.translatePage('ar');
      }

      this.language = normalized;
      localStorage.setItem('jt_language', normalized);
      document.documentElement.dir = normalized === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = normalized;
      this.applyBranding();
      window.dispatchEvent(new CustomEvent('language-changed', { detail: normalized }));
      return true;
    } catch (error) {
      console.warn('Could not change the page language:', error);
      this.language = previousLanguage;
      document.documentElement.dir = previousLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = previousLanguage;
      this.applyBranding();
      window.dispatchEvent(new CustomEvent('language-changed', { detail: previousLanguage }));
      return false;
    }
  }

  /**
   * 6. تغيير العملة الحالية وحفظها
   */
  setCurrency(curr) {
    if (this.currencyRates[curr]) {
      this.currency = curr;
      localStorage.setItem('jt_currency', curr);
      window.dispatchEvent(new CustomEvent('currency-changed', { detail: curr }));
    }
  }
}

export const store = new ReactiveStateStore();

if (typeof document !== 'undefined') {
  const applySavedLanguage = async () => {
    document.documentElement.dir = store.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = store.language;
    if (store.language !== 'ar') {
      const translated = await translationService.translatePage(store.language);
      if (!translated) {
        store.language = 'ar';
        localStorage.setItem('jt_language', 'ar');
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
        window.dispatchEvent(new CustomEvent('language-changed', { detail: 'ar' }));
      }
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applySavedLanguage, { once: true });
  else queueMicrotask(applySavedLanguage);
}

const appState = {
  destinations: [],
  governorates: [],
  masterLandmarks: [],
  bookings: [],
  leaderboard: [],
  posts: [],
  pointsSettings: {}
};

export const appStore = {
  getState() {
    return appState;
  },
  setState(updates) {
    Object.assign(appState, updates);
  },
  awardPoints(points, reason) {
    if (!store.user) return false;
    store.user.xp = (Number(store.user.xp) || 0) + points;
    window.dispatchEvent(new CustomEvent('points-updated', { detail: { points, reason } }));
    return true;
  }
};