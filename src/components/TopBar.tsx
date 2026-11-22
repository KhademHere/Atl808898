import { Upload } from 'lucide-react';

interface TopBarProps {
  onTriggerUpload: () => void;
}

export function TopBar({ onTriggerUpload }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E2DE] bg-[#F7F7F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-8 px-5 sm:px-8">
        <a
          href="#studio"
          className="font-editorial text-2xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
        >
          Atelier Room
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C5C58]"
        >
          <a
            href="#studio"
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#141413] hover:underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
          >
            Studio
          </a>
          <a
            href="#styles"
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#141413] hover:underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
          >
            Styles
          </a>
          <a
            href="#consultation"
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#141413] hover:underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
          >
            Consultation
          </a>
          <a
            href="#shoppable-index"
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#141413] hover:underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
          >
            Shoppable Index
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTriggerUpload}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-[#1B4332] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#143326] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload Room Photo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
