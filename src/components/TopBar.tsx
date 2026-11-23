import { useEffect, useState } from 'react';
import { LayoutGrid, Upload } from 'lucide-react';

interface TopBarProps {
  onTriggerUpload: () => void;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

export const NAV_SECTIONS = [
  { id: 'studio', label: 'Studio', href: '#studio' },
  { id: 'styles', label: 'Styles', href: '#styles' },
  { id: 'consultation', label: 'Consultation', href: '#consultation' },
  { id: 'shoppable-index', label: 'Shoppable Index', href: '#shoppable-index' },
] as const;

export function TopBar({ onTriggerUpload, activeSection, onSelectSection }: TopBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-shadow ${
        isScrolled
          ? 'border-[#C7ACB2] bg-[#FAF0F8]/95 shadow-sm backdrop-blur-md'
          : 'border-[#D3BCC0] bg-[#F2D7EE]/95 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-8">
        {/* Zone 1: Brand Identity */}
        <a
          href="#studio"
          onClick={() => onSelectSection('studio')}
          className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg px-1 text-[#0E103D] whitespace-nowrap shrink-0"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#69306D] text-[#F2D7EE]"
            aria-hidden="true"
          >
            <LayoutGrid className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold tracking-[-0.02em] text-[#0E103D]">
            Atelier Room
          </span>
        </a>

        {/* Zone 2: Desktop Primary Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-2"
        >
          {NAV_SECTIONS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => onSelectSection(item.id)}
                className={`relative inline-flex min-h-[44px] items-center rounded-lg px-3.5 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#E6D2D8] text-[#0E103D]'
                    : 'text-[#2E234D] hover:bg-[#E6D2D8]/60 hover:text-[#0E103D]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-1 h-[3px] rounded-full bg-[#69306D]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTriggerUpload}
            className="btn-primary px-4 text-xs sm:px-5 sm:text-sm"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Upload Room Photo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
