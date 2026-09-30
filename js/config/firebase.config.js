/**
 * 🇯🇴 إعدادات وتهيئة سحابة Google Firebase الرسمية الموحدة
 * المشروع المعتمد: jordan-tour-92340
 * مسار الملف: js/config/firebase.config.js
 */

export const firebaseConfig = {
  apiKey: "AIzaSyCnqunJnlHZFnf_ug9ndt54UrkNxuzP3VM",
  authDomain: "jordan-tour-92340.firebaseapp.com",
  projectId: "jordan-tour-92340",
  storageBucket: "jordan-tour-92340.firebasestorage.app",
  messagingSenderId: "26325484918",
  appId: "1:26325484918:web:9c8da7d2b0fc6618e0e657",
  measurementId: "G-WQNWGHKM18"
};

// 1. تهيئة Firebase SDK إذا كان محملاً عبر الـ CDN
let initializedApp = null;

if (typeof window !== 'undefined') {
  if (window.firebase) {
    if (!window.firebase.apps || !window.firebase.apps.length) {
      initializedApp = window.firebase.initializeApp(firebaseConfig);
    } else {
      initializedApp = window.firebase.app();
    }
  }
}

// 2. استخراج وتصدير خدمات Firestore و Auth
export const firebase = typeof window !== 'undefined' ? window.firebase : null;
export const auth = typeof window !== 'undefined' && window.firebase ? window.firebase.auth() : null;
export const db = typeof window !== 'undefined' && window.firebase ? window.firebase.firestore() : null;

// 3. الخطوة الحاسمة: تثبيت الكائن على window لضمان وصول كافة موديولات الأدمن والخريطة والرحلات إليه سحابياً
if (typeof window !== 'undefined') {
  window.JordanFirebase = {
    app: initializedApp,
    firebase: window.firebase,
    auth: auth,
    db: db,
    isReady: () => !!db
  };
  window.db = db;
  window.auth = auth;
}

// 4. تفعيل ميزة التخزين المؤقت والمزامنة عند انقطاع الإنترنت (Offline Persistence)
if (db && typeof db.enablePersistence === 'function') {
  db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase persistence: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase persistence: browser unsupported.');
    }
  });
}