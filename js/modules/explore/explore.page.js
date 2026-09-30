/**
 * 🇯🇴 مشغل صفحة استكشاف الرحلات (Explore Page Controller)
 * يدير التفاعل بين عناصر التحكم ومحرك الفلترة وتحديث البطاقات في الوقت الفعلي
 */

import { filterEngine } from './filter.engine.js';
import { destinationsService } from '../../services/destinations.service.js';
import { store } from '../../state/store.js';

export async function initExplorePage() {
  let destinationsData = await destinationsService.getAll();
  const state = filterEngine.getDefaultState();

  // 1. قراءة معايير البحث من الرابط (URL Query Params)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('dest')) state.search = urlParams.get('dest').replace(/-/g, ' ');
  if (urlParams.get('cat') && urlParams.get('cat') !== 'all') state.categories.push(urlParams.get('cat'));

  // 2. العناصر الأساسية في واجهة DOM
  const searchInput = document.getElementById('explore-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const cardsGrid = document.getElementById('explore-cards-grid');
  const resultsCount = document.getElementById('results-count');
  const emptyBox = document.getElementById('empty-results-box');
  const chipsList = document.getElementById('chips-list');
  const clearAllChipsBtn = document.getElementById('btn-clear-all-chips');

  if (searchInput && state.search) {
    searchInput.value = state.search;
    clearSearchBtn?.classList.remove('hidden');
  }

  // 3. دالة رسم وتحديث شارات البحث النشطة (Active Chips)
  function renderActiveChips() {
    if (!chipsList) return;
    const chips = [];

    if (state.search.trim()) chips.push({ label: `بحث: "${state.search}"`, key: 'search' });
    state.types.forEach(t => chips.push({ label: t === 'guided' ? 'جولات مرخصة' : t === 'stays' ? 'إقامات صحراوية' : 'مواقع أثرية', key: 'type', val: t }));
    state.regions.forEach(r => chips.push({ label: r === 'south' ? 'جنوب الأردن' : r === 'central' ? 'وسط الأردن' : 'شمال الأردن', key: 'region', val: r }));
    state.categories.forEach(c => chips.push({ label: c, key: 'cat', val: c }));
    if (state.priceMin > 0 || state.priceMax < 250) {
      chips.push({ label: `السعر: ${state.priceMin} - ${state.priceMax} د.أ`, key: 'price' });
    }
    if (state.minRating !== 'any') {
      chips.push({ label: `تقييم: ${state.minRating}+ ★`, key: 'rating' });
    }

    if (chips.length > 0) {
      clearAllChipsBtn?.classList.remove('hidden');
      chipsList.innerHTML = chips.map(c => `
        <span class="inline-flex items-center gap-1.5 bg-[#E2E8F0] text-[#1E293B] rounded-full px-3 py-1 text-xs font-semibold">
          <span>${c.label}</span>
          <button type="button" class="remove-chip-btn text-[#64748B] hover:text-[#C86D51] cursor-pointer" data-key="${c.key}" data-val="${c.val || ''}">&times;</button>
        </span>
      `).join('');
    } else {
      clearAllChipsBtn?.classList.add('hidden');
      chipsList.innerHTML = '<span class="text-xs text-slate-400 font-normal">عرض كافة الرحلات دون قيود</span>';
    }

    // ربط نقر حذف الشارة الفردية
    chipsList.querySelectorAll('.remove-chip-btn').forEach(btn => {
      btn.onclick = () => {
        const k = btn.getAttribute('data-key');
        const v = btn.getAttribute('data-val');
        if (k === 'search') { state.search = ''; if (searchInput) searchInput.value = ''; }
        if (k === 'type') state.types = state.types.filter(x => x !== v);
        if (k === 'region') state.regions = state.regions.filter(x => x !== v);
        if (k === 'cat') state.categories = state.categories.filter(x => x !== v);
        if (k === 'price') { state.priceMin = 0; state.priceMax = 250; syncPriceInputs(); }
        if (k === 'rating') state.minRating = 'any';
        syncDomControlsWithState();
        renderView();
      };
    });
  }

  // 4. دالة رسم وتحديث البطاقات في الصفحة
  function renderView() {
    renderActiveChips();
    const filtered = filterEngine.applyFilters(destinationsData, state);

    if (resultsCount) resultsCount.textContent = filtered.length;

    if (filtered.length === 0) {
      if (cardsGrid) cardsGrid.innerHTML = '';
      emptyBox?.classList.remove('hidden');
      return;
    }

    emptyBox?.classList.add('hidden');
    if (!cardsGrid) return;

    cardsGrid.innerHTML = filtered.map(d => `
      <div onclick="window.location.href='attraction.html?id=${d.id}'" class="group w-full bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] hover:border-[#E5C598] transition-all duration-300 shadow-soft-card hover:shadow-floating-modal flex flex-col cursor-pointer">
        <div class="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
          <img src="${d.imageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
          <div class="absolute top-3 start-3 z-10 flex flex-col gap-1.5">
            <span class="bg-[#1E293B]/85 backdrop-blur-md text-[#FAF8F5] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10 shadow-xs">
              ${d.isUnesco ? 'تراث عالمي (اليونسكو)' : 'رحلة معتمدة'}
            </span>
            ${d.discountPercent ? `<span class="bg-[#C86D51] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">-${d.discountPercent}% خصم</span>` : ''}
            <span class="bg-amber-100/95 text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">🪙 +${d.rewardPoints || 150} XP</span>
          </div>
        </div>

        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 text-xs text-[#64748B] mb-2 font-medium">
              <span class="text-[#C86D51] font-semibold flex items-center gap-1">
                <i class="fa-solid fa-location-dot"></i> ${d.region.ar}
              </span>
              <span>•</span>
              <span><i class="fa-regular fa-clock"></i> ${d.duration.ar}</span>
            </div>

            <h3 class="text-[17px] font-bold text-[#1E293B] group-hover:text-[#C86D51] transition-colors leading-snug line-clamp-2 mb-2 font-arabic">
              ${d.title.ar}
            </h3>

            <div class="flex items-center gap-1.5 text-xs mb-3 text-[#D97706]">
              <i class="fa-solid fa-star"></i>
              <span class="font-bold text-[#1E293B] font-mono">${d.rating}</span>
              <span class="text-[#64748B]">(${d.reviewsCount} تقييم)</span>
            </div>
          </div>

          <div class="pt-3 border-t border-[#E2E8F0] flex items-end justify-between">
            <div>
              <span class="text-[10px] text-[#64748B] block">ابتداءً من:</span>
              <div class="flex items-baseline gap-1">
                <span class="text-[20px] font-bold text-[#C86D51] font-mono">${d.priceJOD} د.أ</span>
                ${d.originalPriceJOD ? `<span class="text-xs text-[#64748B] line-through font-mono">${d.originalPriceJOD} د.أ</span>` : ''}
              </div>
            </div>
            <button onclick="event.stopPropagation(); window.location.href='checkout.html?dest=${d.id}'" class="rounded-full bg-[#C86D51] hover:bg-[#B45A3E] text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer">
              احجز الآن
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 5. ربط أحداث الإدخال
  searchInput?.addEventListener('input', (e) => {
    state.search = e.target.value;
    clearSearchBtn?.classList.toggle('hidden', !state.search);
    renderView();
  });

  clearSearchBtn?.addEventListener('click', () => {
    state.search = '';
    if (searchInput) searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    renderView();
  });

  document.querySelectorAll('.filter-type-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      state.types = Array.from(document.querySelectorAll('.filter-type-checkbox:checked')).map(c => c.value);
      renderView();
    });
  });

  document.querySelectorAll('.filter-region-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      state.regions = Array.from(document.querySelectorAll('.filter-region-checkbox:checked')).map(c => c.value);
      renderView();
    });
  });

  document.querySelectorAll('.filter-cat-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      state.categories = Array.from(document.querySelectorAll('.filter-cat-checkbox:checked')).map(c => c.value);
      renderView();
    });
  });

  // حاسبة الأسعار وسلايدر النطاق
  const minIn = document.getElementById('price-min-input');
  const maxIn = document.getElementById('price-max-input');
  const priceLbl = document.getElementById('price-range-label');

  function syncPriceInputs() {
    if (minIn) minIn.value = state.priceMin;
    if (maxIn) maxIn.value = state.priceMax;
    if (priceLbl) priceLbl.textContent = `${state.priceMin} - ${state.priceMax >= 250 ? '250+' : state.priceMax} د.أ`;
  }

  const handlePriceChange = () => {
    state.priceMin = parseInt(minIn?.value || '0', 10);
    state.priceMax = parseInt(maxIn?.value || '250', 10);
    syncPriceInputs();
    renderView();
  };

  minIn?.addEventListener('input', handlePriceChange);
  maxIn?.addEventListener('input', handlePriceChange);

  window.setPricePreset = (min, max) => {
    state.priceMin = min;
    state.priceMax = max;
    syncPriceInputs();
    renderView();
  };

  // أزرار التقييم الأدنى
  document.querySelectorAll('.rating-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rating-pill').forEach(b => b.classList.remove('active', 'bg-[#C86D51]', 'text-white'));
      btn.classList.add('active', 'bg-[#C86D51]', 'text-white');
      state.minRating = btn.getAttribute('data-rate');
      renderView();
    });
  });

  // قائمة الترتيب
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderView();
  });

  // إعادة ضبط الفلاتر
  const resetAll = () => {
    Object.assign(state, filterEngine.getDefaultState());
    if (searchInput) searchInput.value = '';
    clearSearchBtn?.classList.add('hidden');
    syncPriceInputs();
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    document.querySelector('.rating-pill[data-rate="any"]')?.click();
    renderView();
  };

  document.getElementById('btn-reset-filters-side')?.addEventListener('click', resetAll);
  document.getElementById('btn-reset-empty')?.addEventListener('click', resetAll);
  clearAllChipsBtn?.addEventListener('click', resetAll);

  function syncDomControlsWithState() {
    document.querySelectorAll('.filter-type-checkbox').forEach(c => c.checked = state.types.includes(c.value));
    document.querySelectorAll('.filter-region-checkbox').forEach(c => c.checked = state.regions.includes(c.value));
    document.querySelectorAll('.filter-cat-checkbox').forEach(c => c.checked = state.categories.includes(c.value));
  }

  // 6. تشغيل العرض المبدئي
  renderView();
  destinationsService.subscribe((updatedDestinations) => {
    destinationsData = updatedDestinations;
    renderView();
  });
}