/**
 * 🇯🇴 مشغل صفحة تفاصيل الرحلة والمعالم (Attraction Page Controller)
 * ينسق الفيديو 4K، المعرض، محطات المعالم، الخط الزمني، وحاسبة الحجز الجانبية
 */

import { destinationsService } from '../../services/destinations.service.js';
import { firebaseService } from '../../services/firebase.service.js';
import { store } from '../../state/store.js';
import { galleryModal } from './gallery-modal.js';
import { audioService } from '../../services/audio.service.js';

export async function initAttractionPage() {
  // 1. جلب معرف الرحلة من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id') || 'petra-rose-city';
  const destinationsData = await destinationsService.getAll();
  const landmarkSettings = await firebaseService.getSettingsDocument('landmarks_data');
  const trip = destinationsData.find(d => d.id === tripId) || destinationsData[0];

  // 2. تحديث العناوين والبيانات الوصفية
  document.title = `${trip.title?.ar || 'تفاصيل الرحلة'} | Jordan Tour`;

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  };

  setText('trip-main-title', trip.title?.ar);
  setText('bc-title', trip.title?.ar);
  setText('bc-region', trip.region?.ar);
  setText('trip-region-val', trip.region?.ar);
  setText('trip-duration-val', trip.duration?.ar);
  setText('trip-rating-val', trip.rating || 4.95);
  setText('trip-long-desc', trip.description?.ar);

  // شارة اليونسكو
  const unescoPill = document.getElementById('unesco-pill');
  if (unescoPill) {
    unescoPill.classList.toggle('hidden', !trip.isUnesco);
  }

  // 3. الأسعار والخصومات
  const adultPrice = Number(trip.priceJOD) || 65;
  const childPrice = Number(trip.childPriceJOD) || Math.round(adultPrice * 0.6);
  const origPrice = Number(trip.originalPriceJOD) || Math.round(adultPrice * 1.25);
  const discount = trip.discountPercent || Math.round(((origPrice - adultPrice) / origPrice) * 100);

  setText('side-price-val', adultPrice);
  setText('side-adult-price', `${adultPrice} د.أ`);
  setText('side-child-price', `${childPrice} د.أ`);
  setText('side-orig-price', `${origPrice} د.أ`);
  setText('side-discount-badge', `-${discount}% خصم`);

  // 4. مشغل الفيديو السينمائي 4K
  const videoEl = document.getElementById('trip-video-player');
  const playBtn = document.getElementById('btn-video-play');
  const playIcon = document.getElementById('vid-play-icon');
  const soundBtn = document.getElementById('btn-video-sound');
  const soundIcon = document.getElementById('vid-sound-icon');

  if (videoEl) {
    videoEl.poster = trip.imageUrl || 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=1400';
    if (trip.videoUrl) videoEl.src = trip.videoUrl;

    playBtn?.addEventListener('click', () => {
      audioService.initContext();
      if (videoEl.paused) {
        videoEl.play();
        if (playIcon) playIcon.className = 'fa-solid fa-pause text-2xl';
      } else {
        videoEl.pause();
        if (playIcon) playIcon.className = 'fa-solid fa-play text-2xl ms-1';
      }
    });

    soundBtn?.addEventListener('click', () => {
      videoEl.muted = !videoEl.muted;
      if (soundIcon) {
        soundIcon.className = videoEl.muted ? 'fa-solid fa-volume-xmark text-xs' : 'fa-solid fa-volume-high text-xs';
      }
    });
  }

  // 5. معرض الصور المصغرة وفتحه بملء الشاشة
  const gallery = trip.gallery && trip.gallery.length > 0 ? trip.gallery : [
    { url: trip.imageUrl, title: { ar: 'الواجهة الرئيسية' } },
    { url: 'https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800', title: { ar: 'مسار السيق' } },
    { url: 'https://images.unsplash.com/photo-1580834341580-8c17a3a632ec?w=800', title: { ar: 'صرح الدير' } },
    { url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', title: { ar: 'شاي بدوي على الحطب' } },
    { url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800', title: { ar: 'القبور الملكية' } }
  ];

  const thumbsGrid = document.getElementById('gallery-thumbs-grid');
  if (thumbsGrid) {
    thumbsGrid.innerHTML = gallery.map((img, i) => `
      <div class="gallery-thumb-item relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-slate-200 hover:border-[#C86D51] transition-all group" data-idx="${i}">
        <img src="${img.url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors"></div>
        ${i === 4 ? `
          <div class="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white font-bold text-xs">
            <span class="text-base font-black font-mono">+12</span>
            <span>صور إضافية</span>
          </div>
        ` : ''}
      </div>
    `).join('');

    thumbsGrid.querySelectorAll('.gallery-thumb-item').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        galleryModal.open(gallery, idx);
      };
    });
  }

  // 6. المزايا السريعة (Highlights)
  const highlights = trip.highlights?.ar || ['مرشد سياحي مرخص', 'تذكرة الدخول الرسمية', 'وجبة غداء تراثية', 'تنقلات مريحة ومكيفة'];
  const pillsBox = document.getElementById('trip-highlights-pills');
  if (pillsBox) {
    pillsBox.innerHTML = highlights.map(h => `
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs">
        <i class="fa-solid fa-sparkles text-[#D97706]"></i>
        <span>${h}</span>
      </span>
    `).join('');
  }

  // 7. محطات ومعالم الجولة الأربعة الرئيسية
  const managedLandmarks = (landmarkSettings?.list || []).filter(lm => lm.governorateId === trip.governorateId);
  const landmarks = Array.isArray(trip.landmarks) ? trip.landmarks : managedLandmarks.length > 0 ? managedLandmarks.map(lm => ({ ...lm, image: lm.image || lm.img })) : [
    { id: 'lm-1', name: { ar: 'السيق الصخري' }, tag: { ar: 'الممر الطبيعي' }, desc: { ar: 'ممر صخري طبيعي بطول 1.2 كم يلتوي بين جدران بارتفاع 80 متراً نحو الخزينة.' }, image: 'https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=600' },
    { id: 'lm-2', name: { ar: 'خزينة الفرعون' }, tag: { ar: 'الواجهة الملكية' }, desc: { ar: 'واجهة هلنستية نبطية أسطورية من القرن الأول الميلادي منحوتة بإتقان في الصخر.' }, image: 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=600' },
    { id: 'lm-3', name: { ar: 'القبور الملكية' }, tag: { ar: 'صروح الملوك' }, desc: { ar: 'ضريح الجرة والقبر الكورنثي المنحوتان في الجروف الصخرية بألوان معدنية بديعة.' }, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600' },
    { id: 'lm-4', name: { ar: 'صرح الدير الأثري' }, tag: { ar: 'قمة الجبل' }, desc: { ar: 'صرح أثري مهيب في قمة الجبل يمكن الوصول إليه عبر 800 درجة صخرية.' }, image: 'https://images.unsplash.com/photo-1580834341580-8c17a3a632ec?w=600' },
  ];

  const lmCardsGrid = document.getElementById('landmarks-cards-grid');
  if (lmCardsGrid) {
    lmCardsGrid.innerHTML = landmarks.map((lm, i) => `
      <div class="landmark-card-item bg-[#FAF8F5] rounded-2xl border border-slate-200 p-3.5 space-y-2 cursor-pointer hover:border-[#C86D51] hover:shadow-md transition-all flex flex-col justify-between" data-lmid="${lm.id}">
        <div class="space-y-2">
          <div class="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900">
            <img src="${lm.image || lm.img}" class="w-full h-full object-cover">
            <span class="absolute top-2 start-2 bg-black/70 text-[#E5C598] text-[10px] font-mono font-bold px-2 py-0.5 rounded">0${i + 1}</span>
          </div>
          <span class="text-[10px] font-mono text-[#D97706] font-bold block">${lm.tag?.ar || lm.tag}</span>
          <h4 class="font-extrabold text-sm text-[#1E293B]">${lm.name?.ar || lm.name}</h4>
          <p class="text-xs text-[#64748B] line-clamp-3">${lm.desc?.ar || lm.desc}</p>
        </div>
        <div class="pt-2 border-t border-slate-200 text-[11px] font-bold text-[#C86D51] flex items-center justify-between">
          <span>التفاصيل الكاملة ←</span>
          <i class="fa-solid fa-sparkles text-amber-500"></i>
        </div>
      </div>
    `).join('');

    lmCardsGrid.querySelectorAll('.landmark-card-item').forEach(card => {
      card.onclick = () => {
        const id = card.getAttribute('data-lmid');
        const found = landmarks.find(l => l.id === id);
        if (found) galleryModal.openLandmark(found);
      };
    });
  }

  // 8. الخط الزمني للرحلة (Itinerary)
  const itinerary = trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : [
    { time: '07:30 ص', activity: { ar: 'الاستقبال والتجمع' }, description: { ar: 'الالتقاء بالسائق المعتمد وصعود الحافلة المريحة.' } },
    { time: '08:30 ص', activity: { ar: 'عبور السيق مع المرشد' }, description: { ar: 'جولة مشي وشروحات أثرية حصرية حول قنوات المياه النبطية.' } },
    { time: '10:00 ص', activity: { ar: 'الوصول للخزينة وجلسة التصوير' }, description: { ar: 'استكشاف باحة الخزينة في أفضل توقيت إضاءة وشرح أسرارها.' } },
    { time: '01:00 م', activity: { ar: 'وجبة الغداء التراثي (المنسف)' }, description: { ar: 'بوفيه غداء أردني فاخر يضم المنسف البلدي والمقبلات.' } },
    { time: '03:00 م', activity: { ar: 'صعود درجات الدير البانورامية' }, description: { ar: 'تسلق الدرجات الحجرية نحو دير البتراء وإطلالة وادي عربة.' } },
    { time: '05:30 م', activity: { ar: 'الشاي البدوي وغروب الشمس' }, description: { ar: 'جلسة عربية حول نار الحطب مع الشاي المعطر قبل العودة.' } }
  ];

  const timelineContainer = document.getElementById('itinerary-timeline-container');
  if (timelineContainer) {
    timelineContainer.innerHTML = itinerary.map((step, i) => `
      <div class="relative">
        <div class="absolute -start-[31px] sm:-start-[39px] top-1 w-7 h-7 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold text-xs border-2 border-white ring-2 ring-[#D97706]/40">
          ${i + 1}
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs">
          <span class="font-mono text-xs font-bold text-[#C86D51] bg-[#C86D51]/10 px-2.5 py-0.5 rounded-md">${step.time}</span>
          <h4 class="font-bold text-sm sm:text-base text-[#1E293B] mt-1 mb-0.5">${step.activity?.ar || step.activity}</h4>
          <p class="text-xs text-[#64748B]">${step.description?.ar || step.description}</p>
        </div>
      </div>
    `).join('');
  }

  // 9. المشمول وغير المشمول
  const included = trip.includedServices?.ar || ['تذكرة الدخول الرسمية ومحمية الموقع', 'مرشد سياحي محلي مرخص بالعربية والإنجليزية', 'وجبة غداء تقليدية ساخنة من الأكلات الأردنية', 'نقل حديث ومكيف من وإلى نقطة التجمع'];
  const excluded = trip.excludedServices?.ar || ['ركوب الخيل أو الجمال أو الدواب الخاصة', 'المشتريات والتذكارات الشخصية', 'إكراميات طاقم الإرشاد والخدمة', 'تأمين السفر الصحي الدولي'];

  const incList = document.getElementById('included-list');
  const excList = document.getElementById('excluded-list');
  if (incList) incList.innerHTML = included.map(s => `<li class="flex items-start gap-2"><i class="fa-solid fa-check text-emerald-600 mt-1"></i><span>${s}</span></li>`).join('');
  if (excList) excList.innerHTML = excluded.map(s => `<li class="flex items-start gap-2"><i class="fa-solid fa-xmark text-rose-500 mt-1"></i><span>${s}</span></li>`).join('');

  // 10. شارة الختم التراثي
  const stampName = trip.stampName || 'الختم النبطي الملكي';
  setText('stamp-section-title', stampName);
  setText('banner-stamp-name', `يفتح ${stampName} في جوازك الرقمي`);

  // 11. الشريط الجانبي الثابت (Sticky Booking Sidebar)
  const dates = trip.availableDates || ['2026-10-15', '2026-10-22', '2026-10-29', '2026-11-05'];
  let selectedDate = dates[0];
  const datesGrid = document.getElementById('available-dates-grid');

  if (datesGrid) {
    datesGrid.innerHTML = dates.map((d, i) => `
      <button type="button" class="side-date-btn ${i === 0 ? 'bg-[#C86D51] text-white border-[#C86D51]' : 'bg-[#FAF8F5] text-slate-700 border-slate-200'} p-2 rounded-xl text-xs font-mono font-bold text-center border cursor-pointer transition-all" data-date="${d}">
        ${d}
      </button>
    `).join('');

    datesGrid.querySelectorAll('.side-date-btn').forEach(btn => {
      btn.onclick = () => {
        datesGrid.querySelectorAll('.side-date-btn').forEach(b => b.className = 'side-date-btn bg-[#FAF8F5] text-slate-700 border-slate-200 p-2 rounded-xl text-xs font-mono font-bold text-center border cursor-pointer transition-all');
        btn.className = 'side-date-btn bg-[#C86D51] text-white border-[#C86D51] p-2 rounded-xl text-xs font-mono font-bold text-center border cursor-pointer transition-all';
        selectedDate = btn.getAttribute('data-date');
      };
    });
  }

  const times = trip.departureTimes || ['07:00 ص', '08:30 ص', '01:00 م'];
  let selectedTime = times[0];
  const timesGrid = document.getElementById('departure-times-grid');

  if (timesGrid) {
    timesGrid.innerHTML = times.map((t, i) => `
      <button type="button" class="side-time-btn ${i === 0 ? 'bg-[#1E293B] text-white border-[#1E293B]' : 'bg-[#FAF8F5] text-slate-700 border-slate-200'} py-2 px-1 text-center rounded-xl text-xs font-bold border cursor-pointer transition-all" data-time="${t}">
        ${t}
      </button>
    `).join('');

    timesGrid.querySelectorAll('.side-time-btn').forEach(btn => {
      btn.onclick = () => {
        timesGrid.querySelectorAll('.side-time-btn').forEach(b => b.className = 'side-time-btn bg-[#FAF8F5] text-slate-700 border-slate-200 py-2 px-1 text-center rounded-xl text-xs font-bold border cursor-pointer transition-all');
        btn.className = 'side-time-btn bg-[#1E293B] text-white border-[#1E293B] py-2 px-1 text-center rounded-xl text-xs font-bold border cursor-pointer transition-all';
        selectedTime = btn.getAttribute('data-time');
      };
    });
  }

  // عداد الضيوف وحساب المجموع اللحظي والنقاط المكتسبة
  let guestsCount = 2;
  const countDisplay = document.getElementById('side-guests-count');
  const subtotalDisplay = document.getElementById('side-subtotal-calc');
  const indicatorDisplay = document.getElementById('guests-indicator');
  const totalDisplay = document.getElementById('side-total-price');
  const xpDisplay = document.getElementById('side-xp-earn');

  const recalculateBooking = () => {
    const total = adultPrice * guestsCount;
    if (countDisplay) countDisplay.textContent = `${guestsCount} بالغين`;
    if (subtotalDisplay) subtotalDisplay.textContent = `${adultPrice} د.أ × ${guestsCount}`;
    if (indicatorDisplay) indicatorDisplay.textContent = `${guestsCount} ضيوف`;
    if (totalDisplay) totalDisplay.textContent = `${total} د.أ`;
    if (xpDisplay) xpDisplay.textContent = `تكسب: ${guestsCount * (trip.rewardPoints || 150)} نقطة لـ ${guestsCount} مسافرين`;
  };

  document.getElementById('side-plus-guests')?.addEventListener('click', () => {
    if (guestsCount < 10) { guestsCount++; recalculateBooking(); }
  });

  document.getElementById('side-minus-guests')?.addEventListener('click', () => {
    if (guestsCount > 1) { guestsCount--; recalculateBooking(); }
  });

  // 12. زر الانتقال إلى الدفع عبر كليك (Checkout Gate)
  document.getElementById('btn-proceed-checkout')?.addEventListener('click', () => {
    // التحقق من تسجيل الدخول: التصفح حر، ولكن الحجز يتطلب حساباً لحفظ التذكرة والأختام!
    if (!store.user && !window.JordanFirebase?.auth?.currentUser) {
      alert('يرجى تسجيل الدخول أو إنشاء حساب أولاً لحفظ تذكرتك وتثبيت ختم المحافظة في جوازك الرقمي!');
      if (window.authModal) {
        window.authModal.show('login');
      }
      return;
    }

    const checkoutUrl = `checkout.html?dest=${trip.id}&date=${selectedDate}&time=${encodeURIComponent(selectedTime)}&guests=${guestsCount}`;
    window.location.href = checkoutUrl;
  });

  // المفضلة والمشاركة
  const heartBtn = document.getElementById('btn-toggle-wishlist');
  const heartIcon = document.getElementById('heart-icon');
  heartBtn?.addEventListener('click', () => {
    heartIcon?.classList.toggle('fa-solid');
    heartIcon?.classList.toggle('fa-regular');
    heartIcon?.classList.toggle('text-rose-600');
  });

  document.getElementById('btn-share-trip')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: trip.title?.ar, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط الرحلة إلى الحافظة بنجاح!');
    }
  });

  // التشغيل الأولي
  recalculateBooking();
}