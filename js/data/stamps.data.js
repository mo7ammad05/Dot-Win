/**
 * 🇯🇴 كتالوج أختام جواز السفر الأردني الرقمي الـ 12 (نظام شارات جواكر الفاخر)
 * يتضمن أختام كافة محافظات المملكة الـ 12 برموزها وألوانها وشروط فك القفل ونقاط XP
 */

export const officialStampsData = [
  // 1. محافظة معان (البتراء)
  {
    id: "stamp-maan-petra",
    governorateId: "maan",
    gov: "محافظة معان",
    name: {
      ar: "ختم خزنة البتراء الوردية الأسطوري",
      en: "Legendary Petra Rose Treasury Seal"
    },
    governorateName: {
      ar: "محافظة معان",
      en: "Ma'an Governorate"
    },
    description: {
      ar: "يُمنح لمن يكمل مسار السيق ويشهد إشراقة الشمس على واجهة الخزينة المنحوتة في الصخر الوردي.",
      en: "Awarded for completing the Siq trail and beholding sunrise at the rock-cut Rose Treasury."
    },
    hook: "المعجزة الهيدروليكية النبطية وصعود 800 درجة نحو الدير المنحوت في قمة الجبل.",
    iconType: "petra",
    icon: "fa-chess-rook",
    color: "#C86D51",
    shape: "scalloped",
    unlocked: true,
    dateUnlocked: "12 تشرين الأول 2025",
    rarity: "Legendary",
    xp: 200
  },

  // 2. محافظة العاصمة عمان
  {
    id: "stamp-amman-citadel",
    governorateId: "amman",
    gov: "محافظة العاصمة عمان",
    name: {
      ar: "ختم معبد هرقل وجبل القلعة العماني",
      en: "Temple of Hercules & Citadel Seal"
    },
    governorateName: {
      ar: "محافظة العاصمة عمان",
      en: "Amman Capital Governorate"
    },
    description: {
      ar: "يُمنح عند صعود جبل القلعة وزيارة معبد هرقل والمدرج الروماني بقلب العاصمة.",
      en: "Earned by exploring the Amman Citadel, Temple of Hercules and the Roman Theatre."
    },
    hook: "يد هرقل الرخامية العملاقة وسراديب الهروب المحفورة في عمق جبل القلعة التاريخي.",
    iconType: "citadel",
    icon: "fa-crown",
    color: "#3B82F6",
    shape: "round",
    unlocked: true,
    dateUnlocked: "05 تشرين الثاني 2025",
    rarity: "Heritage",
    xp: 150
  },

  // 3. محافظة جرش
  {
    id: "stamp-jerash-hadrian",
    governorateId: "jerash",
    gov: "محافظة جرش",
    name: {
      ar: "ختم قوس هادريان وأعمدة أرتميس",
      en: "Hadrian Arch & Artemis Columns Seal"
    },
    governorateName: {
      ar: "محافظة جرش",
      en: "Jerash Governorate"
    },
    description: {
      ar: "يُمنح عند زيارة بومبي الشرق والسير في شارع الأعمدة الرومانية والمسرح الجنوبي.",
      en: "Granted upon walking the ancient Roman Cardo Maximus and hearing bagpipes at the South Theatre."
    },
    hook: "ظاهرة الأعمدة الهزازة التي ترقص مع الرياح دون أن تسقط بفعل مفاصل الرصاص المبتكرة منذ 2000 عام.",
    iconType: "columns",
    icon: "fa-monument",
    color: "#D97706",
    shape: "octagonal",
    unlocked: true,
    dateUnlocked: "15 كانون الثاني 2026",
    rarity: "Epic",
    xp: 140
  },

  // 4. محافظة العقبة
  {
    id: "stamp-aqaba-coral",
    governorateId: "aqaba",
    gov: "محافظة العقبة",
    name: {
      ar: "ختم مرجان البحر الأحمر وثغر الأردن",
      en: "Red Sea Marine Coral & Port Seal"
    },
    governorateName: {
      ar: "محافظة العقبة",
      en: "Aqaba Governorate"
    },
    description: {
      ar: "يُمنح لمن يغوص بين الشعاب المرجانية الساحرة في الحديقة البحرية بخليج العقبة.",
      en: "Earned by exploring the pristine fringing coral reefs of the Red Sea marine park."
    },
    hook: "ميناء أيلة التاريخي على طريق الحرير والبخور وتحدي استكشاف حطام السفينة العسكرية الغارقة C-130.",
    iconType: "coral",
    icon: "fa-water",
    color: "#0284C7",
    shape: "shield",
    unlocked: false,
    rarity: "Heritage",
    xp: 125
  },

  // 5. محافظة عجلون
  {
    id: "stamp-ajloun-castle",
    governorateId: "ajloun",
    gov: "محافظة عجلون",
    name: {
      ar: "ختم قلعة الربض وغابات السنديان",
      en: "Ajloun Fortress & Oak Canopy Seal"
    },
    governorateName: {
      ar: "محافظة عجلون",
      en: "Ajloun Governorate"
    },
    description: {
      ar: "يُمنح لركوب تلفريك عجلون وزيارة قلعة صلاح الدين الأيوبي المطلة على وادي الأردن.",
      en: "Awarded for riding the Ajloun cable car and touring the hilltop Ayyubid fortress."
    },
    hook: "شبكة مشاعل النار والحمام الزاجل التي نقلت الرسائل الحربية من قلعة عجلون إلى دمشق والقاهرة في ساعات.",
    iconType: "fortress",
    icon: "fa-feather",
    color: "#059669",
    shape: "round",
    unlocked: false,
    rarity: "Heritage",
    xp: 130
  },

  // 6. محافظة إربد
  {
    id: "stamp-irbid-ummqais",
    governorateId: "irbid",
    gov: "محافظة إربد",
    name: {
      ar: "ختم عروس الشمال وبازلت أم قيس",
      en: "Gadara Black Basalt & Lake Vista Seal"
    },
    governorateName: {
      ar: "محافظة إربد",
      en: "Irbid Governorate"
    },
    description: {
      ar: "يُمنح للوقوف عند شرفة أم قيس القديمة والتأمل ببحيرة طبريا وهضبة الجولان.",
      en: "Earned overlooking the Sea of Galilee from the black basalt terrace of ancient Gadara."
    },
    hook: "نقش الشاعر أرابيوس الخالد: 'أيها المار من هنا.. تمتع بالحياة فإنك فانٍ'، وتحدي نفق جدارا المائي الممتد 170 كم.",
    iconType: "basalt",
    icon: "fa-columns",
    color: "#4B5563",
    shape: "scalloped",
    unlocked: false,
    rarity: "Heritage",
    xp: 120
  },

  // 7. محافظة البلقاء (السلط)
  {
    id: "stamp-balqa-salt",
    governorateId: "balqa",
    gov: "محافظة البلقاء (السلط)",
    name: {
      ar: "ختم السلط العريقة والبيوت الصفراء",
      en: "As-Salt Golden Heritage City Seal"
    },
    governorateName: {
      ar: "محافظة البلقاء",
      en: "Balqa Governorate"
    },
    description: {
      ar: "يُمنح للتجول في شارع الحمام والبيوت الحجرية الصفراء المدرجة على لائحة التراث العالمي (اليونسكو).",
      en: "Conferred for strolling Hamam Street and admiring the UNESCO yellow limestone architecture."
    },
    hook: "فلسفة 'الداية' والضيافة الحضرية وبيوت الإيوان الصفراء ذات الشبابيك الثلاثية التي تجسد العيش المشترك.",
    iconType: "heritage_city",
    icon: "fa-handshake",
    color: "#B45309",
    shape: "round",
    unlocked: false,
    rarity: "Heritage",
    xp: 130
  },

  // 8. محافظة مادبا
  {
    id: "stamp-madaba-mosaic",
    governorateId: "madaba",
    gov: "محافظة مادبا",
    name: {
      ar: "ختم خريطة الفسيفساء وجبل نيبو",
      en: "Holy Mosaic Map & Mount Nebo Seal"
    },
    governorateName: {
      ar: "محافظة مادبا",
      en: "Madaba Governorate"
    },
    description: {
      ar: "يُمنح لمن يشاهد خريطة الأراضي المقدسة الفسيفسائية بكنيسة الروم الأرثوذكس وجبل نيبو.",
      en: "Awarded for viewing the 6th-century Byzantine mosaic map and the panoramic summit of Nebo."
    },
    hook: "الشيفرة الهندسية لملايين الحجارة الفسيفسائية الطبيعية التي قاومت الزمن 1500 عام بدون أي بهتان لوني.",
    iconType: "mosaic",
    icon: "fa-shapes",
    color: "#854D0E",
    shape: "octagonal",
    unlocked: false,
    rarity: "Epic",
    xp: 135
  },

  // 9. محافظة الكرك
  {
    id: "stamp-karak-citadel",
    governorateId: "karak",
    gov: "محافظة الكرك",
    name: {
      ar: "ختم قلعة الكرك الصليبية الحصينة",
      en: "Impregnable Karak Crusader Fortress Seal"
    },
    governorateName: {
      ar: "محافظة الكرك",
      en: "Karak Governorate"
    },
    description: {
      ar: "يُمنح لاجتياز ممرات ودهاليز قلعة الكرك الحجرية الشاهقة والمنظر المطل على البحر الميت.",
      en: "Earned by navigating the subterranean vaults and defensive ramparts of Karak Castle."
    },
    hook: "سر أقبية رينو دي شاتيون المكونة من سبعة طوابق تحت القلعة، وأسطورة المنجنيقات العملاقة المطلة على وادي الموجب.",
    iconType: "castle",
    icon: "fa-shield-halved",
    color: "#991B1B",
    shape: "shield",
    unlocked: false,
    rarity: "Epic",
    xp: 140
  },

  // 10. محافظة الطفيلة
  {
    id: "stamp-tafilah-dana",
    governorateId: "tafilah",
    gov: "محافظة الطفيلة",
    name: {
      ar: "ختم محمية ضانا ووادي فينان",
      en: "Dana Biosphere Canyon & Feynan Seal"
    },
    governorateName: {
      ar: "محافظة الطفيلة",
      en: "Tafilah Governorate"
    },
    description: {
      ar: "يُمنح لخوض مسار وادي ضانا الطبيعي والمبيت بنزل فينان البيئي المضاء بالشموع.",
      en: "Earned traversing the sandstone canyons of Dana and staying at candle-lit Feynan Eco Lodge."
    },
    hook: "لغز نحت المسلة البابلية على واجهة جبل السلع الشاهقة على ارتفاع 400 متر للملك نابونيد قبل 2500 عام.",
    iconType: "canyon",
    icon: "fa-mountain",
    color: "#065F46",
    shape: "round",
    unlocked: false,
    rarity: "Rare",
    xp: 130
  },

  // 11. محافظة الزرقاء
  {
    id: "stamp-zarqa-amra",
    governorateId: "zarqa",
    gov: "محافظة الزرقاء",
    name: {
      ar: "ختم قصر عمرة الأموي ومحمية الأزرق",
      en: "Qasr Amra UNESCO & Azraq Oasis Seal"
    },
    governorateName: {
      ar: "محافظة الزرقاء",
      en: "Zarqa Governorate"
    },
    description: {
      ar: "يُمنح لمشاهدة جداريات قصر عمرة الأموي والطيور المهاجرة في واحة الأزرق المائية.",
      en: "Awarded for admiring the early Islamic frescoes of Qasr Amra and birdwatching at Azraq wetlands."
    },
    hook: "قبة السماء الفلكية في قصر عمرة: أول خارطة مرسومة للنجوم والأبراج على سطح دائري مقبب في تاريخ الفن الإسلامي.",
    iconType: "oasis",
    icon: "fa-horse",
    color: "#6366F1",
    shape: "scalloped",
    unlocked: false,
    rarity: "Rare",
    xp: 115
  },

  // 12. محافظة المفرق
  {
    id: "stamp-mafraq-ummeljimal",
    governorateId: "mafraq",
    gov: "محافظة المفرق",
    name: {
      ar: "ختم واحة أم الجمال البازلتية التراثية",
      en: "Umm el-Jimal Black Basalt Oasis Seal"
    },
    governorateName: {
      ar: "محافظة المفرق",
      en: "Mafraq Governorate"
    },
    description: {
      ar: "يُمنح لزيارة مدينة أم الجمال الأثرية المنحوتة من البازلت الأسود وأحدث مواقع اليونسكو.",
      en: "Conferred for exploring the mysterious black basalt stone architecture of Umm el-Jimal."
    },
    hook: "لغز الأبواب الحجرية العملاقة المصنوعة من كتلة بازلت تزن أطناناً وتفتح بدفعة إصبع واحدة دون صدأ أو مفاصل حديدية.",
    iconType: "desert_city",
    icon: "fa-gem",
    color: "#374151",
    shape: "octagonal",
    unlocked: false,
    rarity: "Rare",
    xp: 110
  }
];