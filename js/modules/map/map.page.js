/**
 * 🇯🇴 Jordan Tour - Interactive Map Page Controller
 * مسار الملف: js/modules/map/map.page.js
 * مشغل صفحة الخريطة التفاعلية بالكامل، يربط الدبابيس، معرض الوسائط، والأختام التذكارية
 */

import { store } from '../../state/store.js';
import { PinManager } from './pin-manager.js';
import { officialStampsData } from '../../data/stamps.data.js';
import { loadStampCatalog } from '../passport/stamp-collector.js';

export class MapPage {
  constructor() {
    this.pinManager = null;
    this.governorates = [];
    this.stamps = officialStampsData;
    this.selectedGovId = 'amman';
    this.activeMediaTab = 'photos'; // 'photos' | 'video'
    this.defaultMapBg = 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=1200&auto=format&fit=crop&q=80';
  }

  /**
   * تهيئة الصفحة وجلب البيانات الأولية
   */
  async init() {
    this.stamps = await loadStampCatalog();
    await this.loadGovernoratesData();
    this.setupDOMElements();
    this.initMapPins();
    this.renderQuickSwitcher();
    this.renderGovernorateDetails(this.selectedGovId);
    this.setupEventListeners();
  }

  /**
   * تحميل بيانات المحافظات الـ 12 (من الكاش أو Firestore مع بيانات احتياطية كاملة)
   */
  async loadGovernoratesData() {
    // محاولة قراءة المحافظات المحدثة من كاش التخزين أو Firestore
    try {
      if (window.JordanFirebase && window.JordanFirebase.db) {
        const doc = await window.JordanFirebase.db.collection('settings').doc('governorates_data').get();
        if (doc.exists && doc.data().list && doc.data().list.length > 0) {
          this.governorates = doc.data().list;
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback to local governorates data:', e.message);
    }

    // البيانات الاحتياطية الرسمية المتكاملة للمحافظات الـ 12 مع إحداثيات الدبابيس الدقيقة
    this.governorates = [
      {
        id: 'amman',
        name: { ar: 'العاصمة عمان', en: 'Amman' },
        title: { ar: 'مدينة التلال السبعة وتناغم الأصالة مع الحداثة', en: 'City of Seven Hills & Cultural Harmony' },
        description: {
          ar: 'عاصمة المملكة ومركزها الثقافي والتاريخي، تحتضن جبل القلعة والمدرج الروماني وأسواق وسط البلد العريقة.',
          en: 'Jordan’s vibrant capital combining Roman antiquity with modern cafes and colorful traditional souks.'
        },
        history: {
          ar: 'يعود تاريخها لآلاف السنين منذ العصر العموني (ربة عمون) ثم فيلادلفيا الرومانية في حلف الديكابولس حتى تأسيس المملكة الحديثة.',
          en: 'Steeped in history from ancient Ammonite Rabbath-Ammon to Roman Philadelphia.'
        },
        pinPosition: { top: '38%', left: '46%' },
        stampId: 'stamp-amman-citadel',
        landmarks: [
          { id: 'citadel', name: { ar: 'جبل القلعة ومعبد هرقل', en: 'Amman Citadel' }, desc: { ar: 'أعلى تلال عمان وإطلالة ساحرة على المسرح الروماني.', en: 'Historic hilltop with ancient Roman and Umayyad ruins.' }, image: 'https://images.unsplash.com/photo-1580834390184-f3c880629737?w=600&auto=format&fit=crop&q=80' },
          { id: 'roman-theatre', name: { ar: 'المدرج الروماني', en: 'Roman Theatre' }, desc: { ar: 'مسرح روماني منحوت بالجبل يتسع لـ 6000 متفرج.', en: 'Impressive 2nd-century Roman landmark seating 6,000.' }, image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1580834390184-f3c880629737?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800&auto=format&fit=crop&q=80'
        ],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      },
      {
        id: 'maan',
        name: { ar: 'معان (البتراء)', en: 'Ma’an (Petra)' },
        title: { ar: 'عروس الأنباط وأعجوبة العالم الوردية', en: 'Nabataean Capital & Rose-Red Wonder' },
        description: {
          ar: 'تحتضن البتراء عاصمة الأنباط المحفورة في الصخر، ووادي رم الساحر بصحرائه وتخييمه تحت النجوم.',
          en: 'Home of the UNESCO World Heritage rose city of Petra and dramatic Martian deserts of Wadi Rum.'
        },
        history: {
          ar: 'مهد الحضارة النبطية منذ القرن السادس قبل الميلاد، ومقر عبقرية هندسة السدود والقنوات المائية المعجزة.',
          en: 'Cradle of Nabataean hydraulic genius and ancient incense trade crossroads.'
        },
        pinPosition: { top: '74%', left: '41%' },
        stampId: 'stamp-maan-petra',
        landmarks: [
          { id: 'petra-treasury', name: { ar: 'خزنة البتراء والسيق', en: 'Petra Treasury & Siq' }, desc: { ar: 'الواجهة الهلنستية المنحوتة في قلب الجبل الوردي.', en: 'Masterpiece facade carved deep into the rose sandstone cliffs.' }, image: 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=600&auto=format&fit=crop&q=80' },
          { id: 'wadi-rum', name: { ar: 'وادي رم (وادي القمر)', en: 'Wadi Rum Desert' }, desc: { ar: 'رمال حمراء وجبال صخرية عملاقة ورصد النجوم.', en: 'Mars-like landscapes, Bedouin tea, and starry desert skies.' }, image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80'
        ],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      },
      {
        id: 'jerash',
        name: { ar: 'جرش', en: 'Jerash' },
        title: { ar: 'بومبي الشرق ومدينة الألف عمود', en: 'Pompeii of the East & City of 1,000 Columns' },
        description: {
          ar: 'من أفضل المدن الرومانية المحفوظة في العالم، تتباهى بالساحة البيضاوية وشارع الأعمدة والمسارح الصوتية.',
          en: 'One of the best-preserved Greco-Roman provincial cities anywhere in the ancient world.'
        },
        history: {
          ar: 'ازدهرت كمدينة رئيسية في حلف الديكابولس وعرفت باسم جراسا في العصر الذهبي الروماني.',
          en: 'Flourished in the Roman Decapolis alliance under Emperor Hadrian.'
        },
        pinPosition: { top: '27%', left: '44%' },
        stampId: 'stamp-jerash-hadrian',
        landmarks: [
          { id: 'oval-plaza', name: { ar: 'الساحة البيضاوية الرومانية', en: 'The Oval Plaza' }, desc: { ar: 'تحفة معمارية مبلطة محاطة بأعمدة أيونية.', en: 'Iconic spacious plaza enclosed by grand columns.' }, image: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80'
        ],
        videoUrl: ''
      },
      {
        id: 'aqaba',
        name: { ar: 'العقبة', en: 'Aqaba' },
        title: { ar: 'ثغر الأردن الباسم وبوابة البحر الأحمر المشرقة', en: 'Jordan’s Sunlit Red Sea Paradise' },
        description: {
          ar: 'المنفذ البحري الوحيد للمملكة الأردنية، موطن أندر الحدائق المرجانية في العالم ومواقع الغوص العالمية.',
          en: 'Jordan’s southern coastal escape with pristine fringing coral reefs and clear warm waters.'
        },
        history: {
          ar: 'عرفت تاريخياً بميناء أيلة الإسلامي وأولى محطات التجارة البحرية، وقلعة الشريف الحسين بن علي.',
          en: 'Historic maritime port of Ayla and fortress of the Great Arab Revolt.'
        },
        pinPosition: { top: '88%', left: '32%' },
        stampId: 'stamp-aqaba-coral',
        landmarks: [
          { id: 'marine-park', name: { ar: 'محمية العقبة البحرية والشعاب', en: 'Aqaba Marine Coral Park' }, desc: { ar: 'مياه دافئة وغوص لاستكشاف المرجان والطائرة الغارقة.', en: 'World-renowned scuba diving and coral reef sanctuaries.' }, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80'
        ],
        videoUrl: ''
      },
      {
        id: 'ajloun',
        name: { ar: 'عجلون', en: 'Ajloun' },
        title: { ar: 'مملكة الغابات الخضراء وقلعة الربض الأيوبية', en: 'Highland Pine Forests & Ayyubid Fortress' },
        description: {
          ar: 'تكسوها غابات السنديان والصنوبر وتتميز بتلفريك عجلون السياحي وقلعة صلاح الدين الصامدة.',
          en: 'Breathtaking green mountains, scenic cable car, and Saladin’s commanding fortress.'
        },
        history: {
          ar: 'بنى القلعة القائد عز الدين أسامة عام 1184م لصد هجمات الصليبيين وحماية طرق التجارة.',
          en: 'Strategic 12th-century military citadel built to control iron mines and trade routes.'
        },
        pinPosition: { top: '25%', left: '39%' },
        stampId: 'stamp-ajloun-castle',
        landmarks: [
          { id: 'ajloun-castle', name: { ar: 'قلعة عجلون (قلعة الربض)', en: 'Ajloun Castle' }, desc: { ar: 'حصن إسلامي شاهق يطل على غور الأردن وفلسطين.', en: 'Spectacular Islamic hilltop fortress with views over Jordan Valley.' }, image: 'https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: ['https://images.unsplash.com/photo-1544971587-b842c27f8e14?w=800&auto=format&fit=crop&q=80'],
        videoUrl: ''
      },
      {
        id: 'irbid',
        name: { ar: 'إربد', en: 'Irbid' },
        title: { ar: 'عروس الشمال وسلة غذاء الأردن وشرفة أم قيس', en: 'Bride of the North & Ancient Gadara' },
        description: {
          ar: 'مدينة الجامعات والسهول الخصبة، وتطل شرفة أم قيس البازلتية على بحيرة طبريا وهضبة الجولان.',
          en: 'Fertile northern rolling hills, vibrant academic life, and the Greco-Roman ruins of Umm Qais.'
        },
        history: {
          ar: 'عرفت باسم أرابيلا، وموطن الفيلسوف أرابيوس الذي سطر حكمته الخالدة بالصخر.',
          en: 'Ancient Arabella and site of Decapolis philosopher Arabius.'
        },
        pinPosition: { top: '19%', left: '42%' },
        stampId: 'stamp-irbid-ummqais',
        landmarks: [
          { id: 'umm-qais', name: { ar: 'أم قيس (جدارا البازلتية)', en: 'Umm Qais (Gadara)' }, desc: { ar: 'مدرج روماني بالحجر الأسود وإطلالة بحيرة طبريا.', en: 'Black basalt ruins looking across the Sea of Galilee.' }, image: 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: ['https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800&auto=format&fit=crop&q=80'],
        videoUrl: ''
      },
      {
        id: 'balqa',
        name: { ar: 'البلقاء (السلط)', en: 'Balqa (As-Salt)' },
        title: { ar: 'مدينة التسامح والضيافة الحضرية (اليونسكو)', en: 'UNESCO City of Tolerance & Yellow Limestone' },
        description: {
          ar: 'تتميز بعمارتها الحجرية الصفراء الرائعة، وشارع الحمام التراثي ومطل الستين الساحر.',
          en: 'Famous for warm urban hospitality, unique yellow sandstone houses, and historic alleys.'
        },
        history: {
          ar: 'أول عاصمة إدارية لمنطقة شرق الأردن ونموذج عالمي مسجل باليونسكو للتعايش الديني والإنساني.',
          en: 'World-renowned heritage hub celebrating harmonious communal coexistence.'
        },
        pinPosition: { top: '34%', left: '41%' },
        stampId: 'stamp-balqa-salt',
        landmarks: [
          { id: 'hammam-st', name: { ar: 'شارع الحمام التراثي', en: 'Hammam Historic Street' }, desc: { ar: 'أقدم أسواق السلط بمحلاته الشعبية العريقة.', en: 'Charming pedestrian alley featuring local markets and traditional craft shops.' }, image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: ['https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80'],
        videoUrl: ''
      },
      {
        id: 'madaba',
        name: { ar: 'مادبا', en: 'Madaba' },
        title: { ar: 'عاصمة الفسيفساء وجبل نيبو المقدس', en: 'City of Mosaics & Mount Nebo Pilgrimage' },
        description: {
          ar: 'تضم أقدم خريطة جغرافية فسيفسائية للأراضي المقدسة، والمغطس على نهر الأردن وجبل نيبو.',
          en: 'Renowned for the 6th-century mosaic map of Jerusalem and holy vistas of Mount Nebo.'
        },
        history: {
          ar: 'حاضرة مؤابية ثم بيزنطية ازدهر فيها فن صناعة الفسيفساء الحجري الذي لا يبهت ألوانه أبداً.',
          en: 'Biblical center known for master stonemasons and early Christian artistry.'
        },
        pinPosition: { top: '44%', left: '44%' },
        stampId: 'stamp-madaba-mosaic',
        landmarks: [
          { id: 'mount-nebo', name: { ar: 'جبل نيبو المقدس', en: 'Mount Nebo' }, desc: { ar: 'الموقع المقدس المشرف على وادي الأردن والبحر الميت.', en: 'Memorial church where Moses viewed the Holy Land.' }, image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80'],
        videoUrl: ''
      },
      {
        id: 'karak',
        name: { ar: 'الكرك', en: 'Karak' },
        title: { ar: 'قلب الجنوب وقلعة المؤابيين والصمود', en: 'Moabite Heartland & Impregnable Castle' },
        description: {
          ar: 'تشتهر بقلعة الكرك التاريخية الحصينة وأنفاقها الأثرية، وموطن المنسف بالجميد البلدي الكركي.',
          en: 'Towering mountain redoubt famed for its massive Crusader fortress and deep valleys.'
        },
        history: {
          ar: 'عاصمة مملكة مؤاب القديمة وشاهدة على ملاحم تاريخية كبرى ومقامات شهداء معركة مؤتة.',
          en: 'Ancient capital of Kir of Moab and crossroads of legendary desert battles.'
        },
        pinPosition: { top: '56%', left: '43%' },
        stampId: 'stamp-karak-citadel',
        landmarks: [
          { id: 'karak-castle', name: { ar: 'قلعة الكرك الصليبية', en: 'Karak Castle' }, desc: { ar: 'متاهات وأنفاق حجرية ضخمة تطل على وادي الموجب.', en: 'Colossal fortified halls and dark subterranean passages.' }, image: 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: ['https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800&auto=format&fit=crop&q=80'],
        videoUrl: ''
      },
      {
        id: 'tafilah',
        name: { ar: 'الطفيلة', en: 'Tafilah' },
        title: { ar: 'درة المحميات الطبيعية وعيون المياه', en: 'Dana Biosphere & Edomite Highlands' },
        description: {
          ar: 'تحتضن محمية ضانا للمحيط الحيوي وحمامات عفرا المعدنية وقرية المعطن التراثية الساحرة.',
          en: 'Dramatic biodiversity sanctuary featuring Dana Biosphere and soothing hot springs.'
        },
        history: {
          ar: 'مملكة الأدوميين القديمة وموقع نحت المسلة البابلية الفريدة في صخور قلعة السلع الشاهقة.',
          en: 'Ancient Edomite kingdom with dramatic cliffs and centuries-old olive orchards.'
        },
        pinPosition: { top: '65%', left: '42%' },
        stampId: 'stamp-tafilah-dana',
        landmarks: [
          { id: 'dana-reserve', name: { ar: 'محمية ضانا الطبيعية', en: 'Dana Biosphere Reserve' }, desc: { ar: 'أكبر محمية بيئية في الأردن ومسارات المشي الجبلي.', en: 'Jordan’s premier canyon trekking and wildlife refuge.' }, image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: ['https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80'],
        videoUrl: ''
      },
      {
        id: 'zarqa',
        name: { ar: 'الزرقاء', en: 'Zarqa' },
        title: { ar: 'واحة الأزرق وقصر عمرة الأموي العالمي', en: 'Azraq Desert Oasis & Umayyad Frescoes' },
        description: {
          ar: 'تجمع بين محمية الأزرق المائية لإيواء الطيور ومحمية الشومري للمها العربي وقصور الصحراء.',
          en: 'Eastern desert plains with vital wetland migratory routes and royal desert castles.'
        },
        history: {
          ar: 'ازدهرت في العهد الأموي كقصور للصيد والاستجمام واشتهر قصر عمرة بجدارياته الفلكية الفريدة.',
          en: 'Famous for early Islamic Umayyad desert residences and 8th-century fresco art.'
        },
        pinPosition: { top: '35%', left: '57%' },
        stampId: 'stamp-zarqa-amra',
        landmarks: [
          { id: 'qasr-amra', name: { ar: 'قصر عمرة الأموي (اليونسكو)', en: 'Qasr Amra (UNESCO)' }, desc: { ar: 'جداريات ملونة وأول خريطة فلكية مقببة في التاريخ.', en: 'UNESCO-listed desert palace covered with exquisite historic frescoes.' }, image: 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: ['https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800&auto=format&fit=crop&q=80'],
        videoUrl: ''
      },
      {
        id: 'mafraq',
        name: { ar: 'المفرق', en: 'Mafraq' },
        title: { ar: 'بوابة البادية وواحة أم الجمال البازلتية السوداء', en: 'Black Basalt Oasis & Gateway to Desert' },
        description: {
          ar: 'ثاني كبرى المحافظات مساحة، تحتضن مدينة أم الجمال الأثرية المسجلة حديثاً على قائمة اليونسكو.',
          en: 'Vast northern desert expanse home to the black basalt stone wonder of Umm el-Jimal.'
        },
        history: {
          ar: 'محطة رئيسية على خط سكة حديد الحجاز وطريق القوافل القديم وأقدم الكنائس التاريخية في رحاب.',
          en: 'Vital station along the Hejaz railway and ancient Roman-Byzantine desert frontier.'
        },
        pinPosition: { top: '22%', left: '60%' },
        stampId: 'stamp-mafraq-ummeljimal',
        landmarks: [
          { id: 'umm-jimal', name: { ar: 'مدينة أم الجمال البازلتية (اليونسكو)', en: 'Umm el-Jimal UNESCO' }, desc: { ar: 'مدينة أثرية كاملة مبنية بالحجر البازلتي الأسود.', en: 'Intriguing black basalt desert town with ancient stone doors.' }, image: 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=600&auto=format&fit=crop&q=80' }
        ],
        photos: ['https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800&auto=format&fit=crop&q=80'],
        videoUrl: ''
      }
    ];
  }

  /**
   * تجهيز عناصر الـ DOM والتأكد من وجود الحاويات
   */
  setupDOMElements() {
    this.mapContainer = document.getElementById('map-canvas-container');
    this.switcherContainer = document.getElementById('governorates-switcher');
    this.detailsContainer = document.getElementById('governorate-details-mount');
  }

  /**
   * تهيئة وتفعيل موديول الدبابيس التفاعلية PinManager
   */
  initMapPins() {
    if (!this.mapContainer) return;

    this.pinManager = new PinManager({
      container: this.mapContainer,
      governorates: this.governorates,
      onSelect: (selectedGov) => {
        this.selectedGovId = selectedGov.id;
        this.renderQuickSwitcher();
        this.renderGovernorateDetails(selectedGov.id);
      }
    });

    this.pinManager.render();
  }

  /**
   * رسم شريط التبديل السريع للمحافظات الـ 12 بالأعلى
   */
  renderQuickSwitcher() {
    if (!this.switcherContainer) return;

    const isArabic = (store.language === 'ar');
    this.switcherContainer.innerHTML = '';

    this.governorates.forEach((gov) => {
      const isSelected = (gov.id === this.selectedGovId);
      const name = isArabic ? (gov.name?.ar || gov.name) : (gov.name?.en || gov.name);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
        isSelected
          ? 'bg-gradient-to-r from-[#C86D51] to-[#B45A3E] text-white shadow-sm ring-2 ring-[#C86D51]/30 scale-105'
          : 'bg-[#FAF8F5] text-slate-700 hover:bg-slate-200 border border-slate-200 hover:border-slate-300'
      }`;

      btn.innerHTML = `
        <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300 animate-pulse' : 'bg-slate-400'}"></span>
        <span>${name}</span>
      `;

      btn.addEventListener('click', () => {
        this.selectedGovId = gov.id;
        if (this.pinManager) {
          this.pinManager.selectGovernorate(gov.id, true);
        }
        this.renderQuickSwitcher();
        this.renderGovernorateDetails(gov.id);
      });

      this.switcherContainer.appendChild(btn);
    });
  }

  /**
   * عرض التفاصيل الكاملة للمحافظة المختارة، المعالم، المعرض، والختم التراثي
   * @param {string} govId
   */
  renderGovernorateDetails(govId) {
    if (!this.detailsContainer) return;

    const isArabic = (store.language === 'ar');
    const gov = this.governorates.find((g) => g.id === govId) || this.governorates[0];
    const stamp = this.stamps.find((s) => s.governorateId === gov.id || s.id === gov.stampId);

    const name = isArabic ? (gov.name?.ar || gov.name) : (gov.name?.en || gov.name);
    const title = isArabic ? (gov.title?.ar || gov.title) : (gov.title?.en || gov.title);
    const description = isArabic ? (gov.description?.ar || gov.description) : (gov.description?.en || gov.description);
    const history = isArabic ? (gov.history?.ar || gov.history) : (gov.history?.en || gov.history);

    const stampName = stamp ? (isArabic ? stamp.name.ar : stamp.name.en) : (isArabic ? 'ختم معتمد' : 'Verified Seal');
    const stampRarity = stamp?.rarity || 'Heritage';
    const stampColor = stamp?.color || '#C86D51';

    this.detailsContainer.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        <!-- الرأس وشعار الختم -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span class="text-xs font-bold text-[#C86D51] uppercase tracking-wider block mb-1">
              ${name}
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
              ${title}
            </h2>
          </div>

          <!-- بطاقة الختم التذكاري المكتسب -->
          <div class="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-slate-200 shrink-0">
            <div class="w-14 h-14 rounded-full flex items-center justify-center p-1 border-2 border-dashed shadow-xs" style="border-color: ${stampColor}; background: radial-gradient(circle, ${stampColor}15 0%, transparent 80%); color: ${stampColor};">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-[#D97706] block">
                ${isArabic ? 'الختم المكتسب عند الزيارة:' : 'Earned Passport Stamp:'}
              </span>
              <span class="font-extrabold text-xs text-[#1E293B] block leading-tight">
                ${stampName}
              </span>
              <span class="text-[10px] text-slate-500 font-mono">
                ${stampRarity} Seal • +${stamp?.xp || 150} XP
              </span>
            </div>
          </div>
        </div>

        <!-- النبذة والتاريخ -->
        <div class="space-y-4">
          <div>
            <h4 class="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span class="text-[#C86D51]">✨</span>
              <span>${isArabic ? 'نبذة عن المحافظة:' : 'About this Governorate:'}</span>
            </h4>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ${description}
            </p>
          </div>

          <div class="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
            <h4 class="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>📖</span>
              <span>${isArabic ? 'تاريخها وأصالتها العريقة:' : 'Historical Heritage & Roots:'}</span>
            </h4>
            <p class="text-xs text-amber-950 leading-relaxed font-arabic">
              ${history}
            </p>
          </div>
        </div>

        <!-- أبرز الأماكن والمعالم -->
        <div class="space-y-3 pt-2">
          <h4 class="font-extrabold text-sm text-[#1E293B] flex items-center gap-2">
            <svg class="w-4 h-4 text-[#C86D51]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>${isArabic ? 'أبرز الأماكن والمعالم الأثرية في المحافظة:' : 'Highlighted Places & Landmarks:'}</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="landmarks-grid">
            ${(gov.landmarks || []).map((l) => `
              <div class="bg-[#FAF8F5] p-3 rounded-2xl border border-slate-200 flex items-start gap-3">
                <img src="${l.image || 'https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=600'}" alt="" class="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div class="min-w-0">
                  <h5 class="font-bold text-xs text-[#1E293B] truncate leading-tight">
                    ${isArabic ? (l.name?.ar || l.name) : (l.name?.en || l.name)}
                  </h5>
                  <p class="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                    ${isArabic ? (l.desc?.ar || l.desc) : (l.desc?.en || l.desc)}
                  </p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- الوسائط: صور أو فيديو + زر الانتقال للرحلات -->
        <div class="pt-2 border-t border-slate-100 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button type="button" id="tab-btn-photos" class="px-3 py-1 rounded-xl text-xs font-bold transition-all ${this.activeMediaTab === 'photos' ? 'bg-[#1E293B] text-white' : 'bg-slate-100 text-slate-600'}">
                📷 <span>${isArabic ? 'ألبوم الصور' : 'Photos'}</span>
              </button>
              ${gov.videoUrl ? `
                <button type="button" id="tab-btn-video" class="px-3 py-1 rounded-xl text-xs font-bold transition-all ${this.activeMediaTab === 'video' ? 'bg-[#1E293B] text-white' : 'bg-slate-100 text-slate-600'}">
                  🎥 <span>${isArabic ? 'فيديو استكشافي' : 'Video Tour'}</span>
                </button>
              ` : ''}
            </div>

            <a href="explore.html?gov=${gov.id}" class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all">
              <span>${isArabic ? 'تصفح رحلات هذه المحافظة' : 'Explore Tours'}</span>
              <span>${isArabic ? '←' : '→'}</span>
            </a>
          </div>

          <div id="media-content-display">
            ${this.renderMediaContent(gov)}
          </div>
        </div>
      </div>
    `;

    // ربط أزرار تبديل الوسائط
    const photosBtn = document.getElementById('tab-btn-photos');
    const videoBtn = document.getElementById('tab-btn-video');

    if (photosBtn) {
      photosBtn.addEventListener('click', () => {
        this.activeMediaTab = 'photos';
        this.renderGovernorateDetails(govId);
      });
    }

    if (videoBtn) {
      videoBtn.addEventListener('click', () => {
        this.activeMediaTab = 'video';
        this.renderGovernorateDetails(govId);
      });
    }
  }

  /**
   * رسم محتوى الوسائط (الصور أو الفيديو) للمحافظة المختارة
   */
  renderMediaContent(gov) {
    if (this.activeMediaTab === 'video' && gov.videoUrl) {
      return `
        <div class="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
          <video controls autoplay class="w-full h-full object-cover" src="${gov.videoUrl}"></video>
        </div>
      `;
    }

    const photos = (gov.photos && gov.photos.length > 0)
      ? gov.photos
      : ['https://images.unsplash.com/photo-1579606032822-6b99be7f73db?w=800'];

    return `
      <div class="grid grid-cols-3 gap-2">
        ${photos.map((url) => `
          <div class="relative aspect-video rounded-xl overflow-hidden shadow-xs bg-slate-900 group">
            <img src="${url}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * ربط أحداث الاستماع لتغيير اللغة أو الهوية
   */
  setupEventListeners() {
    window.addEventListener('language-changed', () => {
      this.renderQuickSwitcher();
      this.renderGovernorateDetails(this.selectedGovId);
      if (this.pinManager) {
        this.pinManager.render();
      }
    });

    window.addEventListener('branding-updated', () => {
      // تحديث فوري إذا كان هناك تعديل
    });
  }
}

// تشغيل الصفحة تلقائياً عند تحميل الـ DOM
document.addEventListener('DOMContentLoaded', () => {
  const mapPage = new MapPage();
  mapPage.init();
});