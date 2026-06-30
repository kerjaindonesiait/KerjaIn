import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

type AutoScrollReelProps = {
  children: ReactNode;
  /** Pixels moved per animation frame while auto-scrolling. */
  speed?: number;
  direction?: "left" | "right";
  className?: string;
  trackClassName?: string;
  segmentClassName?: string;
  style?: CSSProperties;
};

export function AutoScrollReel({
  children,
  speed = 0.6,
  direction = "left",
  className = "",
  trackClassName = "",
  segmentClassName = "",
  style,
}: AutoScrollReelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const normalizeScroll = useCallback(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const half = track.scrollWidth / 2;
    if (half <= 0) return;

    if (el.scrollLeft >= half) {
      el.scrollLeft -= half;
    } else if (el.scrollLeft < 0) {
      el.scrollLeft += half;
    }
  }, []);

  const tick = useCallback(() => {
    const el = containerRef.current;
    const track = trackRef.current;

    if (el && track && !pausedRef.current) {
      const half = track.scrollWidth / 2;
      if (half > 0) {
        el.scrollLeft += direction === "left" ? speed : -speed;
        if (direction === "left" && el.scrollLeft >= half) {
          el.scrollLeft -= half;
        } else if (direction === "right" && el.scrollLeft <= 0) {
          el.scrollLeft += half;
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [direction, speed]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const start = () => setAnimating(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        if ("requestIdleCallback" in window) {
          requestIdleCallback(start, { timeout: 2000 });
        } else {
          window.setTimeout(start, 400);
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animating) return;

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [animating, tick]);

  useEffect(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track || direction !== "right") return;

    const half = track.scrollWidth / 2;
    if (half > 0) el.scrollLeft = half * 0.5;
  }, [direction, children]);

  return (
    <div
      ref={containerRef}
      className={`kj-reel overflow-x-auto overscroll-x-contain cursor-grab active:cursor-grabbing touch-pan-x ${className}`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
        ...style,
      }}
      onPointerDown={(e) => {
        pause();
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        normalizeScroll();
        resume();
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }}
      onPointerCancel={() => {
        normalizeScroll();
        resume();
      }}
      onTouchStart={pause}
      onTouchEnd={() => {
        normalizeScroll();
        resume();
      }}
      onScroll={normalizeScroll}
    >
      <div ref={trackRef} className={`flex w-max ${trackClassName}`}>
        <div className={`flex shrink-0 ${segmentClassName}`}>{children}</div>
        <div className={`flex shrink-0 ${segmentClassName}`} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
