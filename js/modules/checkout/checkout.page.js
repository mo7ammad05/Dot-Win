/**
 * 🇯🇴 مشغل صفحة الدفع وتأكيد الحجز والتذاكر (Checkout Page Controller)
 * يربط الـ Stepper، محاكي CliQ، بطاقة الفيزا الفاخرة، وحفظ الحجوزات السحابية
 */

import { stepper } from './stepper.js';
import { qrGenerator } from './qr-generator.js';
import { cliqService } from '../../services/cliq.service.js';
import { uploaderService } from '../../services/uploader.service.js';
import { firebaseService } from '../../services/firebase.service.js';
import { audioService } from '../../services/audio.service.js';
import { destinationsService } from '../../services/destinations.service.js';
import { store } from '../../state/store.js';
import { auth } from '../../config/firebase.config.js';

export async function initCheckoutPage() {
  // 1. استخراج معايير الرحلة من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const destId = urlParams.get('dest') || 'petra-rose-city';
  const destinationsData = await destinationsService.getAll();
  const trip = destinationsData.find(d => d.id === destId) || destinationsData[0];

  let adults = parseInt(urlParams.get('guests'), 10) || 2;
  let children = 0;
  let selectedDate = urlParams.get('date') || '2026-10-15';
  let selectedTime = urlParams.get('time') || '08:00 ص';
  let payMethod = 'cliq';
  let isPointsDiscount = true;
  let paymentProofUrl = null;

  const adultPrice = Number(trip.priceJOD) || 65;
  const childPrice = Number(trip.childPriceJOD) || Math.round(adultPrice * 0.6);

  // 2. تحديث واجهة الملخص المبدئية
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('ck-trip-title', trip.title?.ar);
  setText('sum-dest-title', trip.title?.ar);
  setText('sum-dest-duration', trip.duration?.ar);
  setText('ck-adult-rate', `${adultPrice} د.أ / فرد`);
  setText('ck-child-rate', `${childPrice} د.أ (-40% خصم)`);

  const sumImg = document.getElementById('sum-dest-img');
  if (sumImg && trip.imageUrl) sumImg.src = trip.imageUrl;

  const dateIn = document.getElementById('ck-date-input');
  if (dateIn) dateIn.value = selectedDate;

  // 3. دالة حساب وتحديث الأسعار التفاعلية
  const updatePrices = () => {
    setText('ck-adult-count', adults);
    setText('ck-child-count', children);
    setText('sum-adults-calc', `${adults} × ${adultPrice} د.أ`);
    setText('sum-children-calc', `${children} × ${childPrice} د.أ`);

    const baseTotal = (adults * adultPrice) + (children * childPrice);
    const discount = isPointsDiscount ? 5 : 0;
    const finalTotal = Math.max(5, baseTotal - discount);

    setText('sum-discount-val', `-${discount} د.أ`);
    setText('sum-final-total', `${finalTotal} د.أ`);

    return finalTotal;
  };

  updatePrices();

  // عدادات الضيوف
  document.getElementById('btn-adult-plus')?.addEventListener('click', () => { adults++; updatePrices(); });
  document.getElementById('btn-adult-minus')?.addEventListener('click', () => { if (adults > 1) adults--; updatePrices(); });
  document.getElementById('btn-child-plus')?.addEventListener('click', () => { children++; updatePrices(); });
  document.getElementById('btn-child-minus')?.addEventListener('click', () => { if (children > 0) children--; updatePrices(); });

  // تبديل خصم النقاط (5 د.أ)
  const ptsBtn = document.getElementById('btn-toggle-points');
  ptsBtn?.addEventListener('click', () => {
    isPointsDiscount = !isPointsDiscount;
    if (ptsBtn) {
      ptsBtn.textContent = isPointsDiscount ? 'تم تطبيق الخصم ✓' : 'تطبيق الخصم (5 د.أ)';
      ptsBtn.className = `px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
        isPointsDiscount ? 'bg-[#D97706] text-white shadow' : 'bg-white/10 text-white/70 border border-white/20'
      }`;
    }
    updatePrices();
  });

  // وسائل الدفع
  window.setPayMethod = (method) => {
    payMethod = method;
    document.getElementById('cliq-content-box')?.classList.toggle('hidden', method !== 'cliq');
    document.getElementById('card-content-box')?.classList.toggle('hidden', method !== 'card');

    ['cliq', 'card', 'apple'].forEach(m => {
      const btn = document.getElementById(`tab-btn-${m}`);
      if (!btn) return;
      if (m === method) {
        btn.className = "p-3.5 rounded-2xl text-center font-bold text-xs border border-[#D97706] bg-[#D97706]/10 text-[#B45309] ring-2 ring-[#D97706]/30 cursor-pointer shadow-xs";
      } else {
        btn.className = "p-3.5 rounded-2xl text-center font-bold text-xs border border-[#E2E8F0] bg-[#FAF8F5] text-[#64748B] hover:bg-slate-100 cursor-pointer";
      }
    });
  };

  // نسخ الاسم المستعار لكليك
  document.getElementById('btn-copy-alias')?.addEventListener('click', () => {
    navigator.clipboard.writeText('JORDANEXPLORER');
    const txt = document.getElementById('copy-alias-text');
    if (txt) {
      txt.textContent = 'تم النسخ بنجاح!';
      setTimeout(() => { txt.textContent = 'نسخ الاسم المستعار'; }, 2500);
    }
  });

  // رفع إشعار تحويل كليك السحابي
  const proofFileIn = document.getElementById('cliq-proof-file');
  proofFileIn?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const proofFileName = document.getElementById('cliq-proof-file-name');
    if (proofFileName) proofFileName.textContent = file.name;

    try {
      const result = await uploaderService.uploadFile(file);
      paymentProofUrl = result.dataUrl;
      alert('✅ تم رفع صورة إشعار كليك بنجاح وربطها بطلب الحجز للأدمن!');
    } catch (err) {
      alert('تعذر رفع الملف: ' + err.message);
    }
  });

  // مزامنة مدخلات الفيزا في بطاقة العرض الحية
  document.getElementById('inp-card-num')?.addEventListener('input', (e) => {
    setText('preview-card-num', e.target.value || '•••• •••• •••• ••••');
  });
  document.getElementById('inp-card-holder')?.addEventListener('input', (e) => {
    setText('preview-card-holder', (e.target.value || 'MOHAMMAD SH3SHER').toUpperCase());
  });
  document.getElementById('inp-card-exp')?.addEventListener('input', (e) => {
    setText('preview-card-exp', e.target.value || '12/28');
  });

  // تثبيت الحجز وإصدار التذكرة
  document.getElementById('btn-submit-booking')?.addEventListener('click', async () => {
    const signedInUser = store.user || auth?.currentUser;
    if (!signedInUser) {
      window.authModal?.show('login');
      return;
    }
    const finalPrice = updatePrices();
    const travelerName = document.getElementById('traveler-name')?.value.trim() || 'محمد الشوابكة';
    const travelerEmail = document.getElementById('traveler-email')?.value.trim() || 'sh3sher@domain.jo';
    const travelerPhone = document.getElementById('traveler-phone')?.value.trim() || '+962 7 9123 4567';
    const travelerNotes = document.getElementById('traveler-notes')?.value.trim() || '';
    const cliqRef = document.getElementById('cliq-ref-input')?.value.trim() || 'CLIQ-REF';

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingRefCode = `JO-EXP-2026-${randomDigits}`;

    const bookingPayload = {
      bookingRef: bookingRefCode,
      userId: signedInUser.uid,
      destinationId: trip.id,
      destinationTitle: trip.title,
      customerName: travelerName,
      customerEmail: travelerEmail,
      customerPhone: travelerPhone,
      specialRequests: travelerNotes,
      date: document.getElementById('ck-date-input')?.value || selectedDate,
      timeSlot: document.getElementById('ck-time-select')?.value || selectedTime,
      adultsCount: adults,
      childrenCount: children,
      guests: adults + children,
      totalPriceJOD: finalPrice,
      paymentMode: payMethod,
      cliqRef: cliqRef,
      paymentProofUrl: paymentProofUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. حفظ الحجز سحابياً عبر Firestore
      await firebaseService.createBooking(bookingPayload);

      // 2. تحديث بطاقة التذكرة الرسمية للطباعة
      setText('ticket-dest-name', trip.title?.ar);
      setText('ticket-dest-region', `${trip.region?.ar} ${trip.isUnesco ? '(اليونسكو)' : ''}`);
      setText('ticket-datetime', `${bookingPayload.date} • ${bookingPayload.timeSlot}`);
      setText('ticket-traveler', travelerName);
      setText('ticket-guests', `${adults} بالغين ${children > 0 ? `+ ${children} أطفال` : ''}`);
      setText('ticket-amount', `${finalPrice} د.أ (+150 XP 🪙)`);
      setText('ticket-ref-code', `#${bookingRefCode}`);

      // 3. توليد رمز الـ QR الرقمي المشفر
      const qrImg = document.getElementById('ticket-qr-img');
      if (qrImg) {
        await qrGenerator.renderToImageElement(qrImg, {
          bookingRef: bookingRefCode,
          travelerName,
          destTitle: trip.title?.ar,
          date: bookingPayload.date,
          amount: finalPrice
        });
      }

      // 4. تشغيل نغمة الاحتفال الصوتي بنجاح الحجز
      audioService.playSuccessChime();

      // 5. الانتقال للخطوة 4 (التذكرة)
      stepper.goTo(4, true);

    } catch (err) {
      alert('خطأ أثناء حفظ الحجز: ' + err.message);
    }
  });

  // إتاحة وظيفة الانتقال بالـ Stepper عالمياً للنافذة
  window.goToStep = (step) => stepper.goTo(step);
}