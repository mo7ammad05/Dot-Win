/**
 * 🇯🇴 بيانات البذور والكتالوجات التجريبية الأولية للمنصة (Mock & Initial Seed Data)
 * متوافقة ومترابطة بالكامل مع لوحة الشرف، التذاكر، الإشعارات، والمكتبة الشاملة للمعالم
 */

import { officialStampsData } from './stamps.data.js';

const allOfficialStampIds = officialStampsData.map((stamp) => stamp.id);

// 1. قائمة المتصدرين ولوحة الشرف (Leaderboard)
export const initialLeaderboard = [
  {
    rank: 1,
    name: "طارق الهاشمي • Tariq H.",
    username: "tariq_hashemi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    level: "Gold",
    levelAr: "مستكشف ذهبي (Gold Legend)",
    completedTrips: 18,
    totalPoints: 3500,
    followersCount: 540,
    followingCount: 89,
    isVerified: true,
    stamps: allOfficialStampIds
  },
  {
    rank: 2,
    name: "سارة المجالي • Sarah M.",
    username: "sarah_majali",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    level: "Gold",
    levelAr: "مستكشف ذهبي",
    completedTrips: 14,
    totalPoints: 2800,
    followersCount: 412,
    followingCount: 110,
    isVerified: true,
    stamps: allOfficialStampIds
  },
  {
    rank: 3,
    name: "عمر القاسم • Omar Q.",
    username: "omar_qasim",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    level: "Silver",
    levelAr: "مستكشف فضي",
    completedTrips: 11,
    totalPoints: 2150,
    followersCount: 280,
    followingCount: 145,
    isVerified: false
  },
  {
    rank: 4,
    name: "ليلى خوري • Layla K.",
    username: "layla_khoury",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    level: "Silver",
    levelAr: "مستكشف فضي",
    completedTrips: 9,
    totalPoints: 1920,
    followersCount: 195,
    followingCount: 88,
    isVerified: false
  },
  {
    rank: 5,
    name: "حمزة النجار • Hamzah N.",
    username: "hamzah_najjar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    level: "Silver",
    levelAr: "مستكشف فضي",
    completedTrips: 8,
    totalPoints: 1740,
    followersCount: 160,
    followingCount: 95,
    isVerified: false
  },
  {
    rank: 6,
    name: "زين التميمي • Zein T.",
    username: "zein_tamimi",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    level: "Silver",
    levelAr: "مستكشف فضي",
    completedTrips: 7,
    totalPoints: 1610,
    followersCount: 132,
    followingCount: 74,
    isVerified: false
  },
  {
    rank: 12,
    name: "محمد الشوابكة (أنت) • You",
    username: "sh3sher",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    level: "Silver",
    levelAr: "مستكشف فضي",
    completedTrips: 6,
    totalPoints: 1450,
    isCurrentUser: true,
    followersCount: 342,
    followingCount: 128,
    isVerified: true,
    stamps: allOfficialStampIds
  }
];

// 2. الحجوزات الأولية المسجلة في النظام (Bookings)
export const initialBookings = [
  {
    id: "JO-BK-7890",
    bookingRef: "JO-EXP-2026-7890",
    customerName: "محمد الشوابكة",
    customerPhone: "+962 7 9123 4567",
    customerEmail: "sh3sher@domain.jo",
    destinationId: "petra-rose-city",
    destinationTitle: {
      ar: "مدينة البتراء الوردية وكنز الأنباط",
      en: "Petra Rose City & Treasury by Candlelight"
    },
    date: "2026-10-15",
    timeSlot: "08:00 ص",
    guests: 2,
    totalPriceJOD: 125,
    paymentMode: "cliq",
    status: "confirmed",
    cliqRef: "CLIQ-REF-99412",
    activationCode: "CLIQ-ACT-7890",
    createdAt: "منذ ساعتين"
  },
  {
    id: "JO-BK-7891",
    bookingRef: "JO-EXP-2026-7891",
    customerName: "فرح الزعبي",
    customerPhone: "+962 7 8876 5432",
    customerEmail: "farah.z@example.jo",
    destinationId: "wadi-rum-stargazing",
    destinationTitle: {
      ar: "وادي رم • وادي القمر والتخييم الفلكي",
      en: "Wadi Rum Desert Expedition"
    },
    date: "2026-10-20",
    timeSlot: "02:00 م",
    guests: 3,
    totalPriceJOD: 255,
    paymentMode: "cliq",
    status: "pending",
    cliqRef: "CLIQ-REF-11209",
    createdAt: "منذ 15 دقيقة"
  },
  {
    id: "JO-BK-7892",
    bookingRef: "JO-EXP-2026-7892",
    customerName: "David Miller",
    customerPhone: "+44 20 7946 0991",
    customerEmail: "dmiller@london.uk",
    destinationId: "dead-sea-retreat",
    destinationTitle: {
      ar: "البحر الميت • منتجع الاسترخاء والعلاج",
      en: "Dead Sea Wellness Sanctuary"
    },
    date: "2026-10-08",
    timeSlot: "09:00 ص",
    guests: 1,
    totalPriceJOD: 50,
    paymentMode: "card",
    status: "confirmed",
    createdAt: "منذ يوم"
  }
];

// 3. الإشعارات والتنبيهات المترابطة (Notifications)
export const initialNotifications = [
  {
    id: "notif-1",
    title: { ar: "تم تأكيد الحجز: جولة البتراء ليلاً بنجاح", en: "Booking Confirmed: Petra Night Tour" },
    time: { ar: "منذ 5 دقائق", en: "5m ago" },
    read: false,
    type: "booking",
    targetUrl: "profile.html"
  },
  {
    id: "notif-2",
    title: { ar: "تفعيل كليك: تمت الموافقة على حوالتك لحجز #JO-7890", en: "CliQ Activation: Booking approved" },
    time: { ar: "منذ ساعتين", en: "2h ago" },
    read: false,
    type: "cliq",
    targetUrl: "ticket.html?ref=JO-BK-7890"
  },
  {
    id: "notif-3",
    title: { ar: "حصلت على +150 نقطة استكشاف من دعوة صديقك", en: "+150 Points earned from referral" },
    time: { ar: "منذ يوم", en: "1d ago" },
    read: false,
    type: "reward",
    targetUrl: "passport.html"
  },
  {
    id: "notif-4",
    title: { ar: "خريطة الأردن التفاعلية وأختام المحافظات الـ 12 متاحة للتصفح", en: "Interactive Map & 12 Governorates Ready" },
    time: { ar: "منذ 3 ساعات", en: "3h ago" },
    read: true,
    type: "map",
    targetUrl: "map.html"
  },
  {
    id: "notif-5",
    title: { ar: "خصومات حصرية جديدة على رحلات وادي رم وجرش", en: "Explore Deals in Wadi Rum & Jerash" },
    time: { ar: "منذ 6 ساعات", en: "6h ago" },
    read: true,
    type: "deals",
    targetUrl: "explore.html"
  }
];

// 4. منشورات منتدى السياح والمجتمع (Community Stories)
export const initialCommunityPosts = [
  {
    id: "post-1",
    authorName: "سارة المجالي • Sarah M.",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    authorLevel: "مستكشف ذهبي • Gold",
    isVerified: true,
    authorStamps: allOfficialStampIds,
    destinationId: "petra-rose-city",
    destinationName: { ar: "مدينة البتراء الوردية", en: "Petra Rose City" },
    title: {
      ar: "لحظة وصولي إلى الدير (Monastery) بعد صعود 850 درجة صخرية!",
      en: "The unforgettable moment reaching the Monastery after 850 steps!"
    },
    content: {
      ar: "الصعود كان متعب لكن المنظر من فوق بين الجبال الوردية خيالي يفوق الوصف. نصيحة لكل من يزور البتراء: ابدأوا الرحلة من الصباح الباكر (الساعة 7:00) لتجنب حرارة الشمس واستمتعوا بكأس شاي مع الميرمية عند أعلى قمة مطلة على وادي عربة. حجزت الجولة مباشرة عبر كليك والدليل المحلي كان رائعاً!",
      en: "The climb was challenging, but the panoramic view atop the rose mountains is surreal. Start early at 7:00 AM to beat the heat!"
    },
    imageUrl: "https://images.unsplash.com/photo-1579606032834-deffd359146f?w=1000",
    likesCount: 142,
    isLiked: true,
    createdAt: "منذ ساعتين",
    tags: ["#البتراء", "#الدير_البتراء", "#الأردن_تاريخ"],
    comments: [
      {
        id: "c-1",
        authorName: "طارق الهاشمي",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        isVerified: true,
        authorStamps: allOfficialStampIds,
        text: "أجمل مكان في الأردن بلا منازع! الشاي عند مطل وادي عربة تجربة لا تفوت.",
        createdAt: "منذ ساعة"
      },
      {
        id: "c-2",
        authorName: "محمد الشوابكة",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        isVerified: true,
        authorStamps: allOfficialStampIds,
        text: "تصويرك مذهل يا سارة! رحلتي القادمة ستكون لنفس المسار الأسبوع القادم.",
        createdAt: "منذ 30 دقيقة"
      }
    ]
  },
  {
    id: "post-2",
    authorName: "عمر القاسم • Omar Q.",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    authorLevel: "مستكشف فضي • Silver",
    isVerified: true,
    authorStamps: allOfficialStampIds,
    destinationId: "wadi-rum-stargazing",
    destinationName: { ar: "وادي رم • التخييم الفلكي", en: "Wadi Rum Stargazing" },
    title: {
      ar: "ليلة لن أنساها تحت مجرة درب التبانة في قبة المريخ بوادي رم ✨",
      en: "An unforgettable night under the Milky Way in a Martian Dome ✨"
    },
    content: {
      ar: "هدوء الصحراء ليلاً وعشاء الزرب البدوي المدفون تحت الرمال من أروع ما جربت في حياتي. التلسكوبات الفلكية أظهرت لنا كوكب زحل وحلقاته بوضوح تام! لا تفوتوا جولة سيارات الجيب 4x4 وقت الغروب بين جبال الديسة.",
      en: "The absolute tranquility of the desert and traditional underground Zarb feast was phenomenal."
    },
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000",
    likesCount: 98,
    isLiked: false,
    createdAt: "منذ 5 ساعات",
    tags: ["#وادي_رم", "#درب_التبانة", "#سفاري_الأردن"],
    comments: [
      {
        id: "c-3",
        authorName: "ليلى خوري",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        text: "هل كان الجو بارداً في الليل؟ نخطط للتخييم هناك نهاية الشهر!",
        createdAt: "منذ ساعتين"
      }
    ]
  }
];

// 5. سجل نقاط الولاء التنافسية (Points Ledger)
export const initialPointsLedger = [
  {
    id: "tx-1",
    title: { ar: "مكافأة دعوة صديق (إحالة ناجحة)", en: "Referral Bonus: Invited a friend" },
    points: 150,
    type: "+",
    date: "أمس • 29 أيلول 2026"
  },
  {
    id: "tx-2",
    title: { ar: "إتمام رحلة البتراء ليلاً", en: "Completed Trip: Petra by Night" },
    points: 200,
    type: "+",
    date: "18 أيلول 2026"
  },
  {
    id: "tx-3",
    title: { ar: "خصم نقاط عند حجز رحلة البحر الميت", en: "Points Redeemed on Booking" },
    points: 50,
    type: "-",
    date: "10 أيلول 2026"
  },
  {
    id: "tx-4",
    title: { ar: "مكافأة التسجيل الترحيبية وتأكيد البريد", en: "Welcome Bonus: Account Creation" },
    points: 500,
    type: "+",
    date: "01 أيلول 2026"
  }
];

// 6. المكتبة الشاملة للمعالم السياحية البارزة (Master Landmarks)
export const initialMasterLandmarks = [
  {
    id: "lm-siq",
    name: { ar: "ممر السيق الصخري (The Siq)", en: "The Siq Sandstone Gorge" },
    tag: { ar: "أعجوبة طبيعية", en: "Natural Wonder" },
    desc: {
      ar: "ممر صخري ضيق وساحر يمتد بطول 1.2 كم بين جدران جبلية ملونة ترتفع لأكثر من 80 متراً ينتهي بمشهد الخزينة المذهل.",
      en: "A dramatic 1.2km narrow winding canyon with towering 80m colorful cliffs leading to the Treasury."
    },
    image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800",
    governorateId: "maan",
    rating: 4.9
  },
  {
    id: "lm-treasury",
    name: { ar: "خزينة الفرعون (Al-Khazneh)", en: "The Treasury (Al-Khazneh)" },
    tag: { ar: "أيقونة الأنباط", en: "Nabataean Icon" },
    desc: {
      ar: "واجهة هلنستية أسطورية بارتفاع 40 متراً حفرها الأنباط يدوياً في قلب الصخر الوردي في القرن الأول الميلادي.",
      en: "Masterpiece 1st-century Hellenistic rock-cut facade standing 40m tall, carved into pink sandstone."
    },
    image: "https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800",
    governorateId: "maan",
    rating: 5.0
  },
  {
    id: "lm-monastery",
    name: { ar: "الدير الأثري (Ad-Deir)", en: "Ad-Deir Monastery" },
    tag: { ar: "قمة الجبل", en: "Mountain Peak Monument" },
    desc: {
      ar: "أضخم واجهة معمارية في البتراء بعرض 50 متراً تقع في أعلى الجبل وتتطلب صعود 800 درجة صخرية.",
      en: "The largest monument in Petra measuring 50m wide, reached via 800 carved mountain steps."
    },
    image: "https://images.unsplash.com/photo-1580834341580-8c17a3a632ec?w=800",
    governorateId: "maan",
    rating: 4.95
  },
  {
    id: "lm-rum-dunes",
    name: { ar: "الكثبان الحمراء ووادي القمر", en: "Wadi Rum Crimson Dunes" },
    tag: { ar: "سفاري وصحراء", en: "Desert Safari" },
    desc: {
      ar: "رمال حمراء ناعمة تمتد بين جبال الجرانيت الصخرية في وادي رم، مثالية للتزلج على الرمال والتقاط الصور الفلكية.",
      en: "Vast crimson sand dunes stretching between soaring granite mountains."
    },
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
    governorateId: "aqaba",
    rating: 4.88
  },
  {
    id: "lm-jerash-columns",
    name: { ar: "شارع الأعمدة الهلنستي بجرش", en: "Jerash Colonnaded Street" },
    tag: { ar: "الآثار الرومانية", en: "Roman Heritage" },
    desc: {
      ar: "شارع أثري مبلط بطول 800 متر محفوف بأكثر من 500 عمود كورنثي مهيب يعكس عظمة مدينة جراسا الرومانية.",
      en: "An 800m stone-paved Roman avenue flanked by over 500 magnificent Corinthian columns."
    },
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
    governorateId: "jerash",
    rating: 4.85
  },
  {
    id: "lm-deadsea-salt",
    name: { ar: "شواطئ وتشكيلات الملح بالبحر الميت", en: "Dead Sea Salt Formations" },
    tag: { ar: "استجمام وشعاب الملح", en: "Wellness & Salt Formations" },
    desc: {
      ar: "بلورات ملحية ناصعة البياض تتشكل كشعاب مرجانية على ضفاف أخفض نقطة على سطح الأرض.",
      en: "Pure white salt crystals and natural mineral formations along the shores of the Dead Sea."
    },
    image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800",
    governorateId: "balqa",
    rating: 4.92
  }
];