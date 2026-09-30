/**
 * 🇯🇴 ويدجت المرشد السياحي الذكي العائم لمنصة Jordan Tour (Smart AI Chat Widget)
 * محادثة فورية، واجهة تفاعلية، ربط مع Gemini، وتنسيق أنيق متجاوب
 */

import { geminiService } from '../services/gemini.service.js';
import { store } from '../state/store.js';

export function renderChatWidget(lang = 'ar') {
  // تجنب تكرار بناء الويدجت في الصفحة
  if (document.getElementById('ai-chat-widget-root')) return;

  const isRtl = (lang === 'ar' || store.language === 'ar');

  const container = document.createElement('div');
  container.id = 'ai-chat-widget-root';
  container.className = 'fixed bottom-4 end-4 sm:bottom-6 sm:end-6 z-40';

  container.innerHTML = `
    <!-- 1. الزر الدائري العائم لفتح المحادثة -->
    <button
      type="button"
      id="btn-chat-trigger"
      class="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white text-white flex items-center justify-center shadow-2xl border-2 border-white/90 hover:scale-105 active:scale-95 transition-all cursor-pointer group overflow-hidden"
      title="${isRtl ? 'مرشد مستكشف الأردن الذكي' : 'Jordan Explorer AI Guide'}"
    >
      <div class="relative flex h-11 w-11 items-center justify-center">
        <svg viewBox="0 0 64 64" class="absolute inset-0 h-full w-full rounded-full border-2 border-[#FDE68A] shadow-inner" role="img" aria-label="علم الأردن">
          <defs><clipPath id="chat-jordan-flag-clip"><circle cx="32" cy="32" r="30" /></clipPath></defs>
          <g clip-path="url(#chat-jordan-flag-clip)">
            <rect width="64" height="22" fill="#000000" />
            <rect y="21" width="64" height="22" fill="#FFFFFF" />
            <rect y="42" width="64" height="22" fill="#007A3D" />
            <path d="M0 0 L34 32 L0 64 Z" fill="#CE1126" />
            <path d="M12 22 L14.4 28.4 L21 28 L16 32 L18 38 L12 34.5 L6 38 L8 32 L3 28 L9.6 28.4 Z" fill="#FFFFFF" />
          </g>
        </svg>
        <span class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow" style="background: rgba(15, 23, 42, 0.78);">
          <i class="fa-solid fa-robot text-sm group-hover:rotate-12 transition-transform" aria-hidden="true"></i>
        </span>
        <span class="absolute -top-0.5 -end-0.5 z-20 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" aria-hidden="true"></span>
      </div>
    </button>

    <!-- 2. بطاقة المحادثة المنسدلة (Chat Box) -->
    <div
      id="chat-window-card"
      class="hidden w-[calc(100vw-32px)] sm:w-[380px] h-[min(540px,calc(100vh-100px))] bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4"
    >
      <!-- رأس المحادثة -->
      <div class="bg-[#1E293B] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-700 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#C86D51] to-[#D97706] flex items-center justify-center shadow">
            <i class="fa-solid fa-robot text-xs text-white"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h4 class="font-extrabold text-xs sm:text-sm">
                ${isRtl ? 'مرشد الأردن السياحي الذكي' : 'Jordan Travel Concierge'}
              </h4>
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p class="text-[10px] text-slate-400">
              ${isRtl ? 'متصل للمساعدة المباشرة على مدار الساعة' : 'Online & ready to guide you'}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            id="btn-close-chat"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>

      <!-- شريط المحادثات والرسائل -->
      <div id="chat-messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/60 text-xs">
        <!-- رسالة الترحيب الأولى -->
        <div class="flex gap-2 justify-start">
          <div class="w-6 h-6 rounded-lg bg-[#C86D51] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <i class="fa-solid fa-robot text-[10px]"></i>
          </div>
          <div class="max-w-[82%] p-3 rounded-2xl bg-white text-[#1E293B] border border-[#E2E8F0] shadow-xs rounded-ts-none leading-relaxed">
            <p>
              ${isRtl
                ? 'يا هلا والله ومية مرحباً بك في الأردن الحبيب! 🇯🇴🌸 أنا مرشدك السياحي الذكي، يسعدني إجابتك عن أي تفصيل يخص محافظاتنا ومعالمنا ومأكولاتنا، وترتيب برنامج رحلتك. كيف بقدر أخدمك اليوم؟'
                : 'Welcome to Jordan! 🇯🇴✨ I am your smart travel concierge. Ask me anything about our 12 governorates, Petra, Wadi Rum, or local experiences!'}
            </p>
            <span class="text-[9px] mt-1 block text-end text-[#64748B]">الآن</span>
          </div>
        </div>
      </div>

      <!-- مؤشر الكتابة التلقائي -->
      <div id="chat-typing-indicator" class="hidden px-4 py-2 bg-[#FAF8F5]/60 flex items-center gap-2 text-xs text-[#64748B] shrink-0">
        <i class="fa-solid fa-robot text-[#C86D51] animate-spin"></i>
        <span>${isRtl ? 'المرشد يكتب الرد الآن...' : 'Guide is typing...'}</span>
      </div>

      <!-- شريط الرقائق والأسئلة السريعة (Prompt Chips) -->
      <div class="p-2 bg-white border-t border-[#E2E8F0] overflow-x-auto flex gap-1.5 scrollbar-none shrink-0" id="prompt-chips-bar">
        ${(isRtl ? [
          'أفضل وقت لزيارة البتراء؟',
          'كيف أدفع عبر كليك CliQ؟',
          'ما هي أكلات الأردن التراثية؟',
          'نصائح للتخييم في وادي رم'
        ] : [
          'Best time for Petra?',
          'How to pay with CliQ?',
          'Famous Jordanian dishes?',
          'Wadi Rum camping tips'
        ]).map(chip => `
          <button
            type="button"
            class="chat-chip-btn whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#FAF8F5] hover:bg-[#C86D51]/10 hover:text-[#C86D51] text-[#1E293B] border border-[#E2E8F0] transition-colors cursor-pointer"
            data-text="${chip}"
          >
            ${chip}
          </button>
        `).join('')}
      </div>

      <!-- حقل إدخال الرسالة وزر الإرسال -->
      <form id="chat-send-form" class="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2 shrink-0">
        <input
          type="text"
          id="chat-user-input"
          placeholder="${isRtl ? 'اسأل عن البتراء، وادي رم، كليك...' : 'Ask about Petra, Rum, CliQ...'}"
          class="flex-1 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#C86D51]"
          autocomplete="off"
        >
        <button
          type="submit"
          class="p-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B45A3E] text-white transition-all shadow-xs cursor-pointer"
          title="إرسال"
        >
          <i class="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(container);
  initChatWidgetInteractions();
}

function initChatWidgetInteractions() {
  const triggerBtn = document.getElementById('btn-chat-trigger');
  const chatWindow = document.getElementById('chat-window-card');
  const closeBtn = document.getElementById('btn-close-chat');

  const form = document.getElementById('chat-send-form');
  const input = document.getElementById('chat-user-input');
  const messagesBox = document.getElementById('chat-messages-container');
  const typingEl = document.getElementById('chat-typing-indicator');

  const history = [];

  window.addEventListener('user-state-changed', (event) => {
    const avatar = event.detail?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
    messagesBox?.querySelectorAll('[data-chat-user-avatar]').forEach((image) => {
      image.src = avatar;
    });
  });

  // فتح وإغلاق النافذة
  triggerBtn?.addEventListener('click', () => {
    triggerBtn.classList.add('hidden');
    chatWindow?.classList.remove('hidden');
    input?.focus();
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });

  closeBtn?.addEventListener('click', () => {
    chatWindow?.classList.add('hidden');
    triggerBtn?.classList.remove('hidden');
  });

  // دالة إضافة رسالة جديدة للمحادثة
  const appendMessage = (sender, text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = (sender === 'user');
    const userAvatar = store.user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const msgEl = document.createElement('div');
    msgEl.className = `flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`;

    if (isUser) {
      msgEl.innerHTML = `
        <div class="max-w-[82%] p-3 rounded-2xl bg-[#1E293B] text-white shadow-xs rounded-te-none leading-relaxed">
          <p class="whitespace-pre-line">${text}</p>
          <span class="text-[9px] mt-1 block text-end text-slate-400">${time}</span>
        </div>
        <img data-chat-user-avatar src="${userAvatar}" alt="" class="w-6 h-6 rounded-full object-cover mt-0.5 border border-amber-300 shrink-0">
      `;
    } else {
      msgEl.innerHTML = `
        <div class="w-6 h-6 rounded-lg bg-[#C86D51] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <i class="fa-solid fa-robot text-[10px]"></i>
        </div>
        <div class="max-w-[82%] p-3 rounded-2xl bg-white text-[#1E293B] border border-[#E2E8F0] shadow-xs rounded-ts-none leading-relaxed">
          <p class="whitespace-pre-line">${text}</p>
          <span class="text-[9px] mt-1 block text-end text-[#64748B]">${time}</span>
        </div>
      `;
    }

    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  };

  // معالجة إرسال السؤال
  const handleSend = async (userText) => {
    const text = (userText || input?.value || '').trim();
    if (!text) return;

    if (!store.user && !window.JordanFirebase?.auth?.currentUser) {
      if (input) input.value = '';
      appendMessage('ai', 'للتحدث مع المرشد السياحي الذكي، يرجى تسجيل الدخول بحسابك أولاً.');
      window.authModal?.show('login');
      return;
    }

    if (input) input.value = '';
    appendMessage('user', text);
    history.push({ sender: 'user', text });

    typingEl?.classList.remove('hidden');
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
      const reply = await geminiService.askGuide(text, history);
      typingEl?.classList.add('hidden');
      appendMessage('ai', reply);
      history.push({ sender: 'ai', text: reply });
    } catch (e) {
      typingEl?.classList.add('hidden');
      appendMessage('ai', 'يا هلا بك! أنا متصل لمساعدتك دائماً في كل ما يخص رحلات الأردن الحبيب 🇯🇴');
    }
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend();
  });

  // النقر على رقائق الأسئلة السريعة
  document.querySelectorAll('.chat-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-text');
      handleSend(q);
    });
  });
}