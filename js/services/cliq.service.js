/**
 * 🇯🇴 خدمة معالجة مدفوعات كليك والتحقق الذكي (Jordan CliQ Payment Service)
 * تدير محاكاة الدفع الفوري، مطابقة الأرقام المرجعية، وتوليد التذاكر الإلكترونية
 */

import { cliqConfig } from '../config/cliq.config.js';
import { firebaseService } from './firebase.service.js';
import { store } from '../state/store.js';

export const cliqService = {
  /**
   * 1. التحقق من صحة الرقم المرجعي للحوالة البنكية
   * @param {string} refNumber 
   * @returns {boolean}
   */
  validateCliqReference: function(refNumber) {
    if (!refNumber || typeof refNumber !== 'string') return false;
    const clean = refNumber.trim().toUpperCase();
    return clean.length >= cliqConfig.minReferenceLength;
  },

  /**
   * 2. محاكاة عملية الدفع الفوري عبر كليك مع توليد كود الحجز والتذكرة
   * @param {Object} paymentData 
   * @returns {Promise<Object>}
   */
  processCliqPayment: async function(paymentData) {
    const {
      amount,
      customerName,
      customerEmail,
      customerPhone,
      destinationId,
      destinationTitle,
      date,
      timeSlot,
      guests,
      adultsCount = 1,
      childrenCount = 0,
      specialRequests = '',
      cliqRef = ''
    } = paymentData;

    // محاكاة تأخير الشبكة البنكية اللحظي (1.2 ثانية)
    await new Promise((resolve) => setTimeout(resolve, cliqConfig.simulationDelayMs));

    // توليد رقم الحجز المرجعي المعتمد وكود التفعيل
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `JO-EXP-2026-${randomDigits}`;
    const activationCode = cliqConfig.generateActivationCode("JOR");

    const bookingRecord = {
      bookingRef,
      userId: store.user?.uid || window.JordanFirebase?.auth?.currentUser?.uid,
      activationCode,
      destinationId,
      destinationTitle: typeof destinationTitle === 'object' ? destinationTitle : { ar: destinationTitle, en: destinationTitle },
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      date,
      timeSlot: timeSlot || '08:00 ص',
      guests: Number(guests) || (adultsCount + childrenCount),
      adultsCount: Number(adultsCount),
      childrenCount: Number(childrenCount),
      specialRequests: specialRequests.trim(),
      totalPriceJOD: Number(amount),
      paymentMode: 'cliq',
      cliqAlias: cliqConfig.officialAlias,
      cliqRef: cliqRef.trim().toUpperCase() || `CLIQ-REF-${randomDigits}`,
      status: 'pending', // يبدأ قيد المراجعة حتى يوافق الأدمن أو يؤكد
      createdAt: new Date().toISOString()
    };

    // حفظ الحجز في Firestore
    const savedBooking = await firebaseService.createBooking(bookingRecord);

    return {
      success: true,
      bookingRef,
      activationCode,
      booking: savedBooking,
      qrPayload: `https://jordan-tour.jo/verify?ref=${bookingRef}&traveler=${encodeURIComponent(customerName)}&amount=${amount}`
    };
  },

  /**
   * 3. توليد رابط رمز الـ QR للدفع المباشر عبر كليك
   * @param {number} amount 
   * @param {string} bookingRef 
   * @returns {string}
   */
  generatePaymentQrUrl: function(amount, bookingRef) {
    return cliqConfig.getQrCodeUrl(amount, bookingRef);
  },

  /**
   * 4. توليد رسالة واتساب المجهزة لتأكيد الحوالة مع فريق الدعم
   * @param {string} bookingRef 
   * @param {string} destinationTitle 
   * @param {number} amount 
   * @returns {string}
   */
  generateWhatsAppSupportUrl: function(bookingRef, destinationTitle, amount) {
    const text = `مرحباً، أود تأكيد إيداع كليك لحجز رقم #${bookingRef} لرحلة (${destinationTitle}) بقيمة ${amount} د.أ إلى المعرف الرسمي JORDANEXPLORER.`;
    return `https://wa.me/${cliqConfig.whatsappSupportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  }
};