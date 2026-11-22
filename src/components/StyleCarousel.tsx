import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { StyleDefinition } from '../types';
import { handleLiquidPointerLeave, handleLiquidPointerMove } from '../hooks/useLiquidPointer';
import { useSlidingCapsule } from '../hooks/useSlidingCapsule';

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
  const resCapsule = useSlidingCapsule(resolution);

  const activeStyle = styles.find((s) => s.id === activeStyleId) ?? styles[0];
  const hasRenderedActive = Boolean(generatedImagesByStyle[activeStyle.id]);

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
    <section id="styles" aria-labelledby="styles-heading" className="space-y-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="styles-heading"
            className="font-editorial text-3xl font-medium tracking-tight text-[#141715]"
          >
            Reimagined Style Direction
          </h2>
          <p className="text-sm text-[#4A514D]">
            Select an architectural movement to compare against your current room or render a fresh AI variation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Scroll styles left"
            onClick={() => scrollByCards('left')}
            onPointerMove={handleLiquidPointerMove}
            onPointerLeave={handleLiquidPointerLeave}
            className="liquid-glass-btn liquid-specular inline-flex h-10 w-10 items-center justify-center rounded-full text-[#141715] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Scroll styles right"
            onClick={() => scrollByCards('right')}
            onPointerMove={handleLiquidPointerMove}
            onPointerLeave={handleLiquidPointerLeave}
            className="liquid-glass-btn liquid-specular inline-flex h-10 w-10 items-center justify-center rounded-full text-[#141715] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel of Layered Frosted-Crystal Style Cards */}
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
              onPointerMove={handleLiquidPointerMove}
              onPointerLeave={handleLiquidPointerLeave}
              aria-pressed={isActive}
              className="liquid-glass-card liquid-specular group flex w-[256px] shrink-0 flex-col overflow-hidden rounded-[22px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer"
            >
              <div className="relative m-2 mb-0 aspect-[16/9] overflow-hidden rounded-[15px] bg-[#E2E6E3]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`${style.name} room preview`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-white/55 to-white/25 p-3.5">
                    <div className="flex items-center gap-1.5">
                      {style.palette.map((swatch) => (
                        <span
                          key={swatch.name}
                          title={swatch.name}
                          className="h-5 w-5 rounded-full border border-white/80 shadow-xs"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-[#464D49]">
                      Ready to generate on demand
                    </p>
                  </div>
                )}
              </div>

              <div className="relative z-10 flex flex-1 flex-col justify-between p-4 pt-3.5">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-editorial text-xl font-semibold text-[#141715]">
                      {style.name}
                    </span>
                    {isActive && (
                      <span className="text-[11px] font-semibold text-[#1B4332] whitespace-nowrap shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#4A514D]">
                    {style.materials.slice(0, 3).join(' · ')}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-black/[0.06] pt-2.5 text-[11px] text-[#4A514D]">
                  <span>{style.eraLabel}</span>
                  <span className="font-semibold text-[#141715]">
                    {previewUrl ? 'Compare' : 'Generate'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Style Material Dossier & Direct AI Prompt Bar */}
      <div className="liquid-glass-sheet grid grid-cols-1 gap-6 rounded-[24px] p-5 lg:grid-cols-12 lg:items-center lg:p-6">
        <div className="space-y-2 lg:col-span-5">
          <p className="text-xs leading-relaxed text-[#4A514D]">
            <span>{activeStyle.eraLabel}</span>
            <span aria-hidden="true"> · </span>
            <span>{activeStyle.materials.slice(0, 3).join(', ')}</span>
          </p>
          <h3 className="font-editorial text-2xl font-semibold text-[#141715]">
            {activeStyle.name}
          </h3>
          <p className="text-sm leading-relaxed text-[#3F4541]">{activeStyle.summary}</p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {activeStyle.palette.map((swatch) => (
              <div key={swatch.name} className="flex items-center gap-1.5 text-xs text-[#464D49]">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/80 shadow-xs shrink-0"
                  style={{ backgroundColor: swatch.hex }}
                  aria-hidden="true"
                />
                <span>{swatch.name}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleGenerateSubmit}
          className="flex flex-col gap-3 border-t border-black/[0.07] pt-4 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <label htmlFor="custom-style-note" className="text-xs font-semibold text-[#141715]">
            Direct AI Makeover Prompt (Optional Styling Note)
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="custom-style-note"
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g., Emphasize warm walnut shelves and soft evening lighting..."
              className="liquid-glass-well min-h-[44px] flex-1 rounded-full px-4 py-2 text-sm text-[#141715] placeholder:text-[#666E69]"
            />
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                ref={resCapsule.containerRef}
                role="group"
                aria-label="Output resolution"
                className="liquid-glass-pill-track relative inline-flex rounded-full p-1"
              >
                {resCapsule.rect.ready && (
                  <span
                    aria-hidden="true"
                    className="liquid-glass-capsule pointer-events-none absolute left-0 top-0 rounded-full"
                    style={{
                      width: `${resCapsule.rect.width}px`,
                      height: `${resCapsule.rect.height}px`,
                      transform: `translate3d(${resCapsule.rect.x}px, ${resCapsule.rect.y}px, 0)`,
                      transition:
                        'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), width 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                )}
                {(['1K', '2K'] as const).map((res) => {
                  const isSelected = resolution === res;
                  return (
                    <button
                      key={res}
                      ref={resCapsule.registerItem(res)}
                      type="button"
                      onClick={() => onResolutionChange(res)}
                      className={`relative z-10 min-h-[34px] rounded-full px-3 text-xs font-medium tabular-nums transition-colors whitespace-nowrap cursor-pointer ${
                        isSelected ? 'text-[#141715]' : 'text-[#4A514D] hover:text-[#141715]'
                      }`}
                    >
                      {res}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                onPointerMove={handleLiquidPointerMove}
                onPointerLeave={handleLiquidPointerLeave}
                className="liquid-glass-btn-accent liquid-specular-accent inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{hasRenderedActive ? 'Re-render with AI' : 'Generate Makeover'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
