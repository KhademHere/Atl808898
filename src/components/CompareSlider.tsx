import React, { useCallback, useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  Image as ImageIcon,
  Loader2,
  MoveHorizontal,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
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
  onDownloadComplete?: () => void;
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
  onDownloadComplete,
  errorMessage,
  onDismissError,
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [originalError, setOriginalError] = useState(false);
  const [reimaginedError, setReimaginedError] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const activePreset =
    splitPercent >= 95 ? 'original' : splitPercent <= 5 ? 'reimagined' : 'split';

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
    onDownloadComplete?.();
  };

  return (
    <div className="space-y-5">
      {/* Main Interactive Before/After Visualizer Frame */}
      <div className="atelier-surface overflow-hidden rounded-2xl p-2 sm:p-2.5">
        <div
          ref={containerRef}
          data-testid="compare-viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative aspect-[4/3] sm:aspect-[16/9] max-h-[540px] w-full overflow-hidden rounded-xl bg-[#D3BCC0] select-none ${
            reimaginedImageUrl && !isGenerating ? 'cursor-ew-resize touch-none' : ''
          }`}
        >
          {/* Base Layer: Reimagined Room (or Original if not yet generated) */}
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
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#E6D2D8] text-[#0E103D]">
              <ImageIcon className="h-8 w-8" aria-hidden="true" />
              <span className="text-sm font-semibold">{originalLabel}</span>
            </div>
          )}

          {/* Left Clipped Layer: Original Space */}
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
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#D3BCC0] text-[#0E103D]">
                  <ImageIcon className="h-8 w-8" aria-hidden="true" />
                  <span className="text-sm font-semibold">{originalLabel}</span>
                </div>
              )}
            </div>
          )}

          {/* High-Contrast Midnight Indigo Captions (WCAG AAA #F2D7EE on #0E103D) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-[#0E103D]/80 via-[#0E103D]/25 to-transparent px-2.5 pb-2.5 pt-10 sm:gap-4 sm:px-5 sm:pb-4 sm:pt-12">
            <div className="max-w-[46%] min-w-0 rounded-xl border border-[#A5668B]/60 bg-[#0E103D]/90 px-2.5 py-1.5 text-[#F2D7EE] backdrop-blur-sm sm:px-3 sm:py-2">
              <p className="text-[10px] font-medium text-[#D3BCC0] sm:text-[11px]">Original Space</p>
              <p className="truncate text-xs font-semibold sm:text-sm">{originalLabel}</p>
            </div>
            {reimaginedImageUrl && (
              <div className="max-w-[46%] min-w-0 rounded-xl border border-[#A5668B]/60 bg-[#0E103D]/90 px-2.5 py-1.5 text-right text-[#F2D7EE] backdrop-blur-sm sm:px-3 sm:py-2">
                <p className="text-[10px] font-medium text-[#D3BCC0] sm:text-[11px]">
                  Reimagined Concept
                </p>
                <p className="truncate text-xs font-semibold sm:text-sm">{reimaginedLabel}</p>
              </div>
            )}
          </div>

          {/* Interactive Divider & 48px Accessible Handle */}
          {reimaginedImageUrl && !isGenerating && (
            <div
              className="pointer-events-none absolute inset-y-0 z-20"
              style={{ left: `${splitPercent}%` }}
            >
              <div className="h-full w-0.5 -translate-x-1/2 bg-[#F2D7EE] shadow-[0_0_10px_rgba(14,16,61,0.65)]" />
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
                title="Drag or use Left and Right arrow keys to compare"
                className="pointer-events-auto absolute left-0 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#F2D7EE] bg-[#69306D] text-[#F2D7EE] shadow-[0_6px_18px_rgba(14,16,61,0.45)] transition-transform hover:scale-105 hover:bg-[#57255B] active:scale-95 cursor-ew-resize"
              >
                <MoveHorizontal className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* On-Demand Makeover Prompt Overlay */}
          {!reimaginedImageUrl && !isGenerating && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0E103D]/65 p-5 backdrop-blur-xs">
              <div className="max-w-md rounded-2xl border border-[#A5668B] bg-[#0E103D]/95 p-6 text-center text-[#F2D7EE] shadow-2xl">
                <p className="text-xl font-bold tracking-[-0.015em]">
                  Reimagine in {reimaginedLabel}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#D3BCC0]">
                  Preserve your room&apos;s exact architecture, windows, and perspective while updating furnishings, lighting, and textiles.
                </p>
                <button
                  type="button"
                  onClick={onGenerateCurrentStyle}
                  className="btn-primary mt-5 w-full sm:w-auto"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
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
              className="absolute inset-0 z-30 flex items-center justify-center bg-[#0E103D]/75 px-6 text-center text-[#F2D7EE] backdrop-blur-sm"
            >
              <div className="max-w-sm rounded-2xl border border-[#A5668B] bg-[#0E103D] px-8 py-6 shadow-2xl">
                <Loader2
                  className="mx-auto h-7 w-7 animate-spin text-[#F2D7EE]"
                  aria-hidden="true"
                />
                <p className="mt-3 text-lg font-bold">
                  {generatingLabel || `Reimagining in ${reimaginedLabel}...`}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#D3BCC0]">
                  Preserving structural geometry while rendering new furnishings, materials, and natural lighting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accessible Inline Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border-2 border-[#69306D] bg-[#FAF0F8] px-4 py-3.5 text-sm text-[#0E103D] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#69306D]" aria-hidden="true" />
            <p className="font-medium leading-relaxed">{errorMessage}</p>
          </div>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="btn-ghost min-h-[38px] self-start px-3 text-xs font-semibold text-[#69306D] sm:self-center"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Ergonomic Comparison Toolbar (Clear Hierarchy + Safe Inter-Control Gaps) */}
      <div className="atelier-surface flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {reimaginedImageUrl && (
            <div
              role="group"
              aria-label="Comparison view presets"
              className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#C7ACB2] bg-[#D3BCC0]/70 p-1"
            >
              {(
                [
                  { id: 'original', label: 'Original', value: 100 },
                  { id: 'split', label: '50 / 50 Compare', value: 50 },
                  { id: 'reimagined', label: 'Reimagined', value: 0 },
                ] as const
              ).map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSplitChange(preset.value)}
                    className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:text-sm ${
                      isSelected
                        ? 'bg-[#69306D] text-[#F2D7EE] shadow-xs'
                        : 'text-[#0E103D] hover:bg-[#FAF0F8]/70'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}

          {reimaginedImageUrl && (
            <p className="font-mono text-xs font-medium tabular-nums text-[#2E234D]">
              Split: {splitPercent}% Original · {100 - splitPercent}% Reimagined
            </p>
          )}
        </div>

        {/* Secondary & Separated Destructive Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onTriggerUpload} className="btn-secondary text-xs sm:text-sm">
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Replace Room Photo</span>
          </button>

          {reimaginedImageUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="btn-secondary text-xs sm:text-sm"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Download Design</span>
            </button>
          )}

          {!isDemoRoom && !confirmingReset && (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="btn-ghost ml-auto border border-[#C7ACB2] text-xs font-semibold text-[#0E103D] sm:ml-2 sm:text-sm"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Restore Sample Loft</span>
            </button>
          )}

          {!isDemoRoom && confirmingReset && (
            <div
              role="group"
              aria-label="Confirm restoring sample room"
              className="flex items-center gap-2 rounded-xl border border-[#69306D] bg-[#E6D2D8] p-1 pl-3"
            >
              <span className="text-xs font-semibold text-[#0E103D]">Replace uploaded photo?</span>
              <button
                type="button"
                onClick={() => {
                  setConfirmingReset(false);
                  onResetDemo();
                }}
                className="btn-destructive min-h-[38px] px-3 text-xs"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="btn-ghost min-h-[38px] px-2.5 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
