import { useState } from 'react';
import { ArrowUpRight, MessageSquare } from 'lucide-react';
import type { ItemCategory, ShoppableItem } from '../types';
import { useSlidingCapsule } from '../hooks/useSlidingCapsule';

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
  const catCapsule = useSlidingCapsule(selectedCategory);

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <aside
      id="shoppable-index"
      aria-labelledby="shoppable-heading"
      className="liquid-glass-sheet flex h-full flex-col overflow-hidden rounded-[26px]"
    >
      <div className="border-b border-black/[0.06] px-6 py-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs text-[#4A514D]">
            Curated Sourcing · {activeStyleName}
          </p>
          <span className="font-mono text-xs tabular-nums text-[#4A514D]">
            {filteredItems.length} {filteredItems.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>
        <h2
          id="shoppable-heading"
          className="mt-1 font-editorial text-2xl font-semibold text-[#141715]"
        >
          Shoppable Index
        </h2>

        {/* Segmented Floating Liquid Glass Category Filter with Sliding Capsule */}
        <div
          ref={catCapsule.containerRef}
          role="group"
          aria-label="Filter shoppable items by category"
          className="liquid-glass-pill-track relative mt-4 flex flex-wrap gap-1 rounded-[18px] p-1"
        >
          {catCapsule.rect.ready && (
            <span
              aria-hidden="true"
              className="liquid-glass-capsule pointer-events-none absolute left-0 top-0 rounded-full"
              style={{
                width: `${catCapsule.rect.width}px`,
                height: `${catCapsule.rect.height}px`,
                transform: `translate3d(${catCapsule.rect.x}px, ${catCapsule.rect.y}px, 0)`,
                transition:
                  'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), width 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          )}
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                ref={catCapsule.registerItem(category)}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`relative z-10 min-h-[32px] rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected ? 'text-[#141715]' : 'text-[#4A514D] hover:text-[#141715]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Item List */}
      <div className="atelier-scroll max-h-[600px] divide-y divide-black/[0.06] overflow-y-auto px-6">
        {filteredItems.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#4A514D]">
            No pieces listed in {selectedCategory} yet. Ask the consultant to source a{' '}
            {selectedCategory.toLowerCase()} piece for this space.
          </div>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.id}
              className="-mx-3 rounded-2xl px-3 py-4 transition-colors hover:bg-white/45"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[11px] text-[#4A514D]">
                    {item.isRefinedPick ? (
                      <>
                        <span className="font-semibold text-[#1B4332]">Refined Pick</span>
                        <span aria-hidden="true"> · </span>
                      </>
                    ) : null}
                    <span>{item.category}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{item.retailer}</span>
                  </p>
                  <h3 className="font-sans text-sm font-semibold text-[#141715]">
                    {item.name}
                  </h3>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums text-[#141715] whitespace-nowrap shrink-0">
                  {item.price}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#4A514D]">
                {item.material} · {item.dimensions}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] underline-offset-4 hover:underline whitespace-nowrap"
                >
                  <span>Shop Similar</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => onAskAboutItem(item)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#4A514D] transition-colors hover:text-[#141715] whitespace-nowrap cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
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
