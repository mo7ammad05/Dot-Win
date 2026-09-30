/**
 * 🇯🇴 إعدادات بوابة الدفع الفوري كليك الأردنية (Jordan CliQ Gateway)
 * الاسم المستعار المعتمد: JORDANEXPLORER
 */

export const cliqConfig = {
  // المعرف والاسم المستعار الرسمي المعتمد في البنوك الأردنية
  officialAlias: "JORDANEXPLORER",
  
  // رقم الآيبان الوطني المعتمد للمؤسسة
  officialIban: "JO94CBJO0010000000000123456789",
  
  // اسم المستفيد الرسمي
  beneficiaryName: "منصة مستكشف الأردن الوطنية (Jordan Tour)",
  
  // البنك المشغل للنظام
  bankName: "البنك المركزي الأردني - بدعم شبكة JoPACC",
  
  // بادئة الأرقام المرجعية وتوليد الإيصالات
  referencePrefix: "CLQ-JOR-",
  minReferenceLength: 6,
  
  // رقم واتساب الدعم الفوري لتأكيد وتدقيق الحوالات
  whatsappSupportPhone: "+962791234567",
  whatsappFormattedPhone: "+962 7 9123 4567",

  // مدة محاكاة التحقق اللحظي بالمللي ثانية
  simulationDelayMs: 1200,

  // دالة توليد رابط باركود الدفع المباشر لكليك
  getQrCodeUrl: function(amount = 0, ref = "") {
    const payload = `CLIQ:${this.officialAlias}:AMOUNT=${amount}:REF=${ref || 'TOUR'}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}`;
  },

  // دالة فحص وتدقيق صحة الرقم المرجعي
  validateReference: function(ref) {
    if (!ref || typeof ref !== 'string') return false;
    const clean = ref.trim().toUpperCase();
    return clean.length >= this.minReferenceLength;
  },

  // دالة توليد كود تفعيل سياحي عشوائي
  generateActivationCode: function(tripPrefix = "JOR") {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `${tripPrefix}-ACT-${randomDigits}`;
  }
};