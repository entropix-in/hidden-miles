"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

// Next.js scrolls the changed segment into view on navigation, which can leave
// the page slightly scrolled (e.g. the utility bar above the sticky header ends
// up out of view). Always start a newly visited page at the very top — but let
// the browser restore the previous position on back/forward.
export function ScrollToTop() {
  const pathname = usePathname();
  const isHistoryNav = useRef(false);
  const first = useRef(true);

  useLayoutEffect(() => {
    const onPop = () => {
      isHistoryNav.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (isHistoryNav.current) {
      isHistoryNav.current = false;
      return;
    }
    // Skip in-page anchor links (/page#section).
    if (window.location.hash) return;
    // Disable smooth scrolling for the jump so any in-flight smooth scroll from
    // the previous page is cancelled, then repeat next frame in case Next's own
    // segment scroll runs after this effect.
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      root.style.scrollBehavior = prev;
    });
    return () => {
      cancelAnimationFrame(raf);
      root.style.scrollBehavior = prev;
    };
  }, [pathname]);

  return null;
}
