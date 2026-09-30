/**
 * 🇯🇴 مولد رسومات أختام وشارات الجواز الرقمي الـ 12 (Passport Stamp & Badge Renderer)
 * رسومات SVG قياسية نقية بنمط الأختام الشمعية التراثية وشارات ألعاب التجميع الكبرى
 */

import { store } from '../state/store.js';

export const stampBadge = {
  /**
   * توليد كود SVG الداخلي للأيقونة بحسب نوع المعلم
   * @param {string} iconType 
   * @param {string} color 
   * @returns {string}
   */
  getSvgIconContent: function(iconType, color = '#C86D51') {
    switch (iconType) {
      case 'petra':
        return `
          <g fill="${color}">
            <polygon points="12,2 4,8 20,8" />
            <rect x="5" y="8" width="2.5" height="12" />
            <rect x="9.5" y="8" width="2.5" height="12" />
            <rect x="12" y="8" width="2.5" height="12" />
            <rect x="16.5" y="8" width="2.5" height="12" />
            <rect x="8.5" y="13" width="7" height="7" fill="#1E293B" />
          </g>
        `;
      case 'columns':
      case 'basalt':
        return `
          <g fill="${color}">
            <rect x="3" y="3" width="18" height="3" rx="1" />
            <rect x="5" y="6" width="3" height="13" />
            <rect x="10.5" y="6" width="3" height="13" />
            <rect x="16" y="6" width="3" height="13" />
            <rect x="2" y="19" width="20" height="3" rx="1" />
          </g>
        `;
      case 'coral':
        return `
          <g fill="${color}">
            <path d="M12 2 C14 6 18 7 18 12 C18 17 14 20 12 22 C10 20 6 17 6 12 C6 7 10 6 12 2 Z" />
            <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
          </g>
        `;
      case 'fortress':
      case 'castle':
      case 'citadel':
        return `
          <g fill="${color}">
            <path d="M3 7 L7 7 L7 9 L11 9 L11 7 L13 7 L13 9 L17 9 L17 7 L21 7 L21 21 L3 21 Z" />
            <rect x="9" y="14" width="6" height="7" fill="#1E293B" rx="1" />
          </g>
        `;
      case 'mosaic':
        return `
          <g fill="${color}">
            <rect x="4" y="4" width="6" height="6" rx="1" />
            <rect x="14" y="4" width="6" height="6" rx="1" />
            <rect x="4" y="14" width="6" height="6" rx="1" />
            <rect x="14" y="14" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="#D97706" />
          </g>
        `;
      default:
        return `
          <g fill="${color}">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </g>
        `;
    }
  },

  /**
   * توليد بطاقة الختم التراثية الشمعية بنمط شارات جواكر
   * @param {Object} stamp 
   * @param {Object} options { size: 'sm'|'md'|'lg', isUnlocked: boolean, showTitle: boolean }
   * @returns {string} HTML String
   */
  render: function(stamp, options = {}) {
    const size = options.size || 'md';
    const isUnlocked = options.isUnlocked !== undefined ? options.isUnlocked : Boolean(stamp.unlocked);
    const showTitle = options.showTitle !== undefined ? options.showTitle : true;
    const isRtl = (store.language === 'ar');

    // تحديد أبعاد الحاوية
    const sizeConfigs = {
      sm: { container: 'w-18 h-18 text-[9px]', svgSize: 'w-7 h-7', circle: 'w-16 h-16' },
      md: { container: 'w-28 h-28 sm:w-32 sm:h-32 text-[11px]', svgSize: 'w-10 h-10', circle: 'w-28 h-28' },
      lg: { container: 'w-40 h-40 sm:w-48 sm:h-48 text-xs', svgSize: 'w-14 h-14', circle: 'w-44 h-44' }
    }[size];

    const stampColor = isUnlocked ? (stamp.color || '#C86D51') : '#94A3B8';
    const stampName = stamp.name ? (isRtl ? stamp.name.ar : stamp.name.en) : 'ختم معتمد';
    const govName = stamp.gov || (stamp.governorateName ? (isRtl ? stamp.governorateName.ar : stamp.governorateName.en) : 'محافظة أردنية');

    return `
      <div class="relative inline-flex flex-col items-center justify-center select-none group" data-stamp-id="${stamp.id}">
        <!-- الحاوية الدائرية المنقوشة -->
        <div
          class="relative ${sizeConfigs.circle} rounded-full flex items-center justify-center p-2 transition-all duration-300 ${
            isUnlocked
              ? 'shadow-lg border-dashed'
              : 'opacity-40 grayscale filter hover:opacity-60'
          }"
          style="
            color: ${stampColor};
            border: 2px dashed ${stampColor};
            background: ${isUnlocked ? `radial-gradient(circle, ${stampColor}15 0%, transparent 80%)` : '#F1F5F9'};
          "
        >
          <!-- حلقة الثقوب المنقوشة الداخلية -->
          <div class="absolute inset-1 rounded-full border border-dashed opacity-70 pointer-events-none" style="border-color: ${stampColor};"></div>
          <div class="absolute inset-2 rounded-full border border-double opacity-80 pointer-events-none" style="border-color: ${stampColor};"></div>

          <!-- تفاصيل الختم المركزية -->
          <div class="relative z-10 flex flex-col items-center justify-center text-center p-1">
            <span class="font-mono text-[7px] tracking-widest font-black uppercase block leading-none mb-0.5" style="color: ${stampColor};">
              JORDAN
            </span>

            <div class="${sizeConfigs.svgSize} flex items-center justify-center my-0.5">
              ${stamp.imageUrl ? `
                <img src="${stamp.imageUrl}" class="w-full h-full object-contain rounded-full shadow-xs">
              ` : `
                <svg viewBox="0 0 24 24" class="w-full h-full">
                  ${this.getSvgIconContent(stamp.iconType, stampColor)}
                </svg>
              `}
            </div>

            <span class="font-extrabold font-arabic leading-tight line-clamp-1 text-[8px] sm:text-[9px] px-1 text-slate-800">
              ${govName.replace('محافظة ', '')}
            </span>
          </div>

          <!-- شارة التوثيق الذهبية للختم المحرر بنمط جواكر -->
          ${isUnlocked ? `
            <div
              class="absolute -top-1 -end-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-md"
              style="background-color: ${stampColor};"
            >
              ✓
            </div>
          ` : `
            <div class="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[8px] border-2 border-white">
              <i class="fa-solid fa-lock"></i>
            </div>
          `}
        </div>

        <!-- العنوان ونقاط الـ XP بالأسفل -->
        ${showTitle ? `
          <div class="mt-2 text-center max-w-[130px]">
            <h5 class="font-bold text-xs text-[#1E293B] truncate leading-tight group-hover:text-[#C86D51] transition-colors">
              ${stampName}
            </h5>
            <span class="text-[10px] font-bold block mt-0.5 ${isUnlocked ? 'text-[#D97706]' : 'text-slate-400'}">
              ${stamp.rarity || 'Heritage'} (+${stamp.xp || 150} XP)
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }
};