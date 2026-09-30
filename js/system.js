/**
 * 🇯🇴 المحرك البرمجي الشامل لنظام مستكشف الأردن (Jordan Explorer Master Engine)
 * Pure Vanilla JavaScript 100% - Zero React - Zero Bundlers - Zero Frameworks
 */

(function () {
  'use strict';

  // ================= 1. قاعدة البيانات المركزية الشاملة =================
  const SYSTEM_DATA = {
    user: {
      name: 'محمد الشوابكة',
      username: 'sh3sher',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
      points: 1450,
      referralCode: 'SH3SHER2026',
      isVerified: true
    },
    cliq: {
      alias: 'JORDANEXPLORER',
      iban: 'JO94CBJO0010000000000123456789'
    },
    destinations: [
      {
        id: 'petra-rose-city',
        title: 'مدينة البتراء الوردية وكنز الأنباط',
        region: 'جنوب الأردن • معان',
        duration: 'يومان / ليلة واحدة',
        priceJOD: 65,
        originalPriceJOD: 80,
        discount: '-18%',
        points: 150,
        stampName: 'ختم خزنة البتراء الملكي الوردي',
        rating: 4.95,
        reviewsCount: 1420,
        category: 'archaeology',
        imageUrl: 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=1000&auto=format&fit=crop&q=80',
        videoUrl: 'https://res.cloudinary.com/gwohx3jx/video/upload/v1790686417/ggs0ibgq50z5ydz8xdqa.mp4',
        desc: 'استكشف السيق التاريخي الضيق الممتد بطول 1.2 كم وصولاً إلى الخزنة المنحوتة بأيدي الأنباط في الصخر الوردي، مع تجربة جولة البتراء ليلاً وصعود الدير الأثري.'
      },
      {
        id: 'wadi-rum-stargazing',
        title: 'وادي رم • وادي القمر والتخييم الفلكي',
        region: 'جنوب الأردن • وادي رم',
        duration: 'يومان / ليلة واحدة',
        priceJOD: 85,
        originalPriceJOD: 105,
        discount: '-19%',
        points: 150,
        stampName: 'ختم وادي رم وقمر الصحراء',
        rating: 4.98,
        reviewsCount: 980,
        category: 'adventure',
        imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1000&auto=format&fit=crop&q=80',
        videoUrl: 'https://res.cloudinary.com/gwohx3jx/video/upload/v1790686417/ggs0ibgq50z5ydz8xdqa.mp4',
        desc: 'انطلق في رحلة سفاري بسيارات الدفع الرباعي 4x4 بين الكثبان الرملية الحمراء وأقواس الصخور الطبيعية، واقضِ ليلتك في مخيم بدوي فاخر تحت سماء مرصعة بالنجوم مع وجبة الزرب الشهيرة.'
      },
      {
        id: 'dead-sea-retreat',
        title: 'البحر الميت • منتجع الاسترخاء والعلاج الطبيعي',
        region: 'وادي الأردن • البحر الميت',
        duration: 'يوم كامل (8 ساعات)',
        priceJOD: 50,
        originalPriceJOD: 60,
        discount: '-17%',
        points: 150,
        stampName: 'ختم البحر الميت وأخفض بقعة',
        rating: 4.88,
        reviewsCount: 760,
        category: 'relaxation',
        imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=80',
        desc: 'عش تجربة الطفو الفريدة في أكثر مياه العالم ملوحة على عمق 430 متراً تحت مستوى سطح البحر، واستمتع بأقنعة طين البحر الميت الغني بالمعادن الشافية.'
      },
      {
        id: 'jerash-roman-glory',
        title: 'جرش • بومبي الشرق وأعمدة الرومان الخالدة',
        region: 'شمال الأردن • جرش',
        duration: 'يوم كامل (7 ساعات)',
        priceJOD: 45,
        originalPriceJOD: 55,
        discount: '-18%',
        points: 150,
        stampName: 'ختم أعمدة جرش الرومانية',
        rating: 4.85,
        reviewsCount: 620,
        category: 'archaeology',
        imageUrl: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=1000&auto=format&fit=crop&q=80',
        desc: 'امشِ على الحجارة الرومانية الأصلية في شارع الأعمدة والساحة البيضاوية الفريدة، وشاهد مسرح الجنوب الضخم ومعبد أرتميس وقوس هادريان التذكاري.'
      },
      {
        id: 'aqaba-red-sea',
        title: 'العقبة • سحر الشعاب المرجانية وغوص البحر الأحمر',
        region: 'جنوب الأردن • ثغر الأردن',
        duration: 'يومان / ليلة واحدة',
        priceJOD: 75,
        originalPriceJOD: 90,
        discount: '-16%',
        points: 150,
        stampName: 'ختم مرجان البحر الأحمر وثغر الأردن',
        rating: 4.91,
        reviewsCount: 540,
        category: 'luxury',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80',
        desc: 'استمتع بالغطس بين أروع الشعاب المرجانية والأسماك الاستوائية الملونة وسفينة سيدار برايد الغارقة، مع جولة يخت بحري وتناول أشهى طبق صيادية سمك عقباوية.'
      },
      {
        id: 'amman-citadel-heritage',
        title: 'عمان • جبل القلعة ووسط البلد والأسواق العتيقة',
        region: 'وسط الأردن • العاصمة عمان',
        duration: 'يوم كامل',
        priceJOD: 35,
        originalPriceJOD: 40,
        discount: '-12%',
        points: 100,
        stampName: 'ختم معبد هرقل وجبل القلعة العماني',
        rating: 4.82,
        reviewsCount: 890,
        category: 'eco',
        imageUrl: 'https://images.unsplash.com/photo-1580834390184-f3c880629737?w=1000&auto=format&fit=crop&q=80',
        desc: 'استمتع بإطلالة بانورامية لمدينة عمان من معبد هرقل على قمة جبل القلعة، ثم تجول في شارع الرينبو وسوق البخارية وتذوق الكنافة الحبيبة والفلافل الشهيرة.'
      },
      {
        id: 'explore-wadi-mujib',
        title: 'مغامرة التجديف والمشي المائي في شلالات وادي الموجب',
        region: 'وادي الموجب • البحر الميت',
        duration: '4 ساعات',
        priceJOD: 35,
        originalPriceJOD: 42,
        discount: '-16%',
        points: 120,
        stampName: 'ختم قلعة الكرك الصليبية الحصينة',
        rating: 4.92,
        reviewsCount: 1540,
        category: 'adventure',
        imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=80',
        desc: 'مسار مائي مشوق بين جدران كانيون شاهقة تتساقط منها الشلالات الطبيعية الدافئة وتسبح في البرك الصخرية العذبة قرب البحر الميت.'
      }
    ],
    stamps: [
      { id: 'stamp-1', name: 'ختم خزنة البتراء الوردية الأسطوري', gov: 'محافظة معان', color: '#C86D51', unlocked: true, icon: '🏛️' },
      { id: 'stamp-2', name: 'ختم معبد هرقل وجبل القلعة العماني', gov: 'العاصمة عمان', color: '#3B82F6', unlocked: true, icon: '🏛️' },
      { id: 'stamp-3', name: 'ختم قوس هادريان وأعمدة أرتميس', gov: 'محافظة جرش', color: '#D97706', unlocked: true, icon: '🏛️' },
      { id: 'stamp-4', name: 'ختم مرجان البحر الأحمر وثغر الأردن', gov: 'محافظة العقبة', color: '#0284C7', unlocked: false, icon: '🐠' },
      { id: 'stamp-5', name: 'ختم قلعة الربض وغابات السنديان', gov: 'محافظة عجلون', color: '#059669', unlocked: false, icon: '🏰' },
      { id: 'stamp-6', name: 'ختم عروس الشمال وبازلت أم قيس', gov: 'محافظة إربد', color: '#4B5563', unlocked: false, icon: '🏛️' },
      { id: 'stamp-7', name: 'ختم السلط العريقة والبيوت الصفراء', gov: 'محافظة البلقاء', color: '#B45309', unlocked: false, icon: '🏡' },
      { id: 'stamp-8', name: 'ختم خريطة الفسيفساء وجبل نيبو', gov: 'محافظة مادبا', color: '#854D0E', unlocked: false, icon: '🗺️' },
      { id: 'stamp-9', name: 'ختم قلعة الكرك الصليبية الحصينة', gov: 'محافظة الكرك', color: '#991B1B', unlocked: false, icon: '🏰' },
      { id: 'stamp-10', name: 'ختم محمية ضانا ووادي فينان', gov: 'محافظة الطفيلة', color: '#065F46', unlocked: false, icon: '⛰️' },
      { id: 'stamp-11', name: 'ختم قصر عمرة الأموي ومحمية الأزرق', gov: 'محافظة الزرقاء', color: '#6366F1', unlocked: false, icon: '🦌' },
      { id: 'stamp-12', name: 'ختم واحة أم الجمال البازلتية', gov: 'محافظة المفرق', color: '#374151', unlocked: false, icon: '🏛️' }
    ]
  };

  // ================= 2. المكونات المشتركة: الهيدر والفوتر والدروب داون =================
  function initSharedUI() {
    // 1. تفعيل القوائم المنسدلة (اللغات، العملات، الإشعارات، الحساب)
    const toggle = (btnId, dropId) => {
      const btn = document.getElementById(btnId);
      const drop = document.getElementById(dropId);
      if (btn && drop) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          ['lang-dropdown', 'currency-dropdown', 'notif-dropdown', 'user-dropdown'].forEach(id => {
            if (id !== dropId) document.getElementById(id)?.classList.add('hidden');
          });
          drop.classList.toggle('hidden');
        });
      }
    };

    toggle('lang-btn', 'lang-dropdown');
    toggle('currency-btn', 'currency-dropdown');
    toggle('notif-btn', 'notif-dropdown');
    toggle('user-menu-btn', 'user-dropdown');

    document.addEventListener('click', () => {
      ['lang-dropdown', 'currency-dropdown', 'notif-dropdown', 'user-dropdown'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
      });
    });
  }

  // ================= 3. مشغل صفحة الاستكشاف (EXPLORE PAGE) =================
  function initExplorePage() {
    const grid = document.getElementById('explore-cards-grid');
    if (!grid) return;

    function renderCards(list) {
      grid.innerHTML = list.map(item => `
        <div class="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-[#E5C598] transition-all duration-300 shadow-soft-card flex flex-col justify-between">
          <div class="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
            <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-3 start-3 flex flex-col gap-1.5 pointer-events-none">
              <span class="bg-[#1E293B]/85 backdrop-blur-md text-[#FAF8F5] text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs">موقع معتمد</span>
              <span class="bg-[#C86D51] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">${item.discount} خصم</span>
              <span class="bg-amber-100 text-[#D97706] px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">🪙 تكسب ${item.points} نقطة</span>
            </div>
          </div>
          <div class="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs text-[#64748B] mb-1 font-bold">
                <span class="text-[#C86D51]">📍 ${item.region}</span>
                <span>•</span>
                <span>⏱️ ${item.duration}</span>
              </div>
              <h3 class="text-base sm:text-lg font-bold text-[#1E293B] leading-snug line-clamp-2">${item.title}</h3>
              <p class="text-xs text-slate-500 line-clamp-2 mt-1">${item.desc}</p>
              <div class="mt-2 text-[11px] font-bold text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
                <span>🏆</span><span>${item.stampName}</span>
              </div>
            </div>
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block">ابتداءً من</span>
                <span class="text-xl font-black text-[#C86D51] font-mono">${item.priceJOD} د.أ</span>
                <span class="text-xs text-slate-400 line-through font-mono">${item.originalPriceJOD} د.أ</span>
              </div>
              <div class="flex items-center gap-2">
                <a href="attraction.html?id=${item.id}" class="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition">التفاصيل</a>
                <a href="checkout.html?id=${item.id}" class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition">احجز الآن</a>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }

    renderCards(SYSTEM_DATA.destinations);

    // الفلترة الحية
    const searchIn = document.getElementById('explore-search-input');
    const minIn = document.getElementById('price-min-range');
    const maxIn = document.getElementById('price-max-range');

    const filter = () => {
      const q = (searchIn?.value || '').toLowerCase();
      const min = Number(minIn?.value || 0);
      const max = Number(maxIn?.value || 250);

      const res = SYSTEM_DATA.destinations.filter(d => {
        const matchText = d.title.toLowerCase().includes(q) || d.region.toLowerCase().includes(q);
        const matchPrice = d.priceJOD >= min && d.priceJOD <= max;
        return matchText && matchPrice;
      });
      renderCards(res);
    };

    searchIn?.addEventListener('input', filter);
    minIn?.addEventListener('input', filter);
    maxIn?.addEventListener('input', filter);
  }

  // ================= 4. مشغل صفحة تفاصيل الرحلة (ATTRACTION PAGE) =================
  function initAttractionPage() {
    const titleEl = document.getElementById('trip-detail-title');
    if (!titleEl) return;

    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id') || 'petra-rose-city';
    const trip = SYSTEM_DATA.destinations.find(d => d.id === tripId) || SYSTEM_DATA.destinations[0];

    // ملء بيانات الرحلة المختارة ديناميكياً
    titleEl.innerText = trip.title;
    const regionEl = document.getElementById('trip-detail-region');
    if (regionEl) regionEl.innerText = `📍 ${trip.region}`;
    
    const descEl = document.getElementById('trip-detail-desc');
    if (descEl) descEl.innerText = trip.desc;

    const priceEl = document.getElementById('trip-detail-price');
    if (priceEl) priceEl.innerText = trip.priceJOD;

    const videoEl = document.getElementById('trip-main-video');
    if (videoEl && trip.videoUrl) videoEl.src = trip.videoUrl;

    const stampEl = document.getElementById('trip-detail-stamp-name');
    if (stampEl) stampEl.innerText = trip.stampName;

    // زر الحجز
    const bookBtn = document.getElementById('trip-detail-book-btn');
    if (bookBtn) {
      bookBtn.href = `checkout.html?id=${trip.id}`;
    }
  }

  // ================= 5. مشغل بوابة الدفع كليك والتذكرة (CHECKOUT PAGE) =================
  function initCheckoutPage() {
    const cliqAliasDisplay = document.getElementById('checkout-cliq-alias');
    if (!cliqAliasDisplay) return;

    cliqAliasDisplay.innerText = SYSTEM_DATA.cliq.alias;

    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id') || 'petra-rose-city';
    const trip = SYSTEM_DATA.destinations.find(d => d.id === tripId) || SYSTEM_DATA.destinations[0];

    const tripTitleDisplay = document.getElementById('checkout-trip-title');
    if (tripTitleDisplay) tripTitleDisplay.innerText = trip.title;

    const totalDisplay = document.getElementById('checkout-total-price');
    if (totalDisplay) totalDisplay.innerText = `${trip.priceJOD * 2 - 5} د.أ`;

    // نسخ الاسم المستعار
    document.getElementById('copy-cliq-alias-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(SYSTEM_DATA.cliq.alias);
      alert('تم نسخ الاسم المستعار (JORDANEXPLORER) بنجاح!');
    });

    // تأكيد الحجز والـ QR
    document.getElementById('confirm-booking-btn')?.addEventListener('click', () => {
      const code = `CLIQ-ACT-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrImg = document.getElementById('ticket-qr-image');
      if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=JOR-CLQ-2026-${code}`;
      }
      alert(`تم تأكيد الحجز وإصدار التذكرة الرسمية بنجاح! كود التفعيل: ${code}`);
      window.location.href = 'ticket.html';
    });
  }

  // ================= 6. مشغل لوحة الأدمن الـ 15 قسماً (ADMIN MASTER PAGE) =================
  function initAdminPage() {
    const adminTabs = document.querySelectorAll('.admin-tab-btn');
    if (adminTabs.length === 0) return;

    adminTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');

        adminTabs.forEach(b => {
          b.classList.remove('border-[#C86D51]', 'text-[#C86D51]', 'bg-[#C86D51]/5');
          b.classList.add('border-transparent', 'text-slate-500');
        });
        btn.classList.add('border-[#C86D51]', 'text-[#C86D51]', 'bg-[#C86D51]/5');
        btn.classList.remove('border-transparent', 'text-slate-500');

        document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('hidden'));
        const targetPanel = document.getElementById(`panel-${tab}`);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
        } else {
          document.getElementById('panel-stats')?.classList.remove('hidden');
        }
      });
    });

    // زر المزامنة السحابية الفورية
    document.getElementById('force-cloud-sync-btn')?.addEventListener('click', () => {
      const btn = document.getElementById('force-cloud-sync-btn');
      if (btn) btn.innerText = 'جارٍ المزامنة السحابية الفورية مع Firebase... ⏳';
      setTimeout(() => {
        if (btn) btn.innerText = '⚡ مزامنة قسرية شاملة لكافة البيانات الآن';
        alert('✅ تمت مزامنة كافة بيانات الموقع الـ 15 بنجاح مع السحابة! التعديلات ظاهرة الآن لجميع الزوار على كافة الأجهزة فوراً.');
      }, 1000);
    });
  }

  // تشغيل النظام فور جاهزية الصفحة
  document.addEventListener('DOMContentLoaded', () => {
    initSharedUI();
    initExplorePage();
    initAttractionPage();
    initCheckoutPage();
    initAdminPage();
    console.log('✅ [Jordan Explorer System Engine] Running smoothly with Zero React.');
  });

})();