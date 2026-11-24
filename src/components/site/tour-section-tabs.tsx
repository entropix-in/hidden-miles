"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Tab = { label: string; href: string };

/**
 * Sticky in-page tabs for the tour page. Sits under the site header, follows
 * the section in view, and slides a gold underline to the active tab.
 */
export function TourSectionTabs({ tabs }: { tabs: Tab[] }) {
  const nav = useRef<HTMLElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [stuck, setStuck] = useState(false);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  // While a click-scroll is running, keep the clicked tab active.
  const lockedUntil = useRef(0);

  // Track the sticky site header so the tabs sit right below it.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("body header");
    if (!header) return;
    const observer = new ResizeObserver(() => setHeaderHeight(header.offsetHeight));
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Scroll spy.
  useEffect(() => {
    const main = nav.current?.parentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const offset = headerHeight + (nav.current?.offsetHeight ?? 0) + 24;
      setStuck((nav.current?.getBoundingClientRect().top ?? 1) <= headerHeight + 0.5);
      if (performance.now() < lockedUntil.current) return;
      const mainLeft = main?.getBoundingClientRect().left ?? 0;
      let current = 0;
      tabs.forEach((tab, index) => {
        const section = document.querySelector<HTMLElement>(tab.href);
        if (!section) return;
        const rect = section.getBoundingClientRect();
        // Skip sections laid out beside the content (the booking sidebar on desktop).
        if (Math.abs(rect.left - mainLeft) > 40) return;
        if (rect.top <= offset) current = index;
      });
      // At the very bottom, the last reachable section is the one in view.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        for (let index = tabs.length - 1; index >= 0; index--) {
          const section = document.querySelector<HTMLElement>(tabs[index].href);
          if (section && Math.abs(section.getBoundingClientRect().left - mainLeft) <= 40) { current = index; break; }
        }
      }
      setActive(current);
    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [tabs, headerHeight]);

  // Move the underline and keep the active tab visible in the horizontal strip.
  useLayoutEffect(() => {
    const link = links.current[active];
    const strip = nav.current;
    if (!link || !strip) return;
    const measure = () => setIndicator({ left: link.offsetLeft + 16, width: link.offsetWidth - 32 });
    measure();
    const target = link.offsetLeft - (strip.clientWidth - link.offsetWidth) / 2;
    strip.scrollTo({ left: target, behavior: "smooth" });
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [active]);

  return (
    <nav
      ref={nav}
      aria-label="Tour sections"
      style={{ top: headerHeight }}
      data-stuck={stuck || undefined}
      className="tour-section-tabs sticky z-30 -mx-5 flex overflow-x-auto whitespace-nowrap border-b border-sand-300 bg-paper px-5 [mask-image:linear-gradient(to_right,black_80%,transparent)] [scrollbar-width:none] sm:mx-0 sm:px-0 sm:[mask-image:none]"
    >
      {tabs.map((tab, index) => (
        <a
          key={tab.label}
          ref={(el) => { links.current[index] = el; }}
          href={tab.href}
          aria-current={index === active ? "location" : undefined}
          onClick={() => {
            setActive(index);
            lockedUntil.current = performance.now() + 900;
          }}
          className={`relative px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
            index === active ? "text-ink" : "text-navy-500 hover:text-ink"
          }`}
        >
          {tab.label}
        </a>
      ))}
      {indicator && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-[3px] rounded-full bg-gold-400 transition-[transform,width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
      )}
    </nav>
  );
}
