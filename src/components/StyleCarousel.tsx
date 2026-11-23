import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import type { StyleDefinition } from '../types';

interface StyleCarouselProps {
  styles: StyleDefinition[];
  activeStyleId: string;
  generatedImagesByStyle: Record<string, string>;
  isGenerating: boolean;
  resolution: '1K' | '2K';
  onResolutionChange: (res: '1K' | '2K') => void;
  onSelectStyle: (styleId: string) => void;
  onGenerateStyle: (styleId: string, customNote?: string) => void;
}

export function StyleCarousel({
  styles,
  activeStyleId,
  generatedImagesByStyle,
  isGenerating,
  resolution,
  onResolutionChange,
  onSelectStyle,
  onGenerateStyle,
}: StyleCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [customNote, setCustomNote] = useState('');
  const [showRenderOptions, setShowRenderOptions] = useState(false);

  const activeStyle = styles.find((s) => s.id === activeStyleId) ?? styles[0];
  const hasRenderedActive = Boolean(generatedImagesByStyle[activeStyle.id]);

  // Automatically reveal render options when selecting an unrendered style so generation is effortless
  useEffect(() => {
    if (!hasRenderedActive) {
      setShowRenderOptions(true);
    }
  }, [activeStyle.id, hasRenderedActive]);

  const scrollByCards = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    onGenerateStyle(activeStyle.id, customNote.trim() || undefined);
  };

  return (
    <section
      id="styles"
      aria-labelledby="styles-heading"
      className="scroll-mt-20 space-y-6 pt-2"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wide uppercase text-[#69306D]">
            Style Library · {styles.length} Architectural Directions
          </p>
          <h2
            id="styles-heading"
            className="text-2xl font-bold tracking-[-0.02em] text-[#0E103D] sm:text-3xl"
          >
            Reimagined Style Direction
          </h2>
          <p className="max-w-[65ch] text-sm leading-relaxed text-[#2E234D]">
            Select an interior direction below to compare against your current room or render a customized AI variation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Scroll styles left"
            title="Scroll styles left"
            onClick={() => scrollByCards('left')}
            className="btn-secondary h-11 w-11 p-0"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Scroll styles right"
            title="Scroll styles right"
            onClick={() => scrollByCards('right')}
            className="btn-secondary h-11 w-11 p-0"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel of Accessible Style Cards */}
      <div
        ref={scrollRef}
        role="region"
        aria-label="Interior design styles carousel"
        className="atelier-scroll flex gap-5 overflow-x-auto px-0.5 pb-4 pt-1"
      >
        {styles.map((style) => {
          const isActive = style.id === activeStyleId;
          const previewUrl = generatedImagesByStyle[style.id];
          return (
            <button
              key={style.id}
              type="button"
              data-active={isActive ? 'true' : 'false'}
              onClick={() => onSelectStyle(style.id)}
              aria-pressed={isActive}
              className={`group flex w-[264px] shrink-0 flex-col overflow-hidden rounded-2xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-2 border-[#69306D] bg-[#FAF0F8] shadow-[0_8px_22px_-12px_rgba(105,48,109,0.45)]'
                  : 'atelier-surface hover:border-[#A5668B] hover:bg-[#FFF6FD]'
              }`}
            >
              <div className="relative m-2 mb-0 aspect-[16/9] overflow-hidden rounded-xl bg-[#E6D2D8]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`${style.name} room preview`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col justify-between bg-[#E6D2D8] p-3.5">
                    <div className="flex items-center gap-1.5">
                      {style.palette.map((swatch) => (
                        <span
                          key={swatch.name}
                          title={swatch.name}
                          className="h-5 w-5 rounded-full border border-[#0E103D]/25"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))}
                    </div>
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E103D]">
                      <Sparkles className="h-3.5 w-3.5 text-[#69306D]" aria-hidden="true" />
                      <span>Ready to render on demand</span>
                    </p>
                  </div>
                )}

                {isActive && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-[#69306D] px-2.5 py-1 text-[11px] font-semibold text-[#F2D7EE] shadow-sm">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-4 pt-3.5">
                <div>
                  <span className="block text-base font-bold tracking-[-0.01em] text-[#0E103D]">
                    {style.name}
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-[#2E234D]">
                    {style.materials.slice(0, 3).join(' · ')}
                  </p>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-[#D3BCC0] pt-2.5 text-xs">
                  <span className="font-medium text-[#2E234D]">{style.eraLabel}</span>
                  <span className="font-semibold text-[#69306D]">
                    {previewUrl ? 'Compare' : 'Generate'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Style Material Dossier & Progressive Disclosure AI Controls */}
      <div className="atelier-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[65ch] space-y-2">
            <p className="text-xs font-semibold text-[#69306D]">
              <span>{activeStyle.eraLabel}</span>
              <span aria-hidden="true"> · </span>
              <span>{activeStyle.materials.slice(0, 3).join(', ')}</span>
            </p>
            <h3 className="text-xl font-bold tracking-[-0.015em] text-[#0E103D]">
              {activeStyle.name}
            </h3>
            <p className="text-sm leading-relaxed text-[#2E234D]">{activeStyle.summary}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
              {activeStyle.palette.map((swatch) => (
                <div
                  key={swatch.name}
                  className="flex items-center gap-2 text-xs font-medium text-[#0E103D]"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-[#0E103D]/25"
                    style={{ backgroundColor: swatch.hex }}
                    aria-hidden="true"
                  />
                  <span>{swatch.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
            <button
              type="button"
              aria-expanded={showRenderOptions}
              aria-controls="ai-render-options-panel"
              onClick={() => setShowRenderOptions((prev) => !prev)}
              className="btn-secondary text-xs sm:text-sm"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>
                {showRenderOptions ? 'Hide AI Render Options' : 'Customize AI Render Options'}
              </span>
              {showRenderOptions ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {!showRenderOptions && (
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => onGenerateStyle(activeStyle.id, customNote.trim() || undefined)}
                className="btn-primary text-xs sm:text-sm"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{hasRenderedActive ? 'Re-render with AI' : 'Generate Makeover'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progressive Disclosure Panel: Custom AI Note & Resolution */}
        {showRenderOptions && (
          <form
            id="ai-render-options-panel"
            onSubmit={handleGenerateSubmit}
            className="mt-5 space-y-4 border-t border-[#D3BCC0] pt-5"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
              <div className="space-y-1.5 lg:col-span-7">
                <label
                  htmlFor="custom-style-note"
                  className="block text-sm font-semibold text-[#0E103D]"
                >
                  Direct AI Makeover Prompt (Optional Styling Note)
                </label>
                <input
                  id="custom-style-note"
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  disabled={isGenerating}
                  placeholder="e.g., Emphasize warm walnut shelves and soft evening lighting..."
                  className="atelier-input"
                />
              </div>

              <div className="space-y-1.5 lg:col-span-2">
                <span className="block text-sm font-semibold text-[#0E103D]">
                  Render Resolution
                </span>
                <div
                  role="group"
                  aria-label="Output resolution"
                  className="inline-flex w-full rounded-xl border border-[#C7ACB2] bg-[#D3BCC0]/70 p-1"
                >
                  {(['1K', '2K'] as const).map((res) => {
                    const isSelected = resolution === res;
                    return (
                      <button
                        key={res}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onResolutionChange(res)}
                        className={`min-h-[38px] flex-1 rounded-lg px-3 font-mono text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#69306D] text-[#F2D7EE]'
                            : 'text-[#0E103D] hover:bg-[#FAF0F8]/75'
                        }`}
                      >
                        {res}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-3">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="btn-primary w-full"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>{hasRenderedActive ? 'Re-render with AI' : 'Generate Makeover'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
