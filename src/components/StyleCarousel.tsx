import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
            className="font-editorial text-3xl font-medium tracking-tight text-[#141413]"
          >
            Reimagined Style Direction
          </h2>
          <p className="text-sm text-[#5C5C58]">
            Select an architectural movement to compare against your current room or render a fresh AI variation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll styles left"
            onClick={() => scrollByCards('left')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#D4D4CE] bg-white text-[#141413] transition-colors hover:bg-[#EFEFED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Scroll styles right"
            onClick={() => scrollByCards('right')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#D4D4CE] bg-white text-[#141413] transition-colors hover:bg-[#EFEFED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel of Style Cards */}
      <div
        ref={scrollRef}
        role="region"
        aria-label="Interior design styles carousel"
        className="atelier-scroll flex gap-5 overflow-x-auto pb-3"
      >
        {styles.map((style) => {
          const isActive = style.id === activeStyleId;
          const previewUrl = generatedImagesByStyle[style.id];
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id)}
              aria-pressed={isActive}
              className={`group flex w-[250px] shrink-0 flex-col overflow-hidden rounded-lg border bg-white text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer ${
                isActive
                  ? 'border-[#1B4332] ring-1 ring-[#1B4332]'
                  : 'border-[#E2E2DE] hover:-translate-y-0.5 hover:border-[#B8B8B0]'
              }`}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#ECECE7]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`${style.name} room preview`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col justify-between p-4">
                    <div className="flex items-center gap-1.5">
                      {style.palette.map((swatch) => (
                        <span
                          key={swatch.name}
                          title={swatch.name}
                          className="h-5 w-5 rounded-full border border-black/10"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-[#5C5C58]">
                      Ready to generate on demand
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-editorial text-xl font-semibold text-[#141413]">
                      {style.name}
                    </span>
                    {isActive && (
                      <span className="text-[11px] font-semibold text-[#1B4332] whitespace-nowrap shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#5C5C58]">
                    {style.materials.slice(0, 3).join(' · ')}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#F0F0EC] pt-2.5 text-[11px] text-[#5C5C58]">
                  <span>{style.eraLabel}</span>
                  <span className="font-medium text-[#141413]">
                    {previewUrl ? 'Compare' : 'Generate'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Style Material Dossier & Custom AI Render Bar */}
      <div className="grid grid-cols-1 gap-6 rounded-lg border border-[#E2E2DE] bg-white p-5 lg:grid-cols-12 lg:items-center lg:p-6">
        <div className="space-y-2 lg:col-span-5">
          <p className="text-xs leading-relaxed text-[#5C5C58]">
            <span>{activeStyle.eraLabel}</span>
            <span aria-hidden="true"> · </span>
            <span>{activeStyle.materials.slice(0, 3).join(', ')}</span>
          </p>
          <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
            {activeStyle.name}
          </h3>
          <p className="text-sm leading-relaxed text-[#5C5C58]">{activeStyle.summary}</p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {activeStyle.palette.map((swatch) => (
              <div key={swatch.name} className="flex items-center gap-1.5 text-xs text-[#5C5C58]">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0"
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
          className="flex flex-col gap-3 border-t border-[#EFEFED] pt-4 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <label htmlFor="custom-style-note" className="text-xs font-medium text-[#141413]">
            Direct AI Makeover Prompt (Optional Styling Note)
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="custom-style-note"
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={`e.g., Emphasize warm walnut shelves and soft evening lighting...`}
              className="min-h-[42px] flex-1 rounded-md border border-[#D4D4CE] bg-[#F7F7F5] px-3.5 py-2 text-sm text-[#141413] placeholder:text-[#787872] focus:border-[#1B4332] focus:bg-white focus:outline-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <div
                role="group"
                aria-label="Output resolution"
                className="inline-flex rounded-md border border-[#D4D4CE] bg-[#F7F7F5] p-0.5"
              >
                {(['1K', '2K'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => onResolutionChange(res)}
                    className={`min-h-[36px] rounded px-2.5 text-xs font-medium tabular-nums transition-colors whitespace-nowrap cursor-pointer ${
                      resolution === res
                        ? 'bg-white text-[#141413] shadow-xs'
                        : 'text-[#5C5C58] hover:text-[#141413]'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md bg-[#1B4332] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#143326] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
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
