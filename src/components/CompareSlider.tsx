import React, { useCallback, useRef, useState } from 'react';
import { Download, Image as ImageIcon, Loader2, MoveHorizontal, RotateCcw, Sparkles, Upload } from 'lucide-react';
import { clampSplitPercentage } from '../utils/designLogic';

interface CompareSliderProps {
  originalImageUrl: string;
  originalLabel: string;
  reimaginedImageUrl?: string;
  reimaginedLabel: string;
  splitPercent: number;
  onSplitChange: (nextSplit: number) => void;
  isGenerating: boolean;
  generatingLabel?: string;
  isDemoRoom: boolean;
  onGenerateCurrentStyle: () => void;
  onTriggerUpload: () => void;
  onResetDemo: () => void;
  errorMessage?: string | null;
  onDismissError?: () => void;
}

export function CompareSlider({
  originalImageUrl,
  originalLabel,
  reimaginedImageUrl,
  reimaginedLabel,
  splitPercent,
  onSplitChange,
  isGenerating,
  generatingLabel,
  isDemoRoom,
  onGenerateCurrentStyle,
  onTriggerUpload,
  onResetDemo,
  errorMessage,
  onDismissError,
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [originalError, setOriginalError] = useState(false);
  const [reimaginedError, setReimaginedError] = useState(false);

  const updateSplitFromClientX = useCallback(
    (clientX: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;
      const ratio = ((clientX - rect.left) / rect.width) * 100;
      onSplitChange(clampSplitPercentage(ratio));
    },
    [onSplitChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!reimaginedImageUrl || isGenerating) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateSplitFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSplitFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSplitChange(clampSplitPercentage(splitPercent - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSplitChange(clampSplitPercentage(splitPercent + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSplitChange(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSplitChange(100);
    }
  };

  const handleDownload = () => {
    const targetUrl = reimaginedImageUrl || originalImageUrl;
    if (!targetUrl) return;
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `atelier-room-${reimaginedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        data-testid="compare-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative aspect-[16/9] max-h-[580px] w-full overflow-hidden rounded-lg border border-[#E2E2DE] bg-[#E8E7E2] select-none ${
          reimaginedImageUrl && !isGenerating ? 'cursor-ew-resize touch-none' : ''
        }`}
      >
        {/* Right/Base Layer: Reimagined Room (or Original if not yet generated) */}
        {reimaginedImageUrl && !reimaginedError ? (
          <img
            src={reimaginedImageUrl}
            alt={`Reimagined space in ${reimaginedLabel} style`}
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() => setReimaginedError(true)}
            className="h-full w-full object-cover"
          />
        ) : !originalError ? (
          <img
            src={originalImageUrl}
            alt={originalLabel}
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() => setOriginalError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#ECECE7] text-[#5C5C58]">
            <ImageIcon className="h-8 w-8 opacity-60" aria-hidden="true" />
            <span className="text-sm font-medium">{originalLabel}</span>
          </div>
        )}

        {/* Left Clipped Layer: Original Space (only when reimagined image exists) */}
        {reimaginedImageUrl && (
          <div
            data-testid="compare-original-layer"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
          >
            {!originalError ? (
              <img
                src={originalImageUrl}
                alt={originalLabel}
                referrerPolicy="no-referrer"
                draggable={false}
                onError={() => setOriginalError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#E5E4DF] text-[#5C5C58]">
                <ImageIcon className="h-8 w-8 opacity-60" aria-hidden="true" />
                <span className="text-sm font-medium">{originalLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* Measured Bottom Contrast Scrim & Architectural Labels */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-black/35 to-transparent px-5 pb-4 pt-12 text-white">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wider text-white/80">Original Space</p>
            <p className="truncate text-sm font-medium">{originalLabel}</p>
          </div>
          {reimaginedImageUrl && (
            <div className="min-w-0 text-right">
              <p className="text-[11px] font-medium tracking-wider text-white/80">Reimagined Concept</p>
              <p className="truncate text-sm font-medium">{reimaginedLabel}</p>
            </div>
          )}
        </div>

        {/* Interactive Split Divider & Accessible Slider Handle */}
        {reimaginedImageUrl && !isGenerating && (
          <div
            className="pointer-events-none absolute inset-y-0 z-20"
            style={{ left: `${splitPercent}%` }}
          >
            <div className="h-full w-px -translate-x-1/2 bg-white/95 shadow-[0_0_8px_rgba(0,0,0,0.45)]" />
            <div
              role="slider"
              tabIndex={0}
              aria-label="Compare original room and reimagined design"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={splitPercent}
              aria-valuetext={`${splitPercent}% original, ${100 - splitPercent}% reimagined`}
              onKeyDown={handleSliderKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto absolute left-0 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-[#141413]/90 text-white shadow-md transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-ew-resize"
            >
              <MoveHorizontal className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        )}

        {/* On-Demand Generation Prompt Overlay (when user selects an ungenerated style or uploads a new photo) */}
        {!reimaginedImageUrl && !isGenerating && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-6 backdrop-blur-[2px]">
            <div className="max-w-md rounded-lg border border-white/15 bg-[#141413]/90 p-6 text-center text-white shadow-xl">
              <p className="font-editorial text-2xl font-medium">
                Reimagine in {reimaginedLabel}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Preserve your room&apos;s architecture, windows, and perspective while transforming the furnishings, lighting, and palette.
              </p>
              <button
                type="button"
                onClick={onGenerateCurrentStyle}
                className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-xs font-semibold text-[#141413] transition-colors hover:bg-[#EFEFED] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Generate {reimaginedLabel} Makeover</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isGenerating && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#141413]/65 px-6 text-center text-white backdrop-blur-xs"
          >
            <Loader2 className="h-7 w-7 animate-spin text-white" aria-hidden="true" />
            <p className="font-editorial text-2xl font-medium">
              {generatingLabel || `Reimagining in ${reimaginedLabel}...`}
            </p>
            <p className="max-w-sm text-xs text-white/80">
              Preserving structural geometry while rendering new furnishings, materials, and natural lighting.
            </p>
          </div>
        )}
      </div>

      {/* Inline Error Banner (when API returns a real error) */}
      {errorMessage && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-md border border-[#D4B5A7] bg-[#FDF8F5] px-4 py-3 text-sm text-[#6E2D1A] sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="leading-relaxed">{errorMessage}</p>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="self-start text-xs font-semibold underline underline-offset-4 hover:text-[#4A1C0F] whitespace-nowrap shrink-0 sm:self-center cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Workspace Utility Strip below Compare Viewport */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E2DE] pb-5">
        <div className="flex flex-wrap items-center gap-3">
          {reimaginedImageUrl && (
            <div
              role="group"
              aria-label="Comparison view presets"
              className="inline-flex items-center rounded-md border border-[#E2E2DE] bg-white p-1"
            >
              <button
                type="button"
                onClick={() => onSplitChange(100)}
                className={`min-h-[34px] rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  splitPercent >= 95
                    ? 'bg-[#141413] text-white'
                    : 'text-[#5C5C58] hover:text-[#141413]'
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => onSplitChange(50)}
                className={`min-h-[34px] rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  splitPercent > 5 && splitPercent < 95
                    ? 'bg-[#141413] text-white'
                    : 'text-[#5C5C58] hover:text-[#141413]'
                }`}
              >
                50 / 50 Compare
              </button>
              <button
                type="button"
                onClick={() => onSplitChange(0)}
                className={`min-h-[34px] rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  splitPercent <= 5
                    ? 'bg-[#141413] text-white'
                    : 'text-[#5C5C58] hover:text-[#141413]'
                }`}
              >
                Reimagined
              </button>
            </div>
          )}

          {reimaginedImageUrl && (
            <span className="font-mono text-xs tabular-nums text-[#5C5C58]">
              Split: {splitPercent}% Original / {100 - splitPercent}% Reimagined
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onTriggerUpload}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#D4D4CE] bg-white px-3.5 py-2 text-xs font-medium text-[#141413] transition-colors hover:bg-[#EFEFED] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Replace Room Photo</span>
          </button>

          {!isDemoRoom && (
            <button
              type="button"
              onClick={onResetDemo}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#D4D4CE] bg-white px-3.5 py-2 text-xs font-medium text-[#5C5C58] transition-colors hover:bg-[#EFEFED] hover:text-[#141413] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Restore Sample Loft</span>
            </button>
          )}

          {reimaginedImageUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#D4D4CE] bg-white px-3.5 py-2 text-xs font-medium text-[#141413] transition-colors hover:bg-[#EFEFED] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download Design</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
