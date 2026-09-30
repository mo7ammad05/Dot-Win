/**
 * 🇯🇴 طبقة خدمات سحابة Google Firebase Firestore الرسمية (Cloud Service Layer)
 * تدير عمليات الـ CRUD والمزامنة اللحظية لكافة أنظمة المنصة
 */

import { db, firebase } from '../config/firebase.config.js';

export const firebaseService = {
  getSettingsDocument: async function(docName) {
    if (db) {
      try {
        const snapshot = await db.collection('settings').doc(docName).get();
        if (snapshot.exists) {
          const data = snapshot.data();
          localStorage.setItem(`cloud_doc_${docName}`, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn(`Cloud read warning (${docName}):`, err.message);
      }
    }

    try {
      const cached = localStorage.getItem(`cloud_doc_${docName}`);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      return null;
    }
  },

  /**
   * 1. دوال المزامنة العامة للمستندات السحابية (Settings, Media, AI Config)
   */
  saveToCloudDoc: async function(docName, payload) {
    try {
      // حفظ نسخة احتياطية فورية في المتصفح
      localStorage.setItem(`cloud_doc_${docName}`, JSON.stringify(payload));
      if (!db) return true;

      await db.collection('settings').doc(docName).set({
        ...payload,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn(`Cloud save warning (${docName}):`, err.message);
      return false;
    }
  },

  subscribeToCloudDoc: function(docName, callback) {
    // قراءة فورية من الكاش أولاً
    try {
      const cached = localStorage.getItem(`cloud_doc_${docName}`);
      if (cached) callback(JSON.parse(cached));
    } catch (e) {}

    if (!db) return () => {};

    return db.collection('settings').doc(docName).onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        localStorage.setItem(`cloud_doc_${docName}`, JSON.stringify(data));
        callback(data);
      }
    }, (err) => {
      console.warn(`Snapshot listener warning (${docName}):`, err.message);
    });
  },

  /**
   * 2. خدمات إدارة الحجوزات وتذاكر كليك (Bookings & CliQ)
   */
  createBooking: async function(bookingData) {
    if (!bookingData.userId) throw new Error('يجب تسجيل الدخول قبل إنشاء الحجز.');
    const refCode = bookingData.bookingRef || `JO-EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      ...bookingData,
      bookingRef: refCode,
      status: bookingData.status || 'pending',
      createdAt: firebase ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    if (db) {
      const docRef = await db.collection('bookings').add(record);
      return { id: docRef.id, ...record };
    }
    return { id: refCode, ...record };
  },

  approveBooking: async function(bookingId, activationCode) {
    const code = activationCode || `CLIQ-ACT-${Math.floor(10000 + Math.random() * 90000)}`;
    if (db) {
      await db.collection('bookings').doc(bookingId).update({
        status: 'confirmed',
        activationCode: code,
        approvedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    return code;
  },

  rejectBooking: async function(bookingId, reason = 'عدم مطابقة الرقم المرجعي للحوالة') {
    if (db) {
      await db.collection('bookings').doc(bookingId).update({
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    return true;
  },

  getBookings: async function() {
    if (!db) return null;
    try {
      const snapshot = await db.collection('bookings').get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('Bookings load warning:', err.message);
      return null;
    }
  },

  getBookingsForUser: async function(user) {
    if (!db || !user) return null;
    try {
      const query = user.uid
        ? db.collection('bookings').where('userId', '==', user.uid)
        : db.collection('bookings').where('customerEmail', '==', user.email);
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('User bookings load warning:', err.message);
      return null;
    }
  },

  getPointsSettings: async function() {
    const data = await this.getSettingsDocument('points_settings');
    return data || null;
  },

  adjustUserPoints: async function(identifier, amount, reason) {
    if (!db || !identifier || !Number.isFinite(amount)) return false;
    try {
      let userRef = db.collection('users').doc(identifier);
      let userSnapshot = await userRef.get();
      if (!userSnapshot.exists) {
        const matches = await db.collection('users').where('email', '==', identifier).limit(1).get();
        if (matches.empty) return false;
        userSnapshot = matches.docs[0];
        userRef = userSnapshot.ref;
      }

      await userRef.set({
        xp: firebase.firestore.FieldValue.increment(amount),
        lastPointsAdjustment: {
          amount,
          reason,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('User points adjustment warning:', err.message);
      return false;
    }
  },

  updateBooking: async function(bookingId, fields) {
    if (!db) return false;
    try {
      await db.collection('bookings').doc(bookingId).update({
        ...fields,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (err) {
      console.warn('Booking update warning:', err.message);
      return false;
    }
  },

  /**
   * 3. خدمات إدارة الرحلات والوجهات (Destinations CRUD)
   */
  addDestination: async function(tripData) {
    if (db) {
      const docRef = await db.collection('destinations').add({
        ...tripData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    }
    return `trip-${Date.now()}`;
  },

  updateDestination: async function(tripId, updatedFields) {
    if (db) {
      await db.collection('destinations').doc(tripId).set({
        ...updatedFields,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    return true;
  },

  deleteDestination: async function(tripId) {
    if (db) {
      await db.collection('destinations').doc(tripId).delete();
    }
    return true;
  },

  /**
   * 4. خدمات الجواز الرقمي، الأختام، ونقاط الولاء (Passport & Gamification)
   */
  awardUserPointsAndStamp: async function(uid, pointsToAdd = 150, stampId = null) {
    if (!db || !uid) return false;
    const userRef = db.collection('users').doc(uid);

    const updatePayload = {
      xp: firebase.firestore.FieldValue.increment(pointsToAdd),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (stampId) {
      updatePayload.stamps = firebase.firestore.FieldValue.arrayUnion(stampId);
    }

    await userRef.set(updatePayload, { merge: true });
    return true;
  },

  /**
   * 5. خدمات مجتمع ومنتدى السياح (Community Posts & Reports)
   */
  createCommunityPost: async function(postData) {
    if (db) {
      const docRef = await db.collection('community_posts').add({
        ...postData,
        likesCount: 1,
        status: 'approved',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    }
    return `post-${Date.now()}`;
  },

  submitModerationReport: async function(reportData) {
    if (db) {
      await db.collection('reports').add({
        ...reportData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    return true;
  }
};

export const FirebaseService = {
  getBookings: (...args) => firebaseService.getBookings(...args),
  updateBooking: (...args) => firebaseService.updateBooking(...args),
  getPointsSettings: (...args) => firebaseService.getPointsSettings(...args),
  adjustUserPoints: (...args) => firebaseService.adjustUserPoints(...args),
  getSettingsDocument: (...args) => firebaseService.getSettingsDocument(...args),
  async saveToCloud(collectionName, documentId, payload) {
    try {
      localStorage.setItem(`cloud_doc_${documentId}`, JSON.stringify(payload));
      if (!db) return false;

      await db.collection(collectionName).doc(documentId).set({
        ...payload,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn(`Cloud save warning (${documentId}):`, err.message);
      return false;
    }
  }
};

// تصدير دوال مختصرة للتوافق المباشر مع كافة الوحدات
export const saveToCloudDoc = (docName, payload) => firebaseService.saveToCloudDoc(docName, payload);
export const subscribeToCloudDoc = (docName, callback) => firebaseService.subscribeToCloudDoc(docName, callback);