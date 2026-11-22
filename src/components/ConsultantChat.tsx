import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, Loader2, Send, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../types';
import { SUGGESTED_CONSULTANT_PROMPTS } from '../data/styles';
import { handleLiquidPointerLeave, handleLiquidPointerMove } from '../hooks/useLiquidPointer';

interface ConsultantChatProps {
  messages: ChatMessage[];
  activeStyleName: string;
  inputValue: string;
  onInputChange: (val: string) => void;
  applyVisualEdit: boolean;
  onToggleApplyVisualEdit: (val: boolean) => void;
  isSending: boolean;
  errorMessage?: string | null;
  onSendMessage: (text: string) => void;
}

export function ConsultantChat({
  messages,
  activeStyleName,
  inputValue,
  onInputChange,
  applyVisualEdit,
  onToggleApplyVisualEdit,
  isSending,
  errorMessage,
  onSendMessage,
}: ConsultantChatProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;
    onSendMessage(trimmed);
  };

  return (
    <section
      id="consultation"
      aria-labelledby="consultation-heading"
      className="liquid-glass-sheet flex h-full flex-col overflow-hidden rounded-[26px]"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] px-6 py-5">
        <p className="text-xs text-[#4A514D]">
          Context-Aware Design Consultant · {activeStyleName}
        </p>
        <h2
          id="consultation-heading"
          className="mt-1 font-editorial text-2xl font-semibold text-[#141715]"
        >
          Refine Layout, Palette &amp; Sourcing
        </h2>
        <p className="mt-1 text-sm text-[#4A514D]">
          Ask for specific visual edits or request similar shoppable furniture and textiles tailored to your current room.
        </p>
      </div>

      {/* Scrollable Multi-Turn Conversation Thread */}
      <div
        ref={logContainerRef}
        role="log"
        aria-live="polite"
        aria-label="Design consultant conversation history"
        className="atelier-scroll flex min-h-[280px] max-h-[420px] flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <article
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="mb-1 flex items-center gap-2 text-[11px] text-[#4A514D]">
                <span className="font-semibold text-[#141715]">
                  {isUser ? 'You' : 'Atelier Consultant'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[92%] rounded-[20px] px-4 py-3.5 text-sm leading-relaxed ${
                  isUser
                    ? 'border border-white/25 bg-gradient-to-b from-[#235A42]/92 to-[#163B2B]/96 text-white shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.42),0_10px_22px_-10px_rgba(27,67,50,0.48)]'
                    : 'border border-white/80 bg-white/75 text-[#141715] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.95),0_8px_20px_-12px_rgba(17,30,24,0.14)]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.appliedVisualEdit && (
                  <p className="mt-2.5 flex items-center gap-1.5 border-t border-black/[0.07] pt-2 text-xs font-medium text-[#1B4332]">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Updated the room visualization above with your requested refinement.</span>
                  </p>
                )}

                {msg.visualEditNotice && (
                  <p className="mt-2.5 border-t border-black/[0.07] pt-2 text-xs text-[#6E2D1A]">
                    Visual preview note: {msg.visualEditNotice}
                  </p>
                )}

                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-3 border-t border-black/[0.07] pt-2.5">
                    <p className="text-[11px] font-medium text-[#4A514D]">Verified Web Sources</p>
                    <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                      {msg.groundingSources.slice(0, 4).map((source) => (
                        <li key={source.uri}>
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] underline-offset-4 hover:underline"
                          >
                            <span className="max-w-[220px] truncate">{source.title}</span>
                            <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2.5 text-xs font-medium text-[#464D49]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1B4332]" aria-hidden="true" />
            <span>Reviewing room layout, refining concept, and sourcing matching pieces...</span>
          </div>
        )}
      </div>

      {/* Quick Refinement Prompts */}
      <div className="border-t border-black/[0.06] bg-white/30 px-6 py-3.5">
        <p className="mb-2 text-[11px] font-semibold text-[#4A514D]">Suggested Refinements</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_CONSULTANT_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isSending}
              onClick={() => onSendMessage(prompt)}
              onPointerMove={handleLiquidPointerMove}
              onPointerLeave={handleLiquidPointerLeave}
              className="liquid-glass-btn liquid-specular rounded-full px-3.5 py-1.5 text-left text-xs font-medium text-[#141715] hover:text-[#1B4332] disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3 border-t border-black/[0.06] bg-white/20 p-5">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-2xl border border-[#D9B8AA] bg-[#FDF6F2]/90 px-4 py-2.5 text-xs font-medium text-[#6E2D1A]"
          >
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="consultant-prompt-input"
            className="text-xs font-semibold text-[#141715]"
          >
            Ask your consultant or request a visual change
          </label>

          <label className="inline-flex items-center gap-2 text-xs text-[#464D49] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={applyVisualEdit}
              onChange={(e) => onToggleApplyVisualEdit(e.target.checked)}
              className="h-4 w-4 rounded border-[#B5BEB8] accent-[#1B4332]"
            />
            <span>Auto-render visual edits</span>
          </label>
        </div>

        <div className="flex gap-2.5">
          <input
            id="consultant-prompt-input"
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isSending}
            placeholder='e.g., "Keep this layout but make the rug blue and suggest similar wool rugs"'
            className="liquid-glass-well min-h-[46px] flex-1 rounded-full px-4 py-2.5 text-sm text-[#141715] placeholder:text-[#666E69] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            aria-label="Send design refinement message"
            onPointerMove={handleLiquidPointerMove}
            onPointerLeave={handleLiquidPointerLeave}
            className="liquid-glass-btn-accent liquid-specular-accent inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-45 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </section>
  );
}
