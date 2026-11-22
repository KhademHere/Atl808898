import type React from 'react';

/**
 * Tracks fine-pointer (mouse/pen) coordinates on a glass surface via CSS custom
 * properties (--mouse-x, --mouse-y) without triggering React re-renders.
 * Automatically skips touch pointers to keep mobile scrolling at 60fps.
 */
export function handleLiquidPointerMove(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType === 'touch') return;
  const rect = e.currentTarget.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
  e.currentTarget.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);
}

export function handleLiquidPointerLeave(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType === 'touch') return;
  e.currentTarget.style.setProperty('--mouse-x', '50%');
  e.currentTarget.style.setProperty('--mouse-y', '0%');
}
