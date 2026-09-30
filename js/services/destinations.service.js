import { destinationsData } from '../data/destinations.data.js';
import { db } from '../config/firebase.config.js';
import { Storage, STORAGE_KEYS } from '../state/storage.js';

const cloudDocName = 'destinations_data';
const cacheKey = `cloud_doc_${cloudDocName}`;

function getCachedDestinations() {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    return Array.isArray(cached?.list) ? cached.list : null;
  } catch (error) {
    return null;
  }
}

function cacheDestinations(list) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ list }));
  } catch (error) {
    console.warn('Could not cache destinations:', error);
  }
}

export const destinationsService = {
  async getSettingsDocument(documentName) {
    if (db) {
      try {
        const snapshot = await db.collection('settings').doc(documentName).get();
        if (snapshot.exists) return snapshot.data();
      } catch (error) {
        console.warn(`Could not load ${documentName}:`, error.message);
      }
    }
    try {
      return JSON.parse(localStorage.getItem(`cloud_doc_${documentName}`) || 'null');
    } catch (error) {
      return null;
    }
  },

  async getAll() {
    if (db) {
      try {
        const snapshot = await db.collection('settings').doc(cloudDocName).get();
        if (snapshot.exists && Array.isArray(snapshot.data().list)) {
          const list = snapshot.data().list;
          cacheDestinations(list);
          return list;
        }
      } catch (error) {
        console.warn('Could not load cloud destinations:', error.message);
      }
    }

    return getCachedDestinations() || Storage.get(STORAGE_KEYS.DESTINATIONS) || [...destinationsData];
  },

  subscribe(callback) {
    let active = true;
    this.getAll().then((list) => {
      if (active) callback(list);
    });

    if (!db) return () => { active = false; };

    const unsubscribe = db.collection('settings').doc(cloudDocName).onSnapshot((snapshot) => {
      if (!snapshot.exists || !Array.isArray(snapshot.data().list)) return;
      const list = snapshot.data().list;
      cacheDestinations(list);
      if (active) callback(list);
    }, (error) => {
      console.warn('Destination sync warning:', error.message);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }
};
