import { Layers, MessageSquare, ShoppingBag, SlidersHorizontal } from 'lucide-react';

interface MobileBottomNavProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

const MOBILE_ITEMS = [
  { id: 'studio', label: 'Studio', href: '#studio', Icon: SlidersHorizontal },
  { id: 'styles', label: 'Styles', href: '#styles', Icon: Layers },
  { id: 'consultation', label: 'Consult', href: '#consultation', Icon: MessageSquare },
  { id: 'shoppable-index', label: 'Shop', href: '#shoppable-index', Icon: ShoppingBag },
] as const;

export function MobileBottomNav({ activeSection, onSelectSection }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#C7ACB2] bg-[#FAF0F8]/98 shadow-[0_-4px_16px_rgba(14,16,61,0.08)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 py-1.5">
        {MOBILE_ITEMS.map(({ id, label, href, Icon }) => {
          const isActive = activeSection === id;
          return (
            <li key={id}>
              <a
                href={href}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => onSelectSection(id)}
                className={`relative flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#69306D] text-[#F2D7EE]'
                    : 'text-[#0E103D] hover:bg-[#E6D2D8]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
