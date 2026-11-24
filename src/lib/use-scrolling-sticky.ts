"use client";

import { useEffect, useRef } from "react";

/**
 * Sticky element that also works when it is taller than the viewport:
 * scrolling down slides it until its bottom is visible, then it sticks there;
 * scrolling up slides it back until its top is visible, then it sticks there.
 * Pair with the `sticky` class; only active at `minWidth` and up.
 */
export function useScrollingSticky<T extends HTMLElement>({
  top: stickyTop = 128,
  bottom: stickyBottom = 24,
  minWidth = 1024,
}: { top?: number; bottom?: number; minWidth?: number } = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = window.matchMedia(`(min-width: ${minWidth}px)`);
    let top = stickyTop;
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (!media.matches) {
        el.style.top = "";
        return;
      }
      const minTop = Math.min(
        stickyTop,
        window.innerHeight - el.offsetHeight - stickyBottom,
      );
      top = Math.max(minTop, Math.min(stickyTop, top - delta));
      el.style.top = `${Math.round(top)}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [stickyTop, stickyBottom, minWidth]);

  return ref;
}
