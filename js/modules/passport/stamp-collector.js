/**
 * 🇯🇴 Jordan Tour - Stamp Collector & Gamification Engine
 * مسار الملف: js/modules/passport/stamp-collector.js
 * يدير فحص الأختام المكتسبة، نسب الإنجاز، الرتب الشرفية، وحساب نقاط XP
 */

import { store } from '../../state/store.js';
import { officialStampsData } from '../../data/stamps.data.js';
import { firebaseService } from '../../services/firebase.service.js';

export async function loadStampCatalog() {
  const settings = await firebaseService.getSettingsDocument('stamps_data');
  return Array.isArray(settings?.list) && settings.list.length ? settings.list : officialStampsData;
}

export class StampCollector {
  constructor(stampsCatalog = officialStampsData) {
    this.stampsCatalog = stampsCatalog;
    this.userUnlockedStampIds = new Set();
    this.initUserStamps();
  }

  /**
   * تهيئة أختام المستخدم من مخزن الحالة أو التخزين المحلي
   */
  initUserStamps() {
    if (store.user && Array.isArray(store.user.stamps)) {
      store.user.stamps.forEach((id) => this.userUnlockedStampIds.add(id));
    } else {
      try {
        const raw = localStorage.getItem('jt_user_unlocked_stamps');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach((id) => this.userUnlockedStampIds.add(id));
          }
        } else {
          officialStampsData.forEach((stamp) => this.userUnlockedStampIds.add(stamp.id));
        }
      } catch (e) {
        console.warn('Could not read user stamps:', e);
      }
    }
  }

  /**
   * جلب كافة الأختام الـ 12 مع تحديد حالة القفل لكل ختم للمستخدم الحالي
   * @returns {Array} مصفوفة الأختام مع خصائص unlocked و dateUnlocked
   */
  getAllStampsWithUserStatus() {
    return this.stampsCatalog.map((stamp) => {
      const isUnlocked = this.userUnlockedStampIds.has(stamp.id);
      return {
        ...stamp,
        unlocked: isUnlocked,
        dateUnlocked: isUnlocked
          ? stamp.dateUnlocked || (store.language === 'ar' ? 'معتمد رسمياً' : 'Official Verified')
          : null,
      };
    });
  }

  /**
   * عدد الأختام المكتسبة
   */
  getUnlockedCount() {
    return this.userUnlockedStampIds.size;
  }

  /**
   * إجمالي عدد الأختام في المملكة
   */
  getTotalStampsCount() {
    return this.stampsCatalog.length;
  }

  /**
   * احتساب نسبة إنجاز الجواز بالنسبة المئوية
   */
  getProgressPercentage() {
    const total = this.getTotalStampsCount();
    if (total === 0) return 0;
    return Math.round((this.getUnlockedCount() / total) * 100);
  }

  /**
   * احتساب مجموع نقاط الـ XP المكتسبة من الأختام
   */
  getTotalEarnedXP() {
    return this.stampsCatalog.reduce((sum, stamp) => {
      if (this.userUnlockedStampIds.has(stamp.id)) {
        return sum + (stamp.xp || 100);
      }
      return sum;
    }, 0);
  }

  /**
   * تحديد الرتبة الشرفية للمستكشف بحسب عدد الأختام المكتسبة
   */
  getExplorerRank() {
    const count = this.getUnlockedCount();
    const isAr = store.language === 'ar';

    if (count >= 12) {
      return {
        code: 'royal_legend',
        title: isAr ? 'مستكشف نبطي ملكي أسطوري' : 'Royal Nabataean Legend',
        badge: '👑',
        color: '#D97706',
        isMaxRank: true,
      };
    } else if (count >= 8) {
      return {
        code: 'gold',
        title: isAr ? 'مستكشف ذهبي خبير' : 'Gold Master Explorer',
        badge: '🥇',
        color: '#F59E0B',
        isMaxRank: false,
      };
    } else if (count >= 4) {
      return {
        code: 'silver',
        title: isAr ? 'مستكشف فضي متقدم' : 'Silver Advanced Explorer',
        badge: '🥈',
        color: '#94A3B8',
        isMaxRank: false,
      };
    } else {
      return {
        code: 'bronze',
        title: isAr ? 'مستكشف برونزي واعد' : 'Bronze Explorer Scout',
        badge: '🥉',
        color: '#B45309',
        isMaxRank: false,
      };
    }
  }

  /**
   * فك قفل ختم جديد للمستخدم وحفظه محلياً وسحابياً في Firestore
   * @param {string} stampId - معرف الختم
   * @returns {boolean} نجاح العملية
   */
  async unlockStamp(stampId) {
    if (!stampId || this.userUnlockedStampIds.has(stampId)) {
      return false;
    }

    this.userUnlockedStampIds.add(stampId);

    // حفظ محلي فوري
    try {
      localStorage.setItem(
        'jt_user_unlocked_stamps',
        JSON.stringify(Array.from(this.userUnlockedStampIds))
      );
    } catch (e) {
      console.warn('Local storage error:', e);
    }

    // حفظ سحابي إذا كان المستخدم مسجل دخول
    if (store.user && window.JordanFirebase && window.JordanFirebase.db) {
      try {
        await window.JordanFirebase.db
          .collection('users')
          .doc(store.user.uid)
          .set(
            {
              stamps: Array.from(this.userUnlockedStampIds),
              xp: (store.user.xp || 0) + 150,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
      } catch (err) {
        console.warn('Cloud sync error for stamp:', err);
      }
    }

    // إطلاق حدث عام لتحديث شريط النافبار والملف الشخصي فوراً
    window.dispatchEvent(
      new CustomEvent('stamp-unlocked', {
        detail: {
          stampId,
          totalUnlocked: this.getUnlockedCount(),
          percentage: this.getProgressPercentage(),
        },
      })
    );

    return true;
  }

  /**
   * توليد كود SVG رسومي عالي الدقة للختم التراثي (مستوحى من تصميم جواكر الفاخر)
   * @param {Object} stamp
   * @param {string} size - 'sm' | 'md' | 'lg'
   * @returns {string} كود SVG كامل
   */
  generateStampSVG(stamp, size = 'md') {
    const isUnlocked = stamp.unlocked;
    const color = isUnlocked ? stamp.color || '#C86D51' : '#94A3B8';
    const dim = size === 'sm' ? 80 : size === 'lg' ? 180 : 130;
    const isAr = store.language === 'ar';

    const govTitle = isAr ? stamp.governorateName?.ar || stamp.gov : stamp.governorateName?.en || stamp.gov;
    const sealTitle = isAr ? stamp.name?.ar : stamp.name?.en;
    const imageUrl = stamp.imageUrl || '';

    return `
      <div class="relative inline-flex flex-col items-center justify-center select-none ${isUnlocked ? 'group hover:scale-105 transition-transform' : 'opacity-40 grayscale'}">
        <svg width="${dim}" height="${dim}" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" class="filter drop-shadow-md">
          <!-- الإطار الخارجي المسنن أو الدائري المزدوج -->
          <circle cx="70" cy="70" r="66" stroke="${color}" stroke-width="2.5" stroke-dasharray="4 2" />
          <circle cx="70" cy="70" r="61" stroke="${color}" stroke-width="1.2" />
          <circle cx="70" cy="70" r="58" fill="${isUnlocked ? color + '12' : '#F1F5F9'}" />

          <!-- شريط كتابة المملكة الأردنية الهاشمية المقوس -->
          <path id="curve-${stamp.id}" d="M 22 70 A 48 48 0 0 1 118 70" fill="none" />
          <text font-size="8" font-weight="900" fill="${color}" letter-spacing="1">
            <textPath href="#curve-${stamp.id}" startOffset="50%" text-anchor="middle">
              ${isAr ? 'المملكة الأردنية الهاشمية' : 'HASHEMITE KINGDOM'}
            </textPath>
          </text>

          <!-- الرمز التراثي المركزي -->
          ${imageUrl
            ? `<image href="${imageUrl}" x="43" y="39" width="54" height="54" preserveAspectRatio="xMidYMid slice" />`
            : `<g transform="translate(46, 42) scale(1.1)" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">${this.getIconSVGPath(stamp.iconType)}</g>`}

          <!-- شريط القاعدة السفلي مع اسم المحافظة -->
          <path id="curve-bottom-${stamp.id}" d="M 22 70 A 48 48 0 0 0 118 70" fill="none" />
          <text font-size="8.5" font-weight="900" fill="${color}">
            <textPath href="#curve-bottom-${stamp.id}" startOffset="50%" text-anchor="middle">
              ${govTitle}
            </textPath>
          </text>

          <!-- نجمة سباعية هاشمية في المركز السفلي -->
          <circle cx="70" cy="116" r="3.5" fill="${color}" />
          <circle cx="70" cy="116" r="1.5" fill="#FAF8F5" />
        </svg>

        <!-- علامة الصح الذهبية إذا كان الختم مكتسباً -->
        ${
          isUnlocked
            ? `<span class="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-md">✓</span>`
            : `<span class="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">🔒</span>`
        }
      </div>
    `;
  }

  /**
   * مسارات الأيقونات التراثية للرسم داخل الـ SVG
   */
  getIconSVGPath(iconType) {
    switch (iconType) {
      case 'petra':
        return `<path d="M4 36 V14 L20 2 L36 14 V36 Z M10 20 H30 M15 28 H25" fill="currentColor" fill-opacity="0.15" />`;
      case 'citadel':
      case 'columns':
      case 'basalt':
        return `<path d="M4 6 H38 M8 6 V36 M18 6 V36 M28 6 V36 M4 36 H38" />`;
      case 'coral':
        return `<path d="M20 38 C20 26 12 18 12 8 C18 14 26 14 26 22 C30 16 36 20 36 28 C36 34 30 38 20 38 Z" fill="currentColor" fill-opacity="0.2" />`;
      case 'fortress':
      case 'castle':
        return `<path d="M4 10 H12 V16 H20 V10 H28 V16 H36 V36 H4 Z M16 26 H24 V36 H16 Z" fill="currentColor" fill-opacity="0.15" />`;
      default:
        return `<path d="M20 4 L24 16 L37 16 L27 24 L31 36 L20 29 L9 36 L13 24 L3 16 L16 16 Z" fill="currentColor" fill-opacity="0.2" />`;
    }
  }
}