/**
 * 🇯🇴 Jordan Tour - Comment Tree & Nested Replies Module
 * مسار الملف: js/modules/community/comment-tree.js
 * يدير عرض وتفاعل شجرة التعليقات والردود المتداخلة والإعجابات (Facebook-style)
 */

import { store } from '../../state/store.js';
import { hasCollectedAllOfficialStamps, renderJordanVerificationBadge } from '../../components/jordan-verification-badge.js';

export class CommentTreeManager {
  /**
   * @param {Object} options
   * @param {Function} options.onAddComment - دالة استدعاء عند إضافة تعليق
   * @param {Function} options.onAddReply - دالة استدعاء عند إضافة رد على تعليق
   * @param {Function} options.onLikeComment - دالة استدعاء عند الإعجاب بتعليق
   * @param {Function} options.onLikeReply - دالة استدعاء عند الإعجاب برد
   * @param {Function} options.onReportComment - دالة استدعاء عند الإبلاغ عن تعليق
   */
  constructor({
    onAddComment = () => {},
    onAddReply = () => {},
    onLikeComment = () => {},
    onLikeReply = () => {},
    onReportComment = () => {},
  } = {}) {
    this.onAddComment = onAddComment;
    this.onAddReply = onAddReply;
    this.onLikeComment = onLikeComment;
    this.onLikeReply = onLikeReply;
    this.onReportComment = onReportComment;
    this.activeReplyBoxCommentId = null;
  }

  /**
   * رسم شجرة التعليقات بالكامل داخل الحاوية المستهدفة
   * @param {HTMLElement} container - عنصر الـ DOM الحاوي
   * @param {Array} comments - مصفوفة التعليقات
   * @param {string} postId - معرف المنشور
   */
  render(container, comments = [], postId) {
    if (!container) return;

    const isAr = store.language === 'ar';

    if (comments.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-xs">
          ${isAr ? 'كن أول من يعلق ويشارك رأيه في هذه التجربة!' : 'Be the first to share your thoughts on this story!'}
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${comments
          .map((comment) => this.renderCommentHTML(comment, postId, isAr))
          .join('')}
      </div>
    `;

    this.bindEvents(container, postId);
  }

  /**
   * توليد كود HTML لتعليق منفرد مع ردوده المتداخلة
   */
  renderCommentHTML(comment, postId, isAr) {
    const isReplying = this.activeReplyBoxCommentId === comment.id;
    const likesCount = comment.likesCount || 0;
    const isLiked = !!comment.isLiked;
    const replies = comment.replies || [];

    return `
      <div class="comment-item space-y-2 group" data-comment-id="${comment.id}">
        <!-- رأس التعليق ومحتواه -->
        <div class="flex items-start gap-3">
          <img
            src="${comment.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}"
            alt="${comment.authorName}"
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
          />

          <div class="flex-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-slate-100 relative">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-extrabold text-xs text-[#1E293B]">
                  ${comment.authorName}
                </span>
                ${
                  hasCollectedAllOfficialStamps(comment.authorStamps)
                    ? renderJordanVerificationBadge('h-4 w-4')
                    : ''
                }
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400 font-mono">${comment.createdAt || (isAr ? 'الآن' : 'Just now')}</span>
                <button
                  type="button"
                  data-action="report"
                  data-comment-id="${comment.id}"
                  class="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                  title="${isAr ? 'إبلاغ عن التعليق' : 'Report'}"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.924a5.5 5.5 0 014.288.243l.89.445a5.5 5.5 0 004.288.243L19 14.5V4.5l-3.77.924a5.5 5.5 0 01-4.288-.243l-.89-.445a5.5 5.5 0 00-4.288-.243L3 5.5v9.5z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- نص التعليق -->
            <p class="text-xs text-slate-700 leading-relaxed font-sans">
              ${comment.text}
            </p>

            <!-- شريط التفاعل: إعجاب + رد -->
            <div class="pt-2 mt-1.5 border-t border-slate-200/60 flex items-center gap-4 text-[11px]">
              <button
                type="button"
                data-action="like-comment"
                data-comment-id="${comment.id}"
                class="flex items-center gap-1 font-bold transition-colors ${
                  isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                }"
              >
                <svg class="w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span class="likes-count">${likesCount}</span>
                <span>${isAr ? 'إعجاب' : 'Like'}</span>
              </button>

              <button
                type="button"
                data-action="toggle-reply"
                data-comment-id="${comment.id}"
                class="flex items-center gap-1 font-bold text-slate-500 hover:text-[#C86D51] transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <span>${isAr ? 'رد' : 'Reply'}</span>
                ${
                  replies.length > 0
                    ? `<span class="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono text-[10px]">${replies.length}</span>`
                    : ''
                }
              </button>
            </div>
          </div>
        </div>

        <!-- حقل إدخال الرد عند النقر على "رد" -->
        ${
          isReplying
            ? `
          <div class="reply-input-box ms-11 sm:ms-12 flex items-center gap-2 pt-1 animate-in fade-in duration-200">
            <input
              type="text"
              class="reply-text-field flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#C86D51] shadow-2xs"
              placeholder="${isAr ? `اكتب ردك على ${comment.authorName}...` : `Reply to ${comment.authorName}...`}"
            />
            <button
              type="button"
              data-action="submit-reply"
              data-comment-id="${comment.id}"
              class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              ${isAr ? 'إرسال' : 'Send'}
            </button>
          </div>
        `
            : ''
        }

        <!-- قائمة الردود المتداخلة (Nested Replies) -->
        ${
          replies.length > 0
            ? `
          <div class="nested-replies ms-11 sm:ms-12 ps-3 border-s-2 border-slate-200 space-y-2 pt-1">
            ${replies.map((reply) => this.renderReplyHTML(reply, comment.id, postId, isAr)).join('')}
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  /**
   * توليد كود HTML لرد منفرد داخل تعليق
   */
  renderReplyHTML(reply, commentId, postId, isAr) {
    const isLiked = !!reply.isLiked;
    const likesCount = reply.likesCount || 0;

    return `
      <div class="reply-item bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1" data-reply-id="${reply.id}">
        <div class="flex items-center justify-between text-[10px]">
          <div class="flex items-center gap-1.5">
            <img
              src="${reply.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}"
              alt="${reply.authorName}"
              class="w-5 h-5 rounded-full object-cover"
            />
            <span class="font-bold text-[#1E293B]">${reply.authorName}</span>
            ${
              hasCollectedAllOfficialStamps(reply.authorStamps)
                ? renderJordanVerificationBadge('h-3.5 w-3.5')
                : ''
            }
          </div>
          <span class="text-slate-400 font-mono">${reply.createdAt || (isAr ? 'الآن' : 'Just now')}</span>
        </div>

        <p class="text-[11px] text-slate-700 ps-6 leading-relaxed">
          ${reply.text}
        </p>

        <div class="ps-6 flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
          <button
            type="button"
            data-action="like-reply"
            data-comment-id="${commentId}"
            data-reply-id="${reply.id}"
            class="flex items-center gap-1 font-bold ${
              isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
            }"
          >
            <svg class="w-3 h-3 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span>${likesCount}</span>
            <span>${isAr ? 'إعجاب' : 'Like'}</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * ربط الأحداث (Event Delegation) داخل حاوية التعليقات
   */
  bindEvents(container, postId) {
    container.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const commentId = target.dataset.commentId;
      const replyId = target.dataset.replyId;

      if (action === 'like-comment') {
        this.onLikeComment(postId, commentId);
      } else if (action === 'toggle-reply') {
        this.activeReplyBoxCommentId =
          this.activeReplyBoxCommentId === commentId ? null : commentId;
        // إعادة الرسم الجزئي
        const commentElem = target.closest('.comment-item');
        if (commentElem) {
          const isReplying = this.activeReplyBoxCommentId === commentId;
          const existingBox = commentElem.querySelector('.reply-input-box');
          if (isReplying && !existingBox) {
            const isAr = store.language === 'ar';
            const authorName = commentElem.querySelector('.font-extrabold')?.textContent?.trim() || '';
            const boxDiv = document.createElement('div');
            boxDiv.className = 'reply-input-box ms-11 sm:ms-12 flex items-center gap-2 pt-1 animate-in fade-in duration-200';
            boxDiv.innerHTML = `
              <input
                type="text"
                class="reply-text-field flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#C86D51] shadow-2xs"
                placeholder="${isAr ? `اكتب ردك على ${authorName}...` : `Reply to ${authorName}...`}"
              />
              <button
                type="button"
                data-action="submit-reply"
                data-comment-id="${commentId}"
                class="bg-[#C86D51] hover:bg-[#B45A3E] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                ${isAr ? 'إرسال' : 'Send'}
              </button>
            `;
            commentElem.appendChild(boxDiv);
            boxDiv.querySelector('input')?.focus();
          } else if (!isReplying && existingBox) {
            existingBox.remove();
          }
        }
      } else if (action === 'submit-reply') {
        const commentElem = target.closest('.comment-item');
        const inputField = commentElem?.querySelector('.reply-text-field');
        const text = inputField?.value?.trim();
        if (text) {
          this.onAddReply(postId, commentId, text);
          this.activeReplyBoxCommentId = null;
        }
      } else if (action === 'like-reply') {
        this.onLikeReply(postId, commentId, replyId);
      } else if (action === 'report') {
        this.onReportComment(postId, commentId);
      }
    });

    // الاستماع لضغط زر Enter في حقل الرد
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = e.target.closest('.reply-text-field');
        if (input) {
          const commentElem = input.closest('.comment-item');
          const commentId = commentElem?.dataset?.commentId;
          const text = input.value.trim();
          if (text && commentId) {
            this.onAddReply(postId, commentId, text);
            this.activeReplyBoxCommentId = null;
          }
        }
      }
    });
  }
}