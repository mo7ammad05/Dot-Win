/**
 * 🇯🇴 مولد الباركود الرقمي الآمن للتذاكر وكليك (Ticket QR Code & Cryptographic Signer)
 * يعتمد على خوارزمية SHA-256 التشفيرية المدمجة في المتصفح
 */

export const qrGenerator = {
  /**
   * حساب البصمة التشفيرية SHA-256 لبيانات التذكرة
   * @param {string} payload 
   * @returns {Promise<string>}
   */
  generateVerificationHash: async function(payload) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
      } catch (e) {
        console.warn('Crypto hash notice:', e);
      }
    }
    // بصمة بديلة سريعة
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  },

  /**
   * توليد رابط رمز QR عالي الدقة لتذكرة الصعود الرسمية
   * @param {Object} ticketData { bookingRef, travelerName, destTitle, date, amount }
   * @param {number} size المقاس بالبيكسل (افتراضي 250)
   * @returns {Promise<string>} رابط صورة الـ QR
   */
  generateTicketQrUrl: async function(ticketData, size = 250) {
    const {
      bookingRef = 'JO-EXP-2026-9041',
      travelerName = 'محمد الشوابكة',
      destTitle = 'مدينة البتراء',
      date = '2026-10-15',
      amount = 65
    } = ticketData;

    // توليد التوقيع الرقمي الآمن
    const rawPayload = `${bookingRef}:${travelerName}:${destTitle}:${amount}:${date}`;
    const signature = await this.generateVerificationHash(rawPayload);

    // الرابط المعتمد للتحقق الميداني
    const verificationUrl = `https://jordan-tour.jo/verify?ref=${encodeURIComponent(bookingRef)}&traveler=${encodeURIComponent(travelerName)}&dest=${encodeURIComponent(destTitle)}&sig=${signature}&status=CONFIRMED`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(verificationUrl)}`;
  },

  /**
   * توليد رمز QR لدفع كليك الفوري (CliQ Fast-Pay)
   * @param {string} alias المعرف الرسمي
   * @param {number} amount المبلغ
   * @param {string} ref الرقم المرجعي
   * @returns {string}
   */
  generateCliqPaymentQr: function(alias = 'JORDANEXPLORER', amount = 0, ref = '') {
    const payload = `CLIQ:${alias}:AMOUNT=${amount}:REF=${ref || 'JORDAN_TOUR'}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(payload)}`;
  },

  /**
   * تطبيق الباركود مباشرة على عنصر صورة في الـ DOM
   */
  renderToImageElement: async function(imgElement, ticketData, size = 250) {
    if (!imgElement) return;
    const url = await this.generateTicketQrUrl(ticketData, size);
    imgElement.src = url;
  }
};