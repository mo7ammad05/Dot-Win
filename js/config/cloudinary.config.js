/**
 * 🇯🇴 إعدادات سحابة وسائط واستضافة الصور والفيديوهات Cloudinary CDN
 * حساب المشروع المعتمد: gwohx3jx
 */

export const cloudinaryConfig = {
  // اسم السحابة المعتمد
  cloudName: "gwohx3jx",

  // مفتاح الـ API العام
  apiKey: "485187727589573",

  // لا تضع apiSecret هنا؛ هذا الملف يصل إلى المتصفح. الرفع يستخدم Upload Preset غير الموقّع.

  // الـ Upload Preset الافتراضي للرفع السريع بدون توقيع
  defaultUploadPreset: "jordan_explorer",
  fallbackUploadPreset: "ml_default",

  // رابط نقطة نهاية الرفع السحابي الرسمي لـ Cloudinary
  getUploadEndpoint: function(resourceType = "auto") {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;
  },

  // دالة تحويل أي رابط صورة إلى رابط فائق السرعة ومضغوط بصيغة WebP
  getOptimizedUrl: function(publicIdOrUrl, options = { width: 1000, quality: "auto" }) {
    if (!publicIdOrUrl) return "";
    if (publicIdOrUrl.startsWith("data:")) return publicIdOrUrl; // معاينة محلية
    
    // إذا كان الرابط تابعاً لـ Cloudinary نضيف تحسينات f_auto,q_auto
    if (publicIdOrUrl.includes("res.cloudinary.com")) {
      return publicIdOrUrl.replace("/upload/", `/upload/f_auto,q_${options.quality || 'auto'},w_${options.width || 1000}/`);
    }
    return publicIdOrUrl;
  }
};