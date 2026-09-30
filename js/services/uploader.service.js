/**
 * 🇯🇴 خدمة الرفع السحابي للوسائط (Cloudinary & Local Media Uploader)
 * تدير رفع الصور والفيديوهات وملفات الـ PDF مع الحساب المشفر للبصمة الرقمية
 */

import { cloudinaryConfig } from '../config/cloudinary.config.js';

export class UploaderService {
  /**
   * حساب بصمة التوقيع الرقمي SHA-1 عبر Web Crypto API المدمجة بالمتصفح
   * @param {string} str 
   * @returns {Promise<string>}
   */
  async computeSha1(str) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return '';
  }

  /**
   * الرفع المباشر إلى سحابة Cloudinary
   * @param {File} file 
   * @returns {Promise<Object>}
   */
  async uploadToCloudinary(file) {
    const { cloudName, apiKey, apiSecret, defaultUploadPreset } = cloudinaryConfig;
    const formData = new FormData();
    formData.append('file', file);

    // 1. محاولة الرفع الموقع (Signed Upload) بأعلى صلاحية
    if (apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const stringToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = await this.computeSha1(stringToSign);

      if (signature) {
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
      } else if (defaultUploadPreset) {
        formData.append('upload_preset', defaultUploadPreset);
      }
    } else if (defaultUploadPreset) {
      // 2. الرفع غير الموقع عبر الـ Preset
      formData.append('upload_preset', defaultUploadPreset);
    }

    const endpoint = cloudinaryConfig.getUploadEndpoint('auto');
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || response.statusText || 'فشل الرفع السحابي');
    }

    const isVideo = file.type.startsWith('video/') || data.resource_type === 'video';
    const isImage = file.type.startsWith('image/') || data.resource_type === 'image';

    return {
      success: true,
      dataUrl: data.secure_url,
      cloudinaryUrl: data.secure_url,
      fileName: file.name,
      fileSize: data.bytes || file.size,
      fileType: isVideo ? 'video' : isImage ? 'image' : 'document',
      isCloudinary: true
    };
  }

  /**
   * القراءة المحلية عبر FileReader كبديل فوري في حال انقطاع الشبكة
   * @param {File} file 
   * @returns {Promise<Object>}
   */
  readLocalFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      reader.onload = (e) => {
        resolve({
          success: true,
          dataUrl: e.target.result,
          fileName: file.name,
          fileSize: file.size,
          fileType: isVideo ? 'video' : isImage ? 'image' : 'document',
          isCloudinary: false
        });
      };

      reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة الملف محلياً'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * الدالة الرئيسية الشاملة لرفع أي ملف في المنصة
   * @param {File} file 
   * @returns {Promise<Object>}
   */
  async uploadFile(file) {
    if (!file) throw new Error('لم يتم تحديد أي ملف');

    // التحقق من نوع الملف
    const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf';
    if (!isValidType) {
      throw new Error('نوع الملف غير مدعوم، يرجى اختيار صورة أو فيديو أو ملف PDF');
    }

    // التحقق من سقف الحجم (100 ميغابايت)
    const maxBytes = 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error('حجم الملف يتجاوز الحد الأقصى المسموح به (100MB)');
    }

    // محاولة الرفع إلى Cloudinary أولاً، ثم التحويل التلقائي للقراءة المحلية عند الحاجة
    try {
      if (cloudinaryConfig.cloudName && navigator.onLine) {
        return await this.uploadToCloudinary(file);
      }
    } catch (err) {
      console.warn('Cloudinary upload notice, using local data fallback:', err.message);
    }

    return await this.readLocalFile(file);
  }

  async uploadPublicFile(file) {
    if (!file || !(file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      throw new Error('اختر صورة أو فيديو صالحاً.');
    }

    const uploaded = await this.uploadFile(file);
    return uploaded.dataUrl;
  }
}

export const uploaderService = new UploaderService();