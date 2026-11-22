import { useState } from 'react';
import { ArrowUpRight, MessageSquare } from 'lucide-react';
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
      className="flex h-full flex-col rounded-lg border border-[#E2E2DE] bg-white"
    >
      <div className="border-b border-[#E2E2DE] px-6 py-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs text-[#5C5C58]">
            Curated Sourcing · {activeStyleName}
          </p>
          <span className="font-mono text-xs tabular-nums text-[#5C5C58]">
            {filteredItems.length} {filteredItems.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>
        <h2
          id="shoppable-heading"
          className="mt-1 font-editorial text-2xl font-semibold text-[#141413]"
        >
          Shoppable Index
        </h2>

        {/* Segmented Category Filter */}
        <div
          role="group"
          aria-label="Filter shoppable items by category"
          className="mt-4 flex flex-wrap gap-1 rounded-md bg-[#F2F2EE] p-1"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[32px] rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-[#5C5C58] hover:text-[#141413]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Item List */}
      <div className="atelier-scroll max-h-[600px] divide-y divide-[#EFEFED] overflow-y-auto px-6">
        {filteredItems.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#5C5C58]">
            No pieces listed in {selectedCategory} yet. Ask the consultant to source a {selectedCategory.toLowerCase()} piece for this space.
          </div>
        ) : (
          filteredItems.map((item) => (
            <article key={item.id} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[11px] text-[#5C5C58]">
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
                  <h3 className="font-sans text-sm font-semibold text-[#141413]">
                    {item.name}
                  </h3>
                </div>
                <span className="font-mono text-sm font-medium tabular-nums text-[#141413] whitespace-nowrap shrink-0">
                  {item.price}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#5C5C58]">
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
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#5C5C58] transition-colors hover:text-[#141413] whitespace-nowrap cursor-pointer"
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
