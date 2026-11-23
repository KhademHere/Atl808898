import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import type { ChatMessage } from '../types';
import { SUGGESTED_CONSULTANT_PROMPTS } from '../data/styles';

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
  const [validationError, setValidationError] = useState<string | null>(null);

  // Scroll only the internal conversation pane on new messages; never hijack initial page scroll
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
    if (!trimmed) {
      setValidationError('Enter a room refinement request or choose a suggested prompt above.');
      return;
    }
    if (isSending) return;
    setValidationError(null);
    onSendMessage(trimmed);
  };

  return (
    <section
      id="consultation"
      aria-labelledby="consultation-heading"
      className="atelier-surface scroll-mt-20 flex h-full flex-col overflow-hidden rounded-2xl"
    >
      {/* Section Header */}
      <div className="border-b border-[#D3BCC0] px-5 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-wide uppercase text-[#69306D]">
          Context-Aware Design Consultant · {activeStyleName}
        </p>
        <h2
          id="consultation-heading"
          className="mt-1 text-xl font-bold tracking-[-0.015em] text-[#0E103D] sm:text-2xl"
        >
          Refine Layout, Palette &amp; Sourcing
        </h2>
        <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-[#2E234D]">
          Ask for targeted visual refinements or request shoppable furniture and textiles tailored to your current room.
        </p>
      </div>

      {/* Scrollable Multi-Turn Conversation Thread */}
      <div
        ref={logContainerRef}
        role="log"
        aria-live="polite"
        aria-label="Design consultant conversation history"
        className="atelier-scroll flex min-h-[280px] max-h-[420px] flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <article
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="mb-1.5 flex items-center gap-2 text-xs text-[#2E234D]">
                <span className="font-semibold text-[#0E103D]">
                  {isUser ? 'You' : 'Atelier Consultant'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px] tabular-nums">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[min(92%,65ch)] rounded-2xl px-4 py-3.5 text-sm leading-[1.6] ${
                  isUser
                    ? 'border border-[#69306D] bg-[#69306D] text-[#F2D7EE]'
                    : 'border border-[#C7ACB2] bg-[#E6D2D8]/65 text-[#0E103D]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.appliedVisualEdit && (
                  <p className="mt-3 flex items-center gap-2 border-t border-[#C7ACB2] pt-2.5 text-xs font-semibold text-[#69306D]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Updated the room visualization above with your requested refinement.</span>
                  </p>
                )}

                {msg.visualEditNotice && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border-l-4 border-[#69306D] bg-[#FAF0F8] px-3 py-2 text-xs font-medium text-[#0E103D]">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#69306D]" aria-hidden="true" />
                    <span>Visual preview note: {msg.visualEditNotice}</span>
                  </div>
                )}

                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-3 border-t border-[#C7ACB2] pt-2.5">
                    <p className="text-xs font-semibold text-[#2E234D]">Verified Web Sources</p>
                    <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                      {msg.groundingSources.slice(0, 4).map((source) => (
                        <li key={source.uri}>
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[32px] items-center gap-1 text-xs font-semibold text-[#69306D] underline decoration-[#A5668B] underline-offset-4 hover:text-[#0E103D]"
                          >
                            <span className="max-w-[220px] truncate">{source.title}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-xl border border-[#C7ACB2] bg-[#E6D2D8]/70 px-4 py-3 text-xs font-semibold text-[#0E103D]"
          >
            <Loader2 className="h-4 w-4 animate-spin text-[#69306D]" aria-hidden="true" />
            <span>Reviewing room layout, refining concept, and sourcing matching pieces...</span>
          </div>
        )}
      </div>

      {/* Quick Refinement Prompts */}
      <div className="border-t border-[#D3BCC0] bg-[#E6D2D8]/50 px-5 py-4 sm:px-6">
        <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#0E103D]">
          <Sparkles className="h-3.5 w-3.5 text-[#69306D]" aria-hidden="true" />
          <span>Suggested Refinements</span>
        </p>
        <div className="flex flex-wrap gap-2.5">
          {SUGGESTED_CONSULTANT_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isSending}
              onClick={() => {
                setValidationError(null);
                onSendMessage(prompt);
              }}
              className="btn-secondary min-h-[40px] px-3.5 py-2 text-left text-xs whitespace-normal"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Accessible Input Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-3 border-t border-[#D3BCC0] bg-[#FAF0F8] p-5 sm:px-6"
      >
        {(errorMessage || validationError) && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border-2 border-[#69306D] bg-[#E6D2D8]/60 px-4 py-3 text-xs font-semibold text-[#0E103D]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#69306D]" aria-hidden="true" />
            <span>{errorMessage || validationError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="consultant-prompt-input"
            className="text-sm font-semibold text-[#0E103D]"
          >
            Ask your consultant or request a visual change
          </label>

          <label className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-2 text-xs font-semibold text-[#0E103D] cursor-pointer select-none hover:bg-[#E6D2D8]/60">
            <input
              type="checkbox"
              checked={applyVisualEdit}
              onChange={(e) => onToggleApplyVisualEdit(e.target.checked)}
              className="h-4 w-4 rounded border-[#69306D] accent-[#69306D]"
            />
            <span>Auto-render visual edits</span>
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="consultant-prompt-input"
            type="text"
            value={inputValue}
            onChange={(e) => {
              if (validationError) setValidationError(null);
              onInputChange(e.target.value);
            }}
            disabled={isSending}
            aria-invalid={Boolean(validationError)}
            placeholder='e.g., "Keep this layout but make the rug blue and suggest wool rugs"'
            className="atelier-input flex-1"
          />
          <button
            type="submit"
            disabled={isSending}
            aria-label="Send design refinement message"
            className="btn-primary shrink-0 px-6"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </section>
  );
}
