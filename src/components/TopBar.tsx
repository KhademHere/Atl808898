import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { handleLiquidPointerLeave, handleLiquidPointerMove } from '../hooks/useLiquidPointer';
import { useSlidingCapsule } from '../hooks/useSlidingCapsule';

interface TopBarProps {
  onTriggerUpload: () => void;
}

const NAV_ITEMS = [
  { id: 'studio', label: 'Studio', href: '#studio' },
  { id: 'styles', label: 'Styles', href: '#styles' },
  { id: 'consultation', label: 'Consultation', href: '#consultation' },
  { id: 'shoppable-index', label: 'Shoppable Index', href: '#shoppable-index' },
] as const;

export function TopBar({ onTriggerUpload }: TopBarProps) {
  const [activeSection, setActiveSection] = useState<string>('studio');
  const { containerRef, registerItem, rect } = useSlidingCapsule(activeSection);

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-18% 0px -58% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-3 z-40 px-4 sm:px-6">
      <div className="liquid-glass-dock mx-auto flex h-14 max-w-[1260px] items-center justify-between gap-8 rounded-full px-4 sm:px-6">
        {/* Subtle decorative refraction layer isolated behind text */}
        <div
          aria-hidden="true"
          className="liquid-refract-layer pointer-events-none absolute inset-0 -z-10 rounded-full opacity-45"
        />

        {/* Zone 1: Brand Wordmark */}
        <a
          href="#studio"
          onClick={() => setActiveSection('studio')}
          className="font-editorial text-2xl font-semibold tracking-tight text-[#141715] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
        >
          Atelier Room
        </a>

        {/* Zone 2: Floating Glass Nav Links with Sliding Capsule Indicator */}
        <nav aria-label="Primary navigation" className="hidden md:block">
          <div
            ref={containerRef}
            className="relative flex items-center gap-1 rounded-full bg-white/30 p-1 text-sm font-medium text-[#3F4541]"
          >
            {rect.ready && (
              <span
                aria-hidden="true"
                className="liquid-glass-capsule pointer-events-none absolute left-0 top-0 rounded-full"
                style={{
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                  transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`,
                  transition:
                    'transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1), width 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            )}

            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  ref={registerItem(item.id)}
                  href={item.href}
                  onClick={() => setActiveSection(item.id)}
                  className={`relative z-10 rounded-full px-4 py-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] ${
                    isActive ? 'text-[#141715]' : 'hover:text-[#141715]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Zone 3: Glossy Tinted Liquid Glass Primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTriggerUpload}
            onPointerMove={handleLiquidPointerMove}
            onPointerLeave={handleLiquidPointerLeave}
            className="liquid-glass-btn-accent liquid-specular-accent inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload Room Photo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
