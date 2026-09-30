/**
 * 🇯🇴 الكتالوج الشامل للرحلات والتجارب السياحية في الأردن (18 رحلة متكاملة)
 * يتضمن كامل التفاصيل: الأسعار، الخصومات، المواعيد، الجداول الزمنية، وما تشمله وما لا تشمله
 */

export const destinationsData = [
  // 1. رحلة البتراء الكاملة
  {
    id: "petra-rose-city",
    title: {
      ar: "مدينة البتراء الوردية وكنز الأنباط",
      en: "Petra Rose City & Treasury by Candlelight"
    },
    subtitle: {
      ar: "إحدى عجائب الدنيا السبع المنحوتة في الصخر",
      en: "One of the New 7 Wonders of the World"
    },
    description: {
      ar: "استكشف السيق التاريخي الضيق الممتد بطول 1.2 كم وصولاً إلى الخزنة المنحوتة بأيدي الأنباط في الصخر الوردي، مع تجربة جولة البتراء ليلاً تحت أضواء 1500 شمعة.",
      en: "Walk through the 1.2km mystical Siq canyon opening up to the majestic Hellenistic Al-Khazneh Treasury carved into rose-red rock."
    },
    region: { ar: "جنوب الأردن • معان", en: "South Jordan • Ma'an" },
    governorateId: "maan",
    regionZone: "south",
    duration: { ar: "يومان / ليلة واحدة", en: "2 Days / 1 Night" },
    priceJOD: 65,
    originalPriceJOD: 80,
    discountPercent: 18,
    adultPriceJOD: 65,
    childPriceJOD: 35,
    rewardPoints: 200,
    stampName: "ختم خزنة البتراء الوردية الأسطوري",
    rating: 4.95,
    reviewsCount: 1420,
    isUnesco: true,
    category: "archaeology",
    experienceType: "guided",
    availableDates: ["2026-10-15", "2026-10-22", "2026-10-29", "2026-11-05"],
    departureTimes: ["07:00 ص", "08:30 ص", "01:00 م"],
    highlights: {
      ar: ["السيق والخزنة", "جولة الشموع الليلية", "الدير والمسرح النبطي", "غداء بدوي تقليدي"],
      en: ["The Siq & Treasury", "Petra by Night Candles", "The Monastery & Theater", "Bedouin Feast"]
    },
    artType: "petra",
    imageUrl: "https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    coordinates: { lat: 30.3285, lng: 35.4444 },
    itinerary: [
      { time: "07:30 ص", activity: { ar: "الاستقبال والتجمع" }, description: { ar: "الالتقاء بالسائق المعتمد وصعود الحافلة المريحة." } },
      { time: "08:30 ص", activity: { ar: "عبور السيق مع المرشد" }, description: { ar: "جولة مشي وشروحات أثرية حصرية حول قنوات المياه النبطية." } },
      { time: "10:00 ص", activity: { ar: "الوصول للخزينة وجلسة التصوير" }, description: { ar: "استكشاف باحة الخزينة في أفضل توقيت إضاءة وشرح أسرارها." } },
      { time: "01:00 م", activity: { ar: "وجبة الغداء التراثي (المنسف)" }, description: { ar: "بوفيه غداء أردني فاخر يضم المنسف البلدي والمقبلات." } },
      { time: "03:00 م", activity: { ar: "صعود درجات الدير البانورامية" }, description: { ar: "تسلق الدرجات الحجرية نحو دير البتراء وإطلالة وادي عربة." } },
      { time: "05:30 م", activity: { ar: "الشاي البدوي وغروب الشمس" }, description: { ar: "جلسة عربية حول نار الحطب مع الشاي المعطر قبل العودة." } }
    ],
    includedServices: {
      ar: ["تذكرة الدخول الرسمية ومحمية الموقع", "مرشد سياحي محلي مرخص بالعربية والإنجليزية", "وجبة غداء تقليدية ساخنة من الأكلات الأردنية", "نقل حديث ومكيف من وإلى نقطة التجمع"]
    },
    excludedServices: {
      ar: ["ركوب الخيل أو الجمال أو الدواب الخاصة", "المشتريات والتذكارات الشخصية", "إكراميات طاقم الإرشاد والخدمة"]
    }
  },

  // 2. سفاري وادي رم والتخييم الفلكي
  {
    id: "wadi-rum-stargazing",
    title: {
      ar: "وادي رم • وادي القمر والتخييم الفلكي",
      en: "Wadi Rum Desert • Valley of the Moon Expedition"
    },
    subtitle: {
      ar: "رمال حمراء شاسعة ومخيمات القبب الفضائية الفاخرة",
      en: "Vast red dunes, Martian canyons & luxury bubble tents"
    },
    description: {
      ar: "انطلق في رحلة سفاري بسيارات الدفع الرباعي 4x4 بين الكثبان الرملية الحمراء وأقواس الصخور الطبيعية، واقضِ ليلتك في مخيم بدوي فاخر تحت سماء مرصعة بملايين النجوم مع وجبة الزرب الشهيرة.",
      en: "Embark on a 4x4 off-road safari across crimson sand dunes and natural rock bridges, staying overnight in a luxury Martian dome."
    },
    region: { ar: "جنوب الأردن • وادي رم", en: "South Jordan • Wadi Rum" },
    governorateId: "maan",
    regionZone: "south",
    duration: { ar: "يومان / ليلة واحدة", en: "2 Days / 1 Night" },
    priceJOD: 85,
    originalPriceJOD: 105,
    discountPercent: 19,
    adultPriceJOD: 85,
    childPriceJOD: 45,
    rewardPoints: 180,
    stampName: "ختم خزنة البتراء الوردية الأسطوري",
    rating: 4.98,
    reviewsCount: 980,
    isUnesco: true,
    category: "adventure",
    experienceType: "stays",
    availableDates: ["2026-10-18", "2026-10-25", "2026-11-01"],
    departureTimes: ["08:00 ص", "02:00 م"],
    highlights: {
      ar: ["سفاري 4x4 في الكثبان", "عشاء الزرب المدفون بالرمال", "رصد المجرة والنجوم بتلسكوب", "ركوب الجمال عند الشروق"],
      en: ["4x4 Dune Bashing", "Underground Zarb Feast", "Stargazing", "Sunrise Camel Trek"]
    },
    artType: "wadirum",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    coordinates: { lat: 29.5768, lng: 35.4192 }
  },

  // 3. منتجع البحر الميت والسبا
  {
    id: "dead-sea-retreat",
    title: {
      ar: "البحر الميت • منتجع الاسترخاء والعلاج الطبيعي",
      en: "Dead Sea Wellness & Mineral Floating Sanctuary"
    },
    subtitle: {
      ar: "أخفض نقطة على سطح الأرض وغنى المعادن النادرة",
      en: "Lowest point on Earth & natural therapeutic spa waters"
    },
    description: {
      ar: "عش تجربة الطفو الفريدة في أكثر مياه العالم ملوحة على عمق 430 متراً تحت مستوى سطح البحر، واستمتع بأقنعة طين البحر الميت الغني بالمعادن الشافية مع إطلالة غروب ساحرة.",
      en: "Experience effortless floating on hypersaline turquoise waters 430m below sea level, rejuvenating your skin with therapeutic black mud."
    },
    region: { ar: "وسط الأردن • البحر الميت", en: "Central Jordan • Dead Sea" },
    governorateId: "balqa",
    regionZone: "central",
    duration: { ar: "يوم كامل (8 ساعات)", en: "Full Day Experience" },
    priceJOD: 50,
    originalPriceJOD: 60,
    discountPercent: 16,
    adultPriceJOD: 50,
    childPriceJOD: 25,
    rewardPoints: 130,
    stampName: "ختم السلط العريقة والبيوت الصفراء",
    rating: 4.88,
    reviewsCount: 760,
    isUnesco: false,
    category: "relaxation",
    experienceType: "stays",
    availableDates: ["2026-10-16", "2026-10-23", "2026-10-30"],
    departureTimes: ["08:30 ص", "10:00 ص"],
    highlights: {
      ar: ["طفو طبيعي بلا جهد", "حمام الطين الأسود المعدني", "جلسة مساج وسبا شاطئي", "بوفيه عشاء أردني على الشاطئ"],
      en: ["Natural Float", "Black Mineral Mud", "Seaside Spa", "Jordanian Sunset Buffet"]
    },
    artType: "deadsea",
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    coordinates: { lat: 31.5590, lng: 35.5900 }
  },

  // 4. آثار جرش وقلعة عجلون
  {
    id: "jerash-roman-glory",
    title: {
      ar: "جرش وعجلون • بومبي الشرق وقلعة صلاح الدين",
      en: "Jerash Roman Ruins & Ajloun Castle Tour"
    },
    subtitle: {
      ar: "أعظم المدن الرومانية المحفوظة وقلاع الأيوبيين",
      en: "The finest preserved Decapolis Roman city and Islamic fortress"
    },
    description: {
      ar: "امشِ على الحجارة الرومانية الأصلية في شارع الأعمدة والساحة البيضاوية الفريدة بجرش، ثم انتقل لتلفريك عجلون وقلعة الربض الشامخة بين غابات السنديان.",
      en: "Walk along chariot-grooved stones of the Colonnaded Street in Jerash, then ascend to Ajloun Castle."
    },
    region: { ar: "شمال الأردن • جرش وعجلون", en: "North Jordan • Jerash & Ajloun" },
    governorateId: "jerash",
    regionZone: "north",
    duration: { ar: "يوم كامل (7 ساعات)", en: "Full Day Tour" },
    priceJOD: 45,
    originalPriceJOD: 55,
    discountPercent: 18,
    adultPriceJOD: 45,
    childPriceJOD: 25,
    rewardPoints: 140,
    stampName: "ختم قوس هادريان وأعمدة أرتميس",
    rating: 4.88,
    reviewsCount: 1120,
    isUnesco: false,
    category: "archaeology",
    experienceType: "historic",
    availableDates: ["2026-10-17", "2026-10-24", "2026-10-31"],
    departureTimes: ["08:00 ص", "09:30 ص"],
    highlights: {
      ar: ["الساحة البيضاوية النادرة", "شارع الأعمدة الروماني", "قلعة عجلون الأيوبية", "ركوب تلفريك عجلون"],
      en: ["Oval Forum", "Cardo Maximus", "Ajloun Fortress", "Cable Car Ride"]
    },
    artType: "jerash",
    imageUrl: "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    coordinates: { lat: 32.2723, lng: 35.8914 }
  },

  // 5. جولة عمان التراثية والمدرج الروماني
  {
    id: "amman-citadel-heritage",
    title: {
      ar: "عمان • جبل القلعة والمدرج الروماني وتذوق الطعام الشعبي",
      en: "Amman Traditional Food & Citadel Walking Tour"
    },
    subtitle: {
      ar: "تاريخ يعود لآلاف السنين وألذ المأكولات التراثية",
      en: "7,000 years of civilization & authentic culinary heritage"
    },
    description: {
      ar: "استمتع بإطلالة بانورامية لمدينة عمان من معبد هرقل على قمة جبل القلعة، ثم تجول في شارع الرينبو وسوق البخارية وتذوق الكنافة الحبيبة والفلافل الأردنية الشهيرة.",
      en: "Take in panoramic views of the seven hills from Temple of Hercules, descend to Roman Theatre, and taste hot knafeh."
    },
    region: { ar: "وسط الأردن • العاصمة عمان", en: "Central Jordan • Amman" },
    governorateId: "amman",
    regionZone: "central",
    duration: { ar: "نصف يوم (4 ساعات)", en: "Half Day Walk" },
    priceJOD: 30,
    originalPriceJOD: 35,
    discountPercent: 14,
    adultPriceJOD: 30,
    childPriceJOD: 15,
    rewardPoints: 150,
    stampName: "ختم معبد هرقل وجبل القلعة العماني",
    rating: 4.90,
    reviewsCount: 890,
    isUnesco: false,
    category: "culinary",
    experienceType: "guided",
    availableDates: ["يومياً"],
    departureTimes: ["09:00 ص", "03:30 م"],
    highlights: {
      ar: ["معبد هرقل ومتحف الآثار", "المدرج الروماني بوسط البلد", "تذوق كنافة حبيبة الساخنة", "جولة شارع الرينبو الفني"],
      en: ["Hercules Temple", "Roman Theatre", "Hot Knafeh Tasting", "Rainbow Street Walk"]
    },
    artType: "amman",
    imageUrl: "https://images.unsplash.com/photo-1580834390184-f3c880629737?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    coordinates: { lat: 31.9539, lng: 35.9349 }
  },

  // 6. غوص ويخوت العقبة
  {
    id: "aqaba-red-sea",
    title: {
      ar: "العقبة • غوص الشعاب المرجانية ويخوت البحر الأحمر",
      en: "Aqaba Red Sea Coral Reef Snorkeling Cruise"
    },
    subtitle: {
      ar: "مياه دافئة وأندر الحدائق المرجانية وسفينة الأرز الغارقة",
      en: "Pristine marine reserve, shipwreck dive & sunset catamaran"
    },
    description: {
      ar: "استمتع بالغطس في الحديقة البحرية بالعقبة، ومشاهدة الشعاب المرجانية النادرة وسفينة سيدار برايد الغارقة، مع غداء الصيادية السمكية الطازجة على متن اليخت.",
      en: "Snorkel in Aqaba Marine Park, view vibrant coral gardens and shipwrecks, with fresh seafood Sayadieh lunch."
    },
    region: { ar: "جنوب الأردن • العقبة", en: "South Jordan • Aqaba" },
    governorateId: "aqaba",
    regionZone: "south",
    duration: { ar: "يوم كامل (6 ساعات)", en: "Full Day Cruise" },
    priceJOD: 40,
    originalPriceJOD: 50,
    discountPercent: 20,
    adultPriceJOD: 40,
    childPriceJOD: 20,
    rewardPoints: 125,
    stampName: "ختم مرجان البحر الأحمر وثغر الأردن",
    rating: 4.85,
    reviewsCount: 540,
    isUnesco: false,
    category: "luxury",
    experienceType: "stays",
    availableDates: ["2026-10-15", "2026-10-20", "2026-10-25"],
    departureTimes: ["09:30 ص", "01:30 م"],
    highlights: {
      ar: ["غوص وسنوركلينغ الشعاب المرجانية", "مشاهدة الدبابة والسفينة الغارقة", "وجبة صيادية السمك العقباوية", "إبحار اليخت وقت الغروب"],
      en: ["Coral Snorkeling", "Sunken Tank & Shipwreck", "Sayadieh Lunch", "Sunset Sailing"]
    },
    artType: "aqaba",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    coordinates: { lat: 29.5321, lng: 35.0063 }
  },

  // 7. البتراء ليلاً
  {
    id: "explore-petra-by-night",
    title: { ar: "عرض البتراء ليلاً وسحر الشموع والسيق", en: "Petra by Night Candlelight Experience" },
    subtitle: { ar: "1500 شمعة تضيء واجهة الخزينة وأنغام الربابة البدوية", en: "Candlelit walk through the Siq to Treasury" },
    description: { ar: "مسار ساحر يبدأ بعد الغروب عبر السيق المضاء بالشموع وصولاً لباحة الخزينة والاستماع لحكايات الأنباط والشاي بالمرمية.", en: "Magical night walk through the candlelit gorge to Al-Khazneh with live Bedouin music." },
    region: { ar: "جنوب الأردن • البتراء", en: "South Jordan • Petra" },
    governorateId: "maan",
    regionZone: "south",
    duration: { ar: "جولة ليلية (3 ساعات)", en: "Night Tour (3 hrs)" },
    priceJOD: 45,
    originalPriceJOD: 55,
    discountPercent: 18,
    adultPriceJOD: 45,
    childPriceJOD: 25,
    rewardPoints: 200,
    stampName: "ختم خزنة البتراء الوردية الأسطوري",
    rating: 4.90,
    reviewsCount: 1840,
    isUnesco: true,
    category: "archaeology",
    experienceType: "historic",
    availableDates: ["الإثنين، الأربعاء، الخميس"],
    departureTimes: ["08:30 م"],
    imageUrl: "https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800",
    coordinates: { lat: 30.3285, lng: 35.4444 }
  },

  // 8. وادي رم - قبب المريخ الفاخرة
  {
    id: "explore-wadirum-dome",
    title: { ar: "مخيم القبة المريخية البانورامي الفاخر في وادي رم", en: "Wadi Rum Martian Dome Panoramic Camp" },
    subtitle: { ar: "إقامة فندقية 5 نجوم وسط الصحراء مع مراقبة النجوم", en: "Luxury Martian Glamping with Zarb Dinner" },
    description: { ar: "عش تجربة الحياة على كوكب المريخ داخل قبب زجاجية مكيفة ومطلة مباشرة على جبال وادي رم وسماء الليل المرصعة بالنجوم.", en: "Luxury geodesic bubble dome with panoramic mountain and starry sky views." },
    region: { ar: "جنوب الأردن • وادي رم", en: "South Jordan • Wadi Rum" },
    governorateId: "maan",
    regionZone: "south",
    duration: { ar: "يومان وليلة (24 ساعة)", en: "Overnight (24 hrs)" },
    priceJOD: 95,
    originalPriceJOD: 120,
    discountPercent: 20,
    adultPriceJOD: 95,
    childPriceJOD: 50,
    rewardPoints: 180,
    stampName: "ختم خزنة البتراء الوردية الأسطوري",
    rating: 4.96,
    reviewsCount: 1420,
    isUnesco: true,
    category: "luxury",
    experienceType: "stays",
    availableDates: ["يومياً"],
    departureTimes: ["12:00 م"],
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
    coordinates: { lat: 29.5768, lng: 35.4192 }
  },

  // 9. مسار وادي ضانا البيئي
  {
    id: "explore-dana-hike",
    title: { ar: "مسار محمية ضانا البيئي للمشي الجبلي وتأمل الطبيعة", en: "Dana Biosphere Reserve Canyon Hiking Trail" },
    subtitle: { ar: "أكبر محمية طبيعية في الأردن ونزل فينان البيئي", en: "Scenic canyon trek across four biogeographical zones" },
    description: { ar: "مسار جبلي ساحر ينحدر من قمم جبال ضانا نحو وادي فينان والنزل المضاء بالشموع، للتعرف على أندر النباتات والحيوانات البرية.", en: "Spectacular hike down sandstone gorges to candle-lit Feynan Ecolodge." },
    region: { ar: "جنوب الأردن • الطفيلة", en: "South Jordan • Tafilah" },
    governorateId: "tafilah",
    regionZone: "south",
    duration: { ar: "يوم كامل (6 ساعات)", en: "Full Day (6 hrs)" },
    priceJOD: 42,
    originalPriceJOD: 50,
    discountPercent: 16,
    adultPriceJOD: 42,
    childPriceJOD: 25,
    rewardPoints: 130,
    stampName: "ختم محمية ضانا ووادي فينان",
    rating: 4.82,
    reviewsCount: 430,
    isUnesco: false,
    category: "adventure",
    experienceType: "guided",
    availableDates: ["2026-10-16", "2026-10-23", "2026-10-30"],
    departureTimes: ["07:00 ص"],
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
    coordinates: { lat: 30.6865, lng: 35.6132 }
  },

  // 10. مغامرة وادي الموجب المائية
  {
    id: "explore-wadi-mujib",
    title: { ar: "مغامرة التجديف والمشي المائي في شلالات وادي الموجب", en: "Wadi Mujib Siq Canyon Water Trail Adventure" },
    subtitle: { ar: "أعمق وادٍ مائي في الشرق الأوسط ينحدر نحو البحر الميت", en: "Aquatic canyon trek through towering sandstone cliffs" },
    description: { ar: "خض أروع مغامرة مائية بين الجدران الصخرية العالية والسباحة عكس مجرى الشلالات الطبيعية في محمية الموجب للمحيط الحيوي.", en: "Exhilarating water canyon hike swimming against natural waterfalls." },
    region: { ar: "وسط الأردن • وادي الموجب", en: "Central Jordan • Karak" },
    governorateId: "karak",
    regionZone: "central",
    duration: { ar: "نصف يوم (4 ساعات)", en: "Half Day (4 hrs)" },
    priceJOD: 35,
    originalPriceJOD: 45,
    discountPercent: 22,
    adultPriceJOD: 35,
    childPriceJOD: 20,
    rewardPoints: 140,
    stampName: "ختم قلعة الكرك الصليبية الحصينة",
    rating: 4.92,
    reviewsCount: 1540,
    isUnesco: false,
    category: "adventure",
    experienceType: "guided",
    availableDates: ["يومياً خلال موسم الصيف"],
    departureTimes: ["08:00 ص", "11:00 ص"],
    imageUrl: "https://images.unsplash.com/photo-1544971587-b842c56b9284?w=800",
    coordinates: { lat: 31.4667, lng: 35.5667 }
  },

  // 11. خريطة مادبا وجبل نيبو
  {
    id: "explore-madaba-nebo",
    title: { ar: "خريطة مادبا الفسيفسائية الأثرية وجبل نيبو المقدس", en: "Madaba Mosaic City & Mount Nebo Heritage Day" },
    subtitle: { ar: "أقدم خريطة جغرافية للقدس والأراضي المقدسة وإطلالة الوادي", en: "6th-century Byzantine mosaic map & Moses mountain" },
    description: { ar: "شاهد مليوني حجر فسيفسائي يروي تاريخ الأراضي المقدسة في كنيسة القديس جورج، ثم اصعد قمة جبل نيبو المطل على القدس وأريحا.", en: "Marvel at ancient Byzantine mosaics and the sacred summit of Mount Nebo." },
    region: { ar: "وسط الأردن • مادبا", en: "Central Jordan • Madaba" },
    governorateId: "madaba",
    regionZone: "central",
    duration: { ar: "نصف يوم (4 ساعات)", en: "Half Day (4 hrs)" },
    priceJOD: 32,
    originalPriceJOD: 40,
    discountPercent: 20,
    adultPriceJOD: 32,
    childPriceJOD: 18,
    rewardPoints: 135,
    stampName: "ختم خريطة الفسيفساء وجبل نيبو",
    rating: 4.80,
    reviewsCount: 880,
    isUnesco: false,
    category: "archaeology",
    experienceType: "historic",
    availableDates: ["يومياً"],
    departureTimes: ["09:00 ص", "01:30 م"],
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
    coordinates: { lat: 31.7197, lng: 35.7941 }
  },

  // 12. آثار أم قيس وبحيرة طبريا
  {
    id: "explore-umm-qais",
    title: { ar: "آثار جدارا الرومانية في أم قيس مع إطلالة بحيرة طبريا", en: "Umm Qais Decapolis Ruins & Sea of Galilee View" },
    subtitle: { ar: "حجارة البازلت الأسود وشرفة تطل على ثلاث دول", en: "Black basalt decapolis city overlooking Golan & Galilee" },
    description: { ar: "امشِ بين أعمدة البازلت الأسود الرومانية في أم قيس واستمتع بإطلالة بانورامية أسطورية على بحيرة طبريا وهضبة الجولان ونهر اليرموك.", en: "Ancient Gadara ruins offering sweeping views across Sea of Galilee." },
    region: { ar: "شمال الأردن • إربد", en: "North Jordan • Irbid" },
    governorateId: "irbid",
    regionZone: "north",
    duration: { ar: "يوم كامل (5 ساعات)", en: "Full Day (5 hrs)" },
    priceJOD: 34,
    originalPriceJOD: 42,
    discountPercent: 19,
    adultPriceJOD: 34,
    childPriceJOD: 20,
    rewardPoints: 120,
    stampName: "ختم عروس الشمال وبازلت أم قيس",
    rating: 4.86,
    reviewsCount: 490,
    isUnesco: false,
    category: "archaeology",
    experienceType: "historic",
    availableDates: ["2026-10-17", "2026-10-24"],
    departureTimes: ["08:30 ص"],
    imageUrl: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800",
    coordinates: { lat: 32.6536, lng: 35.6844 }
  },

  // 13. ورشة طهي المنسف الأردني
  {
    id: "explore-mansaf-class",
    title: { ar: "ورشة طهي المنسف الأردني التقليدي مع عائلة محلية", en: "Authentic Jordanian Mansaf Masterclass with Local Host" },
    subtitle: { ar: "تعلم أسرار الجميد الكركي وخبز الشراك والضيافة الأصيلة", en: "Hands-on national dish cooking & Bedouin coffee" },
    description: { ar: "تجربة ضيافة منزلية أردنية دافئة في عمان لتعلم طبخ المنسف بالجميد الأصيل وإعداد خبز الشراك وسكب السمن البلدي واللوز المحمص.", en: "Cook Jordan's national dish with jameed yogurt and fresh shrak bread." },
    region: { ar: "وسط الأردن • عمان", en: "Central Jordan • Amman" },
    governorateId: "amman",
    regionZone: "central",
    duration: { ar: "3 ساعات", en: "3 Hours" },
    priceJOD: 28,
    originalPriceJOD: 35,
    discountPercent: 20,
    adultPriceJOD: 28,
    childPriceJOD: 15,
    rewardPoints: 150,
    stampName: "ختم معبد هرقل وجبل القلعة العماني",
    rating: 4.94,
    reviewsCount: 380,
    isUnesco: false,
    category: "culinary",
    experienceType: "guided",
    availableDates: ["يومياً"],
    departureTimes: ["11:30 ص", "05:00 م"],
    imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800",
    coordinates: { lat: 31.9539, lng: 35.9106 }
  },

  // 14. يخت تالا بيه الفاخر بالعقبة
  {
    id: "explore-tala-bay",
    title: { ar: "إبحار يخت فاخر عند الغروب في تالا بيه مع وجبة عشاء", en: "Tala Bay Private Sunset Yacht Charter with Dinner" },
    subtitle: { ar: "رحلة بحرية خاصة 5 نجوم مع أنغام الموسيقى وعشاء فاخر", en: "VIP marina cruise with fresh catch and sunset views" },
    description: { ar: "أرقى رحلات العقبة البحرية انطلاقاً من مرسى تالا بيه الخاص، والسباحة في مياه البحر الأحمر الشفافة وتناول العشاء الفاخر عند المغيب.", en: "Private luxury sunset cruise departing from exclusive Tala Bay Marina." },
    region: { ar: "جنوب الأردن • العقبة", en: "South Jordan • Aqaba" },
    governorateId: "aqaba",
    regionZone: "south",
    duration: { ar: "3 ساعات", en: "3 Hours" },
    priceJOD: 95,
    originalPriceJOD: 120,
    discountPercent: 21,
    adultPriceJOD: 95,
    childPriceJOD: 50,
    rewardPoints: 125,
    stampName: "ختم مرجان البحر الأحمر وثغر الأردن",
    rating: 4.91,
    reviewsCount: 320,
    isUnesco: false,
    category: "luxury",
    experienceType: "stays",
    availableDates: ["2026-10-15", "2026-10-22"],
    departureTimes: ["04:00 م"],
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    coordinates: { lat: 29.4167, lng: 34.9833 }
  },

  // 15. حمامات ماعين الكبريتية
  {
    id: "explore-main-springs",
    title: { ar: "حمامات ماعين المعدنية الحارة وشلالات الاسترخاء العلاجي", en: "Ma'in Natural Hot Thermal Springs Day Access" },
    subtitle: { ar: "شلالات كبريتية دافئة تنحدر بين صخور الوادي الوعرة", en: "Therapeutic mineral waterfalls and Roman baths" },
    description: { ar: "استمتع بمياه الشلالات الساخنة الغنية بالمعادن الطبيعية التي تعود لعهد الرومان والجاكوزي الطبيعي للاستشفاء وتخفيف آلام المفاصل.", en: "Natural thermal waterfalls rich in healing minerals cascading through desert canyons." },
    region: { ar: "وسط الأردن • مادبا", en: "Central Jordan • Madaba" },
    governorateId: "madaba",
    regionZone: "central",
    duration: { ar: "يوم كامل", en: "Full Day" },
    priceJOD: 35,
    originalPriceJOD: 45,
    discountPercent: 22,
    adultPriceJOD: 35,
    childPriceJOD: 20,
    rewardPoints: 135,
    stampName: "ختم خريطة الفسيفساء وجبل نيبو",
    rating: 4.77,
    reviewsCount: 670,
    isUnesco: false,
    category: "relaxation",
    experienceType: "stays",
    availableDates: ["يومياً"],
    departureTimes: ["09:00 ص"],
    imageUrl: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800",
    coordinates: { lat: 31.6083, lng: 35.7000 }
  },

  // 16. القصور الصحراوية الأموية
  {
    id: "explore-desert-castles",
    title: { ar: "جولة القصور الصحراوية الأموية: قصر عمرة والخرانة وقصر الأزرق", en: "Umayyad Desert Castles Loop: Qasr Amra & Kharana" },
    subtitle: { ar: "تحف معمارية وجداريات فلكية وإسلامية في قلب البادية", en: "UNESCO 8th-century fresco palaces in eastern desert" },
    description: { ar: "رحلة أثرية عبر البادية الشرقية لزيارة قصر عمرة المدرج باليونسكو والمشهور بجدارياته الفلكية، وقلعة الأزرق التي نزل بها لورنس العرب.", en: "Explore early Islamic castles, frescoes, and Lawrence of Arabia's fortress." },
    region: { ar: "وسط الأردن • الزرقاء", en: "Central Jordan • Zarqa" },
    governorateId: "zarqa",
    regionZone: "central",
    duration: { ar: "يوم كامل (5 ساعات)", en: "Full Day (5 hrs)" },
    priceJOD: 40,
    originalPriceJOD: 50,
    discountPercent: 20,
    adultPriceJOD: 40,
    childPriceJOD: 20,
    rewardPoints: 115,
    stampName: "ختم قصر عمرة الأموي ومحمية الأزرق",
    rating: 4.81,
    reviewsCount: 310,
    isUnesco: true,
    category: "archaeology",
    experienceType: "historic",
    availableDates: ["2026-10-18", "2026-10-25"],
    departureTimes: ["08:30 ص"],
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
    coordinates: { lat: 31.8028, lng: 36.5819 }
  },

  // 17. رصد النجوم بالتلسكوبات في وادي رم
  {
    id: "explore-astronomy-rum",
    title: { ar: "رصد المجرات والكواكب بالتلسكوبات العملاقة في وادي رم", en: "Deep Sky Astronomy & Telescope Stargazing in Wadi Rum" },
    subtitle: { ar: "محمية سماء مظلمة معتمدة لرؤية حلقات زحل وسديم الجبار", en: "Certified dark sky reserve with professional astronomers" },
    description: { ar: "جلسة فلكية ليلية مع علماء فلك محترفين باستخدام أحدث التلسكوبات المحوسبة لرصد الكواكب وسدم المجرات تحت أنقى سماء صحراوية.", en: "Peer through computer-guided telescopes to see planets and deep-space nebulae." },
    region: { ar: "جنوب الأردن • وادي رم", en: "South Jordan • Wadi Rum" },
    governorateId: "maan",
    regionZone: "south",
    duration: { ar: "ساعتان ليلاً", en: "2 Hours at Night" },
    priceJOD: 30,
    originalPriceJOD: 38,
    discountPercent: 21,
    adultPriceJOD: 30,
    childPriceJOD: 15,
    rewardPoints: 180,
    stampName: "ختم خزنة البتراء الوردية الأسطوري",
    rating: 4.97,
    reviewsCount: 1100,
    isUnesco: true,
    category: "adventure",
    experienceType: "guided",
    availableDates: ["يومياً"],
    departureTimes: ["09:00 م"],
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
    coordinates: { lat: 29.5768, lng: 35.4192 }
  },

  // 18. كوخ خشبي في غابات عجلون
  {
    id: "explore-ajloun-treehouse",
    title: { ar: "إقامة كوخ خشبي في محمية غابات عجلون مع إفطار قروي بلدي", en: "Ajloun Forest Reserve Woodland Cabin Overnight" },
    subtitle: { ar: "أجواء ريفية نقية بين أشجار البلوط والصنوبر الحلبي", en: "Eco wooden lodge immersed in northern mountain wilderness" },
    description: { ar: "ابتعد عن صخب المدينة واستمتع بالمبيت في أكواخ المحمية الخشبية وتذوق الإفطار البلدي بجبنة الماعز والزيت والزعتر ودبس الرمان الطبيعي.", en: "Eco-friendly wooden cabin stay surrounded by Mediterranean oak canopy." },
    region: { ar: "شمال الأردن • عجلون", en: "North Jordan • Ajloun" },
    governorateId: "ajloun",
    regionZone: "north",
    duration: { ar: "ليلة كاملة", en: "Overnight" },
    priceJOD: 75,
    originalPriceJOD: 90,
    discountPercent: 17,
    adultPriceJOD: 75,
    childPriceJOD: 40,
    rewardPoints: 130,
    stampName: "ختم قلعة الربض وغابات السنديان",
    rating: 4.89,
    reviewsCount: 520,
    isUnesco: false,
    category: "luxury",
    experienceType: "stays",
    availableDates: ["2026-10-15", "2026-10-22", "2026-10-29"],
    departureTimes: ["02:00 م"],
    imageUrl: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800",
    coordinates: { lat: 32.3326, lng: 35.7517 }
  }
];