/**
 * 🇯🇴 الأطلس الجغرافي والثقافي لمحافظات المملكة الأردنية الهاشمية الـ 12
 * يتضمن الإحداثيات الدقيقة للنقاط التفاعلية، السرد التاريخي، والمعالم البارزة
 */

export const governoratesData = [
  // 1. العاصمة عمان
  {
    id: "amman",
    name: { ar: "العاصمة عمان", en: "Amman Governorate" },
    title: { ar: "عمان • عاصمة الأصالة السبعة جبال", en: "Amman • The City of Seven Hills & Heritage" },
    description: {
      ar: "قلب المملكة النابض، تجمع بين الآثار الرومانية والبيزنطية والأموية مع نبض الحياة العصرية وثقافة المقاهي والفنون في اللويبدة وجبل عمان.",
      en: "The beating heart of Jordan, blending Roman, Byzantine, and Umayyad antiquities with thriving art, culture, and culinary cafes across Jabal Al-Weibdeh."
    },
    history: {
      ar: "عُرفت قديماً باسم 'ربة عمون' عاصمة العمونيين، ثم أطلق عليها بطليموس اسم 'فيلادلفيا'. احتضنت الحضارة الرومانية وأقيم فيها المدرج الضخم ومعبد هرقل الشاهق فوق جبل القلعة.",
      en: "Historically known as Rabbath Ammon, then Philadelphia under Ptolemaic rule. Home to the towering Roman Citadel and the 6,000-seat amphitheater."
    },
    pinPosition: { top: "34%", left: "49%" },
    stampId: "stamp-amman-citadel",
    region: "center",
    coords: [31.9539, 35.9106],
    photos: [
      "https://images.unsplash.com/photo-1580834390184-f3c880629737?w=1000",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1000",
      "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=1000"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    landmarks: [
      {
        id: "amman-citadel",
        name: { ar: "جبل القلعة ومعبد هرقل", en: "Amman Citadel & Hercules Temple" },
        image: "https://images.unsplash.com/photo-1580834390184-f3c880629737?w=800",
        desc: { ar: "أعلى تلال عمان المطلة على كامل المدينة، تضم القصر الأموي وأعمدة هرقل الضخمة.", en: "Highest hill offering 360 panoramic views, featuring Umayyad Palace and Herculean columns." }
      },
      {
        id: "roman-theater",
        name: { ar: "المدرج الروماني العظيم", en: "The Great Roman Theatre" },
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
        desc: { ar: "تحفة معمارية رومانية تتسع لـ 6000 متفرج ذات هندسة صوتية فريدة بقلب وسط البلد.", en: "A 2nd-century Roman masterpiece cut into the hillside seating 6,000 with acoustics." }
      }
    ]
  },

  // 2. إربد
  {
    id: "irbid",
    name: { ar: "إربد", en: "Irbid Governorate" },
    title: { ar: "إربد • عروس الشمال وجوهرة حوران", en: "Irbid • Bride of the North & Gadara" },
    description: {
      ar: "محافظة السهول الخضراء وأشجار الزيتون الرومانية، وموطن مدينة أم قيس الإغريقية الرومانية المشيدة بالبازلت الأسود والمطلة على طبريا وجبل الشيخ.",
      en: "Famed for emerald rolling plains, ancient olive groves, and the black basalt decapolis city of Umm Qais overlooking the Sea of Galilee."
    },
    history: {
      ar: "كانت تسمى 'أربيلا'، وشكلت نقطة وصل تجارية استراتيجية ومركزاً لحلف المدن العشر (الديكابوليس). كتب الشاعر أرابيوس على شاهد قبره في أم قيس: 'أيها المار من هنا، كما أنت الآن كنت أنا، وكما أنا الآن ستكون أنت، فتمتع بالحياة فإنك فانٍ'.",
      en: "Ancient Arabella, pivotal junction in antiquity. The poet Arabios inscribed his immortal poem on his tomb at Umm Qais."
    },
    pinPosition: { top: "15%", left: "46%" },
    stampId: "stamp-irbid-ummqais",
    region: "north",
    coords: [32.5568, 35.8469],
    photos: [
      "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1000",
      "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=1000"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    landmarks: [
      {
        id: "umm-qais",
        name: { ar: "آثار أم قيس (جدارا)", en: "Ancient Gadara Ruins (Umm Qais)" },
        image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800",
        desc: { ar: "مدينة أثرية بنيت بأحجار البازلت الأسود مع مسرح روماني ومطل أسطوري.", en: "Greco-Roman city of black basalt boasting a theatre and a breathtaking vista." }
      },
      {
        id: "yarmouk-reserve",
        name: { ar: "محمية غابات اليرموك", en: "Yarmouk Forest Reserve" },
        image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800",
        desc: { ar: "آخر امتداد طبيعي لأشجار البلوط النفضية والوديان الخضراء المورقة.", en: "Natural reserve sheltering rare deciduous oak trees and pristine winding valleys." }
      }
    ]
  },

  // 3. جرش
  {
    id: "jerash",
    name: { ar: "جرش", en: "Jerash Governorate" },
    title: { ar: "جرش • بومبي الشرق وأعمدة المجد", en: "Jerash • Pompeii of the East & Colonnades" },
    description: {
      ar: "إحدى أعظم وأكمل المدن الرومانية المحفوظة في العالم حتى اليوم، بمسارحها وساحاتها البيضاوية وشوارعها المبلطة وقوس هادريان الشامخ.",
      en: "One of the best-preserved Greco-Roman provincial cities anywhere on earth, celebrated for grand theatres and colonnaded avenues."
    },
    history: {
      ar: "ازدهرت 'جيراسا' في عهد الإمبراطور الروماني تراجان وهادريان وبلغت ذروة مجدها كعضو مؤسس في حلف الديكابوليس التجاري.",
      en: "Flourished under Roman emperors Trajan and Hadrian, peaking in glory as a wealthy member of the commercial Decapolis league."
    },
    pinPosition: { top: "24%", left: "46%" },
    stampId: "stamp-jerash-hadrian",
    region: "north",
    coords: [32.2747, 35.8961],
    photos: [
      "https://images.unsplash.com/photo-1580834341580-8c17a3a632ec?w=1000",
      "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1000"
    ],
    landmarks: [
      {
        id: "hadrian-arch",
        name: { ar: "قوس النصر (قوس هادريان)", en: "Hadrian's Triumphal Arch" },
        image: "https://images.unsplash.com/photo-1580834341580-8c17a3a632ec?w=800",
        desc: { ar: "بوابة النصر الضخمة المشيدة عام 129 م تخليداً لزيارة الإمبراطور هادريان.", en: "11-meter monumental arch built in 129 AD to celebrate Emperor Hadrian's state visit." }
      },
      {
        id: "oval-plaza",
        name: { ar: "ساحة الندوة البيضاوية", en: "The Oval Forum & Plaza" },
        image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800",
        desc: { ar: "ساحة مبلطة فريدة محاطة بـ 56 عموداً أيونياً تربط شارع الأعمدة بمعبد زيوس.", en: "Unique paved elliptical forum encircled by 56 Ionic columns leading to the Cardo." }
      }
    ]
  },

  // 4. عجلون
  {
    id: "ajloun",
    name: { ar: "عجلون", en: "Ajloun Governorate" },
    title: { ar: "عجلون • قلعة الربض وجنان السنديان", en: "Ajloun • The Islamic Fortress & Oak Valleys" },
    description: {
      ar: "واحة الجبال الشمالية المغطاة بأشجار السنديان والخروب، وقلعة الأيوبيين الحصينة وتلفريك عجلون السياحي الحديث.",
      en: "A green northern sanctuary draped in pine and oak groves, topped by Saladin's fortress and Jordan's premier cable car."
    },
    history: {
      ar: "بنى القلعة القائد عز الدين أسامة أحد قادة صلاح الدين الأيوبي عام 1184 م للسيطرة على طرق التجارة بين دمشق وجنوب الأردن ومراقبة مناجم الحديد.",
      en: "Ajloun Castle was erected in 1184 AD by General Izz al-Din Usama under Saladin to safeguard transit routes between Damascus and southern Jordan."
    },
    pinPosition: { top: "22%", left: "42%" },
    stampId: "stamp-ajloun-castle",
    region: "north",
    coords: [32.3326, 35.7517],
    photos: [
      "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=1000",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000"
    ],
    landmarks: [
      {
        id: "ajloun-castle",
        name: { ar: "قلعة عجلون (قلعة الربض)", en: "Ajloun Castle (Qal'at ar-Rabad)" },
        image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800",
        desc: { ar: "حصن عسكري أيوبي منيع في قمة جبل عوف يوفر إطلالات خلابة على جبال فلسطين وجرش.", en: "Ayyubid military fortress atop Mount Auf overlooking the Jordan Valley and Palestine." }
      },
      {
        id: "ajloun-teleferique",
        name: { ar: "تلفريك عجلون السياحي", en: "Ajloun Aerial Cable Car" },
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
        desc: { ar: "رحلة جوية بطول 2.5 كم فوق أحضان الطبيعة وغابات السنديان.", en: "2.5 km scenic gondola ride gliding smoothly over lush Mediterranean oak canopies." }
      }
    ]
  },

  // 5. البلقاء (السلط)
  {
    id: "balqa",
    name: { ar: "البلقاء (السلط)", en: "Balqa Governorate (As-Salt)" },
    title: { ar: "البلقاء • السلط مدينة التسامح والضيافة", en: "Balqa • As-Salt: City of Tolerance & Yellow Stone" },
    description: {
      ar: "مدينة التراث العالمي (اليونسكو)، المشهورة بهندستها المعمارية الحجرية الصفراء وأدراجها الحجرية العتيقة وتناغم مساجدها وكنائسها.",
      en: "UNESCO World Heritage city famous for harmonious golden limestone mansions, stone stairways, and urban hospitality."
    },
    history: {
      ar: "كانت السلط العاصمة الإدارية لشرق الأردن في العهد العثماني وأوائل عهد الإمارة. بُنيت قصورها بحجر السلط الأصفر المنحوت على أيدي أمهر البنائين الشاميين.",
      en: "Served as the primary administrative capital of Transjordan during late Ottoman times, adorned with yellow stone mansions."
    },
    pinPosition: { top: "31%", left: "44%" },
    stampId: "stamp-balqa-salt",
    region: "center",
    coords: [32.0392, 35.7272],
    photos: [
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1000"
    ],
    landmarks: [
      {
        id: "hamam-street",
        name: { ar: "شارع الحمام التراثي", en: "Historic Al-Hamam Street" },
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
        desc: { ar: "أقدم أسواق السلط المحاطة بالمحلات التقليدية والمقاهي والأقواس العثمانية.", en: "Cobblestone market arcade filled with spice merchants, traditional crafts, and stone arches." }
      }
    ]
  },

  // 6. مادبا
  {
    id: "madaba",
    name: { ar: "مادبا", en: "Madaba Governorate" },
    title: { ar: "مادبا • عاصمة الفسيفساء وجبل نيبو", en: "Madaba • City of Mosaics & Mount Nebo" },
    description: {
      ar: "مدينة الفن البيزنطي والفسيفساء الأثرية، وبوابة جبل نيبو وحمامات ماعين الكبريتية العلاجية المنحدرة نحو البحر الميت.",
      en: "Global epicenter of Byzantine mosaic art, home to revered Mount Nebo and therapeutic mineral thermal waterfalls of Ma'in."
    },
    history: {
      ar: "تحتضن كنيسة القديس جورج خارطة الفسيفساء التي تعود للقرن السادس الميلادي وتعد أقدم خريطة جغرافية مرسومة للأراضي المقدسة والقدس ونهر الأردن.",
      en: "Houses the famous 6th-century Madaba Map inside St. George's Church—the oldest surviving cartographic depiction of Jerusalem."
    },
    pinPosition: { top: "38%", left: "46%" },
    stampId: "stamp-madaba-mosaic",
    region: "center",
    coords: [31.7197, 35.7941],
    photos: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000"
    ],
    landmarks: [
      {
        id: "st-george-mosaic",
        name: { ar: "خارطة فسيفساء كنيسة القديس جورج", en: "St. George Church Mosaic Map" },
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
        desc: { ar: "تحفة بيزنطية تضم مليوني قطعة حجرية ملونة تصور جغرافية بلاد الشام ومصر.", en: "2 million colored stone tesserae detailing Biblical routes, ancient Jerusalem, and Dead Sea." }
      },
      {
        id: "mount-nebo",
        name: { ar: "جبل نيبو ومطل وادي الأردن", en: "Mount Nebo & Jordan Valley Vista" },
        image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800",
        desc: { ar: "الموقع المقدس الذي وقف عنده النبي موسى عليه السلام مشرفاً على القدس والبحر الميت.", en: "Venerated holy mount where Prophet Moses surveyed the Promised Land and Jerusalem." }
      }
    ]
  },

  // 7. الكرك
  {
    id: "karak",
    name: { ar: "الكرك", en: "Karak Governorate" },
    title: { ar: "الكرك • قلعة الصمود ووادي الموجب", en: "Karak • Mighty Fortress & Wadi Mujib Grand Canyon" },
    description: {
      ar: "حاضنة قلعة الكرك التاريخية الحصينة وأبراجها المنيعة، وتشرف على وادي الموجب أعمق خوانق الشرق الأوسط المنحدر للبحر الميت.",
      en: "Crown of southern highlands crowned by one of the largest Crusader-Mamluk fortifications, guarding the canyon of Wadi Mujib."
    },
    history: {
      ar: "شيدت القلعة عام 1142 م في موقع استراتيجي يتحكم في قوافل الحج والتجارة بين الشام ومصر والحجاز، وشهدت ملاحم صلاح الدين الأيوبي والظاهر بيبرس.",
      en: "Founded in 1142 by the Crusaders, it later fell to Saladin after epic sieges and was enlarged by Mamluk Sultan Baybars."
    },
    pinPosition: { top: "50%", left: "45%" },
    stampId: "stamp-karak-citadel",
    region: "south",
    coords: [31.1853, 35.7048],
    photos: [
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1000"
    ],
    landmarks: [
      {
        id: "karak-castle",
        name: { ar: "قلعة الكرك الحصينة", en: "Karak Crusader Castle" },
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
        desc: { ar: "حصن أسطوري ذو سراديب مظلمة وأبراج مراقبة ترتفع 1000 متر فوق سطح البحر.", en: "Imposing mountain redoubt with subterranean barracks, stables, and soaring parapets." }
      }
    ]
  },

  // 8. الطفيلة
  {
    id: "tafilah",
    name: { ar: "الطفيلة", en: "Tafilah Governorate" },
    title: { ar: "الطفيلة • محمية ضانا والوديان المعلقة", en: "Tafilah • Dana Biosphere Reserve & Canyons" },
    description: {
      ar: "قلب الطبيعة البكر وأكبر محمية طبيعية في الأردن، تجمع بين أربع مناطق جغرافية حيوية من جبال البحر الأبيض المتوسط وحتى وادي عربة الصحراوي.",
      en: "An untamed paradise containing Jordan's largest biosphere reserve, bridging four biogeographical zones."
    },
    history: {
      ar: "موطن مملكة إدوم القديمة، وتضم أقدم مناجم النحاس في العالم في وادي فينان التي تعود للعصر البرونزي، وقرى أثرية معلقة مثل قرية ضانا والمعطن.",
      en: "Ancient heartland of the Edomites and home to the world's oldest copper mines in Wadi Feynan, inhabited continuously for millennia."
    },
    pinPosition: { top: "58%", left: "44%" },
    stampId: "stamp-tafilah-dana",
    region: "south",
    coords: [30.8375, 35.6042],
    photos: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000"
    ],
    landmarks: [
      {
        id: "dana-reserve",
        name: { ar: "محمية ضانا للمحيط الحيوي", en: "Dana Biosphere Reserve" },
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
        desc: { ar: "جروف صخرية خلابة ومسارات مشي تضم مئات الأنواع النادرة من النباتات والحيوانات.", en: "Spectacular layered canyon reserve boasting 800+ plant species and rare Nubian ibex." }
      }
    ]
  },

  // 9. معان
  {
    id: "maan",
    name: { ar: "معان", en: "Ma'an Governorate" },
    title: { ar: "معان • عاصمة البتراء الوردية وحضارة الأنباط", en: "Ma'an • Home of Petra & the Nabataean Empire" },
    description: {
      ar: "أكبر محافظات الأردن مساحة، تحتضن إحدى عجائب الدنيا السبع (البتراء)، ووادي رم الأسطوري، وقلاع الشوبك التاريخية.",
      en: "Jordan's grandest territorial realm, home to New 7 Wonders of the World Petra, cinematic Wadi Rum, and Shobak fortress."
    },
    history: {
      ar: "نحت الأنباط العرب حضارتهم في صخور البتراء قبل أكثر من 2000 عام وابتكروا شبكات مائية خارقة جعلت منها عاصمة التجارة وقوافل البخور بين الشرق والغرب.",
      en: "The Nabataean Arabs carved their monumental capital into sandstone cliffs over 2,000 years ago, dominating ancient incense routes."
    },
    pinPosition: { top: "72%", left: "40%" },
    stampId: "stamp-maan-petra",
    region: "south",
    coords: [30.1927, 35.7363],
    photos: [
      "https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=1000",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000"
    ],
    landmarks: [
      {
        id: "petra-treasury",
        name: { ar: "خزنة البتراء (السيق)", en: "The Treasury of Petra & The Siq" },
        image: "https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800",
        desc: { ar: "الواجهة الهلنستية المنحوتة في الصخر الوردي المشرقة عند مخرج السيق الصخري.", en: "World-famous 40m rock-carved royal facade unveiled at the mouth of the twisting Siq." }
      },
      {
        id: "wadi-rum",
        name: { ar: "وادي رم (وادي القمر)", en: "Wadi Rum (Valley of the Moon)" },
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
        desc: { ar: "صحراء الرمال الحمراء وجبال الجرانيت الشاهقة ومخيمات التخييم الفلكي.", en: "Protected UNESCO wilderness of rust-red dunes, granite monoliths, and Martian domes." }
      }
    ]
  },

  // 10. العقبة
  {
    id: "aqaba",
    name: { ar: "العقبة", en: "Aqaba Governorate" },
    title: { ar: "العقبة • ثغر الأردن الباسم وبوابة البحر الأحمر", en: "Aqaba • Jordan's Red Sea Gateway & Coral Shores" },
    description: {
      ar: "المنفذ البحري الوحيد للمملكة، ومقصد الغطس العالمي بفضل شعابه المرجانية وحطام السفن والطائرات والطقس الدافئ طوال العام.",
      en: "The Kingdom's sole maritime jewel, offering world-class diving among untouched coral pinnacles and sunken shipwrecks."
    },
    history: {
      ar: "عُرفت قديماً باسم 'آيلة' وشهدت أول كنيسة مبنية في العالم، وكانت ميناء تجارياً رئيسياً منذ العهد النبطي والروماني والإسلامي، وشهدت الثورة العربية الكبرى عام 1917.",
      en: "Ancient Ayla, site of the world's oldest purpose-built church, thriving medieval port city, and turning point of the Great Arab Revolt."
    },
    pinPosition: { top: "88%", left: "33%" },
    stampId: "stamp-aqaba-coral",
    region: "south",
    coords: [29.5321, 35.0063],
    photos: [
      "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=1000"
    ],
    landmarks: [
      {
        id: "aqaba-coral-park",
        name: { ar: "الحديقة البحرية والشعاب المرجانية", en: "Aqaba Marine Coral Reserve" },
        image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800",
        desc: { ar: "ملاذ بحري يحمي أكثر من 500 نوع من الأسماك والشعاب المرجانية النابضة بالحياة.", en: "Crystal clear sanctuary harboring 500+ marine species and the sunken Cedar Pride wreck." }
      }
    ]
  },

  // 11. الزرقاء
  {
    id: "zarqa",
    name: { ar: "الزرقاء", en: "Zarqa Governorate" },
    title: { ar: "الزرقاء • واحات الصحراء وقصور بني أمية", en: "Zarqa • Desert Castles & Azraq Wetland Oasis" },
    description: {
      ar: "تحتضن قصور الصحراء الأموية التراثية العالمية (قصر عمرة وقصر الحلابات) ومحمية الأزرق المائية التي تحط فيها ملايين الطيور المهاجرة.",
      en: "Guardian of UNESCO desert castles adorned with early Islamic frescoes, paired with the tranquil wetland oasis of Azraq."
    },
    history: {
      ar: "كانت استراحة ومحطة لقوافل الحج الشامي، وشهدت تشييد الخلفاء الأمويين قصوراً للصيد والاستجمام في قلب البادية الشرقية.",
      en: "A strategic station along the historic Syrian pilgrim route, where Umayyad caliphs built hunting lodges and palaces."
    },
    pinPosition: { top: "33%", left: "56%" },
    stampId: "stamp-zarqa-amra",
    region: "center",
    coords: [32.0608, 36.0942],
    photos: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000"
    ],
    landmarks: [
      {
        id: "qasr-amra",
        name: { ar: "قصر عمرة الأموي (اليونسكو)", en: "Qasr Amra Desert Castle" },
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
        desc: { ar: "قصر صحراوي فريد يشتهر بجدارياته الفلكية والفنية النادرة من القرن الثامن الميلادي.", en: "UNESCO site renowned for early Islamic figurative frescoes depicting zodiac and royalty." }
      }
    ]
  },

  // 12. المفرق
  {
    id: "mafraq",
    name: { ar: "المفرق", en: "Mafraq Governorate" },
    title: { ar: "المفرق • أم الجمال البازلتية وبوابة البادية", en: "Mafraq • Umm el-Jimal Black Basalt City" },
    description: {
      ar: "بوابة البادية الشمالية، موطن مدينة أم الجمال الأثرية المنحوتة بأكملها من البازلت الأسود والمدرجة مؤخراً على لائحة التراث العالمي (اليونسكو).",
      en: "Gateway to the eastern badia, showcasing the newly inscribed UNESCO city of Umm el-Jimal, engineered from black basalt."
    },
    history: {
      ar: "مدينة نبطية رومانية بيزنطية فريدة ازدهرت في القرون الأولى وطورت نظاماً عبقرياً لحصاد المياه والزراعة في الصحراء.",
      en: "A thriving Nabataean and Byzantine trade post that perfected ingenious ancient rainwater harvesting systems."
    },
    pinPosition: { top: "23%", left: "57%" },
    stampId: "stamp-mafraq-ummeljimal",
    region: "north",
    coords: [32.3424, 36.2081],
    photos: [
      "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1000"
    ],
    landmarks: [
      {
        id: "umm-el-jimal",
        name: { ar: "مدينة أم الجمال البازلتية (اليونسكو)", en: "Umm el-Jimal Black Basalt Ruins" },
        image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800",
        desc: { ar: "واحة البازلت الأسود تضم أكثر من 150 مبنى محفوظاً وكنائس بيزنطية وسدود مياه.", en: "UNESCO basalt stone city boasting multi-story Roman barracks and Byzantine basilicas." }
      }
    ]
  }
];