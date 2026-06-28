import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

const MOBILE_BREAKPOINT = 768;
const VIEWPORT_PADDING = 16;

export const FilterScrollContainerContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

function getViewportSize() {
  const vv = window.visualViewport;
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
    offsetTop: vv?.offsetTop ?? 0,
    offsetLeft: vv?.offsetLeft ?? 0,
  };
}

function scrollElementToCenter(container: HTMLElement, element: HTMLElement) {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const elementCenter = elementRect.left + elementRect.width / 2;
  const containerCenter = containerRect.left + containerRect.width / 2;
  container.scrollBy({ left: elementCenter - containerCenter, behavior: "smooth" });
}

function waitForScrollEnd(container: HTMLElement, maxMs = 380): Promise<void> {
  return new Promise((resolve) => {
    let timeout = window.setTimeout(finish, maxMs);
    function finish() {
      window.clearTimeout(timeout);
      container.removeEventListener("scrollend", finish);
      resolve();
    }
    if ("onscrollend" in container) {
      container.addEventListener("scrollend", finish, { once: true });
    } else {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(finish, 280);
    }
  });
}

function getMenuPosition(
  el: HTMLElement,
  align: "left" | "right",
  width: number | "auto" | undefined,
  menuEl?: HTMLElement | null,
): CSSProperties {
  const rect = el.getBoundingClientRect();
  const { width: vw, height: vh, offsetTop, offsetLeft } = getViewportSize();
  const isMobile = vw < MOBILE_BREAKPOINT;
  const maxPanelWidth = vw - VIEWPORT_PADDING * 2;
  const menuHeight = menuEl?.offsetHeight ?? 0;

  const fixedWidth =
    width === "auto" || width == null
      ? null
      : Math.min(width, maxPanelWidth);

  let top = rect.bottom + 8;
  if (menuHeight > 0 && top + menuHeight > offsetTop + vh - VIEWPORT_PADDING) {
    top = Math.max(
      offsetTop + VIEWPORT_PADDING,
      rect.top - menuHeight - 8,
    );
  }

  if (isMobile) {
    const panelWidth =
      fixedWidth != null ? fixedWidth : Math.min(280, maxPanelWidth);
    const left = offsetLeft + (vw - panelWidth) / 2;

    return {
      position: "fixed",
      top,
      left,
      width: panelWidth,
      maxWidth: maxPanelWidth,
      boxSizing: "border-box",
      zIndex: 9999,
    };
  }

  const panelW = fixedWidth ?? menuEl?.offsetWidth ?? 280;

  if (align === "right") {
    const right = vw - rect.right;
    const leftEdge = rect.right - panelW;
    if (leftEdge >= VIEWPORT_PADDING) {
      return {
        position: "fixed",
        top,
        right,
        ...(fixedWidth != null
          ? { width: fixedWidth }
          : { width: "max-content", maxWidth: `min(${maxPanelWidth}px, 280px)` }),
        maxWidth: maxPanelWidth,
        boxSizing: "border-box",
        zIndex: 9999,
      };
    }
  }

  let left =
    align === "right"
      ? Math.max(VIEWPORT_PADDING, rect.right - panelW)
      : rect.left;

  if (left + panelW > vw - VIEWPORT_PADDING) {
    left = vw - VIEWPORT_PADDING - panelW;
  }
  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  return {
    position: "fixed",
    top,
    left,
    ...(fixedWidth != null
      ? { width: fixedWidth }
      : { width: "max-content", maxWidth: `min(${maxPanelWidth}px, 280px)` }),
    maxWidth: maxPanelWidth,
    boxSizing: "border-box",
    zIndex: 9999,
  };
}

export function FilterPopover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "left",
  width,
  scrollContainerRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  width?: number | "auto";
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}) {
  const contextScrollRef = useContext(FilterScrollContainerContext);
  const resolvedScrollRef = scrollContainerRef ?? contextScrollRef;

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const rafRef = useRef<number | null>(null);
  const openingRef = useRef(false);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    setMenuStyle(getMenuPosition(el, align, width, menuRef.current));
  }, [align, width]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updatePosition();
  }, [open, updatePosition]);

  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;
    updatePosition();
  }, [open, updatePosition, children]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updatePosition();
      });
    };
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.visualViewport?.addEventListener("resize", onScrollOrResize);
    window.visualViewport?.addEventListener("scroll", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.visualViewport?.removeEventListener("resize", onScrollOrResize);
      window.visualViewport?.removeEventListener("scroll", onScrollOrResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onOpenChange]);

  const handleToggle = async () => {
    if (openingRef.current) return;

    if (open) {
      onOpenChange(false);
      return;
    }

    const container = resolvedScrollRef?.current;
    const triggerEl = triggerRef.current;

    if (container && triggerEl && container.scrollWidth > container.clientWidth + 2) {
      openingRef.current = true;
      scrollElementToCenter(container, triggerEl);
      await waitForScrollEnd(container);
      openingRef.current = false;
    }

    if (triggerRef.current) {
      setMenuStyle(getMenuPosition(triggerRef.current, align, width));
    }
    onOpenChange(true);
  };

  return (
    <div ref={triggerRef} className="relative shrink-0">
      <div onMouseDown={(e) => e.preventDefault()} onClick={() => void handleToggle()}>
        {trigger}
      </div>
      {open &&
        menuStyle &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="bg-white border border-[#EEF3FB] rounded-2xl shadow-[0_8px_32px_rgba(23,46,77,0.14)] overflow-hidden box-border max-w-[calc(100vw-2rem)]"
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}
