/**
 * 🇯🇴 مدير نافذة تسجيل الدخول وإنشاء الحساب
 * يعرض صفحة auth/auth.html داخل iframe، فيكون في نسخة واحدة فقط من الفورم.
 */

// مسار الصفحة نسبةً لهذا الملف (js/components/ → ../../auth/auth.html)
// إذا اسم مجلد صفحة الدخول مختلف عندك، عدّله هون.
const AUTH_PAGE = new URL('../../auth/auth.html', import.meta.url);

export class AuthModalManager {
  constructor() {
    this.mode = 'login'; // 'login' | 'register'
    this.initModalDOM();
  }

  injectStyles() {
    if (document.getElementById('cr-auth-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'cr-auth-modal-styles';
    style.textContent = `
      #cr-auth-modal-root {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(15, 23, 42, 0.78);
        -webkit-backdrop-filter: blur(6px);
        backdrop-filter: blur(6px);
      }
      #cr-auth-modal-root.is-open { display: flex; }
      #cr-auth-modal-root .cr-modal-frame-wrap {
        position: relative;
        width: min(820px, 100%);
        height: min(600px, 92vh);
        border-radius: 16px;
        background: #faf8f5; /* يظهر لحظة تحميل الصفحة */
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45);
      }
      #cr-auth-modal-root iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        border-radius: 16px;
        background: transparent;
        color-scheme: light;
      }
      #cr-auth-modal-root .cr-modal-close {
        position: absolute;
        top: -12px;
        inset-inline-end: -12px;
        z-index: 50;
        width: 38px;
        height: 38px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.92);
        color: #ffffff;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
        transition: background 0.2s ease;
      }
      #cr-auth-modal-root .cr-modal-close:hover { background: #c86d51; }
    `;
    document.head.appendChild(style);
  }

  initModalDOM() {
    // التأكد من عدم تكرار العنصر
    if (document.getElementById('cr-auth-modal-root')) return;

    this.injectStyles();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'cr-auth-modal-root';
    modalRoot.setAttribute('role', 'dialog');
    modalRoot.setAttribute('aria-modal', 'true');
    modalRoot.setAttribute('aria-label', 'تسجيل الدخول');
    modalRoot.innerHTML = `
      <div class="cr-modal-frame-wrap">
        <button type="button" id="btn-close-auth-modal" class="cr-modal-close" aria-label="إغلاق">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <iframe id="auth-modal-frame" title="تسجيل الدخول" allow="autoplay"></iframe>
      </div>
    `;

    document.body.appendChild(modalRoot);
    this.bindEvents();
  }

  bindEvents() {
    const root = document.getElementById('cr-auth-modal-root');
    const frame = document.getElementById('auth-modal-frame');

    document.getElementById('btn-close-auth-modal')?.addEventListener('click', () => this.hide());

    root?.addEventListener('click', (e) => {
      if (e.target === root) this.hide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root?.classList.contains('is-open')) this.hide();
    });

    // أول ما تخلص الصفحة تحميل، نبعتلها الوضع المطلوب (دخول / تسجيل)
    frame?.addEventListener('load', () => {
      frame.dataset.loaded = '1';
      this.sendMode();
    });
  }

  sendMode() {
    const frame = document.getElementById('auth-modal-frame');
    const mode = this.mode === 'register' ? 'signup' : 'login';
    frame?.contentWindow?.postMessage({ type: 'auth-mode', mode }, location.origin);
  }

  show(mode = 'login') {
    this.mode = mode;
    const root = document.getElementById('cr-auth-modal-root');
    const frame = document.getElementById('auth-modal-frame');
    if (!root || !frame) return;

    if (!frame.getAttribute('src')) {
      // أول فتح: نحمّل الصفحة (ما بنحمّلها قبل ما المستخدم يضغط، عشان ما نثقّل الرئيسية)
      const url = new URL(AUTH_PAGE);
      url.searchParams.set('embed', '1');
      url.searchParams.set('mode', mode === 'register' ? 'signup' : 'login');
      frame.src = url.href;
    } else if (frame.dataset.loaded) {
      this.sendMode();
    }

    root.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
  }

  hide() {
    document.getElementById('cr-auth-modal-root')?.classList.remove('is-open');
    document.documentElement.style.overflow = '';
  }
}