import { db, firebase } from '../config/firebase.config.js';

const publicProfiles = () => db?.collection('public_profiles');
const follows = () => db?.collection('follows');

function toPublicProfile(user) {
  if (!user?.uid) return null;
  return {
    uid: user.uid,
    displayName: user.displayName || user.name || 'مستكشف الأردن',
    username: user.username || '',
    avatar: user.photoURL || user.avatar || '',
    bio: user.bio || '',
    country: user.country || '',
    xp: Number(user.xp) || 0,
    rank: user.rank || '',
    updatedAt: firebase?.firestore?.FieldValue?.serverTimestamp() || new Date().toISOString(),
  };
}

export const socialService = {
  async publishProfile(user) {
    const profile = toPublicProfile(user);
    if (!db || !profile) return false;
    await publicProfiles().doc(profile.uid).set(profile, { merge: true });
    return true;
  },

  async getProfile(uid) {
    if (!db || !uid) return null;
    const snapshot = await publicProfiles().doc(uid).get();
    return snapshot.exists ? { uid: snapshot.id, ...snapshot.data() } : null;
  },

  async getFollowStats(profileUid, viewerUid = null) {
    if (!db || !profileUid) return { followers: 0, following: 0, isFollowing: false };
    const [followersSnapshot, followingSnapshot, relationSnapshot] = await Promise.all([
      follows().where('followedUid', '==', profileUid).get(),
      follows().where('followerUid', '==', profileUid).get(),
      viewerUid && viewerUid !== profileUid
        ? follows().doc(`${viewerUid}_${profileUid}`).get()
        : Promise.resolve(null),
    ]);
    return {
      followers: followersSnapshot.size,
      following: followingSnapshot.size,
      isFollowing: Boolean(relationSnapshot?.exists),
    };
  },

  async listPeople(profileUid, listType) {
    if (!db || !profileUid) return [];
    const field = listType === 'followers' ? 'followedUid' : 'followerUid';
    const profileField = listType === 'followers' ? 'followerUid' : 'followedUid';
    const snapshot = await follows().where(field, '==', profileUid).get();
    const userIds = [...new Set(snapshot.docs.map((doc) => doc.data()[profileField]).filter(Boolean))];
    const profiles = await Promise.all(userIds.map((uid) => this.getProfile(uid)));
    return profiles.filter(Boolean);
  },

  async setFollowing(followerUid, followedUid, shouldFollow) {
    if (!db || !followerUid || !followedUid || followerUid === followedUid) {
      throw new Error('لا يمكن متابعة هذا الحساب.');
    }
    const relation = follows().doc(`${followerUid}_${followedUid}`);
    if (shouldFollow) {
      await relation.set({
        followerUid,
        followedUid,
        createdAt: firebase?.firestore?.FieldValue?.serverTimestamp() || new Date().toISOString(),
      });
    } else {
      await relation.delete();
    }
  },
};
