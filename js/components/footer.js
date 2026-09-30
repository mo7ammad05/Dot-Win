/**
 * 🇯🇴 مكون الفوتر الوطني الموحد (Global Footer Component)
 * يتضمن الاعتمادات الرسمية، روابط الوجهات، والاتصال المباشر عبر واتساب
 */

import { store } from '../state/store.js';

export function renderFooter() {
  const mountEl = document.getElementById('footer-mount');
  if (!mountEl) return;

  const isRtl = store.language === 'ar';
  const currentYear = new Date().getFullYear();
  const whatsappDigits = store.whatsappNumber.replace(/\D/g, '');

  mountEl.innerHTML = `
    <footer class="w-full bg-[#1E293B] text-white border-t border-slate-800 pt-16 pb-12 transition-colors">
      <div class="max-w-[1440px] mx-auto px-4 md:px-8">
        
        <!-- شبكة الأعمدة الأربعة الرئيسية -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          
          <!-- العمود 1: الهوية والشعار والاعتمادات -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <img
                src="${store.logoUrl}"
                alt="${store.siteName}"
                class="dynamic-logo w-10 h-10 rounded-xl object-cover border border-[#D97706]/40 shadow bg-white p-0.5"
              >
              <div>
                <span class="dynamic-site-name font-black text-xl tracking-tight text-white block">
                  Jordan Tour
                </span>
                <span class="text-xs font-semibold text-[#E5C598] font-arabic -mt-0.5 block">
                  ${isRtl ? 'بوابة السياحة والتجارب الوطنية الأردنية' : 'Official National Tourism & Heritage Portal'}
                </span>
              </div>
            </div>

            <p class="text-xs text-slate-400 leading-relaxed max-w-sm">
              ${isRtl
                ? 'المنصة الوطنية الأردنية لحجز الجولات الأثرية والطبيعية في البتراء، وادي رم، البحر الميت، وجرش مع الدفع الفوري بكليك والتذاكر الرسمية المعتمدة.'
                : 'Jordan\'s premier expedition portal with instant CliQ bank verification, interactive digital tickets, and official 12 governorate passport collection.'}
            </p>

            <!-- شارات التوثيق الرسمية -->
            <div class="flex flex-wrap gap-2 pt-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-semibold text-[#E5C598]">
                <i class="fa-solid fa-shield-check text-[#D97706]"></i>
                <span>CliQ Jordan Verified</span>
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-semibold text-emerald-400">
                <i class="fa-solid fa-award text-emerald-400"></i>
                <span>MOTA & PDTRA Licensed</span>
              </span>
            </div>
          </div>

          <!-- العمود 2: الوجهات السياحية الأبرز -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#E5C598] mb-4">
              ${isRtl ? 'أبرز الوجهات والرحلات' : 'Top Expeditions'}
            </h4>
            <ul class="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="attraction.html?id=petra-rose-city" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-chevron-left text-[9px] text-[#C86D51]"></i>
                  <span>${isRtl ? 'البتراء (المدينة الوردية)' : 'Petra (The Rose City)'}</span>
                </a>
              </li>
              <li>
                <a href="attraction.html?id=wadi-rum-stargazing" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-chevron-left text-[9px] text-[#C86D51]"></i>
                  <span>${isRtl ? 'صحراء وادي رم وقبب المريخ' : 'Wadi Rum Desert & Domes'}</span>
                </a>
              </li>
              <li>
                <a href="attraction.html?id=dead-sea-retreat" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-chevron-left text-[9px] text-[#C86D51]"></i>
                  <span>${isRtl ? 'منتجعات البحر الميت والسبا الطبيعي' : 'Dead Sea Wellness Retreats'}</span>
                </a>
              </li>
              <li>
                <a href="attraction.html?id=jerash-roman-glory" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-chevron-left text-[9px] text-[#C86D51]"></i>
                  <span>${isRtl ? 'أعمدة ومدرج جرش الروماني' : 'Jerash Roman Ruins'}</span>
                </a>
              </li>
              <li>
                <a href="map.html" class="hover:text-white transition-colors flex items-center gap-1.5 text-amber-300 font-bold">
                  <i class="fa-solid fa-map-location-dot text-xs text-[#D97706]"></i>
                  <span>${isRtl ? 'خريطة الأردن التفاعلية' : 'Interactive Jordan Map'}</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- العمود 3: نظام الولاء والأختام -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#E5C598] mb-4">
              ${isRtl ? 'المجتمع ونظام الولاء' : 'Community & Loyalty'}
            </h4>
            <ul class="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="community.html" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-comments text-[#C86D51]"></i>
                  <span>${isRtl ? 'منتدى السياح وتجارب السفر' : 'Travelers Forum & Stories'}</span>
                </a>
              </li>
              <li>
                <a href="leaderboard.html" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-trophy text-amber-400"></i>
                  <span>${isRtl ? 'لوحة الشرف والمتصدرين' : 'Explorer Leaderboard'}</span>
                </a>
              </li>
              <li>
                <a href="profile.html" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-gift text-emerald-400"></i>
                  <span>${isRtl ? 'برنامج الإحالة والمكافآت' : 'Referral Rewards Program'}</span>
                </a>
              </li>
              <li class="pt-1 font-mono text-[11px] text-amber-300">
                CliQ Alias: <strong class="text-white">JORDANEXPLORER</strong>
              </li>
            </ul>
          </div>

          <!-- العمود 4: الدعم الفوري والواتساب -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#E5C598] mb-4">
              ${isRtl ? 'خدمة العملاء والدعم الميداني' : 'Support & Assistance'}
            </h4>
            <ul class="space-y-3 text-xs text-slate-400">
              <li>
                <a
                  href="https://wa.me/962791234567?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AD%D8%AC%D9%88%D8%B2%D8%A7%D8%AA%20%D8%B1%D8%AD%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D8%A3%D8%B1%D8%AF%D9%86."
                  target="_blank"
                  rel="noopener noreferrer"
                  class="dynamic-whatsapp-link w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <i class="fa-brands fa-whatsapp text-base"></i>
                  <span>${isRtl ? 'تواصل عبر واتساب مباشرة' : 'Direct WhatsApp Support'}</span>
                </a>
              </li>
              <li class="flex items-center gap-2 text-slate-400">
                <i class="fa-solid fa-location-dot text-[#C86D51]"></i>
                <span>عمان، المملكة الأردنية الهاشمية</span>
              </li>
              <li class="flex items-center gap-2 text-slate-400 font-mono">
                <i class="fa-solid fa-phone text-[#C86D51]"></i>
                <span class="dynamic-whatsapp-number">${store.whatsappNumber}</span>
              </li>
              <li class="flex items-center gap-2 text-slate-400 font-mono">
                <i class="fa-solid fa-envelope text-[#C86D51]"></i>
                <span>support@jordantour.jo</span>
              </li>
            </ul>
          </div>

        </div>

        <!-- الشريط السفلي: حقوق الملكية -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © ${currentYear} <span class="dynamic-site-name text-slate-300 font-bold">Jordan Tour</span>. جميع الحقوق محفوظة.
          </p>
          <div class="flex items-center gap-4 text-slate-400">
            <span>معتمد من وزارة السياحة والآثار وهيئة تنشيط السياحة الأردنية</span>
            <span>•</span>
            <span class="font-mono">Amman & Petra</span>
          </div>
        </div>

      </div>
    </footer>
  `;

  mountEl.querySelector('a[href^="https://wa.me/"]')?.setAttribute(
    'href',
    `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن حجوزات رحلات الأردن.')}`
  );
}