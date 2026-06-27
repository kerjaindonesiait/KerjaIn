import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HorizontalScrollRowProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** `light` for white bars, `dark` for the blue dashboard header. */
  fadeEdge?: "light" | "dark";
  showEdgeChevrons?: boolean;
};

const FADE_LEFT = {
  light: "bg-gradient-to-r from-white via-white/80 to-transparent",
  dark: "bg-gradient-to-r from-[#172E4D] via-[#172E4D]/80 to-transparent",
} as const;

const FADE_RIGHT = {
  light: "bg-gradient-to-l from-white via-white/80 to-transparent",
  dark: "bg-gradient-to-l from-[#172E4D] via-[#172E4D]/80 to-transparent",
} as const;

export function HorizontalScrollRow({
  children,
  className = "",
  innerClassName = "",
  fadeEdge = "light",
  showEdgeChevrons = true,
}: HorizontalScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 2;
    setCanScrollLeft(overflow && scrollLeft > 4);
    setCanScrollRight(overflow && scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollHints();
    el.addEventListener("scroll", updateScrollHints, { passive: true });
    const observer = new ResizeObserver(updateScrollHints);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      observer.disconnect();
    };
  }, [updateScrollHints, children]);

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      {canScrollLeft && (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 ${FADE_LEFT[fadeEdge]}`}
            aria-hidden
          />
          {showEdgeChevrons && (
            <button
              type="button"
              onClick={() => scrollBy(-160)}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-[#D8E2F0] bg-white/95 text-[#58708D] shadow-sm hover:text-[#1D4196]"
              aria-label="Gulir ke kiri"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </>
      )}
      {canScrollRight && (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 ${FADE_RIGHT[fadeEdge]}`}
            aria-hidden
          />
          {showEdgeChevrons && (
            <button
              type="button"
              onClick={() => scrollBy(160)}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-[#D8E2F0] bg-white/95 text-[#58708D] shadow-sm hover:text-[#1D4196]"
              aria-label="Gulir ke kanan"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </>
      )}
      <div
        ref={scrollRef}
        className={`kj-hscroll overflow-x-auto overscroll-x-contain touch-pan-x ${fadeEdge === "dark" ? "kj-hscroll-dark" : ""} ${innerClassName}`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}
