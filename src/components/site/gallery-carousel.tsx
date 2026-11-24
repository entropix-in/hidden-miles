"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryColumns, GalleryPhoto } from "@/lib/content-blocks";

export function GalleryCarousel({ photos, columns }: { photos: GalleryPhoto[]; columns: GalleryColumns }) {
  const [viewport, embla] = useEmblaCarousel({ align: "start", slidesToScroll: "auto", containScroll: "trimSnaps" });
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    setSelected(embla.selectedScrollSnap());
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    const frame = requestAnimationFrame(sync);
    embla.on("select", sync).on("reInit", sync);
    return () => {
      cancelAnimationFrame(frame);
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla, sync]);

  const sizes = columns === 1 ? "(min-width: 1024px) 720px, 90vw" : `(min-width: 640px) ${Math.round(70 / columns)}vw, 45vw`;

  return (
    <div className="page-gallery-carousel" data-columns={columns} role="region" aria-roledescription="carousel" aria-label="Photo gallery">
      <div className="page-gallery-viewport" ref={viewport}>
        <div className="page-gallery-track">
          {photos.map((photo, index) => (
            <div className="page-gallery-slide" key={index} role="group" aria-roledescription="slide"
              aria-label={`${index + 1} of ${photos.length}`}>
              <Image src={photo.url} alt={photo.alt} width={columns === 1 ? 1280 : 640} height={columns === 1 ? 720 : 480} sizes={sizes} />
            </div>
          ))}
        </div>
      </div>
      {snaps.length > 1 && (
        <div className="page-gallery-controls">
          <div className="page-gallery-dots">
            {snaps.map((_, index) => (
              <button key={index} type="button" aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selected} onClick={() => embla?.scrollTo(index)} />
            ))}
          </div>
          <div className="page-gallery-arrows">
            <button type="button" aria-label="Previous photos" disabled={!canPrev} onClick={() => embla?.scrollPrev()}>
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button type="button" aria-label="Next photos" disabled={!canNext} onClick={() => embla?.scrollNext()}>
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
