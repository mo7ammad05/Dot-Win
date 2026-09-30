/**
 * 🇯🇴 خدمة الترجمة العامة لمنصة Jordan Tour
 * تستخدم نفس مفتاح Gemini الموجود في لوحة الإدارة لتجهيز ترجمة الموقع بالكامل
 * مع دعم التفريع إلى اللغة العربية/الإنجليزية، وبأمان عند غياب المفتاح
 */

import { db } from '../config/firebase.config.js';

class TranslationService {
  constructor() {
    this.apiKey = localStorage.getItem('jordan_gemini_api_key') || '';
    this.isTranslating = false;
    let savedTranslations = {};
    try {
      savedTranslations = JSON.parse(localStorage.getItem('jt_translation_cache_v1') || '{}');
    } catch (error) {}
    this.cache = new Map(Object.entries(savedTranslations));
    this.originalText = new Map();
    this.originalAttributes = new Map();
    this.currentLanguage = 'ar';
    this.pendingDynamicUpdate = false;
    this.observer = null;
    this.initCloudKeySync();
    window.addEventListener('translation-api-key-updated', (event) => {
      this.apiKey = String(event.detail || '').trim();
      if (this.apiKey) localStorage.setItem('jordan_gemini_api_key', this.apiKey);
    });
  }

  initCloudKeySync() {
    if (!db) return;
    try {
      db.collection('settings').doc('ai_config').onSnapshot((doc) => {
        if (doc.exists && doc.data()?.apiKey) {
          const nextKey = String(doc.data().apiKey).trim();
          this.apiKey = nextKey;
          localStorage.setItem('jordan_gemini_api_key', nextKey);
        }
      }, () => {});
    } catch (e) {
      console.warn('Translation key sync notice:', e);
    }
  }

  getTargetLanguage(lang) {
    const map = { ar: 'ar', en: 'en', fr: 'fr', de: 'de', tr: 'tr' };
    return map[lang] || 'en';
  }

  isAvailable() {
    return Boolean(this.apiKey);
  }

  shouldSkipNode(node) {
    if (!node || !node.parentElement) return true;
    const tag = node.parentElement.tagName;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME'].includes(tag)) return true;
    if (node.parentElement.closest('[data-no-translate="true"], [data-translate="false"], .no-translate, .dynamic-site-name')) return true;
    return false;
  }

  shouldSkipElement(element) {
    return !element || element.closest('script, style, noscript, svg, iframe, [data-no-translate="true"], [data-translate="false"], .no-translate, .dynamic-site-name');
  }

  getTextNodes(root = document.body) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const current = walker.currentNode;
      const value = current.textContent?.trim() || '';
      if (!value || value.length < 2) continue;
      if (current.parentElement && current.parentElement.closest('script, style, noscript, svg, iframe')) continue;
      if (this.shouldSkipNode(current)) continue;
      const parentTag = current.parentElement?.tagName || '';
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parentTag)) continue;
      nodes.push(current);
    }
    return nodes;
  }

  getTranslatableAttributes(root = document.body) {
    return [...root.querySelectorAll('[placeholder], [title], [aria-label]')]
      .filter((element) => !this.shouldSkipElement(element))
      .flatMap((element) => ['placeholder', 'title', 'aria-label']
        .filter((attribute) => element.hasAttribute(attribute))
        .map((attribute) => ({ element, attribute })));
  }

  observeDynamicContent() {
    if (this.observer || !document.body || typeof MutationObserver === 'undefined') return;
    this.observer = new MutationObserver((records) => {
      const hasAddedContent = records.some((record) => record.addedNodes.length > 0);
      if (!hasAddedContent || this.currentLanguage === 'ar') return;
      if (this.isTranslating) {
        this.pendingDynamicUpdate = true;
        return;
      }
      this.translatePage(this.currentLanguage);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  async translateText(text, sourceLang = 'ar', targetLang = 'en') {
    const clean = String(text || '').trim();
    if (!clean || sourceLang === targetLang) return clean;
    if (!this.apiKey) return clean;

    const cacheKey = `${sourceLang}:${targetLang}:${clean}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const languageNames = {
      ar: 'Arabic',
      en: 'English',
      fr: 'French',
      de: 'German',
      tr: 'Turkish'
    };
    const targetName = languageNames[targetLang] || 'English';
    const prompt = `Translate exactly the following text to ${targetName} while keeping the meaning and tone. Return only the translated text without explanations or markdown.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `${prompt}\n\n${clean}` }]
          }],
          generationConfig: { temperature: 0.2 }
        })
      });

      if (!response.ok) throw new Error(`Translation API error: ${response.status}`);
      const data = await response.json();
      const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (translated) {
        this.cache.set(cacheKey, translated);
        return translated;
      }
    } catch (error) {
      console.warn('Translation failed, keeping original text:', error.message);
    }

    return clean;
  }

  async translateBatch(texts, targetLang) {
    const uncached = texts.filter((text) => !this.cache.has(`${targetLang}:${text}`));
    if (!uncached.length) return texts.map((text) => this.cache.get(`${targetLang}:${text}`));

    const languageNames = { en: 'English', fr: 'French', de: 'German', tr: 'Turkish' };
    const targetName = languageNames[targetLang] || 'English';
    let translated;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: `Translate every string in this JSON array to ${targetName}. Return only a JSON array of translated strings in the same order and length. Keep the brand name Jordan Tour exactly unchanged. Do not add explanations.\n${JSON.stringify(uncached)}` }]
            }],
            generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `Translation API error: ${response.status}`);
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        translated = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim());
        if (!Array.isArray(translated) || translated.length !== uncached.length) throw new Error('Unexpected batch translation response.');
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
      }
    }

    if (lastError) throw lastError;
    uncached.forEach((text, index) => this.cache.set(`${targetLang}:${text}`, String(translated[index] || text)));
    try {
      localStorage.setItem('jt_translation_cache_v1', JSON.stringify(Object.fromEntries(this.cache)));
    } catch (error) {}

    return texts.map((text) => this.cache.get(`${targetLang}:${text}`) || text);
  }

  async translatePage(language = 'en') {
    if (!document?.body) return false;
    this.currentLanguage = language;
    this.observeDynamicContent();

    const nodes = this.getTextNodes();
    const attributes = this.getTranslatableAttributes();
    nodes.forEach((node) => {
      if (!this.originalText.has(node)) this.originalText.set(node, node.textContent || '');
    });
    attributes.forEach(({ element, attribute }) => {
      if (!this.originalAttributes.has(element)) this.originalAttributes.set(element, {});
      const original = this.originalAttributes.get(element);
      if (!(attribute in original)) original[attribute] = element.getAttribute(attribute) || '';
    });

    if (language === 'ar') {
      this.originalText.forEach((original, node) => {
        if (node.isConnected) node.textContent = original;
      });
      this.originalAttributes.forEach((original, element) => {
        if (!element.isConnected) return;
        Object.entries(original).forEach(([attribute, value]) => element.setAttribute(attribute, value));
      });
      return true;
    }

    if (!this.apiKey) return false;
    if (this.isTranslating) {
      this.pendingDynamicUpdate = true;
      await new Promise((resolve) => {
        const waitForTranslation = () => this.isTranslating ? setTimeout(waitForTranslation, 50) : resolve();
        waitForTranslation();
      });
      if (this.currentLanguage !== language) return false;
      return this.translatePage(language);
    }

    const targetLang = this.getTargetLanguage(language);
    const entries = [
      ...nodes.map((node) => ({ kind: 'text', node, original: this.originalText.get(node) || '' })),
      ...attributes.map(({ element, attribute }) => ({
        kind: 'attribute', element, attribute, original: this.originalAttributes.get(element)?.[attribute] || ''
      }))
    ].filter((entry) => {
      const text = entry.original.trim();
      return text.length > 1 && text.length <= 300 && text !== 'Jordan Tour';
    });

    this.isTranslating = true;
    let completed = false;
    try {
      const uniqueTexts = [...new Set(entries.map((entry) => entry.original.trim()))];
      const translatedByText = new Map();
      for (let index = 0; index < uniqueTexts.length; index += 120) {
        const batch = uniqueTexts.slice(index, index + 120);
        const translations = await this.translateBatch(batch, targetLang);
        batch.forEach((text, batchIndex) => translatedByText.set(text, translations[batchIndex]));
      }

      entries.forEach((entry) => {
        const original = entry.original;
        const trimmed = original.trim();
        const translated = translatedByText.get(trimmed);
        if (!translated || translated === trimmed) return;
        const leading = original.match(/^\s*/)?.[0] || '';
        const trailing = original.match(/\s*$/)?.[0] || '';
        const result = `${leading}${translated}${trailing}`;
        if (entry.kind === 'text' && entry.node.isConnected) entry.node.textContent = result;
        if (entry.kind === 'attribute' && entry.element.isConnected) entry.element.setAttribute(entry.attribute, result.trim());
      });
      completed = true;
      return true;
    } catch (error) {
      console.error('Full-page translation failed:', error.message);
      return false;
    } finally {
      this.isTranslating = false;
      if (this.pendingDynamicUpdate && completed) {
        this.pendingDynamicUpdate = false;
        queueMicrotask(() => this.translatePage(this.currentLanguage));
      } else if (!completed) {
        this.pendingDynamicUpdate = false;
      }
    }
  }
}

export const translationService = new TranslationService();
