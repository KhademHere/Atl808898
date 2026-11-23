import { useState } from 'react';
import { ArrowUpRight, MessageSquare, Sparkles } from 'lucide-react';
import type { ItemCategory, ShoppableItem } from '../types';

interface ShoppableIndexProps {
  activeStyleName: string;
  items: ShoppableItem[];
  onAskAboutItem: (item: ShoppableItem) => void;
}

const CATEGORIES: Array<'All' | ItemCategory> = [
  'All',
  'Seating',
  'Rugs',
  'Tables',
  'Lighting',
  'Decor',
];

export function ShoppableIndex({
  activeStyleName,
  items,
  onAskAboutItem,
}: ShoppableIndexProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ItemCategory>('All');

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <aside
      id="shoppable-index"
      aria-labelledby="shoppable-heading"
      className="atelier-surface scroll-mt-20 flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="border-b border-[#D3BCC0] px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide uppercase text-[#69306D]">
            Curated Sourcing · {activeStyleName}
          </p>
          <span className="rounded-lg border border-[#C7ACB2] bg-[#E6D2D8] px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-[#0E103D] whitespace-nowrap shrink-0">
            {filteredItems.length} {filteredItems.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>
        <h2
          id="shoppable-heading"
          className="mt-1 text-xl font-bold tracking-[-0.015em] text-[#0E103D] sm:text-2xl"
        >
          Shoppable Index
        </h2>

        {/* High-Contrast Segmented Category Filter */}
        <div
          role="group"
          aria-label="Filter shoppable items by category"
          className="mt-4 flex flex-wrap gap-1.5 rounded-xl border border-[#C7ACB2] bg-[#D3BCC0]/75 p-1"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#69306D] text-[#F2D7EE] shadow-xs'
                    : 'text-[#0E103D] hover:bg-[#FAF0F8]/80'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Item List */}
      <div className="atelier-scroll max-h-[620px] flex-1 divide-y divide-[#D3BCC0] overflow-y-auto px-5 sm:px-6">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mx-auto max-w-[40ch] text-sm leading-relaxed text-[#2E234D]">
              No pieces listed in <strong className="font-semibold text-[#0E103D]">{selectedCategory}</strong> yet. Ask the consultant to source a{' '}
              {selectedCategory.toLowerCase()} piece for this space.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.id}
              className="-mx-3 rounded-xl px-3 py-4 transition-colors hover:bg-[#E6D2D8]/45"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#2E234D]">
                    {item.isRefinedPick && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#69306D] px-2 py-0.5 text-[11px] font-semibold text-[#F2D7EE]">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        <span>Refined Pick</span>
                      </span>
                    )}
                    <span className="font-semibold text-[#69306D]">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.retailer}</span>
                  </div>
                  <h3 className="text-sm font-bold leading-snug text-[#0E103D]">
                    {item.name}
                  </h3>
                </div>
                <span className="font-mono text-sm font-bold tabular-nums text-[#0E103D] whitespace-nowrap shrink-0">
                  {item.price}
                </span>
              </div>

              <p className="mt-1.5 text-xs leading-relaxed text-[#2E234D]">
                {item.material} · {item.dimensions}
              </p>

              <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#A5668B] bg-[#E6D2D8]/80 px-3.5 py-2 text-xs font-semibold text-[#0E103D] transition-colors hover:border-[#69306D] hover:bg-[#D3BCC0] whitespace-nowrap"
                >
                  <span>Shop Similar</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#69306D]" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => onAskAboutItem(item)}
                  className="btn-ghost min-h-[40px] px-3 py-2 text-xs font-semibold"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#69306D]" aria-hidden="true" />
                  <span>Ask Consultant</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
