/**
 * 🇯🇴 محرك الفلترة والفرز متعدد الأبعاد لمنصة Jordan Tour (Multi-Facet Filter Engine)
 * خوارزميات فرز وتصفية سريعة جداً تعمل في المتصفح بزمن استجابة أقل من 50ms
 */

export const filterEngine = {
  /**
   * الحالة الافتراضية للفلاتر
   */
  getDefaultState: function() {
    return {
      search: '',
      types: [],
      regions: [],
      categories: [],
      priceMin: 0,
      priceMax: 250,
      minRating: 'any',
      minReviews: 'any',
      sort: 'popular'
    };
  },

  /**
   * تطبيق كافة الفلاتر والفرز على مصفوفة الرحلات
   * @param {Array} items قائمة الرحلات الأصلية
   * @param {Object} state حالة الفلاتر الحالية
   * @returns {Array} القائمة المصفاة والمرتبة
   */
  applyFilters: function(items, state) {
    if (!Array.isArray(items)) return [];

    let result = [...items];

    // 1. التصفية بالبحث النصي (العنوان، الإقليم، الوصف)
    if (state.search && state.search.trim()) {
      const q = state.search.toLowerCase().trim();
      result = result.filter(item => {
        const titleAr = item.title?.ar?.toLowerCase() || '';
        const titleEn = item.title?.en?.toLowerCase() || '';
        const regionAr = item.region?.ar?.toLowerCase() || '';
        const descAr = item.description?.ar?.toLowerCase() || '';
        return titleAr.includes(q) || titleEn.includes(q) || regionAr.includes(q) || descAr.includes(q);
      });
    }

    // 2. نوع التجربة (Guided, Stays, Historic)
    if (state.types && state.types.length > 0) {
      result = result.filter(item => state.types.includes(item.experienceType));
    }

    // 3. المنطقة الجغرافية (South, Central, North)
    if (state.regions && state.regions.length > 0) {
      result = result.filter(item => state.regions.includes(item.regionZone));
    }

    // 4. الاهتمام / التصنيف (Adventure, Relaxation, Archaeology, Culinary, Luxury)
    if (state.categories && state.categories.length > 0) {
      result = result.filter(item => state.categories.includes(item.category));
    }

    // 5. نطاق السعر (حاسبة من وإلى)
    const minP = Number(state.priceMin) || 0;
    const maxP = Number(state.priceMax) || 250;
    result = result.filter(item => item.priceJOD >= minP && item.priceJOD <= maxP);

    // 6. التقييم الأدنى
    if (state.minRating && state.minRating !== 'any') {
      const minR = parseFloat(state.minRating);
      result = result.filter(item => (item.rating || 0) >= minR);
    }

    // 7. الترتيب الديناميكي
    switch (state.sort) {
      case 'price-asc':
        result.sort((a, b) => a.priceJOD - b.priceJOD);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceJOD - a.priceJOD);
        break;
      case 'rating-desc':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        break;
    }

    return result;
  }
};