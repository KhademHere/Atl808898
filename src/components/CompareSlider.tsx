import React, { useCallback, useRef, useState } from 'react';
import {
  Download,
  Image as ImageIcon,
  Loader2,
  MoveHorizontal,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { clampSplitPercentage } from '../utils/designLogic';
import { handleLiquidPointerLeave, handleLiquidPointerMove } from '../hooks/useLiquidPointer';
import { useSlidingCapsule } from '../hooks/useSlidingCapsule';

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

  const activePreset =
    splitPercent >= 95 ? 'original' : splitPercent <= 5 ? 'reimagined' : 'split';
  const presetCapsule = useSlidingCapsule(activePreset);

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
      {/* Liquid Glass Outer Optical Frame */}
      <div className="liquid-glass-sheet rounded-[26px] p-2">
        <div
          ref={containerRef}
          data-testid="compare-viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative aspect-[16/9] max-h-[565px] w-full overflow-hidden rounded-[20px] bg-[#DDE2DF] select-none ${
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
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#E6EAE7] text-[#4E5550]">
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
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#E1E5E2] text-[#4E5550]">
                  <ImageIcon className="h-8 w-8 opacity-60" aria-hidden="true" />
                  <span className="text-sm font-medium">{originalLabel}</span>
                </div>
              )}
            </div>
          )}

          {/* Measured Contrast Scrim & Smoked Glass Architectural Captions */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pb-3 pt-12 text-white sm:gap-3 sm:px-5 sm:pb-4 sm:pt-14">
            <div className="max-w-[46%] min-w-0 rounded-xl border border-white/25 bg-black/40 px-2.5 py-1.5 backdrop-blur-md sm:rounded-2xl sm:px-3.5 sm:py-2">
              <p className="text-[10px] font-medium tracking-wide text-white/80 sm:text-[11px]">
                Original Space
              </p>
              <p className="truncate text-xs font-semibold sm:text-sm">{originalLabel}</p>
            </div>
            {reimaginedImageUrl && (
              <div className="max-w-[46%] min-w-0 rounded-xl border border-white/25 bg-black/40 px-2.5 py-1.5 text-right backdrop-blur-md sm:rounded-2xl sm:px-3.5 sm:py-2">
                <p className="text-[10px] font-medium tracking-wide text-white/80 sm:text-[11px]">
                  Reimagined Concept
                </p>
                <p className="truncate text-xs font-semibold sm:text-sm">{reimaginedLabel}</p>
              </div>
            )}
          </div>

          {/* Interactive Split Light Filament & Liquid Glass Refractive Orb Handle */}
          {reimaginedImageUrl && !isGenerating && (
            <div
              className="pointer-events-none absolute inset-y-0 z-20"
              style={{ left: `${splitPercent}%` }}
            >
              <div className="h-full w-[1.5px] -translate-x-1/2 bg-gradient-to-b from-white/75 via-white to-white/75 shadow-[0_0_12px_rgba(255,255,255,0.65)]" />
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
                className="liquid-glass-orb pointer-events-auto absolute left-0 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-ew-resize"
              >
                <span
                  aria-hidden="true"
                  className="liquid-refract-layer pointer-events-none absolute inset-0 -z-10 rounded-full opacity-50"
                />
                <MoveHorizontal className="relative z-10 h-4 w-4 drop-shadow" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Frosted-Crystal On-Demand Generation Overlay */}
          {!reimaginedImageUrl && !isGenerating && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-6 backdrop-blur-xs">
              <div className="max-w-md rounded-[24px] border border-white/30 bg-[#141D18]/78 p-6 text-center text-white shadow-2xl backdrop-blur-xl">
                <p className="font-editorial text-2xl font-medium">
                  Reimagine in {reimaginedLabel}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Preserve your room&apos;s architecture, windows, and perspective while transforming the furnishings, lighting, and palette.
                </p>
                <button
                  type="button"
                  onClick={onGenerateCurrentStyle}
                  onPointerMove={handleLiquidPointerMove}
                  onPointerLeave={handleLiquidPointerLeave}
                  className="liquid-glass-btn liquid-specular mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-[#141715] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#1B4332]" aria-hidden="true" />
                  <span>Generate {reimaginedLabel} Makeover</span>
                </button>
              </div>
            </div>
          )}

          {/* Frosted-Crystal Loading Overlay */}
          {isGenerating && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#121A16]/55 px-6 text-center text-white backdrop-blur-md"
            >
              <div className="rounded-[24px] border border-white/25 bg-black/35 px-8 py-6 backdrop-blur-xl">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-white" aria-hidden="true" />
                <p className="mt-3 font-editorial text-2xl font-medium">
                  {generatingLabel || `Reimagining in ${reimaginedLabel}...`}
                </p>
                <p className="mt-1.5 max-w-sm text-xs text-white/85">
                  Preserving structural geometry while rendering new furnishings, materials, and natural lighting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="liquid-glass-sheet flex flex-col gap-3 rounded-[20px] px-5 py-3.5 text-sm text-[#6E2D1A] sm:flex-row sm:items-center sm:justify-between"
          style={{
            background:
              'linear-gradient(165deg, rgba(255, 245, 240, 0.84) 0%, rgba(252, 236, 228, 0.72) 100%)',
          }}
        >
          <p className="leading-relaxed font-medium">{errorMessage}</p>
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

      {/* Workspace Floating Glass Utility Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex flex-wrap items-center gap-3.5">
          {reimaginedImageUrl && (
            <div
              ref={presetCapsule.containerRef}
              role="group"
              aria-label="Comparison view presets"
              className="liquid-glass-pill-track relative inline-flex items-center rounded-full p-1"
            >
              {presetCapsule.rect.ready && (
                <span
                  aria-hidden="true"
                  className="liquid-glass-capsule pointer-events-none absolute left-0 top-0 rounded-full"
                  style={{
                    width: `${presetCapsule.rect.width}px`,
                    height: `${presetCapsule.rect.height}px`,
                    transform: `translate3d(${presetCapsule.rect.x}px, ${presetCapsule.rect.y}px, 0)`,
                    transition:
                      'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), width 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              )}
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
                    ref={presetCapsule.registerItem(preset.id)}
                    type="button"
                    onClick={() => onSplitChange(preset.value)}
                    className={`relative z-10 min-h-[34px] rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected ? 'text-[#141715]' : 'text-[#4A514D] hover:text-[#141715]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}

          {reimaginedImageUrl && (
            <span className="font-mono text-xs tabular-nums text-[#464D49]">
              Split: {splitPercent}% Original / {100 - splitPercent}% Reimagined
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onTriggerUpload}
            onPointerMove={handleLiquidPointerMove}
            onPointerLeave={handleLiquidPointerLeave}
            className="liquid-glass-btn liquid-specular inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#141715] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-[#1B4332]" aria-hidden="true" />
            <span>Replace Room Photo</span>
          </button>

          {!isDemoRoom && (
            <button
              type="button"
              onClick={onResetDemo}
              onPointerMove={handleLiquidPointerMove}
              onPointerLeave={handleLiquidPointerLeave}
              className="liquid-glass-btn liquid-specular inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#464D49] hover:text-[#141715] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Restore Sample Loft</span>
            </button>
          )}

          {reimaginedImageUrl && (
            <button
              type="button"
              onClick={handleDownload}
              onPointerMove={handleLiquidPointerMove}
              onPointerLeave={handleLiquidPointerLeave}
              className="liquid-glass-btn liquid-specular inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#141715] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#1B4332]" aria-hidden="true" />
              <span>Download Design</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
