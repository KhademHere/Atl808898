import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export interface CapsuleRect {
  x: number;
  y: number;
  width: number;
  height: number;
  ready: boolean;
}

/**
 * Measures the active item inside a relative segmented/nav container and drives
 * a GPU-composited sliding Liquid Glass capsule with spring easing.
 */
export function useSlidingCapsule(activeKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [rect, setRect] = useState<CapsuleRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  const registerItem = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      itemRefs.current[key] = el;
    },
    []
  );

  const measure = useCallback(() => {
    const activeEl = itemRefs.current[activeKey];
    if (!activeEl) return;
    setRect({
      x: activeEl.offsetLeft,
      y: activeEl.offsetTop,
      width: activeEl.offsetWidth,
      height: activeEl.offsetHeight,
      ready: activeEl.offsetWidth > 0 && activeEl.offsetHeight > 0,
    });
  }, [activeKey]);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    return () => ro.disconnect();
  }, [measure]);

  return { containerRef, registerItem, rect };
}
