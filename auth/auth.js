import { store } from '../js/state/store.js';
import { auth, db } from '../js/config/firebase.config.js';
import { socialService } from '../js/services/social.service.js';

const fallbackPhoto = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
const shell = document.getElementById('cr-auth-shell');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const panelImage = document.getElementById('auth-panel-image');
const panelVideo = document.getElementById('auth-panel-video');
const panelWelcomeDefaults = {
  loginTitle: 'مرحباً\nبعودتك!',
  loginMessage: 'سجّل الدخول لمتابعة رحلتك واستكشاف الأردن.',
  signupTitle: 'أهلاً\nبك معنا!',
  signupMessage: 'أنشئ حسابك واجمع أختام المحافظات في جوازك الرقمي.'
};

// ===== وضع التضمين داخل المودال =====
const urlParams = new URLSearchParams(location.search);
const isEmbedded = urlParams.has('embed') || window.self !== window.top;
document.body.classList.toggle('is-embed', isEmbedded);

// فتح تبويب التسجيل مباشرة لو المودال طلب ذلك
if (urlParams.get('mode') === 'signup') shell?.classList.add('signup-active');

// استقبال تغيير الوضع من الصفحة الأم (لما المودال يتفتح مرة ثانية)
window.addEventListener('message', (event) => {
  if (event.origin !== location.origin) return;
  if (event.data?.type === 'auth-mode') {
    shell?.classList.toggle('signup-active', event.data.mode === 'signup');
  }
});

// الفيديو الافتراضي: ملف محلي داخل المشروع (المسار نسبةً لجذر الموقع، وبيتحوّل تلقائياً لـ ../)
const DEFAULT_PANEL_MEDIA = { type: 'video', url: 'assets/videos/auth-panel.mp4' };

// المسرح مخفي على الشاشات الصغيرة، فما في داعي نحمّل الفيديو
const desktopQuery = window.matchMedia('(min-width: 801px)');

function resolvePanelMediaUrl(url) {
  if (!url || /^(?:[a-z][a-z\d+.-]*:|\/)/i.test(url)) return url;
  return `../${url.replace(/^\.\//, '')}`;
}

function updatePanelMedia() {
  if (!panelImage || !panelVideo) return;

  if (!desktopQuery.matches) {
    panelVideo.pause();
    return;
  }

  const hasStoreMedia = Boolean(store.authPanelMediaUrl);
  const mediaType = hasStoreMedia ? store.authPanelMediaType : DEFAULT_PANEL_MEDIA.type;
  const mediaUrl = resolvePanelMediaUrl(hasStoreMedia ? store.authPanelMediaUrl : DEFAULT_PANEL_MEDIA.url);
  if (!mediaUrl) return;

  if (mediaType === 'image') {
    panelVideo.pause();
    panelVideo.removeAttribute('src');
    panelVideo.hidden = true;
    if (panelImage.getAttribute('src') !== mediaUrl) panelImage.src = mediaUrl;
    panelImage.hidden = false;
    return;
  }

  // فيديو
  panelImage.hidden = true;
  panelImage.removeAttribute('src');

  // لازم muted يتفعّل من JS كمان، وإلا بعض المتصفحات بترفض autoplay
  panelVideo.muted = true;
  panelVideo.defaultMuted = true;

  if (panelVideo.getAttribute('src') !== mediaUrl) {
    panelVideo.src = mediaUrl;
    panelVideo.load();
  }
  panelVideo.hidden = false;

  const playPromise = panelVideo.play();
  if (playPromise) {
    playPromise.catch(() => {
      // لو المتصفح منع التشغيل التلقائي (مثلاً وضع توفير الطاقة)، نشغّله عند أول لمسة
      document.addEventListener('pointerdown', () => panelVideo.play().catch(() => {}), { once: true });
    });
  }
}

// لو الميديا فشلت بالتحميل، نخفيها ويظهر التدرج اللوني البديل
panelVideo?.addEventListener('error', () => { panelVideo.hidden = true; });
panelImage?.addEventListener('error', () => { panelImage.hidden = true; });
desktopQuery.addEventListener('change', updatePanelMedia);

function updatePanelWelcome() {
  const welcomeText = (storeValue, storageKey, fallback) => storeValue || localStorage.getItem(storageKey) || fallback;
  document.getElementById('auth-login-title').textContent = welcomeText(store.authLoginTitle, 'jt_auth_login_title', panelWelcomeDefaults.loginTitle);
  document.getElementById('auth-login-message').textContent = welcomeText(store.authLoginMessage, 'jt_auth_login_message', panelWelcomeDefaults.loginMessage);
  document.getElementById('auth-signup-title').textContent = welcomeText(store.authSignupTitle, 'jt_auth_signup_title', panelWelcomeDefaults.signupTitle);
  document.getElementById('auth-signup-message').textContent = welcomeText(store.authSignupMessage, 'jt_auth_signup_message', panelWelcomeDefaults.signupMessage);
}

updatePanelMedia();
updatePanelWelcome();
window.addEventListener('branding-updated', () => {
  updatePanelMedia();
  updatePanelWelcome();
});

function showError(id, message) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.classList.remove('hidden');
}

function clearError(id) {
  document.getElementById(id)?.classList.add('hidden');
}

function authErrorMessage(error, fallback) {
  const messages = {
    'auth/account-exists-with-different-credential': 'يوجد حساب بهذا البريد، سجّل الدخول بالطريقة التي استخدمتها عند إنشاء الحساب.',
    'auth/email-already-in-use': 'هذا البريد مسجل مسبقاً. سجّل الدخول بدلاً من إنشاء حساب جديد.',
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/operation-not-allowed': 'طريقة تسجيل الدخول هذه غير مفعلة في إعدادات Firebase.',
    'auth/popup-blocked': 'منع المتصفح نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة ثم أعد المحاولة.',
    'auth/popup-closed-by-user': 'أُغلقت نافذة تسجيل الدخول قبل اكتمال العملية.',
    'auth/unauthorized-domain': 'نطاق الموقع غير مضاف إلى النطاقات المعتمدة في Firebase.',
    'auth/weak-password': 'كلمة المرور قصيرة جداً. استخدم ستة أحرف على الأقل.',
    'auth/network-request-failed': 'تعذر الاتصال. تحقق من الإنترنت ثم أعد المحاولة.'
  };
  return messages[error.code] || error.message || fallback;
}

function setLoading(button, loading) {
  if (!button) return;
  button.disabled = loading;
  button.classList.toggle('is-loading', loading);
}

function updateLocalUser(user, extra = {}) {
  store.user = {
    uid: user.uid,
    displayName: user.displayName || extra.name || user.email?.split('@')[0] || 'مستكشف الأردن',
    email: user.email || extra.email || '',
    photoURL: user.photoURL || fallbackPhoto,
    xp: extra.xp ?? 1450,
    rank: extra.rank || 'مستكشف برونزي',
    stamps: extra.stamps || ['stamp-maan-petra'],
    ...extra
  };
  window.dispatchEvent(new CustomEvent('user-state-changed', { detail: store.user }));
}

async function finishAuth(user, extra = {}) {
  updateLocalUser(user, extra);
  if (isEmbedded) {
    // داخل المودال: نعيد تحميل الصفحة الأم لتلتقط حالة الدخول وتبقى المستخدم مكانه
    window.top.location.reload();
    return;
  }
  window.location.href = '../index.html';
}

async function ensureProviderProfile(user) {
  if (!db) return {};

  try {
    const userRef = db.collection('users').doc(user.uid);
    const snapshot = await userRef.get();
    if (snapshot.exists) return snapshot.data();

    const profile = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'مستكشف الأردن',
      email: user.email || '',
      avatar: user.photoURL || fallbackPhoto,
      xp: 1450,
      rank: 'مستكشف برونزي',
      stamps: ['stamp-maan-petra'],
      referralCode: `JO-${Math.floor(1000 + Math.random() * 9000)}`,
      usedReferral: null,
      createdAt: new Date().toISOString()
    };
    await userRef.set(profile);
    return profile;
  } catch (error) {
    console.warn('Could not initialize social auth profile:', error);
    return {};
  }
}

async function signInWithProvider(providerName) {
  if (!auth || !window.firebase) throw new Error('خدمة تسجيل الدخول غير متاحة حالياً.');
  const provider = providerName === 'apple'
    ? new window.firebase.auth.OAuthProvider('apple.com')
    : new window.firebase.auth.GoogleAuthProvider();
  if (providerName === 'apple') {
    provider.addScope('email');
    provider.addScope('name');
  }
  const credential = await auth.signInWithPopup(provider);
  const profile = await ensureProviderProfile(credential.user);
  await finishAuth(credential.user, profile);
}

document.querySelectorAll('.cr-switch-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const isSignup = button.dataset.target === 'signup';
    shell.classList.toggle('signup-active', isSignup);
  });
});

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError('login-error');
  const button = loginForm.querySelector('button[type="submit"]');
  setLoading(button, true);
  try {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!auth) throw new Error('تعذر الاتصال بخدمة المصادقة.');
    const persistence = document.getElementById('remember-me').checked
      ? window.firebase.auth.Auth.Persistence.LOCAL
      : window.firebase.auth.Auth.Persistence.SESSION;
    await auth.setPersistence(persistence);
    const credential = await auth.signInWithEmailAndPassword(email, password);
    if (!credential.user.emailVerified) {
      await credential.user.sendEmailVerification();
      await auth.signOut();
      throw new Error('يرجى تأكيد بريدك الإلكتروني أولاً. أرسلنا رابط التأكيد إلى بريدك مرة أخرى.');
    }
    await finishAuth(credential.user);
  } catch (error) {
    showError('login-error', authErrorMessage(error, 'بيانات الدخول غير صحيحة.'));
  } finally {
    setLoading(button, false);
  }
});

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError('signup-error');
  const button = signupForm.querySelector('button[type="submit"]');
  setLoading(button, true);
  try {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const refCode = document.getElementById('signup-referral').value.trim().toUpperCase();
    if (!auth) throw new Error('تعذر الاتصال بخدمة المصادقة.');
    const credential = await auth.createUserWithEmailAndPassword(email, password);
    await credential.user.updateProfile({ displayName: name });
    await credential.user.sendEmailVerification();
    const userData = {
      uid: credential.user.uid,
      name,
      email,
      avatar: fallbackPhoto,
      xp: refCode ? 1550 : 1450,
      rank: 'مستكشف برونزي',
      stamps: ['stamp-maan-petra'],
      referralCode: `JO-${Math.floor(1000 + Math.random() * 9000)}`,
      usedReferral: refCode || null,
      createdAt: new Date().toISOString()
    };
    if (db) {
      await db.collection('users').doc(credential.user.uid).set(userData);
      await socialService.publishProfile({
        uid: credential.user.uid,
        displayName: name,
        avatar: fallbackPhoto,
        bio: '',
        country: '',
      });
    }
    alert('تم إنشاء الحساب. تحقق من بريدك الإلكتروني عبر الرابط المرسل، ثم سجّل الدخول.');
    await auth.signOut();
    shell.classList.remove('signup-active');
  } catch (error) {
    showError('signup-error', authErrorMessage(error, 'تعذر إنشاء الحساب.'));
  } finally {
    setLoading(button, false);
  }
});

document.getElementById('forgot-password')?.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  if (!email || !auth) {
    showError('login-error', 'أدخل بريدك الإلكتروني أولاً لاستعادة كلمة المرور.');
    return;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    showError('login-error', 'تم إرسال رابط استعادة كلمة المرور إلى بريدك.');
  } catch (error) {
    showError('login-error', authErrorMessage(error, 'تعذر إرسال رابط الاستعادة.'));
  }
});

document.getElementById('google-login')?.addEventListener('click', () => signInWithProvider('google').catch((error) => showError('login-error', authErrorMessage(error, 'تعذر تسجيل الدخول عبر Google.'))));
document.getElementById('apple-login')?.addEventListener('click', () => signInWithProvider('apple').catch((error) => showError('login-error', authErrorMessage(error, 'تعذر تسجيل الدخول عبر Apple.'))));
document.getElementById('google-signup')?.addEventListener('click', () => signInWithProvider('google').catch((error) => showError('signup-error', authErrorMessage(error, 'تعذر التسجيل عبر Google.'))));
document.getElementById('apple-signup')?.addEventListener('click', () => signInWithProvider('apple').catch((error) => showError('signup-error', authErrorMessage(error, 'تعذر التسجيل عبر Apple.'))));